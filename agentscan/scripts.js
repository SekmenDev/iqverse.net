/* ============================================================
   AgentScan — app.js
   AI Agent Readiness Scanner
   Checks: robots.txt, sitemap, MCP, OAuth, Markdown,
           agent commerce, security headers and more.
   Uses allorigins.win as CORS proxy.
   ============================================================ */

"use strict";

const PROXY = "https://api.allorigins.win/get?url=";

// ── Check Definitions ──────────────────────────────────────
const CHECK_DEFS = [
	// DISCOVERABILITY
	{
		id: "robots_txt",
		name: "robots.txt",
		category: "discoverability",
		desc: "Checks if the site has a valid robots.txt file at the standard location.",
		weight: 8,
	},
	{
		id: "sitemap",
		name: "XML Sitemap",
		category: "discoverability",
		desc: "Checks for a sitemap.xml or sitemap reference in robots.txt.",
		weight: 6,
	},
	{
		id: "link_headers",
		name: "Link Response Headers",
		category: "discoverability",
		desc: "Checks for Link headers (rel=canonical, rel=alternate, rel=me) that aid agent navigation.",
		weight: 4,
	},
	{
		id: "meta_tags",
		name: "Meta Discovery Tags",
		category: "discoverability",
		desc: "Checks for useful meta tags: description, og:*, twitter:* and rel=alternate.",
		weight: 4,
	},
	{
		id: "favicon",
		name: "Favicon",
		category: "discoverability",
		desc: "Checks if the site exposes a favicon, useful for agent icon recognition.",
		weight: 2,
	},

	// CONTENT ACCESSIBILITY
	{
		id: "markdown_negotiation",
		name: "Markdown Negotiation",
		category: "content",
		desc: "Checks if the server supports content negotiation for text/markdown via Accept headers.",
		weight: 10,
	},
	{
		id: "structured_data",
		name: "Structured Data (JSON-LD)",
		category: "content",
		desc: "Detects JSON-LD, Schema.org or Microdata markup that helps agents understand content semantics.",
		weight: 7,
	},
	{
		id: "clean_content",
		name: "Machine-Readable Content",
		category: "content",
		desc: "Checks if the main content is accessible without heavy JS rendering.",
		weight: 5,
	},
	{
		id: "rss_feed",
		name: "RSS / Atom Feed",
		category: "content",
		desc: "Detects RSS or Atom feeds for structured content discovery.",
		weight: 4,
	},

	// BOT ACCESS CONTROL
	{
		id: "ai_bot_rules",
		name: "AI Bot Rules in robots.txt",
		category: "bot-access",
		desc: "Checks for explicit rules targeting known AI crawlers (GPTBot, ClaudeBot, anthropic-ai, etc.).",
		weight: 8,
	},
	{
		id: "content_signals",
		name: "Content Signals Header",
		category: "bot-access",
		desc: "Checks for the X-Content-Signals or Content-Signals header indicating AI usage permissions.",
		weight: 6,
	},
	{
		id: "web_bot_auth",
		name: "Web Bot Auth",
		category: "bot-access",
		desc: "Checks for Web Bot Auth headers that authenticate AI bots accessing content.",
		weight: 5,
	},
	{
		id: "ai_txt",
		name: "ai.txt / llms.txt",
		category: "bot-access",
		desc: "Checks for emerging ai.txt or llms.txt files that specify AI usage policies.",
		weight: 6,
	},

	// PROTOCOL / MCP
	{
		id: "mcp_server_card",
		name: "MCP Server Card",
		category: "protocol",
		desc: "Checks for a Model Context Protocol server at /.well-known/mcp.json or /mcp endpoint.",
		weight: 12,
	},
	{
		id: "a2a_agent_card",
		name: "A2A Agent Card",
		category: "protocol",
		desc: "Checks for an Agent-to-Agent card at /.well-known/agent.json.",
		weight: 8,
	},
	{
		id: "oauth_discovery",
		name: "OAuth Discovery",
		category: "protocol",
		desc: "Checks for OAuth 2.0 server metadata at /.well-known/oauth-authorization-server.",
		weight: 7,
	},
	{
		id: "oauth_protected_resource",
		name: "OAuth Protected Resource",
		category: "protocol",
		desc: "Checks for RFC 9728 protected resource metadata at /.well-known/oauth-protected-resource.",
		weight: 6,
	},
	{
		id: "api_catalog",
		name: "API Catalog / OpenAPI",
		category: "protocol",
		desc: "Checks for OpenAPI spec at /openapi.json, /api-docs, /swagger.json or API catalog.",
		weight: 8,
	},
	{
		id: "agent_skills",
		name: "Agent Skills",
		category: "protocol",
		desc: "Checks for an Agent Skills manifest at /.well-known/agent-skills.json.",
		weight: 7,
	},
	{
		id: "webmcp",
		name: "WebMCP",
		category: "protocol",
		desc: "Checks for WebMCP discovery at /webmcp or /.well-known/webmcp.json.",
		weight: 7,
	},

	// COMMERCE
	{
		id: "x402",
		name: "x402 Payment Protocol",
		category: "commerce",
		desc: "Checks for HTTP 402 responses or x402 headers enabling AI agent micropayments.",
		weight: 7,
	},
	{
		id: "ucp",
		name: "Universal Commerce Protocol (UCP)",
		category: "commerce",
		desc: "Checks for UCP discovery at /.well-known/ucp.json.",
		weight: 5,
	},
	{
		id: "acp",
		name: "Agentic Commerce Protocol (ACP)",
		category: "commerce",
		desc: "Checks for ACP metadata at /.well-known/acp.json.",
		weight: 5,
	},

	// PERFORMANCE / SECURITY
	{
		id: "https",
		name: "HTTPS",
		category: "performance",
		desc: "Confirms the site is served over HTTPS, a prerequisite for trusted agent access.",
		weight: 5,
	},
	{
		id: "hsts",
		name: "HSTS Header",
		category: "performance",
		desc: "Checks for Strict-Transport-Security header.",
		weight: 3,
	},
	{
		id: "security_headers",
		name: "Security Headers",
		category: "performance",
		desc: "Checks for X-Content-Type-Options, X-Frame-Options, CSP and other security headers.",
		weight: 3,
	},
	{
		id: "cors_headers",
		name: "CORS Headers",
		category: "performance",
		desc: "Checks for Access-Control-Allow-Origin headers needed for cross-origin API access by agents.",
		weight: 4,
	},
	{
		id: "response_time",
		name: "Response Time",
		category: "performance",
		desc: "Measures how fast the site responds — important for agent workflows with tight timeouts.",
		weight: 4,
	},
];

const CATEGORIES = {
	discoverability: { label: "Discoverability", icon: "🔍" },
	content: { label: "Content", icon: "📄" },
	"bot-access": { label: "Bot Access", icon: "🤖" },
	protocol: { label: "Protocol / MCP", icon: "🔌" },
	commerce: { label: "Commerce", icon: "💳" },
	performance: { label: "Performance", icon: "⚡" },
};

const STATUS_ICONS = {
	pass: "✓",
	fail: "✗",
	warn: "⚠",
	info: "ℹ",
	skip: "—",
};

// ── State ──────────────────────────────────────────────────
let state = {
	url: "",
	results: [],
	rawData: {},
	scannedAt: null,
	activeFilter: "all",
	viewMode: "grid",
	sortMode: "category",
};

// ── DOM Refs ───────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const urlInput = $("urlInput");
const scanBtn = $("scanBtn");
const clearBtn = $("clearBtn");
const resultsSection = $("resultsSection");
const loadingOverlay = $("loadingOverlay");
const loadingLabel = $("loadingLabel");
const loadingBar = $("loadingBar");
const loadingChecks = $("loadingChecks");

// ── Init ───────────────────────────────────────────────────
function init() {
	urlInput.addEventListener("input", onInputChange);
	urlInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") startScan();
	});
	scanBtn.addEventListener("click", startScan);
	clearBtn.addEventListener("click", clearInput);

	document.querySelectorAll(".filter-pill").forEach((pill) => {
		pill.addEventListener("click", () => {
			document.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
			pill.classList.add("active");
			state.activeFilter = pill.dataset.filter;
			renderChecks();
		});
	});

	document.querySelectorAll(".example-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			urlInput.value = btn.dataset.url;
			onInputChange();
			startScan();
		});
	});

	$("viewGrid").addEventListener("click", () => setView("grid"));
	$("viewList").addEventListener("click", () => setView("list"));
	$("sortSelect").addEventListener("change", (e) => {
		state.sortMode = e.target.value;
		renderChecks();
	});
	$("rescanBtn").addEventListener("click", startScan);
	$("newScanBtn").addEventListener("click", () => {
		resultsSection.style.display = "none";
		urlInput.value = "";
		onInputChange();
		window.scrollTo({ top: 0, behavior: "smooth" });
	});
	$("exportBtn").addEventListener("click", exportJSON);
	$("copyRecBtn").addEventListener("click", copyRecommendations);
	$("rawToggleBtn").addEventListener("click", toggleRaw);
}

function onInputChange() {
	const val = urlInput.value.trim();
	clearBtn.style.display = val ? "flex" : "none";
}

function clearInput() {
	urlInput.value = "";
	clearBtn.style.display = "none";
	urlInput.focus();
}

function setView(mode) {
	state.viewMode = mode;
	$("viewGrid").classList.toggle("active", mode === "grid");
	$("viewList").classList.toggle("active", mode === "list");
	const grid = $("checksGrid");
	grid.classList.toggle("list-view", mode === "list");
}

// ── Scan ───────────────────────────────────────────────────
async function startScan() {
	let raw = urlInput.value.trim();
	if (!raw) {
		urlInput.focus();
		return;
	}
	if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
	urlInput.value = raw;
	onInputChange();

	state.url = raw;
	state.results = [];
	state.rawData = {};
	state.scannedAt = new Date();

	showLoading(true);
	scanBtn.disabled = true;

	try {
		await runAllChecks(raw);
	} catch (e) {
		console.error("Scan error:", e);
	}

	showLoading(false);
	scanBtn.disabled = false;
	renderResults();
}

// ── Loading UI ─────────────────────────────────────────────
let loadingMessages = [
	"Fetching robots.txt…",
	"Checking sitemap…",
	"Probing MCP endpoints…",
	"Testing OAuth discovery…",
	"Checking AI bot rules…",
	"Scanning protocol endpoints…",
	"Testing commerce signals…",
	"Measuring response times…",
	"Analyzing security headers…",
	"Compiling results…",
];

function showLoading(show) {
	loadingOverlay.style.display = show ? "flex" : "none";
	if (show) {
		loadingBar.style.width = "0%";
		loadingChecks.innerHTML = "";
	}
}

function updateLoadingProgress(pct, label) {
	loadingBar.style.width = pct + "%";
	loadingLabel.textContent = label;
}

function addLoadingCheck(text, status = "done") {
	const item = document.createElement("div");
	item.className = `loading-check-item ${status}`;
	item.innerHTML = `<span>${status === "done" ? "✓" : status === "fail" ? "✗" : "…"}</span><span>${text}</span>`;
	loadingChecks.appendChild(item);
	loadingChecks.scrollTop = loadingChecks.scrollHeight;
}

// ── Fetch Helpers ──────────────────────────────────────────
async function proxyFetch(url, timeoutMs = 8000) {
	const proxyUrl = PROXY + encodeURIComponent(url);
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeoutMs);
	const t0 = Date.now();
	try {
		const res = await fetch(proxyUrl, { signal: ctrl.signal });
		clearTimeout(timer);
		const data = await res.json();
		return {
			ok: data.status && data.status.http_code < 400,
			status: data.status?.http_code ?? 0,
			body: data.contents ?? "",
			headers: data.status?.response_headers ?? {},
			latency: Date.now() - t0,
		};
	} catch (e) {
		clearTimeout(timer);
		return { ok: false, status: 0, body: "", headers: {}, latency: Date.now() - t0, error: e.message };
	}
}

function getHeader(headers, name) {
	const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
	return key ? headers[key] : null;
}

// ── All Checks ─────────────────────────────────────────────
async function runAllChecks(url) {
	const origin = new URL(url).origin;
	const total = CHECK_DEFS.length;
	let done = 0;

	const addResult = (id, status, detail, extra = {}) => {
		state.results.push({ id, status, detail, ...extra });
		done++;
		updateLoadingProgress(Math.round((done / total) * 100), CHECK_DEFS.find((c) => c.id === id)?.name ?? id);
	};

	// ── Fetch primary resources in parallel ──
	updateLoadingProgress(5, "Fetching site resources…");
	const [
		homepageRes,
		robotsRes,
		sitemapRes,
		mcpWellKnownRes,
		agentCardRes,
		oauthRes,
		oauthProtRes,
		openApiRes,
		openApiAlt1,
		openApiAlt2,
		agentSkillsRes,
		webmcpRes,
		webmcpAlt,
		x402Res,
		ucpRes,
		acpRes,
		aitxtRes,
		llmstxtRes,
	] = await Promise.all([
		proxyFetch(origin),
		proxyFetch(origin + "/robots.txt"),
		proxyFetch(origin + "/sitemap.xml"),
		proxyFetch(origin + "/.well-known/mcp.json"),
		proxyFetch(origin + "/.well-known/agent.json"),
		proxyFetch(origin + "/.well-known/oauth-authorization-server"),
		proxyFetch(origin + "/.well-known/oauth-protected-resource"),
		proxyFetch(origin + "/openapi.json"),
		proxyFetch(origin + "/swagger.json"),
		proxyFetch(origin + "/api-docs"),
		proxyFetch(origin + "/.well-known/agent-skills.json"),
		proxyFetch(origin + "/.well-known/webmcp.json"),
		proxyFetch(origin + "/webmcp"),
		proxyFetch(origin + "/.well-known/x402.json"),
		proxyFetch(origin + "/.well-known/ucp.json"),
		proxyFetch(origin + "/.well-known/acp.json"),
		proxyFetch(origin + "/ai.txt"),
		proxyFetch(origin + "/llms.txt"),
	]);

	state.rawData = {
		homepage: { status: homepageRes.status, latency: homepageRes.latency },
		robots: { status: robotsRes.status, body_preview: robotsRes.body?.slice(0, 500) },
		sitemap: { status: sitemapRes.status },
		mcp: { status: mcpWellKnownRes.status, body_preview: mcpWellKnownRes.body?.slice(0, 500) },
		agent_card: { status: agentCardRes.status },
		oauth: { status: oauthRes.status },
		openapi: { status: openApiRes.status },
	};

	addLoadingCheck("Fetched primary resources", "done");

	// ── HTTPS ──
	const isHttps = url.startsWith("https://");
	addResult("https", isHttps ? "pass" : "fail", isHttps ? "Site is served over HTTPS." : "Site is not using HTTPS. This is a critical issue.", {
		latency: homepageRes.latency,
	});

	// ── ROBOTS.TXT ──
	const robotsBody = robotsRes.body || "";
	const hasRobots = robotsRes.ok && robotsBody.toLowerCase().includes("user-agent");
	addResult(
		"robots_txt",
		hasRobots ? "pass" : robotsRes.status === 404 ? "fail" : "warn",
		hasRobots
			? `robots.txt found (${robotsBody.split("\n").length} lines).`
			: robotsRes.status === 404
				? "No robots.txt found (HTTP 404)."
				: `robots.txt unreachable (HTTP ${robotsRes.status}).`,
		{ detail_extra: hasRobots ? robotsBody.slice(0, 300) : "" },
	);
	addLoadingCheck("robots.txt checked", hasRobots ? "done" : "fail");

	// ── SITEMAP ──
	const hasSitemap = sitemapRes.ok && sitemapRes.body?.includes("<urlset");
	const sitemapInRobots = robotsBody.toLowerCase().includes("sitemap:");
	addResult(
		"sitemap",
		hasSitemap ? "pass" : sitemapInRobots ? "warn" : "fail",
		hasSitemap ? "sitemap.xml found and valid." : sitemapInRobots ? "Sitemap referenced in robots.txt but /sitemap.xml not found." : "No sitemap.xml found.",
	);

	// ── LINK HEADERS ──
	const linkHeader = getHeader(homepageRes.headers, "link") || "";
	const hasLink = linkHeader.length > 0;
	addResult("link_headers", hasLink ? "pass" : "info", hasLink ? `Link header present: ${linkHeader.slice(0, 120)}` : "No Link response headers detected.");

	// ── META TAGS ──
	const hp = homepageRes.body || "";
	const hasDescription = /<meta[^>]+name=["']description["'][^>]*>/i.test(hp);
	const hasOg = /<meta[^>]+property=["']og:/i.test(hp);
	const hasTwitter = /<meta[^>]+name=["']twitter:/i.test(hp);
	const metaScore = [hasDescription, hasOg, hasTwitter].filter(Boolean).length;
	addResult(
		"meta_tags",
		metaScore >= 2 ? "pass" : metaScore === 1 ? "warn" : "fail",
		`Found: ${[hasDescription && "description", hasOg && "og:*", hasTwitter && "twitter:*"].filter(Boolean).join(", ") || "none"}.`,
	);

	// ── FAVICON ──
	const hasFavicon = /favicon/.test(hp) || /<link[^>]+rel=["']icon["']/i.test(hp);
	addResult("favicon", hasFavicon ? "pass" : "warn", hasFavicon ? "Favicon link tag detected." : "No favicon link tag found in HTML.");

	// ── MARKDOWN NEGOTIATION ──
	addLoadingCheck("Testing markdown negotiation…", "done");
	const mdRes = await proxyFetch(url + "?format=markdown");
	const contentType = getHeader(homepageRes.headers, "content-type") || "";
	const acceptsMarkdown =
		mdRes.body?.startsWith("#") ||
		mdRes.body?.startsWith("---") ||
		getHeader(mdRes.headers, "content-type")?.includes("markdown") ||
		getHeader(homepageRes.headers, "vary")?.includes("Accept");
	addResult(
		"markdown_negotiation",
		acceptsMarkdown ? "pass" : "fail",
		acceptsMarkdown
			? "Server appears to support Markdown content negotiation."
			: "No Markdown content negotiation detected. Consider serving text/markdown via Accept header.",
	);

	// ── STRUCTURED DATA ──
	const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(hp);
	const hasMicrodata = /itemscope|itemtype/i.test(hp);
	addResult(
		"structured_data",
		hasJsonLd ? "pass" : hasMicrodata ? "warn" : "fail",
		hasJsonLd
			? "JSON-LD structured data detected."
			: hasMicrodata
				? "Microdata attributes detected (no JSON-LD)."
				: "No structured data (JSON-LD / Microdata) found.",
	);

	// ── CLEAN CONTENT ──
	const bodyText = hp
		.replace(/<script[\s\S]*?<\/script>/gi, "")
		.replace(/<style[\s\S]*?<\/style>/gi, "")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	const hasContent = bodyText.length > 200;
	addResult(
		"clean_content",
		hasContent ? "pass" : "warn",
		hasContent ? `${bodyText.length} chars of text content found without JS.` : "Very little text content found without JS rendering.",
	);

	// ── RSS FEED ──
	const hasRss = /<link[^>]+type=["']application\/(rss|atom)\+xml["']/i.test(hp) || /<a[^>]+href=["'][^"']*feed[^"']*["']/i.test(hp);
	addResult("rss_feed", hasRss ? "pass" : "info", hasRss ? "RSS or Atom feed link detected." : "No RSS/Atom feed detected.");

	// ── AI BOT RULES ──
	addLoadingCheck("Checking AI bot rules…", "done");
	const knownAiBots = ["GPTBot", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Applebot", "Bingbot", "CCBot"];
	const foundBots = knownAiBots.filter((bot) => new RegExp(bot, "i").test(robotsBody));
	const hasAiRules = foundBots.length > 0;
	addResult(
		"ai_bot_rules",
		hasAiRules ? "pass" : "fail",
		hasAiRules
			? `AI bot rules found for: ${foundBots.join(", ")}.`
			: "No AI-specific bot rules in robots.txt. Consider adding explicit GPTBot, ClaudeBot rules.",
		{ detail_extra: hasAiRules ? robotsBody.match(/(?:GPTBot|ClaudeBot|anthropic-ai|PerplexityBot)[^\n]*/gi)?.join("\n") : "" },
	);

	// ── CONTENT SIGNALS ──
	const csHeader = getHeader(homepageRes.headers, "x-content-signals") || getHeader(homepageRes.headers, "content-signals");
	addResult("content_signals", csHeader ? "pass" : "fail", csHeader ? `Content-Signals header: ${csHeader}` : "No Content-Signals header found.");

	// ── WEB BOT AUTH ──
	const wbaHeader = getHeader(homepageRes.headers, "x-bot-auth") || getHeader(homepageRes.headers, "web-bot-auth");
	addResult("web_bot_auth", wbaHeader ? "pass" : "fail", wbaHeader ? `Web Bot Auth header found: ${wbaHeader}` : "No Web Bot Auth headers found.");

	// ── AI.TXT / LLMS.TXT ──
	const hasAiTxt = aitxtRes.ok && aitxtRes.body?.length > 20;
	const hasLlmsTxt = llmstxtRes.ok && llmstxtRes.body?.length > 20;
	addResult(
		"ai_txt",
		hasAiTxt || hasLlmsTxt ? "pass" : "fail",
		hasAiTxt ? "ai.txt found." : hasLlmsTxt ? "llms.txt found." : "No ai.txt or llms.txt found. These files declare AI usage policies.",
		{ detail_extra: hasAiTxt ? aitxtRes.body?.slice(0, 300) : hasLlmsTxt ? llmstxtRes.body?.slice(0, 300) : "" },
	);

	// ── MCP SERVER CARD ──
	addLoadingCheck("Probing MCP endpoints…", "done");
	const mcpBody = mcpWellKnownRes.body || "";
	let mcpData = null;
	try {
		mcpData = mcpBody ? JSON.parse(mcpBody) : null;
	} catch {}
	const hasMcp = mcpWellKnownRes.ok && mcpData;
	addResult(
		"mcp_server_card",
		hasMcp ? "pass" : "fail",
		hasMcp ? `MCP Server Card found: ${JSON.stringify(mcpData).slice(0, 120)}` : "No MCP Server Card at /.well-known/mcp.json.",
		{ detail_extra: hasMcp ? JSON.stringify(mcpData, null, 2).slice(0, 400) : "" },
	);

	// ── A2A AGENT CARD ──
	let a2aData = null;
	try {
		a2aData = agentCardRes.body ? JSON.parse(agentCardRes.body) : null;
	} catch {}
	const hasA2a = agentCardRes.ok && a2aData;
	addResult("a2a_agent_card", hasA2a ? "pass" : "fail", hasA2a ? `A2A Agent Card found.` : "No A2A Agent Card at /.well-known/agent.json.", {
		detail_extra: hasA2a ? JSON.stringify(a2aData, null, 2).slice(0, 400) : "",
	});

	// ── OAUTH DISCOVERY ──
	let oauthData = null;
	try {
		oauthData = oauthRes.body ? JSON.parse(oauthRes.body) : null;
	} catch {}
	const hasOauth = oauthRes.ok && oauthData;
	addResult(
		"oauth_discovery",
		hasOauth ? "pass" : "fail",
		hasOauth ? `OAuth server metadata found. Issuer: ${oauthData.issuer || "?"}` : "No OAuth discovery metadata at /.well-known/oauth-authorization-server.",
	);

	// ── OAUTH PROTECTED RESOURCE ──
	let oauthProtData = null;
	try {
		oauthProtData = oauthProtRes.body ? JSON.parse(oauthProtRes.body) : null;
	} catch {}
	const hasOauthProt = oauthProtRes.ok && oauthProtData;
	addResult(
		"oauth_protected_resource",
		hasOauthProt ? "pass" : "fail",
		hasOauthProt ? `OAuth Protected Resource metadata found.` : "No RFC 9728 Protected Resource metadata at /.well-known/oauth-protected-resource.",
	);

	// ── API CATALOG / OPENAPI ──
	addLoadingCheck("Scanning API endpoints…", "done");
	const hasOpenApi = openApiRes.ok || openApiAlt1.ok || openApiAlt2.ok;
	const openApiStatus = [openApiRes.ok && "/openapi.json", openApiAlt1.ok && "/swagger.json", openApiAlt2.ok && "/api-docs"].filter(Boolean).join(", ");
	addResult(
		"api_catalog",
		hasOpenApi ? "pass" : "fail",
		hasOpenApi ? `OpenAPI/Swagger spec found at: ${openApiStatus}` : "No OpenAPI spec found at /openapi.json, /swagger.json or /api-docs.",
	);

	// ── AGENT SKILLS ──
	let agentSkillsData = null;
	try {
		agentSkillsData = agentSkillsRes.body ? JSON.parse(agentSkillsRes.body) : null;
	} catch {}
	const hasAgentSkills = agentSkillsRes.ok && agentSkillsData;
	addResult(
		"agent_skills",
		hasAgentSkills ? "pass" : "fail",
		hasAgentSkills ? `Agent Skills manifest found.` : "No Agent Skills manifest at /.well-known/agent-skills.json.",
		{ detail_extra: hasAgentSkills ? JSON.stringify(agentSkillsData, null, 2).slice(0, 300) : "" },
	);

	// ── WEBMCP ──
	const hasWebMcp = webmcpRes.ok || webmcpAlt.ok;
	addResult("webmcp", hasWebMcp ? "pass" : "fail", hasWebMcp ? "WebMCP endpoint found." : "No WebMCP found at /.well-known/webmcp.json or /webmcp.");

	// ── COMMERCE ──
	addLoadingCheck("Checking commerce protocols…", "done");
	let x402Data = null;
	try {
		x402Data = x402Res.body ? JSON.parse(x402Res.body) : null;
	} catch {}
	const hasX402 = x402Res.ok && x402Data;
	addResult("x402", hasX402 ? "pass" : "fail", hasX402 ? "x402 payment protocol detected." : "No x402 payment protocol at /.well-known/x402.json.");

	let ucpData = null;
	try {
		ucpData = ucpRes.body ? JSON.parse(ucpRes.body) : null;
	} catch {}
	addResult("ucp", ucpRes.ok && ucpData ? "pass" : "fail", ucpRes.ok && ucpData ? "UCP metadata found." : "No UCP metadata at /.well-known/ucp.json.");

	let acpData = null;
	try {
		acpData = acpRes.body ? JSON.parse(acpRes.body) : null;
	} catch {}
	addResult("acp", acpRes.ok && acpData ? "pass" : "fail", acpRes.ok && acpData ? "ACP metadata found." : "No ACP metadata at /.well-known/acp.json.");

	// ── SECURITY HEADERS ──
	addLoadingCheck("Analyzing security headers…", "done");
	const hsts = getHeader(homepageRes.headers, "strict-transport-security");
	addResult("hsts", hsts ? "pass" : "warn", hsts ? `HSTS header: ${hsts}` : "No Strict-Transport-Security header.");

	const csp = getHeader(homepageRes.headers, "content-security-policy");
	const xcto = getHeader(homepageRes.headers, "x-content-type-options");
	const xfo = getHeader(homepageRes.headers, "x-frame-options");
	const secCount = [csp, xcto, xfo].filter(Boolean).length;
	addResult(
		"security_headers",
		secCount >= 2 ? "pass" : secCount === 1 ? "warn" : "fail",
		`Found ${secCount}/3 key security headers: ${[csp && "CSP", xcto && "X-Content-Type-Options", xfo && "X-Frame-Options"].filter(Boolean).join(", ") || "none"}.`,
	);

	// ── CORS ──
	const corsHeader = getHeader(homepageRes.headers, "access-control-allow-origin");
	addResult(
		"cors_headers",
		corsHeader ? "pass" : "warn",
		corsHeader ? `CORS header: ${corsHeader}` : "No CORS headers on homepage. May be required for agent API access.",
	);

	// ── RESPONSE TIME ──
	const lat = homepageRes.latency;
	addResult(
		"response_time",
		lat < 1000 ? "pass" : lat < 3000 ? "warn" : "fail",
		`Response time: ${lat}ms${lat < 1000 ? " (fast)" : lat < 3000 ? " (acceptable)" : " (slow)"}`,
		{ latency: lat },
	);

	addLoadingCheck("Scan complete!", "done");
	updateLoadingProgress(100, "Scan complete!");
	await sleep(600);
}

function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

// ── Render Results ─────────────────────────────────────────
function renderResults() {
	resultsSection.style.display = "block";

	const score = calcScore();
	renderScorePanel(score);
	renderCategoryBreakdown();
	renderChecks();
	renderRecommendations();
	renderRaw();

	$("rawPanel").style.display = "block";
	$("recommendationsPanel").style.display = "block";

	resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function calcScore() {
	let total = 0,
		earned = 0;
	for (const check of CHECK_DEFS) {
		const result = state.results.find((r) => r.id === check.id);
		if (!result || result.status === "skip") continue;
		total += check.weight;
		if (result.status === "pass") earned += check.weight;
		else if (result.status === "warn") earned += check.weight * 0.5;
		else if (result.status === "info") earned += check.weight * 0.25;
	}
	return total ? Math.round((earned / total) * 100) : 0;
}

function renderScorePanel(score) {
	const domain = new URL(state.url).hostname;
	$("scoreDomain").textContent = domain;
	$("scoreScannedAt").textContent = "Scanned at " + state.scannedAt.toLocaleTimeString();

	// Favicon
	const faviconEl = $("scoreFavicon");
	faviconEl.innerHTML = "";
	const img = new Image();
	img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=40`;
	img.onload = () => faviconEl.appendChild(img);
	img.onerror = () => {
		faviconEl.textContent = "🌐";
	};

	// Score ring animation
	const scoreNum = $("scoreNumber");
	const ringFg = $("ringFg");
	const circumference = 314;
	let current = 0;
	const target = score;
	const step = () => {
		if (current < target) {
			current = Math.min(current + 2, target);
			scoreNum.textContent = current;
			const offset = circumference - (current / 100) * circumference;
			ringFg.style.strokeDashoffset = offset;
			requestAnimationFrame(step);
		}
	};
	ringFg.classList.remove("grade-poor", "grade-fair", "grade-good");
	if (score < 35) ringFg.classList.add("grade-poor");
	else if (score < 65) ringFg.classList.add("grade-fair");
	else if (score < 85) ringFg.classList.add("grade-good");

	requestAnimationFrame(step);

	// Grade
	const grade = score >= 85 ? "Excellent" : score >= 65 ? "Good" : score >= 40 ? "Fair" : "Needs Work";
	$("scoreGrade").textContent = grade;

	// Badges
	const badges = $("scoreBadges");
	badges.innerHTML = "";
	const passCount = state.results.filter((r) => r.status === "pass").length;
	const failCount = state.results.filter((r) => r.status === "fail").length;
	const cls = score >= 85 ? "badge-excellent" : score >= 65 ? "badge-good" : score >= 40 ? "badge-fair" : "badge-poor";
	addBadge(badges, cls, `${passCount} Passed`);
	if (failCount) addBadge(badges, "badge-poor", `${failCount} Failed`);
	if (state.results.find((r) => r.id === "mcp_server_card" && r.status === "pass")) addBadge(badges, "badge-excellent", "MCP Ready");
	if (state.results.find((r) => r.id === "oauth_discovery" && r.status === "pass")) addBadge(badges, "badge-good", "OAuth");
	if (state.results.find((r) => r.id === "ai_bot_rules" && r.status === "pass")) addBadge(badges, "badge-good", "AI Bot Rules");
}

function addBadge(container, cls, text) {
	const b = document.createElement("span");
	b.className = `score-badge ${cls}`;
	b.textContent = text;
	container.appendChild(b);
}

function renderCategoryBreakdown() {
	const container = $("categoryBreakdown");
	container.innerHTML = "";
	for (const [catId, catInfo] of Object.entries(CATEGORIES)) {
		const catChecks = CHECK_DEFS.filter((c) => c.category === catId);
		const catResults = catChecks.map((c) => state.results.find((r) => r.id === c.id)).filter(Boolean);
		const pass = catResults.filter((r) => r.status === "pass").length;
		const total = catResults.length;
		const pct = total ? Math.round((pass / total) * 100) : 0;
		const card = document.createElement("div");
		card.className = "cat-card";
		card.innerHTML = `
      <div class="cat-card-top">
        <span class="cat-icon">${catInfo.icon}</span>
        <span class="cat-pct">${pct}%</span>
      </div>
      <div class="cat-name">${catInfo.label}</div>
      <div class="cat-bar"><div class="cat-bar-fill" style="width:0%" data-target="${pct}"></div></div>
      <div class="cat-counts">${pass}/${total} checks passed</div>
    `;
		container.appendChild(card);
		// Animate bar
		requestAnimationFrame(() => {
			const fill = card.querySelector(".cat-bar-fill");
			fill.style.transition = "width 1s ease";
			fill.style.width = pct + "%";
		});
	}
}

function renderChecks() {
	const grid = $("checksGrid");
	grid.innerHTML = "";
	grid.className = `checks-grid${state.viewMode === "list" ? " list-view" : ""}`;

	let results = [...state.results];

	// Filter
	if (state.activeFilter !== "all") {
		const filteredIds = CHECK_DEFS.filter((c) => c.category === state.activeFilter).map((c) => c.id);
		results = results.filter((r) => filteredIds.includes(r.id));
	}

	// Sort
	if (state.sortMode === "status") {
		const order = { fail: 0, warn: 1, info: 2, pass: 3, skip: 4 };
		results.sort((a, b) => (order[a.status] ?? 5) - (order[b.status] ?? 5));
	} else if (state.sortMode === "name") {
		results.sort((a, b) => {
			const na = CHECK_DEFS.find((c) => c.id === a.id)?.name ?? a.id;
			const nb = CHECK_DEFS.find((c) => c.id === b.id)?.name ?? b.id;
			return na.localeCompare(nb);
		});
	} else {
		// group by category
		const catOrder = Object.keys(CATEGORIES);
		results.sort((a, b) => {
			const ca = CHECK_DEFS.find((c) => c.id === a.id)?.category ?? "";
			const cb = CHECK_DEFS.find((c) => c.id === b.id)?.category ?? "";
			return catOrder.indexOf(ca) - catOrder.indexOf(cb);
		});
	}

	let lastCat = null;
	for (const result of results) {
		const def = CHECK_DEFS.find((c) => c.id === result.id);
		if (!def) continue;

		if (state.sortMode === "category" && def.category !== lastCat) {
			lastCat = def.category;
			const catInfo = CATEGORIES[lastCat];
			if (catInfo) {
				const label = document.createElement("div");
				label.className = "cat-group-label";
				label.textContent = `${catInfo.icon} ${catInfo.label}`;
				grid.appendChild(label);
			}
		}

		grid.appendChild(buildCheckCard(def, result));
	}
}

function buildCheckCard(def, result) {
	const card = document.createElement("div");
	card.className = `check-card check-card--${result.status}`;

	const latencyHtml =
		result.latency != null
			? `<div class="check-latency ${result.latency < 1000 ? "latency-good" : result.latency < 3000 ? "latency-ok" : "latency-bad"}">${result.latency}ms</div>`
			: "";

	const detailHtml = result.detail_extra ? `<div class="check-detail">${escHtml(result.detail_extra)}</div>` : "";

	card.innerHTML = `
    <div class="check-top">
      <div class="check-status check-status--${result.status}" title="${result.status}">${STATUS_ICONS[result.status] || "?"}</div>
      <div class="check-name">${escHtml(def.name)}</div>
      <div class="check-category-tag">${CATEGORIES[def.category]?.label ?? def.category}</div>
    </div>
    <div class="check-desc">${escHtml(def.desc)}</div>
    <div class="check-meta">
      <div class="check-desc" style="font-size:12px;color:var(--text-muted);margin-top:4px">${escHtml(result.detail)}</div>
      ${detailHtml}
      ${latencyHtml}
    </div>
  `;
	return card;
}

function renderRecommendations() {
	const panel = $("recommendationsPanel");
	const list = $("recList");
	list.innerHTML = "";

	const failed = state.results.filter((r) => r.status === "fail" || r.status === "warn");
	if (!failed.length) {
		panel.style.display = "none";
		return;
	}
	panel.style.display = "block";

	const recDefs = {
		robots_txt: { priority: "high", fix: "Create a /robots.txt file", code: "User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml" },
		sitemap: {
			priority: "high",
			fix: "Create a sitemap.xml",
			code: '<?xml version="1.0"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://example.com/</loc></url>\n</urlset>',
		},
		ai_bot_rules: {
			priority: "high",
			fix: "Add AI bot rules to robots.txt",
			code: "User-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: anthropic-ai\nAllow: /",
		},
		mcp_server_card: {
			priority: "high",
			fix: "Add MCP Server Card",
			code: '# Create /.well-known/mcp.json\n{\n  "mcpVersion": "1.0",\n  "name": "My Site MCP",\n  "description": "MCP server for my site",\n  "serverUrl": "https://example.com/mcp"\n}',
		},
		markdown_negotiation: {
			priority: "med",
			fix: "Support Markdown content negotiation",
			code: '# Serve text/markdown when Accept: text/markdown header is present\n# Nginx: add_header Vary Accept;\n# Express: res.type("text/markdown").send(markdownContent);',
		},
		structured_data: {
			priority: "med",
			fix: "Add JSON-LD structured data",
			code: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "My Site",\n  "url": "https://example.com"\n}\n</script>',
		},
		a2a_agent_card: {
			priority: "med",
			fix: "Add A2A Agent Card",
			code: '# Create /.well-known/agent.json\n{\n  "name": "My Agent",\n  "description": "What this agent can do",\n  "version": "1.0",\n  "capabilities": []\n}',
		},
		oauth_discovery: {
			priority: "med",
			fix: "Add OAuth 2.0 server metadata",
			code: "# Create /.well-known/oauth-authorization-server\n# See RFC 8414 for full spec",
		},
		api_catalog: {
			priority: "med",
			fix: "Publish an OpenAPI spec",
			code: "# Create /openapi.json with your API schema\n# See https://swagger.io/specification/",
		},
		agent_skills: {
			priority: "med",
			fix: "Add Agent Skills manifest",
			code: '# Create /.well-known/agent-skills.json\n{\n  "skills": [\n    { "name": "search", "description": "Search the site" }\n  ]\n}',
		},
		ai_txt: {
			priority: "med",
			fix: "Add ai.txt or llms.txt",
			code: "# Create /ai.txt\n# AI Usage Policy\nallow: training\nallow: inference\nattribution: required",
		},
		https: { priority: "high", fix: "Enable HTTPS", code: "# Obtain a TLS certificate (Let's Encrypt is free)\n# certbot --nginx -d example.com" },
		hsts: { priority: "low", fix: "Add HSTS header", code: "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload" },
		content_signals: { priority: "low", fix: "Add Content-Signals header", code: "X-Content-Signals: ai-training=allowed; ai-inference=allowed" },
		security_headers: {
			priority: "low",
			fix: "Add security headers",
			code: "X-Content-Type-Options: nosniff\nX-Frame-Options: SAMEORIGIN\nContent-Security-Policy: default-src 'self'",
		},
		cors_headers: {
			priority: "low",
			fix: "Add CORS headers for API endpoints",
			code: "Access-Control-Allow-Origin: *\nAccess-Control-Allow-Methods: GET, POST, OPTIONS",
		},
	};

	for (const result of failed) {
		const def = CHECK_DEFS.find((c) => c.id === result.id);
		const rec = recDefs[result.id];
		if (!def || !rec) continue;

		const item = document.createElement("div");
		item.className = "rec-item";
		item.innerHTML = `
      <div class="rec-priority priority-${rec.priority}">${rec.priority.toUpperCase()}</div>
      <div class="rec-body">
        <div class="rec-title-text">${escHtml(rec.fix)}</div>
        <div class="rec-desc">${escHtml(def.desc)}</div>
        ${rec.code ? `<pre class="rec-code">${escHtml(rec.code)}</pre>` : ""}
      </div>
    `;
		list.appendChild(item);
	}
}

function renderRaw() {
	$("rawOutput").textContent = JSON.stringify(
		{
			url: state.url,
			scannedAt: state.scannedAt,
			score: calcScore(),
			results: state.results,
			rawData: state.rawData,
		},
		null,
		2,
	);
}

// ── Actions ────────────────────────────────────────────────
function toggleRaw() {
	const out = $("rawOutput");
	const btn = $("rawToggleBtn");
	const visible = out.style.display !== "none";
	out.style.display = visible ? "none" : "block";
	btn.textContent = visible ? "Show" : "Hide";
}

function exportJSON() {
	const data = {
		tool: "AgentScan by IQVerse",
		url: state.url,
		scannedAt: state.scannedAt,
		score: calcScore(),
		results: state.results.map((r) => ({
			...r,
			name: CHECK_DEFS.find((c) => c.id === r.id)?.name,
			category: CHECK_DEFS.find((c) => c.id === r.id)?.category,
		})),
	};
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = `agentscan-${new URL(state.url).hostname}-${Date.now()}.json`;
	a.click();
}

function copyRecommendations() {
	const lines = [];
	const failed = state.results.filter((r) => r.status === "fail" || r.status === "warn");
	lines.push(`AgentScan Recommendations for ${state.url}`);
	lines.push(`Score: ${calcScore()}/100`);
	lines.push("");
	for (const result of failed) {
		const def = CHECK_DEFS.find((c) => c.id === result.id);
		if (def) lines.push(`• [${result.status.toUpperCase()}] ${def.name}: ${result.detail}`);
	}
	navigator.clipboard.writeText(lines.join("\n")).then(() => {
		const btn = $("copyRecBtn");
		btn.textContent = "Copied!";
		setTimeout(() => {
			btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy All`;
		}, 2000);
	});
}

function escHtml(str) {
	if (!str) return "";
	return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

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

// ── Boot ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
initCursorGlow();
