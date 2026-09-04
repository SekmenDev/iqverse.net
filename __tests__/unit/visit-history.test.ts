import { describe, it, expect, beforeEach } from 'vitest';
import {
  PREVIOUS_ID_LIMIT,
  VISIT_STORAGE_KEY,
  clearVisitRecord,
  describeVisitRecord,
  formatElapsed,
  loadVisitRecord,
  parseVisitRecord,
  saveVisitRecord,
  updateVisitRecord,
  type VisitRecord,
} from '@/lib/visit-history';

const NOW = new Date('2026-09-04T12:00:00.000Z');

function record(overrides: Partial<VisitRecord> = {}): VisitRecord {
  return {
    fingerprintId: 'aaaa1111',
    firstSeen: '2026-09-01T12:00:00.000Z',
    lastSeen: '2026-09-03T12:00:00.000Z',
    visits: 4,
    previousIds: [],
    ...overrides,
  };
}

describe('Visit record parsing (lib/visit-history)', () => {
  it('round trips a valid record', () => {
    expect(parseVisitRecord(JSON.stringify(record()))).toEqual(record());
  });

  it('rejects malformed or absent input instead of throwing', () => {
    expect(parseVisitRecord(null)).toBeNull();
    expect(parseVisitRecord('not json')).toBeNull();
    expect(parseVisitRecord('"a string"')).toBeNull();
    expect(parseVisitRecord(JSON.stringify({ visits: 3 }))).toBeNull();
    expect(parseVisitRecord(JSON.stringify({ ...record(), visits: 'four' }))).toBeNull();
  });

  it('repairs a non-array previousIds and a fractional visit count', () => {
    const parsed = parseVisitRecord(
      JSON.stringify({ ...record(), visits: 2.7, previousIds: 'nope' })
    );
    expect(parsed?.visits).toBe(2);
    expect(parsed?.previousIds).toEqual([]);
  });

  it('drops non-string entries from previousIds', () => {
    const parsed = parseVisitRecord(
      JSON.stringify({ ...record(), previousIds: ['bbbb2222', 7, null] })
    );
    expect(parsed?.previousIds).toEqual(['bbbb2222']);
  });
});

describe('Visit record updates (lib/visit-history)', () => {
  it('creates a first visit', () => {
    const created = updateVisitRecord(null, 'aaaa1111', NOW);
    expect(created.visits).toBe(1);
    expect(created.firstSeen).toBe(NOW.toISOString());
    expect(created.lastSeen).toBe(NOW.toISOString());
    expect(created.previousIds).toEqual([]);
  });

  it('increments an unchanged fingerprint and keeps the first seen date', () => {
    const updated = updateVisitRecord(record(), 'aaaa1111', NOW);
    expect(updated.visits).toBe(5);
    expect(updated.firstSeen).toBe('2026-09-01T12:00:00.000Z');
    expect(updated.lastSeen).toBe(NOW.toISOString());
    expect(updated.previousIds).toEqual([]);
  });

  it('remembers the superseded ID when the fingerprint changes', () => {
    const updated = updateVisitRecord(record(), 'bbbb2222', NOW);
    expect(updated.fingerprintId).toBe('bbbb2222');
    expect(updated.previousIds).toEqual(['aaaa1111']);
    expect(updated.visits).toBe(5);
  });

  it('caps the superseded ID history', () => {
    let current = record();
    for (let index = 0; index < PREVIOUS_ID_LIMIT + 3; index += 1) {
      current = updateVisitRecord(current, `id-${index}`, NOW);
    }
    expect(current.previousIds).toHaveLength(PREVIOUS_ID_LIMIT);
    expect(current.previousIds[0]).toBe(`id-${PREVIOUS_ID_LIMIT + 1}`);
  });
});

describe('Visit record wording (lib/visit-history)', () => {
  it('formats elapsed time across the unit boundaries', () => {
    expect(formatElapsed('2026-09-04T11:59:30.000Z', NOW)).toBe('moments ago');
    expect(formatElapsed('2026-09-04T11:30:00.000Z', NOW)).toBe('30 minutes ago');
    expect(formatElapsed('2026-09-04T09:00:00.000Z', NOW)).toBe('3 hours ago');
    expect(formatElapsed('2026-09-01T12:00:00.000Z', NOW)).toBe('3 days ago');
    expect(formatElapsed('2026-06-04T12:00:00.000Z', NOW)).toBe('3 months ago');
    expect(formatElapsed('2024-09-04T12:00:00.000Z', NOW)).toBe('2 years ago');
  });

  it('survives an unparsable date', () => {
    expect(formatElapsed('not-a-date', NOW)).toBe('an unknown time ago');
  });

  it('explains a first visit', () => {
    expect(describeVisitRecord(record({ visits: 1 }), NOW)).toContain('First time here');
  });

  it('reports an unchanged fingerprint across visits', () => {
    const described = describeVisitRecord(record(), NOW);
    expect(described).toContain('4 times');
    expect(described).toContain('3 days ago');
    expect(described).toContain('has not changed');
  });

  it('reports how often the fingerprint changed', () => {
    const described = describeVisitRecord(record({ previousIds: ['bbbb2222'] }), NOW);
    expect(described).toContain('changed 1 time');
  });
});

describe('Visit record storage (lib/visit-history)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves, loads and clears through localStorage', () => {
    expect(loadVisitRecord()).toBeNull();

    saveVisitRecord(record());
    expect(localStorage.getItem(VISIT_STORAGE_KEY)).toBeTruthy();
    expect(loadVisitRecord()).toEqual(record());

    clearVisitRecord();
    expect(loadVisitRecord()).toBeNull();
  });

  it('returns null rather than throwing on corrupted storage', () => {
    localStorage.setItem(VISIT_STORAGE_KEY, '{broken');
    expect(loadVisitRecord()).toBeNull();
  });
});
