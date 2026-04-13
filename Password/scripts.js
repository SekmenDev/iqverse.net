/* =========================================
   SecretForge — app.js
   All logic. No external dependencies.
   ========================================= */

"use strict";

// ── State ──────────────────────────────────
const state = {
	activeTab: "password",
	activePreset: null,
	lastGenerated: "",
	lastType: "",
	history: [],
};

// ── DOM Refs ───────────────────────────────
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// ── Wordlist for passphrase ────────────────
const WORDS = [
	"amber",
	"arctic",
	"blazing",
	"bridge",
	"canyon",
	"castle",
	"cipher",
	"cloud",
	"cobalt",
	"coral",
	"crimson",
	"crystal",
	"dagger",
	"delta",
	"dream",
	"drift",
	"ember",
	"falcon",
	"feral",
	"fierce",
	"flame",
	"forest",
	"forge",
	"frost",
	"galaxy",
	"ghost",
	"giant",
	"glacier",
	"glitch",
	"gloom",
	"golden",
	"granite",
	"harbor",
	"helix",
	"hollow",
	"hunter",
	"indigo",
	"island",
	"jungle",
	"kernel",
	"laser",
	"lemon",
	"light",
	"lunar",
	"marble",
	"matrix",
	"mirror",
	"mystic",
	"nebula",
	"noble",
	"nomad",
	"north",
	"obsidian",
	"ocean",
	"orbit",
	"outlaw",
	"oxide",
	"ozone",
	"panic",
	"patrol",
	"phantom",
	"photon",
	"pilgrim",
	"pixel",
	"plasma",
	"prism",
	"pulse",
	"quartz",
	"radar",
	"raptor",
	"raven",
	"rebel",
	"ridge",
	"river",
	"robot",
	"rocket",
	"rogue",
	"ruby",
	"rustic",
	"sapphire",
	"savage",
	"scarlet",
	"shadow",
	"shield",
	"signal",
	"silent",
	"silver",
	"solar",
	"sonic",
	"spectre",
	"sphinx",
	"spiral",
	"steel",
	"stitch",
	"storm",
	"stream",
	"strider",
	"swift",
	"sword",
	"tiger",
	"timber",
	"titan",
	"token",
	"torch",
	"tunnel",
	"turbo",
	"ultra",
	"vector",
	"vertex",
	"violet",
	"viper",
	"vortex",
	"warden",
	"wave",
	"whisper",
	"wolf",
	"zenith",
	"zero",
	"zephyr",
	"nova",
	"comet",
	"quasar",
	"pulsar",
	"abyss",
	"blaze",
	"canyon",
];

// ── Char sets ──────────────────────────────
const CHARS = {
	upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	lower: "abcdefghijklmnopqrstuvwxyz",
	digits: "0123456789",
	symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
	similar: "0Oo1IlL",
	ambiguous: "{}[]()/\\'\"`~,;:.<>",
};

// ── Crypto random ──────────────────────────
function randBytes(n) {
	const buf = new Uint8Array(n);
	crypto.getRandomValues(buf);
	return buf;
}
function randInt(max) {
	const bytes = randBytes(4);
	const view = new DataView(bytes.buffer);
	return view.getUint32(0) % max;
}
function pickRandom(arr) {
	return arr[randInt(arr.length)];
}
function shuffle(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = randInt(i + 1);
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

// ── Password Generator ─────────────────────
function generatePassword() {
	const length = parseInt($("pwd-length").value);
	const useUpper = $("pwd-upper").checked;
	const useLower = $("pwd-lower").checked;
	const useDigits = $("pwd-digits").checked;
	const useSyms = $("pwd-symbols").checked;
	const exSimilar = $("pwd-similar").checked;
	const exAmbig = $("pwd-ambiguous").checked;
	const customSym = $("pwd-custom-symbols").value.trim();
	const prefix = $("pwd-prefix").value;
	const suffix = $("pwd-suffix").value;
	const minUpper = Math.max(0, parseInt($("min-upper").value) || 0);
	const minLower = Math.max(0, parseInt($("min-lower").value) || 0);
	const minDigits = Math.max(0, parseInt($("min-digits").value) || 0);
	const minSyms = Math.max(0, parseInt($("min-symbols").value) || 0);

	if (!useUpper && !useLower && !useDigits && !useSyms) {
		showToast("Select at least one character set", "error");
		return null;
	}

	let pool = "";
	if (useUpper) pool += CHARS.upper;
	if (useLower) pool += CHARS.lower;
	if (useDigits) pool += CHARS.digits;
	if (useSyms) pool += customSym || CHARS.symbols;

	if (exSimilar) pool = [...pool].filter((c) => !CHARS.similar.includes(c)).join("");
	if (exAmbig) pool = [...pool].filter((c) => !CHARS.ambiguous.includes(c)).join("");

	if (!pool.length) {
		showToast("Character pool is empty after filters", "error");
		return null;
	}

	const coreLen = length - prefix.length - suffix.length;
	if (coreLen < 1) {
		showToast("Length too short for prefix/suffix", "error");
		return null;
	}

	// Guarantee minimums
	const required = [];
	if (useUpper) for (let i = 0; i < minUpper; i++) required.push(pickRandom([...CHARS.upper].filter((c) => pool.includes(c))));
	if (useLower) for (let i = 0; i < minLower; i++) required.push(pickRandom([...CHARS.lower].filter((c) => pool.includes(c))));
	if (useDigits) for (let i = 0; i < minDigits; i++) required.push(pickRandom([...CHARS.digits].filter((c) => pool.includes(c))));
	if (useSyms) {
		const symPool = customSym || CHARS.symbols;
		for (let i = 0; i < minSyms; i++) required.push(pickRandom([...symPool].filter((c) => pool.includes(c))));
	}

	const rest = coreLen - required.length;
	if (rest < 0) {
		showToast("Min counts exceed length", "error");
		return null;
	}

	const poolArr = [...pool];
	const chars = [...required];
	for (let i = 0; i < rest; i++) chars.push(pickRandom(poolArr));
	shuffle(chars);

	return prefix + chars.join("") + suffix;
}

// ── Secret / Token Generator ───────────────
function generateSecret() {
	const type = document.querySelector('input[name="secret-type"]:checked')?.value || "hex";
	const bytes = parseInt($("secret-bytes").value);
	const pinLen = parseInt($("pin-length").value);
	const wCount = parseInt($("word-count").value);
	const sep = document.querySelector('input[name="sep"]:checked')?.value || "-";
	const fmt = document.querySelector('input[name="fmt"]:checked')?.value || "raw";
	const envKey = $("env-key-name").value.trim() || "SECRET_KEY";

	let raw = "";

	switch (type) {
		case "hex": {
			const buf = randBytes(bytes);
			raw = Array.from(buf)
				.map((b) => b.toString(16).padStart(2, "0"))
				.join("");
			break;
		}
		case "base64": {
			const buf = randBytes(bytes);
			raw = btoa(String.fromCharCode(...buf));
			break;
		}
		case "base64url": {
			const buf = randBytes(bytes);
			raw = btoa(String.fromCharCode(...buf))
				.replace(/\+/g, "-")
				.replace(/\//g, "_")
				.replace(/=/g, "");
			break;
		}
		case "uuid": {
			const buf = randBytes(16);
			buf[6] = (buf[6] & 0x0f) | 0x40;
			buf[8] = (buf[8] & 0x3f) | 0x80;
			const hex = Array.from(buf)
				.map((b) => b.toString(16).padStart(2, "0"))
				.join("");
			raw = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
			break;
		}
		case "ulid": {
			raw = generateULID();
			break;
		}
		case "alphanumeric": {
			const alnum = CHARS.upper + CHARS.lower + CHARS.digits;
			const arr = [...alnum];
			const buf = randBytes(bytes);
			raw = Array.from(buf)
				.map((b) => arr[b % arr.length])
				.join("");
			break;
		}
		case "pin": {
			const buf = randBytes(pinLen);
			raw = Array.from(buf)
				.map((b) => b % 10)
				.join("");
			break;
		}
		case "mnemonic": {
			const picked = [];
			for (let i = 0; i < wCount; i++) picked.push(pickRandom(WORDS));
			raw = picked.join(sep);
			break;
		}
	}

	// Format
	let output = raw;
	if (fmt === "env") output = `${envKey}=${raw}`;
	if (fmt === "json") output = JSON.stringify({ [envKey]: raw }, null, 2);

	return output;
}

function generateULID() {
	const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
	const ts = Date.now();
	let time = "";
	let t = ts;
	for (let i = 9; i >= 0; i--) {
		time = ENCODING[t % 32] + time;
		t = Math.floor(t / 32);
	}
	let random = "";
	const buf = randBytes(10);
	for (const b of buf) random += ENCODING[b % 32];
	return time + random;
}

// ── Bulk Presets ───────────────────────────
const PRESETS = {
	dotenv: (n) => {
		const lines = [
			"# App Secrets",
			`APP_KEY=${genHex(32)}`,
			`APP_SECRET=${genHex(32)}`,
			"",
			"# Database",
			`DB_PASSWORD=${genPwd(20)}`,
			`DB_ROOT_PASSWORD=${genPwd(24)}`,
			"",
			"# JWT",
			`JWT_SECRET=${genHex(32)}`,
			`JWT_REFRESH_SECRET=${genHex(32)}`,
			"",
			"# Redis",
			`REDIS_PASSWORD=${genPwd(20)}`,
			"",
			"# Email / SMTP",
			`SMTP_PASSWORD=${genPwd(16)}`,
			"",
			"# API Keys",
		];
		for (let i = 1; i <= n; i++) lines.push(`API_KEY_${i}=${genB64url(32)}`);
		return lines.join("\n");
	},
	database: (n) => {
		const lines = ["# Database Credentials"];
		for (let i = 1; i <= n; i++) {
			const user = WORDS[randInt(WORDS.length)];
			lines.push(`DB_USER_${i}=${user}`);
			lines.push(`DB_PASSWORD_${i}=${genPwd(20)}`);
			lines.push(`DB_NAME_${i}=${user}_db`);
			lines.push("");
		}
		return lines.join("\n").trim();
	},
	jwt: (n) => {
		const lines = ["# JWT Secrets"];
		for (let i = 1; i <= n; i++) {
			lines.push(`JWT_ACCESS_SECRET_${i}=${genHex(32)}`);
			lines.push(`JWT_REFRESH_SECRET_${i}=${genHex(48)}`);
			lines.push("");
		}
		return lines.join("\n").trim();
	},
	api: (n) => {
		const lines = ["# API Key Pairs"];
		for (let i = 1; i <= n; i++) {
			lines.push(`API_PUBLIC_KEY_${i}=pk_${genB64url(16)}`);
			lines.push(`API_PRIVATE_KEY_${i}=sk_${genB64url(32)}`);
			lines.push("");
		}
		return lines.join("\n").trim();
	},
	docker: (n) => {
		const lines = ["# Docker Secrets"];
		for (let i = 1; i <= n; i++) {
			lines.push(`DOCKER_REGISTRY_PASSWORD_${i}=${genPwd(24)}`);
			lines.push(`DOCKER_ADMIN_PASSWORD_${i}=${genPwd(20)}`);
			lines.push("");
		}
		return lines.join("\n").trim();
	},
	abp: () => {
		const appKey = genHex(32);
		return [
			"# ABP Framework — Full Stack Secrets",
			"",
			"# OpenIddict / Identity Server",
			`OpenIddict__Applications__WebApp__ClientSecret=${genB64url(32)}`,
			`OpenIddict__Applications__ApiSwagger__ClientSecret=${genB64url(32)}`,
			"",
			"# Database",
			`ConnectionStrings__Default=Server=localhost;Database=MyAppDb;User Id=sa;Password=${genPwd(20)};`,
			"",
			"# Redis Cache",
			`Redis__Configuration=localhost:6379,password=${genPwd(16)}`,
			"",
			"# RabbitMQ",
			`RabbitMQ__Connections__Default__HostName=localhost`,
			`RabbitMQ__Connections__Default__UserName=admin`,
			`RabbitMQ__Connections__Default__Password=${genPwd(20)}`,
			"",
			"# App Encryption Key",
			`Encryptor__Key=${appKey}`,
			"",
			"# Blob / Storage",
			`BlobStoring__AzureProvider__ConnectionString=DefaultEndpointsProtocol=https;AccountName=myapp;AccountKey=${genB64(32)};`,
			"",
			"# Email SMTP",
			`Emailing__Smtp__Password=${genPwd(16)}`,
		].join("\n");
	},
};

function genHex(b) {
	const buf = randBytes(b);
	return Array.from(buf)
		.map((x) => x.toString(16).padStart(2, "0"))
		.join("");
}
function genPwd(n) {
	const p = CHARS.upper + CHARS.lower + CHARS.digits + CHARS.symbols;
	const a = [...p];
	return Array.from(randBytes(n))
		.map((b) => a[b % a.length])
		.join("");
}
function genB64url(b) {
	const buf = randBytes(b);
	return btoa(String.fromCharCode(...buf))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");
}
function genB64(b) {
	const buf = randBytes(b);
	return btoa(String.fromCharCode(...buf));
}

// ── Entropy Calc ───────────────────────────
function calcEntropy(pwd) {
	const sets = [];
	if (/[A-Z]/.test(pwd)) sets.push(26);
	if (/[a-z]/.test(pwd)) sets.push(26);
	if (/[0-9]/.test(pwd)) sets.push(10);
	if (/[^A-Za-z0-9]/.test(pwd)) sets.push(32);
	const pool = sets.reduce((a, b) => a + b, 0) || 1;
	return Math.floor(pwd.length * Math.log2(pool));
}

function strengthLabel(bits) {
	if (bits < 28) return { label: "Very Weak", cls: "weak", color: "#f87171" };
	if (bits < 36) return { label: "Weak", cls: "weak", color: "#f87171" };
	if (bits < 60) return { label: "Fair", cls: "fair", color: "#fb923c" };
	if (bits < 80) return { label: "Good", cls: "good", color: "#fbbf24" };
	if (bits < 100) return { label: "Strong", cls: "strong", color: "#34d399" };
	return { label: "Very Strong", cls: "very-strong", color: "#6ee7b7" };
}

// ── Analyze ────────────────────────────────
function analyzeString(s) {
	if (!s.trim()) return;
	const bits = calcEntropy(s);
	const str = strengthLabel(bits);

	$("analyze-results").style.display = "block";

	const fill = $("strength-fill");
	const pct = Math.min(100, Math.round((bits / 128) * 100));
	fill.style.width = pct + "%";
	fill.style.background = str.color;

	const lbl = $("strength-label");
	lbl.textContent = str.label;
	lbl.style.color = str.color;

	const checks = [
		{ label: "Length ≥ 12", pass: s.length >= 12 },
		{ label: "Has uppercase", pass: /[A-Z]/.test(s) },
		{ label: "Has lowercase", pass: /[a-z]/.test(s) },
		{ label: "Has digit", pass: /[0-9]/.test(s) },
		{ label: "Has symbol", pass: /[^A-Za-z0-9]/.test(s) },
		{ label: "No repeated chars", pass: !/(.)\1{2}/.test(s) },
		{ label: "Not all same case", pass: /[A-Z]/.test(s) && /[a-z]/.test(s) },
		{ label: "Entropy ≥ 60 bits", pass: bits >= 60 },
	];

	const uniqueChars = new Set(s).size;
	const charTypes = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(s)).length;

	$("stat-grid").innerHTML = `
    <div class="stat-item"><div class="stat-val">${s.length}</div><div class="stat-key">Length</div></div>
    <div class="stat-item"><div class="stat-val">${bits}</div><div class="stat-key">Entropy bits</div></div>
    <div class="stat-item"><div class="stat-val">${uniqueChars}</div><div class="stat-key">Unique chars</div></div>
    <div class="stat-item"><div class="stat-val">${charTypes}</div><div class="stat-key">Char types</div></div>
  `;

	$("check-list").innerHTML = checks
		.map(
			(c) => `
    <div class="check-row">
      <div class="check-dot ${c.pass ? "pass" : "fail"}"></div>
      <span style="color:${c.pass ? "var(--text)" : "var(--text-dim)"}">${c.label}</span>
    </div>
  `,
		)
		.join("");
}

// ── Output / UI ────────────────────────────
function setOutput(text, type) {
	state.lastGenerated = text;
	state.lastType = type;

	const placeholder = document.querySelector(".output-placeholder");
	const outputEl = $("output-text");

	placeholder.style.display = "none";
	outputEl.style.display = "block";
	outputEl.textContent = text;

	// Strength badge
	if (type === "password" || type === "secret") {
		const raw = text
			.split("=")
			.pop()
			.replace(/^"(.*)"$/, "$1")
			.replace(/\n/g, "");
		const bits = calcEntropy(raw);
		const str = strengthLabel(bits);
		const badge = $("strength-badge");
		badge.className = "strength-badge " + str.cls;
		badge.querySelector(".badge-text").textContent = str.label;
		$("entropy-info").textContent = `${bits} bits of entropy`;
	} else {
		const badge = $("strength-badge");
		badge.className = "strength-badge";
		badge.querySelector(".badge-text").textContent = type;
		$("entropy-info").textContent = "";
	}

	addHistory(text, type);
}

function addHistory(val, type) {
	state.history.unshift({ val, type });
	if (state.history.length > 15) state.history.pop();
	renderHistory();
}

function renderHistory() {
	const list = $("history-list");
	if (!state.history.length) {
		list.innerHTML = '<div class="history-empty">No history yet</div>';
		return;
	}
	list.innerHTML = state.history
		.map(
			(h, i) => `
    <div class="history-item" data-index="${i}">
      <span class="history-val">${h.val.slice(0, 50)}${h.val.length > 50 ? "…" : ""}</span>
      <span class="history-type">${h.type}</span>
    </div>
  `,
		)
		.join("");
	list.querySelectorAll(".history-item").forEach((el) => {
		el.addEventListener("click", () => {
			const h = state.history[el.dataset.index];
			setOutput(h.val, h.type);
		});
	});
}

function showToast(msg, type = "success") {
	const t = $("toast");
	t.textContent = msg;
	t.style.borderColor = type === "error" ? "var(--accent-red)" : "var(--accent)";
	t.style.color = type === "error" ? "var(--accent-red)" : "var(--accent)";
	t.classList.add("show");
	setTimeout(() => t.classList.remove("show"), 2200);
}

function copyToClipboard(text) {
	navigator.clipboard
		.writeText(text)
		.then(() => showToast("✓ Copied to clipboard"))
		.catch(() => showToast("Copy failed", "error"));
}

function downloadFile(text, type) {
	const ext = type === "bulk" ? "env" : "txt";
	const blob = new Blob([text], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `secretforge-${type}-${Date.now()}.${ext}`;
	a.click();
	URL.revokeObjectURL(url);
}

// ── Event Listeners ────────────────────────

// Tabs
$$(".tab").forEach((btn) => {
	btn.addEventListener("click", () => {
		$$(".tab").forEach((t) => t.classList.remove("active"));
		$$(".tab-content").forEach((c) => c.classList.remove("active"));
		btn.classList.add("active");
		state.activeTab = btn.dataset.tab;
		$("tab-" + state.activeTab).classList.add("active");
	});
});

// Auto-regenerate helper
function autoRegenerate() {
	if (state.activeTab === "password") {
		const pwd = generatePassword();
		if (pwd) setOutput(pwd, "password");
	} else if (state.activeTab === "secret") {
		const sec = generateSecret();
		if (sec) setOutput(sec, "secret");
	} else if (state.activeTab === "bulk" && state.activePreset) {
		const n = parseInt($("bulk-count").value) || 5;
		const fn = PRESETS[state.activePreset];
		if (fn) {
			const output = fn(n);
			setOutput(output, "bulk");
		}
	}
}

// Slider displays + Auto-regenerate
$("pwd-length").addEventListener("input", (e) => {
	$("pwd-len-display").textContent = e.target.value;
	autoRegenerate();
});
$("secret-bytes").addEventListener("input", (e) => {
	$("secret-bytes-display").textContent = e.target.value;
	autoRegenerate();
});
$("pin-length").addEventListener("input", (e) => {
	$("pin-len-display").textContent = e.target.value;
	autoRegenerate();
});
$("word-count").addEventListener("input", (e) => {
	$("word-count-display").textContent = e.target.value;
	autoRegenerate();
});

// Secret type radio
$$('input[name="secret-type"]').forEach((radio) => {
	radio.addEventListener("change", () => {
		$$(".radio-item").forEach((item) => {
			item.classList.toggle("active-radio", item.dataset.val === radio.value);
		});
		const isPIN = radio.value === "pin";
		const isMnemonic = radio.value === "mnemonic";
		const isUUID = radio.value === "uuid" || radio.value === "ulid";
		$("secret-bytes-group").style.display = isPIN || isMnemonic || isUUID ? "none" : "block";
		$("pin-length-group").style.display = isPIN ? "block" : "none";
		$("mnemonic-group").style.display = isMnemonic ? "block" : "none";
		autoRegenerate();
	});
});

// Format radio
$$('input[name="fmt"]').forEach((radio) => {
	radio.addEventListener("change", () => {
		$("env-key-group").style.display = radio.value !== "raw" ? "block" : "none";
		autoRegenerate();
	});
});

// Separator radio
$$('input[name="sep"]').forEach((radio) => {
	radio.addEventListener("change", () => {
		autoRegenerate();
	});
});

// Password tab checkboxes - auto-regenerate on change
$$('input[id^="pwd-"]').forEach((input) => {
	if (input.type === "checkbox") {
		input.addEventListener("change", () => {
			autoRegenerate();
		});
	}
});

// Password tab prefix/suffix - auto-regenerate on input
$("pwd-prefix").addEventListener("input", () => {
	autoRegenerate();
});
$("pwd-suffix").addEventListener("input", () => {
	autoRegenerate();
});

// Password tab custom symbols - auto-regenerate on input
$("pwd-custom-symbols").addEventListener("input", () => {
	autoRegenerate();
});

// Password minimum counts - auto-regenerate on input
$$('input[id^="min-"]').forEach((input) => {
	input.addEventListener("input", () => {
		autoRegenerate();
	});
});

// Secret key name - auto-regenerate on input
$("env-key-name").addEventListener("input", () => {
	autoRegenerate();
});

// Generate bulk
$$(".preset-btn").forEach((btn) => {
	btn.addEventListener("click", () => {
		$$(".preset-btn").forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
		state.activePreset = btn.dataset.preset;
		autoRegenerate();
	});
});

// Auto-generate when bulk count changes
$("bulk-count").addEventListener("input", () => {
	autoRegenerate();
});

// Analyze
$("btn-analyze").addEventListener("click", () => {
	analyzeString($("analyze-input").value);
});
$("analyze-input").addEventListener("input", () => {
	analyzeString($("analyze-input").value);
});

// Copy
$("btn-copy").addEventListener("click", () => {
	if (state.lastGenerated) copyToClipboard(state.lastGenerated);
	else showToast("Nothing to copy yet", "error");
});

// Download
$("btn-download").addEventListener("click", () => {
	if (state.lastGenerated) downloadFile(state.lastGenerated, state.lastType);
	else showToast("Nothing to download yet", "error");
});

// Refresh
$("btn-refresh").addEventListener("click", () => {
	autoRegenerate();
});

// Clear history
$("btn-clear-history").addEventListener("click", () => {
	state.history = [];
	renderHistory();
});

// ── Click-to-copy on output ────────────────
$("output-text").addEventListener("click", () => {
	if (state.lastGenerated) {
		copyToClipboard(state.lastGenerated);
		$("output-text").style.opacity = "0.6";
		setTimeout(() => ($("output-text").style.opacity = "1"), 200);
	}
});

// ── Init: generate a password on load ──────
window.addEventListener("DOMContentLoaded", () => {
	const pwd = generatePassword();
	if (pwd) setOutput(pwd, "password");
});

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
