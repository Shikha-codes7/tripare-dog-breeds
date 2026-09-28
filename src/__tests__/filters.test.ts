import { EMPTY_FILTERS, activeFilterCount, applyFilters, buildSections, toggle } from '../filters';
import { parseBreed } from '../normalize';
import type { Breed } from '../types';
import { rawBreed } from '../testUtils/fixtures';

function make(id: string, name: string, extra: Record<string, unknown>, groupId: string | null = null): Breed {
  const raw = rawBreed(id, name, extra) as { relationships?: unknown };
  if (groupId) raw.relationships = { group: { data: { id: groupId } } };
  const b = parseBreed(raw);
  if (!b) throw new Error('bad fixture');
  return b;
}

const pug = make('1', 'Pug', {
  other_names: ['Mops'], hypoallergenic: false,
  male_weight: { min: 6, max: 8 }, female_weight: { min: 6, max: 8 },
  coat: { length: 'short' }, traits: { good_with_children: 5, good_with_dogs: 4 },
}, 'toy');
const poodle = make('2', 'Standard Poodle', {
  hypoallergenic: true, male_weight: { min: 20, max: 32 }, female_weight: { min: 20, max: 32 },
  coat: { length: 'long' }, traits: { good_with_children: 3 },
}, 'non-sporting');
const wolfhound = make('3', 'Irish Wolfhound', {
  male_weight: { min: 54, max: 69 }, female_weight: { min: 40, max: 54 },
  coat: { type: 'wire', length: 'medium' }, traits: { good_with_children: 4, good_with_dogs: 4 },
}, 'hound');
const all = [pug, poodle, wolfhound];

describe('applyFilters', () => {
  it('returns everything with no filters', () => {
    expect(applyFilters(all, '', EMPTY_FILTERS)).toHaveLength(3);
  });
  it('searches by name and other_names, case-insensitively', () => {
    expect(applyFilters(all, 'poo', EMPTY_FILTERS).map((b) => b.id)).toEqual(['2']);
    expect(applyFilters(all, 'MOPS', EMPTY_FILTERS).map((b) => b.id)).toEqual(['1']);
  });
  it('ORs inside a filter, ANDs across filters', () => {
    expect(applyFilters(all, '', { ...EMPTY_FILTERS, groupIds: ['toy', 'hound'] })).toHaveLength(2);
    expect(applyFilters(all, '', { ...EMPTY_FILTERS, groupIds: ['toy', 'hound'], sizes: ['small'] }).map((b) => b.id)).toEqual(['1']);
  });
  it('filters by size, coat (incl. wire) and hypoallergenic', () => {
    expect(applyFilters(all, '', { ...EMPTY_FILTERS, sizes: ['giant'] }).map((b) => b.id)).toEqual(['3']);
    expect(applyFilters(all, '', { ...EMPTY_FILTERS, coats: ['wire'] }).map((b) => b.id)).toEqual(['3']);
    expect(applyFilters(all, '', { ...EMPTY_FILTERS, hypoallergenic: true }).map((b) => b.id)).toEqual(['2']);
    expect(applyFilters(all, '', { ...EMPTY_FILTERS, hypoallergenic: false }).map((b) => b.id)).toEqual(['1']);
  });
  it('applies the trait threshold (>= 4) and requires all selected traits', () => {
    expect(applyFilters(all, '', { ...EMPTY_FILTERS, goodWith: ['good_with_children'] }).map((b) => b.id)).toEqual(['1', '3']);
    expect(applyFilters(all, '', { ...EMPTY_FILTERS, goodWith: ['good_with_children', 'good_with_dogs'] })).toHaveLength(2);
    expect(applyFilters(all, '', { ...EMPTY_FILTERS, goodWith: ['good_with_strangers'] })).toHaveLength(0);
  });
});

describe('helpers', () => {
  it('counts active filters and toggles values', () => {
    expect(activeFilterCount({ ...EMPTY_FILTERS, sizes: ['small', 'large'], hypoallergenic: true })).toBe(3);
    expect(toggle(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggle(['a', 'b'], 'a')).toEqual(['b']);
  });
  it('groups into sorted sections with an Other bucket last', () => {
    const groups = { toy: { id: 'toy', name: 'Toy' }, hound: { id: 'hound', name: 'Hound' } };
    const sections = buildSections([pug, wolfhound, poodle], groups);
    expect(sections.map((s) => s.title)).toEqual(['Hound', 'Toy', 'Other']);
    expect(sections[2]?.data[0]?.name).toBe('Standard Poodle');
  });
});
