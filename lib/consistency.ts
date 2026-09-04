export type Severity = 'critical' | 'warning' | 'info';

export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#ff4d4f',
  warning: '#ff9800',
  info: '#faad14',
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Contradiction',
  warning: 'Suspicious',
  info: 'Notable',
};

export interface Inconsistency {
  id: string;
  label: string;
  detail: string;
  severity: Severity;
}

export type OperatingSystem =
  | 'Windows'
  | 'macOS'
  | 'Linux'
  | 'Android'
  | 'iOS'
  | 'Chrome OS'
  | 'Unknown';

export function osFromUserAgent(userAgent: string): OperatingSystem {
  if (/CrOS/i.test(userAgent)) return 'Chrome OS';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
  if (/Windows|Win64|Win32/i.test(userAgent)) return 'Windows';
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'macOS';
  if (/Linux|X11|Ubuntu/i.test(userAgent)) return 'Linux';
  return 'Unknown';
}

export function osFromPlatform(platform: string): OperatingSystem {
  const value = platform.trim();
  if (!value) return 'Unknown';
  if (/^CrOS|Chrome OS/i.test(value)) return 'Chrome OS';
  if (/^Android/i.test(value)) return 'Android';
  if (/^(iPhone|iPad|iPod|iOS)/i.test(value)) return 'iOS';
  if (/^Win|^Windows/i.test(value)) return 'Windows';
  if (/^Mac|^macOS/i.test(value)) return 'macOS';
  if (/^Linux|^X11/i.test(value)) return 'Linux';
  return 'Unknown';
}

export function primaryLanguage(tag: string): string {
  return tag.trim().toLowerCase().split(/[-_;]/)[0] ?? '';
}

export function primaryAcceptLanguage(header: string): string {
  const first = header.split(',')[0] ?? '';
  return primaryLanguage(first);
}

export function chromeMajorFromUserAgent(userAgent: string): number | null {
  const match = /(?:Chrome|CriOS)\/(\d+)/.exec(userAgent);
  return match ? Number(match[1]) : null;
}

/**
 * Reads the highest version from a Sec-CH-UA brand list, skipping the
 * deliberately bogus "Not;A=Brand" entries browsers pad the header with.
 */
export function chromeMajorFromClientHint(header: string): number | null {
  const versions = [...header.matchAll(/"([^"]+)";v="(\d+)/g)]
    .filter(match => !/not.?[)/;:]?a.?brand/i.test(match[1]))
    .map(match => Number(match[2]))
    .filter(version => Number.isFinite(version));

  return versions.length > 0 ? Math.max(...versions) : null;
}

export interface ConsistencyContext {
  userAgent: string;
  platform: string;
  maxTouchPoints: number | null;
  mobileHint: boolean | null;
  languages: string[];
  vendor: string;
  pluginCount: number;
  webdriver: boolean;
  screenWidth: number | null;
  innerWidth: number | null;
  serverUserAgent: string | null;
  acceptLanguage: string | null;
  secChUa: string | null;
  secChUaPlatform: string | null;
}

function stripQuotes(value: string): string {
  return value.replace(/^"|"$/g, '');
}

export function checkConsistency(context: ConsistencyContext): Inconsistency[] {
  const findings: Inconsistency[] = [];
  const uaOs = osFromUserAgent(context.userAgent);
  const platformOs = osFromPlatform(context.platform);

  if (uaOs !== 'Unknown' && platformOs !== 'Unknown' && uaOs !== platformOs) {
    findings.push({
      id: 'os-mismatch',
      label: 'User agent and platform name disagree',
      detail: `The user agent claims ${uaOs} while navigator.platform reports ${context.platform}, which maps to ${platformOs}. Genuine browsers never disagree here.`,
      severity: 'critical',
    });
  }

  if (context.secChUaPlatform) {
    const hintOs = osFromPlatform(stripQuotes(context.secChUaPlatform));
    if (uaOs !== 'Unknown' && hintOs !== 'Unknown' && hintOs !== uaOs) {
      findings.push({
        id: 'os-hint-mismatch',
        label: 'Client hint platform disagrees with the user agent',
        detail: `Sec-CH-UA-Platform says ${hintOs} but the user agent string claims ${uaOs}. A user agent switcher usually rewrites one and forgets the other.`,
        severity: 'critical',
      });
    }
  }

  const claimsMobile = context.mobileHint === true || /Mobile|Android|iPhone|iPod/i.test(context.userAgent);
  if (claimsMobile && context.maxTouchPoints === 0) {
    findings.push({
      id: 'mobile-no-touch',
      label: 'Mobile browser without a touchscreen',
      detail: 'The user agent describes a phone or tablet but maxTouchPoints is 0. Real mobile hardware always reports touch points.',
      severity: 'critical',
    });
  }

  if (context.serverUserAgent && context.serverUserAgent !== context.userAgent) {
    findings.push({
      id: 'ua-header-mismatch',
      label: 'Header and JavaScript user agents differ',
      detail: 'The User-Agent header the server received does not match navigator.userAgent. An extension is rewriting one of them.',
      severity: 'critical',
    });
  }

  if (context.acceptLanguage && context.languages.length > 0) {
    const headerLanguage = primaryAcceptLanguage(context.acceptLanguage);
    const scriptLanguage = primaryLanguage(context.languages[0]);
    if (headerLanguage && scriptLanguage && headerLanguage !== scriptLanguage) {
      findings.push({
        id: 'language-mismatch',
        label: 'Header and JavaScript languages disagree',
        detail: `Accept-Language leads with ${headerLanguage} but navigator.languages leads with ${scriptLanguage}. Sites read both, so spoofing one is worse than spoofing neither.`,
        severity: 'warning',
      });
    }
  }

  if (context.secChUa) {
    const uaVersion = chromeMajorFromUserAgent(context.userAgent);
    const hintVersion = chromeMajorFromClientHint(context.secChUa);
    if (uaVersion !== null && hintVersion !== null && uaVersion !== hintVersion) {
      findings.push({
        id: 'version-mismatch',
        label: 'Browser version differs between sources',
        detail: `The user agent says version ${uaVersion} while Sec-CH-UA says ${hintVersion}.`,
        severity: 'warning',
      });
    }
  }

  const isChromeUa = /Chrome\/|CriOS\//.test(context.userAgent) && !/Firefox\//.test(context.userAgent);
  if (isChromeUa && context.vendor && context.vendor !== 'Google Inc.') {
    findings.push({
      id: 'vendor-mismatch',
      label: 'Vendor string does not match a Chromium build',
      detail: `The user agent claims Chrome but navigator.vendor is "${context.vendor}" instead of "Google Inc.".`,
      severity: 'warning',
    });
  }

  if (/Firefox\//.test(context.userAgent) && context.vendor !== '') {
    findings.push({
      id: 'firefox-vendor',
      label: 'Firefox reporting a vendor string',
      detail: `Firefox leaves navigator.vendor empty, but this browser returns "${context.vendor}".`,
      severity: 'warning',
    });
  }

  if (isChromeUa && context.pluginCount === 0) {
    findings.push({
      id: 'chrome-no-plugins',
      label: 'Chromium build with an empty plugin list',
      detail: 'Chromium hardcodes a set of PDF viewer plugins. An empty list points to automation or a hardened profile.',
      severity: 'warning',
    });
  }

  if (context.webdriver) {
    findings.push({
      id: 'webdriver',
      label: 'Automation flag is set',
      detail: 'navigator.webdriver is true, so this browser is under WebDriver or CDP control.',
      severity: 'critical',
    });
  }

  if (
    context.screenWidth !== null &&
    context.innerWidth !== null &&
    context.innerWidth > context.screenWidth
  ) {
    findings.push({
      id: 'viewport-larger-than-screen',
      label: 'Viewport is wider than the screen',
      detail: `The window reports ${context.innerWidth}px of content inside a ${context.screenWidth}px screen. One of the two values is being faked.`,
      severity: 'warning',
    });
  }

  return findings;
}

export interface ConsistencySummary {
  findings: Inconsistency[];
  severity: Severity | null;
  headline: string;
  color: string;
}

export function summariseConsistency(findings: Inconsistency[]): ConsistencySummary {
  if (findings.length === 0) {
    return {
      findings,
      severity: null,
      headline: 'Every signal agrees with the others',
      color: '#4caf50',
    };
  }

  const severity: Severity = findings.some(finding => finding.severity === 'critical')
    ? 'critical'
    : findings.some(finding => finding.severity === 'warning')
      ? 'warning'
      : 'info';

  const headlines: Record<Severity, string> = {
    critical: 'Signals contradict each other',
    warning: 'Signals look inconsistent',
    info: 'Minor oddities in the signal set',
  };

  return {
    findings,
    severity,
    headline: headlines[severity],
    color: SEVERITY_COLORS[severity],
  };
}
