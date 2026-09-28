import { useEffect, useState } from 'react';

/** Re-renders every `intervalMs` so "Last synced 5 minutes ago" stays fresh. */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
