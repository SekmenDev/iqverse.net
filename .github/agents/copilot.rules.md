---
agent: copilot
name: GitHub Copilot Rules
---

Execution rules for Copilot-style responses in `iqverse.net`:
- **Direct Code Delivery**: Focus on providing clear, copy-paste ready TypeScript and React code snippets.
- **React 19 & Client Components**: Mark interactive components with `'use client'` and leverage React 19 hooks (`useState`, `useCallback`, `useMemo`, `useRef`) efficiently.
- **CSS Module Usage**: Scope styles using `[name].module.css` and utilize global tokens (`var(--surface)`, `var(--accent)`, `var(--border)`).
- **Browser API Integration**: Prefer browser-native APIs (`crypto.subtle`, `FileReader`, `TextEncoder`, `URL`, `HTMLCanvasElement`) over heavy third-party npm packages.
- **Tool Registration**: Keep `lib/tools.ts` updated with any new route or tool metadata.
- **No Remote Telemetry**: Ensure zero network fetches for user data processing.

