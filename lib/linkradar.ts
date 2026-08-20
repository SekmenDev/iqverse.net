export interface ExtractedLink {
  url: string;
  tag: 'A' | 'IMG';
  isExternal: boolean;
}

export interface LinkScanResult {
  url: string;
  sourceUrl?: string;
  tag?: string;
  status: number;
  time?: number;
  html?: string;
}

export type LinkRadarResult = LinkScanResult;

export interface LinkStatsSummary {
  total: number;
  s2xx: number;
  success2xx: number;
  s3xx: number;
  redirect3xx: number;
  broken: number;
}

export function categorizeLinkStatus(status: number): 'ok' | 'redirect' | 'broken' {
  if (status >= 200 && status < 300) return 'ok';
  if (status >= 300 && status < 400) return 'redirect';
  return 'broken';
}

export function aggregateLinkStats(results: LinkScanResult[]): LinkStatsSummary {
  let s2xx = 0;
  let s3xx = 0;
  let broken = 0;

  results.forEach((r) => {
    if (r.status >= 200 && r.status < 300) s2xx++;
    else if (r.status >= 300 && r.status < 400) s3xx++;
    else broken++;
  });

  return {
    total: results.length,
    s2xx,
    success2xx: s2xx,
    s3xx,
    redirect3xx: s3xx,
    broken,
  };
}

export function extractLinksFromHtml(
  html: string,
  baseUrl: string,
  includeExternal: boolean = true,
  includeImages: boolean = true
): ExtractedLink[] {
  const links: ExtractedLink[] = [];
  const baseHostname = new URL(baseUrl).hostname;

  // Extract <a href="...">
  const hrefRegex = /<a\s+[^>]*href=["']([^"'#]+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = hrefRegex.exec(html)) !== null) {
    const rawHref = match[1].trim();
    if (rawHref && !rawHref.startsWith('javascript:') && !rawHref.startsWith('mailto:') && !rawHref.startsWith('tel:')) {
      try {
        const resolved = new URL(rawHref, baseUrl).href;
        const isExternal = new URL(resolved).hostname !== baseHostname;
        if (includeExternal || !isExternal) {
          links.push({ url: resolved, tag: 'A', isExternal });
        }
      } catch {
        // Skip malformed URLs
      }
    }
  }

  // Extract <img src="...">
  if (includeImages) {
    const srcRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
    while ((match = srcRegex.exec(html)) !== null) {
      const rawSrc = match[1].trim();
      if (rawSrc && !rawSrc.startsWith('data:')) {
        try {
          const resolved = new URL(rawSrc, baseUrl).href;
          const isExternal = new URL(resolved).hostname !== baseHostname;
          links.push({ url: resolved, tag: 'IMG', isExternal });
        } catch {
          // Skip malformed
        }
      }
    }
  }

  return links;
}
