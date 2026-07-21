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

**IQVerse** is a modern, high-performance suite of web utilities, developer tools, security instruments, and software hubs built for developers, designers, network engineers, and privacy enthusiasts.

Unlike traditional web tools that send your input data to remote API endpoints, **IQVerse executes 100% of its computations directly inside your web browser**. Your secrets, tokens, passwords, image files, and code payloads never leave your client machine.

### ✨ Key Highlights

- **🔒 100% Privacy & Client-Side Processing**: Zero server requests for tool computations. Your passwords, Base64 strings, JSON payloads, and regex inputs stay on your hardware.
- **🚫 Zero Telemetry & No Paywalls**: No user tracking, no analytics cookies, no paywalls, and no login forms.
- **⚡ Blazing Fast Next.js Architecture**: Built with Next.js App Router, React 19, TypeScript, and pre-rendered as a static export for edge deployment on Cloudflare Pages.
- **⌨️ Keyboard-Driven UI**: Built-in keyboard shortcuts (`/` key to instantly focus the global search bar) and filtering by category or status.
- **🎨 Sleek Dark-Theme Aesthetics**: Designed with glassmorphism touches, crisp typography, responsive grids, and subtle visual micro-interactions.

---

## 🧰 Tool Catalog

IQVerse organizes tools into intuitive categories. Below is the full directory of tools currently available or scheduled for release:

### 🛠️ Browser & Developer Utilities

| Tool Name | Route / URL | Description | Tags |
| :--- | :--- | :--- | :--- |
| **AI Agents Scanner** | [`/agentscan/`](https://iqverse.net/agentscan/) | Audit site readiness for AI agents (`robots.txt`, `sitemap.xml`, MCP, OAuth, security headers) | `robots`, `sitemap`, `mcp`, `ai`, `security` |
| **QR Forge** | [`/qrforge/`](https://iqverse.net/qrforge/) | Vector QR code generator for URLs, Wi-Fi credentials, vCards, and custom text | `qr`, `svg`, `png`, `wifi`, `vcard` |
| **Link Radar** | [`/linkradar/`](https://iqverse.net/linkradar/) | Instant client-side broken link detector and 404 URL crawler | `links`, `404`, `redirect`, `scan`, `crawl` |
| **Favicon Generator** | [`/favicongen/`](https://iqverse.net/favicongen/) | Create complete multi-sized favicons (16x16, 32x32, 180x180) + `manifest.json` | `favicon`, `manifest`, `apple-touch-icon` |
| **JSON Formatter** | [`/json/`](https://iqverse.net/json/) | Format, validate, minify, and sort JSON objects locally without uploading data | `json`, `format`, `validate`, `minify`, `lint` |
| **Base64 & URL Encoder** | [`/encodelab/`](https://iqverse.net/encodelab/) | Encode/decode Base64, URL parameters, JWT tokens, and Data URIs | `base64`, `url`, `encode`, `jwt`, `data-uri` |
| **RegEx Forge** | [`/regex/`](https://iqverse.net/regex/) | Interactive regex builder with real-time pattern matching & explanations | `regex`, `pattern`, `test`, `match` |

### 🔒 Security Tools

| Tool Name | Route / URL | Description | Tags |
| :--- | :--- | :--- | :--- |
| **Password Generator** | [`/password/`](https://iqverse.net/password/) | Cryptographically secure password and secret generator using WebCrypto API | `password`, `entropy`, `secret`, `crypto` |
| **HeaderScan** | [`/headers/`](https://iqverse.net/headers/) | HTTP response header inspector with detailed security assessment breakdown | `http`, `headers`, `security`, `inspect` |

### 🎨 Design Tools

| Tool Name | Route / URL | Description | Tags |
| :--- | :--- | :--- | :--- |
| **Color Palette Generator** | [`/chromata/`](https://iqverse.net/chromata/) | Generate harmonious palettes, extract colors from images, convert HEX/RGB/HSL | `color`, `palette`, `css`, `design`, `hex` |

### 🌐 Network Tools

| Tool Name | Route / URL | Description | Tags |
| :--- | :--- | :--- | :--- |
| **DNS Lookup** | [`/dnslookup/`](https://iqverse.net/dnslookup/) | Multi-record DNS query engine (A, AAAA, MX, TXT, CNAME, NS) | `dns`, `domain`, `mx`, `txt`, `cname` |

### 🖥️ Desktop Utilities & Community Tools

| Tool Name | Link | Description | Type |
| :--- | :--- | :--- | :--- |
| **Volumer** | [GitHub Repo](https://github.com/atagulalan/volumer) | System volume control via mouse wheel on Windows taskbar | Desktop Utility |
| **Listmonk** | [GitHub Repo](https://github.com/knadh/listmonk) | High-performance self-hosted newsletter & mailing list manager | Newsletter Platform |
| **Cap** | [GitHub Repo](https://github.com/tiagozip/cap) | Lightweight, open-source screen recording and media share tool | Screen Recorder |

### ☁️ SaaS Platforms

| Platform Name | Route / URL | Feature Focus |
| :--- | :--- | :--- |
| **GOO** | [`/goo/`](https://iqverse.net/goo/) | Modern school platform: student records, attendance, grades & timetables |
| **GES** | [`/ges/`](https://iqverse.net/ges/) | Real-time quiz creation, online assessment, and analytics dashboard |
| **GYP** | [`/gyp/`](https://iqverse.net/gyp/) | Software license tracker, client CRM, billing & subscription management |
| **GST** | [`/gst/`](https://iqverse.net/gst/) | Workshop inventory & expense tracking PWA designed for small businesses |

---

## 📁 Repository Structure

```text
iqverse.net/
├── 📂 app/                      # Next.js App Router routes & tools
│   ├── 📂 agentscan/           # AI Agents Scanner route
│   ├── 📂 chromata/            # Color Palette Generator route
│   ├── 📂 dnslookup/           # DNS Lookup tool route
│   ├── 📂 encodelab/           # Base64 & URL Encoder route
│   ├── 📂 favicongen/          # Favicon Generator route
│   ├── 📂 ges/                 # GES SaaS platform route
│   ├── 📂 goo/                 # GOO SaaS platform route
│   ├── 📂 gst/                 # GST SaaS platform route
│   ├── 📂 gyp/                 # GYP SaaS platform route
│   ├── 📂 headers/             # HeaderScan tool route
│   ├── 📂 json/                # JSON Formatter route
│   ├── 📂 linkradar/           # Link Radar route
│   ├── 📂 password/            # Password Generator route
│   ├── 📂 qrforge/             # QR Forge route
│   ├── 📂 regex/               # RegEx Forge route
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

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

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
