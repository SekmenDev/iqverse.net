'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/header-scan.module.css';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

type TabKey = 'security' | 'performance' | 'info' | 'raw';
type Priority = 'critical' | 'recommended' | 'optional';
type Status = 'pass' | 'warn' | 'fail' | 'info';

type AssessmentCategory = 'security' | 'performance' | 'info';

type Assessment = {
  name: string;
  short: string;
  priority: Priority;
  category: AssessmentCategory;
  description: string;
  recommendation: string;
  value: string;
  status: Status;
  message: string;
  mdn?: string;
};

type HeaderDefinition = {
  name: string;
  short: string;
  priority: Priority;
  category: AssessmentCategory;
  description: string;
  recommendation: string;
  mdn?: string;
  check: (value: string) => { status: Status; message: string };
};

type HeaderResult = {
  url: string;
  status: number;
  headers: Record<string, string>;
  analysis: Assessment[];
};

const SAMPLE_URLS = ['https://example.com', 'https://github.com', 'https://google.com'];

const HEADER_DEFINITIONS: HeaderDefinition[] = [
  {
    name: 'Content-Security-Policy',
    short: 'CSP',
    priority: 'critical',
    category: 'security',
    description: 'Controls which resources the browser may load.',
    recommendation: "Add: Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy',
    check: (value: string) => {
      if (!value) return { status: 'fail' as const, message: 'CSP is missing.' };
      const warnings: string[] = [];
      if (/unsafe-inline/i.test(value)) warnings.push("'unsafe-inline' weakens CSP.");
      if (/unsafe-eval/i.test(value)) warnings.push("'unsafe-eval' is risky.");
      if (!/default-src/i.test(value) && !/script-src/i.test(value)) warnings.push('No default or script directive found.');
      return warnings.length
        ? { status: 'warn' as const, message: warnings.join(' ') }
        : { status: 'pass' as const, message: 'CSP is present and looks reasonable.' };
    },
  },
  {
    name: 'Strict-Transport-Security',
    short: 'HSTS',
    priority: 'critical',
    category: 'security',
    description: 'Forces HTTPS for all future requests.',
    recommendation: 'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security',
    check: (value: string) => {
      if (!value) return { status: 'fail' as const, message: 'HSTS is not configured.' };
      const maxAge = value.match(/max-age=(\d+)/i);
      if (!maxAge) return { status: 'warn' as const, message: 'max-age is missing.' };
      const age = Number(maxAge[1]);
      if (age < 31536000) return { status: 'warn' as const, message: `max-age is only ${age}s.` };
      return { status: 'pass' as const, message: 'HSTS is configured with a strong max-age.' };
    },
  },
  {
    name: 'X-Content-Type-Options',
    short: 'XCTO',
    priority: 'critical',
    category: 'security',
    description: 'Prevents browsers from MIME-sniffing files.',
    recommendation: 'Add: X-Content-Type-Options: nosniff',
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options',
    check: (value: string) => {
      if (!value) return { status: 'fail' as const, message: 'This header is missing.' };
      if (value.trim().toLowerCase() !== 'nosniff') return { status: 'warn' as const, message: 'Use nosniff for the safest behavior.' };
      return { status: 'pass' as const, message: 'Correctly set to nosniff.' };
    },
  },
  {
    name: 'Referrer-Policy',
    short: 'RP',
    priority: 'recommended',
    category: 'security',
    description: 'Controls how much referrer data is shared.',
    recommendation: 'Add: Referrer-Policy: strict-origin-when-cross-origin',
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy',
    check: (value: string) => {
      if (!value) return { status: 'warn' as const, message: 'Referrer leakage may occur by default.' };
      const good = ['no-referrer', 'no-referrer-when-downgrade', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin'];
      const normalized = value.trim().toLowerCase();
      if (good.includes(normalized)) return { status: 'pass' as const, message: `Referrer policy is set to ${normalized}.` };
      return { status: 'warn' as const, message: 'Review this policy for privacy and security.' };
    },
  },
  {
    name: 'Permissions-Policy',
    short: 'PP',
    priority: 'recommended',
    category: 'security',
    description: 'Restricts access to browser features such as camera and microphone.',
    recommendation: 'Add: Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy',
    check: (value: string) => {
      if (!value) return { status: 'warn' as const, message: 'Browser features may be unrestricted.' };
      return { status: 'pass' as const, message: 'Permissions policy is present.' };
    },
  },
  {
    name: 'Cache-Control',
    short: 'CC',
    priority: 'recommended',
    category: 'performance',
    description: 'Controls browser and CDN caching behavior.',
    recommendation: 'For static assets use public, max-age=31536000, immutable. For HTML use no-cache, no-store, must-revalidate.',
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control',
    check: (value: string) => {
      if (!value) return { status: 'warn' as const, message: 'Caching behavior is not defined.' };
      if (value.includes('no-store')) return { status: 'pass' as const, message: 'No-store is configured for sensitive content.' };
      if (value.includes('max-age') || value.includes('s-maxage')) return { status: 'pass' as const, message: 'A caching policy is present.' };
      return { status: 'info' as const, message: 'Review the cache directives for your use case.' };
    },
  },
  {
    name: 'Content-Type',
    short: 'CT',
    priority: 'critical',
    category: 'performance',
    description: 'Signals the MIME type of the response.',
    recommendation: 'Set: Content-Type: text/html; charset=utf-8',
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type',
    check: (value: string) => {
      if (!value) return { status: 'fail' as const, message: 'Content-Type is missing.' };
      if (!value.includes('charset') && value.includes('text/html')) return { status: 'warn' as const, message: 'Add charset=utf-8 for HTML responses.' };
      return { status: 'pass' as const, message: `Content-Type is set to ${value}.` };
    },
  },
  {
    name: 'Server',
    short: 'SRV',
    priority: 'recommended',
    category: 'info',
    description: 'Reveals server software and version information.',
    recommendation: 'Remove or obfuscate the Server header when possible.',
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server',
    check: (value: string) => {
      if (!value) return { status: 'pass' as const, message: 'No Server header was exposed.' };
      return { status: 'warn' as const, message: `The Server header reveals ${value}.` };
    },
  },
  {
    name: 'Set-Cookie',
    short: 'SCK',
    priority: 'critical',
    category: 'security',
    description: 'Protects cookies from being accessed or sent insecurely.',
    recommendation: 'Add: HttpOnly; Secure; SameSite=Strict to session cookies.',
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie',
    check: (value: string) => {
      if (!value) return { status: 'info' as const, message: 'No Set-Cookie header was returned.' };
      const issues: string[] = [];
      if (!/HttpOnly/i.test(value)) issues.push('missing HttpOnly');
      if (!/Secure/i.test(value)) issues.push('missing Secure');
      if (!/SameSite/i.test(value)) issues.push('missing SameSite');
      return issues.length
        ? { status: 'warn' as const, message: `Cookie flags are incomplete: ${issues.join(', ')}.` }
        : { status: 'pass' as const, message: 'Cookie flags look secure.' };
    },
  },
];

function normalizeHeaderName(name: string) {
  return name.toLowerCase();
}

function getHeaderValue(headers: Record<string, string>, headerName: string) {
  const match = Object.entries(headers).find(([key]) => normalizeHeaderName(key) === normalizeHeaderName(headerName));
  return match?.[1] ?? '';
}

function getStatusColor(status: Status) {
  switch (status) {
    case 'pass':
      return '#27ae60';
    case 'warn':
      return '#f0ad4e';
    case 'fail':
      return '#e74c3c';
    default:
      return '#4f7cff';
  }
}

async function fetchHeaders(url: string) {
  const apiUrl = `https://api.hackertarget.com/httpheaders/?q=${encodeURIComponent(url)}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`Header lookup failed with status ${response.status}.`);
  }

  const text = await response.text();
  const headers: Record<string, string> = {};
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim() || line.startsWith('HTTP/')) continue;

    const separatorIndex = line.indexOf(':');
    if (separatorIndex > -1) {
      const key = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line.slice(separatorIndex + 1).trim();
      headers[key] = value;
    }
  }

  return headers;
}

export default function HeaderScan() {
  const [input, setInput] = useState('https://example.com');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState<HeaderResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('security');
  const [activeFilter, setActiveFilter] = useState<'all' | Priority>('all');

  const runAnalysis = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Enter a URL to inspect.');
      return;
    }

    let target: URL;
    try {
      target = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    } catch {
      setError('That does not look like a valid URL.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const headers = await fetchHeaders(target.toString());

      const analysis: Assessment[] = HEADER_DEFINITIONS.map((definition) => {
        const value = getHeaderValue(headers, definition.name);
        const check = definition.check(value);
        return {
          ...definition,
          value: value || 'Not set',
          status: check.status,
          message: check.message,
        };
      });

      setResult({
        url: target.toString(),
        status: 200,
        headers,
        analysis,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze the URL.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initAnalysis = async () => {
      await Promise.resolve();
      if (isMounted) {
        void runAnalysis('https://example.com');
      }
    };
    initAnalysis();
    return () => {
      isMounted = false;
    };
  }, []);

  const score = useMemo(() => {
    if (!result) return 0;
    const scoreValues: Record<Status, number> = { pass: 100, warn: 65, fail: 25, info: 80 };
    const total = result.analysis.reduce((sum, item) => sum + scoreValues[item.status], 0);
    return Math.round(total / result.analysis.length);
  }, [result]);

  const grade = useMemo(() => {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  }, [score]);

  const counts = useMemo(() => {
    if (!result) return { pass: 0, warn: 0, fail: 0, info: 0 };
    return result.analysis.reduce(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      { pass: 0, warn: 0, fail: 0, info: 0 }
    );
  }, [result]);

  const filteredReference = useMemo(() => {
    return HEADER_DEFINITIONS.filter((item) => activeFilter === 'all' || item.priority === activeFilter);
  }, [activeFilter]);

  const copySummary = async () => {
    if (!result) return;
    const text = [
      `HeaderScan report for ${result.url}`,
      `Status: ${result.status}`,
      `Score: ${score}/100 (${grade})`,
      ...result.analysis.map((item) => `${item.name}: ${item.status.toUpperCase()} - ${item.message}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.alert('Clipboard access is unavailable in this browser.');
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'headers-report.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <section className={styles.heroCard}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>HTTP HEADER ANALYZER</p>
          <h2>Inspect response headers for security, performance and privacy best practices.</h2>
          <p>Paste any URL and review a fast report with actionable recommendations.</p>
        </div>

        <div className={styles.inputPanel}>
          <label className={sharedStyles.fieldLabel} htmlFor="headers-url">
            URL to analyze
          </label>
          <div className={styles.inputRow}>
            <input
              id="headers-url"
              className={styles.input}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="https://example.com"
              spellCheck={false}
            />
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={() => void runAnalysis(input)}>
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>
          <div className={styles.quickLinks}>
            {SAMPLE_URLS.map((sample) => (
              <button type="button" key={sample} className={styles.chip} onClick={() => setInput(sample)}>
                {sample}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <section className={styles.errorCard}>
          <strong>Unable to analyze this URL.</strong>
          <p>{error}</p>
        </section>
      )}

      {result && !error && (
        <>
          <section className={styles.scoreCard}>
            <div className={styles.scoreRingWrap}>
              <svg viewBox="0 0 120 120" className={styles.scoreRing}>
                <circle cx="60" cy="60" r="48" className={styles.scoreRingBase} />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  className={styles.scoreRingValue}
                  style={{ strokeDashoffset: 301 - (301 * score) / 100, stroke: getStatusColor(score >= 70 ? 'pass' : score >= 50 ? 'warn' : 'fail') }}
                />
              </svg>
              <div className={styles.scoreNumber}>{score}</div>
            </div>
            <div className={styles.scoreContent}>
              <div className={styles.scoreHeadline}>Grade {grade}</div>
              <div className={styles.scoreUrl}>{result.url}</div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryItem}>✓ {counts.pass} passed</span>
                <span className={styles.summaryItem}>⚠ {counts.warn} warnings</span>
                <span className={styles.summaryItem}>✕ {counts.fail} issues</span>
                <span className={styles.summaryItem}>ℹ {counts.info} info</span>
              </div>
              <div className={styles.actionsRow}>
                <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={copySummary}>
                  Copy report
                </button>
                <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={downloadReport}>
                  Download JSON
                </button>
              </div>
            </div>
          </section>

          <div className={styles.contentGrid}>
            <section className={styles.resultsPanel}>
              <div className={styles.tabRow}>
                {(['security', 'performance', 'info', 'raw'] as TabKey[]).map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    className={`${styles.tabButton} ${activeTab === tab ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'raw' ? 'Raw headers' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === 'raw' ? (
                <pre className={styles.rawOutput}>{JSON.stringify(result.headers, null, 2)}</pre>
              ) : (
                <div className={styles.resultList}>
                  {result.analysis
                    .filter((item) => item.category === activeTab)
                    .map((item) => (
                      <article key={item.name} className={styles.resultCard}>
                        <div className={styles.resultCardHeader}>
                          <div>
                            <strong>{item.name}</strong>
                            <p>{item.description}</p>
                          </div>
                          <span className={styles.badge} style={{ borderColor: getStatusColor(item.status), color: getStatusColor(item.status) }}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <div className={styles.resultMessage}>{item.message}</div>
                        <div className={styles.resultMeta}>Value: {item.value}</div>
                        <div className={styles.resultMeta}>Recommendation: {item.recommendation}</div>
                      </article>
                    ))}
                </div>
              )}
            </section>

            <aside className={styles.referencePanel}>
              <h3>Header reference</h3>
              <div className={styles.filterRow}>
                {(['all', 'critical', 'recommended', 'optional'] as const).map((filter) => (
                  <button
                    type="button"
                    key={filter}
                    className={`${styles.filterChip} ${activeFilter === filter ? styles.filterChipActive : ''}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              <div className={styles.referenceList}>
                {filteredReference.map((item) => (
                  <div key={item.name} className={styles.referenceItem}>
                    <div className={styles.referenceTitleRow}>
                      <strong>{item.name}</strong>
                      <span className={styles.referenceBadge}>{item.short}</span>
                    </div>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </>
      )}

      {loading && !result && (
        <section className={styles.loadingCard}>
          <div className={styles.spinner} />
          <p>Fetching headers and evaluating the response…</p>
        </section>
      )}
    </div>
  );
}
