export interface Tool {
  slug: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  icon: string;
  longDescription?: string;
}

export const tools: Tool[] = [
  {
    slug: 'agentscan',
    name: 'AI Agents Scanner',
    category: 'UTILITIES',
    description: 'Scan your website for AI agent readiness. Checks robots.txt, sitemap, MCP, OAuth and more.',
    features: ['Comprehensive checks', 'Robots.txt validation', 'Sitemap detection', 'MCP verification'],
    icon: '/agentscan/logoX4.png',
    longDescription: 'Scan your website for AI agent readiness. Checks for robots.txt, sitemap, MCP, OAuth, Markdown, agent commerce, security headers and more.',
  },
  {
    slug: 'qrforge',
    name: 'QR Forge',
    category: 'GENERATORS',
    description: 'Generate QR codes instantly in your browser without any data collection. SVG or PNG at any resolution.',
    features: ['Client-side generation', 'SVG & PNG export', 'Custom colors & logos', 'Multiple data types'],
    icon: '/qrforge/logoX4.png',
  },
  {
    slug: 'linkradar',
    name: 'Link Radar',
    category: 'UTILITIES',
    description: 'Scan webpages and detect broken links in seconds. Paste a URL and get instant 404 and redirect analysis.',
    features: ['Bulk link scanning', 'HTTP status detection', 'Redirect chain analysis', 'Exportable reports'],
    icon: '/linkradar/logoX4.png',
  },
  {
    slug: 'favicongen',
    name: 'Favicon Generator',
    category: 'GENERATORS',
    description: 'Generate all favicon sizes from a single image. Exports manifest.json and all icons needed for modern browsers.',
    features: ['All sizes in one click', 'SVG support', 'Web manifest generation', 'Browser preview'],
    icon: '/favicongen/logoX4.png',
  },
  {
    slug: 'json',
    name: 'JSON Formatter',
    category: 'FORMATTERS',
    description: 'Validate, format, minify and transform your JSON data. No servers, all in your browser.',
    features: ['Validate JSON', 'Pretty print', 'Minify', 'Sort keys', 'Statistics'],
    icon: '/json/logoX4.png',
  },
  {
    slug: 'regex',
    name: 'Regex Tester',
    category: 'TESTERS',
    description: 'Test regular expressions with instant feedback. Match patterns, validate input, and debug regex patterns.',
    features: ['Live matching', 'Pattern validation', 'Flag support', 'Match highlighting'],
    icon: '/regex/logoX4.png',
  },
  {
    slug: 'password',
    name: 'Password Generator',
    category: 'GENERATORS',
    description: 'Generate secure random passwords with custom length and character options.',
    features: ['Custom length', 'Character options', 'Copy to clipboard', 'Strength indicator'],
    icon: '/password/logoX4.png',
  },
  {
    slug: 'encodelab',
    name: 'Encode/Decode',
    category: 'CONVERTERS',
    description: 'Encode and decode text in multiple formats: Base64, URL, HTML entities, and more.',
    features: ['Base64 encoding', 'URL encoding', 'HTML entities', 'Hex conversion'],
    icon: '/encodelab/logoX4.png',
  },
  {
    slug: 'dnslookup',
    name: 'DNS Lookup',
    category: 'UTILITIES',
    description: 'Look up DNS records for any domain. Check A, CNAME, MX, TXT and other record types.',
    features: ['DNS queries', 'Multiple record types', 'IP resolution', 'TTL display'],
    icon: '/dnslookup/logoX4.png',
  },
  {
    slug: 'headers',
    name: 'HTTP Headers Viewer',
    category: 'UTILITIES',
    description: 'Inspect HTTP response headers for any URL. Check caching, security headers, and more.',
    features: ['Header inspection', 'Security headers', 'Caching info', 'CORS analysis'],
    icon: '/headers/logoX4.png',
  },
  {
    slug: 'chromata',
    name: 'Chromata',
    category: 'TOOLS',
    description: 'Color tools for designers and developers. Convert, generate, and analyze colors.',
    features: ['Color conversion', 'Palette generation', 'Color harmony', 'Accessibility check'],
    icon: '/chromata/logoX4.png',
  },
  {
    slug: 'ges',
    name: 'Grid Essentials',
    category: 'TOOLS',
    description: 'Grid calculation and layout tools for responsive design.',
    features: ['Grid calculator', 'Spacing tools', 'Layout helpers', 'CSS output'],
    icon: '/ges/logoX4.png',
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolMetadata(slug: string) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;
  
  return {
    title: `${tool.name} | IQVerse Tools`,
    description: tool.description,
    openGraph: {
      title: tool.name,
      description: tool.description,
      url: `https://iqverse.net/${tool.slug}/`,
    },
  };
}
