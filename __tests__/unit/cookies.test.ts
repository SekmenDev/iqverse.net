import { describe, it, expect } from 'vitest';
import { parseSetCookieHeader } from '@/lib/cookies';

describe('Cookies Engine (lib/cookies)', () => {
  it('parses fully specified secure Set-Cookie header', () => {
    const raw = 'session_id=abc123xyz; Path=/; Domain=iqverse.net; Max-Age=3600; Secure; HttpOnly; SameSite=Strict';
    const parsed = parseSetCookieHeader(raw);

    expect(parsed).not.toBeNull();
    expect(parsed?.name).toBe('session_id');
    expect(parsed?.value).toBe('abc123xyz');
    expect(parsed?.path).toBe('/');
    expect(parsed?.domain).toBe('iqverse.net');
    expect(parsed?.maxAge).toBe(3600);
    expect(parsed?.secure).toBe(true);
    expect(parsed?.httpOnly).toBe(true);
    expect(parsed?.sameSite).toBe('Strict');
    expect(parsed?.warnings).toHaveLength(0);
  });

  it('generates security warnings for insecure cookies', () => {
    const raw = 'auth_token=secret_val; Path=/';
    const parsed = parseSetCookieHeader(raw);

    expect(parsed).not.toBeNull();
    expect(parsed?.secure).toBe(false);
    expect(parsed?.httpOnly).toBe(false);
    expect(parsed?.warnings.some((w) => w.includes('Secure'))).toBe(true);
    expect(parsed?.warnings.some((w) => w.includes('HttpOnly'))).toBe(true);
    expect(parsed?.warnings.some((w) => w.includes('SameSite'))).toBe(true);
  });

  it('returns null for empty or invalid input', () => {
    expect(parseSetCookieHeader('')).toBeNull();
    expect(parseSetCookieHeader('    ')).toBeNull();
  });
});
