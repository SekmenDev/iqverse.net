'use client';

import { useState, useEffect, useRef } from 'react';
import { timeAgo, escapeHtml, normalizeDomain, formatTTL } from '@/lib/utils';
import styles from '@/styles/dnslookup.module.css';

type DNSRecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME' | 'SOA' | 'SRV' | 'PTR' | 'CAA' | 'DS' | 'DNSKEY' | 'ALL';

type DNSResult = {
  domain: string;
  types: string[];
  elapsed: number;
  data: Record<string, any>;
};

type HistoryItem = {
  domain: string;
  type: DNSRecordType;
  ok: boolean;
  ts: number;
};

interface RecordColumn {
  label: string;
  cls?: string;
  render: (ans: any) => string;
}

const TYPE_MAP: Record<string, number> = {
  A: 1, NS: 2, CNAME: 5, SOA: 6, PTR: 12, MX: 15,
  TXT: 16, AAAA: 28, SRV: 33, DS: 43, DNSKEY: 48, CAA: 257
};

const ALL_TYPES: DNSRecordType[] = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'SRV', 'PTR', 'CAA', 'DS', 'DNSKEY'];

const RCODE_NAMES: Record<number, string> = {
  0: 'NOERROR', 1: 'FORMERR', 2: 'SERVFAIL',
  3: 'NXDOMAIN', 4: 'NOTIMP', 5: 'REFUSED'
};

const PRESET_DOMAINS = ['google.com', 'cloudflare.com', 'github.com', 'amazon.com', 'netflix.com'];


const downloadCSV = (results: DNSResult, showToast: (msg: string) => void) => {
  const rows: (string | number)[][] = [['Type', 'Name', 'TTL (s)', 'Data']];
  Object.entries(results.data || {}).forEach(([type, res]) => {
    if (res.Answer) {
      res.Answer.forEach((ans: any) => {
        rows.push([type, ans.name, ans.TTL, `"${(ans.data || '').replace(/"/g, '""')}"`]);
      });
    }
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `dns-${results.domain}-${Date.now()}.csv`;
  a.click();
  showToast('CSV downloaded!');
};

export default function DNSLookup() {
  const [domainInput, setDomainInput] = useState('');
  const [selectedType, setSelectedType] = useState<DNSRecordType>('ALL');
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'results'>('idle');
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastResults, setLastResults] = useState<DNSResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [dnssecToggle, setDnssecToggle] = useState(false);
  const [cdToggle, setCdToggle] = useState(false);
  const [ednsToggle, setEdnsToggle] = useState(true);

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const presetRowRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dns-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Promise.resolve().then(() => setHistory(parsed));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }

    // Check URL params
    const params = new URLSearchParams(window.location.search);
    const domain = params.get('domain');
    const type = params.get('type');
    if (domain) {
      Promise.resolve().then(() => {
        setDomainInput(domain);
        if (type && ALL_TYPES.includes(type as DNSRecordType)) {
          setSelectedType(type as DNSRecordType);
        }
      });
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    const trimmed = newHistory.slice(0, 20);
    setHistory(trimmed);
    localStorage.setItem('dns-history', JSON.stringify(trimmed));
  };

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => setToast(''), 2200);
  };

  const typeNumberToName = (num: number): string => {
    const n = parseInt(String(num));
    return Object.entries(TYPE_MAP).find(([, v]) => v === n)?.[0] || String(num);
  };

  const parseMXPriority = (data: string): string => {
    return (data || '').split(' ')[0] || '';
  };

  const parseMXHost = (data: string): string => {
    const parts = (data || '').split(' ');
    return parts.slice(1).join(' ') || '';
  };

  const parseSRVField = (data: string, idx: number): string => {
    return ((data || '').split(' ')[idx] || '');
  };

  const parseCAAField = (data: string, idx: number): string => {
    return ((data || '').split(' ')[idx] || '');
  };

  const formatSOA = (data: string): string => {
    if (!data) return '—';
    const [mname, rname, serial, refresh, retry, expire, minimum] = (data || '').split(' ');
    return `
      <span class="${styles.tag}">MNAME</span>${escapeHtml(mname || '')}
      <br/><span class="${styles.tag}">RNAME</span>${escapeHtml(rname || '')}
      <br/><span class="${styles.tag}">serial</span>${escapeHtml(serial || '')}
      <br/><span class="${styles.tag}">refresh</span>${formatTTL(parseInt(refresh) || 0)}
      <br/><span class="${styles.tag}">retry</span>${formatTTL(parseInt(retry) || 0)}
      <br/><span class="${styles.tag}">expire</span>${formatTTL(parseInt(expire) || 0)}
      <br/><span class="${styles.tag}">min-ttl</span>${formatTTL(parseInt(minimum) || 0)}
    `.trim();
  };

  const formatTXT = (data: string): string => {
    if (!data) return '—';
    const clean = data.replace(/^"|"$/g, '').replace(/""/g, '');
    if (clean.startsWith('v=spf1')) return `<span class="${styles.tag}">SPF</span>${escapeHtml(clean)}`;
    if (clean.startsWith('v=DMARC1')) return `<span class="${styles.tag}">DMARC</span>${escapeHtml(clean)}`;
    if (clean.startsWith('v=DKIM1')) return `<span class="${styles.tag}">DKIM</span>${escapeHtml(clean)}`;
    if (clean.startsWith('google-site-verification')) return `<span class="${styles.tag}">Google</span>${escapeHtml(clean)}`;
    if (clean.startsWith('MS=')) return `<span class="${styles.tag}">Microsoft</span>${escapeHtml(clean)}`;
    return escapeHtml(clean);
  };

  const formatData = (ans: any): string => {
    const type = typeNumberToName(ans.type);
    switch (type) {
      case 'TXT': return formatTXT(ans.data);
      case 'SOA': return formatSOA(ans.data);
      case 'MX': return `<span class="${styles.tag}">pri:${parseMXPriority(ans.data)}</span>${escapeHtml(parseMXHost(ans.data))}`;
      default: return escapeHtml(ans.data || '');
    }
  };

  const getColumns = (type: string): RecordColumn[] => {
    const base: RecordColumn[] = [
      { label: 'Name', cls: styles.tdName, render: (a) => escapeHtml(a.name || '') },
      { label: 'TTL', cls: styles.tdTtl, render: (a) => formatTTL(a.TTL) }
    ];

    switch (type) {
      case 'MX':
        return [...base,
          { label: 'Priority', render: (a) => escapeHtml(parseMXPriority(a.data)) },
          { label: 'Mail Server', cls: styles.tdData, render: (a) => escapeHtml(parseMXHost(a.data)) }
        ];
      case 'SOA':
        return [...base, { label: 'Value', cls: styles.tdData, render: (a) => formatSOA(a.data) }];
      case 'SRV':
        return [...base,
          { label: 'Priority', render: (a) => escapeHtml(parseSRVField(a.data, 0)) },
          { label: 'Weight', render: (a) => escapeHtml(parseSRVField(a.data, 1)) },
          { label: 'Port', render: (a) => escapeHtml(parseSRVField(a.data, 2)) },
          { label: 'Target', cls: styles.tdData, render: (a) => escapeHtml(parseSRVField(a.data, 3)) }
        ];
      case 'TXT':
        return [...base, { label: 'Text', cls: styles.tdData, render: (a) => formatTXT(a.data) }];
      case 'CAA':
        return [...base,
          { label: 'Flags', render: (a) => escapeHtml(parseCAAField(a.data, 0)) },
          { label: 'Tag', render: (a) => escapeHtml(parseCAAField(a.data, 1)) },
          { label: 'Value', cls: styles.tdData, render: (a) => escapeHtml(parseCAAField(a.data, 2)) }
        ];
      default:
        return [...base, { label: 'Value', cls: styles.tdData, render: (a) => escapeHtml(a.data || '') }];
    }
  };

  const queryTypes = async (domain: string, types: DNSRecordType[]): Promise<Record<string, any>> => {
    const results: Record<string, any> = {};

    const fetchers = types.map(async (type) => {
      const params = new URLSearchParams({ name: domain, type });
      if (dnssecToggle) params.set('do', '1');
      if (cdToggle) params.set('cd', '1');
      if (!ednsToggle) params.set('edns_client_subnet', '0.0.0.0/0');

      const url = `https://dns.google/resolve?${params}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} querying ${type}`);
      const json = await res.json();
      results[type] = json;
    });

    await Promise.allSettled(fetchers).then(settled => {
      settled.forEach((s, i) => {
        if (s.status === 'rejected') {
          results[types[i]] = { Status: -1, _error: (s.reason as Error)?.message };
        }
      });
    });

    return results;
  };

  const countAllRecords = (data: Record<string, any>): number => {
    return Object.values(data).reduce((sum, d) => sum + (d.Answer?.length || 0), 0);
  };



  const buildRawText = (results: DNSResult): string => {
    const lines: string[] = [];
    Object.entries(results.data || {}).forEach(([type, res]) => {
      if (res.Answer && res.Answer.length > 0) {
        res.Answer.forEach((ans: any) => {
          const ttl = formatTTL(ans.TTL);
          lines.push(`${ans.name}\t${ttl}\tIN\t${type}\t${ans.data}`);
        });
      }
    });
    return lines.join('\n');
  };



  const copyText = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  };

  const runLookup = async () => {
    const raw = domainInput.trim();
    if (!raw) {
      showToast('Please enter a domain name.');
      return;
    }

    const domain = normalizeDomain(raw);
    setDomainInput(domain);
    setState('loading');

    // eslint-disable-next-line react-hooks/purity
    const startMs = performance.now();
    const types = selectedType === 'ALL' ? ALL_TYPES : [selectedType];

    try {
      const allData = await queryTypes(domain, types);
      // eslint-disable-next-line react-hooks/purity
      const elapsed = Math.round(performance.now() - startMs);

      const results: DNSResult = { domain, types: Object.keys(allData), elapsed, data: allData };
      setLastResults(results);
      setState('results');
      setActiveTab('ALL');

      // eslint-disable-next-line react-hooks/purity
      const newHistory: HistoryItem[] = [{ domain, type: selectedType, ok: true, ts: Date.now() }, ...history];
      saveHistory(newHistory);

      if (presetRowRef.current) {
        presetRowRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Network error. Check your connection and try again.';
      setErrorTitle('Query failed');
      setErrorMsg(errorMessage);
      setState('error');

      // eslint-disable-next-line react-hooks/purity
      const newHistory: HistoryItem[] = [{ domain, type: selectedType, ok: false, ts: Date.now() }, ...history];
      saveHistory(newHistory);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      runLookup();
    }
  };

  const handlePresetClick = (domain: string) => {
    setDomainInput(domain);
    setTimeout(() => runLookup(), 0);
  };

  const handleNewLookup = () => {
    setState('idle');
    setDomainInput('');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('dns-history');
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setDomainInput(item.domain);
    setSelectedType(item.type);
    setTimeout(() => runLookup(), 0);
  };

  // Render results table
  const renderTable = () => {
    if (!lastResults) return null;

    if (activeTab === 'ALL') {
      const allAnswers: any[] = [];
      Object.entries(lastResults.data).forEach(([type, res]) => {
        if (res.Answer) {
          res.Answer.forEach((ans: any) => allAnswers.push({ ...ans, _type: type }));
        }
      });

      if (allAnswers.length === 0) {
        return <div className={styles.noRecords}>No records found for this domain.</div>;
      }

      return (
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>TTL</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {allAnswers.map((ans, idx) => (
              <tr key={idx}>
                <td className={styles.tdType}>{escapeHtml(typeNumberToName(ans.type) || ans._type)}</td>
                <td className={styles.tdName}>{escapeHtml(ans.name || '')}</td>
                <td className={styles.tdTtl}>{formatTTL(ans.TTL)}</td>
                <td className={styles.tdData} dangerouslySetInnerHTML={{ __html: formatData(ans) }} />
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      const res = lastResults.data[activeTab];
      if (!res || res.Status === -1) {
        return <div className={styles.noRecords}>Error querying {activeTab}: {escapeHtml(res?._error || 'Unknown error')}</div>;
      }

      const rcode = res.Status;
      const rcodeName = RCODE_NAMES[rcode] || `RCODE ${rcode}`;

      if (rcode !== 0 || !res.Answer || res.Answer.length === 0) {
        let msg = rcode === 0 ? `No ${activeTab} records found.` : `DNS response: ${rcodeName}`;
        if (res.Authority && res.Authority.length > 0) {
          msg += ` (SOA authority: ${res.Authority[0]?.data || ''})`;
        }
        return <div className={styles.noRecords}>{escapeHtml(msg)}</div>;
      }

      const cols = getColumns(activeTab);
      return (
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              {cols.map((c, idx) => (
                <th key={idx}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {res.Answer.map((ans: any, idx: number) => (
              <tr key={idx}>
                {cols.map((c, cidx) => (
                  <td key={cidx} className={c.cls} dangerouslySetInnerHTML={{ __html: c.render(ans) }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  // Calculate summary data
  let summaryData = {
    domain: '—',
    status: '—',
    statusClass: '',
    count: '—',
    time: '—',
    auth: '—',
    dnssec: '—'
  };

  if (lastResults && state === 'results') {
    const firstGood = Object.values(lastResults.data).find((d: any) => d.Status !== undefined && d.Status !== -1);
    const rcode = firstGood ? firstGood.Status : -1;
    const rcodeName = RCODE_NAMES[rcode] || `RCODE ${rcode}`;
    let total = 0;
    Object.values(lastResults.data).forEach((d: any) => {
      if (d.Answer) total += d.Answer.length;
    });
    summaryData = {
      domain: lastResults.domain,
      status: rcodeName,
      statusClass: rcode === 0 ? styles.statusOk : rcode === 3 ? styles.statusNxdomain : styles.statusErr,
      count: `${total} record${total !== 1 ? 's' : ''}`,
      time: `${lastResults.elapsed}ms`,
      auth: firstGood?.AD ? 'Yes' : 'No',
      dnssec: firstGood?.AD ? 'Validated ✓' : '—'
    };
  }

  return (
    <div className={styles.container}>
      {/* Query Panel */}
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelLabel}>01</span>
          <h2 className={styles.panelTitle}>Query</h2>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel} htmlFor="domain-input">
            Domain / Hostname
          </label>
          <div className={styles.inputRow}>
            <input
              id="domain-input"
              type="text"
              className={styles.textInput}
              placeholder="e.g. example.com or mail.google.com"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <button type="button" className={styles.btnPrimary} onClick={runLookup} disabled={state === 'loading'}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Lookup
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.fieldLabel} id="record-types-label">Record Types</div>
          <div className={styles.typeGrid} role="group" aria-labelledby="record-types-label">
            {['ALL', ...ALL_TYPES].map((type) => (
              <button
                type="button"
                key={type}
                className={`${styles.typeBtn} ${selectedType === type ? styles.active : ''}`}
                onClick={() => setSelectedType(type as DNSRecordType)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.fieldLabel} id="lookup-options-label">Options</div>
          <div className={styles.optionsRow} role="group" aria-labelledby="lookup-options-label">
            <label className={styles.toggleLabel} htmlFor="dnssec-toggle">
              <input
                id="dnssec-toggle"
                type="checkbox"
                checked={dnssecToggle}
                onChange={(e) => setDnssecToggle(e.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleTrack}>
                <span className={styles.toggleThumb}></span>
              </span>
              <span>Request DNSSEC data</span>
            </label>
            <label className={styles.toggleLabel} htmlFor="cd-toggle">
              <input
                id="cd-toggle"
                type="checkbox"
                checked={cdToggle}
                onChange={(e) => setCdToggle(e.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleTrack}>
                <span className={styles.toggleThumb}></span>
              </span>
              <span>Disable DNSSEC validation (CD bit)</span>
            </label>
            <label className={styles.toggleLabel} htmlFor="edns-toggle">
              <input
                id="edns-toggle"
                type="checkbox"
                checked={ednsToggle}
                onChange={(e) => setEdnsToggle(e.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleTrack}>
                <span className={styles.toggleThumb}></span>
              </span>
              <span>Send EDNS Client Subnet</span>
            </label>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.fieldLabel} id="quick-presets-label">Quick Presets</div>
          <div className={styles.presetRow} ref={presetRowRef} role="group" aria-labelledby="quick-presets-label">
            {PRESET_DOMAINS.map((domain) => (
              <button
                type="button"
                key={domain}
                className={styles.presetBtn}
                onClick={() => handlePresetClick(domain)}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Panel */}
      <section className={styles.resultsPanel}>
        {state === 'idle' && (
          <div className={styles.idleState}>
            <div className={styles.idleIcon}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <p className={styles.idleText}>
              Enter a domain and hit <strong>Lookup</strong> to query DNS records.
            </p>
            <p className={styles.idleHint}>Supports A · AAAA · MX · TXT · NS · CNAME · SOA · SRV · PTR · CAA · DS · DNSKEY</p>
          </div>
        )}

        {state === 'loading' && (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Querying DNS records…</p>
          </div>
        )}

        {state === 'error' && (
            <div className={styles.errorState}>
              <div className={styles.errorIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className={styles.errorTitle}>{errorTitle}</p>
            <p className={styles.errorMsg}>{errorMsg}</p>
            <button type="button" className={styles.btnGhost} onClick={runLookup}>
              Try again
            </button>
          </div>
        )}

        {state === 'results' && lastResults && (
          <div className={styles.resultsContent}>
            <div className={styles.summaryBar}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryKey}>Domain</span>
                <span className={`${styles.summaryVal} ${styles.mono}`}>{summaryData.domain}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryKey}>Status</span>
                <span className={`${styles.summaryVal} ${summaryData.statusClass}`}>{summaryData.status}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryKey}>Records</span>
                <span className={styles.summaryVal}>{summaryData.count}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryKey}>Query Time</span>
                <span className={`${styles.summaryVal} ${styles.mono}`}>{summaryData.time}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryKey}>Authoritative</span>
                <span className={styles.summaryVal}>{summaryData.auth}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryKey}>DNSSEC</span>
                <span className={styles.summaryVal}>{summaryData.dnssec}</span>
              </div>
            </div>

            <div className={styles.resultTabs}>
              <button
                type="button"
                className={`${styles.resultTab} ${activeTab === 'ALL' ? styles.active : ''}`}
                onClick={() => setActiveTab('ALL')}
              >
                ALL <span className={styles.tabCount}>{countAllRecords(lastResults.data)}</span>
              </button>
              {Object.keys(lastResults.data).map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`${styles.resultTab} ${activeTab === type ? styles.active : ''}`}
                  onClick={() => setActiveTab(type)}
                >
                  {type} <span className={styles.tabCount}>{(lastResults.data[type]?.Answer || []).length}</span>
                </button>
              ))}
            </div>

            <div className={styles.tableWrap}>{renderTable()}</div>

            <div className={styles.actionBar}>
              <button
                type="button"
                className={`${styles.btnGhost} ${styles.small}`}
                onClick={() => {
                  copyText(JSON.stringify(lastResults, null, 2));
                  showToast('JSON copied!');
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy JSON
              </button>
              <button
                type="button"
                className={`${styles.btnGhost} ${styles.small}`}
                onClick={() => {
                  copyText(buildRawText(lastResults));
                  showToast('Raw text copied!');
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                Copy Raw
              </button>
              <button
                type="button"
                className={`${styles.btnGhost} ${styles.small}`}
                onClick={() => downloadCSV(lastResults, showToast)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
              <button
                type="button"
                className={`${styles.btnGhost} ${styles.small}`}
                onClick={() => {
                  const url = `${typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''}?domain=${encodeURIComponent(lastResults.domain)}&type=${encodeURIComponent(selectedType)}`;
                  copyText(url);
                  showToast('Share link copied!');
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share Link
              </button>
              <button type="button" className={`${styles.btnGhost} ${styles.small}`} onClick={handleNewLookup}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                </svg>
                New Lookup
              </button>
            </div>

            <details className={styles.rawDetails}>
              <summary className={styles.rawSummary}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                Raw JSON Response
              </summary>
              <pre className={styles.rawPre}>{JSON.stringify(lastResults.data, null, 2)}</pre>
            </details>
          </div>
        )}
      </section>

      {/* History Panel */}
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelLabel}>History</span>
          <h2 className={styles.panelTitle}>Recent Lookups</h2>
          <button type="button" className={`${styles.btnGhost} ${styles.small}`} onClick={handleClearHistory}>
            Clear
          </button>
        </div>
        <div className={styles.historyList}>
          {history.length === 0 ? (
            <p className={styles.historyEmpty}>No lookups yet. Run your first query above.</p>
          ) : (
            history.map((item, idx) => (
              <div
                key={idx}
                className={styles.historyItem}
                onClick={() => handleHistoryClick(item)}
              >
                <span className={item.ok ? styles.historyStatusOk : styles.historyStatusErr}></span>
                <span className={styles.historyDomain}>{escapeHtml(item.domain)}</span>
                <span className={styles.historyType}>{escapeHtml(item.type)}</span>
                <span className={styles.historyTime}>{timeAgo(item.ts)}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Toast */}
      {toast && <div className={`${styles.toast} ${styles.show}`}>{toast}</div>}
    </div>
  );
}
