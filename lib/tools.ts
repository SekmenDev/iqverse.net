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
  // Browser Tools
  { name: "AI Agents Scanner", desc: "Check your site's AI agent readiness — robots.txt, sitemap, MCP and more", icon: "/agentscan/logoX4.png", url: "/agentscan/", type: "open", tags: "robots sitemap mcp oauth security ai agent", cat: "Browser Tools" },
  { name: "QR Forge", desc: "Generate QR codes from URLs, plain text, Wi-Fi credentials and vCards", icon: "/qrforge/logoX4.png", url: "/qrforge/", type: "open", tags: "qr code svg png generate wifi vcard", cat: "Browser Tools" },
  { name: "Link Radar", desc: "Find broken links and 404s in any webpage instantly", icon: "/linkradar/logoX4.png", url: "/linkradar/", type: "open", tags: "links 404 redirect scan broken crawl", cat: "Browser Tools" },
  { name: "Favicon Generator", desc: "Create favicons in all required sizes plus manifest.json", icon: "/favicongen/logoX4.png", url: "/favicongen/", type: "open", tags: "favicon icon manifest apple touch 16 32 180", cat: "Browser Tools" },
  { name: "JSON Formatter", desc: "Format, validate, minify and sort keys in your JSON — no upload needed", icon: "/json/logoX4.png", url: "/json/", type: "open", tags: "json format validate minify lint sort", cat: "Browser Tools" },
  { name: "Base64 & URL Encoder", desc: "Encode/decode Base64, URL parameters, JWT tokens and Data URIs", icon: "/encodelab/logoX4.png", url: "/encodelab/", type: "open", tags: "base64 url encode decode jwt data uri", cat: "Browser Tools" },
  { name: "RegEx Forge", desc: "Build and test regular expressions with live highlighting and explanations", icon: "/regex/logoX4.png", url: "/regex/", type: "open", tags: "regex regexp pattern match test explain", cat: "Browser Tools" },
  
  // Security
  { name: "Password Generator", desc: "Generate strong passwords and secrets — all generation happens locally", icon: "/password/logoX4.png", url: "/password/", type: "open", tags: "password secret random secure generate entropy", cat: "Security" },
  { name: "HeaderScan", desc: "Inspect HTTP response headers for any URL with detailed breakdowns", icon: "/headers/logoX4.png", url: "/headers/", type: "open", tags: "http headers security inspect network response", cat: "Security" },
  
  // Design
  { name: "Color Palette Generator", desc: "Create harmonious color palettes and extract colors from images", icon: "/chromata/logoX4.png", url: "/chromata/", type: "open", tags: "color palette css design hex rgb hsl", cat: "Design" },
  
  // Network
  { name: "DNS Lookup", desc: "Query A, AAAA, MX, TXT, CNAME and NS records for any domain", icon: "/dnslookup/logoX4.png", url: "/dnslookup/", type: "open", tags: "dns domain mx txt a aaaa cname ns lookup", cat: "Network" },
  
  // Desktop
  { name: "Volumer", desc: "Control system volume via mouse wheel on the Windows taskbar", icon: "🖱️", url: "https://github.com/SekmenDev/volumer", type: "open", tags: "windows volume taskbar mouse wheel utility tray", cat: "Desktop" },
  
  // SaaS
  { name: "GOO — School Platform", desc: "Student records, attendance, grades, timetables and parent communication", icon: "/goo/logoX4.png", url: "/goo/", type: "saas", tags: "school education attendance grades timetable", cat: "SaaS" },
  { name: "GES — Quiz Platform", desc: "Create and deploy quizzes, track student performance in real-time", icon: "/ges/logoX4.png", url: "/ges/", type: "saas", tags: "quiz assessment education analytics reports", cat: "SaaS" },
  { name: "GYP — License Tracker", desc: "Manage clients, software licenses, payments and service requests", icon: "/gyp/logoX4.png", url: "/gyp/", type: "saas", tags: "license crm billing clients software management", cat: "SaaS" },
  { name: "GST — Stock Tracker", desc: "Inventory and expense tracking for small workshops — mobile-first PWA", icon: "/gst/logoX4.png", url: "/gst/", type: "saas", tags: "inventory stock expense mobile pwa shop", cat: "SaaS" },
  
  // Coming soon
  { name: "CSS Units Converter", desc: "Convert px, rem, em, vw, vh and more with live browser context", icon: "📐", url: "", type: "coming", tags: "css units rem px em vw convert design", cat: "Design" },
  { name: "Image Optimizer", desc: "Compress PNG, JPEG and WebP in-browser via WebAssembly — files stay local", icon: "🖼️", url: "", type: "coming", tags: "image compress webp png jpeg optimize performance", cat: "Browser Tools" },
  { name: "CSV Viewer & Converter", desc: "View CSV as a sortable table, export to JSON, Markdown or SQL", icon: "📊", url: "", type: "coming", tags: "csv json sql table data convert format", cat: "Browser Tools" },
];

export function getUniqueCategories(): string[] {
  const cats = new Set(tools.map(t => t.cat));
  return ["all", ...Array.from(cats).sort()];
}

export function getUniqueStatuses(): Array<Tool['type'] | 'all'> {
  return ["all", "open", "saas", "coming"];
}

export function filterTools(query: string, category: string, status: string | 'all'): Tool[] {
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
