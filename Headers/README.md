# HeaderScan — HTTP Security Headers Analyzer

A browser-based tool to analyze HTTP response headers for security, performance and best practices. Part of the [IQVerse](https://iqverse.net) toolset.

![License](https://img.shields.io/badge/license-MIT-green) ![Open Source](https://img.shields.io/badge/open-source-blue) ![Browser](https://img.shields.io/badge/browser-based-9cf)

📍 [Launch Tool](https://iqverse.net/headers/)

## Features

- **Security Score** — Instant A–F grade with animated progress ring
- **20 Headers Analyzed** — CSP, HSTS, X-Frame-Options, Referrer-Policy, CORS, Permissions-Policy, COOP, COEP, CORP, cookies, server leakage and more
- **Directive Breakdown** — CSP, Cache-Control, Set-Cookie and Permissions-Policy directives are parsed and annotated inline
- **4 Analysis Tabs**
  - 🔐 Security — all security-relevant headers, sorted by severity
  - ⚡ Performance — caching, compression, encoding headers
  - ℹ️ Info — server fingerprinting, CDN detection, HTTP version
  - 📋 Raw Headers — searchable full header dump
- **Reference Panel** — filterable sidebar with descriptions for all tracked headers, sortable by priority (Critical / Recommended / Optional)
- **Report Export** — Copy to clipboard or download a Markdown report
- **Quick Links** — One-click presets to test well-known sites
- **CORS Proxy** — Uses `allorigins.win` to fetch headers from any public URL

## Usage

1. Open `index.html` in any modern browser (no build step needed)
2. Enter a URL and click **Analyze** (or press Enter)
3. Review the score, expand header cards for details and recommendations
4. Export the report as Markdown if needed

## Headers Covered

| Header                       | Priority    | Category    |
| ---------------------------- | ----------- | ----------- |
| Content-Security-Policy      | Critical    | Security    |
| Strict-Transport-Security    | Critical    | Security    |
| X-Content-Type-Options       | Critical    | Security    |
| X-Frame-Options              | Critical    | Security    |
| Set-Cookie flags             | Critical    | Security    |
| Referrer-Policy              | Recommended | Security    |
| Permissions-Policy           | Recommended | Security    |
| X-XSS-Protection             | Recommended | Security    |
| Access-Control-Allow-Origin  | Recommended | Security    |
| Cross-Origin-Opener-Policy   | Recommended | Security    |
| Cross-Origin-Embedder-Policy | Optional    | Security    |
| Cross-Origin-Resource-Policy | Optional    | Security    |
| Expect-CT                    | Optional    | Security    |
| Server                       | Recommended | Info        |
| X-Powered-By                 | Recommended | Info        |
| Content-Type                 | Critical    | Performance |
| Cache-Control                | Recommended | Performance |
| Content-Encoding             | Recommended | Performance |
| Transfer-Encoding            | Optional    | Performance |
| Vary                         | Optional    | Performance |

## Limitations

- Relies on a public CORS proxy (`allorigins.win`) — some sites may block it
- For production use, run a server-side proxy to fetch headers directly
- Some proxies may strip or normalize certain headers

## 📄 License

All tools are released under the **MIT License**. See individual repositories for license details.

---

## 🔗 Links

- **IQVerse:** [iqverse.net](https://iqverse.net)
- **Sekmen.Dev** [Sekmen.Dev](https://sekmen.dev)

---

**Built with ❤️ by developers, for the developer community.**
