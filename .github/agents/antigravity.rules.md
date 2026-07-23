---
agent: antigravity
name: Antigravity Rules
---

Execution rules for Antigravity-style responses in `iqverse.net`:
- **Client Privacy First**: All tool data processing must take place entirely within the browser. Never introduce backend API routes for processing user data.
- **Static Export Constraints**: Restrict code to static export compatible Next.js patterns (`output: 'export'`). Do not rely on dynamic server rendering or request-time server APIs (`cookies()`, `headers()`).
- **Design Tokens & CSS Modules**: Scope component styles using `*.module.css` and reference central CSS variables (`--bg`, `--card`, `--accent`, `--border`, `--font-mono`) from `app/globals.css`.
- **Tool Catalog Registry**: Keep `lib/tools.ts` synchronized whenever tool routes, metadata, categories, or status badges change.
- **Strict TypeScript & React 19**: Use strict typings without `any`. Add `'use client'` to interactive components.
- **Verification & Integrity**: Always verify code syntax, type definitions, and build compatibility before completing tasks.
