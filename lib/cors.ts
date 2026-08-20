export interface CorsPreset {
  name: string;
  url: string;
  method: string;
  origin: string;
}

export interface CorsPresetMap {
  [key: string]: any;
}

export const CORS_PRESETS: CorsPreset[] & {
  publicApi: Record<string, string>;
  authenticatedApi: Record<string, string>;
} = Object.assign(
  [
    {
      name: 'GitHub API',
      url: 'https://api.github.com/zen',
      method: 'GET',
      origin: 'https://iqverse.net',
    },
    {
      name: 'JSONPlaceholder',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'GET',
      origin: 'http://localhost:3000',
    },
    {
      name: 'HTTPBin GET',
      url: 'https://httpbin.org/get',
      method: 'GET',
      origin: 'https://example.com',
    },
    {
      name: 'HTTPBin POST',
      url: 'https://httpbin.org/post',
      method: 'POST',
      origin: 'https://iqverse.net',
    },
  ],
  {
    publicApi: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization',
    },
    authenticatedApi: {
      'access-control-allow-origin': 'https://app.iqverse.net',
      'access-control-allow-credentials': 'true',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
  }
);

export interface CorsAnalysisNote {
  icon: string;
  text: string;
  type: 'success' | 'danger' | 'info';
}

export interface CorsCheckItem {
  label: string;
  pass: boolean;
  note?: string;
}

export interface CorsEvaluationResult {
  isAllowed: boolean;
  allowed: boolean;
  allowsOrigin: boolean;
  isWildcard: boolean;
  allowsCredentials?: boolean;
  isWarning: boolean;
  notes: CorsAnalysisNote[];
  checks: CorsCheckItem[];
  allowedOrigin?: string;
  allowedMethods?: string;
  allowedHeaders?: string;
  allowedCredentials?: string;
  maxAge?: string;
  exposeHeaders?: string;
}

export function parseCustomHeaders(
  rawHeaders: string,
  originHeader?: string
): Record<string, string> {
  const result: Record<string, string> = {};

  if (originHeader) {
    result['origin'] = originHeader;
  }

  const trimmed = rawHeaders.trim();
  if (!trimmed) return result;

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null) {
        for (const [key, val] of Object.entries(parsed)) {
          result[key.toLowerCase()] = String(val);
        }
        return result;
      }
    } catch {
      // Fallback to line parsing
    }
  }

  const parts = trimmed.includes('\n') ? trimmed.split(/\r?\n/) : trimmed.split(',');

  parts.forEach((part) => {
    const colonIndex = part.indexOf(':');
    if (colonIndex > -1) {
      const key = part.slice(0, colonIndex).trim().toLowerCase();
      const val = part.slice(colonIndex + 1).trim();
      if (key) {
        result[key] = val;
      }
    }
  });

  return result;
}

export function evaluateCorsHeaders(
  headers: Record<string, string>,
  simulatedOrigin: string
): CorsEvaluationResult {
  const normalized: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    normalized[k.toLowerCase()] = v;
  }

  const allowedOrigin = normalized['access-control-allow-origin'];
  const allowedMethods = normalized['access-control-allow-methods'];
  const allowedHeaders = normalized['access-control-allow-headers'];
  const allowedCredentials = normalized['access-control-allow-credentials'];
  const maxAge = normalized['access-control-max-age'];
  const exposeHeaders = normalized['access-control-expose-headers'];

  let isAllowed = false;
  let isWarning = false;
  const isWildcard = allowedOrigin === '*';
  const allowsOrigin = allowedOrigin === '*' || allowedOrigin === simulatedOrigin;
  const allowsCredentials = allowedCredentials === 'true';

  const notes: CorsAnalysisNote[] = [];
  const checks: CorsCheckItem[] = [];

  if (allowsOrigin) {
    isAllowed = true;
    notes.push({
      icon: '✓',
      text: `Origin allowed: Server returned Access-Control-Allow-Origin: "${allowedOrigin}".`,
      type: 'success',
    });
    checks.push({ label: 'Allow-Origin', pass: true, note: `Matched ${allowedOrigin}` });
  } else if (allowedOrigin) {
    notes.push({
      icon: '✕',
      text: `Origin mismatch: Server returned "${allowedOrigin}", but simulated origin was "${simulatedOrigin}".`,
      type: 'danger',
    });
    checks.push({ label: 'Allow-Origin', pass: false, note: 'Origin mismatch' });
  } else {
    notes.push({
      icon: '✕',
      text: 'Missing Access-Control-Allow-Origin header in response. Cross-origin browser requests will be blocked.',
      type: 'danger',
    });
    checks.push({ label: 'Allow-Origin', pass: false, note: 'Missing header' });
  }

  if (allowedCredentials === 'true') {
    notes.push({
      icon: 'ℹ',
      text: 'Access-Control-Allow-Credentials is true (Cookies and Authorization headers allowed).',
      type: 'info',
    });
    if (allowedOrigin === '*') {
      isAllowed = false;
      isWarning = true;
      notes.push({
        icon: '⚠️',
        text: 'CORS Security Violation: Wildcard origin ("*") cannot be combined with Credentials=true according to the Fetch specification.',
        type: 'danger',
      });
      checks.push({ label: 'Credentials & Wildcard Check', pass: false });
    } else {
      checks.push({ label: 'Credentials Check', pass: true });
    }
  }

  if (allowedMethods) {
    notes.push({
      icon: '✓',
      text: `Allowed Methods: ${allowedMethods}`,
      type: 'info',
    });
    checks.push({ label: 'Methods Allowed', pass: true });
  }

  if (allowedHeaders) {
    notes.push({
      icon: '✓',
      text: `Allowed Request Headers: ${allowedHeaders}`,
      type: 'info',
    });
  }

  if (maxAge) {
    notes.push({
      icon: 'ℹ',
      text: `Preflight Cache Max-Age: ${maxAge} seconds.`,
      type: 'info',
    });
  }

  if (exposeHeaders) {
    notes.push({
      icon: 'ℹ',
      text: `Exposed Headers to Client JavaScript: ${exposeHeaders}`,
      type: 'info',
    });
  }

  return {
    isAllowed,
    allowed: isAllowed,
    allowsOrigin,
    isWildcard,
    allowsCredentials,
    isWarning,
    notes,
    checks,
    allowedOrigin,
    allowedMethods,
    allowedHeaders,
    allowedCredentials,
    maxAge,
    exposeHeaders,
  };
}

export function evaluateCorsResponse(
  arg1: string | Record<string, string>,
  arg2: string | Record<string, string>
): CorsEvaluationResult {
  if (typeof arg1 === 'string' && typeof arg2 === 'object') {
    return evaluateCorsHeaders(arg2, arg1);
  }
  return evaluateCorsHeaders(arg1 as Record<string, string>, arg2 as string);
}
