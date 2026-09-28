import { create } from 'zustand';
import { fetchAllBreeds, fetchBreed, fetchGroups } from './api';
import { STALE_AFTER_MS } from './config';
import { EMPTY_FILTERS, Filters } from './filters';
import { loadCache, saveBreed, saveCache } from './storage';
import type { Breed, Group } from './types';

// Normalized cache: entities live in id-keyed maps, lists hold ids only.
type State = {
  hydrated: boolean;
  breeds: Record<string, Breed>;
  breedIds: string[]; // sorted by name
  groups: Record<string, Group>;
  lastSyncedAt: number | null;
  syncing: boolean;
  error: string | null; // last sync problem; cached data stays visible
  isOffline: boolean;
  filters: Filters;

  init: () => Promise<void>;
  sync: () => Promise<void>;
  refreshBreed: (id: string) => Promise<void>;
  setOffline: (offline: boolean) => void;
  setFilters: (patch: Partial<Filters>) => void;
  clearFilters: () => void;
};

const toMap = <T extends { id: string }>(items: T[]): Record<string, T> =>
  Object.fromEntries(items.map((i) => [i.id, i]));

const sortedIds = (breeds: Record<string, Breed>): string[] =>
  Object.values(breeds)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((b) => b.id);

export const useStore = create<State>()((set, get) => ({
  hydrated: false,
  breeds: {},
  breedIds: [],
  groups: {},
  lastSyncedAt: null,
  syncing: false,
  error: null,
  isOffline: false,
  filters: EMPTY_FILTERS,

  // 1) show cached data immediately, 2) sync in background if stale.
  init: async () => {
    try {
      const cached = await loadCache();
      if (cached) {
        const breeds = toMap(cached.breeds);
        set({
          breeds,
          breedIds: sortedIds(breeds),
          groups: toMap(cached.groups),
          lastSyncedAt: cached.lastSyncedAt,
        });
      }
    } catch {
      // unreadable cache: behave like a first launch
    }
    set({ hydrated: true });
    const { lastSyncedAt, isOffline } = get();
    const stale = lastSyncedAt === null || Date.now() - lastSyncedAt > STALE_AFTER_MS;
    if (stale && !isOffline) await get().sync();
  },

  sync: async () => {
    if (get().syncing) return;
    set({ syncing: true, error: null });
    try {
      const [breedsResult, groupsResult] = await Promise.allSettled([fetchAllBreeds(), fetchGroups()]);
      if (breedsResult.status === 'rejected') throw breedsResult.reason;

      const { breeds: fetched, failedPages, totalPages } = breedsResult.value;
      const previous = get().breeds;
      const complete = failedPages.length === 0;

      // Complete sync replaces the cache (drops removed breeds). A partial
      // sync only upserts, so a failed page never erases data we already have.
      const next = complete ? toMap(fetched) : { ...previous, ...toMap(fetched) };
      const groups = groupsResult.status === 'fulfilled' ? toMap(groupsResult.value) : get().groups;
      const lastSyncedAt = complete ? Date.now() : get().lastSyncedAt;

      const removedIds = Object.keys(previous).filter((id) => !(id in next));
      set({ breeds: next, breedIds: sortedIds(next), groups, lastSyncedAt });
      await saveCache({ breeds: Object.values(next), groups: Object.values(groups), lastSyncedAt }, removedIds);

      if (!complete) {
        set({ error: `${failedPages.length} of ${totalPages} pages failed to load. Showing saved data.` });
      } else if (groupsResult.status === 'rejected') {
        set({ error: 'Could not refresh breed groups. Showing saved data.' });
      }
    } catch (e) {
      set({ error: e instanceof Error ? `Sync failed: ${e.message}` : 'Sync failed' });
    } finally {
      set({ syncing: false });
    }
  },

  // Detail screen: refresh one breed from GET /breeds/:id (best effort).
  refreshBreed: async (id) => {
    if (get().isOffline) return;
    try {
      const fresh = await fetchBreed(id);
      set((s) => ({ breeds: { ...s.breeds, [id]: fresh } }));
      await saveBreed(fresh);
    } catch {
      // keep showing the cached copy
    }
  },

  setOffline: (isOffline) => set({ isOffline }),
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  clearFilters: () => set({ filters: EMPTY_FILTERS }),
}));
