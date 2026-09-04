import { buildVerdict, type Clue, type Verdict } from './verdict';

export interface EdgeNetworkInfo {
  ip: string;
  ipVersion: 'IPv4' | 'IPv6' | 'Unknown';
  asn: number | null;
  organization: string;
  city: string;
  region: string;
  country: string;
  continent: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  timezone: string;
  colo: string;
  httpProtocol: string;
  tlsVersion: string;
  tlsCipher: string;
  clientTcpRtt: number | null;
  torExit: boolean;
  forwardedHops: number;
  proxyHeaders: string[];
  receivedHeaders: ReceivedHeader[];
}

export interface ReceivedHeader {
  name: string;
  value: string;
}

export function findHeader(headers: ReceivedHeader[], name: string): string | null {
  const needle = name.toLowerCase();
  return headers.find(header => header.name.toLowerCase() === needle)?.value ?? null;
}

/** Organisation substrings that identify a consumer VPN or proxy network. */
export const VPN_ORGANISATIONS = [
  'nordvpn',
  'tefincom',
  'mullvad',
  'expressvpn',
  'private internet access',
  'privateinternetaccess',
  'surfshark',
  'packethub',
  'protonvpn',
  'proton ag',
  'cyberghost',
  'ipvanish',
  'windscribe',
  'tunnelbear',
  'purevpn',
  'vyprvpn',
  'torguard',
  'hidemyass',
  'hide.me',
  'astrill',
  'ivpn',
  'airvpn',
  'perfect privacy',
  'zenmate',
  'atlas vpn',
  'atlasvpn',
  'psiphon',
  'urban vpn',
  'betternet',
  'mysterium',
  'oxylabs',
  'bright data',
  'luminati',
  'smartproxy',
  'm247',
  'datacamp limited',
  'cloudflare warp',
];

/** Organisation substrings that identify a datacentre rather than a consumer ISP. */
export const HOSTING_ORGANISATIONS = [
  'amazon',
  'aws',
  'google cloud',
  'google llc',
  'microsoft',
  'azure',
  'digitalocean',
  'linode',
  'ovh',
  'hetzner',
  'vultr',
  'choopa',
  'constant company',
  'contabo',
  'scaleway',
  'leaseweb',
  'quadranet',
  'psychz',
  'hostinger',
  'godaddy',
  'namecheap',
  'alibaba',
  'tencent',
  'oracle',
  'ionos',
  'upcloud',
  'rackspace',
  'equinix',
  'zenlayer',
  'colocrossing',
  'hivelocity',
  'worldstream',
  'serverius',
  'netcup',
  'hostwinds',
  'xtom',
  'stackpath',
  'fastly',
  'cloudflare',
  'akamai',
];

function matchOrganisation(organisation: string, needles: string[]): string | null {
  const haystack = organisation.toLowerCase();
  return needles.find(needle => haystack.includes(needle)) ?? null;
}

function toNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function parseEdgeNetworkInfo(payload: unknown): EdgeNetworkInfo | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const raw = payload as Record<string, unknown>;
  if (typeof raw.ip !== 'string') return null;

  const version = toText(raw.ipVersion);
  const proxyHeaders = Array.isArray(raw.proxyHeaders)
    ? raw.proxyHeaders.filter((entry): entry is string => typeof entry === 'string')
    : [];

  const receivedHeaders = Array.isArray(raw.receivedHeaders)
    ? raw.receivedHeaders
        .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
        .filter(entry => typeof entry.name === 'string' && typeof entry.value === 'string')
        .map(entry => ({ name: entry.name as string, value: entry.value as string }))
    : [];

  return {
    ip: raw.ip,
    ipVersion: version === 'IPv4' || version === 'IPv6' ? version : 'Unknown',
    asn: toNumber(raw.asn),
    organization: toText(raw.organization),
    city: toText(raw.city),
    region: toText(raw.region),
    country: toText(raw.country),
    continent: toText(raw.continent),
    postalCode: toText(raw.postalCode),
    latitude: toText(raw.latitude),
    longitude: toText(raw.longitude),
    timezone: toText(raw.timezone),
    colo: toText(raw.colo),
    httpProtocol: toText(raw.httpProtocol),
    tlsVersion: toText(raw.tlsVersion),
    tlsCipher: toText(raw.tlsCipher),
    clientTcpRtt: toNumber(raw.clientTcpRtt),
    torExit: raw.torExit === true,
    forwardedHops: toNumber(raw.forwardedHops) ?? 0,
    proxyHeaders,
    receivedHeaders,
  };
}

function isPrivateAddress(host: string): boolean {
  if (host.endsWith('.local')) return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  if (/^127\./.test(host)) return true;
  return /^(fc|fd|fe80)/i.test(host);
}

export interface LocalNetworkContext {
  timezone: string;
  languages: string[];
  webrtcHosts: string[];
}

export function detectVpn(edge: EdgeNetworkInfo, local: LocalNetworkContext): Verdict {
  const clues: Clue[] = [];

  const vpnOrg = matchOrganisation(edge.organization, VPN_ORGANISATIONS);
  if (vpnOrg) {
    clues.push({
      id: 'vpn-asn',
      label: 'Commercial VPN network',
      detail: `Traffic arrives from ${edge.organization}, a network operated for VPN and proxy traffic.`,
      weight: 100,
    });
  }

  const hostingOrg = !vpnOrg ? matchOrganisation(edge.organization, HOSTING_ORGANISATIONS) : null;
  if (hostingOrg) {
    clues.push({
      id: 'hosting-asn',
      label: 'Datacentre network',
      detail: `${edge.organization} is a hosting or cloud provider, not a consumer ISP. Common for VPN exits and self-hosted proxies.`,
      weight: 45,
    });
  }

  if (edge.timezone && local.timezone && edge.timezone !== local.timezone) {
    clues.push({
      id: 'timezone-mismatch',
      label: 'Time zone disagrees with IP location',
      detail: `Your browser reports ${local.timezone} but this IP geolocates to ${edge.timezone}.`,
      weight: 35,
    });
  }

  if (edge.forwardedHops > 1) {
    clues.push({
      id: 'forwarded-hops',
      label: 'Multiple forwarding hops',
      detail: `The request carried ${edge.forwardedHops} addresses in X-Forwarded-For, so at least one proxy sits in front of you.`,
      weight: 25,
    });
  }

  if (edge.proxyHeaders.length > 0) {
    clues.push({
      id: 'proxy-headers',
      label: 'Proxy headers present',
      detail: `The request included ${edge.proxyHeaders.join(', ')}, which intermediaries add.`,
      weight: 20,
    });
  }

  const leakedPublicHost = local.webrtcHosts.find(
    host => !isPrivateAddress(host) && host !== edge.ip
  );
  if (leakedPublicHost) {
    clues.push({
      id: 'webrtc-mismatch',
      label: 'WebRTC exposes a different address',
      detail: `WebRTC advertised ${leakedPublicHost} while your traffic exits from ${edge.ip}. A tunnel is leaking outside itself.`,
      weight: 30,
    });
  }

  return buildVerdict(
    clues,
    {
      confirmed: 'You are behind a commercial VPN',
      likely: 'A VPN or proxy is very likely',
      possible: 'Some proxy indicators found',
      unlikely: 'No VPN or proxy indicators',
    },
    { requireDefinitive: true }
  );
}

export interface TorClientContext {
  timezone: string;
  languages: string[];
  hardwareConcurrency: number | null;
  devicePixelRatio: number | null;
  innerWidth: number | null;
  innerHeight: number | null;
  screenWidth: number | null;
  pluginCount: number;
  webglRenderer: string;
  userAgent: string;
}

export function detectTor(torExit: boolean, client: TorClientContext): Verdict {
  const clues: Clue[] = [];

  if (torExit) {
    clues.push({
      id: 'tor-exit',
      label: 'Request arrived from a Tor exit node',
      detail: 'Cloudflare tagged this connection with country code T1, which it reserves for the Tor network.',
      weight: 100,
    });
  }

  if (client.timezone === 'UTC') {
    clues.push({
      id: 'tor-timezone',
      label: 'Time zone forced to UTC',
      detail: 'Tor Browser and Firefox resistFingerprinting both report UTC regardless of your real zone.',
      weight: 20,
    });
  }

  if (client.languages.length === 2 && client.languages.join(',') === 'en-US,en') {
    clues.push({
      id: 'tor-languages',
      label: 'Language list normalised to en-US',
      detail: 'Anti-fingerprinting modes pin the language list to en-US,en so every user looks alike.',
      weight: 15,
    });
  }

  if (client.hardwareConcurrency === 2) {
    clues.push({
      id: 'tor-cores',
      label: 'CPU core count spoofed to 2',
      detail: 'resistFingerprinting reports exactly 2 logical cores on every machine.',
      weight: 15,
    });
  }

  if (
    client.innerWidth !== null &&
    client.innerHeight !== null &&
    client.innerWidth % 200 === 0 &&
    client.innerHeight % 100 === 0
  ) {
    clues.push({
      id: 'tor-letterbox',
      label: 'Window letterboxed to a rounded size',
      detail: `The viewport is exactly ${client.innerWidth}x${client.innerHeight}. Tor Browser pads the window to fixed steps to hide the real size.`,
      weight: 20,
    });
  }

  if (
    client.screenWidth !== null &&
    client.innerWidth !== null &&
    client.screenWidth === client.innerWidth
  ) {
    clues.push({
      id: 'tor-screen',
      label: 'Screen size reported as window size',
      detail: 'resistFingerprinting hides the real display and returns the content window instead.',
      weight: 15,
    });
  }

  if (client.devicePixelRatio === 1 && /Firefox/i.test(client.userAgent)) {
    clues.push({
      id: 'tor-dpr',
      label: 'Device pixel ratio pinned to 1',
      detail: 'Display scaling is masked so high DPI screens cannot be told apart.',
      weight: 10,
    });
  }

  if (client.pluginCount === 0 && /Firefox/i.test(client.userAgent)) {
    clues.push({
      id: 'tor-plugins',
      label: 'Plugin list empty',
      detail: 'Tor Browser exposes no plugins at all.',
      weight: 10,
    });
  }

  if (/llvmpipe|swiftshader|software|^mozilla$/i.test(client.webglRenderer.trim())) {
    clues.push({
      id: 'tor-webgl',
      label: 'Software WebGL renderer',
      detail: `The GPU reports as "${client.webglRenderer}", meaning hardware acceleration is masked or disabled.`,
      weight: 15,
    });
  }

  return buildVerdict(
    clues,
    {
      confirmed: 'You are using Tor',
      likely: 'Tor Browser or strong anti-fingerprinting is very likely',
      possible: 'Some anti-fingerprinting defences detected',
      unlikely: 'No Tor or anti-fingerprinting indicators',
    },
    { requireDefinitive: true }
  );
}

export type BrowserEngine = 'chromium' | 'firefox' | 'webkit' | 'unknown';

export function detectEngine(userAgent: string): BrowserEngine {
  if (/Firefox\/|FxiOS/i.test(userAgent)) return 'firefox';
  if (/Edg\/|Chrome\/|Chromium\/|CriOS/i.test(userAgent)) return 'chromium';
  if (/Safari\//i.test(userAgent)) return 'webkit';
  return 'unknown';
}

export interface PrivateModeContext {
  engine: BrowserEngine;
  storageQuota: number | null;
  localStorageAvailable: boolean;
  indexedDbAvailable: boolean;
  serviceWorkerAvailable: boolean;
}

const GIB = 1024 ** 3;

/**
 * Chromium caps an incognito origin at min(2 GB, 10% of free disk) while a normal
 * window gets roughly 60% of free disk. Anything under this ceiling is suspicious.
 */
export const INCOGNITO_QUOTA_CEILING = 4 * GIB;

export function detectPrivateMode(context: PrivateModeContext): Verdict {
  const clues: Clue[] = [];

  if (!context.localStorageAvailable) {
    clues.push({
      id: 'private-localstorage',
      label: 'localStorage is blocked',
      detail: 'Writing to localStorage threw, which happens in a private window or with site data fully blocked.',
      weight: 60,
    });
  }

  if (!context.indexedDbAvailable) {
    clues.push({
      id: 'private-indexeddb',
      label: 'IndexedDB is unavailable',
      detail: 'Older private browsing modes remove IndexedDB entirely.',
      weight: 45,
    });
  }

  if (context.engine === 'firefox' && !context.serviceWorkerAvailable) {
    clues.push({
      id: 'private-serviceworker',
      label: 'Service workers disabled',
      detail: 'Firefox turns off service workers in private windows.',
      weight: 55,
    });
  }

  if (context.storageQuota !== null) {
    if (context.storageQuota < INCOGNITO_QUOTA_CEILING) {
      clues.push({
        id: 'private-quota',
        label: 'Storage quota is unusually small',
        detail: `The origin was granted ${(context.storageQuota / GIB).toFixed(2)} GB. Private windows cap the quota near 2 GB while normal windows get a large share of free disk.`,
        weight: 55,
      });
    }

    if (context.storageQuota < 1 * GIB) {
      clues.push({
        id: 'private-quota-tiny',
        label: 'Storage quota under 1 GB',
        detail: 'A quota this small is typical of a private or ephemeral browsing session.',
        weight: 25,
      });
    }
  }

  return buildVerdict(
    clues,
    {
      confirmed: 'Private browsing detected',
      likely: 'Private or incognito window is very likely',
      possible: 'Some private browsing indicators found',
      unlikely: 'Looks like a normal browsing window',
    },
    { maxScore: 99 }
  );
}

export function summariseLocation(edge: EdgeNetworkInfo): string {
  const parts = [edge.city, edge.region, edge.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Unknown';
}

export const NETWORK_ENDPOINT = '/api/v1/network';

export async function fetchEdgeNetworkInfo(): Promise<EdgeNetworkInfo | null> {
  try {
    const response = await fetch(NETWORK_ENDPOINT, { cache: 'no-store' });
    if (!response.ok) return null;
    return parseEdgeNetworkInfo(await response.json());
  } catch {
    return null;
  }
}

export function readLocalNetworkContext(webrtcHosts: string[]): LocalNetworkContext {
  let timezone = '';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    timezone = '';
  }

  return {
    timezone,
    languages: typeof navigator === 'undefined' ? [] : [...navigator.languages],
    webrtcHosts,
  };
}

export function readTorClientContext(webglRenderer: string): TorClientContext {
  const hasWindow = typeof window !== 'undefined';
  const hasNavigator = typeof navigator !== 'undefined';

  let timezone = '';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    timezone = '';
  }

  return {
    timezone,
    languages: hasNavigator ? [...navigator.languages] : [],
    hardwareConcurrency: hasNavigator ? navigator.hardwareConcurrency : null,
    devicePixelRatio: hasWindow ? window.devicePixelRatio : null,
    innerWidth: hasWindow ? window.innerWidth : null,
    innerHeight: hasWindow ? window.innerHeight : null,
    screenWidth: typeof screen === 'undefined' ? null : screen.width,
    pluginCount: hasNavigator ? navigator.plugins.length : 0,
    webglRenderer,
    userAgent: hasNavigator ? navigator.userAgent : '',
  };
}

export async function readPrivateModeContext(): Promise<PrivateModeContext> {
  const navigatorRef = typeof navigator === 'undefined' ? null : navigator;

  let localStorageAvailable = false;
  try {
    localStorage.setItem('__iqverse_private__', '1');
    localStorage.removeItem('__iqverse_private__');
    localStorageAvailable = true;
  } catch {
    localStorageAvailable = false;
  }

  let storageQuota: number | null = null;
  try {
    const estimate = await navigatorRef?.storage?.estimate();
    storageQuota = estimate?.quota ?? null;
  } catch {
    storageQuota = null;
  }

  return {
    engine: detectEngine(navigatorRef?.userAgent ?? ''),
    storageQuota,
    localStorageAvailable,
    indexedDbAvailable: typeof indexedDB !== 'undefined',
    serviceWorkerAvailable: navigatorRef !== null && 'serviceWorker' in navigatorRef,
  };
}
