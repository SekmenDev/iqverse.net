'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { normalizeUrl } from '@/lib/utils';
import sharedStyles from '@/styles/shared-tool-styles.module.css';
import CapCaptcha from '@/components/CapCaptcha';

const CONCURRENCY = 5;

type ScanItem = {
  url: string;
  depth?: number;
  sourceUrl?: string;
  tag?: string;
  text?: string;
};

type ResultItem = ScanItem & { status: number; time?: number; error?: string };

type FilterType = 'all' | '2xx' | '3xx' | 'broken';
type SortKey = 'status' | 'url' | 'source' | 'time' | 'depth';
type SortDir = 'asc' | 'desc';

function getStatusBadge(status: number) {
  if (status >= 200 && status < 300) {
    return {
      bg: 'rgba(52, 211, 153, 0.15)',
      color: '#34D399',
      border: '1px solid rgba(52, 211, 153, 0.3)',
      label: String(status),
      urlColor: '#34D399',
    };
  } else if (status >= 300 && status < 400) {
    return {
      bg: 'rgba(56, 189, 248, 0.15)',
      color: '#38BDF8',
      border: '1px solid rgba(56, 189, 248, 0.3)',
      label: String(status),
      urlColor: '#38BDF8',
    };
  } else if (status >= 400 && status < 500) {
    return {
      bg: 'rgba(248, 113, 113, 0.15)',
      color: '#F87171',
      border: '1px solid rgba(248, 113, 113, 0.3)',
      label: String(status),
      urlColor: '#F87171',
    };
  } else if (status >= 500) {
    return {
      bg: 'rgba(239, 68, 68, 0.2)',
      color: '#EF4444',
      border: '1px solid rgba(239, 68, 68, 0.4)',
      label: String(status),
      urlColor: '#EF4444',
    };
  } else {
    return {
      bg: 'rgba(251, 191, 36, 0.15)',
      color: '#FBBF24',
      border: '1px solid rgba(251, 191, 36, 0.3)',
      label: status === 0 ? 'ERR' : String(status),
      urlColor: '#FBBF24',
    };
  }
}

async function fetchUrl(url: string, signal?: AbortSignal): Promise<{ status: number; time: number; html?: string; error?: string } | null | undefined> {
  try {
    const proxyUrl = `/api/check-url?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, { signal, cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      return { status: json.status, time: json.time, html: json.html, error: json.error };
    }
  } catch (e: any) {
    if (e?.name === 'AbortError') return null;
  }
}

export default function LinkRadar() {
  const [url, setUrl] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [checkedCount, setCheckedCount] = useState(0);
  const [opts, setOpts] = useState({ checkExternal: true, checkImages: true, crawlSubpages: true, maxDepth: 2 });
  const abortRef = useRef<AbortController | null>(null);

  // Sorting & Filtering State
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const logLine = useCallback((msg: string) => {
    setLog((s) => [...s, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const extractLinks = useCallback((html: string, base: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const out: ScanItem[] = [];
    const add = (href: string | null, tag: string, text?: string) => {
      if (!href) return;
      if (
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        href.startsWith('data:')
      ) {
        return;
      }
      const u = normalizeUrl(base, href);
      if (u && (u.startsWith('http://') || u.startsWith('https://'))) {
        out.push({ url: u, tag, text: (text || '').trim().slice(0, 60), sourceUrl: base });
      }
    };

    doc.querySelectorAll('a[href]').forEach((el) => add(el.getAttribute('href'), '<a>', el.textContent || (el as HTMLElement).innerText));
    if (opts.checkImages) {
      doc.querySelectorAll('img[src]').forEach((el) => add(el.getAttribute('src'), '<img>', el.getAttribute('alt') || ''));
      doc.querySelectorAll('link[href]').forEach((el) => add(el.getAttribute('href'), '<link>', el.getAttribute('rel') || ''));
      doc.querySelectorAll('script[src]').forEach((el) => add(el.getAttribute('src'), '<script>', ''));
    }
    return out;
  }, [opts.checkImages]);

  const runScan = useCallback(async (root: string) => {
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;
    const queue: ScanItem[] = [{ url: root, depth: 0, sourceUrl: root, tag: '<root>', text: 'Entry Point' }];
    const visited = new Set<string>();
    const pageFetched = new Set<string>();
    let checkedCountLocal = 0;

    let rootOrigin = '';
    try {
      rootOrigin = new URL(root).origin;
    } catch {
      logLine(`Invalid root URL: ${root}`);
      return;
    }

    setResults([]);
    setLog([]);
    setCheckedCount(0);
    setRunning(true);

    logLine(`Starting scan: ${root}`);

    while (queue.length > 0 && !signal.aborted) {
      const batch = queue.splice(0, CONCURRENCY);
      const toCheck = batch.filter((item) => {
        if (visited.has(item.url)) return false;
        visited.add(item.url);
        return true;
      });

      if (toCheck.length === 0) continue;

      const resultsBatch = await Promise.all(
        toCheck.map(async (item) => {
          const r = await fetchUrl(item.url, signal);
          if (!r) return null;
          return { ...item, ...r };
        })
      );

      for (let i = 0; i < resultsBatch.length; i++) {
        const r = resultsBatch[i];
        if (!r || signal.aborted) continue;

        const { html, ...resultItem } = r;
        setResults((s) => [...s, resultItem]);
        setCheckedCount((c) => c + 1);
        checkedCountLocal++;

        const statusText = resultItem.status === 0 ? 'ERR' : String(resultItem.status);
        logLine(`[${statusText}] ${resultItem.url} (${resultItem.time}ms)`);

        const item = toCheck[i];
        let itemOrigin = '';
        try {
          itemOrigin = new URL(item.url).origin;
        } catch {
          continue;
        }

        if (
          opts.crawlSubpages &&
          (item.depth ?? 0) < opts.maxDepth &&
          itemOrigin === rootOrigin &&
          !pageFetched.has(item.url) &&
          resultItem.status >= 200 && resultItem.status < 300
        ) {
          pageFetched.add(item.url);
          let pageHtml = html;
          if (!pageHtml) {
            const fetched = await fetchUrl(item.url, signal);
            pageHtml = fetched?.html;
          }

          if (pageHtml) {
            const subLinks = extractLinks(pageHtml, item.url);
            let addedCount = 0;
            for (const link of subLinks) {
              let linkOrigin = '';
              try {
                linkOrigin = new URL(link.url).origin;
              } catch {
                continue;
              }

              const isExternal = linkOrigin !== rootOrigin;
              if (isExternal && !opts.checkExternal) continue;

              if (!visited.has(link.url)) {
                queue.push({ ...link, depth: (item.depth ?? 0) + 1 });
                addedCount++;
              }
            }
            logLine(`  ↳ crawled ${item.url}, found ${subLinks.length} links (${addedCount} queued)`);
          }
        }
      }
    }

    setRunning(false);
    abortRef.current = null;
    if (signal.aborted) {
      logLine(`Scan stopped by user. ${checkedCountLocal} URLs checked.`);
    } else {
      logLine(`Scan finished. ${checkedCountLocal} URLs checked.`);
    }
  }, [extractLinks, logLine, opts]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleToggle = () => {
    if (running) {
      if (abortRef.current) abortRef.current.abort();
      setRunning(false);
      return;
    }
    let rootUrl = url.trim();
    if (!rootUrl) return;
    if (!rootUrl.startsWith('http')) rootUrl = 'https://' + rootUrl;
    try { new URL(rootUrl); } catch { return; }
    runScan(rootUrl);
  };

  const count2xx = useMemo(() => results.filter((r) => r.status >= 200 && r.status < 300).length, [results]);
  const count3xx = useMemo(() => results.filter((r) => r.status >= 300 && r.status < 400).length, [results]);
  const countBroken = useMemo(() => results.filter((r) => r.status >= 400 || r.status === 0).length, [results]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const renderSortIndicator = (key: SortKey) => {
    if (sortKey !== key) return null;
    return <span style={{ marginLeft: 4, opacity: 0.8 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  const filteredResults = useMemo(() => {
    let list = results;

    if (filterType === '2xx') {
      list = list.filter((r) => r.status >= 200 && r.status < 300);
    } else if (filterType === '3xx') {
      list = list.filter((r) => r.status >= 300 && r.status < 400);
    } else if (filterType === 'broken') {
      list = list.filter((r) => r.status >= 400 || r.status === 0);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.url.toLowerCase().includes(term) ||
          (r.sourceUrl && r.sourceUrl.toLowerCase().includes(term)) ||
          String(r.status).includes(term)
      );
    }

    return [...list].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortKey === 'status') {
        valA = a.status;
        valB = b.status;
      } else if (sortKey === 'url') {
        valA = a.url;
        valB = b.url;
      } else if (sortKey === 'source') {
        valA = a.sourceUrl ?? '';
        valB = b.sourceUrl ?? '';
      } else if (sortKey === 'time') {
        valA = a.time ?? 0;
        valB = b.time ?? 0;
      } else if (sortKey === 'depth') {
        valA = a.depth ?? 0;
        valB = b.depth ?? 0;
      }

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB as string);
        return sortDir === 'asc' ? cmp : -cmp;
      } else {
        const cmp = valA > valB ? 1 : valA < valB ? -1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      }
    });
  }, [results, filterType, searchTerm, sortKey, sortDir]);

  return (
    <div style={{ maxWidth: 1100 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>LinkRadar</div>
        <form
          className={sharedStyles.card}
          onSubmit={(e) => {
            e.preventDefault();
            handleToggle();
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" style={{ flex: 1 }} />
            <button type="submit" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}>{running ? 'Stop' : 'Scan'}</button>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <label htmlFor="check-external" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input id="check-external" type="checkbox" checked={opts.checkExternal} onChange={(e) => setOpts(o => ({...o, checkExternal: e.target.checked}))} />
              Check external links
            </label>
            <label htmlFor="check-images" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input id="check-images" type="checkbox" checked={opts.checkImages} onChange={(e) => setOpts(o => ({...o, checkImages: e.target.checked}))} />
              Check images & assets
            </label>
            <label htmlFor="crawl-subpages" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input id="crawl-subpages" type="checkbox" checked={opts.crawlSubpages} onChange={(e) => setOpts(o => ({...o, crawlSubpages: e.target.checked}))} />
              Crawl sub-pages
            </label>
            <label htmlFor="max-depth" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Max depth:
              <input id="max-depth" type="number" value={opts.maxDepth} min={1} max={6} onChange={(e) => setOpts(o=>({...o, maxDepth: Number(e.target.value)}))} style={{ width: 60, marginLeft: 6 }} />
            </label>
          </div>

          <div style={{ marginTop: 14 }}>
            <CapCaptcha />
          </div>
        </form>
      </section>

      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>Live Output</div>
        <div className={`${sharedStyles.card} ${sharedStyles.customScrollbar}`} style={{ maxHeight: 260, overflowY: 'auto' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
            {log.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>Console output will appear here during scan...</div> : log.map((l, i) => <div key={i + "d"}>{l}</div>)}
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 12, flexDirection: 'column' }}>
          <div className={sharedStyles.card}>
            <div className={sharedStyles.sectionLabel}>Stats & Filters</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              <button
                type="button"
                onClick={() => setFilterType('all')}
                style={{
                  background: filterType === 'all' ? 'var(--card-hover)' : 'var(--surface)',
                  border: filterType === 'all' ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{results.length}</div>
                <div style={{ fontSize: 12, color: filterType === 'all' ? 'var(--accent)' : 'var(--text-muted)' }}>Total URLs</div>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('2xx')}
                style={{
                  background: filterType === '2xx' ? 'rgba(52, 211, 153, 0.1)' : 'var(--surface)',
                  border: filterType === '2xx' ? '1px solid #34D399' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 700, color: '#34D399' }}>{count2xx}</div>
                <div style={{ fontSize: 12, color: filterType === '2xx' ? '#34D399' : 'var(--text-muted)' }}>OK (2xx)</div>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('3xx')}
                style={{
                  background: filterType === '3xx' ? 'rgba(56, 189, 248, 0.1)' : 'var(--surface)',
                  border: filterType === '3xx' ? '1px solid #38BDF8' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 700, color: '#38BDF8' }}>{count3xx}</div>
                <div style={{ fontSize: 12, color: filterType === '3xx' ? '#38BDF8' : 'var(--text-muted)' }}>Redirects (3xx)</div>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('broken')}
                style={{
                  background: filterType === 'broken' ? 'rgba(248, 113, 113, 0.1)' : 'var(--surface)',
                  border: filterType === 'broken' ? '1px solid #F87171' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 700, color: '#F87171' }}>{countBroken}</div>
                <div style={{ fontSize: 12, color: filterType === 'broken' ? '#F87171' : 'var(--text-muted)' }}>Broken (4xx/ERR)</div>
              </button>
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
              Checked: {checkedCount} {running && <span style={{ color: 'var(--accent)', marginLeft: 8 }}>Scanning in progress...</span>}
            </div>
          </div>

          <div className={sharedStyles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div className={sharedStyles.sectionLabel} style={{ margin: 0 }}>
                Results ({filteredResults.length} of {results.length})
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search URLs or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '6px 12px', fontSize: 13, minWidth: 220 }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: 12, padding: '4px 8px' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className={sharedStyles.customScrollbar} style={{ maxHeight: 400, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', userSelect: 'none' }}>
                    <th onClick={() => handleSort('status')} style={{ textAlign: 'left', padding: '8px 12px', cursor: 'pointer' }}>
                      Status{renderSortIndicator('status')}
                    </th>
                    <th onClick={() => handleSort('url')} style={{ textAlign: 'left', padding: '8px 12px', cursor: 'pointer' }}>
                      URL{renderSortIndicator('url')}
                    </th>
                    <th onClick={() => handleSort('source')} style={{ textAlign: 'left', padding: '8px 12px', cursor: 'pointer' }}>
                      Source{renderSortIndicator('source')}
                    </th>
                    <th onClick={() => handleSort('time')} style={{ textAlign: 'left', padding: '8px 12px', cursor: 'pointer' }}>
                      Time{renderSortIndicator('time')}
                    </th>
                    <th onClick={() => handleSort('depth')} style={{ textAlign: 'left', padding: '8px 12px', cursor: 'pointer' }}>
                      Depth{renderSortIndicator('depth')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {results.length === 0 ? 'No scan results yet. Enter a URL above and click Scan.' : 'No results matching your filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((r, i) => {
                      const badge = getStatusBadge(r.status);
                      return (
                        <tr key={i + "t"} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontFamily: 'monospace',
                                fontSize: 12,
                                fontWeight: 600,
                                background: badge.bg,
                                color: badge.color,
                                border: badge.border,
                              }}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <a href={r.url} target="_blank" rel="noreferrer" style={{ color: badge.urlColor, textDecoration: 'none' }} title={r.url}>
                              {r.url}
                            </a>
                          </td>
                          <td style={{ padding: '8px 12px', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }} title={r.sourceUrl}>
                            {r.sourceUrl ? (
                              <a href={r.sourceUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                                {r.sourceUrl}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            {r.time != null ? `${r.time}ms` : '-'}
                          </td>
                          <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            {r.depth ?? '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



