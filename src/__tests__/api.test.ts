import { HttpError, fetchAllBreeds, withRetry } from '../api';
import { rawBreed } from '../testUtils/fixtures';

const noSleep = () => Promise.resolve();

function res(body: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as unknown as Response;
}

describe('withRetry', () => {
  it('retries with exponential backoff then succeeds', async () => {
    const delays: number[] = [];
    let calls = 0;
    const out = await withRetry(
      async () => {
        calls++;
        if (calls < 3) throw new Error('network');
        return 'ok';
      },
      { tries: 3, baseMs: 100, sleep: async (ms) => void delays.push(ms) },
    );
    expect(out).toBe('ok');
    expect(delays).toEqual([100, 200]);
  });

  it('does not retry a 404', async () => {
    let calls = 0;
    await expect(
      withRetry(async () => {
        calls++;
        throw new HttpError(404, 'u');
      }, { sleep: noSleep }),
    ).rejects.toBeInstanceOf(HttpError);
    expect(calls).toBe(1);
  });
});

describe('fetchAllBreeds', () => {
  const page = (n: number, last: number, ids: string[]) => ({
    data: ids.map((id) => rawBreed(id, `Breed ${id}`)),
    meta: { pagination: { current: n, last, records: 5 } },
  });

  it('reads page count from meta and merges/dedupes all pages', async () => {
    const fetchFn = (async (url: string) => {
      if (url.includes('number%5D=1')) return res(page(1, 3, ['a', 'b']));
      if (url.includes('number%5D=2')) return res(page(2, 3, ['c', 'b'])); // b duplicated
      return res(page(3, 3, ['d']));
    }) as unknown as typeof fetch;
    const result = await fetchAllBreeds(fetchFn, { sleep: noSleep });
    expect(result.totalPages).toBe(3);
    expect(result.failedPages).toEqual([]);
    expect(result.breeds.map((b) => b.id).sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('reports failed pages but keeps the ones that worked', async () => {
    const fetchFn = (async (url: string) => {
      if (url.includes('number%5D=1')) return res(page(1, 3, ['a']));
      if (url.includes('number%5D=2')) return res({}, 500);
      return res(page(3, 3, ['d']));
    }) as unknown as typeof fetch;
    const result = await fetchAllBreeds(fetchFn, { tries: 2, sleep: noSleep });
    expect(result.failedPages).toEqual([2]);
    expect(result.breeds.map((b) => b.id).sort()).toEqual(['a', 'd']);
  });

  it('throws if page 1 fails', async () => {
    const fetchFn = (async () => res({}, 503)) as unknown as typeof fetch;
    await expect(fetchAllBreeds(fetchFn, { tries: 1, sleep: noSleep })).rejects.toThrow();
  });
});
