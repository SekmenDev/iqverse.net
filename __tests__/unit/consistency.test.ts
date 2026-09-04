import { describe, it, expect } from 'vitest';
import {
  checkConsistency,
  chromeMajorFromClientHint,
  chromeMajorFromUserAgent,
  osFromPlatform,
  osFromUserAgent,
  primaryAcceptLanguage,
  primaryLanguage,
  summariseConsistency,
  type ConsistencyContext,
} from '@/lib/consistency';

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36';

function context(overrides: Partial<ConsistencyContext> = {}): ConsistencyContext {
  return {
    userAgent: CHROME_UA,
    platform: 'Win32',
    maxTouchPoints: 0,
    mobileHint: false,
    languages: ['en-GB', 'en'],
    vendor: 'Google Inc.',
    pluginCount: 5,
    webdriver: false,
    screenWidth: 2560,
    innerWidth: 1280,
    serverUserAgent: CHROME_UA,
    acceptLanguage: 'en-GB,en;q=0.9',
    secChUa: '"Chromium";v="151", "Not;A=Brand";v="24", "Google Chrome";v="151"',
    secChUaPlatform: '"Windows"',
    ...overrides,
  };
}

function ids(overrides: Partial<ConsistencyContext> = {}): string[] {
  return checkConsistency(context(overrides)).map(finding => finding.id);
}

describe('Operating system parsing (lib/consistency)', () => {
  it('reads the OS out of a user agent', () => {
    expect(osFromUserAgent(CHROME_UA)).toBe('Windows');
    expect(osFromUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('macOS');
    expect(osFromUserAgent('Mozilla/5.0 (X11; Linux x86_64)')).toBe('Linux');
    expect(osFromUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toBe('iOS');
    expect(osFromUserAgent('curl/8.5.0')).toBe('Unknown');
  });

  it('prefers Android and Chrome OS over the Linux token they both contain', () => {
    expect(osFromUserAgent('Mozilla/5.0 (Linux; Android 15; Pixel 9)')).toBe('Android');
    expect(osFromUserAgent('Mozilla/5.0 (X11; CrOS x86_64 14541.0.0)')).toBe('Chrome OS');
  });

  it('prefers iOS over the Mac token in an iPhone user agent', () => {
    expect(osFromUserAgent('Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)')).toBe('iOS');
  });

  it('maps legacy platform strings and client hint values', () => {
    expect(osFromPlatform('Win32')).toBe('Windows');
    expect(osFromPlatform('MacIntel')).toBe('macOS');
    expect(osFromPlatform('Linux x86_64')).toBe('Linux');
    expect(osFromPlatform('iPhone')).toBe('iOS');
    expect(osFromPlatform('macOS')).toBe('macOS');
    expect(osFromPlatform('')).toBe('Unknown');
  });
});

describe('Version and language parsing (lib/consistency)', () => {
  it('reads the Chrome major version from a user agent', () => {
    expect(chromeMajorFromUserAgent(CHROME_UA)).toBe(151);
    expect(chromeMajorFromUserAgent('Mozilla/5.0 Firefox/128.0')).toBeNull();
  });

  it('skips the padded brand entries in a client hint', () => {
    expect(
      chromeMajorFromClientHint('"Chromium";v="151", "Not;A=Brand";v="24", "Google Chrome";v="151"')
    ).toBe(151);
    expect(chromeMajorFromClientHint('"Not/A)Brand";v="99", "Chromium";v="140"')).toBe(140);
    expect(chromeMajorFromClientHint('')).toBeNull();
  });

  it('normalises language tags to their primary subtag', () => {
    expect(primaryLanguage('en-GB')).toBe('en');
    expect(primaryLanguage('TR')).toBe('tr');
    expect(primaryAcceptLanguage('de-DE,de;q=0.9,en;q=0.8')).toBe('de');
  });
});

describe('Consistency checks (lib/consistency)', () => {
  it('finds nothing wrong with a coherent Chrome on Windows', () => {
    expect(checkConsistency(context())).toEqual([]);
  });

  it('catches a user agent that disagrees with navigator.platform', () => {
    expect(ids({ platform: 'MacIntel' })).toContain('os-mismatch');
  });

  it('catches a client hint platform that disagrees with the user agent', () => {
    const findings = checkConsistency(
      context({ secChUaPlatform: '"macOS"', platform: 'MacIntel' })
    );
    expect(findings.map(f => f.id)).toContain('os-hint-mismatch');
  });

  it('catches a mobile user agent with no touch support', () => {
    expect(
      ids({
        userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) Chrome/151.0.0.0 Mobile Safari/537.36',
        platform: 'Linux armv8l',
        maxTouchPoints: 0,
        mobileHint: true,
        secChUaPlatform: '"Android"',
      })
    ).toContain('mobile-no-touch');
  });

  it('accepts a phone that reports touch points', () => {
    expect(
      ids({
        userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) Chrome/151.0.0.0 Mobile Safari/537.36',
        platform: 'Linux armv8l',
        maxTouchPoints: 5,
        mobileHint: true,
        secChUaPlatform: '"Android"',
      })
    ).not.toContain('mobile-no-touch');
  });

  it('catches a rewritten user agent header', () => {
    expect(ids({ serverUserAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/128.0' })).toContain(
      'ua-header-mismatch'
    );
  });

  it('catches a language header that disagrees with navigator.languages', () => {
    expect(ids({ acceptLanguage: 'de-DE,de;q=0.9' })).toContain('language-mismatch');
  });

  it('ignores a region difference within the same language', () => {
    expect(ids({ acceptLanguage: 'en-US,en;q=0.9' })).not.toContain('language-mismatch');
  });

  it('catches a version that differs between the user agent and the client hint', () => {
    expect(ids({ secChUa: '"Chromium";v="140", "Not;A=Brand";v="24"' })).toContain(
      'version-mismatch'
    );
  });

  it('catches a Chrome user agent with the wrong vendor string', () => {
    expect(ids({ vendor: 'Apple Computer, Inc.' })).toContain('vendor-mismatch');
  });

  it('catches Firefox reporting a vendor string', () => {
    expect(
      ids({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
        serverUserAgent: null,
        vendor: 'Google Inc.',
        secChUa: null,
      })
    ).toContain('firefox-vendor');
  });

  it('does not apply the Chrome vendor rule to Firefox', () => {
    expect(
      ids({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
        serverUserAgent: null,
        vendor: '',
        pluginCount: 0,
        secChUa: null,
      })
    ).toEqual([]);
  });

  it('catches an empty plugin list on a Chromium build', () => {
    expect(ids({ pluginCount: 0 })).toContain('chrome-no-plugins');
  });

  it('catches the automation flag', () => {
    expect(ids({ webdriver: true })).toContain('webdriver');
  });

  it('catches a viewport wider than the screen', () => {
    expect(ids({ innerWidth: 3000, screenWidth: 1920 })).toContain('viewport-larger-than-screen');
  });

  it('skips header checks when the edge lookup has not run', () => {
    const findings = ids({ serverUserAgent: null, acceptLanguage: null, secChUa: null, secChUaPlatform: null });
    expect(findings).toEqual([]);
  });
});

describe('Consistency summary (lib/consistency)', () => {
  it('reports agreement when nothing was found', () => {
    const summary = summariseConsistency([]);
    expect(summary.severity).toBeNull();
    expect(summary.headline).toContain('agree');
  });

  it('escalates to the highest severity present', () => {
    expect(summariseConsistency(checkConsistency(context({ pluginCount: 0 }))).severity).toBe(
      'warning'
    );
    expect(
      summariseConsistency(checkConsistency(context({ platform: 'MacIntel' }))).severity
    ).toBe('critical');
  });
});
