export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' | string;
  priority?: string;
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSitemapXml(urls: SitemapUrlEntry[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  urls.forEach((u) => {
    if (u.loc.trim()) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(u.loc.trim())}</loc>\n`;
      if (u.lastmod?.trim()) xml += `    <lastmod>${escapeXml(u.lastmod.trim())}</lastmod>\n`;
      if (u.changefreq) xml += `    <changefreq>${escapeXml(u.changefreq)}</changefreq>\n`;
      if (u.priority) xml += `    <priority>${escapeXml(u.priority)}</priority>\n`;
      xml += `  </url>\n`;
    }
  });

  xml += `</urlset>`;
  return xml;
}

export function parseBulkSitemapPaths(
  arg1: string,
  arg2: string = 'https://example.com',
  priority: string = '0.5',
  changefreq: string = 'monthly'
): SitemapUrlEntry[] {
  let baseUrl = 'https://example.com';
  let bulkText = '';

  if (arg1.startsWith('http://') || arg1.startsWith('https://')) {
    baseUrl = arg1;
    bulkText = arg2;
  } else {
    bulkText = arg1;
    baseUrl = arg2;
  }

  const base = baseUrl.trim().replace(/\/$/, '');
  const today = new Date().toISOString().split('T')[0];
  const lines = bulkText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  return lines.map((l) => {
    const fullLoc = l.startsWith('http') ? l : `${base}${l.startsWith('/') ? '' : '/'}${l}`;
    return {
      loc: fullLoc,
      lastmod: today,
      changefreq,
      priority,
    };
  });
}

const NON_HTML_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.ico',
  '.bmp',
  '.tiff',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.rar',
  '.7z',
  '.mp4',
  '.webm',
  '.mp3',
  '.wav',
  '.ogg',
  '.css',
  '.js',
  '.mjs',
  '.map',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.xml',
  '.json',
  '.txt',
];

export function normalizeSitemapUrl(rawUrl: string, baseOrigin: string): string | null {
  try {
    const parsed = new URL(rawUrl, baseOrigin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (parsed.origin !== new URL(baseOrigin).origin) return null;
    parsed.hash = '';
    const pathname = parsed.pathname.toLowerCase();
    if (NON_HTML_EXTENSIONS.some((ext) => pathname.endsWith(ext))) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function generateSitemapTxt(urls: (SitemapUrlEntry | string)[]): string {
  const lines = urls
    .map((u) => (typeof u === 'string' ? u.trim() : u.loc.trim()))
    .filter(Boolean);
  return Array.from(new Set(lines)).join('\n');
}

