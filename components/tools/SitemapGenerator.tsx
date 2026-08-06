'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

interface UrlEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

export default function SitemapGenerator() {
  const [baseUrl, setBaseUrl] = useState('https://iqverse.net');
  const [urls, setUrls] = useState<UrlEntry[]>([
    { loc: 'https://iqverse.net/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '1.0' },
    { loc: 'https://iqverse.net/agentscan/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '0.8' },
    { loc: 'https://iqverse.net/llmstxt/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '0.8' },
  ]);

  const [bulkInput, setBulkInput] = useState('');
  const [copied, setCopied] = useState(false);

  const addUrl = () => {
    setUrls([
      ...urls,
      { loc: `${baseUrl.replace(/\/$/, '')}/new-page`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: '0.5' },
    ]);
  };

  const removeUrl = (idx: number) => {
    setUrls(urls.filter((_, i) => i !== idx));
  };

  const updateUrlField = (idx: number, field: keyof UrlEntry, val: string) => {
    const updated = [...urls];
    updated[idx][field] = val;
    setUrls(updated);
  };

  const handleBulkImport = () => {
    const lines = bulkInput.split('\n').map((l) => l.trim()).filter(Boolean);
    const today = new Date().toISOString().split('T')[0];
    const newEntries: UrlEntry[] = lines.map((l) => {
      const fullLoc = l.startsWith('http') ? l : `${baseUrl.replace(/\/$/, '')}${l.startsWith('/') ? '' : '/'}${l}`;
      return { loc: fullLoc, lastmod: today, changefreq: 'monthly', priority: '0.5' };
    });

    setUrls([...urls, ...newEntries]);
    setBulkInput('');
  };

  const generateXml = (): string => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    urls.forEach((u) => {
      if (u.loc.trim()) {
        xml += `  <url>\n`;
        xml += `    <loc>${u.loc.trim()}</loc>\n`;
        if (u.lastmod.trim()) xml += `    <lastmod>${u.lastmod.trim()}</lastmod>\n`;
        if (u.changefreq) xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
        if (u.priority) xml += `    <priority>${u.priority}</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    xml += `</urlset>`;
    return xml;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateXml());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateXml()], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 1050 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <div className={sharedStyles.field} style={{ margin: 0, flex: 1, minWidth: 240 }}>
              <label className={sharedStyles.fieldLabel} htmlFor="baseUrlInput">
                Base Website URL
              </label>
              <input
                id="baseUrlInput"
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className={sharedStyles.input}
              />
            </div>
            <button type="button" className={sharedStyles.button} onClick={addUrl} style={{ marginTop: 22 }}>
              + Add URL
            </button>
          </div>

          {/* Bulk Import */}
          <div
            style={{
              padding: 14,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color, #333)',
              marginBottom: 20,
            }}
          >
            <label className={sharedStyles.fieldLabel} htmlFor="bulkArea">
              Bulk Import URLs (one path or URL per line)
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <textarea
                id="bulkArea"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                className={sharedStyles.textarea}
                rows={2}
                placeholder="/about&#10;/contact&#10;/pricing"
              />
              <button type="button" className={sharedStyles.button} onClick={handleBulkImport} style={{ alignSelf: 'flex-end' }}>
                Import
              </button>
            </div>
          </div>

          {/* URL List */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 12 }}>Sitemap Entries ({urls.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {urls.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 0.8fr auto',
                    gap: 8,
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.01)',
                    padding: 8,
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <input
                    type="text"
                    value={entry.loc}
                    onChange={(e) => updateUrlField(idx, 'loc', e.target.value)}
                    className={sharedStyles.input}
                    placeholder="https://..."
                  />
                  <input
                    type="date"
                    value={entry.lastmod}
                    onChange={(e) => updateUrlField(idx, 'lastmod', e.target.value)}
                    className={sharedStyles.input}
                  />
                  <select
                    value={entry.changefreq}
                    onChange={(e) => updateUrlField(idx, 'changefreq', e.target.value)}
                    className={sharedStyles.input}
                  >
                    <option value="always">always</option>
                    <option value="hourly">hourly</option>
                    <option value="daily">daily</option>
                    <option value="weekly">weekly</option>
                    <option value="monthly">monthly</option>
                    <option value="yearly">yearly</option>
                    <option value="never">never</option>
                  </select>
                  <select
                    value={entry.priority}
                    onChange={(e) => updateUrlField(idx, 'priority', e.target.value)}
                    className={sharedStyles.input}
                  >
                    <option value="1.0">1.0 (Highest)</option>
                    <option value="0.9">0.9</option>
                    <option value="0.8">0.8</option>
                    <option value="0.7">0.7</option>
                    <option value="0.6">0.6</option>
                    <option value="0.5">0.5 (Default)</option>
                    <option value="0.3">0.3</option>
                    <option value="0.1">0.1 (Lowest)</option>
                  </select>
                  <button
                    type="button"
                    className={sharedStyles.button}
                    onClick={() => removeUrl(idx)}
                    style={{ color: '#ff4d4f' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Generated XML */}
          <div className={sharedStyles.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className={sharedStyles.fieldLabel} htmlFor="xmlOutput">
                Generated sitemap.xml
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className={sharedStyles.button} onClick={handleCopy}>
                  {copied ? 'Copied XML!' : 'Copy XML'}
                </button>
                <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={handleDownload}>
                  Download sitemap.xml
                </button>
              </div>
            </div>
            <textarea
              id="xmlOutput"
              readOnly
              value={generateXml()}
              className={sharedStyles.outputArea}
              rows={12}
              style={{ fontFamily: 'monospace' }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
