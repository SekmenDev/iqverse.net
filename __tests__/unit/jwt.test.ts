import { describe, it, expect } from 'vitest';
import { decodeJwtToken, base64UrlDecode } from '@/lib/jwt';

describe('JWT Engine (lib/jwt)', () => {
  it('decodes base64Url encoded strings', () => {
    const encoded = 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0';
    const decoded = base64UrlDecode(encoded);
    expect(decoded).toBe('{"sub":"1234567890","name":"John Doe"}');
  });

  it('decodes 3-part JWT token headers and payload with expiration check', () => {
    // Header: {"alg":"HS256","typ":"JWT"} -> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
    // Payload: {"sub":"user123","exp":2524608000} (year 2050) -> eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoyNTI0NjA4MDAwfQ
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoyNTI0NjA4MDAwfQ.mockSignature';
    const result = decodeJwtToken(validToken);

    expect(result.isValid).toBe(true);
    expect(result.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(result.payload?.sub).toBe('user123');
    expect(result.isExpired).toBe(false);
    expect(result.signature).toBe('mockSignature');
  });

  it('detects expired JWT token', () => {
    // Exp: 1000000000 (year 2001) -> eyJzdWIiOiJvbGQiLCJleHAiOjEwMDAwMDAwMDB9
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvbGQiLCJleHAiOjEwMDAwMDAwMDB9.sig';
    const result = decodeJwtToken(expiredToken);

    expect(result.isValid).toBe(true);
    expect(result.isExpired).toBe(true);
  });

  it('handles malformed JWT token string', () => {
    const malformed = 'not.a.jwt.token.extra.parts';
    const result = decodeJwtToken(malformed);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('3 dot-separated');
  });
});
