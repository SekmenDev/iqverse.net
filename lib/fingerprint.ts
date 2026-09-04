import { arrayBufferToHex, computeDigest } from './hashing';

export type Importance = 'critical' | 'high' | 'medium' | 'low';

export const IMPORTANCE_LEVELS = ['critical', 'high', 'medium', 'low'] as const;

export const IMPORTANCE_RANK: Record<Importance, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const IMPORTANCE_LABELS: Record<Importance, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const IMPORTANCE_COLORS: Record<Importance, string> = {
  critical: '#ff4d4f',
  high: '#ff9800',
  medium: '#faad14',
  low: '#4caf50',
};

export const SIGNAL_GROUPS = [
  'Fingerprint Hashes',
  'Display & Graphics',
  'Hardware',
  'Locale & Time',
  'Browser & Engine',
  'Capabilities',
  'Network',
  'Privacy Signals',
] as const;

export type SignalGroup = (typeof SIGNAL_GROUPS)[number];

export const UNAVAILABLE = 'Not available';

export interface Signal {
  id: string;
  label: string;
  group: SignalGroup;
  importance: Importance;
  entropyBits: number;
  value: string;
  note: string;
  stable: boolean;
}

/** log2 of the current world population: no browser can be rarer than this. */
export const MAX_ENTROPY_BITS = 33.2;

export function isAvailable(signal: Signal): boolean {
  return signal.value !== UNAVAILABLE && signal.value.trim().length > 0;
}

export function sortSignals(signals: Signal[]): Signal[] {
  return [...signals].sort(
    (a, b) =>
      IMPORTANCE_RANK[a.importance] - IMPORTANCE_RANK[b.importance] ||
      b.entropyBits - a.entropyBits ||
      a.label.localeCompare(b.label)
  );
}

export function groupSignals(signals: Signal[]): Array<{ group: SignalGroup; signals: Signal[] }> {
  return SIGNAL_GROUPS.map(group => ({
    group,
    signals: sortSignals(signals.filter(signal => signal.group === group)),
  })).filter(entry => entry.signals.length > 0);
}

export function countByImportance(signals: Signal[]): Record<Importance | 'all', number> {
  const counts: Record<Importance | 'all', number> = {
    all: signals.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const signal of signals) counts[signal.importance] += 1;
  return counts;
}

export function filterSignals(
  signals: Signal[],
  query: string,
  importance: Importance | 'all'
): Signal[] {
  const needle = query.trim().toLowerCase();

  return signals.filter(signal => {
    if (importance !== 'all' && signal.importance !== importance) return false;
    if (!needle) return true;
    return `${signal.label} ${signal.value} ${signal.group} ${signal.note}`
      .toLowerCase()
      .includes(needle);
  });
}

export function totalEntropyBits(signals: Signal[]): number {
  const bits = signals.filter(isAvailable).reduce((sum, signal) => sum + signal.entropyBits, 0);
  return Math.round(bits * 10) / 10;
}

export function effectiveEntropyBits(signals: Signal[]): number {
  return Math.min(totalEntropyBits(signals), MAX_ENTROPY_BITS);
}

export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return 'countless';
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)} trillion`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)} billion`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)} million`;
  if (value >= 1e3) return `${Math.round(value / 1e3)} thousand`;
  return String(Math.round(value));
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

export interface UniquenessVerdict {
  bits: number;
  oneIn: number;
  rating: 'Low' | 'Moderate' | 'High' | 'Very High';
  color: string;
  summary: string;
}

export function describeUniqueness(bits: number): UniquenessVerdict {
  const capped = Math.min(bits, MAX_ENTROPY_BITS);
  const oneIn = 2 ** capped;

  let rating: UniquenessVerdict['rating'] = 'Low';
  let color = IMPORTANCE_COLORS.low;

  if (capped >= 26) {
    rating = 'Very High';
    color = IMPORTANCE_COLORS.critical;
  } else if (capped >= 18) {
    rating = 'High';
    color = IMPORTANCE_COLORS.high;
  } else if (capped >= 10) {
    rating = 'Moderate';
    color = IMPORTANCE_COLORS.medium;
  }

  return {
    bits: Math.round(capped * 10) / 10,
    oneIn,
    rating,
    color,
    summary: `Roughly 1 in ${formatCount(oneIn)} browsers share this combination.`,
  };
}

export async function hashText(input: string, length = 32): Promise<string> {
  const digest = await computeDigest('SHA-256', input);
  return arrayBufferToHex(digest).slice(0, length);
}

export async function computeFingerprintId(signals: Signal[]): Promise<string> {
  const source = signals
    .filter(signal => signal.stable && isAvailable(signal))
    .map(signal => `${signal.id}=${signal.value}`)
    .sort((a, b) => a.localeCompare(b))
    .join('|');

  return hashText(source);
}

export function signalsToJson(signals: Signal[], fingerprintId: string): string {
  return JSON.stringify(
    {
      fingerprintId,
      generatedAt: new Date().toISOString(),
      rawEntropyBits: totalEntropyBits(signals),
      effectiveEntropyBits: effectiveEntropyBits(signals),
      signals: sortSignals(signals).map(signal => ({
        id: signal.id,
        label: signal.label,
        group: signal.group,
        importance: signal.importance,
        entropyBits: signal.entropyBits,
        stable: signal.stable,
        value: signal.value,
      })),
    },
    null,
    2
  );
}

type UserAgentBrand = { brand: string; version: string };

type UserAgentDataLike = {
  brands?: UserAgentBrand[];
  mobile?: boolean;
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<Record<string, unknown>>;
};

type NetworkInformationLike = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string;
};

type BatteryManagerLike = {
  charging: boolean;
  level: number;
};

type ExtendedNavigator = Navigator & {
  deviceMemory?: number;
  userAgentData?: UserAgentDataLike;
  connection?: NetworkInformationLike;
  globalPrivacyControl?: boolean;
  getBattery?: () => Promise<BatteryManagerLike>;
};

type OfflineAudioContextCtor = new (
  channels: number,
  length: number,
  sampleRate: number
) => OfflineAudioContext;

function readNavigator(): ExtendedNavigator | null {
  return typeof navigator === 'undefined' ? null : (navigator as ExtendedNavigator);
}

function text(value: unknown): string {
  if (value === undefined || value === null) return UNAVAILABLE;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : UNAVAILABLE;
  const asString = String(value);
  return asString.trim().length > 0 ? asString : UNAVAILABLE;
}

export function canvasFingerprintSource(): string | null {
  if (typeof document === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 70;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.fillStyle = '#f60';
    ctx.fillRect(120, 4, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('IQVerse canvas probe \u{1f9ec}', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.65)';
    ctx.fillText('IQVerse canvas probe \u{1f9ec}', 4, 21);
    ctx.globalCompositeOperation = 'multiply';
    ctx.beginPath();
    ctx.arc(52, 48, 18, 0, Math.PI * 2, true);
    ctx.fillStyle = '#f9c';
    ctx.fill();

    return canvas.toDataURL();
  } catch {
    return null;
  }
}

export interface WebglReport {
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
  maxTextureSize: number;
  maxViewportDims: string;
  antialias: boolean;
  extensions: string[];
}

export function readWebgl(): WebglReport | null {
  if (typeof document === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ??
      canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return null;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const viewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array | null;

    return {
      vendor: text(
        debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR)
      ),
      renderer: text(
        debugInfo
          ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          : gl.getParameter(gl.RENDERER)
      ),
      version: text(gl.getParameter(gl.VERSION)),
      shadingLanguageVersion: text(gl.getParameter(gl.SHADING_LANGUAGE_VERSION)),
      maxTextureSize: Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 0,
      maxViewportDims: viewportDims ? `${viewportDims[0]}x${viewportDims[1]}` : UNAVAILABLE,
      antialias: gl.getContextAttributes()?.antialias ?? false,
      extensions: (gl.getSupportedExtensions() ?? []).sort((a, b) => a.localeCompare(b)),
    };
  } catch {
    return null;
  }
}

export async function audioFingerprint(): Promise<number | null> {
  const scope = globalThis as typeof globalThis & {
    OfflineAudioContext?: OfflineAudioContextCtor;
    webkitOfflineAudioContext?: OfflineAudioContextCtor;
  };
  const Ctor = scope.OfflineAudioContext ?? scope.webkitOfflineAudioContext;
  if (!Ctor) return null;

  try {
    const context = new Ctor(1, 5000, 44100);
    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    const rendered = await context.startRendering();
    const channel = rendered.getChannelData(0);

    let sum = 0;
    for (let i = 4500; i < 5000; i += 1) sum += Math.abs(channel[i]);
    return sum;
  } catch {
    return null;
  }
}

export const FONT_PROBES = [
  'Arial',
  'Arial Black',
  'Arial Narrow',
  'Arial Rounded MT Bold',
  'Bahnschrift',
  'Bookman Old Style',
  'Calibri',
  'Cambria',
  'Candara',
  'Century Gothic',
  'Comic Sans MS',
  'Consolas',
  'Constantia',
  'Corbel',
  'Courier New',
  'DejaVu Sans',
  'Droid Sans',
  'Ebrima',
  'Franklin Gothic Medium',
  'Gabriola',
  'Gadugi',
  'Garamond',
  'Geneva',
  'Georgia',
  'Helvetica',
  'Helvetica Neue',
  'Impact',
  'Ink Free',
  'Javanese Text',
  'Leelawadee UI',
  'Lucida Console',
  'Lucida Grande',
  'Lucida Sans Unicode',
  'MS Gothic',
  'MS PGothic',
  'MV Boli',
  'Malgun Gothic',
  'Marlett',
  'Menlo',
  'Microsoft Sans Serif',
  'Monaco',
  'Nirmala UI',
  'Noto Sans',
  'Optima',
  'Palatino Linotype',
  'Papyrus',
  'Roboto',
  'Rockwell',
  'Sathu',
  'Segoe Print',
  'Segoe Script',
  'Segoe UI',
  'Segoe UI Emoji',
  'SimSun',
  'Sylfaen',
  'Symbol',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Ubuntu',
  'Verdana',
  'Webdings',
  'Wingdings',
  'Yu Gothic',
];

const BASE_FONTS = ['monospace', 'sans-serif', 'serif'];

export function detectFonts(candidates: string[] = FONT_PROBES): string[] {
  if (typeof document === 'undefined' || !document.body) return [];

  const probe = document.createElement('span');
  probe.textContent = 'mmmmmmmmmmlli';
  probe.style.position = 'absolute';
  probe.style.left = '-9999px';
  probe.style.top = '-9999px';
  probe.style.fontSize = '72px';
  probe.style.lineHeight = 'normal';
  probe.style.visibility = 'hidden';
  document.body.appendChild(probe);

  try {
    const baseline = new Map<string, { width: number; height: number }>();
    for (const base of BASE_FONTS) {
      probe.style.fontFamily = base;
      baseline.set(base, { width: probe.offsetWidth, height: probe.offsetHeight });
    }

    return candidates.filter(font =>
      BASE_FONTS.some(base => {
        const reference = baseline.get(base);
        if (!reference || (reference.width === 0 && reference.height === 0)) return false;
        probe.style.fontFamily = `"${font}",${base}`;
        return probe.offsetWidth !== reference.width || probe.offsetHeight !== reference.height;
      })
    );
  } finally {
    probe.remove();
  }
}

export function mathFingerprint(): string {
  const probes: Array<[string, number]> = [
    ['acos', Math.acos(0.123456789)],
    ['asinh', Math.asinh(1e300)],
    ['atanh', Math.atanh(0.5)],
    ['cosh', Math.cosh(10)],
    ['expm1', Math.expm1(1)],
    ['sinh', Math.sinh(1)],
    ['tan', Math.tan(-1e300)],
    ['pow', 2 ** 1023.5],
  ];
  return probes.map(([name, value]) => `${name}:${value}`).join(';');
}

export function detectWebrtcHosts(timeoutMs = 1500): Promise<string[]> {
  if (typeof RTCPeerConnection === 'undefined') return Promise.resolve([]);

  return new Promise<string[]>(resolve => {
    const found = new Set<string>();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let connection: RTCPeerConnection;

    try {
      connection = new RTCPeerConnection({ iceServers: [] });
    } catch {
      resolve([]);
      return;
    }

    const finish = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      try {
        connection.close();
      } catch {
        /* already closed */
      }
      resolve([...found]);
    };

    timer = setTimeout(finish, timeoutMs);

    connection.onicecandidate = event => {
      if (!event.candidate) {
        finish();
        return;
      }
      const match =
        /([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\.local|\d{1,3}(?:\.\d{1,3}){3}|[0-9a-f]{1,4}(?::[0-9a-f]{0,4}){2,7})/i.exec(
          event.candidate.candidate
        );
      if (match) found.add(match[1]);
    };

    connection.createDataChannel('iqverse');
    connection
      .createOffer()
      .then(offer => connection.setLocalDescription(offer))
      .catch(finish);
  });
}

function mediaQuery(query: string): string {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return UNAVAILABLE;
  return window.matchMedia(query).matches ? 'Yes' : 'No';
}

function firstMatchingMedia(feature: string, values: string[]): string {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return UNAVAILABLE;
  const hit = values.find(value => window.matchMedia(`(${feature}: ${value})`).matches);
  return hit ?? UNAVAILABLE;
}

function codecSupport(): string {
  if (typeof document === 'undefined') return UNAVAILABLE;

  const video = document.createElement('video');
  if (typeof video.canPlayType !== 'function') return UNAVAILABLE;

  const codecs: Array<[string, string]> = [
    ['H.264', 'video/mp4; codecs="avc1.42E01E"'],
    ['HEVC', 'video/mp4; codecs="hvc1.1.6.L93.B0"'],
    ['VP9', 'video/webm; codecs="vp9"'],
    ['AV1', 'video/mp4; codecs="av01.0.08M.08"'],
    ['Opus', 'audio/webm; codecs="opus"'],
    ['AAC', 'audio/mp4; codecs="mp4a.40.2"'],
    ['FLAC', 'audio/flac'],
    ['Ogg', 'audio/ogg; codecs="vorbis"'],
  ];

  const supported = codecs
    .filter(([, type]) => video.canPlayType(type) !== '')
    .map(([name]) => name);

  return supported.length > 0 ? supported.join(', ') : 'None';
}

function apiSupport(): string {
  const scope = globalThis as Record<string, unknown>;
  const navigatorRef = readNavigator();

  const checks: Array<[string, boolean]> = [
    ['WebAssembly', typeof scope.WebAssembly !== 'undefined'],
    ['WebGPU', navigatorRef !== null && 'gpu' in navigatorRef],
    ['SharedArrayBuffer', typeof scope.SharedArrayBuffer !== 'undefined'],
    ['WebAuthn', typeof scope.PublicKeyCredential !== 'undefined'],
    ['Bluetooth', navigatorRef !== null && 'bluetooth' in navigatorRef],
    ['USB', navigatorRef !== null && 'usb' in navigatorRef],
    ['Serial', navigatorRef !== null && 'serial' in navigatorRef],
    ['HID', navigatorRef !== null && 'hid' in navigatorRef],
    ['Payment Request', typeof scope.PaymentRequest !== 'undefined'],
    ['Service Worker', navigatorRef !== null && 'serviceWorker' in navigatorRef],
    ['Speech Synthesis', typeof scope.speechSynthesis !== 'undefined'],
    ['Broadcast Channel', typeof scope.BroadcastChannel !== 'undefined'],
  ];

  const supported = checks.filter(([, ok]) => ok).map(([name]) => name);
  return supported.length > 0 ? supported.join(', ') : 'None';
}

function storageSupport(): string {
  const scope = globalThis as Record<string, unknown>;
  const results: string[] = [];

  for (const name of ['localStorage', 'sessionStorage'] as const) {
    try {
      const store = scope[name] as Storage | undefined;
      if (!store) continue;
      store.setItem('__iqverse_probe__', '1');
      store.removeItem('__iqverse_probe__');
      results.push(name);
    } catch {
      /* blocked by privacy settings */
    }
  }

  if (typeof scope.indexedDB !== 'undefined') results.push('indexedDB');
  if (typeof scope.caches !== 'undefined') results.push('cacheStorage');

  return results.length > 0 ? results.join(', ') : 'All blocked';
}

async function readMediaDevices(): Promise<string> {
  const navigatorRef = readNavigator();
  if (!navigatorRef?.mediaDevices?.enumerateDevices) return UNAVAILABLE;

  try {
    const devices = await navigatorRef.mediaDevices.enumerateDevices();
    const counts = new Map<string, number>();
    for (const device of devices) counts.set(device.kind, (counts.get(device.kind) ?? 0) + 1);
    if (counts.size === 0) return 'None exposed';
    return [...counts].map(([kind, count]) => `${count} ${kind}`).join(', ');
  } catch {
    return UNAVAILABLE;
  }
}

async function readStorageQuota(): Promise<string> {
  const navigatorRef = readNavigator();
  if (!navigatorRef?.storage?.estimate) return UNAVAILABLE;

  try {
    const estimate = await navigatorRef.storage.estimate();
    if (estimate.quota === undefined) return UNAVAILABLE;
    return `${formatBytes(estimate.quota)} quota, ${formatBytes(estimate.usage ?? 0)} used`;
  } catch {
    return UNAVAILABLE;
  }
}

async function readBattery(): Promise<string> {
  const navigatorRef = readNavigator();
  if (!navigatorRef?.getBattery) return UNAVAILABLE;

  try {
    const battery = await navigatorRef.getBattery();
    return `${Math.round(battery.level * 100)}%, ${battery.charging ? 'charging' : 'on battery'}`;
  } catch {
    return UNAVAILABLE;
  }
}

const PERMISSION_PROBES = [
  'geolocation',
  'notifications',
  'camera',
  'microphone',
  'clipboard-read',
  'persistent-storage',
];

async function readPermissions(): Promise<string> {
  const navigatorRef = readNavigator();
  if (!navigatorRef?.permissions?.query) return UNAVAILABLE;

  const states = await Promise.all(
    PERMISSION_PROBES.map(async name => {
      try {
        const status = await navigatorRef.permissions.query({ name } as PermissionDescriptor);
        return `${name}: ${status.state}`;
      } catch {
        return null;
      }
    })
  );

  const known = states.filter((entry): entry is string => entry !== null);
  return known.length > 0 ? known.join(', ') : UNAVAILABLE;
}

async function readHighEntropyUserAgent(): Promise<string> {
  const data = readNavigator()?.userAgentData;
  if (!data?.getHighEntropyValues) return UNAVAILABLE;

  try {
    const values = await data.getHighEntropyValues([
      'architecture',
      'bitness',
      'model',
      'platformVersion',
      'uaFullVersion',
    ]);
    const parts = ['architecture', 'bitness', 'platformVersion', 'uaFullVersion', 'model']
      .map(key => (values[key] ? `${key}: ${String(values[key])}` : null))
      .filter((entry): entry is string => entry !== null);
    return parts.length > 0 ? parts.join(', ') : UNAVAILABLE;
  } catch {
    return UNAVAILABLE;
  }
}

function speechVoices(): string {
  const scope = globalThis as typeof globalThis & { speechSynthesis?: SpeechSynthesis };
  if (!scope.speechSynthesis?.getVoices) return UNAVAILABLE;

  try {
    const voices = scope.speechSynthesis.getVoices();
    if (voices.length === 0) return UNAVAILABLE;
    return `${voices.length} voices (${voices[0].name})`;
  } catch {
    return UNAVAILABLE;
  }
}

function pluginList(): string {
  const navigatorRef = readNavigator();
  if (!navigatorRef?.plugins || navigatorRef.plugins.length === 0) return 'None';
  return Array.from(navigatorRef.plugins)
    .map(plugin => plugin.name)
    .join(', ');
}

function intlSettings(): string {
  try {
    const resolved = new Intl.DateTimeFormat().resolvedOptions();
    return `${resolved.locale}, ${resolved.calendar}, ${resolved.numberingSystem}`;
  } catch {
    return UNAVAILABLE;
  }
}

export async function collectSignals(): Promise<Signal[]> {
  const navigatorRef = readNavigator();
  const screenRef = typeof screen === 'undefined' ? null : screen;
  const windowRef = typeof window === 'undefined' ? null : window;

  const canvasSource = canvasFingerprintSource();
  const webgl = readWebgl();
  const fonts = detectFonts();

  const [audio, canvasHash, webglHash, mathHash, webrtcHosts, mediaDevices, quota, battery, permissions, uaHighEntropy] =
    await Promise.all([
      audioFingerprint(),
      canvasSource ? hashText(canvasSource, 16) : Promise.resolve(null),
      webgl
        ? hashText(
            [webgl.version, webgl.shadingLanguageVersion, webgl.maxViewportDims, webgl.extensions.join(',')].join('|'),
            16
          )
        : Promise.resolve(null),
      hashText(mathFingerprint(), 16),
      detectWebrtcHosts(),
      readMediaDevices(),
      readStorageQuota(),
      readBattery(),
      readPermissions(),
      readHighEntropyUserAgent(),
    ]);

  const signals: Signal[] = [
    {
      id: 'canvas-hash',
      label: 'Canvas rendering hash',
      group: 'Fingerprint Hashes',
      importance: 'critical',
      entropyBits: 8.3,
      value: text(canvasHash),
      note: 'Text and shapes rasterize differently per GPU, driver and font stack. One of the strongest single identifiers.',
      stable: true,
    },
    {
      id: 'webgl-renderer',
      label: 'GPU renderer',
      group: 'Fingerprint Hashes',
      importance: 'critical',
      entropyBits: 7,
      value: text(webgl?.renderer),
      note: 'Exposes the exact graphics card and driver through WEBGL_debug_renderer_info.',
      stable: true,
    },
    {
      id: 'font-list',
      label: 'Installed fonts',
      group: 'Fingerprint Hashes',
      importance: 'critical',
      entropyBits: 8.5,
      value: fonts.length > 0 ? `${fonts.length} detected: ${fonts.join(', ')}` : UNAVAILABLE,
      note: 'Measured by text width, no permission needed. Installed software leaks through the font set.',
      stable: true,
    },
    {
      id: 'user-agent',
      label: 'User agent string',
      group: 'Browser & Engine',
      importance: 'critical',
      entropyBits: 9,
      value: text(navigatorRef?.userAgent),
      note: 'Browser, engine and OS version in one string. Sent on every single request.',
      stable: true,
    },
    {
      id: 'audio-hash',
      label: 'Audio stack fingerprint',
      group: 'Fingerprint Hashes',
      importance: 'critical',
      entropyBits: 5.4,
      value: audio === null ? UNAVAILABLE : audio.toFixed(12),
      note: 'Floating point output of an offline oscillator and compressor. Varies by audio stack and CPU.',
      stable: true,
    },
    {
      id: 'webgl-hash',
      label: 'WebGL capability hash',
      group: 'Fingerprint Hashes',
      importance: 'critical',
      entropyBits: 6,
      value: text(webglHash),
      note: 'Digest of the supported extension list and driver limits.',
      stable: true,
    },
    {
      id: 'screen-resolution',
      label: 'Screen resolution',
      group: 'Display & Graphics',
      importance: 'high',
      entropyBits: 4.8,
      value: screenRef
        ? `${screenRef.width}x${screenRef.height} (available ${screenRef.availWidth}x${screenRef.availHeight})`
        : UNAVAILABLE,
      note: 'Monitor size plus the space taken by taskbars and docks.',
      stable: true,
    },
    {
      id: 'timezone',
      label: 'Time zone',
      group: 'Locale & Time',
      importance: 'high',
      entropyBits: 3.0,
      value: (() => {
        try {
          return `${Intl.DateTimeFormat().resolvedOptions().timeZone} (UTC${new Date().getTimezoneOffset() > 0 ? '-' : '+'}${Math.abs(new Date().getTimezoneOffset() / 60)})`;
        } catch {
          return UNAVAILABLE;
        }
      })(),
      note: 'Narrows you to a region and betrays VPN use when it disagrees with your IP.',
      stable: true,
    },
    {
      id: 'languages',
      label: 'Languages',
      group: 'Locale & Time',
      importance: 'high',
      entropyBits: 2.5,
      value: text(navigatorRef ? [...navigatorRef.languages] : null),
      note: 'The ordered accept-language list is more distinctive than the primary language alone.',
      stable: true,
    },
    {
      id: 'speech-voices',
      label: 'Speech synthesis voices',
      group: 'Capabilities',
      importance: 'high',
      entropyBits: 4,
      value: speechVoices(),
      note: 'Voice packs are installed per OS and per language, so the count alone is revealing.',
      stable: true,
    },
    {
      id: 'device-pixel-ratio',
      label: 'Device pixel ratio',
      group: 'Display & Graphics',
      importance: 'high',
      entropyBits: 2,
      value: text(windowRef?.devicePixelRatio),
      note: 'Combines display scaling with browser zoom level.',
      stable: true,
    },
    {
      id: 'cpu-cores',
      label: 'CPU cores',
      group: 'Hardware',
      importance: 'high',
      entropyBits: 2,
      value: text(navigatorRef?.hardwareConcurrency),
      note: 'Logical processor count reported by navigator.hardwareConcurrency.',
      stable: true,
    },
    {
      id: 'device-memory',
      label: 'Device memory',
      group: 'Hardware',
      importance: 'high',
      entropyBits: 1.5,
      value: navigatorRef?.deviceMemory ? `${navigatorRef.deviceMemory} GB` : UNAVAILABLE,
      note: 'Rounded RAM size. Chromium only, and capped at 8 GB.',
      stable: true,
    },
    {
      id: 'platform',
      label: 'Platform',
      group: 'Browser & Engine',
      importance: 'high',
      entropyBits: 1.5,
      value: text(navigatorRef?.userAgentData?.platform ?? navigatorRef?.platform),
      note: 'Operating system family reported to scripts.',
      stable: true,
    },
    {
      id: 'ua-high-entropy',
      label: 'Client hints (high entropy)',
      group: 'Browser & Engine',
      importance: 'high',
      entropyBits: 3,
      value: uaHighEntropy,
      note: 'CPU architecture, bitness and full OS version, handed over without a prompt.',
      stable: true,
    },
    {
      id: 'webrtc-hosts',
      label: 'WebRTC host candidates',
      group: 'Network',
      importance: 'high',
      entropyBits: 3,
      value: webrtcHosts.length > 0 ? webrtcHosts.join(', ') : UNAVAILABLE,
      note: 'ICE candidates can leak the local network address behind a VPN. Modern browsers mask them with .local names.',
      stable: false,
    },
    {
      id: 'gpu-vendor',
      label: 'GPU vendor',
      group: 'Display & Graphics',
      importance: 'medium',
      entropyBits: 1.5,
      value: text(webgl?.vendor),
      note: 'Graphics driver vendor string.',
      stable: true,
    },
    {
      id: 'webgl-extensions',
      label: 'WebGL extensions',
      group: 'Display & Graphics',
      importance: 'medium',
      entropyBits: 2,
      value: webgl ? `${webgl.extensions.length}: ${webgl.extensions.join(', ')}` : UNAVAILABLE,
      note: 'The exact extension set maps closely to a driver build.',
      stable: true,
    },
    {
      id: 'color-depth',
      label: 'Colour depth',
      group: 'Display & Graphics',
      importance: 'medium',
      entropyBits: 0.5,
      value: screenRef ? `${screenRef.colorDepth}-bit` : UNAVAILABLE,
      note: 'Bits per pixel of the display.',
      stable: true,
    },
    {
      id: 'color-gamut',
      label: 'Colour gamut',
      group: 'Display & Graphics',
      importance: 'medium',
      entropyBits: 1,
      value: firstMatchingMedia('color-gamut', ['rec2020', 'p3', 'srgb']),
      note: 'Wide gamut panels separate recent hardware from older screens.',
      stable: true,
    },
    {
      id: 'dynamic-range',
      label: 'Dynamic range',
      group: 'Display & Graphics',
      importance: 'medium',
      entropyBits: 0.5,
      value: firstMatchingMedia('dynamic-range', ['high', 'standard']),
      note: 'Reports HDR capable displays.',
      stable: true,
    },
    {
      id: 'touch-points',
      label: 'Max touch points',
      group: 'Hardware',
      importance: 'medium',
      entropyBits: 1,
      value: text(navigatorRef?.maxTouchPoints),
      note: 'Separates touchscreens from desktops, and often contradicts a spoofed user agent.',
      stable: true,
    },
    {
      id: 'media-devices',
      label: 'Media devices',
      group: 'Hardware',
      importance: 'medium',
      entropyBits: 2.5,
      value: mediaDevices,
      note: 'Camera, microphone and speaker counts are readable without granting access.',
      stable: true,
    },
    {
      id: 'math-hash',
      label: 'Math engine hash',
      group: 'Fingerprint Hashes',
      importance: 'medium',
      entropyBits: 1.5,
      value: text(mathHash),
      note: 'Transcendental functions round differently across engines and CPU architectures.',
      stable: true,
    },
    {
      id: 'codecs',
      label: 'Media codecs',
      group: 'Capabilities',
      importance: 'medium',
      entropyBits: 2,
      value: codecSupport(),
      note: 'Licensed codecs like HEVC are only present on some builds and platforms.',
      stable: true,
    },
    {
      id: 'api-support',
      label: 'Web API support',
      group: 'Capabilities',
      importance: 'medium',
      entropyBits: 2,
      value: apiSupport(),
      note: 'The set of available APIs pins down the browser family and version range.',
      stable: true,
    },
    {
      id: 'permissions',
      label: 'Permission states',
      group: 'Privacy Signals',
      importance: 'medium',
      entropyBits: 1.5,
      value: permissions,
      note: 'Queried without prompting. Granted or denied states are unusual and therefore distinctive.',
      stable: false,
    },
    {
      id: 'storage-quota',
      label: 'Storage quota',
      group: 'Capabilities',
      importance: 'medium',
      entropyBits: 1.5,
      value: quota,
      note: 'Derived from free disk space. A much smaller quota often means a private window.',
      stable: false,
    },
    {
      id: 'storage-support',
      label: 'Storage backends',
      group: 'Capabilities',
      importance: 'medium',
      entropyBits: 0.5,
      value: storageSupport(),
      note: 'Blocked storage backends indicate hardened privacy settings.',
      stable: true,
    },
    {
      id: 'viewport',
      label: 'Viewport size',
      group: 'Display & Graphics',
      importance: 'medium',
      entropyBits: 3,
      value: windowRef ? `${windowRef.innerWidth}x${windowRef.innerHeight}` : UNAVAILABLE,
      note: 'Highly distinctive but changes whenever the window is resized.',
      stable: false,
    },
    {
      id: 'intl',
      label: 'Intl defaults',
      group: 'Locale & Time',
      importance: 'medium',
      entropyBits: 1.5,
      value: intlSettings(),
      note: 'Resolved locale, calendar and numbering system.',
      stable: true,
    },
    {
      id: 'plugins',
      label: 'Plugins',
      group: 'Browser & Engine',
      importance: 'low',
      entropyBits: 1,
      value: pluginList(),
      note: 'Modern browsers report a fixed PDF viewer list, so this carries little weight now.',
      stable: true,
    },
    {
      id: 'vendor',
      label: 'Browser vendor',
      group: 'Browser & Engine',
      importance: 'low',
      entropyBits: 0.5,
      value: text(navigatorRef?.vendor),
      note: 'Legacy vendor string, still used to distinguish engines.',
      stable: true,
    },
    {
      id: 'brands',
      label: 'User agent brands',
      group: 'Browser & Engine',
      importance: 'low',
      entropyBits: 1,
      value: text(
        navigatorRef?.userAgentData?.brands?.map(brand => `${brand.brand} ${brand.version}`)
      ),
      note: 'Client hint replacement for the user agent string.',
      stable: true,
    },
    {
      id: 'screen-orientation',
      label: 'Screen orientation',
      group: 'Display & Graphics',
      importance: 'low',
      entropyBits: 0.5,
      value: text(screenRef?.orientation?.type),
      note: 'Portrait or landscape lock state.',
      stable: false,
    },
    {
      id: 'prefers-color-scheme',
      label: 'Preferred colour scheme',
      group: 'Privacy Signals',
      importance: 'low',
      entropyBits: 1,
      value: mediaQuery('(prefers-color-scheme: dark)') === 'Yes' ? 'Dark' : 'Light',
      note: 'OS theme preference, readable from CSS alone.',
      stable: false,
    },
    {
      id: 'reduced-motion',
      label: 'Reduced motion',
      group: 'Privacy Signals',
      importance: 'low',
      entropyBits: 0.6,
      value: mediaQuery('(prefers-reduced-motion: reduce)'),
      note: 'An accessibility setting that is rare enough to narrow a crowd.',
      stable: false,
    },
    {
      id: 'forced-colors',
      label: 'Forced colours',
      group: 'Privacy Signals',
      importance: 'low',
      entropyBits: 0.5,
      value: mediaQuery('(forced-colors: active)'),
      note: 'High contrast mode, another rare accessibility flag.',
      stable: false,
    },
    {
      id: 'do-not-track',
      label: 'Do Not Track',
      group: 'Privacy Signals',
      importance: 'low',
      entropyBits: 0.5,
      value: text(navigatorRef?.doNotTrack ?? 'unset'),
      note: 'Ignored by most sites and mildly counterproductive: enabling it makes you rarer.',
      stable: true,
    },
    {
      id: 'gpc',
      label: 'Global Privacy Control',
      group: 'Privacy Signals',
      importance: 'low',
      entropyBits: 0.5,
      value: text(navigatorRef?.globalPrivacyControl ?? 'unset'),
      note: 'Legally binding opt out signal in some jurisdictions.',
      stable: true,
    },
    {
      id: 'cookies-enabled',
      label: 'Cookies enabled',
      group: 'Privacy Signals',
      importance: 'low',
      entropyBits: 0.2,
      value: text(navigatorRef?.cookieEnabled),
      note: 'First party cookie acceptance.',
      stable: true,
    },
    {
      id: 'webdriver',
      label: 'Automation flag',
      group: 'Privacy Signals',
      importance: 'low',
      entropyBits: 0.3,
      value: text(navigatorRef?.webdriver ?? false),
      note: 'navigator.webdriver marks browsers under automation control.',
      stable: true,
    },
    {
      id: 'network',
      label: 'Network conditions',
      group: 'Network',
      importance: 'low',
      entropyBits: 1,
      value: (() => {
        const connection = navigatorRef?.connection;
        if (!connection) return UNAVAILABLE;
        const parts = [
          connection.effectiveType ? `type ${connection.effectiveType}` : null,
          connection.downlink !== undefined ? `${connection.downlink} Mbps` : null,
          connection.rtt !== undefined ? `${connection.rtt} ms RTT` : null,
          connection.saveData ? 'data saver on' : null,
        ].filter((entry): entry is string => entry !== null);
        return parts.length > 0 ? parts.join(', ') : UNAVAILABLE;
      })(),
      note: 'Coarse connection quality. Changes constantly, so it is weak for linking sessions.',
      stable: false,
    },
    {
      id: 'battery',
      label: 'Battery status',
      group: 'Hardware',
      importance: 'low',
      entropyBits: 1,
      value: battery,
      note: 'Level and charging state were once used to link sessions across tabs within minutes.',
      stable: false,
    },
  ];

  return sortSignals(signals);
}
