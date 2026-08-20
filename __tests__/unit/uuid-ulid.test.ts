import { describe, it, expect } from 'vitest';
import { generateIdBatch, decodeUlidTimestamp, generateUuidV4, generateUlid } from '@/lib/uuid-ulid';

describe('UUID / ULID Engine (lib/uuid-ulid)', () => {
  it('generates valid UUID v4', () => {
    const id = generateUuidV4();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('generates valid ULID with 26 Crockford base32 characters', () => {
    const id = generateUlid();
    expect(id).toHaveLength(26);
    expect(id).toMatch(/^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/);
  });

  it('generates batch identifiers with uppercase / lowercase and hyphens option', () => {
    const batch = generateIdBatch({ type: 'uuid', count: 5, uppercase: true, removeHyphens: true });
    expect(batch).toHaveLength(5);
    batch.forEach((id) => {
      expect(id).not.toContain('-');
      expect(id).toBe(id.toUpperCase());
    });
  });

  it('decodes ULID timestamp accurately', () => {
    const now = Date.now();
    const ulid = generateUlid(now);
    const decoded = decodeUlidTimestamp(ulid);
    expect(decoded).not.toBeNull();
    expect(decoded).toContain('T');
    const parsedTime = new Date(decoded!).getTime();
    expect(Math.abs(parsedTime - now)).toBeLessThan(100);
  });
});
