# Technical decisions

## State management: Zustand
Small API, no provider/boilerplate, selectors avoid re-rendering the whole tree, and it's easy to call from outside React (the NetInfo listener uses `useStore.getState()`). Redux Toolkit would be fine but is more ceremony than this app needs. Breeds and groups are stored **normalized** (`Record<id, Entity>` + a sorted `breedIds` list), so a single-breed refresh updates one entry and the list only re-derives what changed.

## Persistence: AsyncStorage (one key per breed)
The data is a small, read-mostly document set (a few hundred records), and all querying (search/filters) is done in memory over an already-loaded list, so SQLite's query power isn't needed and AsyncStorage keeps setup simple. One key per breed (plus a `meta` key with ids, groups and `lastSyncedAt`) instead of one big JSON blob because Android's AsyncStorage can't reliably read a single value over ~2MB, and it allows updating one record cheaply. If the dataset grew or needed server-style queries, I'd move to SQLite (or WatermelonDB).

### Schema
- `tripare:meta:v1` -> `{ breedIds: string[], groups: {id,name}[], lastSyncedAt: number | null }`
- `tripare:breed:v1:<id>` -> a flattened `Breed` (see `types.ts`), including derived `sizeBand`
- The `v1` in keys is the migration hook: a schema change bumps it and old data is ignored.

## API layer: small custom module (no React Query)
The job is "fetch all pages, merge, persist", which doesn't map well to per-query caching; the store is already the cache. A ~40 line `withRetry` (exponential backoff, no retry on 4xx except 429) is easier to read and test than configuring a library. Pages: page 1 first (to learn the page count from `meta.pagination.last`), then the rest in parallel with `Promise.allSettled`, so one bad page doesn't lose the others.

## Don't hard-code the dataset size
The brief says 283 breeds / 6 pages / 9 groups. The current live API docs describe 340 breeds and about 20 groups, and allow page sizes up to 1000. The app reads the page count from `meta.pagination` and group names from `/groups`, so it works with either numbers. Page size stays at 48 per the brief.

## Offline sync strategy
Cache-first: render from storage instantly, then sync in the background if stale (> 1 hour). Manual pull-to-refresh, and automatic sync when NetInfo reports the network is back. A **complete** sync replaces the cache (so removed breeds disappear); a **partial** sync only upserts and does not move "last synced", so the banner never claims freshness it doesn't have.

## Navigation: React Navigation (native stack), typed
`RootStackParamList` types every `navigate` call and `route.params`.

## Images: variants and caching
Each image has `thumb` (200x200 square), `medium` (600px) and `large` (1200px).
- **List** loads only `thumb` (tiny, square, exactly the row size).
- **Detail overview** uses `medium`.
- **Gallery** uses `large` (only when the user opens that tab).
We never download the original `url`. Caching is by `@d11/react-native-fast-image` (SDWebImage on iOS, Glide on Android), which store to disk. Note: their disk-cache size limits are the native libraries' own defaults; this app does not add a custom cap on top. See "Known gaps".

## Performance trade-off: rich rows, not many rows
283-340 rows is a small list. What's unusual is that each record is heavy: nested traits, coat, origin and up to 9 images. The list work is therefore about **payload richness per row**, not row count:
- Rows render only 4 fields (thumb, name, size/coat/temperament line), so the view tree is tiny even though the data is big.
- Fixed row height (`ROW_HEIGHT`), `React.memo` rows, a stable `onPress` (`useCallback`), and `keyExtractor` by id.
- Virtualization tuned (`initialNumToRender`, `windowSize=7`, `removeClippedSubviews`).
- Heavy detail (traits, gallery, attribution) renders only on the detail screen.
- The cost we accept: the whole rich dataset sits in memory (a few MB of JSON) so search/filter are instant and offline, instead of paging from disk per row. Filtering runs over the in-memory array; search is debounced by 250ms.

## Error handling
`ErrorBoundary` around the app and each screen; async failures never throw into render, they become `error` state shown in the banner.

## TypeScript
Strict mode (from `@react-native/typescript-config`). No `any`: API JSON is `unknown` and passes through `guards.ts` -> `normalize.ts`. Bad records are dropped, missing optional fields become `null`/`[]`.

## Known gaps / what I'd do next
- No custom image disk-cache cap (native defaults apply); would add an explicit limit + "clear cache" action.
- The default sync request has no timeout (`AbortController`).
- No Detox/Maestro E2E test yet.
- Filter option lists for coat/size are fixed sets; group options come from the API.
