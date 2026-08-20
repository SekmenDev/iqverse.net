export interface OgMetadata {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  siteName?: string;
  twitterHandle?: string;
  type?: string;
}

export interface CharCountScore {
  count: number;
  max: number;
  status: 'optimal' | 'danger' | 'normal';
}

export const OG_TEMPLATES = {
  iqverse: {
    title: 'IQVerse - Free Developer & AI Agent Tools',
    description: 'Fast, private, client-side browser tools for developers, AI engineers and security researchers.',
    url: 'https://iqverse.net',
    imageUrl: 'https://iqverse.net/og-banner.png',
    siteName: 'IQVerse',
    twitterHandle: '@iqverse',
  },
  blog: {
    title: 'How to Secure Browser APIs with CORS & CSP',
    description: 'A deep dive into cross-origin resource sharing, preflight caching, and modern content security policies for production web apps.',
    url: 'https://iqverse.net/blog/cors-csp-security',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop',
    siteName: 'IQVerse Engineering',
    twitterHandle: '@iqverse',
  },
  saas: {
    title: 'Supercharge Your Developer Workflow in 2026',
    description: 'The all-in-one developer productivity hub with zero setup, local processing, and instant debugging tools.',
    url: 'https://iqverse.net',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    siteName: 'IQVerse Platform',
    twitterHandle: '@iqverse',
  },
  ecommerce: {
    title: 'Developer Pro Kit — Hardware & Tools',
    description: 'Curated gear and open-source utilities built specifically for full-stack software engineers and DevOps architects.',
    url: 'https://iqverse.net/store/pro-kit',
    imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1200&h=630&fit=crop',
    siteName: 'IQVerse Store',
    twitterHandle: '@iqverse',
  },
};

export function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/https?:\/\//, '').split('/')[0] || 'iqverse.net';
  }
}

export function evaluateTitleLength(title: string): CharCountScore {
  const count = title.length;
  let status: 'optimal' | 'danger' | 'normal' = 'normal';
  if (count > 60) {
    status = 'danger';
  } else if (count >= 50) {
    status = 'optimal';
  }
  return { count, max: 60, status };
}

export function evaluateDescriptionLength(description: string): CharCountScore {
  const count = description.length;
  let status: 'optimal' | 'danger' | 'normal' = 'normal';
  if (count > 160) {
    status = 'danger';
  } else if (count >= 120) {
    status = 'optimal';
  }
  return { count, max: 160, status };
}

export function analyzeOgLengths(title: string, description: string): {
  titleLength: number;
  titleStatus: 'optimal' | 'too_long' | 'normal';
  descLength: number;
  descStatus: 'optimal' | 'too_long' | 'normal';
} {
  const titleScore = evaluateTitleLength(title);
  const descScore = evaluateDescriptionLength(description);

  return {
    titleLength: titleScore.count,
    titleStatus: titleScore.status === 'danger' ? 'too_long' : 'optimal',
    descLength: descScore.count,
    descStatus: descScore.status === 'danger' ? 'too_long' : 'optimal',
  };
}

export function generateOgMetaTags(meta: OgMetadata & { twitterCard?: string }): string {
  const domain = getDomainFromUrl(meta.url || 'https://iqverse.net');
  const type = meta.type || 'website';
  const card = meta.twitterCard || 'summary_large_image';

  let html = `<!-- HTML Meta Tags -->\n`;
  html += `<title>${meta.title}</title>\n`;
  html += `<meta name="description" content="${meta.description}">\n\n`;

  html += `<!-- Facebook Meta Tags (Open Graph) -->\n`;
  html += `<meta property="og:url" content="${meta.url}">\n`;
  html += `<meta property="og:type" content="${type}">\n`;
  html += `<meta property="og:title" content="${meta.title}">\n`;
  html += `<meta property="og:description" content="${meta.description}">\n`;
  if (meta.imageUrl) html += `<meta property="og:image" content="${meta.imageUrl}">\n`;
  if (meta.siteName) html += `<meta property="og:site_name" content="${meta.siteName}">\n\n`;

  html += `<!-- Twitter Meta Tags -->\n`;
  html += `<meta name="twitter:card" content="${card}">\n`;
  html += `<meta property="twitter:domain" content="${domain}">\n`;
  html += `<meta property="twitter:url" content="${meta.url}">\n`;
  html += `<meta name="twitter:title" content="${meta.title}">\n`;
  html += `<meta name="twitter:description" content="${meta.description}">\n`;
  if (meta.imageUrl) html += `<meta property="twitter:image" content="${meta.imageUrl}">\n`;
  if (meta.twitterHandle) {
    html += `<meta name="twitter:site" content="${meta.twitterHandle}">\n`;
    html += `<meta name="twitter:creator" content="${meta.twitterHandle}">\n`;
  }

  return html.trim();
}
