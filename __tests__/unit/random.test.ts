import { describe, it, expect } from 'vitest';
import { randBytes, randInt, pickRandom, shuffle } from '@/lib/random';

describe('lib/random.ts - Random Generation Functions', () => {
  describe('randBytes', () => {
    it('should generate Uint8Array of specified size', () => {
      const bytes = randBytes(16);
      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBe(16);
    });
  });

  describe('randInt', () => {
    it('should return integer within range [0, max)', () => {
      for (let i = 0; i < 20; i++) {
        const val = randInt(10);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(10);
        expect(Number.isInteger(val)).toBe(true);
      }
    });
  });

  describe('pickRandom', () => {
    it('should pick an element from the given array', () => {
      const list = ['apple', 'banana', 'cherry'];
      const picked = pickRandom(list);
      expect(list).toContain(picked);
    });
  });

  describe('shuffle', () => {
    it('should return a new array with same elements', () => {
      const list = [1, 2, 3, 4, 5];
      const shuffled = shuffle(list);
      expect(shuffled).toHaveLength(list.length);
      expect(shuffled.sort()).toEqual(list.sort());
    });
  });
});
