# AgentScan — AI Agent Readiness Analyzer

Scan any website to discover how compatible it is with AI agents. AgentScan checks 28+ signals across 6 categories and gives you an actionable readiness score with prioritized recommendations.

![License](https://img.shields.io/badge/license-MIT-green) ![Open Source](https://img.shields.io/badge/open-source-blue) ![Browser](https://img.shields.io/badge/browser-based-9cf)

📍 [Launch Tool](https://agentscan.iqverse.net/)

---

## Features

### 6 Check Categories (28+ individual checks)

| Category                  | Checks                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Discoverability**       | robots.txt, XML Sitemap, Link headers, Meta tags, Favicon                                                                    |
| **Content Accessibility** | Markdown negotiation, JSON-LD structured data, Machine-readable content, RSS/Atom feed                                       |
| **Bot Access Control**    | AI bot rules (GPTBot, ClaudeBot, etc.), Content Signals header, Web Bot Auth, ai.txt / llms.txt                              |
| **Protocol / MCP**        | MCP Server Card, A2A Agent Card, OAuth discovery, OAuth Protected Resource (RFC 9728), OpenAPI/Swagger, Agent Skills, WebMCP |
| **Commerce**              | x402 payment protocol, UCP, ACP                                                                                              |
| **Performance**           | HTTPS, HSTS, Security headers, CORS headers, Response time                                                                   |

### UI Features

- **Animated score ring** (0–100 with letter grade)
- **Category breakdown** with mini progress bars
- **Grid or list view** for check results
- **Sort by category, status or name**
- **Filter by category** (Discoverability, Content, Bot Access, Protocol, Commerce)
- **Quick example URLs** — try cloudflare.com, github.com, openai.com, etc.
- **Prioritized recommendations** with copy-paste code snippets
- **Export results as JSON** for further processing
- **Raw scan data viewer**
- Loading overlay with per-check progress

---

## How It Works

AgentScan uses the [AllOrigins](https://allorigins.win) CORS proxy to fetch resources from target domains directly in the browser — no backend required.

Resources checked in a single parallel batch:

- `GET /robots.txt`
- `GET /sitemap.xml`
- `GET /.well-known/mcp.json`
- `GET /.well-known/agent.json`
- `GET /.well-known/oauth-authorization-server`
- `GET /.well-known/oauth-protected-resource`
- `GET /openapi.json`, `/swagger.json`, `/api-docs`
- `GET /.well-known/agent-skills.json`
- `GET /.well-known/webmcp.json`
- `GET /.well-known/x402.json`, `/ucp.json`, `/acp.json`
- `GET /ai.txt`, `/llms.txt`
- `GET /` (homepage for headers and meta analysis)

Response headers are parsed for: Link, Content-Type, Vary, HSTS, CSP, CORS, Web Bot Auth, Content Signals, X-Content-Type-Options.

---

## 📄 License

All tools are released under the **MIT License**. See individual repositories for license details.

---

## 🔗 Links

- **IQVerse:** [iqverse.net](https://iqverse.net)
- **Sekmen.Dev** [Sekmen.Dev](https://sekmen.dev)

---

**Built with ❤️ by developers, for the developer community.**
