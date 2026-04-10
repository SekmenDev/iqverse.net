/* =============================
   QR Forge - app.js
   ============================= */

const state = {
	type: "url",
	dotStyle: "square",
	cornerStyle: "square",
	colorDots: "#000000",
	colorBg: "#ffffff",
	colorCorner: "#000000",
	margin: 20,
	size: 320,
	logoData: null,
	logoSize: 0.2,
	logoMargin: 4,
	logoBgStyle: "transparent",
	errorLevel: "M",
	exportFmt: "png",
	exportSize: 1024,
};

// ─── QR Instance ───────────────────────────────────────────────────────────

const qrCode = new QRCodeStyling({
	width: state.size,
	height: state.size,
	type: "canvas",
	data: "https://example.com",
	dotsOptions: { type: "square", color: "#000000" },
	cornersSquareOptions: { type: "square", color: "#000000" },
	cornersDotOptions: { type: "", color: "#000000" },
	backgroundOptions: { color: "#ffffff" },
	imageOptions: { crossOrigin: "anonymous", margin: 4 },
	qrOptions: { errorCorrectionLevel: "M" },
});

qrCode.append(document.getElementById("qrContainer"));

// ─── Data Building ─────────────────────────────────────────────────────────

function buildData() {
	switch (state.type) {
		case "url":
			return document.getElementById("input-url").value || "https://example.com";
		case "text":
			return document.getElementById("input-text").value || "Hello World";
		case "email": {
			const e = document.getElementById("input-email").value || "hello@example.com";
			const s = encodeURIComponent(document.getElementById("input-email-subject").value || "");
			const b = encodeURIComponent(document.getElementById("input-email-body").value || "");
			return `mailto:${e}?subject=${s}&body=${b}`;
		}
		case "wifi": {
			const ssid = document.getElementById("input-wifi-ssid").value || "Network";
			const pass = document.getElementById("input-wifi-pass").value || "";
			const sec = document.getElementById("input-wifi-sec").value || "WPA";
			return `WIFI:T:${sec};S:${ssid};P:${pass};;`;
		}
		case "vcard": {
			const n = document.getElementById("input-vcard-name").value || "Name";
			const p = document.getElementById("input-vcard-phone").value || "";
			const em = document.getElementById("input-vcard-email").value || "";
			const c = document.getElementById("input-vcard-company").value || "";
			const u = document.getElementById("input-vcard-url").value || "";
			return `BEGIN:VCARD\nVERSION:3.0\nFN:${n}\nTEL:${p}\nEMAIL:${em}\nORG:${c}\nURL:${u}\nEND:VCARD`;
		}
		default:
			return "https://example.com";
	}
}

// ─── QR Update ─────────────────────────────────────────────────────────────

function updateQR() {
	const data = buildData();
	const logoBg = getLogoBgColor();

	qrCode.update({
		width: state.size,
		height: state.size,
		data,
		image: state.logoData || "",
		dotsOptions: { type: state.dotStyle, color: state.colorDots },
		cornersSquareOptions: { type: state.cornerStyle, color: state.colorCorner },
		cornersDotOptions: { type: "", color: state.colorCorner },
		backgroundOptions: { color: state.colorBg },
		imageOptions: {
			crossOrigin: "anonymous",
			margin: state.logoMargin,
			imageSize: state.logoSize,
			...(logoBg ? { background: logoBg } : {}),
		},
		qrOptions: { errorCorrectionLevel: state.errorLevel },
	});

	updateMeta(data);
}

function getLogoBgColor() {
	if (state.logoBgStyle === "white") return "#ffffff";
	if (state.logoBgStyle === "qr") return state.colorBg;
	return "transparent";
}

function updateMeta(data) {
	const len = new TextEncoder().encode(data).length;
	document.getElementById("meta-data-length").textContent = `${len} bytes`;
	document.getElementById("meta-ec").textContent = {
		L: "Low - 7%",
		M: "Medium - 15%",
		Q: "Quartile - 25%",
		H: "High - 30%",
	}[state.errorLevel];
	// Version is harder to extract; estimate
	const v = Math.max(1, Math.ceil(len / 25));
	document.getElementById("meta-version").textContent = `≈ ${Math.min(v, 40)}`;
}

// ─── Tab Navigation ────────────────────────────────────────────────────────

function switchTab(name) {
	document.querySelectorAll(".tab-panel").forEach((p) => p.classList.add("hidden"));
	document.querySelectorAll(".step").forEach((s) => {
		s.classList.remove("active");
		const tabName = s.dataset.tab;
		// mark previous tabs as done
		const order = ["content", "style", "logo", "export"];
		if (order.indexOf(tabName) < order.indexOf(name)) s.classList.add("done");
		else s.classList.remove("done");
	});

	document.getElementById(`tab-${name}`).classList.remove("hidden");
	document.querySelector(`.step[data-tab="${name}"]`).classList.add("active");
}

document.querySelectorAll(".step").forEach((btn) => {
	btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// ─── Content Type Switcher ─────────────────────────────────────────────────

document.querySelectorAll(".type-btn").forEach((btn) => {
	btn.addEventListener("click", () => {
		document.querySelectorAll(".type-btn").forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
		state.type = btn.dataset.type;

		["url", "text", "email", "wifi", "vcard"].forEach((t) => {
			const el = document.getElementById(`fields-${t}`);
			if (el) el.classList.toggle("hidden", t !== state.type);
		});
		updateQR();
	});
});

// ─── Content Inputs ────────────────────────────────────────────────────────

[
	"input-url",
	"input-text",
	"input-email",
	"input-email-subject",
	"input-email-body",
	"input-wifi-ssid",
	"input-wifi-pass",
	"input-wifi-sec",
	"input-vcard-name",
	"input-vcard-phone",
	"input-vcard-email",
	"input-vcard-company",
	"input-vcard-url",
].forEach((id) => {
	const el = document.getElementById(id);
	if (el) el.addEventListener("input", updateQR);
});

document.getElementById("error-level").addEventListener("change", (e) => {
	state.errorLevel = e.target.value;
	updateQR();
});

// ─── Dot Style Picker ──────────────────────────────────────────────────────

document.querySelectorAll("#dot-style-picker .shape-btn").forEach((btn) => {
	btn.addEventListener("click", () => {
		document.querySelectorAll("#dot-style-picker .shape-btn").forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
		state.dotStyle = btn.dataset.val;
		updateQR();
	});
});

document.querySelectorAll("#corner-style-picker .shape-btn").forEach((btn) => {
	btn.addEventListener("click", () => {
		document.querySelectorAll("#corner-style-picker .shape-btn").forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
		state.cornerStyle = btn.dataset.val;
		updateQR();
	});
});

// ─── Color Pickers ─────────────────────────────────────────────────────────

function bindColor(inputId, hexId, stateKey) {
	const input = document.getElementById(inputId);
	const hex = document.getElementById(hexId);
	input.addEventListener("input", (e) => {
		state[stateKey] = e.target.value;
		hex.textContent = e.target.value;
		updateQR();
	});
}

bindColor("color-dots", "hex-dots", "colorDots");
bindColor("color-bg", "hex-bg", "colorBg");
bindColor("color-corner", "hex-corner", "colorCorner");

// ─── Presets ───────────────────────────────────────────────────────────────

document.querySelectorAll(".preset-chip").forEach((chip) => {
	chip.addEventListener("click", () => {
		const dots = chip.dataset.dots;
		const bg = chip.dataset.bg;
		const corner = chip.dataset.corner;

		state.colorDots = dots;
		state.colorBg = bg;
		state.colorCorner = corner;

		document.getElementById("color-dots").value = dots;
		document.getElementById("color-bg").value = bg;
		document.getElementById("color-corner").value = corner;
		document.getElementById("hex-dots").textContent = dots;
		document.getElementById("hex-bg").textContent = bg;
		document.getElementById("hex-corner").textContent = corner;

		updateQR();
	});
});

// ─── Sliders ───────────────────────────────────────────────────────────────

document.getElementById("margin-size").addEventListener("input", (e) => {
	state.margin = parseInt(e.target.value);
	document.getElementById("margin-val").textContent = e.target.value;
	updateQR();
});

document.getElementById("qr-size").addEventListener("input", (e) => {
	state.size = parseInt(e.target.value);
	document.getElementById("size-val").textContent = e.target.value + "px";
	updateQR();
});

document.getElementById("logo-size").addEventListener("input", (e) => {
	state.logoSize = parseFloat(e.target.value);
	document.getElementById("logo-size-val").textContent = Math.round(e.target.value * 100) + "%";
	updateQR();
});

document.getElementById("logo-margin").addEventListener("input", (e) => {
	state.logoMargin = parseInt(e.target.value);
	document.getElementById("logo-margin-val").textContent = e.target.value + "px";
	updateQR();
});

document.getElementById("logo-bg-style").addEventListener("change", (e) => {
	state.logoBgStyle = e.target.value;
	updateQR();
});

// ─── Logo Upload ───────────────────────────────────────────────────────────

const uploadZone = document.getElementById("uploadZone");
const logoInput = document.getElementById("logoUpload");

uploadZone.addEventListener("click", () => logoInput.click());
uploadZone.addEventListener("dragover", (e) => {
	e.preventDefault();
	uploadZone.classList.add("drag-over");
});
uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("drag-over"));
uploadZone.addEventListener("drop", (e) => {
	e.preventDefault();
	uploadZone.classList.remove("drag-over");
	const file = e.dataTransfer.files[0];
	if (file && file.type.startsWith("image/")) loadLogo(file);
});

logoInput.addEventListener("change", (e) => {
	const file = e.target.files[0];
	if (file) loadLogo(file);
});

function loadLogo(file) {
	const reader = new FileReader();
	reader.onload = (ev) => {
		state.logoData = ev.target.result;
		document.getElementById("logoThumb").src = ev.target.result;
		document.getElementById("logoFilename").textContent = file.name;
		document.getElementById("logoPreviewRow").classList.remove("hidden");
		uploadZone.classList.add("hidden");
		updateQR();
	};
	reader.readAsDataURL(file);
}

document.getElementById("removeLogoBtn").addEventListener("click", () => {
	state.logoData = null;
	logoInput.value = "";
	document.getElementById("logoPreviewRow").classList.add("hidden");
	uploadZone.classList.remove("hidden");
	updateQR();
});

// ─── Export ────────────────────────────────────────────────────────────────

document.querySelectorAll(".export-btn").forEach((btn) => {
	btn.addEventListener("click", () => {
		document.querySelectorAll(".export-btn").forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
		state.exportFmt = btn.dataset.fmt;
		document.getElementById("export-ext").textContent = "." + btn.dataset.fmt;
	});
});

document.getElementById("export-size").addEventListener("change", (e) => {
	const custom = document.getElementById("custom-size-row");
	if (e.target.value === "custom") {
		custom.classList.remove("hidden");
	} else {
		custom.classList.add("hidden");
		state.exportSize = parseInt(e.target.value);
	}
});

document.getElementById("custom-size-val").addEventListener("input", (e) => {
	state.exportSize = parseInt(e.target.value) || 1024;
});

async function doDownload() {
	const size =
		document.getElementById("export-size").value === "custom"
			? parseInt(document.getElementById("custom-size-val").value) || 1024
			: parseInt(document.getElementById("export-size").value);

	const filename = document.getElementById("export-filename").value || "my-qr-code";
	const fmt = state.exportFmt;

	const exportQr = new QRCodeStyling({
		width: size,
		height: size,
		type: "canvas",
		data: buildData(),
		image: state.logoData || "",
		dotsOptions: { type: state.dotStyle, color: state.colorDots },
		cornersSquareOptions: { type: state.cornerStyle, color: state.colorCorner },
		cornersDotOptions: { type: "", color: state.colorCorner },
		backgroundOptions: { color: state.colorBg },
		imageOptions: {
			crossOrigin: "anonymous",
			margin: state.logoMargin,
			imageSize: state.logoSize,
		},
		qrOptions: { errorCorrectionLevel: state.errorLevel },
	});

	exportQr.download({ name: filename, extension: fmt });
}

document.getElementById("downloadBtn").addEventListener("click", doDownload);

// ─── Copy to Clipboard ─────────────────────────────────────────────────────

document.getElementById("copyBtn").addEventListener("click", async () => {
	const btn = document.getElementById("copyBtn");
	try {
		const container = document.createElement("div");
		const tempQr = new QRCodeStyling({
			width: 512,
			height: 512,
			type: "canvas",
			data: buildData(),
			image: state.logoData || "",
			dotsOptions: { type: state.dotStyle, color: state.colorDots },
			cornersSquareOptions: { type: state.cornerStyle, color: state.colorCorner },
			cornersDotOptions: { type: "", color: state.colorCorner },
			backgroundOptions: { color: state.colorBg },
			imageOptions: { crossOrigin: "anonymous", margin: state.logoMargin, imageSize: state.logoSize },
			qrOptions: { errorCorrectionLevel: state.errorLevel },
		});
		document.body.appendChild(container);
		tempQr.append(container);

		await new Promise((r) => setTimeout(r, 300));
		const canvas = container.querySelector("canvas");
		canvas.toBlob(async (blob) => {
			try {
				await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
				btn.classList.add("success");
				btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
				setTimeout(() => {
					btn.classList.remove("success");
					btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy to clipboard`;
				}, 2000);
			} catch {
				alert("Clipboard write failed. Try downloading instead.");
			}
			document.body.removeChild(container);
		});
	} catch (err) {
		console.error(err);
	}
});

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

updateQR();

initCursorGlow();
