import type { APIRoute } from 'astro';
import { tools } from '@/lib/tools';

const baseUrl = 'https://iqverse.net';

export const GET: APIRoute = async () => {
  const internalTools = tools.filter((tool) => tool.type !== 'coming');
  const now = new Date().toISOString();

  const urls = [
    {
      loc: `${baseUrl}/`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '1.0',
    },
    ...internalTools.map((tool) => ({
      loc: tool.url.startsWith('/') ? `${baseUrl}${tool.url}` : `${baseUrl}/${tool.url}/`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.8',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
