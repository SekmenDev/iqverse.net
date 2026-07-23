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
  { name: "AI Agents Scanner", desc: "Check your site's AI agent readiness: robots.txt, sitemap, MCP and more", icon: "/agentscan/logoX4.png", url: "/agentscan/", type: "open", tags: "robots sitemap mcp oauth security ai agent", cat: "AI & Agents" },
  { name: "llms.txt Generator & Validator", desc: "Create and validate llms.txt standard files for AI crawler site summaries", icon: "🤖", url: "", type: "coming", tags: "llms txt generator validator ai agent crawl spec", cat: "AI & Agents" },
  { name: "Structured Data (Schema.org) Validator", desc: "Test JSON-LD structured data and Schema.org markup for AI agents and search crawlers", icon: "🏷️", url: "", type: "coming", tags: "schema jsonld structured data validator seo ai agent", cat: "AI & Agents" },
  { name: "AI Crawler Log Analyzer", desc: "Parse server access logs locally to identify and analyze visits from GPTBot, ClaudeBot, and PerplexityBot", icon: "📊", url: "", type: "coming", tags: "ai crawler logs bot analyzer gptbot claudebot perplexity access", cat: "AI & Agents" },

  // Browser Tools
  { name: "QR Forge", desc: "Generate QR codes from URLs, plain text, Wi-Fi credentials and vCards", icon: "/qrforge/logoX4.png", url: "/qrforge/", type: "open", tags: "qr code svg png generate wifi vcard", cat: "Browser Tools" },
  { name: "Link Radar", desc: "Find broken links and 404s in any webpage instantly", icon: "/linkradar/logoX4.png", url: "/linkradar/", type: "open", tags: "links 404 redirect scan broken crawl", cat: "Browser Tools" },
  { name: "Favicon Generator", desc: "Create favicons in all required sizes plus manifest.json", icon: "/favicongen/logoX4.png", url: "/favicongen/", type: "open", tags: "favicon icon manifest apple touch 16 32 180", cat: "Browser Tools" },
  { name: "JSON Formatter", desc: "Format, validate, minify and sort keys in your JSON. No upload needed", icon: "/json/logoX4.png", url: "/json/", type: "open", tags: "json format validate minify lint sort", cat: "Browser Tools" },
  { name: "Base64 & URL Encoder", desc: "Encode/decode Base64, URL parameters, JWT tokens and Data URIs", icon: "/encodelab/logoX4.png", url: "/encodelab/", type: "open", tags: "base64 url encode decode jwt data uri", cat: "Browser Tools" },
  { name: "URL Tools", desc: "Parse, build, encode and decode URLs with query parameter editing in the browser.", icon: "🌐", url: "/url/", type: "open", tags: "url parse build encode decode query string", cat: "Browser Tools" },
  { name: "Compression", desc: "Compress and decompress text using browser-native Deflate support.", icon: "🗜️", url: "/compression/", type: "open", tags: "compress decompress deflate base64 text", cat: "Browser Tools" },
  { name: "Data Converter", desc: "Convert JSON, CSV, Hex, and Base64 data in the browser without uploading anything.", icon: "🔁", url: "/dataconverter/", type: "open", tags: "json csv hex base64 convert format", cat: "Browser Tools" },
  { name: "RegEx Forge", desc: "Build and test regular expressions with live highlighting and explanations", icon: "/regex/logoX4.png", url: "/regex/", type: "open", tags: "regex regexp pattern match test explain", cat: "Browser Tools" },
  { name: "Image Optimizer", desc: "Compress PNG, JPEG and WebP in-browser while keeping files local", icon: "🖼️", url: "/imageoptimizer/", type: "open", tags: "image compress webp png jpeg optimize performance", cat: "Browser Tools" },
  { name: "CSV Viewer & Converter", desc: "View CSV as a sortable table, export to JSON, Markdown or SQL", icon: "📊", url: "/csvviewer/", type: "open", tags: "csv json sql table data convert format", cat: "Browser Tools" },
  { name: "Diff Checker", desc: "Side-by-side text, JSON and code diff viewer with live change highlighting", icon: "📑", url: "", type: "coming", tags: "diff compare text json code side-by-side highlight", cat: "Browser Tools" },
  { name: "Markdown Previewer", desc: "Live Markdown to HTML renderer with instant preview and file export", icon: "📝", url: "", type: "coming", tags: "markdown md html preview render export editor", cat: "Browser Tools" },
  { name: "Lorem Ipsum & Fake Data Generator", desc: "Generate names, addresses, emails and mock JSON data batches locally", icon: "🎲", url: "", type: "coming", tags: "lorem ipsum fake mock data generate names json", cat: "Browser Tools" },
  { name: "UUID / ULID Generator", desc: "Batch generate cryptographically secure UUID v4 and sortable ULIDs with one-click copy", icon: "🆔", url: "", type: "coming", tags: "uuid ulid guid generate random batch id", cat: "Browser Tools" },
  { name: "Cron Expression Builder", desc: "Visual cron schedule generator with human-readable explanations and next execution times", icon: "⏰", url: "", type: "coming", tags: "cron expression schedule time generator parser", cat: "Browser Tools" },
  { name: "Timestamp Converter", desc: "Convert Unix timestamps to ISO 8601 and human-readable dates with timezone support", icon: "🕒", url: "", type: "coming", tags: "timestamp unix epoch iso8601 date time timezone convert", cat: "Browser Tools" },
  { name: "Text Case Converter", desc: "Toggle between camelCase, snake_case, kebab-case, Title Case and UPPERCASE instantly", icon: "🔤", url: "", type: "coming", tags: "case convert camelcase snakecase kebabcase titlecase string", cat: "Browser Tools" },
  { name: "YAML / JSON / TOML Converter", desc: "Convert seamlessly between YAML, JSON and TOML formats directly in your browser", icon: "🔄", url: "", type: "coming", tags: "yaml json toml convert format parser config", cat: "Browser Tools" },
  { name: "Sitemap Generator", desc: "Crawl web pages or paths to build XML sitemaps ready for search engine indexing", icon: "🗺️", url: "", type: "coming", tags: "sitemap xml crawl seo url generator agent", cat: "Browser Tools" },
  { name: "robots.txt Generator & Validator", desc: "Build and test robots.txt directives for web crawlers and AI search bots", icon: "🤖", url: "", type: "coming", tags: "robots txt generator validator crawler useragent allow disallow", cat: "Browser Tools" },
  { name: "Meta Tag & Open Graph Previewer", desc: "Preview social card appearance across Google, X/Twitter, Facebook and LinkedIn", icon: "👁️", url: "", type: "coming", tags: "meta tag og opengraph preview twitter facebook card seo", cat: "Browser Tools" },
  { name: "HTTP Status Code Reference", desc: "Searchable reference of HTTP status codes, standard headers and response scenarios", icon: "📗", url: "", type: "coming", tags: "http status code 200 404 500 reference header rest", cat: "Browser Tools" },
  { name: "CORS Tester", desc: "Test CORS configuration and header response rules for API endpoints", icon: "📡", url: "", type: "coming", tags: "cors options origin headers api test preflight", cat: "Browser Tools" },
  { name: "Webhook Inspector", desc: "Inspect and debug incoming HTTP webhook payloads and request headers in real time", icon: "🪝", url: "", type: "coming", tags: "webhook payload inspect echo request debug http", cat: "Browser Tools" },
  { name: "Cookie Inspector", desc: "Parse and inspect raw Cookie and Set-Cookie headers for SameSite, Secure and Max-Age flags", icon: "🍪", url: "", type: "coming", tags: "cookie parse inspect samesite secure httpOnly session", cat: "Browser Tools" },

  // Security
  { name: "Password Generator", desc: "Generate strong passwords and secrets. All generation happens locally", icon: "/password/logoX4.png", url: "/password/", type: "open", tags: "password secret random secure generate entropy", cat: "Security" },
  { name: "HeaderScan", desc: "Inspect HTTP response headers for any URL with detailed breakdowns", icon: "/headers/logoX4.png", url: "/headers/", type: "open", tags: "http headers security inspect network response", cat: "Security" },
  { name: "Hashing", desc: "Compute SHA digests and HMAC values locally in your browser with hex or Base64 output.", icon: "🔒", url: "/hashing/", type: "open", tags: "hash sha hmac digest security crypto", cat: "Security" },
  { name: "SSL / TLS Certificate Inspector", desc: "Inspect SSL/TLS certificate validity, issuer details, expiration and trust chain", icon: "📜", url: "", type: "coming", tags: "ssl tls certificate expiry issuer chain https security", cat: "Security" },
  { name: "JWT Debugger & Verifier", desc: "Decode JWT headers and claims, and verify signatures locally using Web Crypto API", icon: "🔑", url: "", type: "coming", tags: "jwt decode verify signature token claim header security", cat: "Security" },
  { name: "CSP Header Builder", desc: "Interactive Content-Security-Policy generator and security directive validator", icon: "🛡️", url: "", type: "coming", tags: "csp content security policy header builder directives XSS", cat: "Security" },
  { name: "Password Strength & Entropy Analyzer", desc: "Evaluate password strength, calculate bit entropy, and estimate crack time offline", icon: "💪", url: "", type: "coming", tags: "password strength entropy zxcvbn security crack time", cat: "Security" },
  { name: "File Hash Verifier", desc: "Calculate and compare MD5, SHA-1, SHA-256 and SHA-512 hashes of local files", icon: "✔️", url: "", type: "coming", tags: "file hash checksum sha256 sha512 md5 verify integrity", cat: "Security" },

  // Design
  { name: "Color Palette Generator", desc: "Create harmonious color palettes and extract colors from images", icon: "/chromata/logoX4.png", url: "/chromata/", type: "open", tags: "color palette css design hex rgb hsl", cat: "Design" },
  { name: "CSS Units Converter", desc: "Convert px, rem, em, vw, vh and more with live browser context", icon: "📐", url: "/cssunits/", type: "open", tags: "css units rem px em vw convert design", cat: "Design" },
  { name: "SVG Optimizer", desc: "Minify and clean inline SVG markup by stripping redundant metadata and attributes", icon: "✨", url: "", type: "coming", tags: "svg optimize minify svgo vector cleanup graphics", cat: "Design" },
  { name: "CSS Gradient Builder", desc: "Visual linear, radial and conic CSS gradient generator with CSS code export", icon: "🌈", url: "", type: "coming", tags: "css gradient linear radial conic visual design color", cat: "Design" },
  { name: "Image Format Converter", desc: "Convert PNG, JPEG, WebP and AVIF formats with canvas scaling and quality controls", icon: "🖼️", url: "", type: "coming", tags: "image convert webp png jpeg avif canvas resize", cat: "Design" },
  { name: "Icon & Sprite Sheet Generator", desc: "Combine multiple icons into a single sprite sheet with CSS and JSON coordinates", icon: "🧩", url: "", type: "coming", tags: "sprite sheet icon canvas css mapping export assets", cat: "Design" },
  { name: "WCAG Contrast Checker", desc: "Calculate contrast ratios for foreground/background colors with WCAG AA/AAA compliance badges", icon: "🎨", url: "", type: "coming", tags: "contrast ratio wcag accessibility color aa aaa compliance", cat: "Design" },

  // Network
  { name: "DNS Lookup", desc: "Query A, AAAA, MX, TXT, CNAME and NS records for any domain", icon: "/dnslookup/logoX4.png", url: "/dnslookup/", type: "open", tags: "dns domain mx txt a aaaa cname ns lookup", cat: "Network" },
  { name: "IP Info & Geolocation Lookup", desc: "Inspect IP address geolocation, ASN, ISP details and network routing information", icon: "📍", url: "", type: "coming", tags: "ip lookup geolocation asn isp network routing info", cat: "Network" },
  { name: "Ping & Traceroute Visualizer", desc: "Visualize network latency and hop trace routes via backend diagnostic relay", icon: "📈", url: "", type: "coming", tags: "ping traceroute latency hops network route visualize", cat: "Network" },
  { name: "Port Status & Reference Guide", desc: "Common TCP/UDP port reference guide with service definitions and reachability status checks", icon: "🔌", url: "", type: "coming", tags: "port tcp udp scan reference service status network", cat: "Network" },
  { name: "WHOIS & RDAP Lookup", desc: "Query domain registration metadata, registrar details and expiration timelines via RDAP", icon: "🔍", url: "", type: "coming", tags: "whois rdap domain registrar lookup expiration status", cat: "Network" },

  // Desktop
  { name: "Volumer", desc: "Control system volume via mouse wheel on the Windows taskbar", icon: "🖱️", url: "https://github.com/atagulalan/volumer", type: "open", tags: "windows volume taskbar mouse wheel utility tray", cat: "Desktop" },
  { name: "Listmonk", desc: "Self-hosted mailing list and newsletter platform", icon: "📧", url: "https://github.com/knadh/listmonk", type: "open", tags: "newsletter email mailing list self-hosted smtp", cat: "Desktop" },
  { name: "Cap", desc: "Open-source screen capture and sharing tool", icon: "🎥", url: "https://github.com/tiagozip/cap", type: "open", tags: "screen capture recording sharing open source", cat: "Desktop" },
  { name: "LocalSend", desc: "Secure local network file sharing with zero cloud or accounts. (Note: P2P transfer bypasses enterprise DLP/email gateways)", icon: "📡", url: "https://github.com/localsend/localsend", type: "open", tags: "p2p file sharing local network privacy cross-platform", cat: "Desktop" },
  { name: "Bruno", desc: "Fast and Git-friendly open-source API client. Desktop client is free & open-source (team sync uses paid tiers).", icon: "🐶", url: "https://github.com/usebruno/bruno", type: "open", tags: "api client postman alternative rest graphql git desktop", cat: "Desktop" },
  { name: "Mailpit", desc: "Actively-maintained email testing server & UI — the modern successor to MailHog for local web development.", icon: "📬", url: "https://github.com/axllent/mailpit", type: "open", tags: "email testing smtp mailhog developer local server", cat: "Desktop" },

  // SaaS
  { name: "GOO: School Platform", desc: "Student records, attendance, grades, timetables and parent communication", icon: "/goo/logoX4.png", url: "/goo/", type: "saas", tags: "school education attendance grades timetable", cat: "SaaS" },
  { name: "GES: Quiz Platform", desc: "Create and deploy quizzes, track student performance in real-time", icon: "/ges/logoX4.png", url: "/ges/", type: "saas", tags: "quiz assessment education analytics reports", cat: "SaaS" },
  { name: "GYP: License Tracker", desc: "Manage clients, software licenses, payments and service requests", icon: "/gyp/logoX4.png", url: "/gyp/", type: "saas", tags: "license crm billing clients software management", cat: "SaaS" },
  { name: "GST: Stock Tracker", desc: "Inventory and expense tracking for small workshops, mobile-first PWA", icon: "/gst/logoX4.png", url: "/gst/", type: "saas", tags: "inventory stock expense mobile pwa shop", cat: "SaaS" },
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
    openGraph: {
      title: tool.name,
      description: tool.desc,
      url: `https://iqverse.net/${slug}/`,
    },
  };
}
