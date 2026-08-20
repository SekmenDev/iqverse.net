import { describe, it, expect } from 'vitest';
import { parseEpochTimestamp, convertDateToEpoch, getRelativeTimeString } from '@/lib/timestamp';

describe('Timestamp Engine (lib/timestamp)', () => {
  it('parses seconds timestamp', () => {
    // 1700000000 = Wed Nov 15 2023 02:40:00 UTC
    const parsed = parseEpochTimestamp(1700000000);
    expect(parsed).not.toBeNull();
    expect(parsed?.iso).toBe('2023-11-14T22:13:20.000Z');
    expect(parsed?.utc).toContain('2023');
    expect(parsed?.epochSeconds).toBe(1700000000);
  });

  it('converts date string to epoch timestamps', () => {
    const epoch = convertDateToEpoch('2026-08-20T12:00:00Z');
    expect(epoch).not.toBeNull();
    expect(epoch?.seconds).toBe(1787227200);
    expect(epoch?.milliseconds).toBe(1787227200000);
  });

  it('calculates human-readable relative time strings', () => {
    const nowSec = 1700000000;
    const pastDate = new Date((nowSec - 120) * 1000);
    expect(getRelativeTimeString(pastDate, nowSec)).toBe('2 minutes ago');

    const futureDate = new Date((nowSec + 7200) * 1000);
    expect(getRelativeTimeString(futureDate, nowSec)).toBe('2 hours from now');
  });
});
