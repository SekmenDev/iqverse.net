export interface ParsedUrlParts {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  hash: string;
  searchParams: [string, string][];
  queryParams: string;
  href: string;
}

export function parseUrlString(candidate: string): ParsedUrlParts {
  const clean = candidate.trim();
  const url = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
  const searchParams = Array.from(url.searchParams.entries());
  const queryParams = searchParams.map(([k, v]) => `${k}=${v}`).join('\n');

  return {
    protocol: url.protocol,
    host: url.hostname,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    hash: url.hash,
    searchParams,
    queryParams,
    href: url.href,
  };
}

export function buildUrlString(parts: {
  protocol?: string;
  host?: string;
  port?: string;
  pathname?: string;
  hash?: string;
  queryParams?: Record<string, string> | [string, string][] | string;
}): string {
  const protocol = (parts.protocol || 'https:').replace(/:?$/, ':');
  const host = parts.host || 'example.com';
  const port = parts.port ? `:${parts.port.replace(/^:/, '')}` : '';
  const base = `${protocol}//${host}${port}`;
  const url = new URL(parts.pathname || '/', base);

  if (parts.hash) {
    url.hash = parts.hash.startsWith('#') ? parts.hash : `#${parts.hash}`;
  }

  if (parts.queryParams) {
    if (typeof parts.queryParams === 'string') {
      parts.queryParams
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((line) => {
          const [k, ...rest] = line.split('=');
          if (k) url.searchParams.append(k.trim(), rest.join('=').trim());
        });
    } else if (Array.isArray(parts.queryParams)) {
      parts.queryParams.forEach(([k, v]) => {
        if (k) url.searchParams.append(k.trim(), v.trim());
      });
    } else {
      Object.entries(parts.queryParams).forEach(([k, v]) => {
        if (k) url.searchParams.append(k.trim(), String(v).trim());
      });
    }
  }

  return url.href;
}

export function encodeUrl(url: string): string {
  return encodeURI(url.trim());
}

export function decodeUrl(url: string): string {
  return decodeURI(url.trim());
}

export const parseUrlComponents = parseUrlString;
export const encodeUrlString = encodeUrl;
export const decodeUrlString = decodeUrl;
