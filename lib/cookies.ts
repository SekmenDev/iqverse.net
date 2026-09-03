export interface ParsedCookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: string;
  maxAge?: string;
  sameSite?: string;
  secure: boolean;
  httpOnly: boolean;
  partitioned: boolean;
  warnings: string[];
}

export function parseSetCookieHeader(input: string): (ParsedCookie[] & ParsedCookie) | null {
  if (!input || !input.trim()) return null;

  const lines = input.split('\n').filter((l) => l.trim().length > 0);
  const cookies: ParsedCookie[] = [];

  lines.forEach((line) => {
    let clean = line.trim();
    if (clean.toLowerCase().startsWith('set-cookie:')) {
      clean = clean.slice(11).trim();
    }

    const parts = clean.split(';').map((p) => p.trim());
    if (parts.length === 0 || !parts[0].includes('=')) return;

    const firstEq = parts[0].indexOf('=');
    const name = parts[0].slice(0, firstEq).trim();
    const value = parts[0].slice(firstEq + 1).trim();

    let domain: string | undefined;
    let path: string | undefined;
    let expires: string | undefined;
    let maxAge: string | undefined;
    let sameSite: string | undefined;
    let secure = false;
    let httpOnly = false;
    let partitioned = false;
    const warnings: string[] = [];

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const lower = part.toLowerCase();
      if (lower.startsWith('domain=')) domain = part.slice(7).trim();
      else if (lower.startsWith('path=')) path = part.slice(5).trim();
      else if (lower.startsWith('expires=')) expires = part.slice(8).trim();
      else if (lower.startsWith('max-age=')) maxAge = part.slice(8).trim();
      else if (lower.startsWith('samesite=')) sameSite = part.slice(9).trim();
      else if (lower === 'secure') secure = true;
      else if (lower === 'httponly') httpOnly = true;
      else if (lower === 'partitioned') partitioned = true;
    }

    if (sameSite?.toLowerCase() === 'none' && !secure) {
      warnings.push('SameSite=None requires Secure flag to prevent browser rejection.');
    }
    if (!sameSite) {
      warnings.push('Cookie missing SameSite attribute (vulnerable to CSRF on legacy browsers).');
    }
    if (
      !httpOnly &&
      (name.toLowerCase().includes('session') ||
        name.toLowerCase().includes('token') ||
        name.toLowerCase().includes('auth'))
    ) {
      warnings.push('Sensitive session token missing HttpOnly flag (vulnerable to XSS theft).');
    }
    if (!secure) {
      warnings.push('Cookie missing Secure flag (transmitted over insecure HTTP connection).');
    }

    const parsedMaxAge: any = maxAge !== undefined && !Number.isNaN(Number(maxAge)) ? Number(maxAge) : maxAge;

    cookies.push({
      name,
      value,
      domain,
      path,
      expires,
      maxAge: parsedMaxAge,
      sameSite,
      secure,
      httpOnly,
      partitioned,
      warnings,
    });
  });

  if (cookies.length === 0) return null;
  return Object.assign(cookies, cookies[0]);
}

export function filterCookies(
  cookies: ParsedCookie[],
  filter: 'all' | 'secure' | 'httponly' | 'warnings',
  query: string = ''
): ParsedCookie[] {
  const lq = query.toLowerCase().trim();

  return cookies.filter((cookie) => {
    if (filter === 'secure' && !cookie.secure) return false;
    if (filter === 'httponly' && !cookie.httpOnly) return false;
    if (filter === 'warnings' && cookie.warnings.length === 0) return false;

    if (lq) {
      const matchesName = cookie.name.toLowerCase().includes(lq);
      const matchesVal = cookie.value.toLowerCase().includes(lq);
      const matchesDom = (cookie.domain || '').toLowerCase().includes(lq);
      const matchesPath = (cookie.path || '').toLowerCase().includes(lq);
      if (!matchesName && !matchesVal && !matchesDom && !matchesPath) {
        return false;
      }
    }
    return true;
  });
}
