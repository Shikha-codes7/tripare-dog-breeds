import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Breed, Group } from './types';
import { asNumber, asString, isRecord } from './utils/guards';

// One key per breed (not one giant blob): Android's AsyncStorage cannot read a
// single value larger than ~2MB, and per-breed keys let us update one record.
const META_KEY = 'tripare:meta:v1';
const BREED_PREFIX = 'tripare:breed:v1:';
const CHUNK = 50;

export type CacheSnapshot = {
  breeds: Breed[];
  groups: Group[];
  lastSyncedAt: number | null;
};

const breedKey = (id: string) => BREED_PREFIX + id;

function isStoredBreed(v: unknown): v is Breed {
  return isRecord(v) && asString(v.id) !== null && asString(v.name) !== null && Array.isArray(v.images);
}

export async function loadCache(): Promise<CacheSnapshot | null> {
  const metaRaw = await AsyncStorage.getItem(META_KEY);
  if (!metaRaw) return null;
  const meta: unknown = JSON.parse(metaRaw);
  if (!isRecord(meta) || !Array.isArray(meta.breedIds)) return null;

  const ids = (meta.breedIds as unknown[]).filter((x): x is string => typeof x === 'string');
  const breeds: Breed[] = [];
  for (let i = 0; i < ids.length; i += CHUNK) {
    const pairs = await AsyncStorage.multiGet(ids.slice(i, i + CHUNK).map(breedKey));
    for (const [, value] of pairs) {
      if (!value) continue;
      try {
        const parsed: unknown = JSON.parse(value);
        if (isStoredBreed(parsed)) breeds.push(parsed);
      } catch {
        // skip a corrupt record; the next sync will restore it
      }
    }
  }

  const groups = Array.isArray(meta.groups)
    ? (meta.groups as unknown[]).flatMap((g) => {
        if (!isRecord(g)) return [];
        const id = asString(g.id);
        const name = asString(g.name);
        return id && name ? [{ id, name }] : [];
      })
    : [];

  return { breeds, groups, lastSyncedAt: asNumber(meta.lastSyncedAt) };
}

export async function saveCache(snapshot: CacheSnapshot, removedIds: string[] = []): Promise<void> {
  const entries: [string, string][] = snapshot.breeds.map((b) => [breedKey(b.id), JSON.stringify(b)]);
  for (let i = 0; i < entries.length; i += CHUNK) {
    await AsyncStorage.multiSet(entries.slice(i, i + CHUNK));
  }
  if (removedIds.length) await AsyncStorage.multiRemove(removedIds.map(breedKey));
  await AsyncStorage.setItem(
    META_KEY,
    JSON.stringify({
      breedIds: snapshot.breeds.map((b) => b.id),
      groups: snapshot.groups,
      lastSyncedAt: snapshot.lastSyncedAt,
    }),
  );
}

export async function saveBreed(breed: Breed): Promise<void> {
  await AsyncStorage.setItem(breedKey(breed.id), JSON.stringify(breed));
}
