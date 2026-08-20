import { describe, it, expect } from 'vitest';
import { calculatePingStats, SAMPLE_HOPS } from '@/lib/ping';

describe('Ping & Diagnostics Engine (lib/ping)', () => {
  it('calculates min, max, avg ping latencies', () => {
    const latencies = [15, 20, 25, 10, 30];
    const stats = calculatePingStats(latencies);

    expect(stats.min).toBe(10);
    expect(stats.max).toBe(30);
    expect(stats.avg).toBe(20);
    expect(stats.count).toBe(5);
  });

  it('handles empty latencies array', () => {
    const stats = calculatePingStats([]);
    expect(stats.min).toBe(0);
    expect(stats.max).toBe(0);
    expect(stats.avg).toBe(0);
    expect(stats.count).toBe(0);
  });

  it('provides traceroute sample hops', () => {
    expect(SAMPLE_HOPS.length).toBeGreaterThan(3);
    expect(SAMPLE_HOPS[0].hop).toBe(1);
    expect(SAMPLE_HOPS[0].ip).toBeDefined();
  });
});
