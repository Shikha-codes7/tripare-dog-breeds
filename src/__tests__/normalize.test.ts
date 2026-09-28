import { computeSizeBand, normalizeCoatLength, parseBreed, parseBreedsPage, parseGroups } from '../normalize';
import { caucasianRaw, rawBreed } from '../testUtils/fixtures';

describe('parseBreed', () => {
  it('flattens a full API record and keeps image attribution', () => {
    const b = parseBreed(caucasianRaw);
    expect(b).not.toBeNull();
    expect(b?.name).toBe('Caucasian Shepherd Dog');
    expect(b?.groupId).toBe('g-working');
    expect(b?.coatLength).toBe('long');
    expect(b?.traits.exercise_minutes).toBe(60);
    expect(b?.temperament).toEqual(['fearless', 'self-confident']);
    expect(b?.images[0]?.attribution.author).toBe('Magdalena Niemiec');
    expect(b?.images[0]?.attribution.licenseUrl).toContain('creativecommons');
    expect(b?.sizeBand).toBe('giant');
  });

  it('tolerates missing optional data', () => {
    const b = parseBreed(rawBreed('x', 'Mystery'));
    expect(b?.images).toEqual([]);
    expect(b?.traits).toEqual({});
    expect(b?.sizeBand).toBeNull();
    expect(b?.groupId).toBeNull();
  });

  it('rejects unusable records', () => {
    expect(parseBreed(null)).toBeNull();
    expect(parseBreed({ id: 'x' })).toBeNull();
    expect(parseBreed(rawBreed('', 'No id'))).toBeNull();
  });
});

describe('size bands and coat', () => {
  const r = (min: number, max: number) => ({ min, max });
  it('derives bands from average weight', () => {
    const base = { maleHeight: null, femaleHeight: null };
    expect(computeSizeBand({ ...base, maleWeight: r(3, 5), femaleWeight: r(3, 5) })).toBe('small');
    expect(computeSizeBand({ ...base, maleWeight: r(15, 25), femaleWeight: r(15, 25) })).toBe('medium');
    expect(computeSizeBand({ ...base, maleWeight: r(30, 40), femaleWeight: r(25, 35) })).toBe('large');
    expect(computeSizeBand({ ...base, maleWeight: r(50, 70), femaleWeight: null })).toBe('giant');
  });
  it('falls back to height', () => {
    expect(computeSizeBand({ maleWeight: null, femaleWeight: null, maleHeight: r(20, 30), femaleHeight: null })).toBe('small');
  });
  it('maps wire coats from length or type', () => {
    expect(normalizeCoatLength('short', null)).toBe('short');
    expect(normalizeCoatLength('medium', 'wire')).toBe('wire');
    expect(normalizeCoatLength('weird', null)).toBeNull();
  });
});

describe('page and group parsing', () => {
  it('reads last page from meta and drops bad rows', () => {
    const page = parseBreedsPage({
      data: [rawBreed('a', 'A'), { nope: true }],
      meta: { pagination: { current: 1, next: 2, last: 6, records: 283 } },
    });
    expect(page.breeds).toHaveLength(1);
    expect(page.lastPage).toBe(6);
  });
  it('throws on a bad shape', () => {
    expect(() => parseBreedsPage({})).toThrow();
  });
  it('parses groups', () => {
    expect(parseGroups({ data: [{ id: 'g1', attributes: { name: 'Toy' } }, { id: 'g2' }] })).toEqual([{ id: 'g1', name: 'Toy' }]);
  });
});
