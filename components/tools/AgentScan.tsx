'use client';

import { useMemo, useState } from 'react';
import { getHeader } from '@/lib/utils';
import styles from '@/styles/agentscan.module.css';
import CapCaptcha from '@/components/CapCaptcha';

const PROXY = '/api/check-url?url=';

type CheckStatus = 'pass' | 'fail' | 'warn' | 'info' | 'skip';

type CheckDef = {
  id: string;
  name: string;
  category: string;
  desc: string;
  weight: number;
};

type CheckResult = {
  id: string;
  status: CheckStatus;
  detail: string;
  detail_extra?: string;
  latency?: number;
};

type FetchResult = {
  ok: boolean;
  status: number;
  body: string;
  headers: Record<string, string>;
  latency: number;
  error?: string;
};

const CHECK_DEFS: CheckDef[] = [
  // 9 Core Scored Signals (Sum = 100)
  { id: 'llms_txt', name: 'llms.txt', category: 'scored', desc: 'A markdown file at /llms.txt that gives AI systems a curated map of your site.', weight: 18 },
  { id: 'robots_ai_bots', name: 'robots.txt AI bots', category: 'scored', desc: 'Rules in /robots.txt applying to AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.).', weight: 18 },
  { id: 'structured_data', name: 'Schema.org JSON-LD', category: 'scored', desc: 'Structured data embedded in the page describing organization, website and entities.', weight: 14 },
  { id: 'sitemap', name: 'Sitemap', category: 'scored', desc: 'A valid, reachable sitemap.xml — either at root or declared in robots.txt.', weight: 12 },
  { id: 'title_meta', name: 'Title & meta description', category: 'scored', desc: 'Document title and meta description of the page being scanned.', weight: 10 },
  { id: 'llms_full_txt', name: 'llms-full.txt', category: 'scored', desc: 'An optional companion to llms.txt carrying extended context and deeper detail.', weight: 8 },
  { id: 'canonical_url', name: 'Canonical URL', category: 'scored', desc: 'A link rel="canonical" declaring the authoritative URL for the page.', weight: 8 },
  { id: 'open_graph', name: 'Open Graph', category: 'scored', desc: 'og:title, og:url, og:image metadata for social and AI snippet rendering.', weight: 6 },
  { id: 'indexable_page', name: 'Indexable page', category: 'scored', desc: 'Verifies the page does not carry an unintended noindex directive.', weight: 6 },

  // Informational Checks (Unscored)
  { id: 'ai_txt', name: 'ai.txt', category: 'informational', desc: 'A proposed convention at /ai.txt declaring AI usage policies.', weight: 0 },
  { id: 'content_signals', name: 'Content-Signal', category: 'informational', desc: 'Emerging robots.txt directive expressing per-purpose AI permissions.', weight: 0 },

  // Protocol & Commerce Checks (Extended Discovery)
  { id: 'mcp_server_card', name: 'MCP Server Card', category: 'protocol', desc: 'Model Context Protocol server at /.well-known/mcp.json.', weight: 0 },
  { id: 'a2a_agent_card', name: 'A2A Agent Card', category: 'protocol', desc: 'Agent-to-Agent card at /.well-known/agent.json.', weight: 0 },
  { id: 'oauth_discovery', name: 'OAuth Discovery', category: 'protocol', desc: 'OAuth 2.0 server metadata at /.well-known/oauth-authorization-server.', weight: 0 },
  { id: 'api_catalog', name: 'API Catalog / OpenAPI', category: 'protocol', desc: 'OpenAPI spec at /openapi.json, /swagger.json or /api-docs.', weight: 0 },
  { id: 'markdown_negotiation', name: 'Markdown Negotiation', category: 'content', desc: 'Content negotiation support for text/markdown via Accept headers.', weight: 0 },
  { id: 'x402', name: 'x402 Payment Protocol', category: 'commerce', desc: 'HTTP 402 responses or x402 headers enabling AI agent micropayments.', weight: 0 },
  { id: 'ucp', name: 'Universal Commerce Protocol (UCP)', category: 'commerce', desc: 'UCP discovery at /.well-known/ucp.json.', weight: 0 },
  { id: 'https', name: 'HTTPS', category: 'performance', desc: 'Confirms the site is served over secure HTTPS.', weight: 0 },
];

const CATEGORIES: Record<string, { label: string; icon: string }> = {
  scored: { label: 'Scored Core Signals', icon: '⭐' },
  informational: { label: 'Informational Checks', icon: 'ℹ️' },
  protocol: { label: 'Protocol & MCP', icon: '🔌' },
  content: { label: 'Content Negotiation', icon: '📄' },
  commerce: { label: 'Commerce Protocols', icon: '💳' },
  performance: { label: 'Security & HTTP', icon: '⚡' },
};

const STATUS_ICONS: Record<CheckStatus, string> = {
  pass: '✓',
  fail: '✗',
  warn: '⚠',
  info: 'ℹ',
  skip: '—',
};

const FILTERS = ['all', ...Object.keys(CATEGORIES)] as Array<'all' | keyof typeof CATEGORIES>;
const QUICK_EXAMPLES = ['https://cloudflare.com', 'https://github.com', 'https://openai.com', 'https://stripe.com', 'https://anthropic.com'];

function formatStatusLabel(status: CheckStatus) {
  switch (status) {
    case 'pass':
      return 'Passed';
    case 'warn':
      return 'Warning / Partial';
    case 'fail':
      return 'Failed';
    case 'info':
      return 'Info';
    default:
      return 'Skipped';
  }
}

function getRecommendationText(id: string) {
  const recs: Record<string, string> = {
    llms_txt: 'Publish /llms.txt with an H1 title, blockquote summary and grouped links.',
    robots_ai_bots: 'Add explicit allow rules in /robots.txt for AI agents (GPTBot, ClaudeBot, etc.).',
    structured_data: 'Add JSON-LD with Organization and WebSite schema to your homepage HTML.',
    sitemap: 'Serve a valid /sitemap.xml and reference it in your robots.txt file.',
    title_meta: 'Write a concise title and a 50–160 character meta description for the page.',
    llms_full_txt: 'Add /llms-full.txt to provide extended context and deeper facts for AI systems.',
    canonical_url: 'Add a <link rel="canonical" href="..."> tag to declare the authoritative page URL.',
    open_graph: 'Include og:title, og:url and og:image metadata in your HTML head.',
    indexable_page: 'Ensure no unwanted noindex directive exists in your robots meta tag.',
    ai_txt: 'Optional: Add /ai.txt or /.well-known/ai.txt to state public AI usage policies.',
    content_signals: 'Optional: Add Content-Signal directives to specify AI search vs training rules.',
  };
  return recs[id] || 'Review the scan details and improve this signal.';
}

export default function AgentScan() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<CheckResult[]>([]);
  const [rawData, setRawData] = useState<Record<string, any>>({});
  const [scannedAt, setScannedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | keyof typeof CATEGORIES>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CheckStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortMode, setSortMode] = useState<'category' | 'status' | 'name' | 'weight'>('category');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [rawVisible, setRawVisible] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const isFiltered = activeFilter !== 'all' || statusFilter !== 'all' || searchQuery.trim() !== '';

  const clearAllFilters = () => {
    setActiveFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const def = CHECK_DEFS.find((item) => item.id === result.id);

      // Status filter
      if (statusFilter !== 'all' && result.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (activeFilter !== 'all' && def?.category !== activeFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const nameMatch = (def?.name || '').toLowerCase().includes(query);
        const idMatch = result.id.toLowerCase().includes(query);
        const descMatch = (def?.desc || '').toLowerCase().includes(query);
        const detailMatch = (result.detail || '').toLowerCase().includes(query);
        const detailExtraMatch = (result.detail_extra || '').toLowerCase().includes(query);
        const categoryLabel = (def?.category ? CATEGORIES[def.category]?.label || def.category : '').toLowerCase();
        const categoryMatch = categoryLabel.includes(query);
        const statusLabel = formatStatusLabel(result.status).toLowerCase();
        const statusMatch = statusLabel.includes(query);

        if (!nameMatch && !idMatch && !descMatch && !detailMatch && !detailExtraMatch && !categoryMatch && !statusMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const aDef = CHECK_DEFS.find((item) => item.id === a.id);
      const bDef = CHECK_DEFS.find((item) => item.id === b.id);

      if (sortMode === 'name') {
        const aName = aDef?.name || a.id;
        const bName = bDef?.name || b.id;
        return aName.localeCompare(bName);
      }

      if (sortMode === 'status') {
        const order: Record<CheckStatus, number> = { fail: 0, warn: 1, info: 2, pass: 3, skip: 4 };
        return order[a.status] - order[b.status];
      }

      if (sortMode === 'weight') {
        const aWeight = aDef?.weight || 0;
        const bWeight = bDef?.weight || 0;
        return bWeight - aWeight;
      }

      return 0;
    });
  }, [activeFilter, statusFilter, searchQuery, results, sortMode]);

  const score = useMemo(() => {
    let totalMax = 0;
    let totalEarned = 0;
    for (const def of CHECK_DEFS) {
      if (def.weight === 0) continue; // Informational / extra checks don't affect weight sum
      totalMax += def.weight;
      const result = results.find((item) => item.id === def.id);
      if (!result) continue;
      if (result.status === 'pass') totalEarned += def.weight;
      else if (result.status === 'warn') totalEarned += def.weight * 0.5;
    }
    return totalMax ? Math.round((totalEarned / totalMax) * 100) : 0;
  }, [results]);

  const summaryCounts = useMemo(() => ({
    passed: results.filter((item) => item.status === 'pass').length,
    failed: results.filter((item) => item.status === 'fail').length,
    warnings: results.filter((item) => item.status === 'warn').length,
  }), [results]);

  async function proxyFetch(targetUrl: string, timeoutMs = 10000): Promise<FetchResult> {
    const proxyUrl = PROXY + encodeURIComponent(targetUrl);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = performance.now();

    try {
      const response = await fetch(proxyUrl, { signal: controller.signal, cache: 'no-store' });
      const json = await response.json();
      return {
        ok: json.status != null && json.status > 0 && json.status < 400,
        status: json.status ?? 0,
        body: json.body ?? json.html ?? '',
        headers: json.headers ?? {},
        latency: json.time ?? Math.round(performance.now() - startedAt),
        error: json.error,
      };
    } catch (error: any) {
      return {
        ok: false,
        status: 0,
        body: '',
        headers: {},
        latency: Math.round(performance.now() - startedAt),
        error: error?.message || 'Fetch failed',
      };
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function runAllChecks(rawUrl: string) {
    const normalizedUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`;
    const origin = new URL(normalizedUrl).origin;
    const resultsBuffer: CheckResult[] = [];

    const updateStatus = (message: string) => setLoadingMessage(message);
    updateStatus('Resolving domain and fetching public discovery files…');

    const responses = await Promise.all([
      proxyFetch(origin),
      proxyFetch(`${origin}/robots.txt`),
      proxyFetch(`${origin}/sitemap.xml`),
      proxyFetch(`${origin}/llms.txt`),
      proxyFetch(`${origin}/llms-full.txt`),
      proxyFetch(`${origin}/ai.txt`),
      proxyFetch(`${origin}/.well-known/ai.txt`),
      proxyFetch(`${origin}/.well-known/mcp.json`),
      proxyFetch(`${origin}/.well-known/agent.json`),
      proxyFetch(`${origin}/.well-known/oauth-authorization-server`),
      proxyFetch(`${origin}/openapi.json`),
      proxyFetch(`${origin}/.well-known/ucp.json`),
      proxyFetch(`${origin}/.well-known/x402.json`),
    ]);

    const [homepageRes, robotsRes, sitemapRes, llmsRes, llmsFullRes, aiTxtRes, wellKnownAiRes, mcpRes, agentRes, oauthRes, openApiRes, ucpRes, x402Res] = responses;

    setRawData({
      homepage: homepageRes,
      robots: robotsRes,
      sitemap: sitemapRes,
      llmsTxt: llmsRes,
      llmsFullTxt: llmsFullRes,
      aiTxt: aiTxtRes,
      wellKnownAi: wellKnownAiRes,
      mcp: mcpRes,
      agent: agentRes,
      oauth: oauthRes,
      openapi: openApiRes,
      ucp: ucpRes,
      x402: x402Res,
    });

    const robotsBody = robotsRes.body || '';
    const homepageHtml = homepageRes.body || '';

    const addResult = (id: string, status: CheckStatus, detail: string, extra?: Partial<CheckResult>) => {
      resultsBuffer.push({ id, status, detail, ...extra });
    };

    // 1. llms.txt (Weight 18)
    const hasLlms = llmsRes.ok && llmsRes.body.trim().length > 10;
    addResult('llms_txt', hasLlms ? 'pass' : llmsRes.status === 404 ? 'fail' : 'warn', hasLlms ? '/llms.txt found and non-empty.' : llmsRes.status === 404 ? 'No /llms.txt file found (404).' : `Unreachable /llms.txt (HTTP ${llmsRes.status}).`, {
      detail_extra: hasLlms ? llmsRes.body.slice(0, 300) : undefined,
    });

    // 2. robots.txt AI bots (Weight 18)
    const knownBots = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot', 'anthropic-ai', 'Applebot'];
    const matchedBots = knownBots.filter((bot) => new RegExp(bot, 'i').test(robotsBody));
    const isDisallowed = /user-agent:\s*\*\s*\n[^\n]*disallow:\s*\//i.test(robotsBody);
    addResult('robots_ai_bots', matchedBots.length > 0 && !isDisallowed ? 'pass' : isDisallowed ? 'fail' : matchedBots.length > 0 ? 'warn' : 'warn', matchedBots.length > 0 ? `AI crawler rules found for: ${matchedBots.join(', ')}.` : isDisallowed ? 'Global Disallow blocking AI agents in robots.txt.' : 'No explicit AI crawler rules found in robots.txt.');

    // 3. Schema.org JSON-LD (Weight 14)
    const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(homepageHtml);
    addResult('structured_data', hasJsonLd ? 'pass' : 'fail', hasJsonLd ? 'Schema.org JSON-LD structured data detected.' : 'No JSON-LD structured data found in HTML.');

    // 4. Sitemap (Weight 12)
    const hasSitemapFile = sitemapRes.ok && (sitemapRes.body.includes('<urlset') || sitemapRes.body.includes('<sitemapindex'));
    const sitemapDeclared = /sitemap:\s*http/i.test(robotsBody);
    addResult('sitemap', hasSitemapFile ? 'pass' : sitemapDeclared ? 'warn' : 'fail', hasSitemapFile ? 'Valid sitemap.xml reachable at root.' : sitemapDeclared ? 'Sitemap declared in robots.txt but sitemap.xml failed direct fetch.' : 'No sitemap.xml reachable or declared.');

    // 5. Title & meta description (Weight 10)
    const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(homepageHtml);
    const hasDesc = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i.test(homepageHtml);
    addResult('title_meta', hasTitle && hasDesc ? 'pass' : hasTitle || hasDesc ? 'warn' : 'fail', hasTitle && hasDesc ? 'Page title and meta description both present.' : hasTitle ? 'Page title found but meta description is missing.' : 'Missing document title and meta description.');

    // 6. llms-full.txt (Weight 8)
    const hasLlmsFull = llmsFullRes.ok && llmsFullRes.body.trim().length > 10;
    addResult('llms_full_txt', hasLlmsFull ? 'pass' : 'fail', hasLlmsFull ? '/llms-full.txt present with extended content.' : 'No /llms-full.txt companion file found.');

    // 7. Canonical URL (Weight 8)
    const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(homepageHtml);
    addResult('canonical_url', hasCanonical ? 'pass' : 'fail', hasCanonical ? 'Canonical URL tag rel="canonical" declared.' : 'No rel="canonical" tag found in page HTML.');

    // 8. Open Graph (Weight 6)
    const hasOgTitle = /<meta[^>]+property=["']og:title["']/i.test(homepageHtml);
    const hasOgUrl = /<meta[^>]+property=["']og:url["']/i.test(homepageHtml);
    const hasOgImage = /<meta[^>]+property=["']og:image["']/i.test(homepageHtml);
    const ogCount = [hasOgTitle, hasOgUrl, hasOgImage].filter(Boolean).length;
    addResult('open_graph', ogCount === 3 ? 'pass' : ogCount > 0 ? 'warn' : 'fail', ogCount === 3 ? 'Open Graph tags (og:title, og:url, og:image) complete.' : ogCount > 0 ? `Partial Open Graph tags found (${ogCount}/3).` : 'No Open Graph metadata present.');

    // 9. Indexable page (Weight 6)
    const isNoIndex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(homepageHtml);
    addResult('indexable_page', !isNoIndex ? 'pass' : 'fail', !isNoIndex ? 'Page is indexable (no noindex directive found).' : 'Page contains a noindex directive in robots meta tag!');

    // Informational Checks
    const hasAiTxt = (aiTxtRes.ok && aiTxtRes.body.length > 5) || (wellKnownAiRes.ok && wellKnownAiRes.body.length > 5);
    addResult('ai_txt', hasAiTxt ? 'pass' : 'info', hasAiTxt ? 'ai.txt policy file detected.' : 'No ai.txt or /.well-known/ai.txt found (informational).');

    const hasContentSignalHeader = getHeader(homepageRes.headers, 'x-content-signals') || getHeader(homepageRes.headers, 'content-signals');
    const hasContentSignalDirective = /content-signal:/i.test(robotsBody);
    addResult('content_signals', hasContentSignalHeader || hasContentSignalDirective ? 'pass' : 'info', hasContentSignalHeader || hasContentSignalDirective ? 'Content-Signal per-purpose directive detected.' : 'No Content-Signal header or robots directive detected (informational).');

    // Protocol & Extended Checks
    const parseJson = (res: FetchResult) => {
      try { return JSON.parse(res.body); } catch { return null; }
    };

    addResult('mcp_server_card', mcpRes.ok && parseJson(mcpRes) ? 'pass' : 'fail', mcpRes.ok ? 'MCP server card found at /.well-known/mcp.json.' : 'No MCP Server Card found.');
    addResult('a2a_agent_card', agentRes.ok && parseJson(agentRes) ? 'pass' : 'fail', agentRes.ok ? 'A2A Agent Card found at /.well-known/agent.json.' : 'No A2A Agent Card found.');
    addResult('oauth_discovery', oauthRes.ok && parseJson(oauthRes) ? 'pass' : 'fail', oauthRes.ok ? 'OAuth server metadata found.' : 'No OAuth discovery metadata found.');
    addResult('api_catalog', openApiRes.ok ? 'pass' : 'fail', openApiRes.ok ? 'OpenAPI spec found.' : 'No OpenAPI catalog spec found.');

    const mdRes = await proxyFetch(`${normalizedUrl}?_format=markdown`);
    const acceptsMarkdown = mdRes.ok && (/markdown|text\/markdown/i.test(getHeader(mdRes.headers, 'content-type') || '') || /^#/.test(mdRes.body || ''));
    addResult('markdown_negotiation', acceptsMarkdown ? 'pass' : 'fail', acceptsMarkdown ? 'Markdown content negotiation supported.' : 'No Markdown content negotiation detected.');

    addResult('x402', x402Res.ok ? 'pass' : 'fail', x402Res.ok ? 'x402 payment protocol detected.' : 'No x402 payment metadata found.');
    addResult('ucp', ucpRes.ok ? 'pass' : 'fail', ucpRes.ok ? 'Universal Commerce Protocol metadata found.' : 'No UCP metadata found.');
    addResult('https', normalizedUrl.startsWith('https://') ? 'pass' : 'fail', normalizedUrl.startsWith('https://') ? 'Served over HTTPS.' : 'Not using HTTPS.');

    setResults(resultsBuffer);
    setScannedAt(new Date());
    setLoading(false);
    setLoadingMessage('Scan complete.');
  }

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResults([]);
    setRawVisible(false);
    setLoadingMessage('Starting scan…');
    await runAllChecks(url.trim());
  };

  const copyRecommendations = async () => {
    const failed = results.filter((item) => item.status === 'fail' || item.status === 'warn');
    const lines = [`AgentScan results for ${url}`, `Score: ${score}/100`, ''];
    failed.forEach((item) => {
      const def = CHECK_DEFS.find((d) => d.id === item.id);
      if (def) lines.push(`- [${formatStatusLabel(item.status)}] ${def.name}: ${item.detail}`);
    });
    await navigator.clipboard.writeText(lines.join('\n'));
  };

  const exportJson = () => {
    const payload = {
      tool: 'AgentScan',
      url,
      scannedAt: scannedAt?.toISOString(),
      score,
      results,
      rawData,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `agentscan-${new URL(url.startsWith('http') ? url : `https://${url}`).hostname}-${Date.now()}.json`;
    link.click();
  };

  const groupedResults = useMemo(() => {
    if (sortMode !== 'category') {
      return { all: filteredResults };
    }
    return filteredResults.reduce<Record<string, CheckResult[]>>((acc, item) => {
      const category = CHECK_DEFS.find((def) => def.id === item.id)?.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
  }, [filteredResults, sortMode]);

  const faqs = [
    {
      q: 'Does a high score guarantee AI citations?',
      a: 'No and be sceptical of anyone who says otherwise. This measures whether engines can read and understand your site — the necessary groundwork. Whether they cite you also depends on your content, your authority and the question being asked.',
    },
    {
      q: 'Do you scan the whole site?',
      a: 'The free scan reads one page plus your public discovery files, which is where nearly all of these signals live. Full-site crawls with per-page llms.txt generation are a paid product.',
    },
    {
      q: 'What do you do with my data?',
      a: 'We fetch public URLs and keep the resulting report so its link stays shareable. No login, no private data, nothing executed on your site and nothing sold. See the privacy note for detail.',
    },
    {
      q: 'Will the free scan stay free?',
      a: 'Yes. The scanner, the extension and the checklist stay free. Paid products are the things that cost us real work per customer: full-site crawls, generated content, monitoring and audits.',
    },
    {
      q: 'Which browsers does the extension support?',
      a: 'Desktop Chrome and Firefox, from the Chrome Web Store or Firefox Add-ons. The web scanner works anywhere, including mobile.',
    },
  ];

  return (
    <div className={styles.agentScanContainer}>
      {/* HERO & SCANNER INPUT */}
      <section className={styles.heroSection}>
        <div className={styles.heroLabel}>AI Agent Readiness Scanner</div>
        <h2 className={styles.heroTitle}>Is your site agent-ready?</h2>
        <p className={styles.heroCopy}>
          Scan any website to discover how compatible it is with AI agents. We evaluate your core signals including llms.txt, robots.txt AI rules, Schema.org JSON-LD, sitemap, Open Graph, canonical metadata and protocol discovery files.
        </p>

        <div className={styles.scannerCard}>
          <div className={styles.inputRow}>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🌐</span>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                className={styles.urlInput}
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
                onKeyDown={(event) => { if (event.key === 'Enter') handleScan(); }}
              />
            </div>
            <button className={styles.scanButton} onClick={handleScan} disabled={loading} type="button">
              {loading ? 'Scanning…' : 'Scan Site'}
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <CapCaptcha />
          </div>

          <div className={styles.filterBar}>
            <span className={styles.filterLabel}>Filter checks:</span>
            <div className={styles.filterPills}>
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`${styles.filterPill} ${activeFilter === filter ? styles.activeFilter : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter === 'all' ? 'All' : CATEGORIES[filter]?.label || filter}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.quickExamples}>
            <span className={styles.examplesLabel}>Try:</span>
            {QUICK_EXAMPLES.map((example) => (
              <button key={example} type="button" className={styles.exampleBtn} onClick={() => { setUrl(example); setTimeout(handleScan, 0); }}>
                {example.replace(/^https?:\/\//, '')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loadingMessage && <div className={styles.statusBar}>{loadingMessage}</div>}

      {/* SCAN RESULTS PANEL */}
      {results.length > 0 && (
        <section className={styles.resultsSection}>
          <div className={styles.scorePanel}>
            <div>
              <div className={styles.scoreLabel}>Score</div>
              <div className={styles.scoreValue}>{score}</div>
              <div className={styles.scoreSubtitle}>{scannedAt ? `Scanned at ${scannedAt.toLocaleTimeString()}` : 'Scan complete'}</div>
            </div>
            <div className={styles.badges}>
              <button
                type="button"
                className={`${styles.badgeBtn} ${styles.badgePass} ${statusFilter === 'pass' ? styles.badgeActivePass : ''}`}
                onClick={() => setStatusFilter(statusFilter === 'pass' ? 'all' : 'pass')}
                title="Click to filter by Passed"
              >
                {summaryCounts.passed} Passed
              </button>
              <button
                type="button"
                className={`${styles.badgeBtn} ${styles.badgeWarning} ${statusFilter === 'warn' ? styles.badgeActiveWarn : ''}`}
                onClick={() => setStatusFilter(statusFilter === 'warn' ? 'all' : 'warn')}
                title="Click to filter by Warnings"
              >
                {summaryCounts.warnings} Warnings
              </button>
              <button
                type="button"
                className={`${styles.badgeBtn} ${styles.badgeFail} ${statusFilter === 'fail' ? styles.badgeActiveFail : ''}`}
                onClick={() => setStatusFilter(statusFilter === 'fail' ? 'all' : 'fail')}
                title="Click to filter by Failed"
              >
                {summaryCounts.failed} Failed
              </button>
            </div>
            <div className={styles.resultActions}>
              <button className={styles.actionBtn} type="button" onClick={copyRecommendations}>Copy Summary</button>
              <button className={styles.actionBtn} type="button" onClick={exportJson}>Export JSON</button>
            </div>
          </div>

          <div className={styles.resultsToolbar}>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Filter results by check name, details, keyword or ID…"
                className={styles.searchInput}
                spellCheck={false}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className={styles.controlsRow}>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel} htmlFor="status-filter">Status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | CheckStatus)}
                  className={styles.selectInput}
                >
                  <option value="all">All Statuses ({results.length})</option>
                  <option value="pass">Passed ({summaryCounts.passed})</option>
                  <option value="warn">Warnings ({summaryCounts.warnings})</option>
                  <option value="fail">Failed ({summaryCounts.failed})</option>
                  <option value="info">Info / Unscored</option>
                </select>
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel} htmlFor="category-filter">Category</label>
                <select
                  id="category-filter"
                  value={activeFilter}
                  onChange={(event) => setActiveFilter(event.target.value as 'all' | keyof typeof CATEGORIES)}
                  className={styles.selectInput}
                >
                  <option value="all">All Categories</option>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel} htmlFor="sort-mode">Sort</label>
                <select
                  id="sort-mode"
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as 'category' | 'status' | 'name' | 'weight')}
                  className={styles.selectInput}
                >
                  <option value="category">Group by category</option>
                  <option value="status">Sort by status (Failures first)</option>
                  <option value="weight">Sort by weight (Highest first)</option>
                  <option value="name">Sort by name (A-Z)</option>
                </select>
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel} htmlFor="view-mode">View</label>
                <select
                  id="view-mode"
                  value={viewMode}
                  onChange={(event) => setViewMode(event.target.value as 'grid' | 'list')}
                  className={styles.selectInput}
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </select>
              </div>
            </div>

            <div className={styles.resultsCountBar}>
              <span className={styles.resultsCountText}>
                Showing <strong>{filteredResults.length}</strong> of <strong>{results.length}</strong> checks
              </span>
              {isFiltered && (
                <button
                  type="button"
                  className={styles.clearFiltersBtn}
                  onClick={clearAllFilters}
                >
                  Clear filters ✕
                </button>
              )}
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <div className={styles.emptyStateCard}>
              <div className={styles.emptyStateIcon}>🔎</div>
              <h3 className={styles.emptyStateTitle}>No matching checks found</h3>
              <p className={styles.emptyStateText}>
                {searchQuery
                  ? `No checks matched your search query "${searchQuery}".`
                  : 'No checks matched your selected filter criteria.'}
              </p>
              <button type="button" className={styles.actionBtn} onClick={clearAllFilters}>
                Reset all filters
              </button>
            </div>
          ) : (
            <div className={`${styles.checksGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
              {Object.entries(groupedResults).map(([category, items]) => (
                <div key={category} className={styles.categoryBlock}>
                  {sortMode === 'category' && CATEGORIES[category] && (
                    <div className={styles.categoryHeader}>
                      <span>{CATEGORIES[category]?.icon || '•'}</span>
                      <span>{CATEGORIES[category]?.label || category}</span>
                    </div>
                  )}
                  <div className={styles.categoryCards}>
                    {items.map((result) => {
                      const def = CHECK_DEFS.find((item) => item.id === result.id);
                      return (
                        <article key={result.id} className={`${styles.checkCard} ${styles[`status_${result.status}`] ?? ''}`}>
                          <div className={styles.checkHead}>
                            <span className={styles.checkStatus}>{STATUS_ICONS[result.status]}</span>
                            <div>
                              <div className={styles.checkName}>{def?.name ?? result.id}</div>
                              <div className={styles.checkMeta}>
                                {formatStatusLabel(result.status)} {def?.weight ? `(weight ${def.weight})` : ''}
                              </div>
                            </div>
                          </div>
                          <p className={styles.checkDesc}>{def?.desc}</p>
                          <div className={styles.checkDetail}>{result.detail}</div>
                          {result.detail_extra && <pre className={styles.detailExtra}>{result.detail_extra}</pre>}
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.recommendationsPanel}>
            <div className={styles.recommendationsHeader}>
              <h3>Recommendations</h3>
              <button className={styles.actionBtn} type="button" onClick={copyRecommendations}>Copy Recommendations</button>
            </div>
            <div className={styles.recommendationsGrid}>
              {results.filter((item) => item.status === 'fail' || item.status === 'warn').map((item) => {
                const def = CHECK_DEFS.find((d) => d.id === item.id);
                return (
                  <div key={item.id} className={styles.recItem}>
                    <div className={styles.recHeading}>{def?.name}</div>
                    <p className={styles.recText}>{getRecommendationText(item.id)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.rawPanel}>
            <div className={styles.rawHeader}>
              <h3>Raw Output</h3>
              <button className={styles.actionBtn} type="button" onClick={() => setRawVisible(!rawVisible)}>{rawVisible ? 'Hide' : 'Show'}</button>
            </div>
            {rawVisible && <pre className={styles.rawOutput}>{JSON.stringify({ url, scannedAt: scannedAt?.toISOString(), score, results, rawData }, null, 2)}</pre>}
          </div>
        </section>
      )}

      {/* METHODOLOGY & HOW THE SCANNER WORKS */}
      <section className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Methodology</span>
          <h2 className={styles.sectionTitle}>How the scanner works</h2>
          <p className={styles.sectionSub}>
            No black box. Exactly what we request, how the score is calculated and — just as importantly — what this scan deliberately does not do.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>01</div>
            <h3 className={styles.stepTitle}>Domain Resolution</h3>
            <p className={styles.stepText}>
              We resolve the domain. Your input is normalised to an origin and we follow redirects, so <code>example.com</code>, <code>www.example.com</code> and an http→https hop all land on the same canonical origin before anything is judged.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>02</div>
            <h3 className={styles.stepTitle}>Fetch Homepage HTML</h3>
            <p className={styles.stepText}>
              We fetch the homepage and read its HTML: title, meta description, canonical link, Open Graph tags, robots meta and any Schema.org JSON-LD.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>03</div>
            <h3 className={styles.stepTitle}>Parallel File Discovery</h3>
            <p className={styles.stepText}>
              We fetch the public discovery files in parallel — <code>/robots.txt</code>, <code>/llms.txt</code>, <code>/llms-full.txt</code>, <code>/sitemap.xml</code>, <code>/ai.txt</code> and <code>/.well-known/ai.txt</code>.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>04</div>
            <h3 className={styles.stepTitle}>Declaration Chains</h3>
            <p className={styles.stepText}>
              We follow what those files point at. If <code>robots.txt</code> declares a sitemap elsewhere, we fetch that too before calling the sitemap missing. If <code>llms.txt</code> is absent on a subdomain, we check the apex before failing it outright.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>05</div>
            <h3 className={styles.stepTitle}>Score and Store</h3>
            <p className={styles.stepText}>
              We score and store. The report is saved so its link stays shareable and the score card image is generated from it on demand.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>06</div>
            <h3 className={styles.stepTitle}>Transparent Requests</h3>
            <p className={styles.stepText}>
              Requests identify themselves honestly as GEOCheckerScan with a link back here, use normal GET requests and cap response bodies. A scan is a handful of requests — roughly what one visitor costs you.
            </p>
          </div>
        </div>
      </section>

      {/* HOW THE SCORE IS CALCULATED & BANDS */}
      <section className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Scoring Engine</span>
          <h2 className={styles.sectionTitle}>How the score is calculated</h2>
          <p className={styles.sectionSub}>
            Nine signals carry weight, summing to 100. A pass earns full weight, a partial result earns half, a failure earns nothing. Informational checks are excluded from the maths entirely, so adopting or ignoring an emerging convention cannot change your number.
          </p>
        </div>

        <div className={styles.scoringTableWrapper}>
          <table className={styles.scoringTable}>
            <thead>
              <tr>
                <th>Signal</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>llms.txt</code></td><td><strong>18</strong></td></tr>
              <tr><td><code>robots.txt AI bots</code></td><td><strong>18</strong></td></tr>
              <tr><td><code>Schema.org JSON-LD</code></td><td><strong>14</strong></td></tr>
              <tr><td><code>Sitemap</code></td><td><strong>12</strong></td></tr>
              <tr><td><code>Title & meta description</code></td><td><strong>10</strong></td></tr>
              <tr><td><code>llms-full.txt</code></td><td><strong>8</strong></td></tr>
              <tr><td><code>Canonical URL</code></td><td><strong>8</strong></td></tr>
              <tr><td><code>Open Graph</code></td><td><strong>6</strong></td></tr>
              <tr><td><code>Indexable page</code></td><td><strong>6</strong></td></tr>
              <tr className={styles.tableTotalRow}><td><strong>Total Weight</strong></td><td><strong>100</strong></td></tr>
            </tbody>
          </table>
        </div>
        <p className={styles.scoringNote}>
          The weights are a judgement, not a physical constant: they reflect how much each signal changes what an AI system can confidently say about you. We publish them so you can disagree with them.
        </p>

        <h3 className={styles.subsectionTitle} style={{ marginTop: '2.5rem' }}>What the bands mean</h3>
        <div className={styles.bandsGrid}>
          <div className={`${styles.bandCard} ${styles.bandStrong}`}>
            <div className={styles.bandHeader}>
              <span className={styles.bandScore}>75–100</span>
              <span className={styles.bandBadge}>Strong</span>
            </div>
            <p className={styles.bandReading}>
              The signals AI engines rely on are in place. Keep them current as the site changes.
            </p>
          </div>

          <div className={`${styles.bandCard} ${styles.bandNeedsWork}`}>
            <div className={styles.bandHeader}>
              <span className={styles.bandScore}>45–74</span>
              <span className={styles.bandBadge}>Needs work</span>
            </div>
            <p className={styles.bandReading}>
              Some signals are missing or ambiguous. Engines can read the site but they are filling gaps with guesses.
            </p>
          </div>

          <div className={`${styles.bandCard} ${styles.bandAtRisk}`}>
            <div className={styles.bandHeader}>
              <span className={styles.bandScore}>0–44</span>
              <span className={styles.bandBadge}>At risk</span>
            </div>
            <p className={styles.bandReading}>
              Core signals are absent or actively blocking. AI engines are largely working without your input.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT WE CHECK (DETAILED SIGNAL REFERENCE) */}
      <section className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Signal Reference</span>
          <h2 className={styles.sectionTitle}>What we check</h2>
          <p className={styles.sectionSub}>
            Every signal the scanner looks at, what it means and what to do when it fails. Nine carry score weight; two are informational. Weights sum to 100. A partial result earns half the weight.
          </p>
        </div>

        <h3 className={styles.subsectionTitle}>Scored checks</h3>
        <div className={styles.signalCardsGrid}>

          <article className={styles.signalDetailCard}>
            <div className={styles.signalHeader}>
              <h4 className={styles.signalName}>llms.txt</h4>
              <span className={styles.signalWeightBadge}>weight 18/100</span>
            </div>
            <div className={styles.signalBlock}>
              <strong>What it is:</strong> A markdown file at <code>/llms.txt</code> that gives AI systems a curated map of your site: what you are and which pages matter.
            </div>
            <div className={styles.signalBlock}>
              <strong>Why it matters:</strong> It is the emerging convention AI crawlers and agents look for when they want an overview rather than a scrape. Without it, engines assemble their understanding of you from whatever HTML they happen to parse — and you lose control of the narrative.
            </div>
            <div className={styles.signalBlock}>
              <strong>How to fix it:</strong> Publish <code>/llms.txt</code> as real markdown: an H1 with your name, a one-line summary in a blockquote, then grouped links with short descriptions. Serve it as <code>text/markdown</code> or <code>text/plain</code> and make sure a missing file returns a real 404 rather than your app shell.
            </div>
            <div className={styles.signalRef}>
              Reference: <a href="https://llmstxt.org/" target="_blank" rel="noreferrer">llmstxt.org/</a>
            </div>
          </article>

          <article className={styles.signalDetailCard}>
            <div className={styles.signalHeader}>
              <h4 className={styles.signalName}>robots.txt AI bots</h4>
              <span className={styles.signalWeightBadge}>weight 18/100</span>
            </div>
            <div className={styles.signalBlock}>
              <strong>What it is:</strong> The rules in <code>/robots.txt</code> that apply to AI crawlers — GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot and others.
            </div>
            <div className={styles.signalBlock}>
              <strong>Why it matters:</strong> Assistants that respect robots.txt decide from this file whether your content can appear in their answers at all. A blanket disallow or rules written years ago for search engines, can silently remove you from AI search entirely.
            </div>
            <div className={styles.signalBlock}>
              <strong>How to fix it:</strong> Add explicit allow rules for the AI agents you want citing you. Being silent is not neutral — it leaves each crawler to apply its own default.
            </div>
            <div className={styles.signalRef}>
              Reference: <a href="https://www.robotstxt.org/" target="_blank" rel="noreferrer">www.robotstxt.org/</a>
            </div>
          </article>

          <article className={styles.signalDetailCard}>
            <div className={styles.signalHeader}>
              <h4 className={styles.signalName}>Schema.org JSON-LD</h4>
              <span className={styles.signalWeightBadge}>weight 14/100</span>
            </div>
            <div className={styles.signalBlock}>
              <strong>What it is:</strong> Structured data embedded in the page as JSON-LD, describing what the page and the organisation behind it actually are.
            </div>
            <div className={styles.signalBlock}>
              <strong>Why it matters:</strong> It is the strongest machine-readable statement of identity you can make. Generative engines lean on it to tell your brand apart from similarly named products — which matters more the more generic your name is.
            </div>
            <div className={styles.signalBlock}>
              <strong>How to fix it:</strong> Add JSON-LD with Organization and WebSite at minimum. Add Product, Article or FAQPage where they genuinely apply.
            </div>
            <div className={styles.signalRef}>
              Reference: <a href="https://schema.org/" target="_blank" rel="noreferrer">schema.org/</a>
            </div>
          </article>

          <article className={styles.signalDetailCard}>
            <div className={styles.signalHeader}>
              <h4 className={styles.signalName}>Sitemap</h4>
              <span className={styles.signalWeightBadge}>weight 12/100</span>
            </div>
            <div className={styles.signalBlock}>
              <strong>What it is:</strong> A valid, reachable <code>sitemap.xml</code> — either at the root or declared in robots.txt.
            </div>
            <div className={styles.signalBlock}>
              <strong>Why it matters:</strong> It is how crawlers, classic and AI alike, find pages beyond whatever is linked from your homepage. A missing or broken sitemap means partial coverage of your content and partial coverage means partial answers.
            </div>
            <div className={styles.signalBlock}>
              <strong>How to fix it:</strong> Serve a valid <code>/sitemap.xml</code> and declare it in robots.txt. We follow the declared URL, so a sitemap index living elsewhere still counts.
            </div>
          </article>

          <article className={styles.signalDetailCard}>
            <div className={styles.signalHeader}>
              <h4 className={styles.signalName}>Title & meta description</h4>
              <span className={styles.signalWeightBadge}>weight 10/100</span>
            </div>
            <div className={styles.signalBlock}>
              <strong>What it is:</strong> The document title and meta description of the page being scanned.
            </div>
            <div className={styles.signalBlock}>
              <strong>Why it matters:</strong> Still the primary snippet source for classic results and a common source for AI citations. Thin or missing descriptions produce vague citations that earn fewer clicks.
            </div>
            <div className={styles.signalBlock}>
              <strong>How to fix it:</strong> Write a descriptive title and a meta description of roughly 50–160 characters that says what the page is, not what the company aspires to be.
            </div>
          </article>

          <article className={styles.signalDetailCard}>
            <div className={styles.signalHeader}>
              <h4 className={styles.signalName}>llms-full.txt</h4>
              <span className={styles.signalWeightBadge}>weight 8/100</span>
            </div>
            <div className={styles.signalBlock}>
              <strong>What it is:</strong> An optional companion to llms.txt carrying extended context — deeper product facts, documentation, positioning.
            </div>
            <div className={styles.signalBlock}>
              <strong>Why it matters:</strong> Where llms.txt is the map, llms-full.txt is the territory. Agents that want detail before answering a question about you have somewhere to find it.
            </div>
            <div className={styles.signalBlock}>
              <strong>How to fix it:</strong> Add <code>/llms-full.txt</code> with the fuller version of your story. Optional but cheap insurance against an engine guessing.
            </div>
            <div className={styles.signalRef}>
              Reference: <a href="https://llmstxt.org/" target="_blank" rel="noreferrer">llmstxt.org/</a>
            </div>
          </article>

          <article className={styles.signalDetailCard}>
            <div className={styles.signalHeader}>
              <h4 className={styles.signalName}>Canonical URL</h4>
              <span className={styles.signalWeightBadge}>weight 8/100</span>
            </div>
            <div className={styles.signalBlock}>
              <strong>What it is:</strong> A <code>link rel=&quot;canonical&quot;</code> declaring the authoritative URL for the page.
            </div>
            <div className={styles.signalBlock}>
              <strong>Why it matters:</strong> Without it, duplicate and parameterised URLs compete with one another and split whatever authority the page earns — in AI indexes as much as classic ones.
            </div>
            <div className={styles.signalBlock}>
              <strong>How to fix it:</strong> Add a canonical link to every significant page, pointing at the URL you want cited.
            </div>
          </article>

          <article className={styles.signalDetailCard}>
            <div className={styles.signalHeader}>
              <h4 className={styles.signalName}>Open Graph</h4>
              <span className={styles.signalWeightBadge}>weight 6/100</span>
            </div>
            <div className={styles.signalBlock}>
              <strong>What it is:</strong> <code>og:title</code>, <code>og:url</code> and <code>og:image</code> metadata.
            </div>
            <div className={styles.signalBlock}>
              <strong>Why it matters:</strong> Open Graph controls how your pages appear when shared and several AI crawlers read it as supplementary metadata. Missing OG data weakens both.
            </div>
            <div className={styles.signalBlock}>
              <strong>How to fix it:</strong> Add <code>og:title</code>, <code>og:url</code> and <code>og:image</code>. Keep them consistent with the page title and canonical URL.
            </div>
          </article>

          <article className={styles.signalDetailCard}>
            <div className={styles.signalHeader}>
              <h4 className={styles.signalName}>Indexable page</h4>
              <span className={styles.signalWeightBadge}>weight 6/100</span>
            </div>
            <div className={styles.signalBlock}>
              <strong>What it is:</strong> Whether the page carries a noindex directive in its robots meta tag.
            </div>
            <div className={styles.signalBlock}>
              <strong>Why it matters:</strong> A noindex removes the page from search and most AI retrieval pipelines. When it is unintentional — a staging rule that shipped to production — it is the single most damaging finding on this list.
            </div>
            <div className={styles.signalBlock}>
              <strong>How to fix it:</strong> Remove noindex from any page that should be discoverable. If you find one here you did not expect, check what else your last deploy carried over from staging.
            </div>
          </article>

        </div>

        <h3 className={styles.subsectionTitle} style={{ marginTop: '2.5rem' }}>Informational checks</h3>
        <p className={styles.sectionSub} style={{ marginBottom: '1.25rem' }}>
          These track emerging conventions. We report them because they cost nothing to adopt and the standards are still forming — but they do not move your score, so an early-stage convention can never make your site look broken.
        </p>

        <div className={styles.signalCardsGrid}>

          <article className={styles.signalDetailCard}>
            <div className={styles.signalHeader}>
              <h4 className={styles.signalName}>ai.txt</h4>
              <span className={styles.signalInfoBadge}>informational, unscored</span>
            </div>
            <div className={styles.signalBlock}>
              <strong>What it is:</strong> A proposed convention at <code>/ai.txt</code> or <code>/.well-known/ai.txt</code> for declaring how your content may be used by AI systems.
            </div>
            <div className={styles.signalBlock}>
              <strong>Why it matters:</strong> Not yet widely consumed, so it does not affect your score. We report it because early, explicit signals cost nothing and the conventions are still settling.
            </div>
            <div className={styles.signalBlock}>
              <strong>How to fix it:</strong> Optional today. Worth adding if you want an unambiguous public statement of AI usage policy.
            </div>
          </article>

          <article className={styles.signalDetailCard}>
            <div className={styles.signalHeader}>
              <h4 className={styles.signalName}>Content-Signal</h4>
              <span className={styles.signalInfoBadge}>informational, unscored</span>
            </div>
            <div className={styles.signalBlock}>
              <strong>What it is:</strong> An emerging robots.txt directive expressing per-purpose permissions — search, AI input, AI training — separately rather than as one all-or-nothing rule.
            </div>
            <div className={styles.signalBlock}>
              <strong>Why it matters:</strong> Informational for now, so it does not move your score. It lets you say &apos;yes to being cited, no to being trained on&apos;, which is the distinction most publishers actually want.
            </div>
            <div className={styles.signalBlock}>
              <strong>How to fix it:</strong> Optional. Add a Content-Signal line to robots.txt if you want to state purposes explicitly to compliant crawlers.
            </div>
          </article>

        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>FAQ</span>
          <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div
              key={faq.q}
              className={`${styles.faqCard} ${activeFaq === index ? styles.faqActive : ''}`}
              onClick={() => setActiveFaq(activeFaq === index ? null : index)}
            >
              <div className={styles.faqQuestionRow}>
                <h4 className={styles.faqQuestion}>{faq.q}</h4>
                <span className={styles.faqIcon}>{activeFaq === index ? '−' : '+'}</span>
              </div>
              {activeFaq === index && (
                <p className={styles.faqAnswer}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
