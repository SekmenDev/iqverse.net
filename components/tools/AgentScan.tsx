'use client';

import { useMemo, useState } from 'react';
import styles from '@/styles/agentscan.module.css';

const PROXY = 'https://api.allorigins.win/get?url=';

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
  { id: 'robots_txt', name: 'robots.txt', category: 'discoverability', desc: 'Checks if the site has a valid robots.txt file at the standard location.', weight: 8 },
  { id: 'sitemap', name: 'XML Sitemap', category: 'discoverability', desc: 'Checks for a sitemap.xml or sitemap reference in robots.txt.', weight: 6 },
  { id: 'link_headers', name: 'Link Response Headers', category: 'discoverability', desc: 'Checks for Link headers (rel=canonical, rel=alternate, rel=me) that aid agent navigation.', weight: 4 },
  { id: 'meta_tags', name: 'Meta Discovery Tags', category: 'discoverability', desc: 'Checks for useful meta tags: description, og:*, twitter:* and rel=alternate.', weight: 4 },
  { id: 'favicon', name: 'Favicon', category: 'discoverability', desc: 'Checks if the site exposes a favicon, useful for agent icon recognition.', weight: 2 },
  { id: 'markdown_negotiation', name: 'Markdown Negotiation', category: 'content', desc: 'Checks if the server supports content negotiation for text/markdown via Accept headers.', weight: 10 },
  { id: 'structured_data', name: 'Structured Data (JSON-LD)', category: 'content', desc: 'Detects JSON-LD, Schema.org or Microdata markup that helps agents understand content semantics.', weight: 7 },
  { id: 'clean_content', name: 'Machine-Readable Content', category: 'content', desc: 'Checks if the main content is accessible without heavy JS rendering.', weight: 5 },
  { id: 'rss_feed', name: 'RSS / Atom Feed', category: 'content', desc: 'Detects RSS or Atom feeds for structured content discovery.', weight: 4 },
  { id: 'ai_bot_rules', name: 'AI Bot Rules in robots.txt', category: 'bot-access', desc: 'Checks for explicit rules targeting known AI crawlers (GPTBot, ClaudeBot, anthropic-ai, etc.).', weight: 8 },
  { id: 'content_signals', name: 'Content Signals Header', category: 'bot-access', desc: 'Checks for the X-Content-Signals or Content-Signals header indicating AI usage permissions.', weight: 6 },
  { id: 'web_bot_auth', name: 'Web Bot Auth', category: 'bot-access', desc: 'Checks for Web Bot Auth headers that authenticate AI bots accessing content.', weight: 5 },
  { id: 'ai_txt', name: 'ai.txt / llms.txt', category: 'bot-access', desc: 'Checks for emerging ai.txt or llms.txt files that specify AI usage policies.', weight: 6 },
  { id: 'mcp_server_card', name: 'MCP Server Card', category: 'protocol', desc: 'Checks for a Model Context Protocol server at /.well-known/mcp.json or /mcp endpoint.', weight: 12 },
  { id: 'a2a_agent_card', name: 'A2A Agent Card', category: 'protocol', desc: 'Checks for an Agent-to-Agent card at /.well-known/agent.json.', weight: 8 },
  { id: 'oauth_discovery', name: 'OAuth Discovery', category: 'protocol', desc: 'Checks for OAuth 2.0 server metadata at /.well-known/oauth-authorization-server.', weight: 7 },
  { id: 'oauth_protected_resource', name: 'OAuth Protected Resource', category: 'protocol', desc: 'Checks for RFC 9728 protected resource metadata at /.well-known/oauth-protected-resource.', weight: 6 },
  { id: 'api_catalog', name: 'API Catalog / OpenAPI', category: 'protocol', desc: 'Checks for OpenAPI spec at /openapi.json, /api-docs, /swagger.json or API catalog.', weight: 8 },
  { id: 'agent_skills', name: 'Agent Skills', category: 'protocol', desc: 'Checks for an Agent Skills manifest at /.well-known/agent-skills.json.', weight: 7 },
  { id: 'webmcp', name: 'WebMCP', category: 'protocol', desc: 'Checks for WebMCP discovery at /webmcp or /.well-known/webmcp.json.', weight: 7 },
  { id: 'x402', name: 'x402 Payment Protocol', category: 'commerce', desc: 'Checks for HTTP 402 responses or x402 headers enabling AI agent micropayments.', weight: 7 },
  { id: 'ucp', name: 'Universal Commerce Protocol (UCP)', category: 'commerce', desc: 'Checks for UCP discovery at /.well-known/ucp.json.', weight: 5 },
  { id: 'acp', name: 'Agentic Commerce Protocol (ACP)', category: 'commerce', desc: 'Checks for ACP metadata at /.well-known/acp.json.', weight: 5 },
  { id: 'https', name: 'HTTPS', category: 'performance', desc: 'Confirms the site is served over HTTPS, a prerequisite for trusted agent access.', weight: 5 },
  { id: 'hsts', name: 'HSTS Header', category: 'performance', desc: 'Checks for Strict-Transport-Security header.', weight: 3 },
  { id: 'security_headers', name: 'Security Headers', category: 'performance', desc: 'Checks for X-Content-Type-Options, X-Frame-Options, CSP and other security headers.', weight: 3 },
  { id: 'cors_headers', name: 'CORS Headers', category: 'performance', desc: 'Checks for Access-Control-Allow-Origin headers needed for cross-origin API access by agents.', weight: 4 },
  { id: 'response_time', name: 'Response Time', category: 'performance', desc: 'Measures how fast the site responds. Important for agent workflows with tight timeouts.', weight: 4 },
];

const CATEGORIES: Record<string, { label: string; icon: string }> = {
  discoverability: { label: 'Discoverability', icon: '🔍' },
  content: { label: 'Content', icon: '📄' },
  'bot-access': { label: 'Bot Access', icon: '🤖' },
  protocol: { label: 'Protocol / MCP', icon: '🔌' },
  commerce: { label: 'Commerce', icon: '💳' },
  performance: { label: 'Performance', icon: '⚡' },
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

function getHeader(headers: Record<string, string>, name: string) {
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : null;
}

function formatStatusLabel(status: CheckStatus) {
  switch (status) {
    case 'pass':
      return 'Passed';
    case 'warn':
      return 'Warning';
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
    robots_txt: 'Create a /robots.txt file and expose your sitemap.',
    sitemap: 'Create a sitemap.xml and reference it from robots.txt.',
    ai_bot_rules: 'Add explicit AI bot rules for GPTBot, ClaudeBot, and anthropic-ai.',
    mcp_server_card: 'Publish /.well-known/mcp.json for MCP discovery.',
    markdown_negotiation: 'Support text/markdown content negotiation via Accept headers.',
    structured_data: 'Add JSON-LD or Schema markup to help agents understand your content.',
    a2a_agent_card: 'Publish /.well-known/agent.json for A2A agent discovery.',
    oauth_discovery: 'Expose OAuth server metadata at /.well-known/oauth-authorization-server.',
    api_catalog: 'Publish an OpenAPI or Swagger spec for your API endpoints.',
    ai_txt: 'Add ai.txt or llms.txt to document AI usage policy.',
    https: 'Serve your site over HTTPS.',
    hsts: 'Add Strict-Transport-Security headers.',
    content_signals: 'Add Content-Signals headers for AI usage permissions.',
    security_headers: 'Add X-Content-Type-Options, X-Frame-Options, and CSP headers.',
    cors_headers: 'Add Access-Control-Allow-Origin header for cross-origin API access.',
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortMode, setSortMode] = useState<'category' | 'status' | 'name'>('category');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [rawVisible, setRawVisible] = useState(false);

  const filteredResults = useMemo(() => {
    const filtered = activeFilter === 'all'
      ? results
      : results.filter((result) => {
          const def = CHECK_DEFS.find((item) => item.id === result.id);
          return def?.category === activeFilter;
        });

    if (sortMode === 'name') {
      return [...filtered].sort((a, b) => {
        const aName = CHECK_DEFS.find((item) => item.id === a.id)?.name || a.id;
        const bName = CHECK_DEFS.find((item) => item.id === b.id)?.name || b.id;
        return aName.localeCompare(bName);
      });
    }

    if (sortMode === 'status') {
      const order: Record<CheckStatus, number> = { fail: 0, warn: 1, info: 2, pass: 3, skip: 4 };
      return [...filtered].sort((a, b) => order[a.status] - order[b.status]);
    }

    return filtered;
  }, [activeFilter, results, sortMode]);

  const score = useMemo(() => {
    let total = 0;
    let earned = 0;
    for (const def of CHECK_DEFS) {
      const result = results.find((item) => item.id === def.id);
      if (!result || result.status === 'skip') continue;
      total += def.weight;
      if (result.status === 'pass') earned += def.weight;
      else if (result.status === 'warn') earned += def.weight * 0.5;
      else if (result.status === 'info') earned += def.weight * 0.25;
    }
    return total ? Math.round((earned / total) * 100) : 0;
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
      const response = await fetch(proxyUrl, { signal: controller.signal });
      const json = await response.json();
      return {
        ok: json.status?.http_code < 400,
        status: json.status?.http_code ?? 0,
        body: json.contents ?? '',
        headers: json.status?.response_headers ?? {},
        latency: Math.round(performance.now() - startedAt),
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
    updateStatus('Fetching site resources…');

    const responses = await Promise.all([
      proxyFetch(origin),
      proxyFetch(`${origin}/robots.txt`),
      proxyFetch(`${origin}/sitemap.xml`),
      proxyFetch(`${origin}/.well-known/mcp.json`),
      proxyFetch(`${origin}/.well-known/agent.json`),
      proxyFetch(`${origin}/.well-known/oauth-authorization-server`),
      proxyFetch(`${origin}/.well-known/oauth-protected-resource`),
      proxyFetch(`${origin}/openapi.json`),
      proxyFetch(`${origin}/swagger.json`),
      proxyFetch(`${origin}/api-docs`),
      proxyFetch(`${origin}/.well-known/agent-skills.json`),
      proxyFetch(`${origin}/.well-known/webmcp.json`),
      proxyFetch(`${origin}/webmcp`),
      proxyFetch(`${origin}/.well-known/x402.json`),
      proxyFetch(`${origin}/.well-known/ucp.json`),
      proxyFetch(`${origin}/.well-known/acp.json`),
      proxyFetch(`${origin}/ai.txt`),
      proxyFetch(`${origin}/llms.txt`),
    ]);

    const [homepageRes, robotsRes, sitemapRes, mcpRes, agentRes, oauthRes, oauthProtRes, openApiRes, swaggerRes, apiDocsRes, agentSkillsRes, webmcpJsonRes, webmcpRes, x402Res, ucpRes, acpRes, aiTxtRes, llmsTxtRes] = responses;

    setRawData({
      homepage: homepageRes,
      robots: robotsRes,
      sitemap: sitemapRes,
      mcp: mcpRes,
      agent: agentRes,
      oauth: oauthRes,
      oauthProtected: oauthProtRes,
      openapi: openApiRes,
      swagger: swaggerRes,
      apiDocs: apiDocsRes,
      agentSkills: agentSkillsRes,
      webmcpJson: webmcpJsonRes,
      webmcp: webmcpRes,
      x402: x402Res,
      ucp: ucpRes,
      acp: acpRes,
      aiTxt: aiTxtRes,
      llmsTxt: llmsTxtRes,
    });

    const robotsBody = robotsRes.body || '';
    const homepageHtml = homepageRes.body || '';

    const addResult = (id: string, status: CheckStatus, detail: string, extra?: Partial<CheckResult>) => {
      resultsBuffer.push({ id, status, detail, ...extra });
    };

    addResult('https', normalizedUrl.startsWith('https://') ? 'pass' : 'fail', normalizedUrl.startsWith('https://') ? 'Site is served over HTTPS.' : 'Site is not using HTTPS.');

    const hasRobots = robotsRes.ok && /user-agent/i.test(robotsBody);
    addResult('robots_txt', hasRobots ? 'pass' : robotsRes.status === 404 ? 'fail' : 'warn', hasRobots ? 'robots.txt found.' : robotsRes.status === 404 ? 'No robots.txt found.' : `robots.txt unreachable (HTTP ${robotsRes.status}).`, {
      detail_extra: hasRobots ? robotsBody.slice(0, 300) : undefined,
    });

    const hasSitemap = sitemapRes.ok && sitemapRes.body.includes('<urlset');
    const sitemapRef = /sitemap:/i.test(robotsBody);
    addResult('sitemap', hasSitemap ? 'pass' : sitemapRef ? 'warn' : 'fail', hasSitemap ? 'sitemap.xml found.' : sitemapRef ? 'Sitemap referenced in robots.txt but sitemap.xml could not be fetched.' : 'No sitemap.xml found.');

    const linkHeader = getHeader(homepageRes.headers, 'link') || '';
    addResult('link_headers', linkHeader ? 'pass' : 'info', linkHeader ? `Link header present: ${linkHeader}` : 'No Link response headers detected.');

    const hasDescription = /<meta[^>]+name=["']description["']/i.test(homepageHtml);
    const hasOg = /<meta[^>]+property=["']og:/i.test(homepageHtml);
    const hasTwitter = /<meta[^>]+name=["']twitter:/i.test(homepageHtml);
    const metaScore = [hasDescription, hasOg, hasTwitter].filter(Boolean).length;
    addResult('meta_tags', metaScore >= 2 ? 'pass' : metaScore === 1 ? 'warn' : 'fail', metaScore >= 2 ? 'Meta and social discovery tags detected.' : metaScore === 1 ? 'Some discovery meta tags found.' : 'No description, Open Graph, or Twitter metadata found.');

    const hasFavicon = /favicon/i.test(homepageHtml) || /<link[^>]+rel=["']icon["']/i.test(homepageHtml);
    addResult('favicon', hasFavicon ? 'pass' : 'warn', hasFavicon ? 'Favicon detected.' : 'No favicon link tag detected in HTML.');

    updateStatus('Checking content and bot signals…');

    const mdRes = await proxyFetch(`${normalizedUrl}?_format=markdown`);
    const acceptsMarkdown = mdRes.ok && (/markdown|text\/markdown/i.test(getHeader(mdRes.headers, 'content-type') || '') || /^#/.test(mdRes.body || ''));
    addResult('markdown_negotiation', acceptsMarkdown ? 'pass' : 'fail', acceptsMarkdown ? 'Markdown content negotiation appears supported.' : 'No Markdown content negotiation detected.');

    const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(homepageHtml);
    const hasMicrodata = /itemscope|itemtype/i.test(homepageHtml);
    addResult('structured_data', hasJsonLd ? 'pass' : hasMicrodata ? 'warn' : 'fail', hasJsonLd ? 'JSON-LD structured data detected.' : hasMicrodata ? 'Microdata attributes detected without JSON-LD.' : 'No structured data detected.');

    const bodyText = homepageHtml.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    addResult('clean_content', bodyText.length > 200 ? 'pass' : 'warn', bodyText.length > 200 ? `${bodyText.length} characters of text content found.` : 'Very little visible page content found without rendering.');

    const hasRss = /<link[^>]+type=["']application\/(rss|atom)\+xml["']/i.test(homepageHtml) || /<a[^>]+href=["'][^"']*feed[^"']*["']/i.test(homepageHtml);
    addResult('rss_feed', hasRss ? 'pass' : 'info', hasRss ? 'RSS or Atom feed detected.' : 'No RSS/Atom feed detected.');

    const knownBots = ['GPTBot', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'Bingbot', 'Applebot'];
    const foundBots = knownBots.filter((bot) => new RegExp(bot, 'i').test(robotsBody));
    addResult('ai_bot_rules', foundBots.length > 0 ? 'pass' : 'fail', foundBots.length > 0 ? `AI bot rules found: ${foundBots.join(', ')}.` : 'No AI-specific bot rules found in robots.txt.', {
      detail_extra: foundBots.length > 0 ? robotsBody.match(/(?:GPTBot|ClaudeBot|anthropic-ai|PerplexityBot|Bingbot|Applebot)[^\n]*/gi)?.join('\n') : undefined,
    });

    const contentSignals = getHeader(homepageRes.headers, 'x-content-signals') || getHeader(homepageRes.headers, 'content-signals');
    addResult('content_signals', contentSignals ? 'pass' : 'fail', contentSignals ? `Content-Signals header present: ${contentSignals}` : 'No Content-Signals header found.');

    const webBotAuth = getHeader(homepageRes.headers, 'x-bot-auth') || getHeader(homepageRes.headers, 'web-bot-auth');
    addResult('web_bot_auth', webBotAuth ? 'pass' : 'fail', webBotAuth ? `Web Bot Auth header present: ${webBotAuth}` : 'No Web Bot Auth header detected.');

    const hasAiTxt = aiTxtRes.ok && aiTxtRes.body.length > 10;
    const hasLlmsTxt = llmsTxtRes.ok && llmsTxtRes.body.length > 10;
    addResult('ai_txt', hasAiTxt || hasLlmsTxt ? 'pass' : 'fail', hasAiTxt ? 'ai.txt detected.' : hasLlmsTxt ? 'llms.txt detected.' : 'No ai.txt or llms.txt found.');

    updateStatus('Probing protocol endpoints…');

    const parseJson = (res: FetchResult) => {
      try {
        return JSON.parse(res.body);
      } catch {
        return null;
      }
    };

    const mcpData = parseJson(mcpRes);
    addResult('mcp_server_card', mcpRes.ok && mcpData ? 'pass' : 'fail', mcpData ? 'MCP server card found.' : 'No MCP Server Card found.');

    const agentData = parseJson(agentRes);
    addResult('a2a_agent_card', agentRes.ok && agentData ? 'pass' : 'fail', agentData ? 'A2A Agent Card found.' : 'No A2A Agent Card found.');

    const oauthData = parseJson(oauthRes);
    addResult('oauth_discovery', oauthRes.ok && oauthData ? 'pass' : 'fail', oauthData ? 'OAuth server metadata found.' : 'No OAuth discovery metadata found.');

    const oauthProtData = parseJson(oauthProtRes);
    addResult('oauth_protected_resource', oauthProtRes.ok && oauthProtData ? 'pass' : 'fail', oauthProtData ? 'Protected resource metadata found.' : 'No OAuth Protected Resource metadata found.');

    const openApiFound = openApiRes.ok || swaggerRes.ok || apiDocsRes.ok;
    addResult('api_catalog', openApiFound ? 'pass' : 'fail', openApiFound ? 'OpenAPI/Swagger spec found.' : 'No API catalog or OpenAPI spec found.');

    const agentSkillsData = parseJson(agentSkillsRes);
    addResult('agent_skills', agentSkillsRes.ok && agentSkillsData ? 'pass' : 'fail', agentSkillsData ? 'Agent Skills manifest found.' : 'No Agent Skills manifest found.');

    const webmcpFound = webmcpJsonRes.ok || webmcpRes.ok;
    addResult('webmcp', webmcpFound ? 'pass' : 'fail', webmcpFound ? 'WebMCP endpoint found.' : 'No WebMCP endpoint found.');

    updateStatus('Checking commerce signals…');

    const x402Data = parseJson(x402Res);
    addResult('x402', x402Res.ok && x402Data ? 'pass' : 'fail', x402Data ? 'x402 payment protocol detected.' : 'No x402 payment protocol metadata found.');

    const ucpData = parseJson(ucpRes);
    addResult('ucp', ucpRes.ok && ucpData ? 'pass' : 'fail', ucpData ? 'UCP metadata found.' : 'No UCP metadata found.');

    const acpData = parseJson(acpRes);
    addResult('acp', acpRes.ok && acpData ? 'pass' : 'fail', acpData ? 'ACP metadata found.' : 'No ACP metadata found.');

    updateStatus('Assessing security headers…');

    const hstsHeader = getHeader(homepageRes.headers, 'strict-transport-security');
    addResult('hsts', hstsHeader ? 'pass' : 'warn', hstsHeader ? 'HSTS header present.' : 'No HSTS header found.');

    const cspHeader = getHeader(homepageRes.headers, 'content-security-policy');
    const xctoHeader = getHeader(homepageRes.headers, 'x-content-type-options');
    const xfoHeader = getHeader(homepageRes.headers, 'x-frame-options');
    const securityCount = [cspHeader, xctoHeader, xfoHeader].filter(Boolean).length;
    addResult('security_headers', securityCount >= 2 ? 'pass' : securityCount === 1 ? 'warn' : 'fail', securityCount >= 2 ? 'Multiple security headers detected.' : securityCount === 1 ? 'Only one security header detected.' : 'No security headers detected.');

    const corsHeader = getHeader(homepageRes.headers, 'access-control-allow-origin');
    addResult('cors_headers', corsHeader ? 'pass' : 'warn', corsHeader ? `CORS enabled: ${corsHeader}` : 'No CORS header detected on the homepage.');

    const responseTime = homepageRes.latency;
    addResult('response_time', responseTime < 1000 ? 'pass' : responseTime < 3000 ? 'warn' : 'fail', `Response time: ${responseTime}ms.`, { latency: responseTime });

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
    return filteredResults.reduce<Record<string, CheckResult[]>>((acc, item) => {
      const category = CHECK_DEFS.find((def) => def.id === item.id)?.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
  }, [filteredResults]);

  return (
    <div className={styles.agentScanContainer}>
      <section className={styles.heroSection}>
        <div className={styles.heroLabel}>AI Agent Readiness Scanner</div>
        <h2 className={styles.heroTitle}>Is your site agent-ready?</h2>
        <p className={styles.heroCopy}>
          Scan any website to discover how compatible it is with AI agents. We check robots.txt, sitemap, MCP, OAuth, markdown negotiation, commerce signals, security headers and more.
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
                  {filter === 'all' ? 'All' : CATEGORIES[filter].label}
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

      {results.length > 0 && (
        <section className={styles.resultsSection}>
          <div className={styles.scorePanel}>
            <div>
              <div className={styles.scoreLabel}>Score</div>
              <div className={styles.scoreValue}>{score}</div>
              <div className={styles.scoreSubtitle}>{scannedAt ? `Scanned at ${scannedAt.toLocaleTimeString()}` : 'Scan complete'}</div>
            </div>
            <div className={styles.badges}>
              <span className={styles.badge}>{summaryCounts.passed} Passed</span>
              <span className={styles.badgeWarning}>{summaryCounts.warnings} Warnings</span>
              <span className={styles.badgeFail}>{summaryCounts.failed} Failed</span>
            </div>
            <div className={styles.resultActions}>
              <button className={styles.actionBtn} type="button" onClick={copyRecommendations}>Copy Summary</button>
              <button className={styles.actionBtn} type="button" onClick={exportJson}>Export JSON</button>
            </div>
          </div>

          <div className={styles.controlsRow}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>View</label>
              <select value={viewMode} onChange={(event) => setViewMode(event.target.value as 'grid' | 'list')} className={styles.selectInput}>
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Sort</label>
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value as 'category' | 'status' | 'name')} className={styles.selectInput}>
                <option value="category">Group by category</option>
                <option value="status">Sort by status</option>
                <option value="name">Sort by name</option>
              </select>
            </div>
          </div>

          <div className={`${styles.checksGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
            {Object.entries(groupedResults).map(([category, items]) => (
              <div key={category} className={styles.categoryBlock}>
                <div className={styles.categoryHeader}>
                  <span>{CATEGORIES[category]?.icon || '•'}</span>
                  <span>{CATEGORIES[category]?.label || category}</span>
                </div>
                <div className={styles.categoryCards}>
                  {items.map((result) => {
                    const def = CHECK_DEFS.find((item) => item.id === result.id);
                    return (
                      <article key={result.id} className={`${styles.checkCard} ${styles[`status_${result.status}`] ?? ''}`}>
                        <div className={styles.checkHead}>
                          <span className={styles.checkStatus}>{STATUS_ICONS[result.status]}</span>
                          <div>
                            <div className={styles.checkName}>{def?.name ?? result.id}</div>
                            <div className={styles.checkMeta}>{formatStatusLabel(result.status)}</div>
                          </div>
                        </div>
                        <p className={styles.checkDesc}>{def?.desc}</p>
                        <div className={styles.checkDetail}>{result.detail}</div>
                        {result.detail_extra && <pre className={styles.detailExtra}>{result.detail_extra}</pre>}
                        {result.latency != null && <div className={styles.checkLatency}>{result.latency}ms</div>}
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

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
    </div>
  );
}
