import { formatAgo } from '../utils/time';

describe('formatAgo', () => {
  const now = 1_000_000_000_000;
  it('formats relative times', () => {
    expect(formatAgo(null, now)).toBe('never');
    expect(formatAgo(now - 5_000, now)).toBe('just now');
    expect(formatAgo(now - 60_000, now)).toBe('1 minute ago');
    expect(formatAgo(now - 2 * 3_600_000, now)).toBe('2 hours ago');
    expect(formatAgo(now - 3 * 86_400_000, now)).toBe('3 days ago');
  });
});
