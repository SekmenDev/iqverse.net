# AGENTS.project.md

Project-specific rules for IQVerse. Read alongside the root AGENTS.md.

## Stack

- Language/runtime: TypeScript 6 and Node.js 20 or newer
- Framework: Astro 7 with static output
- Package manager: Yarn 4.18.0 via Corepack. Keep `yarn.lock` in sync.
- Dependencies: Fuse.js for tool search, browser-native APIs plus small focused libraries for tool logic
- Deployment target: Static Cloudflare Pages output from `dist/`
- Testing: Vitest for unit tests and Playwright for end-to-end tests

## Commands

- Install: `yarn install`
- Dev server: `yarn dev` (http://localhost:4321)
- Build: `yarn build`
- Preview production build: `yarn preview`
- Test: `yarn test`
- E2E tests: `yarn test:e2e`
- Lint: `yarn lint`
- Type check and Astro diagnostics: `yarn check`
- Full test suite: `yarn test:all`

Run the narrowest relevant check first. Run `yarn build` after changes that affect Astro pages, layouts, styles, configuration or generated routes.

## Repository structure

- `src/pages/`: Astro routes. Each tool normally lives at `src/pages/<slug>/index.astro`.
- `src/components/`: Shared Astro components such as `ToolCard`, `ToolNavSearch` and `ThemeToggle`.
- `src/layouts/`: Shared page shells. Use `ToolLayout.astro` for tool pages and `Layout.astro` for the site shell.
- `src/styles/`: Global, layout and component CSS modules.
- `lib/`: Pure tool logic and the central registry in `tools.ts`.
- `functions/api/`: Cloudflare Pages API functions for the few features that need a server boundary.
- `__tests__/unit/`: Vitest tests for `lib/` logic and components.
- `__tests__/e2e/`: Playwright route and interaction tests.
- `public/`: Static assets and deployment metadata.

## Conventions

- Prefer pure, browser-compatible functions in `lib/` and keep tool computation client-side.
- Add a new tool's logic, Astro page, unit test and `lib/tools.ts` registry entry together.
- Use the existing `ToolLayout` and shared styles before adding page-specific structure.
- Keep routes trailing-slash compatible. Astro is configured with directory format and `trailingSlash: 'always'`.
- Preserve strict TypeScript settings. Avoid `any` and keep aliases compatible with `@/*`.
- Use the existing category, status and search metadata conventions in `lib/tools.ts`.
- Keep changes focused. Do not introduce a new framework, state library or backend for a client-side tool.

## Environment

- Required services: none for local development.
- No `.env` file is required by the current application. Never commit secrets.
- Network-dependent tools may call public services from the browser or use the relevant function in `functions/api/` when CORS requires a server relay.

## Security notes

- Treat all tool input as untrusted. Escape or sanitize content before rendering HTML and validate URLs before network requests.
- Tool computations should remain in the browser. Do not add telemetry, analytics, login requirements or remote persistence without an explicit product decision.
- Do not log passwords, tokens, uploaded files, request bodies or other user-provided secrets.
- Keep security-sensitive behavior covered by focused unit tests and update the matching Playwright route test when user-visible behavior changes.

## Out of scope for agents

- Do not make production deployment changes or modify Cloudflare settings without an explicit request.
- Do not add external data collection or change the client-side privacy promise without an explicit request.
- Do not rewrite unrelated tools or regenerate reports and build artifacts as part of a focused change.
