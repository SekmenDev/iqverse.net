export const CATEGORIES = [
  'AI & Agents',
  'Browser Tools',
  'Security',
  'Design',
  'Network',
  'Desktop',
  'SaaS',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ToolType = 'open' | 'saas' | 'coming';

export interface Tool {
  name: string;
  desc: string;
  icon: string;
  url: string;
  type: ToolType;
  tags: string;
  cats: [Category, ...Category[]];
  aliases?: string;
}

export const CATEGORY_ICONS: Record<Category, string> = {
  'AI & Agents': '🤖',
  'Browser Tools': '🧰',
  Security: '🔒',
  Design: '🎨',
  Network: '🌐',
  Desktop: '🖥️',
  SaaS: '☁️',
};

export const STATUS_ICONS: Record<ToolType, string> = { open: '✦', saas: '◈', coming: '◌' };

export const STATUS_LABELS: Record<ToolType, string> = {
  open: 'Open Source',
  saas: 'SaaS',
  coming: 'Coming Soon',
};

export const tools: Tool[] = [
  // AI & Agents
  { name: "AI Agents Scanner", desc: "Scan any website for AI agent readiness. Inspect robots.txt, sitemaps, MCP configuration, OpenAPI specs and metadata for AI crawler optimization.", icon: "🤖", url: "/agentscan/", type: "open", tags: "robots sitemap mcp oauth security ai agent", cats: ["AI & Agents", "Browser Tools", "Security"], aliases: "agent readiness llm crawler audit mcp discovery" },
  { name: "llms.txt Generator & Validator", desc: "Generate and validate llms.txt and llms-full.txt standard files to provide structured markdown site summaries for AI agents and LLM web crawlers.", icon: "🤖", url: "/llmstxt/", type: "open", tags: "llms txt generator validator ai agent crawl spec", cats: ["AI & Agents", "Browser Tools"], aliases: "llmstxt llms-full ai manifest chatgpt claude perplexity" },
  { name: "Structured Data (Schema.org) Validator", desc: "Validate JSON-LD structured data and Schema.org markup online. Ensure rich snippet compatibility for search engines and AI web crawlers.", icon: "🏷️", url: "/schema-validator/", type: "open", tags: "schema jsonld structured data validator seo ai agent", cats: ["AI & Agents", "Browser Tools"], aliases: "rich snippet microdata rdfa google structured markup" },
  { name: "AI Crawler Log Analyzer", desc: "Parse server access logs in your browser to analyze visits from AI crawlers like GPTBot, ClaudeBot and PerplexityBot with zero data upload.", icon: "📊", url: "/ai-log-analyzer/", type: "open", tags: "ai crawler logs bot analyzer gptbot claudebot perplexity access", cats: ["AI & Agents", "Security"], aliases: "access log nginx apache useragent bot traffic" },

  // Browser Tools
  { name: "Web Baseline Checker", desc: "Audit any website against core web standards and baseline hygiene: HTTPS, favicon, title, viewport, H1, header, footer, schema, robots.txt, sitemap.xml and security headers.", icon: "🛡️", url: "/web-baseline/", type: "open", tags: "baseline audit checklist website seo https favicon robots sitemap schema h1 header footer viewport security web standards", cats: ["Browser Tools", "Security", "AI & Agents"], aliases: "site audit lighthouse seo checkup web vitals hygiene" },
  { name: "QR Forge", desc: "Generate custom QR codes instantly from URLs, plain text, Wi-Fi credentials and vCards with SVG or PNG export directly in your browser.", icon: "▦", url: "/qrforge/", type: "open", tags: "qr code svg png generate wifi vcard", cats: ["Browser Tools", "Design"], aliases: "qrcode barcode scan contact card" },
  { name: "Link Radar", desc: "Scan web pages to detect broken links, 404 errors and redirect loops instantly in your browser with no server processing required.", icon: "🔗", url: "/linkradar/", type: "open", tags: "links 404 redirect scan broken crawl", cats: ["Browser Tools", "Network"], aliases: "dead link checker link rot broken url crawler" },
  { name: "Favicon Generator", desc: "Convert any image into browser favicons, Apple touch icons and web manifest.json files in all required sizes locally.", icon: "🏷️", url: "/favicongen/", type: "open", tags: "favicon icon manifest apple touch 16 32 180", cats: ["Browser Tools", "Design"], aliases: "site icon ico pwa manifest touch icon" },
  { name: "JSON Formatter", desc: "Format, validate, minify and sort JSON data online. Fast, browser-native JSON beautifier and linter with zero server tracking.", icon: "{ }", url: "/json/", type: "open", tags: "json format validate minify lint sort", cats: ["Browser Tools"], aliases: "beautify pretty print prettify unminify parse" },
  { name: "Base64 & URL Encoder", desc: "Encode and decode Base64 strings, URL parameters, JWT tokens and Data URIs instantly with client-side privacy.", icon: "⇄", url: "/encodelab/", type: "open", tags: "base64 url encode decode jwt data uri", cats: ["Browser Tools", "Security"], aliases: "b64 atob btoa percent encoding urlencode datauri" },
  { name: "URL Tools", desc: "Parse, inspect, encode, decode and build web URLs. Manage query string parameters visually right inside your browser.", icon: "🌐", url: "/url/", type: "open", tags: "url parse build encode decode query string", cats: ["Browser Tools", "Network"], aliases: "querystring uri link builder params" },
  { name: "Compression", desc: "Compress and decompress text strings using browser-native Deflate and Gzip algorithms with Base64 output.", icon: "🗜️", url: "/compression/", type: "open", tags: "compress decompress deflate base64 text", cats: ["Browser Tools"], aliases: "gzip zlib inflate zip shrink" },
  { name: "Data Converter", desc: "Convert between JSON, CSV, Hex and Base64 data formats locally. Fast client-side data transformer with zero file uploads.", icon: "🔁", url: "/dataconverter/", type: "open", tags: "json csv hex base64 convert format", cats: ["Browser Tools"], aliases: "transform translate serialize deserialize" },
  { name: "RegEx Forge", desc: "Build, test and debug regular expressions online with real-time string matching, group syntax highlighting and pattern explanations.", icon: "∑", url: "/regex/", type: "open", tags: "regex regexp pattern match test explain", cats: ["Browser Tools"], aliases: "regular expression capture group lookahead tester" },
  { name: "Image Optimizer", desc: "Compress and optimize PNG, JPEG and WebP images directly in your browser without quality loss or uploading files.", icon: "🖼️", url: "/imageoptimizer/", type: "open", tags: "image compress webp png jpeg optimize performance", cats: ["Browser Tools", "Design"], aliases: "shrink photo lossless minify picture squoosh" },
  { name: "CSV Viewer & Converter", desc: "Inspect and parse CSV files in an interactive data table. Convert CSV to JSON, Markdown or SQL insert statements effortlessly.", icon: "📊", url: "/csvviewer/", type: "open", tags: "csv json sql table data convert format", cats: ["Browser Tools"], aliases: "spreadsheet excel tsv delimited table viewer" },
  { name: "Diff Checker", desc: "Compare text, JSON and code snippets side-by-side with live line-by-line diff highlighting and inline comparison.", icon: "🔀", url: "/diff-checker/", type: "open", tags: "diff compare text json code side-by-side highlight", cats: ["Browser Tools"], aliases: "compare files patch changes delta merge" },
  { name: "Markdown Previewer", desc: "Write and preview Markdown with real-time HTML rendering, syntax highlighting, GitHub Flavored Markdown support and file export.", icon: "📝", url: "/markdown-preview/", type: "open", tags: "markdown md html preview render export editor", cats: ["Browser Tools"], aliases: "gfm readme md to html editor renderer" },
  { name: "Lorem Ipsum & Fake Data Generator", desc: "Generate realistic mock data including names, emails, addresses, numbers and JSON objects locally for development testing.", icon: "🎲", url: "/fake-data-generator/", type: "open", tags: "lorem ipsum fake mock data generate names json", cats: ["Browser Tools"], aliases: "faker dummy placeholder seed test fixtures sample" },
  { name: "UUID / ULID Generator", desc: "Batch generate cryptographically secure UUID v4 identifiers and lexicographically sortable ULIDs with quick copy.", icon: "🆔", url: "/uuid-ulid-generator/", type: "open", tags: "uuid ulid guid generate random batch id", cats: ["Browser Tools", "Security"], aliases: "guid v4 nanoid identifier unique key" },
  { name: "Cron Expression Builder", desc: "Build and test cron expressions visually. Translate cron syntax into plain English descriptions and view upcoming execution schedules.", icon: "⏰", url: "/cron-builder/", type: "open", tags: "cron expression schedule time generator parser", cats: ["Browser Tools"], aliases: "crontab scheduler job quartz recurring task" },
  { name: "Timestamp Converter", desc: "Convert Unix epoch timestamps to ISO 8601, UTC and local date formats instantly with multi-timezone support.", icon: "🕒", url: "/timestamp-converter/", type: "open", tags: "timestamp unix epoch iso8601 date time timezone convert", cats: ["Browser Tools"], aliases: "epoch unixtime milliseconds utc datetime tz" },
  { name: "Text Case Converter", desc: "Convert text between camelCase, snake_case, kebab-case, PascalCase, Title Case and UPPERCASE string formats instantly.", icon: "🔤", url: "/case-converter/", type: "open", tags: "case convert camelcase snakecase kebabcase titlecase string", cats: ["Browser Tools"], aliases: "uppercase lowercase slugify constant case naming" },
  { name: "YAML / JSON / TOML Converter", desc: "Convert configuration files seamlessly between YAML, JSON and TOML formats with syntax validation in your browser.", icon: "🔄", url: "/yaml-json-toml/", type: "open", tags: "yaml json toml convert format parser config", cats: ["Browser Tools"], aliases: "yml config translate serialize kubernetes manifest" },
  { name: "Sitemap Generator", desc: "Generate XML sitemaps for website URLs and paths. Optimize SEO crawling and search engine indexing effortlessly.", icon: "🗺️", url: "/sitemap-generator/", type: "open", tags: "sitemap xml crawl seo url generator agent", cats: ["Browser Tools", "AI & Agents"], aliases: "sitemap.xml urlset indexing google search console" },
  { name: "robots.txt Generator & Validator", desc: "Create and validate robots.txt files for search engine crawlers and AI search bots with customized allow/disallow rules.", icon: "🤖", url: "/robots-generator/", type: "open", tags: "robots txt generator validator crawler useragent allow disallow", cats: ["Browser Tools", "AI & Agents"], aliases: "robots.txt crawl directives noindex gptbot block bots" },
  { name: "Meta Tag & Open Graph Previewer", desc: "Preview how your web page meta tags and Open Graph cards look on Google, Twitter/X, Facebook and LinkedIn.", icon: "👁️", url: "/og-preview/", type: "open", tags: "meta tag og opengraph preview twitter facebook card seo", cats: ["Browser Tools", "Design"], aliases: "og image social card twitter card link preview share" },
  { name: "HTTP Status Code Reference", desc: "Searchable guide for HTTP status codes (1xx-5xx), headers and API response rules with practical developer examples.", icon: "📗", url: "/http-status/", type: "open", tags: "http status code 200 404 500 reference header rest", cats: ["Browser Tools", "Network"], aliases: "301 302 403 418 502 response codes cheatsheet" },
  { name: "CORS Tester", desc: "Test cross-origin resource sharing (CORS) headers origins and preflight OPTIONS responses for API endpoints.", icon: "📡", url: "/cors-tester/", type: "open", tags: "cors options origin headers api test preflight", cats: ["Browser Tools", "Security", "Network"], aliases: "cross origin access-control-allow-origin preflight blocked" },
  { name: "Webhook Inspector", desc: "Test, inspect and debug incoming HTTP webhook payloads, headers and request bodies in real time directly in your browser.", icon: "🪝", url: "/webhook-inspector/", type: "open", tags: "webhook payload inspect echo request debug http", cats: ["Browser Tools", "Network"], aliases: "requestbin webhook.site callback receiver payload debug" },
  { name: "Cookie Inspector", desc: "Parse and inspect HTTP Cookie and Set-Cookie response headers for SameSite, Secure, HttpOnly and Max-Age security flags.", icon: "🍪", url: "/cookie-inspector/", type: "open", tags: "cookie parse inspect samesite secure httpOnly session", cats: ["Browser Tools", "Security"], aliases: "set-cookie samesite none partitioned session storage" },

  // Security
  { name: "Password Generator", desc: "Generate cryptographically secure passwords, API keys and secret tokens locally with entropy evaluation and zero network calls.", icon: "🔑", url: "/password/", type: "open", tags: "password secret random secure generate entropy", cats: ["Security", "Browser Tools"], aliases: "passphrase api key token random string diceware" },
  { name: "HeaderScan", desc: "Analyze HTTP response headers for any web URL. Inspect security policies, cache directives, server configurations and CSP.", icon: "▤", url: "/headers/", type: "open", tags: "http headers security inspect network response", cats: ["Security", "Network"], aliases: "hsts csp x-frame-options cache-control securityheaders" },
  { name: "Hashing", desc: "Calculate cryptographic SHA-256, SHA-512, MD5 and HMAC hashes locally in your browser with hex or Base64 encoding.", icon: "🔒", url: "/hashing/", type: "open", tags: "hash sha hmac digest security crypto", cats: ["Security", "Browser Tools"], aliases: "sha256 sha1 md5 checksum digest signature" },
  { name: "SSL / TLS Certificate Inspector", desc: "Check SSL/TLS certificate details, expiration dates, domain matches, issuer authority and trust chain validation.", icon: "📜", url: "/ssl-inspector/", type: "open", tags: "ssl tls certificate expiry issuer chain https security", cats: ["Security", "Network"], aliases: "x509 cert expiry letsencrypt handshake ca chain" },
  { name: "JWT Debugger & Verifier", desc: "Decode, inspect and verify JSON Web Tokens (JWT) headers and payload claims locally using Web Crypto API.", icon: "🔑", url: "/jwt-debugger/", type: "open", tags: "jwt decode verify signature token claim header security", cats: ["Security", "Browser Tools"], aliases: "jsonwebtoken bearer token hs256 rs256 oauth claims" },
  { name: "CSP Header Builder", desc: "Build and validate custom Content Security Policy (CSP) headers to defend web applications against XSS and injection attacks.", icon: "🛡️", url: "/csp-builder/", type: "open", tags: "csp content security policy header builder directives XSS", cats: ["Security", "Browser Tools"], aliases: "content-security-policy nonce unsafe-inline script-src xss" },
  { name: "Password Strength & Entropy Analyzer", desc: "Evaluate password security strength, bit entropy score, pattern detection and estimated crack time entirely offline.", icon: "💪", url: "/password-analyzer/", type: "open", tags: "password strength entropy zxcvbn security crack time", cats: ["Security"], aliases: "how strong is my password bits brute force estimate" },
  { name: "File Hash Verifier", desc: "Verify file integrity by calculating MD5, SHA-1, SHA-256 and SHA-512 checksums locally without uploading files.", icon: "✔️", url: "/file-hash/", type: "open", tags: "file hash checksum sha256 sha512 md5 verify integrity", cats: ["Security", "Browser Tools"], aliases: "checksum verify download integrity sha256sum iso" },

  // Design
  { name: "Color Palette Generator", desc: "Generate color palettes, extract dominant colors from images and export HEX, RGB and HSL color values.", icon: "🎨", url: "/chromata/", type: "open", tags: "color palette css design hex rgb hsl", cats: ["Design"], aliases: "swatch color picker scheme dominant colour extract" },
  { name: "CSS Units Converter", desc: "Convert CSS units between pixels (px), rem, em, viewports (vw/vh) and percentages with live responsive preview.", icon: "📐", url: "/cssunits/", type: "open", tags: "css units rem px em vw convert design", cats: ["Design", "Browser Tools"], aliases: "px to rem vh vmin ch pt responsive sizing" },
  { name: "SVG Optimizer", desc: "Optimize and minify SVG markup. Strip metadata, clean attributes and compress vector graphic code for web performance.", icon: "✨", url: "/svg-optimizer/", type: "open", tags: "svg optimize minify svgo vector cleanup graphics", cats: ["Design", "Browser Tools"], aliases: "svgo clean vector shrink path minify icon" },
  { name: "CSS Box Shadow Builder", desc: "Build layered CSS box-shadow values visually. Tune offset, blur, spread, colour and inset per layer with a live preview.", icon: "🌓", url: "/box-shadow/", type: "open", tags: "box shadow css layers blur spread inset design generator", cats: ["Design", "Browser Tools"], aliases: "drop shadow elevation depth material shadow generator neumorphism" },
  { name: "Cubic Bezier Easing Editor", desc: "Drag control points to build CSS cubic-bezier() timing functions. Compare against built-in easings and preview the motion live.", icon: "📉", url: "/cubic-bezier/", type: "open", tags: "cubic bezier easing curve animation timing css transition", cats: ["Design", "Browser Tools"], aliases: "ease in out timing function motion curve animation editor penner" },
  { name: "CSS Gradient Builder", desc: "Design linear, radial and conic CSS gradients visually. Adjust color stops and export production-ready CSS code.", icon: "🌈", url: "/gradient-builder/", type: "open", tags: "css gradient linear radial conic visual design color", cats: ["Design"], aliases: "linear-gradient colour stops mesh background generator" },
  { name: "Image Format Converter", desc: "Convert images between PNG, JPEG, WebP and AVIF formats with resolution scaling and quality controls in your browser.", icon: "🖼️", url: "/image-converter/", type: "open", tags: "image convert webp png jpeg avif canvas resize", cats: ["Design", "Browser Tools"], aliases: "heic jpg to png resize scale picture transcode" },
  { name: "Icon & Sprite Sheet Generator", desc: "Combine multiple PNG/SVG icons into optimized image sprite sheets with automatically generated CSS classes and JSON maps.", icon: "🧩", url: "/sprite-generator/", type: "open", tags: "sprite sheet icon canvas css mapping export assets", cats: ["Design"], aliases: "atlas texture packer icon set css sprites" },
  { name: "WCAG Contrast Checker", desc: "Test web color contrast ratios against WCAG 2.1 AA and AAA accessibility standards for text and UI components.", icon: "🎨", url: "/wcag-contrast/", type: "open", tags: "contrast ratio wcag accessibility color aa aaa compliance", cats: ["Design", "Browser Tools"], aliases: "a11y accessible colour contrast ratio readable text" },

  // Network
  { name: "CIDR & Subnet Calculator", desc: "Calculate IPv4 and IPv6 subnet ranges, netmasks, wildcard masks and usable host counts. Split any block into smaller subnets.", icon: "🧮", url: "/cidr-calculator/", type: "open", tags: "cidr subnet mask ipv4 ipv6 network range calculator prefix", cats: ["Network", "Security"], aliases: "subnetting netmask slash notation ip range vlsm supernet" },
  { name: "DNS Lookup", desc: "Perform online DNS queries for A, AAAA, MX, TXT, NS, CNAME, SOA and SRV records using DNS-over-HTTPS.", icon: "⌁", url: "/dnslookup/", type: "open", tags: "dns domain mx txt a aaaa cname ns lookup", cats: ["Network"], aliases: "dig nslookup resolve doh records nameserver" },
  { name: "IP Info & Geolocation Lookup", desc: "Lookup IP address details including country geolocation, ISP organization, ASN routing data and network hostnames.", icon: "📍", url: "/ip-lookup/", type: "open", tags: "ip lookup geolocation asn isp network routing info", cats: ["Network"], aliases: "what is my ip geoip ipv4 ipv6 asn whois address" },
  { name: "Ping & Traceroute Visualizer", desc: "Test network latency, packet round-trip time and visualize traceroute hop paths to any domain or IP address in real time.", icon: "📈", url: "/ping-visualizer/", type: "open", tags: "ping traceroute latency hops network route visualize", cats: ["Network"], aliases: "rtt mtr tracert packet loss round trip latency" },
  { name: "Port Status & Reference Guide", desc: "Explore common TCP and UDP network port numbers, protocol service definitions and reachability status references.", icon: "🔌", url: "/port-reference/", type: "open", tags: "port tcp udp scan reference service status network", cats: ["Network", "Security"], aliases: "port 80 443 22 3306 well known ports services" },
  { name: "WHOIS & RDAP Lookup", desc: "Query domain WHOIS and RDAP records to inspect registration status, domain registrar, nameservers and expiration dates.", icon: "🔍", url: "/whois-lookup/", type: "open", tags: "whois rdap domain registrar lookup expiration status", cats: ["Network"], aliases: "domain owner registrar expiry availability rdap" },

  // Desktop
  { name: "Volumer", desc: "Control system volume via mouse wheel on the Windows taskbar", icon: "🖱️", url: "https://github.com/atagulalan/volumer", type: "open", tags: "windows volume taskbar mouse wheel utility tray", cats: ["Desktop"], aliases: "scroll volume windows tray audio control" },
  { name: "Listmonk", desc: "Self-hosted mailing list and newsletter platform", icon: "📧", url: "https://github.com/knadh/listmonk", type: "open", tags: "newsletter email mailing list self-hosted smtp", cats: ["Desktop"], aliases: "mailchimp alternative campaign subscribers bulk email" },
  { name: "Cap", desc: "Open-source screen capture and sharing tool", icon: "🎥", url: "https://github.com/tiagozip/cap", type: "open", tags: "screen capture recording sharing open source", cats: ["Desktop"], aliases: "loom alternative screen recorder screencast gif" },
  { name: "LocalSend", desc: "Secure local network file sharing with zero cloud or accounts. (Note: P2P transfer bypasses enterprise DLP/email gateways)", icon: "📡", url: "https://github.com/localsend/localsend", type: "open", tags: "p2p file sharing local network privacy cross-platform", cats: ["Desktop", "Network"], aliases: "airdrop alternative lan transfer send files offline" },
  { name: "Bruno", desc: "Fast and Git-friendly open-source API client. Desktop client is free & open-source (team sync uses paid tiers).", icon: "🐶", url: "https://github.com/usebruno/bruno", type: "open", tags: "api client postman alternative rest graphql git desktop", cats: ["Desktop", "Network"], aliases: "postman insomnia alternative http client collections" },
  { name: "Mailpit", desc: "Actively-maintained email testing server & UI — the modern successor to MailHog for local web development.", icon: "📬", url: "https://github.com/axllent/mailpit", type: "open", tags: "email testing smtp mailhog developer local server", cats: ["Desktop", "Network"], aliases: "mailhog mailcatcher smtp sink local inbox testing" },

  // SaaS
  { name: "GOO: School Platform", desc: "GOO is a modular school management platform for student records, attendance tracking, grade reporting, timetables and parent communication.", icon: "🎓", url: "/goo/", type: "saas", tags: "school education attendance grades timetable", cats: ["SaaS"], aliases: "student information system sis school erp okul" },
  { name: "GES: Quiz Platform", desc: "GES is an interactive quiz platform to create online assessments, deliver tests and track student performance in real time.", icon: "❓", url: "/ges/", type: "saas", tags: "quiz assessment education analytics reports", cats: ["SaaS"], aliases: "exam test online assessment survey kahoot" },
  { name: "GYP: License Tracker", desc: "GYP is a software license and client management platform for tracking client subscriptions, license keys, billing and support requests.", icon: "📜", url: "/gyp/", type: "saas", tags: "license crm billing clients software management", cats: ["SaaS"], aliases: "subscription licensing crm invoicing support desk" },
  { name: "GST: Stock Tracker", desc: "GST is a mobile-first inventory and expense tracking web app designed for small workshops, business stock and materials management.", icon: "📦", url: "/gst/", type: "saas", tags: "inventory stock expense mobile pwa shop", cats: ["SaaS"], aliases: "warehouse inventory depo stok expense tracking pwa" },
];

export function primaryCategory(tool: Tool): Category {
  return tool.cats[0];
}

export function toolKey(tool: Tool): string {
  return tool.url;
}

export function getUniqueCategories(): Array<Category | 'all'> {
  const used = new Set<string>(tools.flatMap(t => t.cats));
  return ['all', ...CATEGORIES.filter(c => used.has(c))];
}

export function getUniqueStatuses(): Array<ToolType | 'all'> {
  return ['all', 'open', 'saas', 'coming'];
}

export function countByCategory(): Record<string, number> {
  const counts: Record<string, number> = { all: tools.length };
  for (const category of CATEGORIES) {
    counts[category] = tools.filter(t => t.cats.includes(category)).length;
  }
  return counts;
}

export function countByStatus(): Record<string, number> {
  const counts: Record<string, number> = { all: tools.length };
  for (const status of ['open', 'saas', 'coming'] as const) {
    counts[status] = tools.filter(t => t.type === status).length;
  }
  return counts;
}

export function groupByPrimaryCategory(): Array<{ category: Category; tools: Tool[] }> {
  return CATEGORIES.map(category => ({
    category,
    tools: tools.filter(t => primaryCategory(t) === category),
  })).filter(group => group.tools.length > 0);
}

export function matchesFilters(
  tool: Tool,
  category: Category | 'all',
  status: ToolType | 'all'
): boolean {
  if (category !== 'all' && !tool.cats.includes(category)) return false;
  if (status !== 'all' && tool.type !== status) return false;
  return true;
}

export function sortTools(list: Tool[], sortBy: 'default' | 'az'): Tool[] {
  if (sortBy === 'az') {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }
  return [...list];
}

export function isExternalUrl(url: string): boolean {
  return /^(https?:\/\/|mailto:)/i.test(url);
}
