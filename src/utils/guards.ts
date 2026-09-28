import type { Range } from '../types';

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
export function asString(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v : null;
}
export function asNumber(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
export function asBoolean(v: unknown): boolean | null {
  return typeof v === 'boolean' ? v : null;
}
export function asStringArray(v: unknown): string[] {
  return Array.isArray(v)
    ? (v as unknown[]).filter((x): x is string => typeof x === 'string')
    : [];
}
export function asRange(v: unknown): Range | null {
  if (!isRecord(v)) return null;
  const min = asNumber(v.min);
  const max = asNumber(v.max);
  return min === null || max === null ? null : { min, max };
}
