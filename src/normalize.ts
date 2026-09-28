import {
  Breed,
  BreedImage,
  CoatLength,
  Group,
  NUMERIC_TRAITS,
  NumericTrait,
  Range,
  SizeBand,
} from './types';
import {
  asBoolean,
  asNumber,
  asRange,
  asString,
  asStringArray,
  isRecord,
} from './utils/guards';

const mid = (r: Range | null): number | null => (r ? (r.min + r.max) / 2 : null);
const avg = (values: (number | null)[]): number | null => {
  const v = values.filter((x): x is number => x !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

/** Size bands are derived from average weight (kg); height (cm) is the fallback. */
export function computeSizeBand(
  b: Pick<Breed, 'maleWeight' | 'femaleWeight' | 'maleHeight' | 'femaleHeight'>,
): SizeBand | null {
  const weight = avg([mid(b.maleWeight), mid(b.femaleWeight)]);
  if (weight !== null) {
    if (weight < 10) return 'small';
    if (weight < 25) return 'medium';
    if (weight < 45) return 'large';
    return 'giant';
  }
  const height = avg([mid(b.maleHeight), mid(b.femaleHeight)]);
  if (height !== null) {
    if (height < 35) return 'small';
    if (height < 50) return 'medium';
    if (height < 65) return 'large';
    return 'giant';
  }
  return null;
}

export function normalizeCoatLength(
  length: string | null,
  type: string | null,
): CoatLength | null {
  const l = length?.toLowerCase();
  const t = type?.toLowerCase();
  if (l === 'wire' || t === 'wire') return 'wire';
  if (l === 'short' || l === 'medium' || l === 'long') return l;
  return null;
}

function parseImage(v: unknown): BreedImage | null {
  if (!isRecord(v)) return null;
  const url = asString(v.url);
  const large = asString(v.large) ?? url;
  const medium = asString(v.medium) ?? large;
  const thumb = asString(v.thumb) ?? medium;
  if (!thumb || !medium || !large) return null;
  const a: Record<string, unknown> = isRecord(v.attribution) ? v.attribution : {};
  return {
    id: asString(v.id) ?? thumb,
    thumb,
    medium,
    large,
    attribution: {
      author: asString(a.author) ?? 'Unknown author',
      license: asString(a.license) ?? '',
      licenseUrl: asString(a.license_url),
      source: asString(a.source),
      sourceUrl: asString(a.source_url),
    },
  };
}

/** Turns one JSON:API breed resource into our flat Breed. Never throws; returns null if unusable. */
export function parseBreed(raw: unknown): Breed | null {
  if (!isRecord(raw)) return null;
  const id = asString(raw.id);
  const attrs = raw.attributes;
  if (!id || !isRecord(attrs)) return null;
  const name = asString(attrs.name);
  if (!name) return null;

  const rel: Record<string, unknown> = isRecord(raw.relationships) ? raw.relationships : {};
  const groupRel: Record<string, unknown> = isRecord(rel.group) ? rel.group : {};
  const groupData: Record<string, unknown> = isRecord(groupRel.data) ? groupRel.data : {};

  const origin: Record<string, unknown> = isRecord(attrs.origin) ? attrs.origin : {};
  const coat: Record<string, unknown> = isRecord(attrs.coat) ? attrs.coat : {};
  const t: Record<string, unknown> = isRecord(attrs.traits) ? attrs.traits : {};

  const traits: Partial<Record<NumericTrait, number>> = {};
  for (const key of NUMERIC_TRAITS) {
    const n = asNumber(t[key]);
    if (n !== null) traits[key] = n;
  }

  const sources = Array.isArray(attrs.sources)
    ? (attrs.sources as unknown[]).flatMap((s) => {
        if (!isRecord(s)) return [];
        const url = asString(s.url);
        return url ? [{ url, title: asString(s.title) ?? url }] : [];
      })
    : [];

  const images = Array.isArray(attrs.images)
    ? (attrs.images as unknown[])
        .map(parseImage)
        .filter((i): i is BreedImage => i !== null)
    : [];

  const maleWeight = asRange(attrs.male_weight);
  const femaleWeight = asRange(attrs.female_weight);
  const maleHeight = asRange(attrs.male_height);
  const femaleHeight = asRange(attrs.female_height);
  const coatType = asString(coat.type);

  return {
    id,
    name,
    description: asString(attrs.description) ?? '',
    groupId: asString(groupData.id),
    hypoallergenic: asBoolean(attrs.hypoallergenic),
    life: asRange(attrs.life),
    maleWeight,
    femaleWeight,
    maleHeight,
    femaleHeight,
    origin: {
      country: asString(origin.country),
      region: asString(origin.region),
      era: asString(origin.era),
    },
    coatLength: normalizeCoatLength(asString(coat.length), coatType),
    coatType,
    coatColors: asStringArray(coat.colors),
    traits,
    temperament: asStringArray(t.temperament),
    otherNames: asStringArray(attrs.other_names),
    recognizedBy: asStringArray(attrs.recognized_by),
    sources,
    images,
    sizeBand: computeSizeBand({ maleWeight, femaleWeight, maleHeight, femaleHeight }),
  };
}

export type BreedsPage = { breeds: Breed[]; lastPage: number };

export function parseBreedsPage(raw: unknown): BreedsPage {
  if (!isRecord(raw) || !Array.isArray(raw.data)) {
    throw new Error('Unexpected breeds response shape');
  }
  const breeds = (raw.data as unknown[])
    .map(parseBreed)
    .filter((b): b is Breed => b !== null);
  const meta: Record<string, unknown> = isRecord(raw.meta) ? raw.meta : {};
  const pagination: Record<string, unknown> = isRecord(meta.pagination) ? meta.pagination : {};
  const lastPage = asNumber(pagination.last) ?? asNumber(pagination.current) ?? 1;
  return { breeds, lastPage };
}

export function parseSingleBreed(raw: unknown): Breed {
  const breed = isRecord(raw) ? parseBreed(raw.data) : null;
  if (!breed) throw new Error('Unexpected breed response shape');
  return breed;
}

export function parseGroups(raw: unknown): Group[] {
  if (!isRecord(raw) || !Array.isArray(raw.data)) {
    throw new Error('Unexpected groups response shape');
  }
  return (raw.data as unknown[]).flatMap((g) => {
    if (!isRecord(g)) return [];
    const id = asString(g.id);
    const attrs: Record<string, unknown> = isRecord(g.attributes) ? g.attributes : {};
    const name = asString(attrs.name);
    return id && name ? [{ id, name }] : [];
  });
}
