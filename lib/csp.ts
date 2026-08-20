export interface CspDirectiveConfig {
  name: string;
  self?: boolean;
  unsafeInline?: boolean;
  unsafeEval?: boolean;
  https?: boolean;
  data?: boolean;
  custom?: string;
  values?: string[];
}

export const INITIAL_CSP_DIRECTIVES: CspDirectiveConfig[] = [
  { name: 'default-src', self: true, unsafeInline: false, unsafeEval: false, https: false, data: false, custom: '' },
  { name: 'script-src', self: true, unsafeInline: false, unsafeEval: false, https: false, data: false, custom: 'https://cdn.jsdelivr.net' },
  { name: 'style-src', self: true, unsafeInline: true, unsafeEval: false, https: false, data: false, custom: 'https://fonts.googleapis.com' },
  { name: 'img-src', self: true, unsafeInline: false, unsafeEval: false, https: true, data: true, custom: '' },
  { name: 'connect-src', self: true, unsafeInline: false, unsafeEval: false, https: true, data: false, custom: 'https://api.iqverse.net' },
  { name: 'font-src', self: true, unsafeInline: false, unsafeEval: false, https: false, data: true, custom: 'https://fonts.gstatic.com' },
  { name: 'object-src', self: false, unsafeInline: false, unsafeEval: false, https: false, data: false, custom: "'none'" },
  { name: 'base-uri', self: true, unsafeInline: false, unsafeEval: false, https: false, data: false, custom: '' },
  { name: 'form-action', self: true, unsafeInline: false, unsafeEval: false, https: false, data: false, custom: '' },
];

export interface CspBuildResult {
  headerValue: string;
  metaTag: string;
  warnings: string[];
}

export function buildCspHeader(
  directives: CspDirectiveConfig[] | Record<string, string[]>,
  upgradeInsecureRequests: boolean = false
): string {
  const parts: string[] = [];

  if (upgradeInsecureRequests) {
    parts.push('upgrade-insecure-requests');
  }

  if (Array.isArray(directives)) {
    directives.forEach((d) => {
      const tokens: string[] = [];
      if (d.values && Array.isArray(d.values)) {
        tokens.push(...d.values);
      } else {
        if (d.self) tokens.push("'self'");
        if (d.unsafeInline) tokens.push("'unsafe-inline'");
        if (d.unsafeEval) tokens.push("'unsafe-eval'");
        if (d.https) tokens.push('https:');
        if (d.data) tokens.push('data:');
        if (d.custom && d.custom.trim()) tokens.push(d.custom.trim());
      }

      if (tokens.length > 0) {
        parts.push(`${d.name} ${tokens.join(' ')}`);
      }
    });
  } else {
    Object.entries(directives).forEach(([name, tokens]) => {
      if (tokens.length > 0) {
        parts.push(`${name} ${tokens.join(' ')}`);
      }
    });
  }

  return parts.join('; ');
}

export function generateCspMetaTag(
  directivesOrHeader: CspDirectiveConfig[] | Record<string, string[]> | string
): string {
  const header = typeof directivesOrHeader === 'string'
    ? directivesOrHeader
    : buildCspHeader(directivesOrHeader, false);
  return `<meta http-equiv="Content-Security-Policy" content="${header}">`;
}

export function analyzeCspSecurity(
  directives: Record<string, string[]> | CspDirectiveConfig[]
): string[] & {
  rating: 'safe' | 'warning' | 'critical';
  warnings: string[];
} {
  const warnings: string[] = [];

  if (Array.isArray(directives)) {
    const scriptSrc = directives.find((d) => d.name === 'script-src');
    const defaultSrc = directives.find((d) => d.name === 'default-src');

    const scriptTokens = scriptSrc?.values || [];
    if (scriptSrc?.unsafeInline || scriptTokens.includes("'unsafe-inline'")) {
      warnings.push("'unsafe-inline' detected in script-src");
    }
    if (scriptSrc?.unsafeEval || scriptTokens.includes("'unsafe-eval'")) {
      warnings.push("'unsafe-eval' detected in script-src");
    }
    if (scriptTokens.includes('*')) {
      warnings.push('Wildcard * in script-src');
    }
    if (!defaultSrc && !scriptSrc) {
      warnings.push('Missing default-src fallback directive');
    }
  } else {
    const scriptSrc = directives['script-src'] || directives['default-src'] || [];
    if (scriptSrc.includes("'unsafe-inline'")) {
      warnings.push("'unsafe-inline' detected in script-src");
    }
    if (scriptSrc.includes("'unsafe-eval'")) {
      warnings.push("'unsafe-eval' detected in script-src");
    }
    if (scriptSrc.includes('*')) {
      warnings.push('Wildcard * in script-src');
    }
    if (!directives['default-src']) {
      warnings.push('Missing default-src fallback directive');
    }
  }

  let rating: 'safe' | 'warning' | 'critical' = 'safe';
  if (warnings.length > 1) rating = 'critical';
  else if (warnings.length === 1) rating = 'warning';

  const res: any = [...warnings];
  res.rating = rating;
  res.warnings = warnings;

  return res;
}
