# DNS Lookup Tool

A professional, fully client-side DNS lookup tool for networking and DevOps tasks. Query any DNS record type for any domain — directly in your browser, with no backend server required.

![License](https://img.shields.io/badge/license-MIT-green) ![Open Source](https://img.shields.io/badge/open-source-blue) ![Browser](https://img.shields.io/badge/browser-based-9cf)

📍 [Launch Tool](https://dnslookup.iqverse.net/)

---

## Features

- **13 record types** — A, AAAA, MX, TXT, NS, CNAME, SOA, SRV, PTR, CAA, DS, DNSKEY
- **Batch "ALL" mode** — queries all record types in parallel in a single click
- **Tabbed results** — switch between record types without re-querying
- **Smart TXT parsing** — automatically labels SPF, DMARC, DKIM, Google verification records
- **SOA formatting** — displays all SOA fields (mname, rname, serial, refresh, retry, expire, minimum) in human-readable form
- **DNSSEC options** — toggle DO bit, CD bit and EDNS Client Subnet per query
- **TTL formatting** — converts raw seconds to `h/m/s` notation
- **Copy JSON** — copy the full raw API response as JSON
- **Copy Raw** — copy records as zone-file style text
- **Export CSV** — download results as a .csv file
- **Share Link** — generates a shareable URL with domain + type pre-filled
- **Query history** — last 20 lookups stored in localStorage, re-runnable with one click
- **Raw JSON viewer** — expandable panel showing the unprocessed API response
- **URL params** — supports `?domain=example.com&type=MX` for direct deep-linking
- **Quick presets** — one-click sample domains to get started fast
- **No build step** — pure HTML + CSS + JS, works with any static file host

---

## API

Powered by [Google Public DNS-over-HTTPS](https://developers.google.com/speed/public-dns/docs/doh/json):

```text
https://dns.google/resolve?name=example.com&type=A
```

Requests are made directly from the user's browser — no proxy, no server, no data collection.

---

## Privacy

Everything runs in your browser.  
**No data is ever sent to a server.**

---

## 📄 License

All tools are released under the **MIT License**. See individual repositories for license details.

---

## 🔗 Links

- **IQVerse:** [iqverse.net](https://iqverse.net)
- **Sekmen.Dev** [Sekmen.Dev](https://sekmen.dev)

---

**Built with ❤️ by developers, for the developer community.**
