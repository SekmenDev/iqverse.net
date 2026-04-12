# EncodeLab — Base64 & URL Encoder/Decoder

A fast, privacy-first browser tool for everything encoding. No servers, no tracking, no cost.

**Live at:** [iqverse.net](https://iqverse.net/)  
**Part of the IQVerse toolset by [Sekmen.Dev](https://sekmen.dev)**

---

## Features

### 01 · Base64

- Encode / Decode with live output
- URL-safe variant (`+` → `-`, `/` → `_`)
- No-padding mode
- 76-char line break (MIME)
- UTF-8 / binary input toggle
- Char count, byte count, size overhead stats
- Valid Base64 detection
- Paste, Clear, Copy, Download output

### 02 · URL Encode

- `encodeURIComponent` (default)
- `encodeURI` (full URL)
- RFC 3986 strict mode
- Form encoding (`%20` → `+`)
- Decode mode with swap
- **Query parameter parser** — paste any URL and see all params in a table

### 03 · JWT Inspector

- Paste any JWT and instantly see:
  - Color-coded header / payload / signature
  - Pretty-printed JSON with syntax highlighting
  - Algorithm badge
  - Validity status (Valid / Expired / Not yet valid / No exp)
  - Standard claims table (iss, sub, aud, exp, iat, nbf, jti, name, email…)
  - Human-readable timestamps for `iat`, `exp`, `nbf`
- Includes a sample token for quick testing

### 04 · File → Base64

- Drag & drop or browse any file
- Optional Data URI prefix (`data:image/png;base64,…`)
- Optional 76-char line breaks
- Copy to clipboard or save as `.txt`
- **Reverse**: paste Base64/Data URI → download original file

### 05 · Data URI Builder & Inspector

- **Inspector**: paste a `data:` URI → see MIME type, encoding, size, decoded size and a live preview (image, HTML iframe or text)
- **Builder**: type text/HTML/SVG/JSON → choose MIME and encoding → get a ready-to-use Data URI
- Download the inspected file

### 06 · Diff / Compare

- Paste two Base64 or URL-encoded strings
- Decodes both and shows a word-level diff side-by-side
- Color-coded: green = added, red = removed, plain = unchanged
- Stats: same chars, changed chars, length per side

---

## Usage

No build step. Just open `index.html` in any modern browser.

```text
encoder/
├── index.html   # App shell, tab layout, all panels
├── style.css    # Dark theme, all component styles
├── app.js       # All logic — zero dependencies
└── README.md
```

For deployment, copy all three files to any static host (Easypanel, Vercel, GitHub Pages, Nginx, etc.).

---

## Privacy

Everything runs in your browser.  
**No data is ever sent to a server.**

---

## License

MIT — Open source, fork freely.

---

_Part of [IQVerse](https://iqverse.net/) · Made by [Sekmen.Dev](https://sekmen.dev) · Published on [GitHub](https://github.com/SekmenDev/iqverse.net)_
