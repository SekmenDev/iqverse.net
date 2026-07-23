<div align="center">

# 🌐 IQVerse (`iqverse.net`)

## **The Ultimate Suite of Free, Open-Source & Client-Side Developer Tools**

*Zero Telemetry. Zero Logins. 100% Browser-Processed.*

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Deployed-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)](https://github.com/SekmenDev/iqverse.net/pulls)

[🚀 **Launch Live App**](https://iqverse.net) • [📚 **Explore Tools**](#-tool-catalog) • [🛠️ **Local Setup**](#-getting-started) • [🤝 **Contribute**](#-contributing)

</div>

---

## 💡 Overview

**IQVerse** is a modern, high-performance suite of web utilities, developer tools, security instruments and software hubs built for developers, designers, network engineers and privacy enthusiasts.

Unlike traditional web tools that send your input data to remote API endpoints, **IQVerse executes 100% of its computations directly inside your web browser**. Your secrets, tokens, passwords, image files and code payloads never leave your client machine.

### ✨ Key Highlights

- **🔒 100% Privacy & Client-Side Processing**: Zero server requests for tool computations. Your passwords, Base64 strings, JSON payloads and regex inputs stay on your hardware.
- **🚫 Zero Telemetry & No Paywalls**: No user tracking, no analytics cookies, no paywalls and no login forms.
- **⚡ Blazing Fast Next.js Architecture**: Built with Next.js App Router, React 19, TypeScript and pre-rendered as a static export for edge deployment on Cloudflare Pages.
- **⌨️ Keyboard-Driven UI**: Built-in keyboard shortcuts (`/` key to instantly focus the global search bar) and filtering by category or status.
- **🎨 Sleek Dark-Theme Aesthetics**: Designed with glassmorphism touches, crisp typography, responsive grids and subtle visual micro-interactions.

---

## 🧰 Tool Catalog

IQVerse organizes tools into intuitive categories. Below is the full directory of tools currently available or scheduled for release:

### 🤖 AI & Agents

| Tool Name | Route / Link | Status | Description |
| :--- | :--- | :--- | :--- |
| **AI Agents Scanner** | [`/agentscan/`](https://iqverse.net/agentscan/) | ✦ Live | Audit site readiness for AI agents (`robots.txt`, `sitemap.xml`, MCP, OAuth, security headers) |
| **llms.txt Generator & Validator** | — | ◌ Coming Soon | Create and validate `llms.txt` standard files for AI crawler site summaries |
| **Structured Data Validator** | — | ◌ Coming Soon | Test JSON-LD structured data and Schema.org markup for AI agents and search crawlers |
| **AI Crawler Log Analyzer** | — | ◌ Coming Soon | Parse server access logs locally to analyze visits from GPTBot, ClaudeBot, PerplexityBot |

### 🛠️ Browser & Developer Utilities

| Tool Name | Route / Link | Status | Description |
| :--- | :--- | :--- | :--- |
| **QR Forge** | [`/qrforge/`](https://iqverse.net/qrforge/) | ✦ Live | Vector QR code generator for URLs, Wi-Fi credentials, vCards and custom text |
| **Link Radar** | [`/linkradar/`](https://iqverse.net/linkradar/) | ✦ Live | Instant client-side broken link detector and 404 URL crawler |
| **Favicon Generator** | [`/favicongen/`](https://iqverse.net/favicongen/) | ✦ Live | Create complete multi-sized favicons (16x16, 32x32, 180x180) + `manifest.json` |
| **JSON Formatter** | [`/json/`](https://iqverse.net/json/) | ✦ Live | Format, validate, minify and sort JSON objects locally without uploading data |
| **Base64 & URL Encoder** | [`/encodelab/`](https://iqverse.net/encodelab/) | ✦ Live | Encode/decode Base64, URL parameters, JWT tokens and Data URIs |
| **URL Tools** | [`/url/`](https://iqverse.net/url/) | ✦ Live | Parse, build, encode and decode URLs with query parameter editing |
| **Compression** | [`/compression/`](https://iqverse.net/compression/) | ✦ Live | Compress and decompress text using browser-native Deflate support |
| **Data Converter** | [`/dataconverter/`](https://iqverse.net/dataconverter/) | ✦ Live | Convert JSON, CSV, Hex, and Base64 data in the browser locally |
| **RegEx Forge** | [`/regex/`](https://iqverse.net/regex/) | ✦ Live | Interactive regex builder with real-time pattern matching & explanations |
| **Image Optimizer** | [`/imageoptimizer/`](https://iqverse.net/imageoptimizer/) | ✦ Live | Compress PNG, JPEG and WebP in-browser while keeping files local |
| **CSV Viewer & Converter** | [`/csvviewer/`](https://iqverse.net/csvviewer/) | ✦ Live | View CSV as a sortable table, export to JSON, Markdown or SQL |
| **Diff Checker** | — | ◌ Coming Soon | Side-by-side text, JSON and code diff viewer with live change highlighting |
| **Markdown Previewer** | — | ◌ Coming Soon | Live Markdown to HTML renderer with instant preview and file export |
| **Lorem Ipsum Generator** | — | ◌ Coming Soon | Generate names, addresses, emails and mock JSON data batches locally |
| **UUID / ULID Generator** | — | ◌ Coming Soon | Batch generate cryptographically secure UUID v4 and sortable ULIDs |
| **Cron Expression Builder** | — | ◌ Coming Soon | Visual cron schedule generator with human-readable explanations |
| **Timestamp Converter** | — | ◌ Coming Soon | Convert Unix timestamps to ISO 8601 and human-readable dates |
| **Text Case Converter** | — | ◌ Coming Soon | Toggle between camelCase, snake_case, kebab-case, Title Case & UPPERCASE |
| **YAML / JSON / TOML Converter** | — | ◌ Coming Soon | Convert seamlessly between YAML, JSON and TOML formats |
| **Sitemap Generator** | — | ◌ Coming Soon | Crawl web pages or paths to build XML sitemaps ready for search engine indexing |
| **robots.txt Generator & Validator** | — | ◌ Coming Soon | Build and test robots.txt directives for web crawlers and AI search bots |
| **Meta Tag & Open Graph Previewer** | — | ◌ Coming Soon | Preview social card appearance across Google, X/Twitter, Facebook & LinkedIn |
| **HTTP Status Code Reference** | — | ◌ Coming Soon | Searchable reference of HTTP status codes, standard headers and response scenarios |
| **CORS Tester** | — | ◌ Coming Soon | Test CORS configuration and header response rules for API endpoints |
| **Webhook Inspector** | — | ◌ Coming Soon | Inspect and debug incoming HTTP webhook payloads and request headers in real time |
| **Cookie Inspector** | — | ◌ Coming Soon | Parse and inspect raw Cookie and Set-Cookie headers for security flags |

### 🔒 Security Tools

| Tool Name | Route / Link | Status | Description |
| :--- | :--- | :--- | :--- |
| **Password Generator** | [`/password/`](https://iqverse.net/password/) | ✦ Live | Cryptographically secure password and secret generator using WebCrypto API |
| **HeaderScan** | [`/headers/`](https://iqverse.net/headers/) | ✦ Live | HTTP response header inspector with detailed security assessment breakdown |
| **Hashing** | [`/hashing/`](https://iqverse.net/hashing/) | ✦ Live | Compute SHA digests and HMAC values locally with hex or Base64 output |
| **SSL / TLS Certificate Inspector** | — | ◌ Coming Soon | Inspect SSL/TLS certificate validity, issuer details, expiration & trust chain |
| **JWT Debugger & Verifier** | — | ◌ Coming Soon | Decode JWT headers and claims, and verify signatures locally |
| **CSP Header Builder** | — | ◌ Coming Soon | Interactive Content-Security-Policy generator and directive validator |
| **Password Strength Analyzer** | — | ◌ Coming Soon | Evaluate password strength, calculate bit entropy, and estimate crack time |
| **File Hash Verifier** | — | ◌ Coming Soon | Calculate and compare MD5, SHA-1, SHA-256 and SHA-512 hashes of local files |

### 🎨 Design Tools

| Tool Name | Route / Link | Status | Description |
| :--- | :--- | :--- | :--- |
| **Color Palette Generator** | [`/chromata/`](https://iqverse.net/chromata/) | ✦ Live | Generate harmonious palettes, extract colors from images, convert HEX/RGB/HSL |
| **CSS Units Converter** | [`/cssunits/`](https://iqverse.net/cssunits/) | ✦ Live | Convert px, rem, em, vw, vh and more with live browser context |
| **SVG Optimizer** | — | ◌ Coming Soon | Minify and clean inline SVG markup by stripping redundant metadata |
| **CSS Gradient Builder** | — | ◌ Coming Soon | Visual linear, radial and conic CSS gradient generator with CSS export |
| **Image Format Converter** | — | ◌ Coming Soon | Convert PNG, JPEG, WebP and AVIF formats with canvas scaling & quality controls |
| **Icon & Sprite Sheet Generator** | — | ◌ Coming Soon | Combine multiple icons into a single sprite sheet with CSS/JSON coordinates |
| **WCAG Contrast Checker** | — | ◌ Coming Soon | Calculate contrast ratios with WCAG AA/AAA compliance badges |

### 🌐 Network Tools

| Tool Name | Route / Link | Status | Description |
| :--- | :--- | :--- | :--- |
| **DNS Lookup** | [`/dnslookup/`](https://iqverse.net/dnslookup/) | ✦ Live | Multi-record DNS query engine (A, AAAA, MX, TXT, CNAME, NS) |
| **IP Info & Geolocation Lookup** | — | ◌ Coming Soon | Inspect IP address geolocation, ASN, ISP details and routing info |
| **Ping & Traceroute Visualizer** | — | ◌ Coming Soon | Visualize network latency and hop trace routes via backend diagnostic relay |
| **Port Status & Reference Guide** | — | ◌ Coming Soon | Common TCP/UDP port reference guide with service definitions & status checks |
| **WHOIS & RDAP Lookup** | — | ◌ Coming Soon | Query domain registration metadata, registrar details and expiration timelines |

### 🖥️ Desktop Utilities & Community Tools

| Tool Name | Link | Description | Type |
| :--- | :--- | :--- | :--- |
| **Volumer** | [GitHub Repo](https://github.com/atagulalan/volumer) | System volume control via mouse wheel on Windows taskbar | Desktop Utility |
| **Listmonk** | [GitHub Repo](https://github.com/knadh/listmonk) | High-performance self-hosted newsletter & mailing list manager | Newsletter Platform |
| **Cap** | [GitHub Repo](https://github.com/tiagozip/cap) | Lightweight, open-source screen recording and media share tool | Screen Recorder |
| **LocalSend** | [GitHub Repo](https://github.com/localsend/localsend) | Secure peer-to-peer local network file sharing with zero cloud/accounts | File Sharing |
| **Bruno** | [GitHub Repo](https://github.com/usebruno/bruno) | Fast & Git-friendly open-source desktop API client | API Client |
| **Mailpit** | [GitHub Repo](https://github.com/axllent/mailpit) | Fast email testing server & web UI — successor to MailHog | Email Testing |

### ☁️ SaaS Platforms

| Platform Name | Route / URL | Feature Focus |
| :--- | :--- | :--- |
| **GOO** | [`/goo/`](https://iqverse.net/goo/) | Modern school platform: student records, attendance, grades & timetables |
| **GES** | [`/ges/`](https://iqverse.net/ges/) | Real-time quiz creation, online assessment and analytics dashboard |
| **GYP** | [`/gyp/`](https://iqverse.net/gyp/) | Software license tracker, client CRM, billing & subscription management |
| **GST** | [`/gst/`](https://iqverse.net/gst/) | Workshop inventory & expense tracking PWA designed for small businesses |

---

## 📁 Repository Structure

```text
iqverse.net/
├── 📂 app/                      # Next.js App Router routes & tools
│   ├── 📂 agentscan/           # AI Agents Scanner route
│   ├── 📂 chromata/            # Color Palette Generator route
│   ├── 📂 compression/         # Deflate Text Compression route
│   ├── 📂 cssunits/            # CSS Units Converter route
│   ├── 📂 csvviewer/           # CSV Viewer & Converter route
│   ├── 📂 dataconverter/       # Multi-format Data Converter route
│   ├── 📂 dnslookup/           # DNS Lookup tool route
│   ├── 📂 encodelab/           # Base64 & URL Encoder route
│   ├── 📂 favicongen/          # Favicon Generator route
│   ├── 📂 ges/                 # GES SaaS platform route
│   ├── 📂 goo/                 # GOO SaaS platform route
│   ├── 📂 gst/                 # GST SaaS platform route
│   ├── 📂 gyp/                 # GYP SaaS platform route
│   ├── 📂 hashing/             # WebCrypto SHA & HMAC Hashing route
│   ├── 📂 headers/             # HeaderScan tool route
│   ├── 📂 imageoptimizer/      # In-browser Image Optimizer route
│   ├── 📂 json/                # JSON Formatter route
│   ├── 📂 linkradar/           # Link Radar route
│   ├── 📂 password/            # Password Generator route
│   ├── 📂 qrforge/             # QR Forge route
│   ├── 📂 regex/               # RegEx Forge route
│   ├── 📂 url/                 # URL Parser & Builder route
│   ├── 📄 catalog.module.css   # Main catalog CSS module
│   ├── 📄 globals.css          # Design system, CSS variables & reset
│   ├── 📄 home.module.css      # Catalog layout styles
│   ├── 📄 layout.tsx           # Root HTML layout, SEO tags & metadata
│   ├── 📄 page.tsx             # Dynamic tool catalog homepage (filtering & search)
│   └── 📄 sitemap.ts           # Dynamic XML sitemap generator
├── 📂 components/              # Modular UI & Tool React components
│   ├── 📂 layout/              # Header, Footer, Navigation bars
│   └── 📂 tools/               # Isolated tool UI component implementations
├── 📂 lib/                     # Core business logic & registries
│   └── 📄 tools.ts             # Central tool catalog registry, filters & metadata
├── 📂 public/                  # Static assets, tool icons, manifest & favicons
├── 📂 styles/                  # Supplemental style utilities
├── 📄 eslint.config.mjs        # ESLint flat configuration
├── 📄 next.config.ts           # Next.js configuration (static export output)
├── 📄 package.json             # NPM package manifest and scripts
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 wrangler.jsonc           # Cloudflare Pages / Workers deployment config
└── 📄 yarn.lock                # Yarn lockfile
```

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Core Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 6](https://www.typescriptlang.org/)
- **Package Manager**: [Yarn Berry](https://yarnpkg.com/)
- **Styling**: Native CSS Modules + Custom CSS Custom Properties (Tokens)
- **Compilation**: Static HTML Export (`output: 'export'`)
- **Deployment Platform**: Edge static hosting via [Cloudflare Pages](https://pages.cloudflare.com/)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: `v20.0.0` or higher
- **Yarn**: `v4.x` (or Corepack enabled)

### Installation & Local Server

1. **Clone the repository**:

   ```bash
   git clone https://github.com/SekmenDev/iqverse.net.git
   cd iqverse.net
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   ```

3. **Start local development server**:

   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

4. **Lint code**:

   ```bash
   yarn lint
   ```

---

## 📦 Building & Deployment

### Build for Production

Compile the static output folder (`out/`):

```bash
yarn build
```

### Cloudflare Pages Deployment

This project is configured for seamless deployment on Cloudflare Pages using `wrangler.jsonc`.

1. **Preview deployment locally with Wrangler**:

   ```bash
   npx wrangler pages dev out
   ```

2. **Deploy directly to Cloudflare Pages**:

   ```bash
   npx wrangler deploy
   ```

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire and create. Any contributions you make are **greatly appreciated**!

If you want to contribute a new tool or fix a bug:

1. **Fork the Repository**
2. **Create a Feature Branch**:

   ```bash
   git checkout -b feature/AmazingTool
   ```

3. **Commit your Changes**:

   ```bash
   git commit -m "Add AmazingTool to browser tools"
   ```

4. **Push to the Branch**:

   ```bash
   git push origin feature/AmazingTool
   ```

5. **Open a Pull Request**

Please review [`lib/tools.ts`](file:///d:/Projects/iqverse.net/lib/tools.ts) when adding a new tool to ensure proper registration in the live search catalog!

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 🔗 Links & Community

- 🌐 **Live Website**: [https://iqverse.net](https://iqverse.net)
- 👨‍💻 **Developer / Creator**: [Sekmen.Dev](https://sekmen.dev)
- 🐙 **GitHub Repository**: [SekmenDev/iqverse.net](https://github.com/SekmenDev/iqverse.net)

<div align="center">

**Built with ❤️ by developers, for the developer community.**

</div>
