import { describe, it, expect } from 'vitest';
import { parseCustomHeaders, evaluateCorsResponse, CORS_PRESETS } from '@/lib/cors';

describe('CORS Engine (lib/cors)', () => {
  it('parses custom headers correctly', () => {
    const raw = 'Authorization: Bearer xyz\nX-Custom-Header: value123\n\nInvalidLine';
    const parsed = parseCustomHeaders(raw);
    expect(parsed['authorization']).toBe('Bearer xyz');
    expect(parsed['x-custom-header']).toBe('value123');
    expect(parsed['invalidline']).toBeUndefined();
  });

  it('evaluates wildcard CORS response', () => {
    const result = evaluateCorsResponse('https://iqverse.net', {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
    });
    expect(result.allowed).toBe(true);
    expect(result.allowsOrigin).toBe(true);
    expect(result.isWildcard).toBe(true);
    expect(result.checks.find((c) => c.label.includes('Allow-Origin'))?.pass).toBe(true);
  });

  it('evaluates exact matching CORS origin', () => {
    const result = evaluateCorsResponse('https://iqverse.net', {
      'access-control-allow-origin': 'https://iqverse.net',
      'access-control-allow-credentials': 'true',
    });
    expect(result.allowed).toBe(true);
    expect(result.allowsOrigin).toBe(true);
    expect(result.isWildcard).toBe(false);
    expect(result.allowsCredentials).toBe(true);
  });

  it('flags origin mismatch as disallowed', () => {
    const result = evaluateCorsResponse('https://malicious.com', {
      'access-control-allow-origin': 'https://iqverse.net',
    });
    expect(result.allowed).toBe(false);
    expect(result.allowsOrigin).toBe(false);
  });

  it('warns about wildcard origin combined with credentials', () => {
    const result = evaluateCorsResponse('https://iqverse.net', {
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true',
    });
    const credCheck = result.checks.find((c) => c.label.includes('Credentials'));
    expect(credCheck?.pass).toBe(false);
  });

  it('provides working presets', () => {
    expect(CORS_PRESETS.publicApi['access-control-allow-origin']).toBe('*');
    expect(CORS_PRESETS.authenticatedApi['access-control-allow-credentials']).toBe('true');
  });
});
