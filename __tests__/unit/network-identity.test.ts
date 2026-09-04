import { describe, it, expect } from 'vitest';
import {
  detectEngine,
  detectPrivateMode,
  detectTor,
  detectVpn,
  parseEdgeNetworkInfo,
  summariseLocation,
  type EdgeNetworkInfo,
  type LocalNetworkContext,
  type PrivateModeContext,
  type TorClientContext,
} from '@/lib/network-identity';

const GIB = 1024 ** 3;

function edge(overrides: Partial<EdgeNetworkInfo> = {}): EdgeNetworkInfo {
  return {
    ip: '203.0.113.7',
    ipVersion: 'IPv4',
    asn: 3320,
    organization: 'Deutsche Telekom AG',
    city: 'Berlin',
    region: 'Berlin',
    country: 'DE',
    continent: 'EU',
    postalCode: '10115',
    latitude: '52.52',
    longitude: '13.40',
    timezone: 'Europe/Berlin',
    colo: 'FRA',
    httpProtocol: 'HTTP/3',
    tlsVersion: 'TLSv1.3',
    tlsCipher: 'AEAD-AES128-GCM-SHA256',
    clientTcpRtt: 14,
    torExit: false,
    forwardedHops: 1,
    proxyHeaders: [],
    ...overrides,
  };
}

function local(overrides: Partial<LocalNetworkContext> = {}): LocalNetworkContext {
  return {
    timezone: 'Europe/Berlin',
    languages: ['de-DE', 'de', 'en'],
    webrtcHosts: ['a1b2c3d4-0000-1111-2222-333344445555.local'],
    ...overrides,
  };
}

function torClient(overrides: Partial<TorClientContext> = {}): TorClientContext {
  return {
    timezone: 'Europe/Berlin',
    languages: ['de-DE', 'de'],
    hardwareConcurrency: 16,
    devicePixelRatio: 2,
    innerWidth: 1287,
    innerHeight: 943,
    screenWidth: 2560,
    pluginCount: 5,
    webglRenderer: 'ANGLE (NVIDIA GeForce RTX 4070)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/151.0.0.0',
    ...overrides,
  };
}

function privateContext(overrides: Partial<PrivateModeContext> = {}): PrivateModeContext {
  return {
    engine: 'chromium',
    storageQuota: 200 * GIB,
    localStorageAvailable: true,
    indexedDbAvailable: true,
    serviceWorkerAvailable: true,
    ...overrides,
  };
}

describe('Edge payload parsing (lib/network-identity)', () => {
  it('parses a well formed payload', () => {
    const parsed = parseEdgeNetworkInfo({
      ip: '198.51.100.4',
      ipVersion: 'IPv4',
      asn: 13335,
      organization: 'Cloudflare, Inc.',
      torExit: true,
      forwardedHops: 2,
      proxyHeaders: ['via', 'forwarded'],
    });

    expect(parsed?.ip).toBe('198.51.100.4');
    expect(parsed?.asn).toBe(13335);
    expect(parsed?.torExit).toBe(true);
    expect(parsed?.forwardedHops).toBe(2);
    expect(parsed?.proxyHeaders).toEqual(['via', 'forwarded']);
  });

  it('defaults missing and malformed fields instead of throwing', () => {
    const parsed = parseEdgeNetworkInfo({ ip: '::1', asn: 'not-a-number', proxyHeaders: 'nope' });

    expect(parsed?.ipVersion).toBe('Unknown');
    expect(parsed?.asn).toBeNull();
    expect(parsed?.organization).toBe('');
    expect(parsed?.torExit).toBe(false);
    expect(parsed?.forwardedHops).toBe(0);
    expect(parsed?.proxyHeaders).toEqual([]);
  });

  it('rejects payloads without an IP', () => {
    expect(parseEdgeNetworkInfo(null)).toBeNull();
    expect(parseEdgeNetworkInfo('string')).toBeNull();
    expect(parseEdgeNetworkInfo({ asn: 1 })).toBeNull();
  });

  it('summarises the location from the parts that are present', () => {
    expect(summariseLocation(edge())).toBe('Berlin, Berlin, DE');
    expect(summariseLocation(edge({ city: '', region: '' }))).toBe('DE');
    expect(summariseLocation(edge({ city: '', region: '', country: '' }))).toBe('Unknown');
  });
});

describe('VPN detection (lib/network-identity)', () => {
  it('finds no indicators on a consumer ISP with a matching time zone', () => {
    const verdict = detectVpn(edge(), local());
    expect(verdict.confidence).toBe('unlikely');
    expect(verdict.clues).toEqual([]);
  });

  it('confirms a known commercial VPN network', () => {
    const verdict = detectVpn(edge({ organization: 'Tefincom S.A. (NordVPN)' }), local());
    expect(verdict.confidence).toBe('confirmed');
    expect(verdict.clues[0].id).toBe('vpn-asn');
  });

  it('does not double count hosting when the VPN list already matched', () => {
    const verdict = detectVpn(edge({ organization: 'Cloudflare WARP' }), local());
    expect(verdict.clues.map(clue => clue.id)).toEqual(['vpn-asn']);
  });

  it('flags datacentre networks separately from consumer ISPs', () => {
    const verdict = detectVpn(edge({ organization: 'DigitalOcean, LLC' }), local());
    expect(verdict.clues.map(clue => clue.id)).toContain('hosting-asn');
    expect(verdict.confidence).toBe('possible');
  });

  it('raises confidence when the time zone disagrees with the IP', () => {
    const verdict = detectVpn(
      edge({ organization: 'DigitalOcean, LLC', timezone: 'America/New_York' }),
      local({ timezone: 'Europe/Berlin' })
    );
    expect(verdict.clues.map(clue => clue.id)).toContain('timezone-mismatch');
    expect(verdict.confidence).toBe('likely');
  });

  it('reports extra forwarding hops and proxy headers', () => {
    const verdict = detectVpn(edge({ forwardedHops: 3, proxyHeaders: ['via'] }), local());
    const ids = verdict.clues.map(clue => clue.id);
    expect(ids).toContain('forwarded-hops');
    expect(ids).toContain('proxy-headers');
  });

  it('detects a WebRTC leak that exposes a different public address', () => {
    const verdict = detectVpn(
      edge({ ip: '203.0.113.7' }),
      local({ webrtcHosts: ['192.168.1.20', '198.51.100.99'] })
    );
    const leak = verdict.clues.find(clue => clue.id === 'webrtc-mismatch');
    expect(leak?.detail).toContain('198.51.100.99');
  });

  it('ignores private and mDNS WebRTC candidates', () => {
    const verdict = detectVpn(
      edge(),
      local({ webrtcHosts: ['10.0.0.5', '172.16.4.9', 'fd00::1', 'abc.local'] })
    );
    expect(verdict.clues.map(clue => clue.id)).not.toContain('webrtc-mismatch');
  });
});

describe('Tor detection (lib/network-identity)', () => {
  it('finds nothing on an ordinary Chrome session', () => {
    const verdict = detectTor(false, torClient());
    expect(verdict.confidence).toBe('unlikely');
    expect(verdict.clues).toEqual([]);
  });

  it('confirms Tor from the exit node tag alone', () => {
    const verdict = detectTor(true, torClient());
    expect(verdict.confidence).toBe('confirmed');
    expect(verdict.clues[0].id).toBe('tor-exit');
  });

  it('recognises a Tor Browser profile without the exit node tag', () => {
    const verdict = detectTor(
      false,
      torClient({
        timezone: 'UTC',
        languages: ['en-US', 'en'],
        hardwareConcurrency: 2,
        devicePixelRatio: 1,
        innerWidth: 1000,
        innerHeight: 900,
        screenWidth: 1000,
        pluginCount: 0,
        webglRenderer: 'llvmpipe',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0',
      })
    );
    expect(verdict.confidence).toBe('confirmed');
    expect(verdict.clues.map(clue => clue.id)).toContain('tor-letterbox');
    expect(verdict.clues.map(clue => clue.id)).toContain('tor-cores');
  });

  it('reports partial anti-fingerprinting without overclaiming', () => {
    const verdict = detectTor(false, torClient({ timezone: 'UTC', hardwareConcurrency: 2 }));
    expect(verdict.confidence).toBe('possible');
  });

  it('only counts Firefox-specific tells on Firefox', () => {
    const chromium = detectTor(false, torClient({ devicePixelRatio: 1, pluginCount: 0 }));
    expect(chromium.clues.map(clue => clue.id)).not.toContain('tor-dpr');
    expect(chromium.clues.map(clue => clue.id)).not.toContain('tor-plugins');
  });
});

describe('Private browsing detection (lib/network-identity)', () => {
  it('treats a large quota on a normal window as unremarkable', () => {
    const verdict = detectPrivateMode(privateContext());
    expect(verdict.confidence).toBe('unlikely');
    expect(verdict.clues).toEqual([]);
  });

  it('flags the capped quota of a Chromium incognito window', () => {
    const verdict = detectPrivateMode(privateContext({ storageQuota: 2 * GIB }));
    expect(verdict.clues.map(clue => clue.id)).toContain('private-quota');
    expect(verdict.confidence).toBe('possible');
  });

  it('leaves a modest but normal quota alone', () => {
    const verdict = detectPrivateMode(privateContext({ storageQuota: 10 * GIB }));
    expect(verdict.clues).toEqual([]);
    expect(verdict.confidence).toBe('unlikely');
  });

  it('escalates when the quota is tiny', () => {
    const verdict = detectPrivateMode(privateContext({ storageQuota: 0.2 * GIB }));
    const ids = verdict.clues.map(clue => clue.id);
    expect(ids).toContain('private-quota');
    expect(ids).toContain('private-quota-tiny');
    expect(verdict.confidence).toBe('likely');
  });

  it('flags Firefox private windows through disabled service workers', () => {
    const verdict = detectPrivateMode(
      privateContext({ engine: 'firefox', serviceWorkerAvailable: false })
    );
    expect(verdict.clues.map(clue => clue.id)).toContain('private-serviceworker');
  });

  it('ignores the service worker tell outside Firefox', () => {
    const verdict = detectPrivateMode(privateContext({ serviceWorkerAvailable: false }));
    expect(verdict.clues.map(clue => clue.id)).not.toContain('private-serviceworker');
  });

  it('flags blocked storage backends', () => {
    const verdict = detectPrivateMode(
      privateContext({ localStorageAvailable: false, indexedDbAvailable: false })
    );
    const ids = verdict.clues.map(clue => clue.id);
    expect(ids).toContain('private-localstorage');
    expect(ids).toContain('private-indexeddb');
  });

  it('never claims certainty because every check is a heuristic', () => {
    const verdict = detectPrivateMode(
      privateContext({
        engine: 'firefox',
        storageQuota: 0.05 * GIB,
        localStorageAvailable: false,
        indexedDbAvailable: false,
        serviceWorkerAvailable: false,
      })
    );
    expect(verdict.confidence).toBe('likely');
    expect(verdict.confidence).not.toBe('confirmed');
  });
});

describe('Engine detection (lib/network-identity)', () => {
  it('identifies the major engines from the user agent', () => {
    expect(detectEngine('Mozilla/5.0 (Windows NT 10.0) Chrome/151.0.0.0 Safari/537.36')).toBe('chromium');
    expect(detectEngine('Mozilla/5.0 (Windows NT 10.0) Gecko/20100101 Firefox/128.0')).toBe('firefox');
    expect(detectEngine('Mozilla/5.0 (Macintosh) Version/18.0 Safari/605.1.15')).toBe('webkit');
    expect(detectEngine('curl/8.5.0')).toBe('unknown');
  });

  it('prefers Firefox over the Safari token that Gecko builds omit', () => {
    expect(detectEngine('Mozilla/5.0 (iPhone) FxiOS/130.0 Safari/605.1')).toBe('firefox');
  });

  it('treats Edge as chromium', () => {
    expect(detectEngine('Mozilla/5.0 Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0')).toBe('chromium');
  });
});
