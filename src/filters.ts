import type { Breed, CoatLength, GoodWithTrait, Group, SizeBand } from './types';

/** Trait scores run 1-5; a breed passes a "good with ..." filter at this score or higher. */
export const TRAIT_THRESHOLD = 4;

export type Filters = {
  groupIds: string[];
  sizes: SizeBand[];
  coats: CoatLength[];
  hypoallergenic: boolean | null; // null = any
  goodWith: GoodWithTrait[]; // every selected trait must be >= TRAIT_THRESHOLD
};

export const EMPTY_FILTERS: Filters = {
  groupIds: [],
  sizes: [],
  coats: [],
  hypoallergenic: null,
  goodWith: [],
};

export function activeFilterCount(f: Filters): number {
  return (
    f.groupIds.length +
    f.sizes.length +
    f.coats.length +
    (f.hypoallergenic === null ? 0 : 1) +
    f.goodWith.length
  );
}

export function toggle<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

/** Within one filter = OR (any selected group); across filters = AND. */
export function applyFilters(breeds: Breed[], query: string, f: Filters): Breed[] {
  const q = query.trim().toLowerCase();
  return breeds.filter((b) => {
    if (q) {
      const hit =
        b.name.toLowerCase().includes(q) || b.otherNames.some((n) => n.toLowerCase().includes(q));
      if (!hit) return false;
    }
    if (f.groupIds.length && (!b.groupId || !f.groupIds.includes(b.groupId))) return false;
    if (f.sizes.length && (!b.sizeBand || !f.sizes.includes(b.sizeBand))) return false;
    if (f.coats.length && (!b.coatLength || !f.coats.includes(b.coatLength))) return false;
    if (f.hypoallergenic !== null && b.hypoallergenic !== f.hypoallergenic) return false;
    for (const trait of f.goodWith) {
      const score = b.traits[trait];
      if (score === undefined || score < TRAIT_THRESHOLD) return false;
    }
    return true;
  });
}

export type BreedSection = { title: string; data: Breed[] };

/** Groups breeds by breed group (A-Z), breeds A-Z inside each group. */
export function buildSections(breeds: Breed[], groups: Record<string, Group>): BreedSection[] {
  const buckets = new Map<string, Breed[]>();
  for (const b of breeds) {
    const title = (b.groupId && groups[b.groupId]?.name) || 'Other';
    const list = buckets.get(title);
    if (list) list.push(b);
    else buckets.set(title, [b]);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)))
    .map(([title, data]) => ({ title, data: data.sort((x, y) => x.name.localeCompare(y.name)) }));
}
