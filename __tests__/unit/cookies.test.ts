import { describe, it, expect } from 'vitest';
import { cookieByteSize, parseDocumentCookies, parseSetCookieHeader } from '@/lib/cookies';

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

describe('Browser cookies (parseDocumentCookies)', () => {
  const context = { host: 'iqverse.net', secureContext: true };

  it('parses a document.cookie string into individual cookies', () => {
    const parsed = parseDocumentCookies('theme=dark; lang=en; ab_test=b', context);

    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toMatchObject({ name: 'theme', value: 'dark', domain: 'iqverse.net', source: 'browser' });
    expect(parsed[2].name).toBe('ab_test');
  });

  it('keeps equals signs inside the value', () => {
    const parsed = parseDocumentCookies('payload=a=b=c', context);

    expect(parsed[0].value).toBe('a=b=c');
    expect(parsed[0].size).toBe(cookieByteSize('payload', 'a=b=c'));
  });

  it('marks every browser cookie as readable by JavaScript', () => {
    const parsed = parseDocumentCookies('session_id=abc', context);

    expect(parsed[0].httpOnly).toBe(false);
    expect(parsed[0].warnings.some((w) => w.includes('readable by JavaScript'))).toBe(true);
  });

  it('warns when the page is not a secure context', () => {
    const parsed = parseDocumentCookies('theme=dark', { host: 'localhost', secureContext: false });

    expect(parsed[0].warnings.some((w) => w.includes('secure context'))).toBe(true);
  });

  it('warns when a cookie exceeds the 4 KB browser limit', () => {
    const parsed = parseDocumentCookies(`big=${'x'.repeat(4200)}`, context);

    expect(parsed[0].warnings.some((w) => w.includes('4096 byte limit'))).toBe(true);
  });

  it('ignores empty input and malformed pairs', () => {
    expect(parseDocumentCookies('', context)).toEqual([]);
    expect(parseDocumentCookies('   ', context)).toEqual([]);
    expect(parseDocumentCookies('novalue; =orphan; ok=1', context)).toHaveLength(1);
  });
});
