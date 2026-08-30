import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  capitalize,
  formatTTL,
  normalizeDomain,
  normalizeUrl,
  safeRegExp,
  getHeader,
  buildQRPayload,
} from '@/lib/utils';

describe('lib/utils.ts - Common Utility Functions', () => {
  describe('escapeHtml', () => {
    it('should escape HTML characters safely', () => {
      expect(escapeHtml('<script>alert("xss" & \'test\')</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot; &amp; &#039;test&#039;)&lt;/script&gt;'
      );
    });

    it('should handle empty or falsy strings gracefully', () => {
      expect(escapeHtml('')).toBe('');
      expect(escapeHtml(null as unknown as string)).toBe('');
      expect(escapeHtml(undefined as unknown as string)).toBe('');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter of string', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('')).toBe('');
    });
  });

  describe('formatTTL', () => {
    it('should format TTL seconds into human readable duration', () => {
      expect(formatTTL(30)).toBe('30s');
      expect(formatTTL(150)).toBe('2m 30s');
      expect(formatTTL(3660)).toBe('1h 1m');
      expect(formatTTL(null)).toBe('—');
    });
  });

  describe('normalizeDomain', () => {
    it('should extract clean domain name from URL string', () => {
      expect(normalizeDomain('https://iqverse.net/tools?id=1')).toBe('iqverse.net');
      expect(normalizeDomain('HTTP://EXAMPLE.COM/path')).toBe('example.com');
    });
  });

  describe('normalizeUrl', () => {
    it('should resolve relative URLs against base URL', () => {
      expect(normalizeUrl('https://iqverse.net', '/json')).toBe('https://iqverse.net/json');
      expect(normalizeUrl('invalid-url', 'path')).toBeNull();
    });
  });

  describe('safeRegExp', () => {
    it('should return RegExp for valid patterns and null for invalid ones', () => {
      const valid = safeRegExp('^[a-z]+$', 'i');
      expect(valid).toBeInstanceOf(RegExp);

      const invalid = safeRegExp('[a-z', 'g');
      expect(invalid).toBeNull();
    });
  });

  describe('getHeader', () => {
    it('should retrieve header case-insensitively', () => {
      const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer token' };
      expect(getHeader(headers, 'content-type')).toBe('application/json');
      expect(getHeader(headers, 'AUTHORIZATION')).toBe('Bearer token');
      expect(getHeader(headers, 'missing')).toBeNull();
    });
  });

  describe('buildQRPayload', () => {
    it('should build correct QR payload strings for different types', () => {
      expect(buildQRPayload('email', { email: 'test@example.com', subject: 'Hi', body: 'Hello' })).toBe(
        'mailto:test@example.com?subject=Hi&body=Hello'
      );
      expect(buildQRPayload('wifi', { ssid: 'MyWiFi', password: '123', security: 'WPA' })).toBe(
        'WIFI:T:WPA;S:MyWiFi;P:123;;'
      );
      expect(buildQRPayload('text', { text: 'Plain text payload' })).toBe('Plain text payload');
    });
  });
});
