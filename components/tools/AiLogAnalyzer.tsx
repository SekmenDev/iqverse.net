'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

const AI_BOT_PATTERNS: { name: string; regex: RegExp; vendor: string }[] = [
  { name: 'GPTBot', regex: /GPTBot/i, vendor: 'OpenAI' },
  { name: 'ChatGPT-User', regex: /ChatGPT-User/i, vendor: 'OpenAI' },
  { name: 'ClaudeBot', regex: /ClaudeBot|Claude-Web/i, vendor: 'Anthropic' },
  { name: 'PerplexityBot', regex: /PerplexityBot/i, vendor: 'Perplexity' },
  { name: 'Bytespider', regex: /Bytespider/i, vendor: 'ByteDance' },
  { name: 'CCBot', regex: /CCBot/i, vendor: 'Common Crawl' },
  { name: 'Google-Extended', regex: /Google-Extended|GoogleOther/i, vendor: 'Google' },
  { name: 'Amazonbot', regex: /Amazonbot/i, vendor: 'Amazon' },
  { name: 'Cohere-ai', regex: /Cohere-ai/i, vendor: 'Cohere' },
  { name: 'Applebot-Extended', regex: /Applebot-Extended/i, vendor: 'Apple' },
];

const SAMPLE_LOG = `192.168.1.10 - - [15/Jan/2026:10:14:32 +0000] "GET /robots.txt HTTP/1.1" 200 412 "-" "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)"
192.168.1.11 - - [15/Jan/2026:10:15:01 +0000] "GET /llms.txt HTTP/1.1" 200 1024 "-" "Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://anthropic.com/claudebot)"
192.168.1.12 - - [15/Jan/2026:10:16:45 +0000] "GET /blog/ai-trends HTTP/1.1" 200 4520 "-" "PerplexityBot/1.0 (+https://perplexity.ai/perplexitybot)"
192.168.1.13 - - [15/Jan/2026:10:17:10 +0000] "GET /docs/api HTTP/1.1" 404 210 "-" "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)"
192.168.1.14 - - [15/Jan/2026:10:18:22 +0000] "GET /agentscan/ HTTP/1.1" 200 8920 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
192.168.1.15 - - [15/Jan/2026:10:19:00 +0000] "GET /sitemap.xml HTTP/1.1" 200 1540 "-" "Google-Extended/1.0"
192.168.1.10 - - [15/Jan/2026:10:20:15 +0000] "GET /blog/ai-trends HTTP/1.1" 200 4520 "-" "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)"`;

interface ParsedHit {
  ip: string;
  timestamp: string;
  method: string;
  path: string;
  status: string;
  bytes: string;
  userAgent: string;
  botMatch: { name: string; vendor: string } | null;
}

interface AnalysisResults {
  totalLines: number;
  aiHitsCount: number;
  botCounts: Record<string, { count: number; vendor: string }>;
  topPaths: { path: string; count: number }[];
  statusCounts: Record<string, number>;
  hits: ParsedHit[];
}

export default function AiLogAnalyzer() {
  const [logContent, setLogContent] = useState(SAMPLE_LOG);
  const [results, setResults] = useState<AnalysisResults | null>(null);

  const parseLogs = () => {
    const lines = logContent.split('\n').filter((l) => l.trim().length > 0);
    const hits: ParsedHit[] = [];
    const botCounts: Record<string, { count: number; vendor: string }> = {};
    const pathCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};
    let aiHitsCount = 0;

    // Combined/Common log regex
    // e.g. 192.168.1.10 - - [15/Jan/2026:10:14:32 +0000] "GET /robots.txt HTTP/1.1" 200 412 "-" "User-Agent"
    const logRegex = /^(\S+)\s+-\s+-\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)\s+[^"]*"\s+(\d{3})\s+(\d+|-)\s*(?:"[^"]*"\s*"([^"]*)")?/;

    lines.forEach((line) => {
      let ip = 'Unknown';
      let timestamp = 'Unknown';
      let method = 'GET';
      let path = '/';
      let status = '200';
      let bytes = '0';
      let userAgent = line;

      const match = line.match(logRegex);
      if (match) {
        ip = match[1];
        timestamp = match[2];
        method = match[3];
        path = match[4];
        status = match[5];
        bytes = match[6];
        userAgent = match[7] || line;
      } else {
        // Simple fallback extraction if custom log format
        const uaIndex = line.lastIndexOf('"');
        if (uaIndex > 0) {
          const firstQuote = line.lastIndexOf('"', uaIndex - 1);
          if (firstQuote !== -1) {
            userAgent = line.substring(firstQuote + 1, uaIndex);
          }
        }
      }

      let botMatch: { name: string; vendor: string } | null = null;
      for (const b of AI_BOT_PATTERNS) {
        if (b.regex.test(userAgent)) {
          botMatch = { name: b.name, vendor: b.vendor };
          break;
        }
      }

      if (botMatch) {
        aiHitsCount++;
        if (!botCounts[botMatch.name]) {
          botCounts[botMatch.name] = { count: 0, vendor: botMatch.vendor };
        }
        botCounts[botMatch.name].count++;

        pathCounts[path] = (pathCounts[path] || 0) + 1;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }

      hits.push({
        ip,
        timestamp,
        method,
        path,
        status,
        bytes,
        userAgent,
        botMatch,
      });
    });

    const sortedPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);

    setResults({
      totalLines: lines.length,
      aiHitsCount,
      botCounts,
      topPaths: sortedPaths,
      statusCounts,
      hits: hits.filter((h) => h.botMatch !== null),
    });
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="logInput">
              Server Access Log Lines (Apache / Nginx / Cloudflare)
            </label>
            <textarea
              id="logInput"
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              className={sharedStyles.textarea}
              rows={8}
              placeholder="Paste web server access log lines..."
            />
          </div>

          <button
            type="button"
            className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
            onClick={parseLogs}
          >
            Analyze AI Crawler Logs
          </button>

          {results && (
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div style={{ padding: 16, borderRadius: 8, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color, #333)' }}>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Total Log Lines</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{results.totalLines}</div>
                </div>
                <div style={{ padding: 16, borderRadius: 8, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color, #333)' }}>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>AI Crawler Visits</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#4caf50' }}>{results.aiHitsCount}</div>
                </div>
                <div style={{ padding: 16, borderRadius: 8, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color, #333)' }}>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Distinct AI Bots</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#2196f3' }}>
                    {Object.keys(results.botCounts).length}
                  </div>
                </div>
              </div>

              {Object.keys(results.botCounts).length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ marginBottom: 12 }}>AI Bot Breakdown</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                    {Object.entries(results.botCounts).map(([name, data]) => (
                      <div
                        key={name}
                        style={{
                          padding: 12,
                          borderRadius: 6,
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-color, #333)',
                          display: 'flex',
                          justifySpace: 'space-between',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong>{name}</strong>
                          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{data.vendor}</div>
                        </div>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{data.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.topPaths.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ marginBottom: 12 }}>Most Crawled Paths</h4>
                  <div style={{ border: '1px solid var(--border-color, #333)', borderRadius: 6, overflow: 'hidden' }}>
                    {results.topPaths.map((p, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderBottom: i < results.topPaths.length - 1 ? '1px solid var(--border-color, #333)' : 'none',
                          fontSize: '0.9rem',
                        }}
                      >
                        <code>{p.path}</code>
                        <strong>{p.count} hits</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.hits.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 12 }}>Detected AI Log Entries ({results.hits.length})</h4>
                  <div className={sharedStyles.outputArea} style={{ maxHeight: 300, overflowY: 'auto', fontSize: '0.8rem' }}>
                    {results.hits.map((h, idx) => (
                      <div key={idx} style={{ paddingBottom: 6, marginBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>[{h.botMatch?.name}]</span>{' '}
                        <span>{h.ip}</span> - <span>{h.method} {h.path}</span> ({h.status})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
