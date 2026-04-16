/* ============================================================
   Chromata — Color Palette Generator
   app.js — All logic: color math, palette generation, export
   ============================================================ */

"use strict";

// ── State ────────────────────────────────────────────────────
const state = {
	seedHex: "#6366f1",
	shadesCount: 10,
	lightnessCurve: "linear",
	satBoost: 0,
	harmony: "complementary",
	includeNeutrals: true,
	includeSemantic: true,
	contrastTarget: "white",
	wcagLevel: "AA",
	colorBlindMode: "none",
	hueRotate: 0,
	lightnessShift: 0,
	exportFormat: "css",
	exportPrefix: "color",
	colorFormat: "hex",
	viewMode: "strip", // 'strip' | 'grid'
	palette: [],
	savedPalettes: JSON.parse(localStorage.getItem("chromata_saved") || "[]"),
};

// ── Color Math ───────────────────────────────────────────────
function hexToRgb(hex) {
	hex = hex.replace("#", "");
	if (hex.length === 3)
		hex = hex
			.split("")
			.map((c) => c + c)
			.join("");
	const n = parseInt(hex, 16);
	return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
	return (
		"#" +
		[r, g, b]
			.map((v) =>
				Math.round(Math.max(0, Math.min(255, v)))
					.toString(16)
					.padStart(2, "0"),
			)
			.join("")
	);
}

function rgbToHsl(r, g, b) {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h,
		s,
		l = (max + min) / 2;
	if (max === min) {
		h = s = 0;
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}
	return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
	h /= 360;
	s /= 100;
	l /= 100;
	let r, g, b;
	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function hslToHex(h, s, l) {
	const { r, g, b } = hslToRgb(h, s, l);
	return rgbToHex(r, g, b);
}

function hexToHsl(hex) {
	const { r, g, b } = hexToRgb(hex);
	return rgbToHsl(r, g, b);
}

function clamp(v, min, max) {
	return Math.max(min, Math.min(max, v));
}

// ── Lightness curve ──────────────────────────────────────────
function applyLightnessCurve(t, curve) {
	switch (curve) {
		case "ease-in":
			return t * t;
		case "ease-out":
			return 1 - (1 - t) * (1 - t);
		default:
			return t;
	}
}

// ── Generate shades for a hue ─────────────────────────────────
function generateShades(hex, count, opts = {}) {
	const { curve = "linear", satBoost = 0, hueRotate = 0, lightnessShift = 0 } = opts;
	const { h, s } = hexToHsl(hex);
	const adjustedH = (h + hueRotate + 360) % 360;
	const adjustedS = clamp(s + satBoost, 0, 100);

	const shades = [];
	for (let i = 0; i < count; i++) {
		const t = i / (count - 1);
		const lt = applyLightnessCurve(t, curve);
		const l = clamp(95 - lt * 88 + lightnessShift, 2, 98);
		const shadeHex = hslToHex(adjustedH, adjustedS, l);
		const label = count === 10 ? (i + 1) * 100 : Math.round(l);
		shades.push({ hex: shadeHex, label: String(label), l });
	}
	return shades;
}

// ── Harmony colors ────────────────────────────────────────────
function getHarmonyHues(baseHue, harmony) {
	switch (harmony) {
		case "complementary":
			return [baseHue, (baseHue + 180) % 360];
		case "triadic":
			return [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
		case "analogous":
			return [baseHue, (baseHue + 30) % 360, (baseHue - 30 + 360) % 360];
		case "split-complementary":
			return [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360];
		case "tetradic":
			return [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360];
		case "monochromatic":
			return [baseHue];
		default:
			return [baseHue];
	}
}

const HARMONY_NAMES = {
	complementary: ["Primary", "Accent"],
	triadic: ["Primary", "Secondary", "Tertiary"],
	analogous: ["Primary", "Warm", "Cool"],
	"split-complementary": ["Primary", "Accent A", "Accent B"],
	tetradic: ["Primary", "Secondary", "Tertiary", "Quaternary"],
	monochromatic: ["Primary"],
};

// ── Generate full palette ─────────────────────────────────────
function generatePalette() {
	const { h, s } = hexToHsl(state.seedHex);
	const hues = getHarmonyHues(h, state.harmony);
	const names = HARMONY_NAMES[state.harmony];

	const opts = {
		curve: state.lightnessCurve,
		satBoost: state.satBoost,
		hueRotate: state.hueRotate,
		lightnessShift: state.lightnessShift,
	};

	const groups = [];

	hues.forEach((hue, idx) => {
		const hueHex = hslToHex(hue, s, hexToHsl(state.seedHex).l);
		groups.push({
			name: names[idx] || `Color ${idx + 1}`,
			key: `${names[idx]?.toLowerCase().replace(/\s+/g, "-") || "color-" + idx}`,
			shades: generateShades(hueHex, state.shadesCount, opts),
		});
	});

	if (state.includeNeutrals) {
		const neutralHex = hslToHex(h, clamp(s * 0.08, 0, 15), 50);
		groups.push({
			name: "Neutral",
			key: "neutral",
			shades: generateShades(neutralHex, state.shadesCount, { ...opts, satBoost: 0 }),
		});
	}

	if (state.includeSemantic) {
		const semantics = [
			{ name: "Success", key: "success", hex: "#10b981" },
			{ name: "Warning", key: "warning", hex: "#f59e0b" },
			{ name: "Danger", key: "danger", hex: "#ef4444" },
		];
		semantics.forEach((sem) => {
			groups.push({
				name: sem.name,
				key: sem.key,
				shades: generateShades(sem.hex, state.shadesCount, opts),
			});
		});
	}

	state.palette = groups;
	return groups;
}

// ── Contrast ratio ────────────────────────────────────────────
function luminance(hex) {
	const { r, g, b } = hexToRgb(hex);
	const toL = (v) => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	};
	return 0.2126 * toL(r) + 0.7152 * toL(g) + 0.0722 * toL(b);
}

function contrastRatio(hex1, hex2) {
	const l1 = luminance(hex1),
		l2 = luminance(hex2);
	const lighter = Math.max(l1, l2),
		darker = Math.min(l1, l2);
	return (lighter + 0.05) / (darker + 0.05);
}

const WCAG_THRESHOLDS = { A: 3, AA: 4.5, AAA: 7 };

function wcagPass(ratio, level) {
	return ratio >= WCAG_THRESHOLDS[level];
}

// ── Color blindness simulation ────────────────────────────────
const CB_MATRICES = {
	deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
	protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
	tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
	achromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
};

function simulateColorBlind(hex, mode) {
	if (mode === "none") return hex;
	const m = CB_MATRICES[mode];
	if (!m) return hex;
	const { r, g, b } = hexToRgb(hex);
	const sr = clamp(Math.round(r * m[0] + g * m[1] + b * m[2]), 0, 255);
	const sg = clamp(Math.round(r * m[3] + g * m[4] + b * m[5]), 0, 255);
	const sb = clamp(Math.round(r * m[6] + g * m[7] + b * m[8]), 0, 255);
	return rgbToHex(sr, sg, sb);
}

// ── Format color ──────────────────────────────────────────────
function formatColor(hex, format) {
	if (format === "hex") return hex;
	const { r, g, b } = hexToRgb(hex);
	if (format === "rgb") return `rgb(${r}, ${g}, ${b})`;
	const { h, s, l } = rgbToHsl(r, g, b);
	return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

// ── Export generators ─────────────────────────────────────────
function exportCSS(palette, prefix, colorFormat) {
	const lines = [":root {"];
	palette.forEach((group) => {
		lines.push(`  /* ${group.name} */`);
		group.shades.forEach((shade) => {
			lines.push(`  --${prefix}-${group.key}-${shade.label}: ${formatColor(shade.hex, colorFormat)};`);
		});
		lines.push("");
	});
	lines.push("}");
	return lines.join("\n");
}

function exportSASS(palette, prefix, colorFormat) {
	const lines = [];
	palette.forEach((group) => {
		lines.push(`// ${group.name}`);
		group.shades.forEach((shade) => {
			lines.push(`$${prefix}-${group.key}-${shade.label}: ${formatColor(shade.hex, colorFormat)};`);
		});
		lines.push("");
	});
	return lines.join("\n");
}

function exportTailwind(palette, prefix, colorFormat) {
	const lines = ["// tailwind.config.js", "module.exports = {", "  theme: {", "    extend: {", "      colors: {"];
	palette.forEach((group) => {
		lines.push(`        '${prefix}-${group.key}': {`);
		group.shades.forEach((shade) => {
			lines.push(`          '${shade.label}': '${formatColor(shade.hex, colorFormat)}',`);
		});
		lines.push("        },");
	});
	lines.push("      },", "    },", "  },", "};");
	return lines.join("\n");
}

function exportFigma(palette, prefix, colorFormat) {
	const tokens = {};
	palette.forEach((group) => {
		tokens[group.key] = {};
		group.shades.forEach((shade) => {
			tokens[group.key][shade.label] = {
				value: formatColor(shade.hex, colorFormat),
				type: "color",
				description: `${group.name} ${shade.label}`,
			};
		});
	});
	return JSON.stringify({ [prefix]: tokens }, null, 2);
}

function exportJSON(palette, prefix, colorFormat) {
	const obj = {};
	palette.forEach((group) => {
		obj[group.key] = {};
		group.shades.forEach((shade) => {
			obj[group.key][shade.label] = formatColor(shade.hex, colorFormat);
		});
	});
	return JSON.stringify({ [prefix]: obj }, null, 2);
}

function exportSwift(palette, prefix, colorFormat) {
	const lines = ["import UIKit", "", "extension UIColor {", "  struct Palette {"];
	palette.forEach((group) => {
		lines.push(`    struct ${capitalize(group.key)} {`);
		group.shades.forEach((shade) => {
			const { r, g, b } = hexToRgb(shade.hex);
			lines.push(
				`      static let shade${shade.label} = UIColor(red: ${(r / 255).toFixed(3)}, green: ${(g / 255).toFixed(3)}, blue: ${(b / 255).toFixed(3)}, alpha: 1.0)`,
			);
		});
		lines.push("    }");
	});
	lines.push("  }", "}");
	return lines.join("\n");
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function getExportCode() {
	const { palette, exportPrefix: prefix, exportFormat: fmt, colorFormat } = state;
	switch (fmt) {
		case "css":
			return exportCSS(palette, prefix, colorFormat);
		case "sass":
			return exportSASS(palette, prefix, colorFormat);
		case "tailwind":
			return exportTailwind(palette, prefix, colorFormat);
		case "figma":
			return exportFigma(palette, prefix, colorFormat);
		case "json":
			return exportJSON(palette, prefix, colorFormat);
		case "swift":
			return exportSwift(palette, prefix, colorFormat);
		default:
			return "";
	}
}

// ── Render palette ────────────────────────────────────────────
function render() {
	generatePalette();
	renderSwatches();
	renderA11y();
	updateMeta();
	updateCodeBlock();
}

function renderSwatches() {
	const container = document.getElementById("paletteContainer");
	container.innerHTML = "";
	if (state.viewMode === "grid") {
		container.classList.add("grid-view");
	} else {
		container.classList.remove("grid-view");
	}

	state.palette.forEach((group) => {
		const groupEl = document.createElement("div");
		groupEl.className = "palette-group";

		const label = document.createElement("div");
		label.className = "palette-group-label";
		label.textContent = group.name;
		groupEl.appendChild(label);

		const swatches = document.createElement("div");
		swatches.className = "palette-swatches";

		group.shades.forEach((shade) => {
			const displayHex = simulateColorBlind(shade.hex, state.colorBlindMode);
			const swatch = document.createElement("div");
			swatch.className = "swatch";
			swatch.style.background = displayHex;

			const ratio = contrastRatio(displayHex, "#ffffff");
			const passes = wcagPass(ratio, state.wcagLevel);
			const textColor = luminance(displayHex) > 0.4 ? "#000000aa" : "#ffffffaa";

			const badge = document.createElement("div");
			badge.className = `swatch-a11y-badge ${passes ? "badge-pass" : "badge-fail"}`;
			badge.textContent = state.wcagLevel + (passes ? "✓" : "✗");

			const info = document.createElement("div");
			info.className = "swatch-info";

			const hexEl = document.createElement("div");
			hexEl.className = "swatch-hex";
			hexEl.style.color = textColor;
			hexEl.textContent = displayHex.toUpperCase();

			const labelEl = document.createElement("div");
			labelEl.className = "swatch-label";
			labelEl.style.color = textColor;
			labelEl.textContent = `${group.key}-${shade.label}`;

			const hint = document.createElement("div");
			hint.className = "swatch-copy-hint";
			hint.textContent = "Click to copy";

			info.appendChild(hexEl);
			info.appendChild(labelEl);
			swatch.appendChild(badge);
			swatch.appendChild(info);
			swatch.appendChild(hint);

			swatch.addEventListener("click", () => {
				const colorStr = formatColor(displayHex, state.colorFormat);
				navigator.clipboard.writeText(colorStr).then(() => showToast(`Copied ${colorStr}`));
			});

			swatches.appendChild(swatch);
		});

		groupEl.appendChild(swatches);
		container.appendChild(groupEl);
	});
}

function renderA11y() {
	const grid = document.getElementById("a11yGrid");
	const badge = document.getElementById("a11yBadge");
	grid.innerHTML = "";

	let total = 0,
		passing = 0;
	const threshold = WCAG_THRESHOLDS[state.wcagLevel];

	state.palette.forEach((group) => {
		group.shades.forEach((shade) => {
			const displayHex = simulateColorBlind(shade.hex, state.colorBlindMode);
			const ratioW = contrastRatio(displayHex, "#ffffff");
			const ratioB = contrastRatio(displayHex, "#000000");

			total++;
			const checkW = ratioW >= threshold;
			const checkB = ratioB >= threshold;
			if (checkW || checkB) passing++;

			const cell = document.createElement("div");
			cell.className = "a11y-cell";

			const colorRow = document.createElement("div");
			colorRow.className = "a11y-cell-color";

			const dot = document.createElement("div");
			dot.className = "a11y-dot";
			dot.style.background = displayHex;

			const hexText = document.createElement("div");
			hexText.className = "a11y-cell-hex";
			hexText.textContent = displayHex.toUpperCase();

			colorRow.appendChild(dot);
			colorRow.appendChild(hexText);

			const ratios = document.createElement("div");
			ratios.className = "a11y-ratios";

			const targets = [];
			if (state.contrastTarget === "white" || state.contrastTarget === "both") {
				targets.push({ label: `W:${ratioW.toFixed(1)}`, pass: checkW });
			}
			if (state.contrastTarget === "black" || state.contrastTarget === "both") {
				targets.push({ label: `B:${ratioB.toFixed(1)}`, pass: checkB });
			}

			targets.forEach((t) => {
				const tag = document.createElement("span");
				tag.className = `ratio-tag ${t.pass ? "pass" : "fail"}`;
				tag.textContent = t.label;
				ratios.appendChild(tag);
			});

			cell.appendChild(colorRow);
			cell.appendChild(ratios);
			grid.appendChild(cell);
		});
	});

	const pct = total > 0 ? Math.round((passing / total) * 100) : 0;
	badge.textContent = `${pct}% pass (${passing}/${total})`;
	badge.className = `a11y-badge ${pct >= 70 ? "pass" : pct >= 40 ? "warn" : "fail"}`;
}

function updateMeta() {
	document.getElementById("metaSeed").textContent = state.seedHex.toUpperCase();
	document.getElementById("metaHarmony").textContent = state.harmony.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	document.getElementById("metaCount").textContent = `${state.shadesCount} shades`;
}

function updateCodeBlock() {
	const code = document.getElementById("codeOutput");
	const label = document.getElementById("codeBlockLabel");
	const labels = {
		css: "CSS Variables",
		sass: "SCSS Variables",
		tailwind: "Tailwind Config",
		figma: "Figma Tokens (JSON)",
		json: "JSON",
		swift: "Swift UIColor",
	};
	label.textContent = labels[state.exportFormat] || "Code";
	code.textContent = getExportCode();
}

// ── Saved palettes ────────────────────────────────────────────
function savePalette() {
	const preview = state.palette
		.slice(0, 2)
		.flatMap((g) => g.shades.slice(0, 5))
		.map((s) => s.hex);
	const entry = {
		id: Date.now(),
		seed: state.seedHex,
		harmony: state.harmony,
		shades: state.shadesCount,
		preview,
		timestamp: new Date().toLocaleString(),
		palette: JSON.parse(JSON.stringify(state.palette)),
	};
	state.savedPalettes.unshift(entry);
	if (state.savedPalettes.length > 20) state.savedPalettes.pop();
	localStorage.setItem("chromata_saved", JSON.stringify(state.savedPalettes));
	renderSaved();
	showToast("Palette saved!");
}

function renderSaved() {
	const section = document.getElementById("savedSection");
	const list = document.getElementById("savedList");
	if (state.savedPalettes.length === 0) {
		section.style.display = "none";
		return;
	}
	section.style.display = "";
	list.innerHTML = "";
	state.savedPalettes.forEach((entry) => {
		const item = document.createElement("div");
		item.className = "saved-item";

		const swatches = document.createElement("div");
		swatches.className = "saved-item-swatches";
		entry.preview.forEach((hex) => {
			const s = document.createElement("div");
			s.className = "saved-swatch-mini";
			s.style.background = hex;
			swatches.appendChild(s);
		});

		const lbl = document.createElement("div");
		lbl.className = "saved-item-label";
		lbl.textContent = entry.seed.toUpperCase();

		const meta = document.createElement("div");
		meta.className = "saved-item-meta";
		meta.textContent = `${entry.harmony} · ${entry.shades}sh`;

		const del = document.createElement("button");
		del.className = "saved-delete";
		del.title = "Delete";
		del.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>`;
		del.addEventListener("click", (e) => {
			e.stopPropagation();
			state.savedPalettes = state.savedPalettes.filter((p) => p.id !== entry.id);
			localStorage.setItem("chromata_saved", JSON.stringify(state.savedPalettes));
			renderSaved();
		});

		item.addEventListener("click", () => {
			state.seedHex = entry.seed;
			state.harmony = entry.harmony;
			state.shadesCount = entry.shades;
			state.palette = entry.palette;
			syncUIToState();
			render();
			showToast("Palette loaded");
		});

		item.appendChild(swatches);
		item.appendChild(lbl);
		item.appendChild(meta);
		item.appendChild(del);
		list.appendChild(item);
	});
}

function syncUIToState() {
	document.getElementById("seedColorPicker").value = state.seedHex;
	document.getElementById("seedColorHex").value = state.seedHex;
	document.getElementById("shadesCount").value = state.shadesCount;
	document.getElementById("shadesCountVal").textContent = state.shadesCount;

	document.querySelectorAll("#harmonyGrid .harmony-btn").forEach((btn) => {
		btn.classList.toggle("active", btn.dataset.harmony === state.harmony);
	});
}

// ── Toast ─────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
	const t = document.getElementById("toast");
	t.textContent = msg;
	t.classList.add("show");
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ── Download ──────────────────────────────────────────────────
function downloadFile() {
	const code = getExportCode();
	const ext = { css: "css", sass: "scss", tailwind: "js", figma: "json", json: "json", swift: "swift" };
	const mime = {
		css: "text/css",
		sass: "text/x-scss",
		tailwind: "application/javascript",
		figma: "application/json",
		json: "application/json",
		swift: "text/swift",
	};
	const blob = new Blob([code], { type: mime[state.exportFormat] });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${state.exportPrefix}-palette.${ext[state.exportFormat]}`;
	a.click();
	URL.revokeObjectURL(url);
	showToast("File downloaded!");
}

// ── Random color ──────────────────────────────────────────────
function randomHex() {
	const h = Math.random() * 360;
	const s = 55 + Math.random() * 35;
	const l = 40 + Math.random() * 25;
	return hslToHex(h, s, l);
}

// ── Step navigation ───────────────────────────────────────────
function activateStep(step) {
	document.querySelectorAll(".step-btn").forEach((b) => b.classList.toggle("active", b.dataset.step === step));
	document.querySelectorAll(".step-panel").forEach((p) => p.classList.toggle("active", p.id === `panel-${step}`));
}

// ── Wire up UI ────────────────────────────────────────────────
function initUI() {
	// Step nav
	document.querySelectorAll(".step-btn").forEach((btn) => {
		btn.addEventListener("click", () => activateStep(btn.dataset.step));
	});

	// Next buttons
	document.querySelectorAll(".btn-next").forEach((btn) => {
		btn.addEventListener("click", () => activateStep(btn.dataset.next));
	});

	// Seed color picker
	const picker = document.getElementById("seedColorPicker");
	const hexIn = document.getElementById("seedColorHex");

	picker.addEventListener("input", (e) => {
		state.seedHex = e.target.value;
		hexIn.value = state.seedHex;
		render();
	});

	hexIn.addEventListener("input", (e) => {
		const val = e.target.value;
		if (/^#[0-9a-fA-F]{6}$/.test(val)) {
			state.seedHex = val;
			picker.value = val;
			render();
		}
	});

	hexIn.addEventListener("blur", (e) => {
		let val = e.target.value.trim();
		if (!val.startsWith("#")) val = "#" + val;
		if (/^#[0-9a-fA-F]{3}$/.test(val)) {
			val = "#" + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
		}
		if (/^#[0-9a-fA-F]{6}$/.test(val)) {
			state.seedHex = val;
			picker.value = val;
			hexIn.value = val;
			render();
		} else {
			hexIn.value = state.seedHex;
		}
	});

	// Random
	document.getElementById("btnRandom").addEventListener("click", () => {
		state.seedHex = randomHex();
		picker.value = state.seedHex;
		hexIn.value = state.seedHex;
		render();
	});

	// Shades count
	const shadesInput = document.getElementById("shadesCount");
	const shadesVal = document.getElementById("shadesCountVal");
	shadesInput.addEventListener("input", (e) => {
		state.shadesCount = +e.target.value;
		shadesVal.textContent = state.shadesCount;
		render();
	});

	// Lightness curve
	bindSegmentControl("lightnessCurve", (val) => {
		state.lightnessCurve = val;
		render();
	});

	// Saturation boost
	const satInput = document.getElementById("satBoost");
	const satVal = document.getElementById("satBoostVal");
	satInput.addEventListener("input", (e) => {
		state.satBoost = +e.target.value;
		satVal.textContent = state.satBoost > 0 ? `+${state.satBoost}` : state.satBoost;
		render();
	});

	// Harmony grid
	document.querySelectorAll(".harmony-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			document.querySelectorAll(".harmony-btn").forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");
			state.harmony = btn.dataset.harmony;
			render();
		});
	});

	// Toggles
	document.getElementById("includeNeutrals").addEventListener("change", (e) => {
		state.includeNeutrals = e.target.checked;
		render();
	});
	document.getElementById("includeSemantic").addEventListener("change", (e) => {
		state.includeSemantic = e.target.checked;
		render();
	});

	// Contrast target
	bindSegmentControl("contrastTarget", (val) => {
		state.contrastTarget = val;
		renderA11y();
	});

	// WCAG level
	bindSegmentControl("wcagLevel", (val) => {
		state.wcagLevel = val;
		renderSwatches();
		renderA11y();
	});

	// Color blind mode
	document.getElementById("colorBlindMode").addEventListener("change", (e) => {
		state.colorBlindMode = e.target.value;
		render();
	});

	// Hue rotate
	const hueInput = document.getElementById("hueRotate");
	const hueVal = document.getElementById("hueRotateVal");
	hueInput.addEventListener("input", (e) => {
		state.hueRotate = +e.target.value;
		hueVal.textContent = state.hueRotate + "°";
		render();
	});

	// Lightness shift
	const lsInput = document.getElementById("lightnessShift");
	const lsVal = document.getElementById("lightnessShiftVal");
	lsInput.addEventListener("input", (e) => {
		state.lightnessShift = +e.target.value;
		lsVal.textContent = state.lightnessShift > 0 ? `+${state.lightnessShift}` : state.lightnessShift;
		render();
	});

	// Export format
	document.querySelectorAll(".format-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			document.querySelectorAll(".format-btn").forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");
			state.exportFormat = btn.dataset.format;
			updateCodeBlock();
		});
	});

	// Export prefix
	document.getElementById("exportPrefix").addEventListener("input", (e) => {
		state.exportPrefix = e.target.value || "color";
		updateCodeBlock();
	});

	// Color format
	bindSegmentControl("colorFormat", (val) => {
		state.colorFormat = val;
		updateCodeBlock();
	});

	// Copy code
	document.getElementById("btnCopyCode").addEventListener("click", () => {
		navigator.clipboard.writeText(getExportCode()).then(() => showToast("Code copied!"));
	});

	// Download
	document.getElementById("btnDownload").addEventListener("click", downloadFile);

	// Toggle view
	document.getElementById("btnToggleView").addEventListener("click", () => {
		state.viewMode = state.viewMode === "strip" ? "grid" : "strip";
		renderSwatches();
	});

	// Save palette
	document.getElementById("btnSavePalette").addEventListener("click", savePalette);

	// Clear saved
	document.getElementById("btnClearSaved").addEventListener("click", () => {
		state.savedPalettes = [];
		localStorage.removeItem("chromata_saved");
		renderSaved();
	});
}

function bindSegmentControl(id, cb) {
	document
		.getElementById(id)
		.querySelectorAll(".seg-btn")
		.forEach((btn) => {
			btn.addEventListener("click", () => {
				document
					.getElementById(id)
					.querySelectorAll(".seg-btn")
					.forEach((b) => b.classList.remove("active"));
				btn.classList.add("active");
				cb(btn.dataset.val);
			});
		});
}

// ── Init ──────────────────────────────────────────────────────
initUI();
renderSaved();
render();
