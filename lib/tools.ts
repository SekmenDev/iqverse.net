export interface Tool {
  name: string;
  desc: string;
  icon: string;
  url: string;
  type: 'open' | 'saas' | 'coming';
  tags: string;
  cat: string;
  slug?: string;
  category?: string;
  description?: string;
  features?: string[];
  longDescription?: string;
}

export const tools: Tool[] = [
  // AI & Agents
  { name: "AI Agents Scanner", desc: "Scan any website for AI agent readiness. Inspect robots.txt, sitemaps, MCP configuration, OpenAPI specs, and metadata for AI crawler optimization.", icon: "🤖", url: "/agentscan/", type: "open", tags: "robots sitemap mcp oauth security ai agent", cat: "AI & Agents" },
  { name: "llms.txt Generator & Validator", desc: "Generate and validate llms.txt and llms-full.txt standard files to provide structured markdown site summaries for AI agents and LLM web crawlers.", icon: "🤖", url: "/llmstxt/", type: "open", tags: "llms txt generator validator ai agent crawl spec", cat: "AI & Agents" },
  { name: "Structured Data (Schema.org) Validator", desc: "Validate JSON-LD structured data and Schema.org markup online. Ensure rich snippet compatibility for search engines and AI web crawlers.", icon: "🏷️", url: "/schema-validator/", type: "open", tags: "schema jsonld structured data validator seo ai agent", cat: "AI & Agents" },
  { name: "AI Crawler Log Analyzer", desc: "Parse server access logs in your browser to analyze visits from AI crawlers like GPTBot, ClaudeBot, and PerplexityBot with zero data upload.", icon: "📊", url: "/ai-log-analyzer/", type: "open", tags: "ai crawler logs bot analyzer gptbot claudebot perplexity access", cat: "AI & Agents" },

  // Browser Tools
  { name: "QR Forge", desc: "Generate custom QR codes instantly from URLs, plain text, Wi-Fi credentials, and vCards with SVG or PNG export directly in your browser.", icon: "▦", url: "/qrforge/", type: "open", tags: "qr code svg png generate wifi vcard", cat: "Browser Tools" },
  { name: "Link Radar", desc: "Scan web pages to detect broken links, 404 errors, and redirect loops instantly in your browser with no server processing required.", icon: "🔗", url: "/linkradar/", type: "open", tags: "links 404 redirect scan broken crawl", cat: "Browser Tools" },
  { name: "Favicon Generator", desc: "Convert any image into browser favicons, Apple touch icons, and web manifest.json files in all required sizes locally.", icon: "🏷️", url: "/favicongen/", type: "open", tags: "favicon icon manifest apple touch 16 32 180", cat: "Browser Tools" },
  { name: "JSON Formatter", desc: "Format, validate, minify, and sort JSON data online. Fast, browser-native JSON beautifier and linter with zero server tracking.", icon: "{ }", url: "/json/", type: "open", tags: "json format validate minify lint sort", cat: "Browser Tools" },
  { name: "Base64 & URL Encoder", desc: "Encode and decode Base64 strings, URL parameters, JWT tokens, and Data URIs instantly with client-side privacy.", icon: "⇄", url: "/encodelab/", type: "open", tags: "base64 url encode decode jwt data uri", cat: "Browser Tools" },
  { name: "URL Tools", desc: "Parse, inspect, encode, decode, and build web URLs. Manage query string parameters visually right inside your browser.", icon: "🌐", url: "/url/", type: "open", tags: "url parse build encode decode query string", cat: "Browser Tools" },
  { name: "Compression", desc: "Compress and decompress text strings using browser-native Deflate and Gzip algorithms with Base64 output.", icon: "🗜️", url: "/compression/", type: "open", tags: "compress decompress deflate base64 text", cat: "Browser Tools" },
  { name: "Data Converter", desc: "Convert between JSON, CSV, Hex, and Base64 data formats locally. Fast client-side data transformer with zero file uploads.", icon: "🔁", url: "/dataconverter/", type: "open", tags: "json csv hex base64 convert format", cat: "Browser Tools" },
  { name: "RegEx Forge", desc: "Build, test, and debug regular expressions online with real-time string matching, group syntax highlighting, and pattern explanations.", icon: "∑", url: "/regex/", type: "open", tags: "regex regexp pattern match test explain", cat: "Browser Tools" },
  { name: "Image Optimizer", desc: "Compress and optimize PNG, JPEG, and WebP images directly in your browser without quality loss or uploading files.", icon: "🖼️", url: "/imageoptimizer/", type: "open", tags: "image compress webp png jpeg optimize performance", cat: "Browser Tools" },
  { name: "CSV Viewer & Converter", desc: "Inspect and parse CSV files in an interactive data table. Convert CSV to JSON, Markdown, or SQL insert statements effortlessly.", icon: "📊", url: "/csvviewer/", type: "open", tags: "csv json sql table data convert format", cat: "Browser Tools" },
  { name: "Diff Checker", desc: "Compare text, JSON, and code snippets side-by-side with live line-by-line diff highlighting and inline comparison.", icon: "🔀", url: "/diff-checker/", type: "open", tags: "diff compare text json code side-by-side highlight", cat: "Browser Tools" },
  { name: "Markdown Previewer", desc: "Write and preview Markdown with real-time HTML rendering, syntax highlighting, GitHub Flavored Markdown support, and file export.", icon: "📝", url: "/markdown-preview/", type: "open", tags: "markdown md html preview render export editor", cat: "Browser Tools" },
  { name: "Lorem Ipsum & Fake Data Generator", desc: "Generate realistic mock data including names, emails, addresses, numbers, and JSON objects locally for development testing.", icon: "🎲", url: "/fake-data-generator/", type: "open", tags: "lorem ipsum fake mock data generate names json", cat: "Browser Tools" },
  { name: "UUID / ULID Generator", desc: "Batch generate cryptographically secure UUID v4 identifiers and lexicographically sortable ULIDs with quick copy.", icon: "🆔", url: "/uuid-ulid-generator/", type: "open", tags: "uuid ulid guid generate random batch id", cat: "Browser Tools" },
  { name: "Cron Expression Builder", desc: "Build and test cron expressions visually. Translate cron syntax into plain English descriptions and view upcoming execution schedules.", icon: "⏰", url: "/cron-builder/", type: "open", tags: "cron expression schedule time generator parser", cat: "Browser Tools" },
  { name: "Timestamp Converter", desc: "Convert Unix epoch timestamps to ISO 8601, UTC, and local date formats instantly with multi-timezone support.", icon: "🕒", url: "/timestamp-converter/", type: "open", tags: "timestamp unix epoch iso8601 date time timezone convert", cat: "Browser Tools" },
  { name: "Text Case Converter", desc: "Convert text between camelCase, snake_case, kebab-case, PascalCase, Title Case, and UPPERCASE string formats instantly.", icon: "🔤", url: "/case-converter/", type: "open", tags: "case convert camelcase snakecase kebabcase titlecase string", cat: "Browser Tools" },
  { name: "YAML / JSON / TOML Converter", desc: "Convert configuration files seamlessly between YAML, JSON, and TOML formats with syntax validation in your browser.", icon: "🔄", url: "/yaml-json-toml/", type: "open", tags: "yaml json toml convert format parser config", cat: "Browser Tools" },
  { name: "Sitemap Generator", desc: "Generate XML sitemaps for website URLs and paths. Optimize SEO crawling and search engine indexing effortlessly.", icon: "🗺️", url: "/sitemap-generator/", type: "open", tags: "sitemap xml crawl seo url generator agent", cat: "Browser Tools" },
  { name: "robots.txt Generator & Validator", desc: "Create and validate robots.txt files for search engine crawlers and AI search bots with customized allow/disallow rules.", icon: "🤖", url: "/robots-generator/", type: "open", tags: "robots txt generator validator crawler useragent allow disallow", cat: "Browser Tools" },
  { name: "Meta Tag & Open Graph Previewer", desc: "Preview how your web page meta tags and Open Graph cards look on Google, Twitter/X, Facebook, and LinkedIn.", icon: "👁️", url: "/og-preview/", type: "open", tags: "meta tag og opengraph preview twitter facebook card seo", cat: "Browser Tools" },
  { name: "HTTP Status Code Reference", desc: "Searchable guide for HTTP status codes (1xx-5xx), headers, and API response rules with practical developer examples.", icon: "📗", url: "/http-status/", type: "open", tags: "http status code 200 404 500 reference header rest", cat: "Browser Tools" },
  { name: "CORS Tester", desc: "Test cross-origin resource sharing (CORS) headers, origins, and preflight OPTIONS responses for API endpoints.", icon: "📡", url: "/cors-tester/", type: "open", tags: "cors options origin headers api test preflight", cat: "Browser Tools" },
  { name: "Webhook Inspector", desc: "Test, inspect, and debug incoming HTTP webhook payloads, headers, and request bodies in real time directly in your browser.", icon: "🪝", url: "/webhook-inspector/", type: "open", tags: "webhook payload inspect echo request debug http", cat: "Browser Tools" },
  { name: "Cookie Inspector", desc: "Parse and inspect HTTP Cookie and Set-Cookie response headers for SameSite, Secure, HttpOnly, and Max-Age security flags.", icon: "🍪", url: "/cookie-inspector/", type: "open", tags: "cookie parse inspect samesite secure httpOnly session", cat: "Browser Tools" },

  // Security
  { name: "Password Generator", desc: "Generate cryptographically secure passwords, API keys, and secret tokens locally with entropy evaluation and zero network calls.", icon: "🔑", url: "/password/", type: "open", tags: "password secret random secure generate entropy", cat: "Security" },
  { name: "HeaderScan", desc: "Analyze HTTP response headers for any web URL. Inspect security policies, cache directives, server configurations, and CSP.", icon: "▤", url: "/headers/", type: "open", tags: "http headers security inspect network response", cat: "Security" },
  { name: "Hashing", desc: "Calculate cryptographic SHA-256, SHA-512, MD5, and HMAC hashes locally in your browser with hex or Base64 encoding.", icon: "🔒", url: "/hashing/", type: "open", tags: "hash sha hmac digest security crypto", cat: "Security" },
  { name: "SSL / TLS Certificate Inspector", desc: "Check SSL/TLS certificate details, expiration dates, domain matches, issuer authority, and trust chain validation.", icon: "📜", url: "/ssl-inspector/", type: "open", tags: "ssl tls certificate expiry issuer chain https security", cat: "Security" },
  { name: "JWT Debugger & Verifier", desc: "Decode, inspect, and verify JSON Web Tokens (JWT) headers and payload claims locally using Web Crypto API.", icon: "🔑", url: "/jwt-debugger/", type: "open", tags: "jwt decode verify signature token claim header security", cat: "Security" },
  { name: "CSP Header Builder", desc: "Build and validate custom Content Security Policy (CSP) headers to defend web applications against XSS and injection attacks.", icon: "🛡️", url: "/csp-builder/", type: "open", tags: "csp content security policy header builder directives XSS", cat: "Security" },
  { name: "Password Strength & Entropy Analyzer", desc: "Evaluate password security strength, bit entropy score, pattern detection, and estimated crack time entirely offline.", icon: "💪", url: "/password-analyzer/", type: "open", tags: "password strength entropy zxcvbn security crack time", cat: "Security" },
  { name: "File Hash Verifier", desc: "Verify file integrity by calculating MD5, SHA-1, SHA-256, and SHA-512 checksums locally without uploading files.", icon: "✔️", url: "/file-hash/", type: "open", tags: "file hash checksum sha256 sha512 md5 verify integrity", cat: "Security" },

  // Design
  { name: "Color Palette Generator", desc: "Generate color palettes, extract dominant colors from images, and export HEX, RGB, and HSL color values.", icon: "🎨", url: "/chromata/", type: "open", tags: "color palette css design hex rgb hsl", cat: "Design" },
  { name: "CSS Units Converter", desc: "Convert CSS units between pixels (px), rem, em, viewports (vw/vh), and percentages with live responsive preview.", icon: "📐", url: "/cssunits/", type: "open", tags: "css units rem px em vw convert design", cat: "Design" },
  { name: "SVG Optimizer", desc: "Optimize and minify SVG markup. Strip metadata, clean attributes, and compress vector graphic code for web performance.", icon: "✨", url: "/svg-optimizer/", type: "open", tags: "svg optimize minify svgo vector cleanup graphics", cat: "Design" },
  { name: "CSS Gradient Builder", desc: "Design linear, radial, and conic CSS gradients visually. Adjust color stops and export production-ready CSS code.", icon: "🌈", url: "/gradient-builder/", type: "open", tags: "css gradient linear radial conic visual design color", cat: "Design" },
  { name: "Image Format Converter", desc: "Convert images between PNG, JPEG, WebP, and AVIF formats with resolution scaling and quality controls in your browser.", icon: "🖼️", url: "/image-converter/", type: "open", tags: "image convert webp png jpeg avif canvas resize", cat: "Design" },
  { name: "Icon & Sprite Sheet Generator", desc: "Combine multiple PNG/SVG icons into optimized image sprite sheets with automatically generated CSS classes and JSON maps.", icon: "🧩", url: "/sprite-generator/", type: "open", tags: "sprite sheet icon canvas css mapping export assets", cat: "Design" },
  { name: "WCAG Contrast Checker", desc: "Test web color contrast ratios against WCAG 2.1 AA and AAA accessibility standards for text and UI components.", icon: "🎨", url: "/wcag-contrast/", type: "open", tags: "contrast ratio wcag accessibility color aa aaa compliance", cat: "Design" },

  // Network
  { name: "DNS Lookup", desc: "Perform online DNS queries for A, AAAA, MX, TXT, NS, CNAME, SOA, and SRV records using DNS-over-HTTPS.", icon: "⌁", url: "/dnslookup/", type: "open", tags: "dns domain mx txt a aaaa cname ns lookup", cat: "Network" },
  { name: "IP Info & Geolocation Lookup", desc: "Lookup IP address details including country geolocation, ISP organization, ASN routing data, and network hostnames.", icon: "📍", url: "/ip-lookup/", type: "open", tags: "ip lookup geolocation asn isp network routing info", cat: "Network" },
  { name: "Ping & Traceroute Visualizer", desc: "Test network latency, packet round-trip time, and visualize traceroute hop paths to any domain or IP address in real time.", icon: "📈", url: "/ping-visualizer/", type: "open", tags: "ping traceroute latency hops network route visualize", cat: "Network" },
  { name: "Port Status & Reference Guide", desc: "Explore common TCP and UDP network port numbers, protocol service definitions, and reachability status references.", icon: "🔌", url: "/port-reference/", type: "open", tags: "port tcp udp scan reference service status network", cat: "Network" },
  { name: "WHOIS & RDAP Lookup", desc: "Query domain WHOIS and RDAP records to inspect registration status, domain registrar, nameservers, and expiration dates.", icon: "🔍", url: "/whois-lookup/", type: "open", tags: "whois rdap domain registrar lookup expiration status", cat: "Network" },

  // Desktop
  { name: "Volumer", desc: "Control system volume via mouse wheel on the Windows taskbar", icon: "🖱️", url: "https://github.com/atagulalan/volumer", type: "open", tags: "windows volume taskbar mouse wheel utility tray", cat: "Desktop" },
  { name: "Listmonk", desc: "Self-hosted mailing list and newsletter platform", icon: "📧", url: "https://github.com/knadh/listmonk", type: "open", tags: "newsletter email mailing list self-hosted smtp", cat: "Desktop" },
  { name: "Cap", desc: "Open-source screen capture and sharing tool", icon: "🎥", url: "https://github.com/tiagozip/cap", type: "open", tags: "screen capture recording sharing open source", cat: "Desktop" },
  { name: "LocalSend", desc: "Secure local network file sharing with zero cloud or accounts. (Note: P2P transfer bypasses enterprise DLP/email gateways)", icon: "📡", url: "https://github.com/localsend/localsend", type: "open", tags: "p2p file sharing local network privacy cross-platform", cat: "Desktop" },
  { name: "Bruno", desc: "Fast and Git-friendly open-source API client. Desktop client is free & open-source (team sync uses paid tiers).", icon: "🐶", url: "https://github.com/usebruno/bruno", type: "open", tags: "api client postman alternative rest graphql git desktop", cat: "Desktop" },
  { name: "Mailpit", desc: "Actively-maintained email testing server & UI — the modern successor to MailHog for local web development.", icon: "📬", url: "https://github.com/axllent/mailpit", type: "open", tags: "email testing smtp mailhog developer local server", cat: "Desktop" },

  // SaaS
  { name: "GOO: School Platform", desc: "GOO is a modular school management platform for student records, attendance tracking, grade reporting, timetables, and parent communication.", icon: "🎓", url: "/goo/", type: "saas", tags: "school education attendance grades timetable", cat: "SaaS" },
  { name: "GES: Quiz Platform", desc: "GES is an interactive quiz platform to create online assessments, deliver tests, and track student performance in real time.", icon: "❓", url: "/ges/", type: "saas", tags: "quiz assessment education analytics reports", cat: "SaaS" },
  { name: "GYP: License Tracker", desc: "GYP is a software license and client management platform for tracking client subscriptions, license keys, billing, and support requests.", icon: "📜", url: "/gyp/", type: "saas", tags: "license crm billing clients software management", cat: "SaaS" },
  { name: "GST: Stock Tracker", desc: "GST is a mobile-first inventory and expense tracking web app designed for small workshops, business stock, and materials management.", icon: "📦", url: "/gst/", type: "saas", tags: "inventory stock expense mobile pwa shop", cat: "SaaS" },
];

export function getUniqueCategories(): string[] {
  const cats = new Set(tools.map(t => t.cat));
  return ["all", ...Array.from(cats).sort((a, b) => a.localeCompare(b))];
}

export function getUniqueStatuses(): Array<Tool['type'] | 'all'> {
  return ["all", "open", "saas", "coming"];
}

export function filterTools(query: string, category: string, status: string | 'all' | Tool['type']): Tool[] {
  const lq = query.toLowerCase().trim();
  let filtered = [...tools];

  if (category !== "all") {
    filtered = filtered.filter(t => t.cat === category);
  }

  if (status !== "all") {
    filtered = filtered.filter(t => t.type === status);
  }

  if (lq) {
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(lq) ||
      t.desc.toLowerCase().includes(lq) ||
      t.tags.toLowerCase().includes(lq) ||
      t.cat.toLowerCase().includes(lq)
    );
  }

  return filtered;
}

export function sortTools(tools: Tool[], sortBy: 'default' | 'az'): Tool[] {
  if (sortBy === 'az') {
    return [...tools].sort((a, b) => a.name.localeCompare(b.name));
  }
  return tools;
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find(t => t.url === `/${slug}/`);
}

export function getSecureRandomNumber(min: number, max: number): number {
  if (typeof globalThis.crypto?.getRandomValues !== 'function') {
    throw new TypeError('Secure random generation is unavailable in this environment.');
  }

  const randomValue = globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
  const ratio = randomValue / 0x100000000;
  return min + ratio * (max - min);
}

export function getToolMetadata(slug: string) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;

  return {
    title: `${tool.name} | IQVerse`,
    description: tool.desc,
    alternates: {
      canonical: `https://iqverse.net/${slug}/`,
    },
    openGraph: {
      title: tool.name,
      description: tool.desc,
      url: `https://iqverse.net/${slug}/`,
    },
  };
}
