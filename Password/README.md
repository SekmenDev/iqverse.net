# 🔐 SecretForge

**Password & Secret Generator** — Part of the [IQVerse](https://iqverse.net) toolset by [Sekmen.Dev](https://sekmen.dev)

> Generate secure passwords, tokens, API keys, and environment secrets locally in your browser. No servers. No tracking. No cost.

![License](https://img.shields.io/badge/license-MIT-green) ![Open Source](https://img.shields.io/badge/open-source-blue) ![Browser](https://img.shields.io/badge/browser-based-9cf)

📍 [Launch Tool](https://password.iqverse.net/)

---

## Features

### 01 — Password Generator

- Configurable length (4–128 characters)
- Toggle character sets: uppercase, lowercase, digits, symbols
- Exclude similar characters (`0Oo1Il`) or ambiguous symbols
- Custom symbol set override
- Minimum character count guarantees (e.g. at least 2 digits)
- Prefix / suffix support
- Real-time entropy & strength scoring

### 02 — Secret / Token Generator

| Type | Use Case |
| ---- | -------- |
| **Hex** | Database keys, raw secrets |
| **Base64** | JWT secrets, general API keys |
| **Base64URL** | URL-safe tokens, OAuth |
| **UUID v4** | Entity IDs, idempotency keys |
| **ULID** | Sortable unique identifiers |
| **Alphanumeric** | Clean readable tokens |
| **PIN / OTP** | Numeric codes (4–12 digits) |
| **Passphrase** | Human-memorable secrets |

Output formats: Raw, `.env KEY=VALUE`, JSON

### 03 — Bulk Generator

Ready-made presets for common project needs:

- `.env` — Full application environment file
- **Database Credentials** — User + password + database name
- **JWT Secrets** — Access + refresh token pairs
- **API Keys** — Public/private key pairs (`pk_` / `sk_`)
- **Docker Secrets** — Registry + admin credentials
- **ABP Framework** — Complete ABP stack secrets (OpenIddict, Redis, RabbitMQ, EF Core)

### 04 — Strength Analyzer

Paste any existing password or secret to get:

- Visual strength bar
- Entropy bit calculation
- Unique character count
- Character type breakdown
- 8-point security checklist

---

## Security

- **100% client-side** — all generation uses the browser's `crypto.getRandomValues()` API
- **No network requests** — nothing is ever sent to a server
- **No localStorage** — session history is in-memory only and cleared on tab close
- **No dependencies** — zero external JavaScript libraries

---

## Tech Stack

- Vanilla HTML5 / CSS3 / JavaScript (ES2020+)
- `crypto.getRandomValues()` for cryptographically secure randomness
- [JetBrains Mono](https://www.jetbrains.com/legalnotice/fonts/) + [Outfit](https://fonts.google.com/specimen/Outfit) via Google Fonts

---

## 📄 License

All tools are released under the **MIT License**. See individual repositories for license details.

---

## 🔗 Links

- **IQVerse:** [iqverse.net](https://iqverse.net)
- **Sekmen.Dev** [Sekmen.Dev](https://sekmen.dev)

---

**Built with ❤️ by developers, for the developer community.**
