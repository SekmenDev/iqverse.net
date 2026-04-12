/* ════════════════════════════════════════════════════════════
   EncodeLab — app.js
   All encoding/decoding logic lives here. No dependencies.
   ════════════════════════════════════════════════════════════ */

"use strict";

/* ── Utilities ─────────────────────────────────────────────── */

function $(id) {
	return document.getElementById(id);
}

function show(id) {
	$(id)?.classList.remove("hidden");
}
function hide(id) {
	$(id)?.classList.add("hidden");
}
function showEl(el) {
	el?.classList.remove("hidden");
}
function hideEl(el) {
	el?.classList.add("hidden");
}

let toastTimer;
function toast(msg, type = "success") {
	const el = $("toast");
	el.textContent = msg;
	el.className = `toast ${type}`;
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		el.className = "toast hidden";
	}, 2200);
}

async function copyText(text) {
	try {
		await navigator.clipboard.writeText(text);
		toast("Copied to clipboard ✓");
	} catch {
		toast("Copy failed", "error");
	}
}

async function pasteText() {
	try {
		return await navigator.clipboard.readText();
	} catch {
		toast("Paste permission denied", "error");
		return null;
	}
}

function download(filename, content, mimeType = "text/plain") {
	const blob = new Blob([content], { type: mimeType });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	a.click();
	URL.revokeObjectURL(a.href);
}

function downloadBlob(filename, uint8array, mimeType) {
	const blob = new Blob([uint8array], { type: mimeType });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	a.click();
	URL.revokeObjectURL(a.href);
}

function formatBytes(n) {
	if (n < 1024) return n + " B";
	if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
	return (n / 1024 / 1024).toFixed(2) + " MB";
}

function syntaxJSON(json) {
	return json
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (m) => {
			let cls = "json-num";
			if (/^"/.test(m)) cls = /:$/.test(m) ? "json-key" : "json-str";
			else if (/true|false/.test(m)) cls = "json-bool";
			else if (/null/.test(m)) cls = "json-null";
			return `<span class="${cls}">${m}</span>`;
		});
}

/* ── Tab Switching ─────────────────────────────────────────── */

document.querySelectorAll(".tab").forEach((btn) => {
	btn.addEventListener("click", () => {
		document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
		document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
		btn.classList.add("active");
		$("tab-" + btn.dataset.tab)?.classList.add("active");
	});
});

/* ══════════════════════════════════════════════════════════════
   01 — BASE64
   ══════════════════════════════════════════════════════════════ */

const b64State = { mode: "encode" };

function b64Encode(str) {
	const urlSafe = $("b64-urlsafe").checked;
	const noPad = $("b64-nopad").checked;
	const lineBreak = $("b64-linebreak").checked;
	const utf8 = $("b64-utf8").checked;

	let bytes;
	if (utf8) {
		bytes = new TextEncoder().encode(str);
	} else {
		bytes = new Uint8Array(str.length);
		for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xff;
	}

	let result = btoa(String.fromCharCode(...bytes));
	if (urlSafe) result = result.replace(/\+/g, "-").replace(/\//g, "_");
	if (noPad) result = result.replace(/=+$/, "");
	if (lineBreak) result = result.match(/.{1,76}/g)?.join("\n") ?? result;
	return result;
}

function b64Decode(str) {
	// Normalize URL-safe chars
	str = str.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
	// Add padding
	while (str.length % 4) str += "=";
	const raw = atob(str);
	const bytes = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
	try {
		return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
	} catch {
		// Fallback: latin-1
		return raw;
	}
}

function isValidBase64(str) {
	str = str.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
	while (str.length % 4) str += "=";
	try {
		atob(str);
		return true;
	} catch {
		return false;
	}
}

function runBase64() {
	const input = $("b64-input").value;
	$("b64-error").classList.add("hidden");
	if (!input.trim()) {
		$("b64-output").value = "";
		updateB64Stats("", "");
		return;
	}
	try {
		const output = b64State.mode === "encode" ? b64Encode(input) : b64Decode(input);
		$("b64-output").value = output;
		updateB64Stats(input, output);
	} catch (e) {
		$("b64-output").value = "";
		$("b64-error").textContent = "Error: " + e.message;
		$("b64-error").classList.remove("hidden");
	}
}

function updateB64Stats(input, output) {
	const inBytes = new TextEncoder().encode(input).length;
	const outBytes = new TextEncoder().encode(output).length;
	$("b64-in-count").textContent = input.length.toLocaleString();
	$("b64-out-count").textContent = output.length.toLocaleString();
	$("b64-ratio").textContent = input.length ? ((output.length / input.length) * 100).toFixed(0) + "%" : "";
	$("b64-stat-in-bytes").textContent = inBytes ? formatBytes(inBytes) : "—";
	$("b64-stat-out-bytes").textContent = outBytes ? formatBytes(outBytes) : "—";
	$("b64-stat-overhead").textContent = inBytes ? "+" + ((outBytes / inBytes - 1) * 100).toFixed(1) + "%" : "—";
	const checkStr = b64State.mode === "encode" ? output : input;
	const valid = checkStr.trim() ? isValidBase64(checkStr) : false;
	const validEl = $("b64-stat-valid");
	validEl.textContent = checkStr.trim() ? (valid ? "✓ Yes" : "✗ No") : "—";
	validEl.style.color = checkStr.trim() ? (valid ? "var(--green)" : "var(--red)") : "";
}

function setB64Mode(mode) {
	b64State.mode = mode;
	$("b64-encode-btn").classList.toggle("active", mode === "encode");
	$("b64-decode-btn").classList.toggle("active", mode === "decode");
	$("b64-input-label").textContent = mode === "encode" ? "Plain Text" : "Base64 Input";
	$("b64-output-label").textContent = mode === "encode" ? "Base64 Output" : "Decoded Text";
	runBase64();
}

$("b64-encode-btn").addEventListener("click", () => setB64Mode("encode"));
$("b64-decode-btn").addEventListener("click", () => setB64Mode("decode"));
$("b64-input").addEventListener("input", runBase64);
["b64-urlsafe", "b64-nopad", "b64-linebreak", "b64-utf8"].forEach((id) => {
	$(id).addEventListener("change", runBase64);
});

$("b64-convert-btn").addEventListener("click", runBase64);

$("b64-swap-btn").addEventListener("click", () => {
	const a = $("b64-input").value;
	const b = $("b64-output").value;
	$("b64-input").value = b;
	$("b64-output").value = a;
	setB64Mode(b64State.mode === "encode" ? "decode" : "encode");
});

$("b64-paste-btn").addEventListener("click", async () => {
	const t = await pasteText();
	if (t !== null) {
		$("b64-input").value = t;
		runBase64();
	}
});

$("b64-clear-in-btn").addEventListener("click", () => {
	$("b64-input").value = "";
	$("b64-output").value = "";
	updateB64Stats("", "");
	hide("b64-error");
});

$("b64-copy-btn").addEventListener("click", () => copyText($("b64-output").value));

$("b64-download-btn").addEventListener("click", () => {
	const val = $("b64-output").value;
	if (!val) return toast("Nothing to download", "error");
	download("encoded.txt", val);
});

/* ══════════════════════════════════════════════════════════════
   02 — URL ENCODE
   ══════════════════════════════════════════════════════════════ */

const urlState = { mode: "encode" };

function getUrlMode() {
	return document.querySelector('input[name="url-mode"]:checked')?.value ?? "component";
}

function urlEncode(str) {
	const mode = getUrlMode();
	switch (mode) {
		case "component":
			return encodeURIComponent(str);
		case "full":
			return encodeURI(str);
		case "rfc3986":
			return encodeURIComponent(str).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
		case "form":
			return encodeURIComponent(str).replace(/%20/g, "+");
		default:
			return encodeURIComponent(str);
	}
}

function urlDecode(str) {
	const mode = getUrlMode();
	if (mode === "form") str = str.replace(/\+/g, " ");
	return decodeURIComponent(str);
}

function runUrlEncode() {
	const input = $("url-input").value;
	hide("url-error");
	if (!input.trim()) {
		$("url-output").value = "";
		return;
	}
	try {
		$("url-output").value = urlState.mode === "encode" ? urlEncode(input) : urlDecode(input);
	} catch (e) {
		$("url-output").value = "";
		$("url-error").textContent = "Error: " + e.message;
		show("url-error");
	}
}

function setUrlMode(mode) {
	urlState.mode = mode;
	$("url-encode-btn").classList.toggle("active", mode === "encode");
	$("url-decode-btn").classList.toggle("active", mode === "decode");
	runUrlEncode();
}

$("url-encode-btn").addEventListener("click", () => setUrlMode("encode"));
$("url-decode-btn").addEventListener("click", () => setUrlMode("decode"));
$("url-input").addEventListener("input", runUrlEncode);
document.querySelectorAll('input[name="url-mode"]').forEach((r) => r.addEventListener("change", runUrlEncode));

$("url-convert-btn").addEventListener("click", runUrlEncode);

$("url-swap-btn").addEventListener("click", () => {
	const a = $("url-input").value;
	const b = $("url-output").value;
	$("url-input").value = b;
	setUrlMode(urlState.mode === "encode" ? "decode" : "encode");
});

$("url-paste-btn").addEventListener("click", async () => {
	const t = await pasteText();
	if (t !== null) {
		$("url-input").value = t;
		runUrlEncode();
	}
});

$("url-clear-btn").addEventListener("click", () => {
	$("url-input").value = "";
	$("url-output").value = "";
	hide("url-error");
	hide("url-params-table");
});

$("url-copy-btn").addEventListener("click", () => copyText($("url-output").value));

// Query param parser
$("url-parse-btn").addEventListener("click", () => {
	const raw = $("url-input").value.trim() || $("url-output").value.trim();
	if (!raw) return toast("No URL to parse", "error");
	try {
		let query = raw;
		if (raw.includes("?")) query = raw.split("?").slice(1).join("?");
		if (query.startsWith("?")) query = query.slice(1);
		const params = new URLSearchParams(query);
		const body = $("url-params-body");
		body.innerHTML = "";
		let count = 0;
		for (const [k, v] of params) {
			count++;
			const row = document.createElement("div");
			row.className = "params-row";
			let decoded = v;
			try {
				decoded = decodeURIComponent(v);
			} catch {}
			row.innerHTML = `<span>${escHtml(k)}</span><span>${escHtml(v)}</span><span>${escHtml(decoded)}</span>`;
			body.appendChild(row);
		}
		if (!count) {
			const row = document.createElement("div");
			row.className = "params-row";
			row.innerHTML = `<span colspan="3" style="color:var(--text-dim);grid-column:1/-1;padding:.5rem .85rem;">No query parameters found</span>`;
			body.appendChild(row);
		}
		show("url-params-table");
	} catch (e) {
		toast("Could not parse URL: " + e.message, "error");
	}
});

function escHtml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ══════════════════════════════════════════════════════════════
   03 — JWT
   ══════════════════════════════════════════════════════════════ */

const JWT_CLAIMS = {
	iss: "Issuer",
	sub: "Subject",
	aud: "Audience",
	exp: "Expiration time",
	nbf: "Not before",
	iat: "Issued at",
	jti: "JWT ID",
	name: "Full name",
	email: "Email address",
	role: "Role",
	roles: "Roles",
};

const SAMPLE_JWT =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
	"eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9." +
	"Lsf7_cT8wKqOuqNwEjgjXsT0mEuNe-rO3Kpgj0P5E9U";

function b64urlDecode(str) {
	str = str.replace(/-/g, "+").replace(/_/g, "/");
	while (str.length % 4) str += "=";
	return atob(str);
}

function parseJWT(token) {
	const parts = token.trim().split(".");
	if (parts.length !== 3) throw new Error("Invalid JWT: must have exactly 3 parts (header.payload.signature)");
	const header = JSON.parse(b64urlDecode(parts[0]));
	const payload = JSON.parse(b64urlDecode(parts[1]));
	return { header, payload, signature: parts[2], parts };
}

function formatTS(ts) {
	if (!ts) return null;
	const d = new Date(ts * 1000);
	return d.toLocaleString() + " (UTC " + d.toISOString() + ")";
}

function runJWT() {
	const raw = $("jwt-input").value.trim();
	hide("jwt-error");
	$("jwt-claims-wrap").style.display = "none";

	if (!raw) {
		$("jwt-vis-header").textContent = "—";
		$("jwt-vis-payload").textContent = "—";
		$("jwt-vis-sig").textContent = "—";
		$("jwt-header-display").textContent = "—";
		$("jwt-payload-display").textContent = "—";
		$("jwt-sig-display").textContent = "—";
		$("jwt-alg-badge").textContent = "—";
		$("jwt-status-badge").textContent = "—";
		$("jwt-alg-badge").className = "badge";
		$("jwt-status-badge").className = "badge";
		["jwt-iat", "jwt-exp", "jwt-nbf", "jwt-alg-stat"].forEach((id) => ($(id).textContent = "—"));
		return;
	}

	try {
		const { header, payload, signature, parts } = parseJWT(raw);

		// Visual
		$("jwt-vis-header").textContent = parts[0].slice(0, 36) + (parts[0].length > 36 ? "…" : "");
		$("jwt-vis-payload").textContent = parts[1].slice(0, 48) + (parts[1].length > 48 ? "…" : "");
		$("jwt-vis-sig").textContent = parts[2].slice(0, 36) + (parts[2].length > 36 ? "…" : "");

		// JSON displays
		$("jwt-header-display").innerHTML = syntaxJSON(JSON.stringify(header, null, 2));
		$("jwt-payload-display").innerHTML = syntaxJSON(JSON.stringify(payload, null, 2));
		$("jwt-sig-display").textContent = signature;

		// Badges
		const alg = header.alg || "unknown";
		$("jwt-alg-badge").textContent = alg;
		$("jwt-alg-stat").textContent = alg;

		const now = Math.floor(Date.now() / 1000);
		let statusText = "No exp",
			statusClass = "badge warning";
		if (payload.exp) {
			if (payload.exp < now) {
				statusText = "Expired";
				statusClass = "badge expired";
			} else if (payload.nbf && payload.nbf > now) {
				statusText = "Not yet valid";
				statusClass = "badge warning";
			} else {
				statusText = "Valid";
				statusClass = "badge valid";
			}
		}
		$("jwt-status-badge").textContent = statusText;
		$("jwt-status-badge").className = statusClass;

		// Stats
		$("jwt-iat").textContent = payload.iat ? formatTS(payload.iat) : "—";
		$("jwt-exp").textContent = payload.exp ? formatTS(payload.exp) : "—";
		$("jwt-nbf").textContent = payload.nbf ? formatTS(payload.nbf) : "—";

		// Claims table
		const body = $("jwt-claims-body");
		body.innerHTML = "";
		let hasClaims = false;
		for (const [k, v] of Object.entries(payload)) {
			if (!JWT_CLAIMS[k]) continue;
			hasClaims = true;
			const row = document.createElement("div");
			row.className = "params-row";
			let displayV = v;
			if ((k === "exp" || k === "iat" || k === "nbf") && typeof v === "number") {
				displayV = formatTS(v);
			} else if (typeof v === "object") {
				displayV = JSON.stringify(v);
			}
			row.innerHTML = `<span>${escHtml(k)}</span><span>${escHtml(String(displayV))}</span><span>${escHtml(JWT_CLAIMS[k])}</span>`;
			body.appendChild(row);
		}
		if (hasClaims) $("jwt-claims-wrap").style.display = "";
	} catch (e) {
		$("jwt-error").textContent = e.message;
		show("jwt-error");
	}
}

$("jwt-input").addEventListener("input", runJWT);
$("jwt-paste-btn").addEventListener("click", async () => {
	const t = await pasteText();
	if (t !== null) {
		$("jwt-input").value = t;
		runJWT();
	}
});
$("jwt-sample-btn").addEventListener("click", () => {
	$("jwt-input").value = SAMPLE_JWT;
	runJWT();
});
$("jwt-clear-btn").addEventListener("click", () => {
	$("jwt-input").value = "";
	runJWT();
});

/* ══════════════════════════════════════════════════════════════
   04 — FILE → BASE64
   ══════════════════════════════════════════════════════════════ */

const fileState = { mode: "encode", file: null };

function setFileMode(mode) {
	fileState.mode = mode;
	$("file-enc-btn").classList.toggle("active", mode === "encode");
	$("file-dec-btn").classList.toggle("active", mode === "decode");
	$("file-to-b64-panel").style.display = mode === "encode" ? "" : "none";
	$("b64-to-file-panel").style.display = mode === "decode" ? "" : "none";
}

$("file-enc-btn").addEventListener("click", () => setFileMode("encode"));
$("file-dec-btn").addEventListener("click", () => setFileMode("decode"));

// Dropzone
const dropzone = $("file-dropzone");
const fileInput = $("file-input");

$("file-browse-btn").addEventListener("click", () => fileInput.click());
dropzone.addEventListener("click", (e) => {
	if (e.target.tagName !== "BUTTON") fileInput.click();
});

dropzone.addEventListener("dragover", (e) => {
	e.preventDefault();
	dropzone.classList.add("drag-over");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-over"));
dropzone.addEventListener("drop", (e) => {
	e.preventDefault();
	dropzone.classList.remove("drag-over");
	const f = e.dataTransfer.files[0];
	if (f) processFile(f);
});

fileInput.addEventListener("change", () => {
	if (fileInput.files[0]) processFile(fileInput.files[0]);
});

function processFile(file) {
	fileState.file = file;
	show("file-info");
	$("file-name").textContent = file.name;
	$("file-size").textContent = formatBytes(file.size);
	$("file-type").textContent = file.type || "unknown type";
	$("file-icon").textContent = getFileIcon(file.type);

	const reader = new FileReader();
	reader.onload = (e) => {
		const b64 = e.target.result;
		const includePrefix = $("file-datauri").checked;
		let out = includePrefix ? b64 : (b64.split(",")[1] ?? b64);
		if ($("file-linebreak-b64").checked) {
			const data = out.includes(",") ? out.split(",") : ["", out];
			data[1] = (data[1] || out).match(/.{1,76}/g)?.join("\n") ?? (data[1] || out);
			out = data[0] ? data.join(",") : data[1];
		}
		$("file-output").value = out;
	};
	reader.readAsDataURL(file);
}

function getFileIcon(mime) {
	if (!mime) return "📄";
	if (mime.startsWith("image/")) return "🖼️";
	if (mime.startsWith("video/")) return "🎬";
	if (mime.startsWith("audio/")) return "🎵";
	if (mime.includes("pdf")) return "📑";
	if (mime.includes("zip") || mime.includes("tar") || mime.includes("gzip")) return "🗜️";
	if (mime.includes("json")) return "📋";
	if (mime.includes("text")) return "📝";
	return "📄";
}

["file-datauri", "file-linebreak-b64"].forEach((id) => $(id).addEventListener("change", () => fileState.file && processFile(fileState.file)));

$("file-remove-btn").addEventListener("click", () => {
	fileState.file = null;
	fileInput.value = "";
	hide("file-info");
	$("file-output").value = "";
});

$("file-copy-btn").addEventListener("click", () => copyText($("file-output").value));
$("file-dl-btn").addEventListener("click", () => {
	const val = $("file-output").value;
	if (!val) return toast("No output yet", "error");
	download("base64_output.txt", val);
});

// Base64 → File
$("b64file-paste-btn").addEventListener("click", async () => {
	const t = await pasteText();
	if (t !== null) $("b64file-input").value = t;
});

$("b64file-dl-btn").addEventListener("click", () => {
	let b64 = $("b64file-input").value.trim();
	const fname = ($("b64file-name").value.trim() || "decoded") + "." + ($("b64file-ext").value.trim() || "bin");
	hide("b64file-error");

	let mimeType = "application/octet-stream";
	if (b64.startsWith("data:")) {
		const m = b64.match(/^data:([^;]+);base64,/);
		if (m) mimeType = m[1];
		b64 = b64.split(",")[1] ?? "";
	}

	try {
		b64 = b64.replace(/\s/g, "");
		const raw = atob(b64);
		const bytes = new Uint8Array(raw.length);
		for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
		downloadBlob(fname, bytes, mimeType);
		toast("File downloaded ✓");
	} catch (e) {
		$("b64file-error").textContent = "Decode error: " + e.message;
		show("b64file-error");
	}
});

/* ══════════════════════════════════════════════════════════════
   05 — DATA URI
   ══════════════════════════════════════════════════════════════ */

$("duri-input").addEventListener("input", parseDataUri);
$("duri-paste-btn").addEventListener("click", async () => {
	const t = await pasteText();
	if (t !== null) {
		$("duri-input").value = t;
		parseDataUri();
	}
});
$("duri-clear-btn").addEventListener("click", () => {
	$("duri-input").value = "";
	$("duri-mime").textContent = "—";
	$("duri-encoding").textContent = "—";
	$("duri-length").textContent = "—";
	$("duri-size").textContent = "—";
	$("duri-preview").innerHTML = '<span class="preview-placeholder">Preview will appear here</span>';
});

function parseDataUri() {
	const raw = $("duri-input").value.trim();
	if (!raw.startsWith("data:")) {
		$("duri-mime").textContent = "—";
		$("duri-encoding").textContent = "—";
		$("duri-length").textContent = "—";
		$("duri-size").textContent = "—";
		$("duri-preview").innerHTML = '<span class="preview-placeholder">Enter a valid data: URI above</span>';
		return;
	}

	const match = raw.match(/^data:([^;,]+)(?:;([^,]+))?,(.*)$/s);
	if (!match) return;

	const [, mime, encoding, data] = match;
	$("duri-mime").textContent = mime || "—";
	$("duri-encoding").textContent = encoding || "none (URL-encoded)";
	$("duri-length").textContent = data.length.toLocaleString() + " chars";

	let bytes = 0;
	if (encoding === "base64") {
		bytes = Math.floor(data.replace(/=+$/, "").length * 0.75);
	} else {
		bytes = decodeURIComponent(data).length;
	}
	$("duri-size").textContent = formatBytes(bytes);

	// Preview
	const preview = $("duri-preview");
	if (mime.startsWith("image/")) {
		const img = document.createElement("img");
		img.src = raw;
		img.alt = "Data URI preview";
		preview.innerHTML = "";
		preview.appendChild(img);
	} else if (mime === "text/html") {
		const iframe = document.createElement("iframe");
		iframe.src = raw;
		iframe.style.cssText = "width:100%;height:180px;border:none;border-radius:4px;";
		iframe.sandbox = "allow-scripts";
		preview.innerHTML = "";
		preview.appendChild(iframe);
	} else {
		let decoded = data;
		try {
			if (encoding === "base64") decoded = atob(data);
			else decoded = decodeURIComponent(data);
		} catch {}
		const pre = document.createElement("pre");
		pre.textContent = decoded.slice(0, 2000) + (decoded.length > 2000 ? "\n…(truncated)" : "");
		preview.innerHTML = "";
		preview.appendChild(pre);
	}
}

$("duri-download-btn").addEventListener("click", () => {
	const raw = $("duri-input").value.trim();
	if (!raw.startsWith("data:")) return toast("No valid data URI", "error");
	const a = document.createElement("a");
	a.href = raw;
	const mime = raw.match(/^data:([^;,]+)/)?.[1] ?? "";
	const ext = mime.split("/")[1] ?? "bin";
	a.download = "decoded." + ext;
	a.click();
});

// Builder
function buildDataUri() {
	const input = $("duri-build-input").value;
	if (!input) {
		$("duri-build-output").value = "";
		return;
	}
	const mime = $("duri-build-mime").value;
	const useB64 = $("duri-build-b64").checked;
	let uri;
	if (useB64) {
		const b64 = btoa(unescape(encodeURIComponent(input)));
		uri = `data:${mime};base64,${b64}`;
	} else {
		uri = `data:${mime};charset=utf-8,${encodeURIComponent(input)}`;
	}
	$("duri-build-output").value = uri;
}

$("duri-build-input").addEventListener("input", buildDataUri);
$("duri-build-mime").addEventListener("change", buildDataUri);
$("duri-build-b64").addEventListener("change", buildDataUri);
$("duri-build-copy-btn").addEventListener("click", () => copyText($("duri-build-output").value));

/* ══════════════════════════════════════════════════════════════
   06 — DIFF
   ══════════════════════════════════════════════════════════════ */

const diffState = { mode: "base64" };

$("diff-b64-btn").addEventListener("click", () => {
	diffState.mode = "base64";
	$("diff-b64-btn").classList.add("active");
	$("diff-url-btn").classList.remove("active");
});

$("diff-url-btn").addEventListener("click", () => {
	diffState.mode = "url";
	$("diff-url-btn").classList.add("active");
	$("diff-b64-btn").classList.remove("active");
});

$("diff-run-btn").addEventListener("click", runDiff);

function diffDecode(str) {
	if (diffState.mode === "base64") {
		str = str.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
		while (str.length % 4) str += "=";
		const raw = atob(str);
		const bytes = new Uint8Array(raw.length);
		for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
		try {
			return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
		} catch {
			return raw;
		}
	} else {
		return decodeURIComponent(str.replace(/\+/g, " "));
	}
}

function runDiff() {
	const a = $("diff-a").value.trim();
	const b = $("diff-b").value.trim();
	hide("diff-error");

	if (!a || !b) {
		toast("Enter both strings to compare", "error");
		return;
	}

	let da, db;
	try {
		da = diffDecode(a);
	} catch (e) {
		$("diff-error").textContent = "String A decode error: " + e.message;
		show("diff-error");
		return;
	}
	try {
		db = diffDecode(b);
	} catch (e) {
		$("diff-error").textContent = "String B decode error: " + e.message;
		show("diff-error");
		return;
	}

	const { htmlA, htmlB, same, changed } = computeDiff(da, db);
	$("diff-content-a").innerHTML = htmlA;
	$("diff-content-b").innerHTML = htmlB;
	$("diff-same").textContent = same;
	$("diff-changed").textContent = changed;
	$("diff-len-a").textContent = da.length;
	$("diff-len-b").textContent = db.length;
	show("diff-result");
}

// Simple word-level diff
function computeDiff(a, b) {
	const wa = a.split(/(\s+)/);
	const wb = b.split(/(\s+)/);
	const lcs = computeLCS(wa, wb);

	let ia = 0,
		ib = 0,
		li = 0;
	let htmlA = "",
		htmlB = "";
	let same = 0,
		changed = 0;

	while (ia < wa.length || ib < wb.length) {
		if (li < lcs.length && ia === lcs[li][0] && ib === lcs[li][1]) {
			const w = escHtml(wa[ia]);
			htmlA += `<span class="diff-eq">${w}</span>`;
			htmlB += `<span class="diff-eq">${w}</span>`;
			same += wa[ia].length;
			ia++;
			ib++;
			li++;
		} else {
			if (ia < wa.length && (li >= lcs.length || ia < lcs[li][0])) {
				htmlA += `<span class="diff-del">${escHtml(wa[ia])}</span>`;
				changed += wa[ia].length;
				ia++;
			}
			if (ib < wb.length && (li >= lcs.length || ib < lcs[li][1])) {
				htmlB += `<span class="diff-add">${escHtml(wb[ib])}</span>`;
				changed += wb[ib].length;
				ib++;
			}
		}
	}
	return { htmlA, htmlB, same, changed };
}

function computeLCS(a, b) {
	// DP LCS for small arrays (cap at 200 tokens for perf)
	const maxA = Math.min(a.length, 200);
	const maxB = Math.min(b.length, 200);
	const dp = Array.from({ length: maxA + 1 }, () => new Int32Array(maxB + 1));
	for (let i = 1; i <= maxA; i++) {
		for (let j = 1; j <= maxB; j++) {
			dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
		}
	}
	// Backtrack
	const result = [];
	let i = maxA,
		j = maxB;
	while (i > 0 && j > 0) {
		if (a[i - 1] === b[j - 1]) {
			result.unshift([i - 1, j - 1]);
			i--;
			j--;
		} else if (dp[i - 1][j] > dp[i][j - 1]) i--;
		else j--;
	}
	return result;
}

/* ── JSON syntax colors ─────────────────────────────────────── */
const style = document.createElement("style");
style.textContent = `
  .json-key  { color: #7c6bff; }
  .json-str  { color: #a3e635; }
  .json-num  { color: #fb923c; }
  .json.bool { color: #f87171; }
  .json-null { color: #94a3b8; }
`;
document.head.appendChild(style);

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
initCursorGlow();
