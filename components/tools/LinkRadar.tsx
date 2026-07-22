'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizeUrl } from '@/lib/utils';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

const CONCURRENCY = 5;

type ScanItem = {
  url: string;
  depth?: number;
  sourceUrl?: string;
  tag?: string;
  text?: string;
};

type ResultItem = ScanItem & { status: number; time?: number; error?: string };

async function checkUrl(url: string, signal?: AbortSignal) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { method: 'HEAD', mode: 'cors', redirect: 'follow', signal, cache: 'no-store' });
    return { status: res.status, time: Date.now() - t0 };
  } catch (e: any) {
    if (e?.name === 'AbortError') return null;
    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors', redirect: 'follow', signal, cache: 'no-store' });
      return { status: res.status, time: Date.now() - t0 };
    } catch (e2: any) {
      if (e2?.name === 'AbortError') return null;
      return { status: 0, time: Date.now() - t0, error: e2?.message };
    }
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

  const logLine = useCallback((msg: string) => {
    setLog((s) => [...s, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const extractLinks = useCallback((html: string, base: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const out: ScanItem[] = [];
    const add = (href: string | null, tag: string, text?: string) => {
      if (!href) return;
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

  const processBatch = useCallback(async (items: ScanItem[], signal?: AbortSignal) => {
    return Promise.all(
      items.map(async (item) => {
        const r = await checkUrl(item.url, signal);
        if (!r) return null;
        return { ...item, ...r } as ResultItem;
      })
    );
  }, []);

  const runScan = useCallback(async (root: string) => {
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;
    const queue: ScanItem[] = [{ url: root, depth: 0, sourceUrl: root, tag: '<root>', text: 'Entry Point' }];
    const visited = new Set<string>();
    const pageFetched = new Set<string>();
    let checkedCountLocal = 0;

    setResults([]);
    setLog([]);
    setCheckedCount(0);
    setRunning(true);

    logLine(`Starting scan: ${root}`);

    while (queue.length > 0 && running === false ? false : true) {
      if (signal.aborted) break;
      const batch = queue.splice(0, CONCURRENCY);
      const toCheck = batch.filter((item) => {
        if (visited.has(item.url)) return false;
        visited.add(item.url);
        return true;
      });
      if (toCheck.length === 0) continue;

      const resultsBatch = await processBatch(toCheck, signal);
      for (let i = 0; i < resultsBatch.length; i++) {
        const r = resultsBatch[i];
        if (!r) continue;
        setResults((s) => [...s, r]);
        setCheckedCount((c) => c + 1);
        checkedCountLocal++;
        const statusText = r.status === 0 ? 'ERR' : String(r.status);
        logLine(`[${statusText}] ${r.url} (${r.time}ms)`);

        const item = toCheck[i];
        if (
          opts.crawlSubpages &&
          (item.depth ?? 0) < opts.maxDepth &&
          new URL(root).origin === new URL(item.url).origin &&
          !pageFetched.has(item.url) &&
          r.status >= 200 && r.status < 300
        ) {
          pageFetched.add(item.url);
          try {
            const res = await fetch(item.url, { mode: 'cors', cache: 'no-store', signal });
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('text/html')) {
              const html = await res.text();
              const subLinks = extractLinks(html, item.url);
              for (const link of subLinks) {
                if (!visited.has(link.url)) queue.push({ ...link, depth: (item.depth ?? 0) + 1 });
              }
              logLine(`  ↳ crawled ${item.url}, found ${subLinks.length} links`);
            }
          } catch (e: any) {
            if (e?.name !== 'AbortError') logLine(`  ↳ crawl failed: ${e?.message}`);
          }
        }
      }
    }

    setRunning(false);
    abortRef.current = null;
    logLine(`Scan finished. ${checkedCountLocal} URLs checked.`);
  }, [extractLinks, logLine, opts, processBatch, running]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleToggle = () => {
    if (running) {
      if (abortRef.current) abortRef.current.abort();
      setRunning(false);
      logLine('Scan stopped by user.');
      return;
    }
    let rootUrl = url.trim();
    if (!rootUrl) return;
    if (!rootUrl.startsWith('http')) rootUrl = 'https://' + rootUrl;
    try { new URL(rootUrl); } catch { return; }
    runScan(rootUrl);
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>LinkRadar</div>
        <div className={sharedStyles.card}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" style={{ flex: 1 }} />
            <button className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={handleToggle}>{running ? 'Stop' : 'Scan'}</button>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={opts.checkExternal} onChange={(e) => setOpts(o => ({...o, checkExternal: e.target.checked}))} /> Check external links</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={opts.checkImages} onChange={(e) => setOpts(o => ({...o, checkImages: e.target.checked}))} /> Check images & assets</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={opts.crawlSubpages} onChange={(e) => setOpts(o => ({...o, crawlSubpages: e.target.checked}))} /> Crawl sub-pages</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Max depth: <input type="number" value={opts.maxDepth} min={1} max={6} onChange={(e) => setOpts(o=>({...o, maxDepth: Number(e.target.value)}))} style={{ width: 60, marginLeft: 6 }} /></label>
          </div>
        </div>
      </section>

      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>Live Output</div>
        <div className={sharedStyles.card} style={{ maxHeight: 300, overflow: 'auto' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
            {log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
          <div className={sharedStyles.card} style={{ flex: 1 }}>
            <div className={sharedStyles.sectionLabel}>Stats</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{results.length}</div>
                <div>Total URLs</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{results.filter(r=>r.status>=200 && r.status<300).length}</div>
                <div>OK (2xx)</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{results.filter(r=>r.status>=400 || r.status===0).length}</div>
                <div>Broken</div>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>Checked: {checkedCount}</div>
          </div>

          <div className={sharedStyles.card} style={{ flex: 2 }}>
            <div className={sharedStyles.sectionLabel}>Results</div>
            <div style={{ maxHeight: 300, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Status</th>
                    <th style={{ textAlign: 'left' }}>URL</th>
                    <th style={{ textAlign: 'left' }}>Source</th>
                    <th style={{ textAlign: 'left' }}>Time</th>
                    <th style={{ textAlign: 'left' }}>Depth</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td>{r.status}</td>
                      <td style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><a href={r.url} target="_blank" rel="noreferrer">{r.url}</a></td>
                      <td>{r.sourceUrl}</td>
                      <td>{r.time}ms</td>
                      <td>{r.depth ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
