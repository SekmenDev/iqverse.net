// ─────────────────────────────────────────────────────────────────────
//  LINKRADAR — Core Scanner Engine
// ─────────────────────────────────────────────────────────────────────

const CONCURRENCY = 5;
const STATUS_TEXT = {
	200: "OK",
	201: "Created",
	204: "No Content",
	301: "Moved Permanently",
	302: "Found",
	307: "Temp Redirect",
	308: "Perm Redirect",
	400: "Bad Request",
	401: "Unauthorized",
	403: "Forbidden",
	404: "Not Found",
	405: "Method Not Allowed",
	410: "Gone",
	429: "Too Many Requests",
	500: "Internal Server Error",
	502: "Bad Gateway",
	503: "Service Unavailable",
	504: "Gateway Timeout",
	0: "Network Error",
};

let scanResults = [];
let scanning = false;
let abortController = null;
let currentFilter = "all";
let currentSort = { key: null, dir: 1 };
let currentPage = 1;
const PAGE_SIZE = 50;

// ── Progress bar ──────────────────────────────────────────────────
const progressBar = document.getElementById("progress-bar");
function setProgress(p) {
	progressBar.style.width = Math.min(100, Math.max(0, p)) + "%";
}

// ── Console log ──────────────────────────────────────────────────
function logLine(msg, type = "info") {
	const log = document.getElementById("console-log");
	const now = new Date();
	const time = now.toTimeString().slice(0, 8);
	const line = document.createElement("div");
	line.className = "log-line";
	line.innerHTML = `<span class="log-time">[${time}]</span><span class="log-${type}">${escHtml(msg)}</span>`;
	log.appendChild(line);
	log.scrollTop = log.scrollHeight;
}

function escHtml(s) {
	return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Badge ─────────────────────────────────────────────────────────
function badgeClass(status) {
	if (status >= 200 && status < 300) return "s2xx";
	if (status >= 300 && status < 400) return "s3xx";
	if (status >= 400 && status < 500) return "s4xx";
	if (status >= 500) return "s5xx";
	return "s0";
}
function badgeHtml(status) {
	const cls = badgeClass(status);
	const label = status === 0 ? "Network Error" : `${status} ${STATUS_TEXT[status] || ""}`;
	return `<span class="badge ${cls}"><span class="badge-dot"></span>${escHtml(label)}</span>`;
}

// ── URL helpers ───────────────────────────────────────────────────
function sameOrigin(base, url) {
	try {
		const b = new URL(base);
		const u = new URL(url);
		return b.origin === u.origin;
	} catch {
		return false;
	}
}
function normalizeUrl(base, href) {
	try {
		return new URL(href, base).href;
	} catch {
		return null;
	}
}

// ── Fetch single URL ──────────────────────────────────────────────
async function checkUrl(url, signal) {
	const t0 = Date.now();
	try {
		const res = await fetch(url, {
			method: "HEAD",
			mode: "cors",
			redirect: "follow",
			signal,
			cache: "no-store",
		});
		return { status: res.status, time: Date.now() - t0 };
	} catch (e) {
		if (e.name === "AbortError") return null;
		// Fallback: try GET (some servers reject HEAD)
		try {
			const res = await fetch(url, {
				method: "GET",
				mode: "cors",
				redirect: "follow",
				signal,
				cache: "no-store",
			});
			return { status: res.status, time: Date.now() - t0 };
		} catch (e2) {
			if (e2.name === "AbortError") return null;
			return { status: 0, time: Date.now() - t0, error: e2.message };
		}
	}
}

// ── Extract links from HTML text ──────────────────────────────────
function extractLinks(html, baseUrl, opts) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");
	const links = [];

	const add = (href, tag, text) => {
		const url = normalizeUrl(baseUrl, href);
		if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
			// Skip mailto, tel, data, javascript
			links.push({ url, tag, text: (text || "").trim().slice(0, 60), sourceUrl: baseUrl });
		}
	};

	doc.querySelectorAll("a[href]").forEach((el) => add(el.href || el.getAttribute("href"), "<a>", el.innerText || el.textContent));
	if (opts.checkImages) {
		doc.querySelectorAll("img[src]").forEach((el) => add(el.getAttribute("src"), "<img>", el.alt));
		doc.querySelectorAll("link[href]").forEach((el) => add(el.getAttribute("href"), "<link>", el.rel));
		doc.querySelectorAll("script[src]").forEach((el) => add(el.getAttribute("src"), "<script>", ""));
	}
	return links;
}

// ── Batch processor ───────────────────────────────────────────────
async function processBatch(items, signal) {
	return Promise.all(
		items.map(async (item) => {
			const result = await checkUrl(item.url, signal);
			if (!result) return null;
			return { ...item, ...result };
		}),
	);
}

// ── Main scan ─────────────────────────────────────────────────────
async function runScan(rootUrl, opts) {
	const queue = [{ url: rootUrl, depth: 0, sourceUrl: rootUrl, tag: "<root>", text: "Entry Point" }];
	const visited = new Set();
	const pageFetched = new Set();
	scanResults = [];
	let checked = 0;
	let totalDiscovered = 1;

	setProgress(2);
	logLine(`Starting scan: ${rootUrl}`, "info");
	logLine(`Options: depth=${opts.maxDepth}, external=${opts.checkExternal}, assets=${opts.checkImages}`, "info");
	document.getElementById("console-wrap").classList.add("visible");
	document.getElementById("stats-row").classList.add("visible");

	const signal = abortController.signal;

	while (queue.length > 0 && scanning) {
		const batch = queue.splice(0, CONCURRENCY);
		const toCheck = batch.filter((item) => {
			if (visited.has(item.url)) return false;
			visited.add(item.url);
			return true;
		});
		if (toCheck.length === 0) continue;

		const results = await processBatch(toCheck, signal);
		if (!scanning) break;

		for (let i = 0; i < results.length; i++) {
			const r = results[i];
			if (!r) continue;
			scanResults.push(r);
			checked++;
			document.getElementById("console-counter").textContent = `${checked} urls checked`;

			const statusText = r.status === 0 ? "ERR" : r.status;
			const type = r.status === 0 ? "err" : r.status < 300 ? "ok" : r.status < 400 ? "warn" : "err";
			logLine(`[${statusText}] ${r.url.length > 70 ? r.url.slice(0, 70) + "…" : r.url} (${r.time}ms)`, type);

			// Crawl sub-pages only for same-origin, within depth, not yet fetched HTML
			const item = toCheck[i];
			if (
				opts.crawlSubpages &&
				item.depth < opts.maxDepth &&
				sameOrigin(rootUrl, item.url) &&
				!pageFetched.has(item.url) &&
				r.status >= 200 &&
				r.status < 300
			) {
				pageFetched.add(item.url);
				try {
					const res = await fetch(item.url, { mode: "cors", cache: "no-store", signal });
					const ct = res.headers.get("content-type") || "";
					if (ct.includes("text/html")) {
						const html = await res.text();
						const subLinks = extractLinks(html, item.url, opts);
						totalDiscovered += subLinks.length;
						for (const link of subLinks) {
							if (!visited.has(link.url)) {
								queue.push({ ...link, depth: item.depth + 1 });
							}
						}
						logLine(`  ↳ crawled ${item.url} — found ${subLinks.length} links`, "info");
					}
				} catch (e) {
					if (e.name !== "AbortError") logLine(`  ↳ crawl failed: ${e.message}`, "warn");
				}
			}
		}

		updateStats();
		setProgress(Math.min(95, 5 + (checked / Math.max(totalDiscovered, 1)) * 90));
		renderTable();
	}
}

// ── Stats update ──────────────────────────────────────────────────
function updateStats() {
	const total = scanResults.length;
	const ok = scanResults.filter((r) => r.status >= 200 && r.status < 300).length;
	const warn = scanResults.filter((r) => r.status >= 300 && r.status < 400).length;
	const err = scanResults.filter((r) => r.status >= 400 || r.status === 0).length;
	const skip = total - ok - warn - err;

	document.getElementById("stat-total").textContent = total;
	document.getElementById("stat-ok").textContent = ok;
	document.getElementById("stat-warn").textContent = warn;
	document.getElementById("stat-err").textContent = err;
	document.getElementById("stat-skip").textContent = Math.max(0, skip);
}

// ── Render table ──────────────────────────────────────────────────
function getFiltered() {
	let data = [...scanResults];
	const search = document.getElementById("search-input").value.toLowerCase();
	if (search) data = data.filter((r) => r.url.toLowerCase().includes(search));
	if (currentFilter === "ok") data = data.filter((r) => r.status >= 200 && r.status < 300);
	if (currentFilter === "redir") data = data.filter((r) => r.status >= 300 && r.status < 400);
	if (currentFilter === "broken") data = data.filter((r) => r.status >= 400 || r.status === 0);
	if (currentFilter === "other") data = data.filter((r) => r.status > 0 && r.status < 200);

	if (currentSort.key) {
		data.sort((a, b) => {
			let av = a[currentSort.key],
				bv = b[currentSort.key];
			if (typeof av === "string") av = av.toLowerCase();
			if (typeof bv === "string") bv = bv.toLowerCase();
			return av < bv ? -currentSort.dir : av > bv ? currentSort.dir : 0;
		});
	}
	return data;
}

function renderTable() {
	const filtered = getFiltered();
	const tbody = document.getElementById("result-tbody");
	const emptyState = document.getElementById("empty-state");
	document.getElementById("report-section").classList.add("visible");

	const start = (currentPage - 1) * PAGE_SIZE;
	const page = filtered.slice(start, start + PAGE_SIZE);

	if (filtered.length === 0) {
		tbody.innerHTML = "";
		emptyState.style.display = "block";
	} else {
		emptyState.style.display = "none";
		tbody.innerHTML = page
			.map((r) => {
				const shortUrl = r.url.length > 60 ? r.url.slice(0, 60) + "…" : r.url;
				const srcPage = r.sourceUrl ? (r.sourceUrl.length > 50 ? r.sourceUrl.slice(0, 50) + "…" : r.sourceUrl) : "—";
				return `
      <tr>
        <td class="td-status">${badgeHtml(r.status)}</td>
        <td class="td-url">
          <div class="url-cell">
            <a class="url-main" href="${escHtml(r.url)}" target="_blank" title="${escHtml(r.url)}">${escHtml(shortUrl)}</a>
            <span class="url-type text-dim">${escHtml(r.url)}</span>
          </div>
        </td>
        <td class="td-src">
          <div class="src-snippet">
            <span class="src-page" title="${escHtml(r.sourceUrl || "")}">${escHtml(srcPage)}</span>
            <span class="src-tag">${escHtml(r.tag || "—")}</span>
            ${r.text ? `<span class="src-anchor">"${escHtml(r.text)}"</span>` : ""}
          </div>
        </td>
        <td class="td-time">${r.time}ms</td>
        <td class="td-depth">${r.depth ?? "—"}</td>
      </tr>`;
			})
			.join("");
	}

	// Pagination
	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
	document.getElementById("page-info").textContent = filtered.length > 0 ? `Page ${currentPage} / ${totalPages} (${filtered.length} results)` : "";
	document.getElementById("prev-page").disabled = currentPage <= 1;
	document.getElementById("next-page").disabled = currentPage >= totalPages;
	document.getElementById("pagination").style.display = filtered.length > PAGE_SIZE ? "flex" : "none";
}

function setFilter(f) {
	currentFilter = f;
	currentPage = 1;
	document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
	document.querySelector(`.filter-btn.${f}`).classList.add("active");
	renderTable();
}

function sortBy(key) {
	if (currentSort.key === key) currentSort.dir *= -1;
	else {
		currentSort.key = key;
		currentSort.dir = 1;
	}
	document.querySelectorAll("th").forEach((th) => th.classList.remove("sorted"));
	document.querySelector(`th[onclick="sortBy('${key}')"]`).classList.add("sorted");
	renderTable();
}

function changePage(d) {
	const filtered = getFiltered();
	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
	currentPage = Math.min(totalPages, Math.max(1, currentPage + d));
	renderTable();
}

// ── Scan toggle ───────────────────────────────────────────────────
async function handleScanToggle() {
	if (scanning) {
		stopScan();
		return;
	}

	const url = document.getElementById("url-input").value.trim();
	if (!url) {
		document.getElementById("url-input").focus();
		document.getElementById("url-input").style.borderColor = "var(--red)";
		setTimeout(() => (document.getElementById("url-input").style.borderColor = ""), 1200);
		return;
	}

	let rootUrl = url;
	if (!rootUrl.startsWith("http")) rootUrl = "https://" + rootUrl;
	try {
		new URL(rootUrl);
	} catch {
		document.getElementById("url-input").style.borderColor = "var(--red)";
		return;
	}

	const opts = {
		maxDepth: parseInt(document.getElementById("depth-input").value) || 3,
		checkExternal: document.getElementById("opt-external").checked,
		checkImages: document.getElementById("opt-img").checked,
		crawlSubpages: document.getElementById("opt-crawl").checked,
	};

	scanning = true;
	abortController = new AbortController();
	scanResults = [];
	currentPage = 1;

	const btn = document.getElementById("scan-btn");
	btn.classList.add("scanning");
	document.getElementById("scan-icon").innerHTML = '<rect x="6" y="6" width="12" height="12" rx="2"/>';
	document.getElementById("scan-label").textContent = "Stop";

	document.getElementById("no-proxy-note").classList.add("visible");
	document.getElementById("console-log").innerHTML = "";
	document.getElementById("report-section").classList.remove("visible");
	setProgress(0);

	try {
		await runScan(rootUrl, opts);
	} finally {
		finishScan();
	}
}

function stopScan() {
	scanning = false;
	if (abortController) abortController.abort();
	logLine("Scan stopped by user.", "warn");
	finishScan();
}

function finishScan() {
	scanning = false;
	setProgress(100);
	setTimeout(() => setProgress(0), 1500);

	const btn = document.getElementById("scan-btn");
	btn.classList.remove("scanning");
	document.getElementById("scan-icon").innerHTML = '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>';
	document.getElementById("scan-label").textContent = "Scan";

	if (scanResults.length > 0) {
		updateStats();
		renderTable();
		logLine(`Scan complete — ${scanResults.length} URLs checked.`, "ok");
		document.getElementById("report-section").classList.add("visible");
	}
}

// ── Enter key ─────────────────────────────────────────────────────
document.getElementById("url-input").addEventListener("keydown", (e) => {
	if (e.key === "Enter") handleScanToggle();
});

// ── Export ────────────────────────────────────────────────────────
function exportCSV() {
	const data = getFiltered();
	if (!data.length) return;
	const headers = ["Status", "URL", "SourcePage", "Tag", "AnchorText", "TimeMs", "Depth"];
	const rows = data.map((r) => [
		r.status,
		`"${r.url}"`,
		`"${r.sourceUrl || ""}"`,
		r.tag || "",
		`"${(r.text || "").replace(/"/g, '""')}"`,
		r.time,
		r.depth ?? "",
	]);
	const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
	download("linkradar-report.csv", csv, "text/csv");
}

function exportJSON() {
	const data = getFiltered();
	if (!data.length) return;
	download("linkradar-report.json", JSON.stringify(data, null, 2), "application/json");
}

function download(name, content, type) {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(new Blob([content], { type }));
	a.download = name;
	a.click();
}

// ── Demo data (shows on page load) ───────────────────────────────
const demoData = [
	{ url: "https://example.com/", status: 200, time: 112, depth: 0, sourceUrl: "https://example.com/", tag: "<root>", text: "Entry Point" },
	{ url: "https://example.com/about", status: 200, time: 88, depth: 1, sourceUrl: "https://example.com/", tag: "<a>", text: "About Us" },
	{ url: "https://example.com/blog/missing-post", status: 404, time: 204, depth: 1, sourceUrl: "https://example.com/", tag: "<a>", text: "Our story" },
	{ url: "https://old-cdn.example.com/logo.png", status: 301, time: 76, depth: 1, sourceUrl: "https://example.com/about", tag: "<img>", text: "Company Logo" },
	{ url: "https://api.external-service.io/v2/status", status: 503, time: 312, depth: 1, sourceUrl: "https://example.com/", tag: "<a>", text: "API Status" },
	{ url: "https://example.com/docs", status: 200, time: 95, depth: 1, sourceUrl: "https://example.com/", tag: "<a>", text: "Documentation" },
	{ url: "https://example.com/contact", status: 200, time: 81, depth: 1, sourceUrl: "https://example.com/", tag: "<a>", text: "Contact" },
	{ url: "https://example.com/careers", status: 410, time: 188, depth: 2, sourceUrl: "https://example.com/about", tag: "<a>", text: "Jobs" },
];

function loadDemo() {
	scanResults = demoData;
	document.getElementById("stats-row").classList.add("visible");
	document.getElementById("report-section").classList.add("visible");
	updateStats();
	renderTable();
}

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

// ─── Init ──────────────────────────────────────────────────────────────────

loadDemo();

initCursorGlow();
