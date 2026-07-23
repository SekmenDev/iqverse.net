---
agent: claude
name: Claude Rules
---

Execution rules for Claude-style responses in `iqverse.net`:
- **Client Privacy Enforcement**: Never create API routes (`app/api/`) or send user input payloads to external endpoints for tool operations. Use WebCrypto, Canvas, SVG, DOM APIs, and Web Workers.
- **Static Export Boundaries**: Do not use Next.js server features incompatible with static exports (such as `cookies()`, `headers()`, dynamic server rendering, or SSR-only packages).
- **Styling Standards**: Use scoped CSS Modules (`*.module.css`) and global tokens (`--bg`, `--card`, `--accent`, `--border`, `--font-mono`) from `app/globals.css`.
- **Tool Catalog Registry**: Whenever adding or modifying a tool, ensure its entry in `lib/tools.ts` (`tools` array) matches the slug, name, icon, tags, category, and status.
- **TypeScript Integrity**: Use strict types and explicit interfaces. Avoid using `any` or disabling type checks.
- **Structured Explanations**: Provide clear architectural breakdowns, highlighting open design decisions or security implications.

