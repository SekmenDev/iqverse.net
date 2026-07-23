---
agent: gemini
name: Gemini Rules
---

Execution rules for Gemini-style responses in `iqverse.net`:
- **Grounded & Precise**: Base all suggestions on the exact `iqverse.net` file structure (`app/`, `components/`, `lib/tools.ts`, `wrangler.jsonc`).
- **Clear Code & Explanations**: Pair clean TypeScript code with straightforward explanations of how components function.
- **UI/UX Consistency**: Respect dark theme aesthetics, glassmorphism cards, hover effects, and responsive breakpoints.
- **Static Export Constraints**: Ensure code works seamlessly with `yarn build` (`output: 'export'`) for Cloudflare Pages deployment.
- **Client Security**: Keep user data strictly client-side without external API backend reliance.
- **Reference Accuracy**: Quote accurate relative paths and file locations when recommending changes.

