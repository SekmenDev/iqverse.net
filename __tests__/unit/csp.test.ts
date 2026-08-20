import { describe, it, expect } from 'vitest';
import { buildCspHeader, generateCspMetaTag, analyzeCspSecurity } from '@/lib/csp';

describe('CSP Engine (lib/csp)', () => {
  it('builds CSP header string from directive mapping', () => {
    const directives: Record<string, string[]> = {
      'default-src': ["'self'"],
      'script-src': ["'self'", 'https://apis.google.com'],
      'style-src': ["'self'", "'unsafe-inline'"],
    };

    const header = buildCspHeader(directives);
    expect(header).toBe("default-src 'self'; script-src 'self' https://apis.google.com; style-src 'self' 'unsafe-inline'");

    const meta = generateCspMetaTag(directives);
    expect(meta).toBe(`<meta http-equiv="Content-Security-Policy" content="${header}">`);
  });

  it('builds CSP header string from directive config array with upgradeInsecureRequests', () => {
    const configs = [
      { name: 'default-src', values: ["'self'"] },
      { name: 'script-src', values: ["'self'", 'https://cdn.jsdelivr.net'] },
    ];

    const header = buildCspHeader(configs, true);
    expect(header).toBe("upgrade-insecure-requests; default-src 'self'; script-src 'self' https://cdn.jsdelivr.net");

    const meta = generateCspMetaTag(header);
    expect(meta).toBe(`<meta http-equiv="Content-Security-Policy" content="${header}">`);

    const metaFromConfigs = generateCspMetaTag(configs);
    expect(metaFromConfigs).toBe(`<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net">`);
  });

  it('analyzes CSP security risk levels', () => {
    const safeDirectives: Record<string, string[]> = {
      'default-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
    };
    const safeAnalysis = analyzeCspSecurity(safeDirectives);
    expect(safeAnalysis.rating).toBe('safe');
    expect(safeAnalysis.warnings).toHaveLength(0);

    const riskyDirectives: Record<string, string[]> = {
      'script-src': ["'unsafe-eval'", "'unsafe-inline'", '*'],
      'object-src': ['*'],
    };
    const riskyAnalysis = analyzeCspSecurity(riskyDirectives);
    expect(riskyAnalysis.rating).toBe('critical');
    expect(riskyAnalysis.warnings.some((w) => w.includes('unsafe-eval'))).toBe(true);
    expect(riskyAnalysis.warnings.some((w) => w.includes('default-src'))).toBe(true);
  });
});
