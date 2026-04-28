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

// ── JSON Formatter & Validator Tool ───────────────────────────────────────

class JSONToolkit {
	constructor() {
		this.jsonInput = document.getElementById("jsonInput");
		this.outputArea = document.getElementById("outputArea");
		this.outputSection = document.getElementById("outputSection");
		this.errorSection = document.getElementById("errorSection");
		this.statisticsSection = document.getElementById("statisticsSection");
		this.statusMessage = document.getElementById("statusMessage");
		this.errorMessage = document.getElementById("errorMessage");
		this.dropZone = document.getElementById("dropZone");
		this.fileInput = document.getElementById("fileInput");

		this.initEventListeners();
	}

	initEventListeners() {
		// Button listeners
		document.getElementById("validateBtn").addEventListener("click", () => this.validate());
		document.getElementById("formatBtn").addEventListener("click", () => this.format());
		document.getElementById("minifyBtn").addEventListener("click", () => this.minify());
		document.getElementById("sortBtn").addEventListener("click", () => this.sortKeys());
		document.getElementById("statisticsBtn").addEventListener("click", () => this.showStatistics());
		document.getElementById("clearBtn").addEventListener("click", () => this.clear());
		document.getElementById("copyBtn").addEventListener("click", () => this.copy());
		document.getElementById("downloadBtn").addEventListener("click", () => this.download());

		// Advanced tools
		document.getElementById("convertToCSVBtn").addEventListener("click", () => this.convertToCSV());
		document.getElementById("flattenBtn").addEventListener("click", () => this.flattenJSON());
		document.getElementById("findDuplicateKeysBtn").addEventListener("click", () => this.findDuplicateKeys());
		document.getElementById("validateSchemaBtn").addEventListener("click", () => this.compareJSONs());
		document.getElementById("escapeBtn").addEventListener("click", () => this.escapeString());
		document.getElementById("unescapeBtn").addEventListener("click", () => this.unescapeString());

		// File upload
		this.dropZone.addEventListener("click", () => this.fileInput.click());
		this.fileInput.addEventListener("change", (e) => this.handleFileUpload(e));

		// Drag and drop
		this.dropZone.addEventListener("dragover", (e) => {
			e.preventDefault();
			this.dropZone.classList.add("drag-over");
		});
		this.dropZone.addEventListener("dragleave", () => {
			this.dropZone.classList.remove("drag-over");
		});
		this.dropZone.addEventListener("drop", (e) => {
			e.preventDefault();
			this.dropZone.classList.remove("drag-over");
			const files = e.dataTransfer.files;
			if (files.length > 0) {
				this.fileInput.files = files;
				this.handleFileUpload({ target: { files } });
			}
		});
	}

	handleFileUpload(e) {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			this.jsonInput.value = event.target.result;
			this.validate();
		};
		reader.readAsText(file);
	}

	parseJSON() {
		try {
			// Remove comments if present
			let input = this.jsonInput.value.trim();
			input = this.removeComments(input);
			const parsed = JSON.parse(input);
			return { success: true, data: parsed, raw: input };
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	removeComments(str) {
		let insideString = false;
		let insideLineComment = false;
		let insideBlockComment = false;
		let result = "";

		for (let i = 0; i < str.length; i++) {
			const char = str[i];
			const nextChar = str[i + 1];

			if (char === '"' && str[i - 1] !== "\\") {
				insideString = !insideString;
				result += char;
				continue;
			}

			if (insideString) {
				result += char;
				continue;
			}

			if (char === "/" && nextChar === "/" && !insideBlockComment) {
				insideLineComment = true;
				continue;
			}

			if (insideLineComment && char === "\n") {
				insideLineComment = false;
				result += "\n";
				continue;
			}

			if (insideLineComment) {
				continue;
			}

			if (char === "/" && nextChar === "*") {
				insideBlockComment = true;
				i++;
				continue;
			}

			if (char === "*" && nextChar === "/" && insideBlockComment) {
				insideBlockComment = false;
				i++;
				continue;
			}

			if (!insideLineComment && !insideBlockComment) {
				result += char;
			}
		}

		return result;
	}

	validate() {
		this.hideAllSections();
		const parsed = this.parseJSON();

		if (parsed.success) {
			this.outputSection.style.display = "block";
			this.statusMessage.textContent = "✓ Valid JSON";
			this.statusMessage.style.color = "var(--accent)";
			this.outputArea.value = JSON.stringify(parsed.data, null, 2);
			this.errorSection.style.display = "none";
		} else {
			this.outputSection.style.display = "block";
			this.errorSection.style.display = "block";
			this.statusMessage.textContent = "✗ Invalid JSON";
			this.statusMessage.style.color = "#ff6464";
			this.errorMessage.textContent = `Error: ${parsed.error}`;
		}
	}

	format() {
		this.hideAllSections();
		const parsed = this.parseJSON();

		if (parsed.success) {
			this.outputSection.style.display = "block";
			const formatted = JSON.stringify(parsed.data, null, 2);
			this.outputArea.value = formatted;
			this.statusMessage.textContent = `✓ Formatted (${formatted.length} characters)`;
			this.statusMessage.style.color = "var(--accent)";
			this.errorSection.style.display = "none";
		} else {
			this.showError(parsed.error);
		}
	}

	minify() {
		this.hideAllSections();
		const parsed = this.parseJSON();

		if (parsed.success) {
			this.outputSection.style.display = "block";
			const minified = JSON.stringify(parsed.data);
			this.outputArea.value = minified;
			this.statusMessage.textContent = `✓ Minified (${minified.length} characters)`;
			this.statusMessage.style.color = "var(--accent)";
			this.errorSection.style.display = "none";
		} else {
			this.showError(parsed.error);
		}
	}

	sortKeys() {
		this.hideAllSections();
		const parsed = this.parseJSON();

		if (parsed.success) {
			const sorted = this.sortKeysRecursive(parsed.data);
			this.outputSection.style.display = "block";
			const result = JSON.stringify(sorted, null, 2);
			this.outputArea.value = result;
			this.statusMessage.textContent = "✓ Keys sorted alphabetically";
			this.statusMessage.style.color = "var(--accent)";
			this.errorSection.style.display = "none";
		} else {
			this.showError(parsed.error);
		}
	}

	sortKeysRecursive(obj) {
		if (Array.isArray(obj)) {
			return obj.map((item) => this.sortKeysRecursive(item));
		} else if (obj !== null && typeof obj === "object") {
			const sorted = {};
			Object.keys(obj)
				.sort()
				.forEach((key) => {
					sorted[key] = this.sortKeysRecursive(obj[key]);
				});
			return sorted;
		}
		return obj;
	}

	showStatistics() {
		this.hideAllSections();
		const parsed = this.parseJSON();

		if (parsed.success) {
			this.statisticsSection.style.display = "block";

			const input = this.jsonInput.value;
			const lines = input.split("\n").length;
			const fileSize = new Blob([input]).size;

			const keyCount = this.countKeys(parsed.data);
			const arrayCount = this.countArrays(parsed.data);
			const objectCount = this.countObjects(parsed.data);
			const primitiveCount = this.countPrimitives(parsed.data);
			const nullCount = this.countNulls(parsed.data);

			document.getElementById("statFileSize").textContent = this.formatBytes(fileSize);
			document.getElementById("statLines").textContent = lines;
			document.getElementById("statKeys").textContent = keyCount;

			const additionalStats = document.getElementById("additionalStats");
			additionalStats.innerHTML = `
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
					<div><strong>Arrays:</strong> ${arrayCount}</div>
					<div><strong>Objects:</strong> ${objectCount}</div>
					<div><strong>Primitives:</strong> ${primitiveCount}</div>
					<div><strong>Nulls:</strong> ${nullCount}</div>
					<div><strong>Minified Size:</strong> ${this.formatBytes(JSON.stringify(parsed.data).length)}</div>
					<div><strong>Indentation Savings:</strong> ${((1 - JSON.stringify(parsed.data).length / fileSize) * 100).toFixed(1)}%</div>
				</div>
			`;
		} else {
			this.showError(parsed.error);
		}
	}

	countKeys(obj) {
		let count = 0;
		const traverse = (item) => {
			if (item !== null && typeof item === "object") {
				if (!Array.isArray(item)) {
					count += Object.keys(item).length;
				}
				Object.values(item).forEach(traverse);
			}
		};
		traverse(obj);
		return count;
	}

	countArrays(obj) {
		let count = 0;
		const traverse = (item) => {
			if (Array.isArray(item)) {
				count++;
				item.forEach(traverse);
			} else if (item !== null && typeof item === "object") {
				Object.values(item).forEach(traverse);
			}
		};
		traverse(obj);
		return count;
	}

	countObjects(obj) {
		let count = 0;
		const traverse = (item) => {
			if (item !== null && typeof item === "object") {
				if (!Array.isArray(item)) {
					count++;
				}
				Object.values(item).forEach(traverse);
			}
		};
		traverse(obj);
		return count;
	}

	countPrimitives(obj) {
		let count = 0;
		const traverse = (item) => {
			if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
				count++;
			} else if (item !== null && typeof item === "object") {
				(Array.isArray(item) ? item : Object.values(item)).forEach(traverse);
			}
		};
		if (Array.isArray(obj) || typeof obj === "object") {
			(Array.isArray(obj) ? obj : Object.values(obj)).forEach(traverse);
		}
		return count;
	}

	countNulls(obj) {
		let count = 0;
		const traverse = (item) => {
			if (item === null) {
				count++;
			} else if (item !== null && typeof item === "object") {
				(Array.isArray(item) ? item : Object.values(item)).forEach(traverse);
			}
		};
		if (Array.isArray(obj) || typeof obj === "object") {
			(Array.isArray(obj) ? obj : Object.values(obj)).forEach(traverse);
		}
		return count;
	}

	formatBytes(bytes) {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
	}

	convertToCSV() {
		this.hideAllSections();
		const parsed = this.parseJSON();

		if (parsed.success) {
			let csv = "";

			if (Array.isArray(parsed.data)) {
				if (parsed.data.length > 0 && typeof parsed.data[0] === "object") {
					const headers = Object.keys(parsed.data[0]);
					csv = headers.join(",") + "\n";

					parsed.data.forEach((row) => {
						const values = headers.map((header) => {
							const val = row[header];
							if (val === null || val === undefined) return "";
							if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
							if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
							return val;
						});
						csv += values.join(",") + "\n";
					});
				}
			}

			if (csv) {
				this.outputSection.style.display = "block";
				this.outputArea.value = csv;
				this.statusMessage.textContent = "✓ Converted to CSV";
				this.statusMessage.style.color = "var(--accent)";
			} else {
				this.showError("This JSON cannot be converted to CSV. Array of objects is required.");
			}
		} else {
			this.showError(parsed.error);
		}
	}

	flattenJSON() {
		this.hideAllSections();
		const parsed = this.parseJSON();

		if (parsed.success) {
			const flattened = {};

			const flatten = (obj, prefix = "") => {
				Object.keys(obj).forEach((key) => {
					const value = obj[key];
					const newKey = prefix ? `${prefix}.${key}` : key;

					if (value !== null && typeof value === "object" && !Array.isArray(value)) {
						flatten(value, newKey);
					} else if (Array.isArray(value)) {
						flattened[newKey] = JSON.stringify(value);
					} else {
						flattened[newKey] = value;
					}
				});
			};

			if (typeof parsed.data === "object" && !Array.isArray(parsed.data)) {
				flatten(parsed.data);

				this.outputSection.style.display = "block";
				this.outputArea.value = JSON.stringify(flattened, null, 2);
				this.statusMessage.textContent = "✓ JSON flattened";
				this.statusMessage.style.color = "var(--accent)";
			} else {
				this.showError("Only objects can be flattened.");
			}
		} else {
			this.showError(parsed.error);
		}
	}

	findDuplicateKeys() {
		this.hideAllSections();
		const input = this.jsonInput.value.trim();

		const keyRegex = /"([^"\\]|\\.)*"(?=\s*:)/g;
		const matches = input.match(keyRegex) || [];

		const keys = matches.map((m) => m.replace(/"/g, ""));
		const duplicates = {};

		keys.forEach((key) => {
			duplicates[key] = (duplicates[key] || 0) + 1;
		});

		const duplicateKeys = Object.entries(duplicates).filter(([_, count]) => count > 1);

		this.outputSection.style.display = "block";

		if (duplicateKeys.length > 0) {
			let result = "Duplicate Keys Found:\n\n";
			duplicateKeys.forEach(([key, count]) => {
				result += `"${key}": appears ${count} times\n`;
			});
			this.outputArea.value = result;
			this.statusMessage.textContent = `⚠ Found ${duplicateKeys.length} duplicate keys`;
			this.statusMessage.style.color = "#ff9800";
		} else {
			this.outputArea.value = "No duplicate keys found.";
			this.statusMessage.textContent = "✓ No duplicate keys";
			this.statusMessage.style.color = "var(--accent)";
		}
	}

	compareJSONs() {
		this.hideAllSections();

		const comparisonHTML = `
			<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
				<div class="field">
					<label>JSON 1</label>
					<textarea id="compareJson1" placeholder='{"a": 1}' style="min-height: 150px;"></textarea>
				</div>
				<div class="field">
					<label>JSON 2</label>
					<textarea id="compareJson2" placeholder='{"a": 1}' style="min-height: 150px;"></textarea>
				</div>
			</div>
			<button class="btn btn-primary" id="doCompareBtn" onclick="jsonToolkit.performComparison()">Compare</button>
		`;

		const tempDiv = document.createElement("div");
		tempDiv.className = "card";
		tempDiv.innerHTML = comparisonHTML;
		this.outputArea.parentElement.insertBefore(tempDiv, this.outputArea);

		this.statusMessage.textContent = "Enter two JSONs to compare";
		this.statusMessage.style.color = "var(--text-muted)";
	}

	performComparison() {
		const json1Str = document.getElementById("compareJson1")?.value || "";
		const json2Str = document.getElementById("compareJson2")?.value || "";

		try {
			const json1 = JSON.parse(json1Str);
			const json2 = JSON.parse(json2Str);

			const comparison = this.deepCompare(json1, json2, "");
			this.outputSection.style.display = "block";
			this.outputArea.value = comparison || "JSONs are identical";
			this.statusMessage.textContent = "✓ Comparison complete";
			this.statusMessage.style.color = "var(--accent)";
		} catch (e) {
			this.showError("Invalid JSON in comparison inputs");
		}
	}

	deepCompare(obj1, obj2, path = "") {
		let differences = [];

		if (JSON.stringify(obj1) === JSON.stringify(obj2)) {
			return "";
		}

		const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

		keys.forEach((key) => {
			const newPath = path ? `${path}.${key}` : key;
			const val1 = obj1?.[key];
			const val2 = obj2?.[key];

			if (JSON.stringify(val1) !== JSON.stringify(val2)) {
				if (typeof val1 === "object" && val1 !== null && typeof val2 === "object" && val2 !== null) {
					const nested = this.deepCompare(val1, val2, newPath);
					if (nested) differences.push(nested);
				} else {
					differences.push(`Path: ${newPath}\n  JSON1: ${JSON.stringify(val1)}\n  JSON2: ${JSON.stringify(val2)}`);
				}
			}
		});

		return differences.join("\n\n");
	}

	escapeString() {
		this.hideAllSections();
		const input = this.jsonInput.value;

		try {
			const escaped = JSON.stringify(input).slice(1, -1);
			this.outputSection.style.display = "block";
			this.outputArea.value = escaped;
			this.statusMessage.textContent = "✓ String escaped";
			this.statusMessage.style.color = "var(--accent)";
		} catch (e) {
			this.showError("Error escaping string");
		}
	}

	unescapeString() {
		this.hideAllSections();
		const input = this.jsonInput.value;

		try {
			const unescaped = JSON.parse(`"${input}"`);
			this.outputSection.style.display = "block";
			this.outputArea.value = unescaped;
			this.statusMessage.textContent = "✓ String unescaped";
			this.statusMessage.style.color = "var(--accent)";
		} catch (e) {
			this.showError("Invalid escaped string: " + e.message);
		}
	}

	hideAllSections() {
		this.outputSection.style.display = "none";
		this.errorSection.style.display = "none";
		this.statisticsSection.style.display = "none";
	}

	showError(error) {
		this.hideAllSections();
		this.errorSection.style.display = "block";
		this.errorMessage.textContent = `Error: ${error}`;
		this.statusMessage.textContent = "✗ Error occurred";
		this.statusMessage.style.color = "#ff6464";
	}

	copy() {
		this.outputArea.select();
		document.execCommand("copy");

		const btn = document.getElementById("copyBtn");
		const originalText = btn.textContent;
		btn.textContent = "Copied!";
		setTimeout(() => {
			btn.textContent = originalText;
		}, 2000);
	}

	download() {
		const text = this.outputArea.value;
		const blob = new Blob([text], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "output.json";
		a.click();
		URL.revokeObjectURL(url);
	}

	clear() {
		this.jsonInput.value = "";
		this.outputArea.value = "";
		this.hideAllSections();
		this.fileInput.value = "";
	}
}

// Initialize the JSON Toolkit
const jsonToolkit = new JSONToolkit();
