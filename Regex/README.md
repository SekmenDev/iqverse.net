# RegEx Forge

**A browser-based Regex Tester & Explainer** — part of the [IQVerse](https://iqverse.net) open-source tools collection by [Sekmen.Dev](https://sekmen.dev).

---

## Features

### 01 — Pattern (Tester)
- Live regex testing with real-time match highlighting in the preview panel
- Flag controls: `g` `i` `m` `s` `u` — toggle individually
- Match count badge and full match list with index positions
- **Substitution mode** — test replacements with `$1`, `$2`, named groups, etc.
- **Capture group** breakdown panel
- Stats bar: matches · groups · steps · execution time (µs)

### 02 — Explainer
- Visual **token strip** — every part of your pattern color-coded by type (anchor, quantifier, group, character class, escape, literal, alternation)
- **Step-by-step breakdown** with title and plain-English description per token
- **Plain English explanation** of the full pattern
- **Dynamic cheat sheet** — shows only the tokens present in your current pattern

### 03 — Library
- 30+ curated, production-ready regex patterns
- Categories: Validation · Extraction · Formatting · Security · Web · Dates
- Search and filter
- One-click **Use in Tester**, **Copy**, or **Explain** per pattern

### 04 — Reference
- Complete regex reference table with 8 categories:
  Anchors · Character Classes · Quantifiers · Groups & Lookarounds · Flags · Escape Sequences · Alternation · Replacement Tokens

---

## Getting Started

No build step required. Just open `index.html` in any modern browser.

```bash
# Clone or copy the files
cd regex-tester/
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

Or serve with any static server:

```bash
npx serve .
# or
python3 -m http.server
```

---

## File Structure

```
regex-tester/
├── index.html   # Markup & layout
├── style.css    # Design system & styles
├── app.js       # All logic (tokenizer, tester, explainer, library)
└── README.md
```

---

## Tech Stack

- Pure HTML, CSS, JavaScript — **zero dependencies**
- Google Fonts: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) + [Syne](https://fonts.google.com/specimen/Syne)
- Native `RegExp` API for matching
- `performance.now()` for execution time measurement

---

## License

MIT — Open source, no tracking, no servers.

---

*Part of [IQVerse](https://iqverse.net) · Made with ❤️ by [Sekmen.Dev](https://sekmen.dev)*
