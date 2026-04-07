<div align="center">

```text
  ██╗     ██╗███╗   ██╗██╗  ██╗██████╗  █████╗ ██████╗  █████╗ ██████╗
  ██║     ██║████╗  ██║██║ ██╔╝██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗
  ██║     ██║██╔██╗ ██║█████╔╝ ██████╔╝███████║██║  ██║███████║██████╔╝
  ██║     ██║██║╚██╗██║██╔═██╗ ██╔══██╗██╔══██║██║  ██║██╔══██║██╔══██╗
  ███████╗██║██║ ╚████║██║  ██╗██║  ██║██║  ██║██████╔╝██║  ██║██║  ██║
  ╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
```

**Hunt down every broken link on your site from your browser.**

[![MIT License](https://img.shields.io/badge/license-MIT-00ff87?style=flat-square)](./LICENSE)
[![No Server Required](https://img.shields.io/badge/backend-none-00d4ff?style=flat-square)](/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-a855f7?style=flat-square)](/)
[![Single File](https://img.shields.io/badge/deployment-single%20HTML%20file-ffd166?style=flat-square)](/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ff9640?style=flat-square)](./CONTRIBUTING.md)

[**→ Open LinkRadar**](./linkradar.html) · [Report a Bug](../../issues) · [Request a Feature](../../issues)

</div>

---

## Table of Contents

- [What is LinkRadar?](#what-is-linkradar)
- [Why We Built This](#why-we-built-this)
- [Features](#features)
- [How It Works](#how-it-works)
- [Usage Guide](#usage-guide)
- [Report Reference](#report-reference)
- [CORS & Limitations](#cors--limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## What is LinkRadar?

LinkRadar is a **zero-install, zero-backend, single-file HTML application** that crawls any website and reports every URL's HTTP status directly from your browser.

No npm. No Node. No server. No account. No data ever leaves your machine.

Open the file, enter a URL, click **Scan**. That's it.

```text
$ open linkradar.html
# Enter https://your-site.com
# Click Scan
# Done.
```

---

## Why We Built This

Every broken link tool we tried had at least one of these problems:

| Tool Type | Problem |
|-----------|---------|
| **SaaS products** | Paid subscription, rate-limited, sends your URLs to a third party |
| **Browser extensions** | Requires install, elevated permissions, often Chrome-only |
| **CLI tools** | Requires Node/Python/Ruby, environment setup, not portable |
| **Online tools** | Sends your site's structure to their servers |

We wanted something that a developer could:

1. Download as a single file (or just bookmark)
2. Open directly in any browser
3. Run against any site without configuring anything
4. Trust completely because they can read every line of the source

So we built LinkRadar. Vanilla JS. One file. MIT license. No telemetry. No build step.

### The "fix-it" context gap

Other tools tell you *that* a URL is broken. They don't tell you *where* it lives. Finding a 404 URL is the easy part hunting down which page, which HTML element and which link text contains it is the frustrating part. LinkRadar surfaces all of that directly in the report.

---

## Features

### 🔍 Full Site Crawl

Performs a breadth-first crawl starting at your entry URL. Follows all internal links up to a configurable depth. Deduplicates visited URLs to prevent infinite loops.

### ⚡ Real-Time Progress

A high-contrast progress bar pins to the very top of the viewport and a live console log streams every checked URL as it happens. You always know the scanner is alive even on large sites.

### 🏷️ Status Badges

Every URL in the report gets a color-coded rounded badge:

| Badge | Meaning |
| ------- | --------- |
| 🟢 `200 OK` | Resource is reachable and returned successfully |
| 🟠 `301 Moved Permanently` | Permanent redirect consider updating the link |
| 🟠 `302 Found` | Temporary redirect |
| 🔴 `404 Not Found` | Resource does not exist **broken link** |
| 🔴 `410 Gone` | Resource was intentionally removed |
| 🟣 `500 Internal Server Error` | Server-side failure |
| ⚫ `Network Error` | CORS block or connection failure |

### 🛠️ "Fix-it" Source Context

Every result row shows:

- **Source page** which page the link was found on
- **HTML element** `<a>`, `<img>`, `<script>`, `<link>`
- **Anchor/alt text** the visible text or alt attribute of the element
- **Response time** in milliseconds
- **Crawl depth** how many hops from the root URL

### 🔎 Filter, Search & Sort

- Filter by status class: All / 2xx / 3xx / 4xx-5xx / Other
- Full-text search on URLs
- Click any column header to sort ascending or descending
- Paginated at 50 rows per page for large result sets

### 📦 Export

Export the current view (respecting active filters) as:

- **CSV** for spreadsheets, Google Sheets, bug trackers
- **JSON** for CI pipelines, scripts or custom tooling

### ⚙️ Configurable Options

- **Max crawl depth** 1–10 levels deep
- **Check external links** toggle to include or skip off-domain URLs
- **Check images & assets** toggle to also scan `<img>`, `<script>` and `<link>` tags
- **Crawl sub-pages** toggle whether discovered internal pages get recursively crawled

---

## How It Works

LinkRadar is a **client-side BFS (breadth-first search) crawler** implemented in vanilla JavaScript using only browser-native APIs.

### Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│                                                                 │
│  ┌─────────────┐     ┌──────────────────┐     ┌─────────────┐   │
│  │  Input URL  │────>│  BFS Queue       │────>│  Report UI  │   │
│  └─────────────┘     │                  │     └─────────────┘   │
│                      │  visited: Set()  │                       │
│                      │  queue: Array[]  │                       │
│                      └────────┬─────────┘                       │
│                               │                                 │
│                    ┌──────────▼──────────┐                      │
│                    │  Concurrency Batch  │                      │
│                    │  (5 parallel reqs)  │                      │
│                    └──────────┬──────────┘                      │
│                               │                                 │
│               ┌───────────────┼───────────────┐                 │
│               ▼               ▼               ▼                 │
│         HEAD request    HEAD request    HEAD request            │
│         fetch() API     fetch() API     fetch() API             │
│               │               │               │                 │
└───────────────┼───────────────┼───────────────┼─────────────────┘
                ▼               ▼               ▼
           Target Site     External URL    External URL
```

### Step-by-Step

**1. Fetch & Parse Entry Point**
The provided URL is fetched with the browser's native `fetch()` API using `mode: 'cors'`. The HTML response body is parsed with the built-in `DOMParser` to extract all link elements.

```js
const res = await fetch(rootUrl, { mode: 'cors', cache: 'no-store' });
const html = await res.text();
const doc = new DOMParser().parseFromString(html, 'text/html');
```

**2. Link Extraction**
All `<a href>`, `<img src>`, `<script src>` and `<link href>` elements are extracted and resolved to absolute URLs using the `URL` constructor. Each link is tagged with its source page, element type and anchor/alt text.

```js
doc.querySelectorAll('a[href]').forEach(el =>
  links.push({ url: el.href, tag: '<a>', text: el.innerText, sourceUrl: baseUrl })
);
```

**3. BFS Queue with Deduplication**
URLs are enqueued and processed using a while loop with a `Set`-based visited registry. Deduplication prevents the same URL from being checked twice, regardless of how many pages link to it.

```js
const visited = new Set();
while (queue.length > 0) {
  const item = queue.shift();
  if (visited.has(item.url)) continue;
  visited.add(item.url);
  // ... process
}
```

**4. Concurrent HEAD Requests**
Outbound URLs are verified using `HEAD` requests in batches of 5 (configurable) via `Promise.all()`. `HEAD` is used because it retrieves only status codes without downloading response bodies keeping the scan fast and lightweight. If a server rejects `HEAD` (405), LinkRadar automatically falls back to `GET`.

```js
const results = await Promise.all(
  batch.map(item => fetch(item.url, { method: 'HEAD', redirect: 'follow' }))
);
```

**5. Recursive Crawl (Same-Origin Only)**
For same-origin pages that return `2xx` responses and are within the configured depth limit, the HTML body is fetched and parsed to discover more links. External URLs are checked for status only never crawled.

**6. Live UI Updates**
After each batch completes, results are streamed into the DOM. The progress bar, counter, console log, stat cards and result table are all updated in real time no waiting for the full scan to finish.

### Concurrency & Rate Limiting

The default concurrency of 5 parallel requests is intentionally conservative to avoid overwhelming target servers. For large sites, the total scan time scales linearly with `total_urls / 5`. You can mentally estimate: ~1000 URLs ≈ 3–5 minutes depending on server response times.

---

## Usage Guide

### Basic Scan

1. Enter a full URL including protocol: `https://your-site.com`
2. Configure depth (default: 3) and options
3. Click **Scan** the button becomes **Stop** during scanning
4. Watch the console log and progress bar in real time
5. When complete, the full report appears below

### Scan Options

| Option | Default | Description |
| -------- | --------- | ------------- |
| Check external links | ✅ On | Verify external URLs for status (not crawled) |
| Check images & assets | ✅ On | Scan `<img>`, `<script>`, `<link>` in addition to `<a>` |
| Crawl sub-pages | ✅ On | Follow and parse same-origin pages recursively |
| Max depth | 3 | Maximum link hops from root URL |

### Reading the Report

Each row in the result table shows:

```text
┌──────────────┬──────────────────────────────────────────┬──────────────────────────────┬───────┬───────┐
│   Status     │   URL                                    │   Source                     │  Time │ Depth │
├──────────────┼──────────────────────────────────────────┼──────────────────────────────┼───────┼───────┤
│ 404 Not Found│ /blog/old-post                           │ /index.html                  │ 204ms │  1    │
│              │                                          │ <a> · "Read more"            │       │       │
└──────────────┴──────────────────────────────────────────┴──────────────────────────────┴───────┴───────┘
```

The **Source** column is the "fix-it" context it tells you exactly where to look in your codebase to remove or update the broken link.

---

## Report Reference

### HTTP Status Classes

| Class | Color | Meaning |
| ------- | ------- | --------- |
| 2xx | 🟢 Green | Success resource is accessible |
| 3xx | 🟠 Orange | Redirect link works but may need updating |
| 4xx | 🔴 Red | Client error resource is broken or missing |
| 5xx | 🟣 Purple | Server error target server has an issue |
| Network Error | ⚫ Grey | CORS block, DNS failure or connection timeout |

### Common Status Codes

| Code | Name | Action |
| ------ | ------ | -------- |
| `200` | OK | No action needed |
| `301` | Moved Permanently | Update link to final destination |
| `302` | Found | Monitor may become permanent |
| `403` | Forbidden | Link exists but is restricted may be correct |
| `404` | Not Found | **Fix or remove the link** |
| `410` | Gone | Resource deliberately removed **remove the link** |
| `429` | Too Many Requests | Rate limited recheck later |
| `500` | Internal Server Error | External issue inform site owner |
| `0` | Network Error | Likely CORS see section below |

### Export Formats

**CSV columns:** `Status, URL, SourcePage, Tag, AnchorText, TimeMs, Depth`

**JSON schema:**

```json
{
  "url": "https://example.com/missing",
  "status": 404,
  "time": 204,
  "depth": 1,
  "sourceUrl": "https://example.com/",
  "tag": "<a>",
  "text": "Read our launch post"
}
```

---

## CORS & Limitations

### The CORS Reality

Because LinkRadar runs entirely in your browser, all requests are subject to browser CORS policies. This means:

- **Same-site scanning works perfectly** if you open LinkRadar from `https://your-site.com/linkradar.html`, all requests to `your-site.com` are same-origin and unrestricted.

- **Cross-origin scanning depends on the target** many public sites include `Access-Control-Allow-Origin: *` headers, which allows cross-origin requests from any page. Scanning these works fine.

- **Restricted sites will show Network Error (0)** if a site doesn't send CORS headers, the browser will block the response. The link may actually be fine you'll just see `Network Error` instead of the real status code.

### Workarounds

| Scenario | Solution |
| ---------- | ---------- |
| Scanning your own site | Run LinkRadar from your own domain (same-origin) |
| Local development | Use `python3 -m http.server` and open via `localhost` |
| CI / automated scanning | Use a headless approach like Playwright or a Node CLI |
| Enterprise sites | Deploy LinkRadar on the same domain as the site being scanned |

### What LinkRadar Cannot Do

- **Cannot bypass authentication** pages behind login walls won't be crawled
- **Cannot scan JavaScript-rendered links** SPA link discovery requires running JS, which LinkRadar does for the entry point only
- **Cannot use a proxy** by design, to ensure no data leaves your browser

---

## Roadmap

- [ ] **Sitemap.xml support** parse `sitemap.xml` to seed the URL queue for faster full-site coverage
- [ ] **Ignore list** configure URL patterns to skip (regexes, path prefixes)
- [ ] **Retry logic** automatic retry for `429` and `5xx` responses with configurable back-off
- [ ] **HTML report export** downloadable self-contained HTML report
- [ ] **Keyboard shortcuts** `⌘K` to focus input, `Esc` to stop scan, `/` to search
- [ ] **Dark/light mode toggle** respect `prefers-color-scheme`
- [ ] **Anchor fragment checking** verify that `#anchor` links resolve to real IDs on the target page
- [ ] **Scan history** persist recent scans to `localStorage` for quick re-running
- [ ] **PWA** add a service worker and manifest for offline use and home screen install

---

## Contributing

Contributions are what make open source worth building. All PRs are welcome.

```bash
# 1. Fork the repo
# 2. Clone your fork
git clone https://github.com/your-username/linkradar.git

# 3. Make changes to linkradar.html
# 4. Test in your browser
open linkradar.html

# 5. Open a PR with a clear description
```

### Guidelines

- Keep it **single-file** the whole point is zero-setup deployment
- Keep it **zero-dependency** no npm, no bundler, no build step
- Add comments for any non-obvious logic
- Test in Chrome, Firefox and Safari before submitting

---

## License

MIT License © LinkRadar Contributors

```text
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, distribute, and/or
sublicense it, subject to the conditions in the full LICENSE file.
```

---

<div align="center">

Built with ♥ by developers, for developers.

**No servers. No tracking. No cost. Forever.**

[⭐ Star on GitHub](https://github.com/your-org/linkradar) · [🐛 Report a Bug](../../issues) · [💡 Request a Feature](../../issues)

</div>
