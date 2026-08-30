export type CheckStatus = 'pass' | 'warn' | 'fail' | 'info';
export type CheckSeverity = 'critical' | 'high' | 'medium' | 'low';
export type BaselineCategory = 'security' | 'seo' | 'dom' | 'metadata' | 'crawl';

export interface BaselineCheckDefinition {
  id: string;
  name: string;
  category: BaselineCategory;
  severity: CheckSeverity;
  weight: number;
  description: string;
  recommendation: string;
  codeExample?: string;
}

export interface BaselineCheckResult {
  id: string;
  name: string;
  description: string;
  category: BaselineCategory;
  severity: CheckSeverity;
  weight: number;
  status: CheckStatus;
  found: string;
  recommendation: string;
  codeExample?: string;
  value?: string;
}

export interface EndpointResponses {
  home: { ok: boolean; status: number; body: string; headers: Record<string, string>; time?: number };
  robots?: { ok: boolean; status: number; body: string; headers?: Record<string, string> };
  sitemap?: { ok: boolean; status: number; body: string; headers?: Record<string, string> };
  llms?: { ok: boolean; status: number; body: string; headers?: Record<string, string> };
}

export interface BaselineAuditReport {
  url: string;
  hostname: string;
  scanTimeMs: number;
  timestamp: string;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  passedCount: number;
  warnCount: number;
  failCount: number;
  infoCount: number;
  totalChecks: number;
  results: BaselineCheckResult[];
  categoryScores: Record<BaselineCategory, { score: number; passed: number; total: number }>;
}

export const BASELINE_CHECKS: BaselineCheckDefinition[] = [
  // 1. Security & Transport
  {
    id: 'https_protocol',
    name: 'Secure HTTPS Transport',
    category: 'security',
    severity: 'critical',
    weight: 8,
    description: 'Verifies the site is delivered over encrypted HTTPS connection.',
    recommendation: 'Enforce HTTPS for all web traffic and redirect HTTP to HTTPS.',
    codeExample: 'https://example.com',
  },
  {
    id: 'http_status',
    name: 'HTTP 200 OK Response',
    category: 'security',
    severity: 'critical',
    weight: 8,
    description: 'Ensures the root homepage responds with a successful HTTP 200 status code.',
    recommendation: 'Fix server configuration or redirect chains so root responds with HTTP 200 OK.',
    codeExample: 'HTTP/1.1 200 OK',
  },
  {
    id: 'hsts_header',
    name: 'Strict-Transport-Security (HSTS)',
    category: 'security',
    severity: 'high',
    weight: 5,
    description: 'Protects against protocol downgrade attacks by enforcing HTTPS in browsers.',
    recommendation: 'Add the Strict-Transport-Security header with a minimum 1-year max-age.',
    codeExample: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
  },
  {
    id: 'security_headers',
    name: 'Essential Security Headers',
    category: 'security',
    severity: 'medium',
    weight: 5,
    description: 'Checks for basic defense-in-depth headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy).',
    recommendation: 'Configure X-Content-Type-Options: nosniff and Referrer-Policy.',
    codeExample: 'X-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin',
  },

  // 2. SEO & Document Essentials
  {
    id: 'page_title',
    name: 'Document Title (<title>)',
    category: 'seo',
    severity: 'critical',
    weight: 7,
    description: 'The <title> tag defines the primary title for search engines, browser tabs, and bookmarks.',
    recommendation: 'Include a unique, descriptive <title> between 15 and 65 characters.',
    codeExample: '<title>Acme Corp — Fast Cloud Infrastructure</title>',
  },
  {
    id: 'meta_description',
    name: 'Meta Description Tag',
    category: 'seo',
    severity: 'high',
    weight: 6,
    description: 'Provides a concise summary snippet for search engine search results and AI citations.',
    recommendation: 'Add a <meta name="description"> between 50 and 160 characters.',
    codeExample: '<meta name="description" content="Deploy scalable serverless applications in seconds.">',
  },
  {
    id: 'viewport_meta',
    name: 'Mobile Viewport Meta Tag',
    category: 'seo',
    severity: 'critical',
    weight: 7,
    description: 'Tells mobile browsers how to control the page dimensions and scaling.',
    recommendation: 'Include standard mobile viewport tag inside <head>.',
    codeExample: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  },
  {
    id: 'charset_meta',
    name: 'Character Encoding (<meta charset>)',
    category: 'seo',
    severity: 'medium',
    weight: 4,
    description: 'Declares character encoding to prevent garbled text and cross-site scripting vulnerabilities.',
    recommendation: 'Declare UTF-8 encoding as early as possible in <head>.',
    codeExample: '<meta charset="utf-8">',
  },
  {
    id: 'canonical_link',
    name: 'Canonical URL Tag (<link rel="canonical">)',
    category: 'seo',
    severity: 'high',
    weight: 5,
    description: 'Prevents duplicate content issues by specifying the authoritative master URL.',
    recommendation: 'Add <link rel="canonical" href="https://yourdomain.com/"> to every page.',
    codeExample: '<link rel="canonical" href="https://example.com/">',
  },
  {
    id: 'html_lang',
    name: 'HTML Language Attribute (<html lang="...">)',
    category: 'seo',
    severity: 'high',
    weight: 5,
    description: 'Helps screen readers and search engines determine the natural language of the document.',
    recommendation: 'Specify valid BCP 47 language code on the root <html> tag.',
    codeExample: '<html lang="en">',
  },
  {
    id: 'favicon_link',
    name: 'Favicon & App Icon (<link rel="icon">)',
    category: 'seo',
    severity: 'medium',
    weight: 4,
    description: 'Provides tab icons and home screen icons for browser navigation.',
    recommendation: 'Declare standard SVG/PNG favicons and touch icons in <head>.',
    codeExample: '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/icon-192.png">',
  },
  {
    id: 'theme_or_manifest',
    name: 'Theme Color & Web Manifest',
    category: 'seo',
    severity: 'low',
    weight: 3,
    description: 'Customizes browser chrome color and provides web application manifest for progressive installability.',
    recommendation: 'Provide <meta name="theme-color"> and <link rel="manifest">.',
    codeExample: '<meta name="theme-color" content="#0f172a">\n<link rel="manifest" href="/manifest.json">',
  },

  // 3. Content Structure & Semantic DOM
  {
    id: 'h1_heading',
    name: 'Primary Heading (<h1>)',
    category: 'dom',
    severity: 'high',
    weight: 6,
    description: 'The single main headline representing the topic of the page.',
    recommendation: 'Include exactly one clear, meaningful <h1> heading on the page.',
    codeExample: '<h1>Scalable Cloud Storage</h1>',
  },
  {
    id: 'semantic_header',
    name: 'Header / Navigation Landmark (<header> / <nav>)',
    category: 'dom',
    severity: 'medium',
    weight: 4,
    description: 'Semantic landmark representing introductory content and navigational links.',
    recommendation: 'Use semantic <header> and <nav> HTML5 landmark tags.',
    codeExample: '<header>\n  <nav>\n    <a href="/">Home</a>\n  </nav>\n</header>',
  },
  {
    id: 'semantic_main',
    name: 'Main Content Landmark (<main>)',
    category: 'dom',
    severity: 'medium',
    weight: 4,
    description: 'Semantic landmark wrapping the dominant, unique content of the document.',
    recommendation: 'Wrap the central body content in a single semantic <main> tag.',
    codeExample: '<main id="main-content">\n  <!-- Core page content -->\n</main>',
  },
  {
    id: 'semantic_footer',
    name: 'Footer Landmark (<footer>)',
    category: 'dom',
    severity: 'medium',
    weight: 4,
    description: 'Semantic landmark containing author, copyright, legal, and secondary navigation.',
    recommendation: 'Include a semantic <footer> tag at the bottom of the page.',
    codeExample: '<footer>\n  <p>© 2026 Example Inc. All rights reserved.</p>\n</footer>',
  },
  {
    id: 'image_alt_attributes',
    name: 'Image Accessibility (alt attributes)',
    category: 'dom',
    severity: 'high',
    weight: 5,
    description: 'Ensures all image tags have descriptive alt text for visually impaired users and SEO crawlers.',
    recommendation: 'Add meaningful alt attributes to all <img> tags, or alt="" for decorative images.',
    codeExample: '<img src="/logo.svg" alt="Company Logo" width="120" height="32">',
  },
  {
    id: 'anchor_href_integrity',
    name: 'Anchor Link Integrity (href attributes)',
    category: 'dom',
    severity: 'medium',
    weight: 3,
    description: 'Verifies anchor <a> tags have valid destinations and avoid empty or placeholder hrefs.',
    recommendation: 'Ensure all <a> elements have valid href targets and avoid bare href="#".',
    codeExample: '<a href="/pricing">View Pricing</a>',
  },

  // 4. Structured Data & Social Metadata
  {
    id: 'schema_jsonld',
    name: 'Schema.org JSON-LD Structured Data',
    category: 'metadata',
    severity: 'high',
    weight: 6,
    description: 'Machine-readable structured schema (Organization, WebSite, Article, Product) for search rich snippets.',
    recommendation: 'Embed valid JSON-LD structured data with Schema.org context in <head>.',
    codeExample: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "Example",\n  "url": "https://example.com"\n}\n</script>',
  },
  {
    id: 'open_graph',
    name: 'Open Graph Social Cards (og:*)',
    category: 'metadata',
    severity: 'medium',
    weight: 4,
    description: 'Defines rich title, image, and description cards when links are shared on social platforms and messaging apps.',
    recommendation: 'Add og:title, og:description, og:image, and og:url meta tags.',
    codeExample: '<meta property="og:title" content="Page Title">\n<meta property="og:description" content="Description">\n<meta property="og:image" content="https://example.com/og.jpg">\n<meta property="og:url" content="https://example.com/">',
  },
  {
    id: 'twitter_card',
    name: 'Twitter / X Card Metadata',
    category: 'metadata',
    severity: 'low',
    weight: 2,
    description: 'Optimizes snippet previews and large card views when shared on Twitter / X.',
    recommendation: 'Add twitter:card, twitter:title, and twitter:description tags.',
    codeExample: '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="Page Title">',
  },

  // 5. Discovery & Crawlability
  {
    id: 'robots_txt',
    name: 'Search Crawler Policy (/robots.txt)',
    category: 'crawl',
    severity: 'critical',
    weight: 6,
    description: 'Instructs search engine bots and AI agents which paths can or cannot be crawled.',
    recommendation: 'Host a valid robots.txt at your domain root with clear crawler directives.',
    codeExample: 'User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml',
  },
  {
    id: 'sitemap_xml',
    name: 'XML Sitemap Reachability (/sitemap.xml)',
    category: 'crawl',
    severity: 'high',
    weight: 5,
    description: 'Provides a complete index of authoritative URLs for search engines to discover and crawl.',
    recommendation: 'Publish a valid sitemap.xml and declare its URL inside /robots.txt.',
    codeExample: '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://example.com/</loc></url>\n</urlset>',
  },
  {
    id: 'robots_meta_indexable',
    name: 'Page Indexability Directives',
    category: 'crawl',
    severity: 'high',
    weight: 5,
    description: 'Confirms public landing pages do not contain accidental noindex directives.',
    recommendation: 'Remove unintentional <meta name="robots" content="noindex"> from public indexable pages.',
    codeExample: '<meta name="robots" content="index, follow">',
  },
  {
    id: 'llms_txt',
    name: 'AI Discovery Standard (/llms.txt)',
    category: 'crawl',
    severity: 'low',
    weight: 3,
    description: 'Markdown discovery manifest curated specifically for LLM search engines and autonomous AI agents.',
    recommendation: 'Provide a concise /llms.txt markdown overview of your site for AI models.',
    codeExample: '# Example Docs\n> Curated markdown summary for AI agents.\n\n- [API Reference](/docs/api)',
  },
];

export interface ExtractedHtmlSignals {
  title: string | null;
  metaDescription: string | null;
  viewport: string | null;
  charset: string | null;
  canonical: string | null;
  htmlLang: string | null;
  favicons: string[];
  themeColor: string | null;
  manifest: string | null;
  h1s: string[];
  hasHeader: boolean;
  hasNav: boolean;
  hasMain: boolean;
  hasFooter: boolean;
  imgCount: number;
  imgAltCount: number;
  imgsWithoutAlt: number;
  linksCount: number;
  emptyLinksCount: number;
  hasSchemaJsonLd: boolean;
  schemaTypes: string[];
  schemaIsValidJson: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  twitterCard: string | null;
  robotsMeta: string | null;
  isNoindex: boolean;
}

export function extractHtmlSignals(html: string): ExtractedHtmlSignals {
  const result: ExtractedHtmlSignals = {
    title: null,
    metaDescription: null,
    viewport: null,
    charset: null,
    canonical: null,
    htmlLang: null,
    favicons: [],
    themeColor: null,
    manifest: null,
    h1s: [],
    hasHeader: false,
    hasNav: false,
    hasMain: false,
    hasFooter: false,
    imgCount: 0,
    imgAltCount: 0,
    imgsWithoutAlt: 0,
    linksCount: 0,
    emptyLinksCount: 0,
    hasSchemaJsonLd: false,
    schemaTypes: [],
    schemaIsValidJson: false,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    ogUrl: null,
    twitterCard: null,
    robotsMeta: null,
    isNoindex: false,
  };

  if (!html || typeof html !== 'string') {
    return result;
  }

  const langMatch = html.match(/<html[^>]*\blang=["']([^"']+)["']/i);
  if (langMatch) {
    result.htmlLang = langMatch[1].trim();
  }

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    result.title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  const metaRegex = /<meta\b([^>]*)>/gi;
  let metaMatch: RegExpExecArray | null;
  while ((metaMatch = metaRegex.exec(html)) !== null) {
    const attrs = metaMatch[1];

    const charsetMatch = attrs.match(/charset=["']?([^"' />]+)/i);
    if (charsetMatch && !result.charset) {
      result.charset = charsetMatch[1].trim();
    }
    const httpEquivCharset = attrs.match(/http-equiv=["']Content-Type["'][^>]*content=["'][^"']*charset=([^"';]+)/i);
    if (httpEquivCharset && !result.charset) {
      result.charset = httpEquivCharset[1].trim();
    }

    const nameMatch = attrs.match(/name=["']([^"']+)["']/i);
    const propertyMatch = attrs.match(/property=["']([^"']+)["']/i);
    const contentMatch = attrs.match(/content=["']([^"']*)["']/i);

    const name = (nameMatch ? nameMatch[1] : '').toLowerCase();
    const prop = (propertyMatch ? propertyMatch[1] : '').toLowerCase();
    const content = contentMatch ? contentMatch[1].trim() : '';

    if (name === 'description' && !result.metaDescription) {
      result.metaDescription = content;
    }
    if (name === 'viewport' && !result.viewport) {
      result.viewport = content;
    }
    if (name === 'theme-color' && !result.themeColor) {
      result.themeColor = content;
    }
    if (name === 'robots') {
      result.robotsMeta = content;
      if (/noindex/i.test(content)) {
        result.isNoindex = true;
      }
    }
    if (name === 'twitter:card' || name === 'twitter:title') {
      result.twitterCard = content || name;
    }

    if (prop === 'og:title') result.ogTitle = content;
    if (prop === 'og:description') result.ogDescription = content;
    if (prop === 'og:image') result.ogImage = content;
    if (prop === 'og:url') result.ogUrl = content;
  }

  const linkRegex = /<link\b([^>]*)>/gi;
  let linkMatch: RegExpExecArray | null;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const attrs = linkMatch[1];
    const relMatch = attrs.match(/rel=["']([^"']+)["']/i);
    const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);

    const rel = relMatch ? relMatch[1].toLowerCase() : '';
    const href = hrefMatch ? hrefMatch[1].trim() : '';

    if (rel.includes('canonical') && !result.canonical && href) {
      result.canonical = href;
    }
    if ((rel.includes('icon') || rel.includes('apple-touch-icon')) && href) {
      result.favicons.push(href);
    }
    if (rel.includes('manifest') && href) {
      result.manifest = href;
    }
  }

  const h1Regex = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi;
  let h1Match: RegExpExecArray | null;
  while ((h1Match = h1Regex.exec(html)) !== null) {
    const text = h1Match[1].replace(/<[^>]+>/g, '').trim();
    if (text) {
      result.h1s.push(text);
    }
  }

  result.hasHeader = /<header\b/i.test(html);
  result.hasNav = /<nav\b/i.test(html);
  result.hasMain = /<main\b/i.test(html);
  result.hasFooter = /<footer\b/i.test(html);

  const imgRegex = /<img\b([^>]*)>/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    result.imgCount++;
    const attrs = imgMatch[1];
    const altMatch = attrs.match(/\balt=(?:["']([^"']*)["']|([^ >]+))/i);
    if (altMatch !== null) {
      result.imgAltCount++;
    } else {
      result.imgsWithoutAlt++;
    }
  }

  const anchorRegex = /<a\b([^>]*)>/gi;
  let anchorMatch: RegExpExecArray | null;
  while ((anchorMatch = anchorRegex.exec(html)) !== null) {
    result.linksCount++;
    const attrs = anchorMatch[1];
    const hrefMatch = attrs.match(/\bhref=["']([^"']*)["']/i);
    if (!hrefMatch || !hrefMatch[1].trim() || hrefMatch[1].trim() === '#') {
      result.emptyLinksCount++;
    }
  }

  const jsonLdRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch: RegExpExecArray | null;
  while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
    result.hasSchemaJsonLd = true;
    const jsonText = jsonLdMatch[1].trim();
    try {
      const parsed = JSON.parse(jsonText);
      result.schemaIsValidJson = true;
      if (parsed && typeof parsed === 'object') {
        const type = parsed['@type'] || (Array.isArray(parsed) && parsed[0]?.['@type']);
        if (type && typeof type === 'string') {
          result.schemaTypes.push(type);
        }
      }
    } catch {
      // Invalid JSON
    }
  }

  return result;
}

export function evaluateBaselineAudit(targetUrl: string, endpoints: EndpointResponses): BaselineAuditReport {
  let hostname = targetUrl;
  let isHttpsUrl = targetUrl.startsWith('https://');
  try {
    const parsed = new URL(targetUrl);
    hostname = parsed.hostname;
    isHttpsUrl = parsed.protocol === 'https:';
  } catch {
    // Keep fallback
  }

  const html = endpoints.home?.body || '';
  const headers = endpoints.home?.headers || {};
  const status = endpoints.home?.status || 0;
  const scanTimeMs = endpoints.home?.time || 0;

  const signals = extractHtmlSignals(html);
  const robotsTxt = endpoints.robots?.body || '';
  const sitemapBody = endpoints.sitemap?.body || '';

  const results: BaselineCheckResult[] = [];

  for (const def of BASELINE_CHECKS) {
    let checkStatus: CheckStatus = 'fail';
    let foundText = '';
    let valueFound: string | undefined = undefined;

    switch (def.id) {
      case 'https_protocol': {
        if (isHttpsUrl) {
          checkStatus = 'pass';
          foundText = 'Website is loaded securely over HTTPS.';
          valueFound = 'HTTPS (TLS)';
        } else {
          checkStatus = 'fail';
          foundText = 'Target URL is using insecure HTTP protocol.';
          valueFound = 'HTTP (Unencrypted)';
        }
        break;
      }

      case 'http_status': {
        if (status === 200) {
          checkStatus = 'pass';
          foundText = 'Server responded with HTTP 200 OK.';
          valueFound = 'HTTP 200';
        } else if (status >= 300 && status < 400) {
          checkStatus = 'warn';
          foundText = `Server responded with redirect HTTP ${status}.`;
          valueFound = `HTTP ${status}`;
        } else if (status > 0) {
          checkStatus = 'fail';
          foundText = `Server returned status code HTTP ${status}.`;
          valueFound = `HTTP ${status}`;
        } else {
          checkStatus = 'fail';
          foundText = 'Failed to establish connection to web server.';
          valueFound = 'Connection failed';
        }
        break;
      }

      case 'hsts_header': {
        const hsts = headers['strict-transport-security'];
        if (hsts) {
          checkStatus = 'pass';
          foundText = `HSTS header active: ${hsts}`;
          valueFound = hsts;
        } else {
          checkStatus = isHttpsUrl ? 'warn' : 'fail';
          foundText = 'Strict-Transport-Security (HSTS) header is missing.';
        }
        break;
      }

      case 'security_headers': {
        const xcto = headers['x-content-type-options'];
        const xfo = headers['x-frame-options'];
        const ref = headers['referrer-policy'];
        const count = [xcto, xfo, ref].filter(Boolean).length;

        if (count >= 2) {
          checkStatus = 'pass';
          foundText = `Configured ${count}/3 security headers (XCTO: ${xcto || 'none'}, XFO: ${xfo || 'none'}, Referrer: ${ref || 'none'}).`;
          valueFound = `${count}/3 present`;
        } else if (count === 1) {
          checkStatus = 'warn';
          foundText = `Only 1 basic security header detected (XCTO: ${xcto || 'none'}, XFO: ${xfo || 'none'}, Referrer: ${ref || 'none'}).`;
          valueFound = `1/3 present`;
        } else {
          checkStatus = 'fail';
          foundText = 'Missing basic security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy).';
          valueFound = '0/3 present';
        }
        break;
      }

      case 'page_title': {
        if (signals.title) {
          const len = signals.title.length;
          valueFound = `"${signals.title}" (${len} chars)`;
          if (len >= 10 && len <= 70) {
            checkStatus = 'pass';
            foundText = `Title present and optimal length: "${signals.title}" (${len} characters).`;
          } else if (len < 10) {
            checkStatus = 'warn';
            foundText = `Title is very short (${len} chars): "${signals.title}". Recommend 15–65 characters.`;
          } else {
            checkStatus = 'warn';
            foundText = `Title may be truncated in search results (${len} chars): "${signals.title}".`;
          }
        } else {
          checkStatus = 'fail';
          foundText = 'Missing <title> tag in HTML document.';
        }
        break;
      }

      case 'meta_description': {
        if (signals.metaDescription) {
          const len = signals.metaDescription.length;
          valueFound = `"${signals.metaDescription.slice(0, 60)}..." (${len} chars)`;
          if (len >= 40 && len <= 170) {
            checkStatus = 'pass';
            foundText = `Meta description present and optimal length (${len} characters).`;
          } else if (len < 40) {
            checkStatus = 'warn';
            foundText = `Meta description is short (${len} chars). Optimal length is 50–160 characters.`;
          } else {
            checkStatus = 'warn';
            foundText = `Meta description is long (${len} chars) and may be truncated.`;
          }
        } else {
          checkStatus = 'warn';
          foundText = 'Missing <meta name="description"> tag.';
        }
        break;
      }

      case 'viewport_meta': {
        if (signals.viewport) {
          checkStatus = 'pass';
          foundText = `Mobile viewport meta tag configured: content="${signals.viewport}"`;
          valueFound = signals.viewport;
        } else {
          checkStatus = 'fail';
          foundText = 'Missing <meta name="viewport"> tag. Site will not render properly on mobile devices.';
        }
        break;
      }

      case 'charset_meta': {
        if (signals.charset) {
          checkStatus = 'pass';
          foundText = `Character encoding declared: ${signals.charset}`;
          valueFound = signals.charset;
        } else {
          checkStatus = 'warn';
          foundText = 'Missing <meta charset="utf-8"> declaration.';
        }
        break;
      }

      case 'canonical_link': {
        if (signals.canonical) {
          checkStatus = 'pass';
          foundText = `Canonical URL tag present: <link rel="canonical" href="${signals.canonical}">`;
          valueFound = signals.canonical;
        } else {
          checkStatus = 'warn';
          foundText = 'Missing <link rel="canonical"> tag.';
        }
        break;
      }

      case 'html_lang': {
        if (signals.htmlLang) {
          checkStatus = 'pass';
          foundText = `HTML language attribute specified: <html lang="${signals.htmlLang}">`;
          valueFound = signals.htmlLang;
        } else {
          checkStatus = 'warn';
          foundText = 'Missing lang attribute on <html> element.';
        }
        break;
      }

      case 'favicon_link': {
        if (signals.favicons.length > 0) {
          checkStatus = 'pass';
          foundText = `Discovered ${signals.favicons.length} favicon / touch icon declaration(s).`;
          valueFound = signals.favicons[0];
        } else {
          checkStatus = 'warn';
          foundText = 'No <link rel="icon"> or apple-touch-icon tag found in document head.';
        }
        break;
      }

      case 'theme_or_manifest': {
        if (signals.themeColor || signals.manifest) {
          checkStatus = 'pass';
          const items = [];
          if (signals.themeColor) items.push(`theme-color="${signals.themeColor}"`);
          if (signals.manifest) items.push(`manifest="${signals.manifest}"`);
          foundText = `Found: ${items.join(', ')}`;
          valueFound = items.join(', ');
        } else {
          checkStatus = 'info';
          foundText = 'No theme-color meta or web app manifest declared.';
        }
        break;
      }

      case 'h1_heading': {
        if (signals.h1s.length === 1) {
          checkStatus = 'pass';
          foundText = `Single primary <h1> found: "${signals.h1s[0]}"`;
          valueFound = `<h1>${signals.h1s[0]}</h1>`;
        } else if (signals.h1s.length > 1) {
          checkStatus = 'warn';
          foundText = `Found ${signals.h1s.length} <h1> headings. Best practice is to have exactly one primary <h1> per page.`;
          valueFound = `${signals.h1s.length} H1 tags`;
        } else {
          checkStatus = 'fail';
          foundText = 'No <h1> heading found on the page.';
          valueFound = '0 H1 tags';
        }
        break;
      }

      case 'semantic_header': {
        if (signals.hasHeader || signals.hasNav) {
          checkStatus = 'pass';
          foundText = `Semantic navigation landmark present (${signals.hasHeader ? '<header>' : ''} ${signals.hasNav ? '<nav>' : ''}).`;
          valueFound = signals.hasHeader ? '<header>' : '<nav>';
        } else {
          checkStatus = 'warn';
          foundText = 'No semantic <header> or <nav> tag detected.';
        }
        break;
      }

      case 'semantic_main': {
        if (signals.hasMain) {
          checkStatus = 'pass';
          foundText = 'Semantic <main> content landmark present.';
          valueFound = '<main>';
        } else {
          checkStatus = 'warn';
          foundText = 'No semantic <main> tag detected wrapping primary content.';
        }
        break;
      }

      case 'semantic_footer': {
        if (signals.hasFooter) {
          checkStatus = 'pass';
          foundText = 'Semantic <footer> landmark present.';
          valueFound = '<footer>';
        } else {
          checkStatus = 'warn';
          foundText = 'No semantic <footer> tag detected.';
        }
        break;
      }

      case 'image_alt_attributes': {
        if (signals.imgCount === 0) {
          checkStatus = 'info';
          foundText = 'No <img> elements found on the page.';
          valueFound = '0 images';
        } else if (signals.imgsWithoutAlt === 0) {
          checkStatus = 'pass';
          foundText = `All ${signals.imgCount} image(s) have alt attributes.`;
          valueFound = `${signals.imgCount}/${signals.imgCount} with alt`;
        } else {
          checkStatus = 'warn';
          foundText = `${signals.imgsWithoutAlt} of ${signals.imgCount} image(s) are missing alt attributes.`;
          valueFound = `${signals.imgAltCount}/${signals.imgCount} with alt`;
        }
        break;
      }

      case 'anchor_href_integrity': {
        if (signals.linksCount === 0) {
          checkStatus = 'info';
          foundText = 'No anchor <a> links found on the page.';
        } else if (signals.emptyLinksCount === 0) {
          checkStatus = 'pass';
          foundText = `All ${signals.linksCount} anchor links have valid href destinations.`;
          valueFound = `${signals.linksCount} valid links`;
        } else {
          checkStatus = 'warn';
          foundText = `Found ${signals.emptyLinksCount} placeholder or empty link(s) out of ${signals.linksCount} total.`;
          valueFound = `${signals.emptyLinksCount} placeholder hrefs`;
        }
        break;
      }

      case 'schema_jsonld': {
        if (signals.hasSchemaJsonLd) {
          if (signals.schemaIsValidJson) {
            checkStatus = 'pass';
            foundText = `Valid Schema.org JSON-LD found${signals.schemaTypes.length ? ` (@type: ${signals.schemaTypes.join(', ')})` : ''}.`;
            valueFound = signals.schemaTypes.join(', ') || 'JSON-LD';
          } else {
            checkStatus = 'warn';
            foundText = 'Schema.org JSON-LD script is present but contains invalid JSON syntax.';
            valueFound = 'Invalid JSON';
          }
        } else {
          checkStatus = 'warn';
          foundText = 'No Schema.org JSON-LD structured data detected.';
        }
        break;
      }

      case 'open_graph': {
        const ogCount = [signals.ogTitle, signals.ogDescription, signals.ogImage, signals.ogUrl].filter(Boolean).length;
        if (ogCount >= 3) {
          checkStatus = 'pass';
          foundText = `Rich Open Graph metadata present (${ogCount}/4 key tags).`;
          valueFound = `${ogCount}/4 OG tags`;
        } else if (ogCount > 0) {
          checkStatus = 'warn';
          foundText = `Partial Open Graph metadata (${ogCount}/4 key tags: og:title, og:description, og:image, og:url).`;
          valueFound = `${ogCount}/4 OG tags`;
        } else {
          checkStatus = 'warn';
          foundText = 'No Open Graph metadata found.';
          valueFound = '0/4 OG tags';
        }
        break;
      }

      case 'twitter_card': {
        if (signals.twitterCard) {
          checkStatus = 'pass';
          foundText = `Twitter card metadata configured: ${signals.twitterCard}`;
          valueFound = signals.twitterCard;
        } else {
          checkStatus = 'info';
          foundText = 'No Twitter / X card meta tags found (Open Graph will be used as fallback).';
        }
        break;
      }

      case 'robots_txt': {
        const hasRobots = Boolean(endpoints.robots?.ok && robotsTxt.trim().length > 5);
        if (hasRobots) {
          checkStatus = 'pass';
          foundText = 'Reachable /robots.txt discovered at domain root.';
          valueFound = '200 OK';
        } else {
          checkStatus = 'warn';
          foundText = 'Missing or unreachable /robots.txt file.';
        }
        break;
      }

      case 'sitemap_xml': {
        const hasSitemapFile = Boolean(endpoints.sitemap?.ok && sitemapBody.includes('<urlset'));
        const declaredInRobots = /sitemap:\s*https?:\/\/[^\s]+/i.test(robotsTxt);

        if (hasSitemapFile || declaredInRobots) {
          checkStatus = 'pass';
          foundText = hasSitemapFile
            ? 'Valid sitemap.xml reachable at /sitemap.xml.'
            : 'Sitemap URL declared in robots.txt.';
          valueFound = hasSitemapFile ? 'sitemap.xml (200 OK)' : 'Declared in robots.txt';
        } else {
          checkStatus = 'warn';
          foundText = 'No sitemap.xml found at root or referenced in robots.txt.';
        }
        break;
      }

      case 'robots_meta_indexable': {
        if (signals.isNoindex) {
          checkStatus = 'warn';
          foundText = `Page specifies noindex directive: "${signals.robotsMeta}". Search engines will not index this page.`;
          valueFound = 'noindex';
        } else {
          checkStatus = 'pass';
          foundText = 'Page is indexable (no blocking noindex meta tags).';
          valueFound = 'Indexable';
        }
        break;
      }

      case 'llms_txt': {
        const hasLlms = Boolean(endpoints.llms?.ok && (endpoints.llms.body || '').trim().length > 10);
        if (hasLlms) {
          checkStatus = 'pass';
          foundText = 'Modern AI discovery file /llms.txt found and verified.';
          valueFound = '/llms.txt';
        } else {
          checkStatus = 'info';
          foundText = 'No /llms.txt file found (optional AI readiness standard).';
        }
        break;
      }
    }

    results.push({
      id: def.id,
      name: def.name,
      description: def.description,
      category: def.category,
      severity: def.severity,
      weight: def.weight,
      status: checkStatus,
      found: foundText,
      recommendation: def.recommendation,
      codeExample: def.codeExample,
      value: valueFound,
    });
  }

  let earnedWeight = 0;
  let totalWeight = 0;

  const categoryScores: Record<BaselineCategory, { score: number; passed: number; total: number }> = {
    security: { score: 0, passed: 0, total: 0 },
    seo: { score: 0, passed: 0, total: 0 },
    dom: { score: 0, passed: 0, total: 0 },
    metadata: { score: 0, passed: 0, total: 0 },
    crawl: { score: 0, passed: 0, total: 0 },
  };

  const categoryWeights: Record<BaselineCategory, { earned: number; total: number }> = {
    security: { earned: 0, total: 0 },
    seo: { earned: 0, total: 0 },
    dom: { earned: 0, total: 0 },
    metadata: { earned: 0, total: 0 },
    crawl: { earned: 0, total: 0 },
  };

  let passedCount = 0;
  let warnCount = 0;
  let failCount = 0;
  let infoCount = 0;

  for (const r of results) {
    const cat = r.category;
    categoryScores[cat].total++;

    if (r.status === 'pass') {
      passedCount++;
      categoryScores[cat].passed++;
      earnedWeight += r.weight;
      totalWeight += r.weight;
      categoryWeights[cat].earned += r.weight;
      categoryWeights[cat].total += r.weight;
    } else if (r.status === 'warn') {
      warnCount++;
      earnedWeight += r.weight * 0.4;
      totalWeight += r.weight;
      categoryWeights[cat].earned += r.weight * 0.4;
      categoryWeights[cat].total += r.weight;
    } else if (r.status === 'fail') {
      failCount++;
      totalWeight += r.weight;
      categoryWeights[cat].total += r.weight;
    } else {
      infoCount++;
    }
  }

  for (const cat of Object.keys(categoryScores) as BaselineCategory[]) {
    const w = categoryWeights[cat];
    categoryScores[cat].score = w.total > 0 ? Math.round((w.earned / w.total) * 100) : 100;
  }

  const finalScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (finalScore >= 90) grade = 'A+';
  else if (finalScore >= 80) grade = 'A';
  else if (finalScore >= 70) grade = 'B';
  else if (finalScore >= 60) grade = 'C';
  else if (finalScore >= 50) grade = 'D';

  return {
    url: targetUrl,
    hostname,
    scanTimeMs,
    timestamp: new Date().toISOString(),
    score: finalScore,
    grade,
    passedCount,
    warnCount,
    failCount,
    infoCount,
    totalChecks: results.length,
    results,
    categoryScores,
  };
}

export function generateMarkdownReport(report: BaselineAuditReport): string {
  const lines: string[] = [
    `# Website Baseline Audit Report: ${report.hostname}`,
    ``,
    `- **URL**: ${report.url}`,
    `- **Score**: ${report.score} / 100 (Grade: ${report.grade})`,
    `- **Timestamp**: ${report.timestamp}`,
    `- **Summary**: ${report.passedCount} Passed, ${report.warnCount} Warnings, ${report.failCount} Failed, ${report.infoCount} Informational`,
    ``,
    `## Category Breakdown`,
    ``,
    `| Category | Score | Passed Checks |`,
    `| :--- | :--- | :--- |`,
    `| Security & Transport | ${report.categoryScores.security.score}% | ${report.categoryScores.security.passed}/${report.categoryScores.security.total} |`,
    `| SEO & Head Essentials | ${report.categoryScores.seo.score}% | ${report.categoryScores.seo.passed}/${report.categoryScores.seo.total} |`,
    `| Content & Semantic DOM | ${report.categoryScores.dom.score}% | ${report.categoryScores.dom.passed}/${report.categoryScores.dom.total} |`,
    `| Structured Data & Social | ${report.categoryScores.metadata.score}% | ${report.categoryScores.metadata.passed}/${report.categoryScores.metadata.total} |`,
    `| Crawlability & Discovery | ${report.categoryScores.crawl.score}% | ${report.categoryScores.crawl.passed}/${report.categoryScores.crawl.total} |`,
    ``,
    `## Audit Findings`,
    ``,
  ];

  for (const item of report.results) {
    const icon = item.status === 'pass' ? '✅ PASS' : item.status === 'warn' ? '⚠️ WARN' : item.status === 'fail' ? '❌ FAIL' : 'ℹ️ INFO';
    lines.push(`### [${icon}] ${item.name} (${item.category.toUpperCase()})`);
    lines.push(`- **Finding**: ${item.found}`);
    if (item.status !== 'pass') {
      lines.push(`- **Recommendation**: ${item.recommendation}`);
      if (item.codeExample) {
        lines.push(`- **Example**: \`${item.codeExample.replace(/\n/g, ' ')}\``);
      }
    }
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(`Generated with [Web Baseline Checker](https://iqverse.net/web-baseline/) on IQVerse.`);

  return lines.join('\n');
}
