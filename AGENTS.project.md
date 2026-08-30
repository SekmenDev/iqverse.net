# AGENTS.project.md — [project name]

Project-specific rules. Read alongside the root AGENTS.md, which covers cross-project defaults.

## Stack
- Language/runtime: [e.g. .NET 8 / TypeScript 5.x / Node 20]
- Framework(s): [e.g. ABP Framework, Umbraco 13, React Native]
- Package manager: [e.g. yarn only — never npm or pnpm]
- Database: [e.g. PostgreSQL via EF Core]
- Deployment target: [e.g. VPS via Easypanel, Docker, Cloudflare Pages]

## Commands
- Install: [command]
- Dev server: [command]
- Build: [command]
- Test: [command]
- Lint: [command]
- Type check: [command]

## Conventions
- [e.g. no public setters on entities]
- [e.g. direct EF Core queries, no generic repositories]
- [e.g. Sekmen.* namespace convention]
- [PR/commit message format, if it differs from the root file]

## Environment
- Secrets/env vars documented in: [path, e.g. .env.example]
- Required services running locally: [list or "none"]

## Security notes
- [Anything specific to this project: auth model, rate limits, data handled]

## Out of scope for agents
- [Anything agents should never touch autonomously, e.g. production migrations, billing code]
