import { API_BASE_URL, PAGE_SIZE, RETRY_BASE_MS, RETRY_TRIES } from './config';
import { parseBreedsPage, parseGroups, parseSingleBreed } from './normalize';
import type { Breed, Group } from './types';

export class HttpError extends Error {
  status: number;
  constructor(status: number, url: string) {
    super(`HTTP ${status} for ${url}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

export type RetryOptions = {
  tries?: number;
  baseMs?: number;
  sleep?: (ms: number) => Promise<void>;
};

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Network errors, 429 and 5xx are worth retrying; other 4xx are not.
function isRetryable(e: unknown): boolean {
  return e instanceof HttpError ? e.status === 429 || e.status >= 500 : true;
}

/** Exponential backoff: baseMs, 2*baseMs, 4*baseMs ... */
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const tries = opts.tries ?? RETRY_TRIES;
  const baseMs = opts.baseMs ?? RETRY_BASE_MS;
  const sleep = opts.sleep ?? defaultSleep;
  let lastError: unknown;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (!isRetryable(e) || attempt === tries - 1) throw e;
      await sleep(baseMs * 2 ** attempt);
    }
  }
  throw lastError;
}

async function getJson(url: string, fetchFn: typeof fetch, opts?: RetryOptions): Promise<unknown> {
  return withRetry(async () => {
    const res = await fetchFn(url);
    if (!res.ok) throw new HttpError(res.status, url);
    return (await res.json()) as unknown;
  }, opts);
}

const breedsPageUrl = (page: number) =>
  `${API_BASE_URL}/breeds?page%5Bnumber%5D=${page}&page%5Bsize%5D=${PAGE_SIZE}`;

export type BreedsFetchResult = {
  breeds: Breed[];
  totalPages: number;
  failedPages: number[]; // pages that still failed after retries
};

/**
 * Fetches page 1 (its meta tells us how many pages exist - we never hard-code
 * "6"), then the remaining pages in parallel, and merges them by id.
 * Page 1 failing throws; later pages failing is reported in `failedPages`
 * so the caller can keep cached data and show a banner.
 */
export async function fetchAllBreeds(
  fetchFn: typeof fetch = fetch,
  opts?: RetryOptions,
): Promise<BreedsFetchResult> {
  const first = parseBreedsPage(await getJson(breedsPageUrl(1), fetchFn, opts));
  const pageNumbers = Array.from({ length: Math.max(0, first.lastPage - 1) }, (_, i) => i + 2);

  const settled = await Promise.allSettled(
    pageNumbers.map(async (p) => parseBreedsPage(await getJson(breedsPageUrl(p), fetchFn, opts))),
  );

  const byId = new Map<string, Breed>();
  first.breeds.forEach((b) => byId.set(b.id, b));
  const failedPages: number[] = [];
  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') result.value.breeds.forEach((b) => byId.set(b.id, b));
    else failedPages.push(pageNumbers[i] as number);
  });

  return { breeds: [...byId.values()], totalPages: first.lastPage, failedPages };
}

export async function fetchGroups(
  fetchFn: typeof fetch = fetch,
  opts?: RetryOptions,
): Promise<Group[]> {
  return parseGroups(await getJson(`${API_BASE_URL}/groups?page%5Bsize%5D=100`, fetchFn, opts));
}

export async function fetchBreed(
  id: string,
  fetchFn: typeof fetch = fetch,
  opts?: RetryOptions,
): Promise<Breed> {
  return parseSingleBreed(
    await getJson(`${API_BASE_URL}/breeds/${encodeURIComponent(id)}`, fetchFn, opts),
  );
}
