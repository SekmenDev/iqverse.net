/* ═══════════════════════════════════════════════════════════════
   HeaderScan — HTTP Security Headers Analyzer
   ═══════════════════════════════════════════════════════════════ */

/* ── Header Definitions ─────────────────────────────────────── */
const SECURITY_HEADERS = [
  {
    name: 'Content-Security-Policy',
    short: 'CSP',
    priority: 'critical',
    category: 'security',
    description: 'Controls which resources (scripts, styles, images, etc.) the browser is allowed to load. Prevents XSS and data injection attacks.',
    check(val) {
      if (!val) return { status: 'fail', message: 'Missing! CSP is the most important defense against XSS attacks.' };
      const warnings = [];
      if (/unsafe-inline/i.test(val)) warnings.push("'unsafe-inline' undermines script/style CSP — avoid if possible.");
      if (/unsafe-eval/i.test(val)) warnings.push("'unsafe-eval' allows eval() — a common XSS vector.");
      if (/\*/.test(val) && !/report-uri|report-to/i.test(val)) warnings.push('Wildcard (*) source weakens CSP significantly.');
      if (!/default-src/i.test(val) && !/script-src/i.test(val)) warnings.push('No default-src or script-src directive found.');
      return warnings.length
        ? { status: 'warn', message: warnings.join(' ') }
        : { status: 'pass', message: 'CSP is present. Review directives for completeness.' };
    },
    parseDirectives(val) {
      if (!val) return [];
      return val.split(';').map(d => d.trim()).filter(Boolean).map(d => {
        const [key, ...rest] = d.split(/\s+/);
        return { key, val: rest.join(' ') || '(empty)', note: getCSPNote(key) };
      });
    },
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy',
    recommendation: `Add: Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`
  },
  {
    name: 'Strict-Transport-Security',
    short: 'HSTS',
    priority: 'critical',
    category: 'security',
    description: 'Forces browsers to use HTTPS for all future requests. Prevents protocol downgrade attacks and cookie hijacking.',
    check(val) {
      if (!val) return { status: 'fail', message: 'Missing! HSTS forces HTTPS and prevents downgrade attacks.' };
      const maxAge = val.match(/max-age=(\d+)/i);
      if (!maxAge) return { status: 'warn', message: 'max-age directive not found.' };
      const age = parseInt(maxAge[1]);
      if (age < 31536000) return { status: 'warn', message: `max-age is only ${age}s. Recommended: 31536000 (1 year) minimum.` };
      if (!val.includes('includeSubDomains')) return { status: 'warn', message: 'Consider adding includeSubDomains.' };
      return { status: 'pass', message: `HSTS configured. max-age: ${age}s${val.includes('preload') ? ', preload eligible.' : '.'}` };
    },
    parseDirectives(val) {
      if (!val) return [];
      return val.split(';').map(d => d.trim()).filter(Boolean).map(d => {
        const [key, ...rest] = d.split('=');
        return { key: key.trim(), val: rest.join('=') || '✓', note: getHSTSNote(key.trim()) };
      });
    },
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security',
    recommendation: `Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  },
  {
    name: 'X-Content-Type-Options',
    short: 'XCTO',
    priority: 'critical',
    category: 'security',
    description: 'Prevents browsers from MIME-sniffing a response away from the declared content-type. Stops certain attacks like drive-by downloads.',
    check(val) {
      if (!val) return { status: 'fail', message: 'Missing! Set to "nosniff" to prevent MIME-type confusion attacks.' };
      if (val.trim().toLowerCase() !== 'nosniff') return { status: 'warn', message: `Value "${val}" is non-standard. Should be exactly "nosniff".` };
      return { status: 'pass', message: 'Correctly set to nosniff.' };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options',
    recommendation: `Add: X-Content-Type-Options: nosniff`
  },
  {
    name: 'X-Frame-Options',
    short: 'XFO',
    priority: 'critical',
    category: 'security',
    description: 'Controls whether the page can be embedded in iframes. Protects against clickjacking attacks. Note: CSP frame-ancestors is the modern replacement.',
    check(val) {
      if (!val) return { status: 'fail', message: 'Missing! Without this header, the page is vulnerable to clickjacking.' };
      const v = val.trim().toUpperCase();
      if (v === 'DENY') return { status: 'pass', message: 'Set to DENY — no framing allowed anywhere. Best choice.' };
      if (v === 'SAMEORIGIN') return { status: 'pass', message: 'Set to SAMEORIGIN — framing allowed from same origin.' };
      if (v.startsWith('ALLOW-FROM')) return { status: 'warn', message: 'ALLOW-FROM is deprecated and not widely supported. Use CSP frame-ancestors instead.' };
      return { status: 'warn', message: `Unknown value: "${val}". Use DENY or SAMEORIGIN.` };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options',
    recommendation: `Add: X-Frame-Options: DENY`
  },
  {
    name: 'X-XSS-Protection',
    short: 'XXP',
    priority: 'recommended',
    category: 'security',
    description: 'Legacy XSS filter for older browsers. Modern browsers use CSP instead. Setting to "0" is often recommended to avoid introducing vulnerabilities in old browsers.',
    check(val) {
      if (!val) return { status: 'warn', message: 'Not present. For legacy browsers, consider setting to "0" or "1; mode=block".' };
      if (val.trim() === '0') return { status: 'pass', message: 'Set to 0 — disables old filter, recommended to avoid side-channel attacks in IE.' };
      if (val.includes('mode=block')) return { status: 'pass', message: 'XSS filter enabled with block mode.' };
      return { status: 'warn', message: 'Review value — outdated in modern browsers but consider for legacy support.' };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection',
    recommendation: `Add: X-XSS-Protection: 0   (or: 1; mode=block for legacy support)`
  },
  {
    name: 'Referrer-Policy',
    short: 'RP',
    priority: 'recommended',
    category: 'security',
    description: 'Controls how much referrer information is included with requests. Prevents leaking sensitive URL parameters to third parties.',
    check(val) {
      if (!val) return { status: 'warn', message: 'Not set. Default browser behavior may leak referrer URLs.' };
      const good = ['no-referrer', 'no-referrer-when-downgrade', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin'];
      const v = val.trim().toLowerCase();
      if (good.includes(v)) return { status: 'pass', message: `Good policy: "${v}".` };
      if (v === 'unsafe-url') return { status: 'fail', message: 'unsafe-url sends full URL in all requests — avoid!' };
      return { status: 'warn', message: `Policy "${v}" may leak referrer. Prefer strict-origin-when-cross-origin.` };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy',
    recommendation: `Add: Referrer-Policy: strict-origin-when-cross-origin`
  },
  {
    name: 'Permissions-Policy',
    short: 'PP',
    priority: 'recommended',
    category: 'security',
    description: 'Restricts browser feature access (camera, mic, geolocation, etc.) for the page and embedded content. Formerly Feature-Policy.',
    check(val) {
      const featurePolicy = window.__rawHeaders?.['feature-policy'];
      const effective = val || featurePolicy;
      if (!effective) return { status: 'warn', message: 'Not set. Browser features like camera, mic, geolocation are unrestricted.' };
      return { status: 'pass', message: 'Permissions policy is configured.' };
    },
    parseDirectives(val) {
      if (!val) return [];
      return val.split(',').map(d => d.trim()).filter(Boolean).map(d => {
        const eq = d.indexOf('=');
        const key = eq > -1 ? d.slice(0, eq).trim() : d.trim();
        const v = eq > -1 ? d.slice(eq + 1).trim() : '(none)';
        return { key, val: v };
      });
    },
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy',
    recommendation: `Add: Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    short: 'COOP',
    priority: 'recommended',
    category: 'security',
    description: 'Isolates the browsing context from cross-origin documents, protecting against Spectre attacks and cross-origin leaks.',
    check(val) {
      if (!val) return { status: 'warn', message: 'Not set. Pages may be vulnerable to cross-origin attacks like Spectre.' };
      if (val.includes('same-origin')) return { status: 'pass', message: `Set to "${val.trim()}". Cross-origin isolation active.` };
      return { status: 'warn', message: `Value "${val}" — consider same-origin for full isolation.` };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy',
    recommendation: `Add: Cross-Origin-Opener-Policy: same-origin`
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    short: 'COEP',
    priority: 'optional',
    category: 'security',
    description: 'Prevents documents from loading cross-origin resources that don\'t explicitly grant permission. Required for SharedArrayBuffer.',
    check(val) {
      if (!val) return { status: 'warn', message: 'Not set. Required alongside COOP for SharedArrayBuffer and high-precision timers.' };
      if (val.includes('require-corp') || val.includes('credentialless')) return { status: 'pass', message: `Set to "${val.trim()}".` };
      return { status: 'warn', message: `Value "${val}" — use require-corp or credentialless.` };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy',
    recommendation: `Add: Cross-Origin-Embedder-Policy: require-corp`
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    short: 'CORP',
    priority: 'optional',
    category: 'security',
    description: 'Allows servers to control which origins can load their resources, protecting against Spectre and cross-site leaking.',
    check(val) {
      if (!val) return { status: 'warn', message: 'Not set. Resources may be loaded by any origin.' };
      const v = val.trim().toLowerCase();
      if (['same-origin', 'same-site', 'cross-origin'].includes(v)) return { status: 'pass', message: `Set to "${v}".` };
      return { status: 'warn', message: `Unknown value "${val}". Use same-origin, same-site, or cross-origin.` };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy',
    recommendation: `Add: Cross-Origin-Resource-Policy: same-origin`
  },
  {
    name: 'Cache-Control',
    short: 'CC',
    priority: 'recommended',
    category: 'performance',
    description: 'Directives for caching mechanisms in both requests and responses. Controls how long resources are cached by browsers and CDNs.',
    check(val) {
      if (!val) return { status: 'warn', message: 'Not set. Browser will use heuristic caching — unpredictable behavior.' };
      if (val.includes('no-store')) return { status: 'pass', message: 'no-store: nothing cached. Good for sensitive pages.' };
      if (val.includes('max-age') || val.includes('s-maxage')) return { status: 'pass', message: `Cache-Control configured: "${val}".` };
      return { status: 'info', message: `Value: "${val}" — review for your use case.` };
    },
    parseDirectives(val) {
      if (!val) return [];
      return val.split(',').map(d => d.trim()).filter(Boolean).map(d => {
        const [key, ...rest] = d.split('=');
        return { key: key.trim(), val: rest.join('=') || '✓', note: getCacheNote(key.trim()) };
      });
    },
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control',
    recommendation: `For static assets: Cache-Control: public, max-age=31536000, immutable\nFor HTML/API: Cache-Control: no-cache, no-store, must-revalidate`
  },
  {
    name: 'Content-Type',
    short: 'CT',
    priority: 'critical',
    category: 'performance',
    description: 'Indicates the MIME type of the resource. Critical for correct rendering and security.',
    check(val) {
      if (!val) return { status: 'fail', message: 'Missing Content-Type! Browser will MIME-sniff, enabling attacks.' };
      if (!val.includes('charset') && val.includes('text/html')) return { status: 'warn', message: 'charset not specified for text/html — add charset=utf-8.' };
      return { status: 'pass', message: `Content-Type: ${val}` };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type',
    recommendation: `Set: Content-Type: text/html; charset=utf-8`
  },
  {
    name: 'Expect-CT',
    short: 'ECT',
    priority: 'optional',
    category: 'security',
    description: 'Allows sites to opt into Certificate Transparency enforcement. Deprecated in favor of CT logs being mandatory for all CAs.',
    check(val) {
      if (!val) return { status: 'info', message: 'Not present. Largely deprecated — CT is now mandatory for public CAs.' };
      return { status: 'pass', message: 'Present (note: largely superseded by mandatory CT logging).' };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect-CT',
    recommendation: `Optional: Expect-CT: max-age=86400, enforce`
  },
  {
    name: 'Server',
    short: 'SRV',
    priority: 'recommended',
    category: 'info',
    description: 'Reveals server software and version. Exposing this helps attackers fingerprint your infrastructure and find known vulnerabilities.',
    check(val) {
      if (!val) return { status: 'pass', message: 'Not exposed — good security practice.' };
      const risky = /apache|nginx|iis|lighttpd|tomcat|jetty|express/i.test(val);
      const version = /[\d\.]+/.test(val);
      if (risky && version) return { status: 'fail', message: `Exposes server type AND version: "${val}". Remove or obfuscate.` };
      if (risky) return { status: 'warn', message: `Reveals server software: "${val}". Consider removing.` };
      return { status: 'warn', message: `Server header present: "${val}". Consider removing.` };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server',
    recommendation: `Remove or replace: Server: (empty or a generic value)`
  },
  {
    name: 'X-Powered-By',
    short: 'XPB',
    priority: 'recommended',
    category: 'info',
    description: 'Often reveals the backend technology (PHP, ASP.NET, Express). Provides attackers with information to target known vulnerabilities.',
    check(val) {
      if (!val) return { status: 'pass', message: 'Not exposed — good practice.' };
      return { status: 'fail', message: `Exposes backend: "${val}". Remove this header in server config.` };
    },
    parseDirectives: null,
    mdn: null,
    recommendation: `Remove: X-Powered-By header entirely`
  },
  {
    name: 'Set-Cookie',
    short: 'SCK',
    priority: 'critical',
    category: 'security',
    description: 'Cookie security attributes prevent various attacks. Secure, HttpOnly, and SameSite are critical flags.',
    check(val) {
      if (!val) return { status: 'info', message: 'No Set-Cookie header found in this response.' };
      const flags = [];
      if (!/HttpOnly/i.test(val)) flags.push('Missing HttpOnly — JS can access this cookie.');
      if (!/Secure/i.test(val)) flags.push('Missing Secure — cookie sent over HTTP.');
      if (!/SameSite/i.test(val)) flags.push('Missing SameSite — vulnerable to CSRF.');
      if (flags.length) return { status: 'warn', message: flags.join(' | ') };
      return { status: 'pass', message: 'Cookie has HttpOnly, Secure, and SameSite attributes.' };
    },
    parseDirectives(val) {
      if (!val) return [];
      return val.split(';').map(d => d.trim()).filter(Boolean).map(d => {
        const [key, ...rest] = d.split('=');
        return { key: key.trim(), val: rest.join('=') || '✓' };
      });
    },
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie',
    recommendation: `Set-Cookie: sessionId=...; HttpOnly; Secure; SameSite=Strict; Path=/`
  },
  {
    name: 'Access-Control-Allow-Origin',
    short: 'CORS',
    priority: 'recommended',
    category: 'security',
    description: 'Controls CORS — which origins can access this resource. Wildcard (*) should never be used for authenticated endpoints.',
    check(val) {
      if (!val) return { status: 'info', message: 'Not present — CORS not enabled for this resource.' };
      if (val.trim() === '*') return { status: 'warn', message: 'Wildcard (*) allows any origin — dangerous for authenticated APIs.' };
      return { status: 'pass', message: `CORS restricted to: "${val}".` };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin',
    recommendation: `Set specific origin: Access-Control-Allow-Origin: https://yourdomain.com`
  },
  {
    name: 'Transfer-Encoding',
    short: 'TE',
    priority: 'optional',
    category: 'performance',
    description: 'Indicates the form of encoding used to safely transfer the payload body. chunked is common for streaming.',
    check(val) {
      if (!val) return { status: 'info', message: 'Not present — server uses Content-Length instead of chunked transfer.' };
      return { status: 'pass', message: `Transfer-Encoding: ${val}` };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Transfer-Encoding',
    recommendation: null
  },
  {
    name: 'Content-Encoding',
    short: 'CE',
    priority: 'recommended',
    category: 'performance',
    description: 'Indicates compression applied to the payload. gzip or br (Brotli) saves bandwidth significantly.',
    check(val) {
      if (!val) return { status: 'warn', message: 'No compression detected. Enable gzip or Brotli to reduce transfer size.' };
      if (val.includes('br')) return { status: 'pass', message: 'Brotli compression active — excellent.' };
      if (val.includes('gzip')) return { status: 'pass', message: 'gzip compression active — good.' };
      return { status: 'info', message: `Encoding: ${val}` };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding',
    recommendation: `Enable Brotli (br) or at least gzip compression`
  },
  {
    name: 'Vary',
    short: 'VRY',
    priority: 'optional',
    category: 'performance',
    description: 'Tells caches which request headers affect the response. Important for correct caching when using Accept-Encoding or cookies.',
    check(val) {
      if (!val) return { status: 'info', message: 'Not set — all requests cached identically.' };
      return { status: 'pass', message: `Vary: ${val}` };
    },
    parseDirectives: null,
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary',
    recommendation: `Add: Vary: Accept-Encoding`
  },
];

/* ── Helper Note Functions ──────────────────────────────────── */
function getCSPNote(key) {
  const notes = {
    'default-src': 'Fallback for all resource types',
    'script-src': 'Controls JS sources',
    'style-src': 'Controls CSS sources',
    'img-src': 'Controls image sources',
    'font-src': 'Controls font sources',
    'connect-src': 'Controls XHR, fetch, WebSocket',
    'frame-src': 'Controls iframe sources',
    'frame-ancestors': 'Who can embed this page',
    'object-src': 'Controls plugins (Flash etc)',
    'base-uri': 'Restricts <base> tag',
    'form-action': 'Controls form submission targets',
    'report-uri': 'Deprecated reporting endpoint',
    'report-to': 'Modern reporting endpoint',
    'upgrade-insecure-requests': 'Upgrades HTTP to HTTPS',
    'block-all-mixed-content': 'Blocks mixed content',
  };
  return notes[key] || '';
}
function getHSTSNote(key) {
  const notes = {
    'max-age': 'How long to remember HTTPS enforcement (seconds)',
    'includeSubDomains': 'Applies HSTS to all subdomains',
    'preload': 'Submit to browser preload lists',
  };
  return notes[key] || '';
}
function getCacheNote(key) {
  const notes = {
    'no-store': 'Nothing cached anywhere',
    'no-cache': 'Must revalidate before serving from cache',
    'must-revalidate': 'Must revalidate after max-age expires',
    'private': 'Only browser cache, not CDNs',
    'public': 'Can be cached by CDNs',
    'max-age': 'Max age in browser cache (seconds)',
    's-maxage': 'Max age in shared caches (CDN)',
    'immutable': 'Resource will never change',
    'stale-while-revalidate': 'Serve stale while revalidating in background',
  };
  return notes[key] || '';
}

/* ── CORS Proxy Providers ───────────────────────────────────── */
const PROXIES = [
  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

/* ── State ──────────────────────────────────────────────────── */
let currentTab = 'security';
window.__rawHeaders = {};

/* ── Fetch Headers ──────────────────────────────────────────── */
async function fetchHeaders(url) {
  // Try a HEAD request first via proxy
  // We use allorigins to get response headers
  const headersUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const r = await fetch(headersUrl);
  if (!r.ok) throw new Error('Proxy returned ' + r.status);
  const json = await r.json();
  // allorigins returns response_headers as an object
  let headers = {};
  if (json.response_headers) {
    // normalize to lower-case keys
    for (const [k, v] of Object.entries(json.response_headers)) {
      headers[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : v;
    }
  } else {
    // Fallback: try direct fetch (works if CORS is enabled by target)
    const direct = await fetch(url, { method: 'HEAD', mode: 'cors' });
    direct.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
  }
  return headers;
}

/* ── Main Analysis Runner ───────────────────────────────────── */
async function runAnalysis() {
  let url = document.getElementById('urlInput').value.trim();
  if (!url) { showToast('Please enter a URL'); return; }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  document.getElementById('urlInput').value = url;

  // UI: show loading
  hide('scoreBanner'); hide('resultsArea'); hide('errorState');
  show('loadingState');
  document.getElementById('analyzeBtn').disabled = true;

  try {
    const headers = await fetchHeaders(url);
    window.__rawHeaders = headers;
    hide('loadingState');
    renderResults(url, headers);
  } catch (err) {
    hide('loadingState');
    show('errorState');
    document.getElementById('errorMsg').textContent = 'Could not fetch headers: ' + err.message;
  } finally {
    document.getElementById('analyzeBtn').disabled = false;
  }
}

/* ── Render Results ─────────────────────────────────────────── */
function renderResults(url, headers) {
  const results = SECURITY_HEADERS.map(def => {
    const val = headers[def.name.toLowerCase()] || null;
    const check = def.check(val);
    return { def, val, ...check };
  });

  // Score
  const securityHeaders = results.filter(r => r.def.category === 'security');
  const pass = securityHeaders.filter(r => r.status === 'pass').length;
  const warn = securityHeaders.filter(r => r.status === 'warn').length;
  const fail = securityHeaders.filter(r => r.status === 'fail').length;
  const total = securityHeaders.filter(r => r.status !== 'info').length;
  const score = Math.round((pass / total) * 100);

  renderScore(score, url, pass, warn, fail);
  renderSecurityTab(results.filter(r => r.def.category === 'security'));
  renderPerformanceTab(results.filter(r => r.def.category === 'performance'));
  renderInfoTab(headers, url);
  renderRawTab(headers);

  show('scoreBanner');
  show('resultsArea');
  switchTab(currentTab, document.querySelector('.tab.active'));
}

/* ── Score ──────────────────────────────────────────────────── */
function renderScore(score, url, pass, warn, fail) {
  document.getElementById('scoreNumber').textContent = score;
  document.getElementById('passCount').textContent = pass;
  document.getElementById('warnCount').textContent = warn;
  document.getElementById('failCount').textContent = fail;

  const shortUrl = url.replace(/^https?:\/\//, '').split('/')[0];
  document.getElementById('scoreUrl').textContent = shortUrl;

  let grade, color;
  if (score >= 90) { grade = 'A+'; color = 'var(--pass)'; }
  else if (score >= 80) { grade = 'A'; color = 'var(--pass)'; }
  else if (score >= 70) { grade = 'B'; color = '#86efac'; }
  else if (score >= 60) { grade = 'C'; color = 'var(--warn)'; }
  else if (score >= 50) { grade = 'D'; color = '#fb923c'; }
  else { grade = 'F'; color = 'var(--fail)'; }

  const g = document.getElementById('scoreGrade');
  g.textContent = grade;
  g.style.color = color;

  const circle = document.getElementById('scoreCircle');
  const circ = 213.6;
  circle.style.stroke = color;
  circle.style.strokeDashoffset = circ - (circ * score / 100);
  circle.style.transition = 'stroke-dashoffset 1s ease';

  document.querySelector('.score-ring-wrap').style.setProperty('--score-color', color);
}

/* ── Security Tab ───────────────────────────────────────────── */
function renderSecurityTab(results) {
  const el = document.getElementById('tab-security');
  const order = { fail: 0, warn: 1, pass: 2, info: 3 };
  const sorted = [...results].sort((a, b) => order[a.status] - order[b.status]);
  el.innerHTML = sorted.map((r, i) => headerCard(r, i)).join('');
}

function renderPerformanceTab(results) {
  const el = document.getElementById('tab-performance');
  const order = { fail: 0, warn: 1, pass: 2, info: 3 };
  const sorted = [...results].sort((a, b) => order[a.status] - order[b.status]);
  el.innerHTML = sorted.map((r, i) => headerCard(r, i)).join('');
}

function headerCard(r, idx) {
  const { def, val, status, message } = r;
  const icon = { pass: iconCheck(), warn: iconWarn(), fail: iconFail(), info: iconInfo() }[status];
  const label = { pass: 'Pass', warn: 'Warning', fail: 'Missing', info: 'Info' }[status];

  let directives = '';
  if (def.parseDirectives && val) {
    const dirs = def.parseDirectives(val);
    if (dirs.length) {
      directives = `<div class="card-value-label">Directives</div>
        <div class="directives-list">
          ${dirs.map(d => `
            <div class="directive-item">
              <span class="directive-key">${esc(d.key)}</span>
              <span class="directive-val">${esc(d.val)}</span>
              ${d.note ? `<span class="directive-note">— ${esc(d.note)}</span>` : ''}
            </div>
          `).join('')}
        </div>`;
    }
  }

  const mdnLink = def.mdn
    ? `<a href="${def.mdn}" target="_blank" style="color:var(--info);font-size:11px;text-decoration:none;">↗ MDN Docs</a>`
    : '';

  const rec = def.recommendation && status !== 'pass'
    ? `<div class="card-value-label" style="margin-top:12px">Recommendation</div>
       <div class="card-value" style="color:var(--warn)">${esc(def.recommendation)}</div>`
    : '';

  return `
    <div class="header-card ${status}" style="animation-delay:${idx * 40}ms">
      <div class="card-header" onclick="toggleCard(this)">
        <div class="card-status-icon ${status}">${icon}</div>
        <div class="card-name">${esc(def.name)}</div>
        <span class="card-badge ${status}">${label}</span>
        <svg class="card-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div class="card-body">
        <div class="card-desc">${esc(def.description)}</div>
        ${val ? `<div class="card-value-label">Current Value</div><div class="card-value">${esc(val)}</div>` : ''}
        ${directives}
        <div class="card-value-label">Analysis</div>
        <div class="card-recommendation ${status}">${esc(message)}</div>
        ${rec}
        <div style="margin-top:12px">${mdnLink}</div>
      </div>
    </div>`;
}

/* ── Info Tab ───────────────────────────────────────────────── */
function renderInfoTab(headers, url) {
  const el = document.getElementById('tab-info');
  const get = k => headers[k] || '—';

  const infoItems = [
    { label: 'Server', value: get('server'), risk: get('server') !== '—' },
    { label: 'X-Powered-By', value: get('x-powered-by'), risk: get('x-powered-by') !== '—' },
    { label: 'Content-Type', value: get('content-type') },
    { label: 'Content-Length', value: get('content-length') },
    { label: 'Content-Encoding', value: get('content-encoding') },
    { label: 'Transfer-Encoding', value: get('transfer-encoding') },
    { label: 'Connection', value: get('connection') },
    { label: 'Keep-Alive', value: get('keep-alive') },
    { label: 'Etag', value: get('etag') },
    { label: 'Last-Modified', value: get('last-modified') },
    { label: 'Date', value: get('date') },
    { label: 'Alt-Svc', value: get('alt-svc') },
    { label: 'Via', value: get('via') },
    { label: 'CF-Ray', value: get('cf-ray') },
    { label: 'X-Cache', value: get('x-cache') },
  ];

  const totalHeaders = Object.keys(headers).length;

  el.innerHTML = `
    <div class="info-grid" style="margin-bottom:16px">
      <div class="info-card">
        <div class="info-card-label">Total Headers</div>
        <div class="info-card-value">${totalHeaders}</div>
      </div>
      <div class="info-card">
        <div class="info-card-label">Protocol</div>
        <div class="info-card-value">${url.startsWith('https') ? '🔒 HTTPS' : '⚠️ HTTP'}</div>
      </div>
      <div class="info-card">
        <div class="info-card-label">CDN/Proxy</div>
        <div class="info-card-value">${detectCDN(headers)}</div>
      </div>
      <div class="info-card">
        <div class="info-card-label">HTTP/2 or HTTP/3</div>
        <div class="info-card-value">${detectHttp2(headers)}</div>
      </div>
    </div>
    <div class="info-grid">
      ${infoItems.map(item => `
        <div class="info-card">
          <div class="info-card-label">${esc(item.label)}</div>
          <div class="info-card-value ${item.risk ? 'bad' : ''}">${esc(item.value)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function detectCDN(h) {
  if (h['cf-ray'] || h['cf-cache-status']) return 'Cloudflare';
  if (h['x-amz-cf-id'] || h['x-amz-request-id']) return 'AWS CloudFront';
  if (h['x-served-by'] && h['x-served-by'].includes('fastly')) return 'Fastly';
  if (h['x-cache'] && h['x-cache'].includes('Varnish')) return 'Varnish';
  if (h['x-azure-ref']) return 'Azure CDN';
  if (h['x-vercel-id']) return 'Vercel';
  if (h['x-netlify-id'] || (h['server'] && h['server'].includes('Netlify'))) return 'Netlify';
  return '—';
}

function detectHttp2(h) {
  const alt = h['alt-svc'] || '';
  if (alt.includes('h3')) return 'HTTP/3 (h3)';
  if (alt.includes('h2')) return 'HTTP/2 or HTTP/3';
  return '—';
}

/* ── Raw Tab ────────────────────────────────────────────────── */
function renderRawTab(headers) {
  const el = document.getElementById('tab-raw');
  const entries = Object.entries(headers).sort(([a], [b]) => a.localeCompare(b));
  const count = entries.length;

  el.innerHTML = `
    <div class="raw-search-row">
      <input class="raw-search" id="rawSearch" placeholder="Filter headers…" oninput="filterRaw(this.value)">
      <span class="raw-count" id="rawCount">${count} headers</span>
    </div>
    <table class="raw-table" id="rawTable">
      <thead><tr><th>Header</th><th>Value</th></tr></thead>
      <tbody>
        ${entries.map(([k, v]) => `
          <tr data-key="${esc(k.toLowerCase())}">
            <td class="raw-key">${esc(k)}</td>
            <td class="raw-val">${esc(v)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function filterRaw(q) {
  const rows = document.querySelectorAll('#rawTable tbody tr');
  let visible = 0;
  rows.forEach(r => {
    const match = r.dataset.key.includes(q.toLowerCase()) || r.cells[1]?.textContent.toLowerCase().includes(q.toLowerCase());
    r.style.display = match ? '' : 'none';
    if (match) visible++;
  });
  document.getElementById('rawCount').textContent = `${visible} headers`;
}

/* ── Reference Panel ────────────────────────────────────────── */
function renderReferencePanel() {
  const el = document.getElementById('refList');
  el.innerHTML = SECURITY_HEADERS.map(def => `
    <div class="ref-item" data-priority="${def.priority}">
      <div class="ref-item-header">
        <span class="ref-name">${esc(def.name)}</span>
        <span class="ref-priority ${def.priority}">${def.priority}</span>
      </div>
      <div class="ref-desc">${esc(def.description.slice(0, 90))}…</div>
    </div>
  `).join('');
}

function filterRef(filter, btn) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.ref-item').forEach(item => {
    item.style.display = filter === 'all' || item.dataset.priority === filter ? '' : 'none';
  });
}

/* ── Tab Switching ──────────────────────────────────────────── */
function switchTab(tab, btn) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  if (btn) btn.classList.add('active');
  const el = document.getElementById('tab-' + tab);
  if (el) el.style.display = 'block';
}

/* ── Card Toggle ────────────────────────────────────────────── */
function toggleCard(header) {
  const body = header.nextElementSibling;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  header.classList.toggle('open', !isOpen);
}

/* ── URL helpers ────────────────────────────────────────────── */
function setUrl(url) {
  document.getElementById('urlInput').value = url;
  document.getElementById('urlInput').focus();
}

/* ── Report Actions ─────────────────────────────────────────── */
function copyReport() {
  if (!window.__rawHeaders || !Object.keys(window.__rawHeaders).length) return;
  const lines = [`HeaderScan Report — ${new Date().toISOString()}`, `URL: ${document.getElementById('urlInput').value}`, `Score: ${document.getElementById('scoreNumber').textContent} (${document.getElementById('scoreGrade').textContent})`, '', '=== SECURITY ANALYSIS ==='];
  SECURITY_HEADERS.filter(d => d.category === 'security').forEach(def => {
    const val = window.__rawHeaders[def.name.toLowerCase()] || null;
    const check = def.check(val);
    lines.push(`\n[${check.status.toUpperCase()}] ${def.name}`);
    lines.push(`  Value: ${val || '(not present)'}`);
    lines.push(`  ${check.message}`);
  });
  lines.push('\n=== ALL HEADERS ===');
  Object.entries(window.__rawHeaders).forEach(([k, v]) => lines.push(`${k}: ${v}`));
  navigator.clipboard.writeText(lines.join('\n')).then(() => showToast('Report copied to clipboard!'));
}

function downloadReport() {
  if (!window.__rawHeaders || !Object.keys(window.__rawHeaders).length) return;
  const url = document.getElementById('urlInput').value;
  const lines = [
    `# HeaderScan Report`, `Generated: ${new Date().toISOString()}`, `URL: ${url}`,
    `Score: ${document.getElementById('scoreNumber').textContent} (${document.getElementById('scoreGrade').textContent})`,
    '', '## Security Headers Analysis', ''
  ];
  SECURITY_HEADERS.filter(d => d.category === 'security').forEach(def => {
    const val = window.__rawHeaders[def.name.toLowerCase()] || null;
    const check = def.check(val);
    const emoji = { pass: '✅', warn: '⚠️', fail: '❌', info: 'ℹ️' }[check.status];
    lines.push(`### ${emoji} ${def.name}`);
    lines.push(`**Status:** ${check.status.toUpperCase()}`);
    lines.push(`**Value:** \`${val || '(not present)'}\``);
    lines.push(`**Analysis:** ${check.message}`);
    if (def.recommendation && check.status !== 'pass') {
      lines.push(`**Recommendation:** \`${def.recommendation}\``);
    }
    lines.push('');
  });
  lines.push('## All Raw Headers', '');
  Object.entries(window.__rawHeaders).forEach(([k, v]) => lines.push(`- **${k}**: \`${v}\``));

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `headerscan-${Date.now()}.md` });
  a.click(); URL.revokeObjectURL(a.href);
  showToast('Report downloaded!');
}

/* ── UI Utils ───────────────────────────────────────────────── */
function show(id) { document.getElementById(id).style.display = ''; }
function hide(id) { document.getElementById(id).style.display = 'none'; }
function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function iconCheck() { return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`; }
function iconWarn() { return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`; }
function iconFail() { return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`; }
function iconInfo() { return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`; }

/* ── Enter key ──────────────────────────────────────────────── */
document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') runAnalysis();
});

// ── Subtle cursor glow follow on tool cards ───────────────────────────────

function initCursorGlow() {
	const glow = document.createElement("div");
	glow.className = "cursor-glow";
	document.body.appendChild(glow);
	let fadeTimeout;
	document.addEventListener("mousemove", (event) => {
		glow.style.left = `${event.clientX}px`;
		glow.style.top = `${event.clientY}px`;
		glow.style.opacity = "1";
		glow.style.zIndex = "0";
		clearTimeout(fadeTimeout);
		fadeTimeout = setTimeout(() => {
			glow.style.opacity = "0";
		}, 900);
	});
	document.addEventListener("mouseleave", () => {
		glow.style.opacity = "0";
	});
}

/* ── Init ───────────────────────────────────────────────────── */
renderReferencePanel();
initCursorGlow();
