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
