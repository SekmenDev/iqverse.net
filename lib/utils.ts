export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function capitalize(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function timeAgo(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function formatTTL(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null) return '—';
  const s = parseInt(String(seconds));
  if (isNaN(s)) return '—';
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
}

export function normalizeDomain(input: string): string {
  return input.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0].toLowerCase();
}

export function normalizeUrl(base: string, href: string): string | null {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

export function safeRegExp(pattern: string, flags: string): RegExp | null {
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

export function getHeader(headers: Record<string, string>, name: string): string | null {
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : null;
}

export function buildQRPayload(type: string, values: Record<string, string>): string {
  switch (type) {
    case 'email':
      return `mailto:${values.email || ''}?subject=${encodeURIComponent(values.subject || '')}&body=${encodeURIComponent(values.body || '')}`;
    case 'wifi':
      return `WIFI:T:${values.security || ''};S:${values.ssid || ''};P:${values.password || ''};;`;
    case 'vcard':
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${values.name || ''}\nTEL:${values.phone || ''}\nEMAIL:${values.email || ''}\nORG:${values.company || ''}\nURL:${values.url || ''}\nEND:VCARD`;
    case 'text':
      return values.text || '';
    default:
      return values.url || '';
  }
}
