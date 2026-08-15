import { describe, it, expect } from 'vitest';
import { b64Encode, b64Decode, hexEncode, hexDecode } from '@/lib/encoding';

describe('lib/encoding.ts - Encoding & Decoding Functions', () => {
  describe('b64Encode & b64Decode', () => {
    it('should correctly encode and decode standard Base64 strings', () => {
      const original = 'Hello, IQVerse!';
      const encoded = b64Encode(original);
      expect(encoded).toBe('SGVsbG8sIElRVmVyc2Uh');

      const decoded = b64Decode(encoded);
      expect(decoded).toBe(original);
    });

    it('should correctly encode and decode URL-safe Base64 strings', () => {
      const original = 'Subject?value=1&data=+';
      const encoded = b64Encode(original, true);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');

      const decoded = b64Decode(encoded, true);
      expect(decoded).toBe(original);
    });

    it('should correctly encode and decode unicode / multi-byte UTF-8 strings', () => {
      const original = 'Türkçe karakterler: ğüşıöç 🚀 🌍';
      const encoded = b64Encode(original);
      const decoded = b64Decode(encoded);
      expect(decoded).toBe(original);
    });

    it('should handle empty input strings gracefully', () => {
      expect(b64Encode('')).toBe('');
      expect(b64Decode('')).toBe('');
    });
  });

  describe('hexEncode & hexDecode', () => {
    it('should correctly encode and decode Hex strings', () => {
      const original = 'Antigravity Test';
      const hex = hexEncode(original);
      expect(hex).toMatch(/^[0-9a-f]+$/i);

      const decoded = hexDecode(hex);
      expect(decoded).toBe(original);
    });

    it('should return error message for invalid hex string decoding', () => {
      const invalidHex = '123'; // odd length
      expect(hexDecode(invalidHex)).toBe('Decoding error');
    });
  });
});
