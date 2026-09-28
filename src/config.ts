// Central place for tunables. Mirrors .env.example (see README: env vars are
// documented there; values are compiled in to keep setup native-config free).
export const API_BASE_URL = 'https://dogapi.dog/api/v2';
export const PAGE_SIZE = 48; // per the brief; the API allows up to 1000
export const STALE_AFTER_MS = 60 * 60 * 1000; // auto-sync on launch if older than 1h
export const RETRY_TRIES = 3;
export const RETRY_BASE_MS = 500;
