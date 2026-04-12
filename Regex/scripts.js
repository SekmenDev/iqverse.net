/* =========================================================
   RegEx Forge – app.js
   ========================================================= */

"use strict";

// ================================================================
// LIBRARY DATA
// ================================================================
const LIBRARY = [
	{
		name: "Email Address",
		cat: "validation",
		pattern: "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",
		flags: "i",
		desc: "Validates a standard email address format.",
	},
	{
		name: "URL (http/https)",
		cat: "web",
		pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
		flags: "gi",
		desc: "Matches http and https URLs including paths and query strings.",
	},
	{
		name: "IPv4 Address",
		cat: "validation",
		pattern: "\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b",
		flags: "g",
		desc: "Validates IPv4 addresses (0.0.0.0 – 255.255.255.255).",
	},
	{ name: "IPv6 Address", cat: "validation", pattern: "(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}", flags: "gi", desc: "Matches full IPv6 address notation." },
	{
		name: "Phone (US)",
		cat: "validation",
		pattern: "\\+?1?\\s*\\(?\\d{3}\\)?[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{4}",
		flags: "g",
		desc: "Validates US phone numbers in various formats.",
	},
	{ name: "Phone (International)", cat: "validation", pattern: "\\+?[1-9]\\d{1,14}", flags: "g", desc: "E.164 format international phone numbers." },
	{
		name: "Credit Card",
		cat: "security",
		pattern: "\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\\b",
		flags: "g",
		desc: "Matches Visa, MasterCard, Amex, Discover card numbers.",
	},
	{
		name: "SSN (US)",
		cat: "security",
		pattern: "\\b(?!000|666|9\\d{2})\\d{3}-(?!00)\\d{2}-(?!0{4})\\d{4}\\b",
		flags: "g",
		desc: "Validates Social Security Numbers (US) with known invalid ranges excluded.",
	},
	{
		name: "Date (YYYY-MM-DD)",
		cat: "dates",
		pattern: "\\b\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b",
		flags: "g",
		desc: "ISO 8601 date format validation.",
	},
	{ name: "Date (MM/DD/YYYY)", cat: "dates", pattern: "\\b(0[1-9]|1[0-2])\\/(0[1-9]|[12]\\d|3[01])\\/\\d{4}\\b", flags: "g", desc: "US-style date format." },
	{
		name: "Time (HH:MM:SS)",
		cat: "dates",
		pattern: "\\b([01]?\\d|2[0-3]):[0-5]\\d:[0-5]\\d\\b",
		flags: "g",
		desc: "Matches 24-hour time format with seconds.",
	},
	{
		name: "HTML Tag",
		cat: "web",
		pattern: "<([a-z][a-z0-9]*)\\b[^>]*>(.*?)<\\/\\1>",
		flags: "gi",
		desc: "Matches HTML tags with their content. Captures tag name and inner content.",
	},
	{ name: "HTML Attribute", cat: "web", pattern: "(\\w+)=[\"']([^\"']*)[\"']", flags: "g", desc: "Extracts HTML attribute name and value pairs." },
	{
		name: "Hex Color",
		cat: "extraction",
		pattern: "#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b",
		flags: "gi",
		desc: "Matches CSS hex color codes, both 3-digit and 6-digit.",
	},
	{
		name: "RGB/RGBA Color",
		cat: "extraction",
		pattern: "rgba?\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*(?:,\\s*[\\d.]+)?\\s*\\)",
		flags: "gi",
		desc: "Matches CSS rgb() and rgba() color functions.",
	},
	{
		name: "JWT Token",
		cat: "security",
		pattern: "[A-Za-z0-9_-]{2,}\\.[A-Za-z0-9_-]{2,}\\.[A-Za-z0-9_-]{2,}",
		flags: "g",
		desc: "Matches JSON Web Token (JWT) in three-part dot-separated format.",
	},
	{
		name: "Password (Strong)",
		cat: "security",
		pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
		flags: "",
		desc: "Requires min 8 chars: uppercase, lowercase, digit and special character.",
	},
	{
		name: "Username",
		cat: "validation",
		pattern: "^[a-zA-Z][a-zA-Z0-9_-]{2,15}$",
		flags: "",
		desc: "Starts with a letter, 3–16 characters, letters/numbers/underscore/dash.",
	},
	{
		name: "Slug",
		cat: "formatting",
		pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
		flags: "",
		desc: "URL-friendly slug: lowercase letters, numbers and single hyphens.",
	},
	{ name: "Markdown Heading", cat: "extraction", pattern: "^(#{1,6})\\s+(.+)$", flags: "gm", desc: "Extracts Markdown headings (h1–h6) and their text." },
	{ name: "Markdown Link", cat: "extraction", pattern: "\\[([^\\]]+)\\]\\(([^)]+)\\)", flags: "g", desc: "Extracts Markdown link text and URL." },
	{ name: "Markdown Bold", cat: "extraction", pattern: "\\*\\*([^*]+)\\*\\*|__([^_]+)__", flags: "g", desc: "Matches bold Markdown text (** or __)." },
	{
		name: "Extract Numbers",
		cat: "extraction",
		pattern: "-?\\d+(?:\\.\\d+)?",
		flags: "g",
		desc: "Extracts integers and decimals, including negative numbers.",
	},
	{ name: "Extract Words", cat: "extraction", pattern: "\\b[a-zA-Z]+\\b", flags: "g", desc: "Extracts sequences of alphabetic characters (words)." },
	{ name: "Whitespace Collapse", cat: "formatting", pattern: "\\s{2,}", flags: "g", desc: "Finds multiple consecutive whitespace characters for collapsing." },
	{ name: "Trim Whitespace", cat: "formatting", pattern: "^\\s+|\\s+$", flags: "g", desc: "Matches leading and trailing whitespace for trimming." },
	{ name: "Empty Lines", cat: "formatting", pattern: "^\\s*$", flags: "gm", desc: "Matches blank or whitespace-only lines." },
	{ name: "Duplicate Words", cat: "formatting", pattern: "\\b(\\w+)\\s+\\1\\b", flags: "gi", desc: 'Finds consecutive duplicate words (e.g., "the the").' },
	{ name: "Camel to Snake", cat: "formatting", pattern: "([a-z])([A-Z])", flags: "g", desc: "Use with replacement $1_$2 to convert camelCase to snake_case." },
	{
		name: "Base64 String",
		cat: "extraction",
		pattern: "(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})",
		flags: "g",
		desc: "Matches Base64-encoded strings.",
	},
	{
		name: "UUID",
		cat: "extraction",
		pattern: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
		flags: "gi",
		desc: "Matches standard UUIDs / GUIDs.",
	},
];

// ================================================================
// REFERENCE DATA
// ================================================================
const REFERENCE = [
	{
		title: "Anchors",
		rows: [
			["^", "Start of string (or line with m flag)"],
			["$", "End of string (or line with m flag)"],
			["\\b", "Word boundary"],
			["\\B", "Non-word boundary"],
			["\\A", "Start of string (no multiline)"],
			["\\Z", "End of string (no multiline)"],
		],
	},
	{
		title: "Character Classes",
		rows: [
			[".", "Any character (except newline)"],
			["\\d", "Digit [0-9]"],
			["\\D", "Non-digit"],
			["\\w", "Word character [a-zA-Z0-9_]"],
			["\\W", "Non-word character"],
			["\\s", "Whitespace (space, tab, newline…)"],
			["\\S", "Non-whitespace"],
			["[abc]", "Character class (a, b or c)"],
			["[^abc]", "Negated class (not a, b or c)"],
			["[a-z]", "Character range"],
		],
	},
	{
		title: "Quantifiers",
		rows: [
			["*", "Zero or more (greedy)"],
			["+", "One or more (greedy)"],
			["?", "Zero or one (greedy)"],
			["{n}", "Exactly n times"],
			["{n,}", "n or more times"],
			["{n,m}", "Between n and m times"],
			["*?", "Zero or more (lazy)"],
			["+?", "One or more (lazy)"],
			["??", "Zero or one (lazy)"],
		],
	},
	{
		title: "Groups & Lookarounds",
		rows: [
			["(abc)", "Capturing group"],
			["(?:abc)", "Non-capturing group"],
			["(?<name>abc)", "Named capturing group"],
			["(?=abc)", "Positive lookahead"],
			["(?!abc)", "Negative lookahead"],
			["(?<=abc)", "Positive lookbehind"],
			["(?<!abc)", "Negative lookbehind"],
			["\\1", "Back-reference to group 1"],
		],
	},
	{
		title: "Flags",
		rows: [
			["g", "Global — find all matches"],
			["i", "Case insensitive"],
			["m", "Multiline — ^ $ match lines"],
			["s", "Single-line — . matches \\n"],
			["u", "Unicode mode"],
			["y", "Sticky — match from lastIndex"],
		],
	},
	{
		title: "Escape Sequences",
		rows: [
			["\\n", "Newline"],
			["\\r", "Carriage return"],
			["\\t", "Tab"],
			["\\0", "Null character"],
			["\\uXXXX", "Unicode code point"],
			["\\xHH", "Hex character"],
			["\\.", "Literal dot"],
		],
	},
	{
		title: "Alternation & Special",
		rows: [
			["a|b", "Alternation (a or b)"],
			["[\\s\\S]", "Match any character including newline"],
			["(?i)", "Inline flag (some engines)"],
			["\\p{L}", "Unicode letter (u flag required)"],
			["\\p{N}", "Unicode number (u flag required)"],
		],
	},
	{
		title: "Replacement Tokens",
		rows: [
			["$0", "Entire match"],
			["$1 … $9", "Capture group 1–9"],
			["$<name>", "Named capture group"],
			["$$", "Literal dollar sign"],
			["$&", "Whole match (alt syntax)"],
			["$`", "String before match"],
			["$'", "String after match"],
		],
	},
];

// ================================================================
// TOKEN EXPLAINER DATA
// ================================================================
const TOKEN_DEFS = [
	{
		re: /^\^/,
		type: "anchor",
		label: "^",
		title: "Start Anchor",
		desc: "Asserts the position at the start of the string (or line when multiline flag is set).",
	},
	{ re: /^\$/, type: "anchor", label: "$", title: "End Anchor", desc: "Asserts the position at the end of the string (or line when multiline flag is set)." },
	{ re: /^\\b/, type: "anchor", label: "\\b", title: "Word Boundary", desc: "Asserts a position between a word character and a non-word character." },
	{ re: /^\\B/, type: "anchor", label: "\\B", title: "Non-Word Boundary", desc: "Asserts a position NOT between a word and non-word character." },
	{ re: /^\\d/, type: "class", label: "\\d", title: "Digit", desc: "Matches any digit character: [0-9]." },
	{ re: /^\\D/, type: "class", label: "\\D", title: "Non-Digit", desc: "Matches any character that is NOT a digit." },
	{ re: /^\\w/, type: "class", label: "\\w", title: "Word Character", desc: "Matches letters, digits and underscore: [a-zA-Z0-9_]." },
	{ re: /^\\W/, type: "class", label: "\\W", title: "Non-Word Character", desc: "Matches any character that is NOT a word character." },
	{ re: /^\\s/, type: "class", label: "\\s", title: "Whitespace", desc: "Matches whitespace: space, tab, newline, carriage return, form feed." },
	{ re: /^\\S/, type: "class", label: "\\S", title: "Non-Whitespace", desc: "Matches any character that is NOT whitespace." },
	{ re: /^\\n/, type: "escape", label: "\\n", title: "Newline", desc: "Matches a newline character (LF, line feed)." },
	{ re: /^\\r/, type: "escape", label: "\\r", title: "Carriage Return", desc: "Matches a carriage return character (CR)." },
	{ re: /^\\t/, type: "escape", label: "\\t", title: "Tab", desc: "Matches a horizontal tab character." },
	{ re: /^\\0/, type: "escape", label: "\\0", title: "Null", desc: "Matches a null character (U+0000)." },
	{ re: /^\\u[0-9a-fA-F]{4}/, type: "escape", label: null, title: "Unicode Code Point", desc: "Matches a specific Unicode code point." },
	{ re: /^\\x[0-9a-fA-F]{2}/, type: "escape", label: null, title: "Hex Escape", desc: "Matches a character by its 2-digit hexadecimal code." },
	{ re: /^\\p\{[^}]+\}/, type: "escape", label: null, title: "Unicode Property", desc: "Matches characters with a given Unicode property (requires u flag)." },
	{ re: /^\\[0-9]+/, type: "escape", label: null, title: "Back-reference", desc: "Refers back to a previous capturing group by number." },
	{ re: /^\\k<[^>]+>/, type: "escape", label: null, title: "Named Back-reference", desc: "Refers back to a named capturing group." },
	{ re: /^\\.(?=[^])/, type: "escape", label: null, title: "Escaped Character", desc: "Literal match for the escaped character." },
	{ re: /^\./, type: "class", label: ".", title: "Any Character", desc: "Matches any character except newline (with s/dotAll flag, matches newlines too)." },
	{ re: /^\[\^?[^\]]+\]/, type: "class", label: null, title: "Character Class", desc: "Matches any character in (or not in if negated with ^) the set." },
	{
		re: /^\(\?<=.+?\)/,
		type: "group",
		label: null,
		title: "Positive Lookbehind",
		desc: "Asserts that what precedes the current position matches the subpattern.",
	},
	{ re: /^\(\?<!.+?\)/, type: "group", label: null, title: "Negative Lookbehind", desc: "Asserts that what precedes does NOT match the subpattern." },
	{
		re: /^\(\?=.+?\)/,
		type: "group",
		label: null,
		title: "Positive Lookahead",
		desc: "Asserts that what follows the current position matches the subpattern.",
	},
	{ re: /^\(\?!.+?\)/, type: "group", label: null, title: "Negative Lookahead", desc: "Asserts that what follows does NOT match the subpattern." },
	{
		re: /^\(\?<[a-zA-Z]\w*>/,
		type: "group",
		label: null,
		title: "Named Group Open",
		desc: "Opens a named capturing group. The match is stored under the given name.",
	},
	{
		re: /^\(\?:/,
		type: "group",
		label: "(?:",
		title: "Non-Capturing Group",
		desc: "Groups expressions without storing the match. More efficient than a capturing group.",
	},
	{ re: /^\(\?[imsuy]*\)/, type: "group", label: null, title: "Inline Flag", desc: "Sets flags inline within the pattern." },
	{ re: /^\(/, type: "group", label: "(", title: "Capturing Group", desc: "Groups a subpattern and captures the match so it can be referenced." },
	{ re: /^\)/, type: "group", label: ")", title: "Group Close", desc: "Closes the most recently opened group." },
	{ re: /^\{0,\}/, type: "quantifier", label: "{0,}", title: "Zero or More (explicit)", desc: "Equivalent to * — matches 0 or more of the preceding." },
	{
		re: /^\{\d+,\d+\}\?/,
		type: "quantifier",
		label: null,
		title: "Lazy Range Quantifier",
		desc: "Matches between n and m of the preceding, preferring fewer (lazy).",
	},
	{ re: /^\{\d+,\d+\}/, type: "quantifier", label: null, title: "Range Quantifier", desc: "Matches between n and m occurrences of the preceding element." },
	{ re: /^\{\d+,\}\?/, type: "quantifier", label: null, title: 'Lazy "n or more"', desc: "Matches n or more of the preceding, preferring fewer (lazy)." },
	{ re: /^\{\d+,\}/, type: "quantifier", label: null, title: '"n or more" Quantifier', desc: "Matches n or more occurrences of the preceding element." },
	{ re: /^\{\d+\}/, type: "quantifier", label: null, title: "Exact Quantifier", desc: "Matches exactly n occurrences of the preceding element." },
	{
		re: /^\*\?/,
		type: "quantifier",
		label: "*?",
		title: "Lazy Zero or More",
		desc: "Matches zero or more of the preceding, as few as possible (lazy/non-greedy).",
	},
	{
		re: /^\+\?/,
		type: "quantifier",
		label: "+?",
		title: "Lazy One or More",
		desc: "Matches one or more of the preceding, as few as possible (lazy/non-greedy).",
	},
	{ re: /^\?\?/, type: "quantifier", label: "??", title: "Lazy Optional", desc: "Matches zero or one of the preceding, preferring zero (lazy)." },
	{ re: /^\*/, type: "quantifier", label: "*", title: "Zero or More", desc: "Matches zero or more of the preceding element (greedy)." },
	{ re: /^\+/, type: "quantifier", label: "+", title: "One or More", desc: "Matches one or more of the preceding element (greedy)." },
	{ re: /^\?/, type: "quantifier", label: "?", title: "Optional", desc: "Matches zero or one of the preceding element (greedy)." },
	{ re: /^\|/, type: "alternation", label: "|", title: "Alternation", desc: "Matches either the expression before or after the pipe (OR operator)." },
	{ re: /^[^\\^$.|?*+()[\]{}]+/, type: "literal", label: null, title: "Literal", desc: "Matches the exact character(s) literally." },
];

// ================================================================
// TOKENIZER
// ================================================================
function tokenize(pattern) {
	const tokens = [];
	let i = 0;
	while (i < pattern.length) {
		const slice = pattern.slice(i);
		let matched = false;
		for (const def of TOKEN_DEFS) {
			const m = slice.match(def.re);
			if (m) {
				const raw = m[0];
				tokens.push({ raw, type: def.type, label: def.label || raw, title: def.title, desc: def.desc });
				i += raw.length;
				matched = true;
				break;
			}
		}
		if (!matched) {
			tokens.push({ raw: pattern[i], type: "literal", label: pattern[i], title: "Literal", desc: `Matches the character "${pattern[i]}" literally.` });
			i++;
		}
	}
	return tokens;
}

// ================================================================
// FLAGS HELPERS
// ================================================================
function getFlags() {
	let f = "";
	if (document.getElementById("flag-g").checked) f += "g";
	if (document.getElementById("flag-i").checked) f += "i";
	if (document.getElementById("flag-m").checked) f += "m";
	if (document.getElementById("flag-s").checked) f += "s";
	if (document.getElementById("flag-u").checked) f += "u";
	return f;
}
function updateFlagsDisplay() {
	document.getElementById("flags-display").textContent = getFlags() || "—";
}

// ================================================================
// BUILD REGEX
// ================================================================
function buildRegex(pattern, flags) {
	try {
		return { re: new RegExp(pattern, flags), error: null };
	} catch (e) {
		return { re: null, error: e.message };
	}
}

// ================================================================
// MAIN TESTER LOGIC
// ================================================================
function runTester() {
	const patternRaw = document.getElementById("regex-input").value;
	const testStr = document.getElementById("test-input").value;
	const flags = getFlags();
	const errorEl = document.getElementById("regex-error");
	const wrapEl = document.querySelector(".regex-input-wrap");
	const matchCountEl = document.getElementById("match-count");
	const previewBox = document.getElementById("preview-box");
	const matchesList = document.getElementById("matches-list");
	const subToggle = document.getElementById("sub-toggle").checked;
	const subInput = document.getElementById("sub-input").value;
	const subResult = document.getElementById("sub-result");
	const groupsSec = document.getElementById("groups-section");
	const groupsList = document.getElementById("groups-list");

	// Stats
	const statMatches = document.getElementById("stat-matches");
	const statGroups = document.getElementById("stat-groups");
	const statSteps = document.getElementById("stat-steps");
	const statTime = document.getElementById("stat-time");

	if (!patternRaw) {
		errorEl.textContent = "";
		wrapEl.classList.remove("error");
		previewBox.innerHTML = '<span class="empty-preview">Enter a pattern to see matches.</span>';
		matchesList.innerHTML = '<div class="empty-state">Enter a pattern and test string to see matches.</div>';
		matchCountEl.textContent = "0 matches";
		matchCountEl.className = "match-badge no-match";
		statMatches.textContent = "0";
		statGroups.textContent = "0";
		statSteps.textContent = "—";
		statTime.textContent = "—";
		groupsSec.style.display = "none";
		subResult.textContent = "—";
		return;
	}

	const { re, error } = buildRegex(patternRaw, flags);

	if (error) {
		errorEl.textContent = "⚠ " + error;
		wrapEl.classList.add("error");
		previewBox.innerHTML = '<span class="empty-preview">Invalid pattern.</span>';
		matchesList.innerHTML = '<div class="empty-state">Fix the pattern to see matches.</div>';
		matchCountEl.textContent = "Error";
		matchCountEl.className = "match-badge no-match";
		statMatches.textContent = "—";
		groupsSec.style.display = "none";
		subResult.textContent = "—";
		return;
	}

	errorEl.textContent = "";
	wrapEl.classList.remove("error");

	if (!testStr) {
		previewBox.innerHTML = '<span class="empty-preview">Enter test string above.</span>';
		matchesList.innerHTML = '<div class="empty-state">No test string.</div>';
		matchCountEl.textContent = "0 matches";
		matchCountEl.className = "match-badge no-match";
		statMatches.textContent = "0";
		statGroups.textContent = "0";
		subResult.textContent = "—";
		groupsSec.style.display = "none";
		return;
	}

	// Run matching with timing
	const t0 = performance.now();
	const allMatches = [];
	const groupMap = {};

	if (flags.includes("g")) {
		let m;
		const reClone = new RegExp(re.source, flags);
		while ((m = reClone.exec(testStr)) !== null) {
			allMatches.push({ match: m, index: m.index });
			if (m.index === reClone.lastIndex) reClone.lastIndex++;
			// Collect groups
			for (let g = 1; g < m.length; g++) {
				if (!groupMap[g]) groupMap[g] = [];
				if (m[g] !== undefined) groupMap[g].push(m[g]);
			}
		}
	} else {
		const m = re.exec(testStr);
		if (m) {
			allMatches.push({ match: m, index: m.index });
			for (let g = 1; g < m.length; g++) {
				if (!groupMap[g]) groupMap[g] = [];
				if (m[g] !== undefined) groupMap[g].push(m[g]);
			}
		}
	}

	const t1 = performance.now();
	const elapsed = Math.round((t1 - t0) * 1000); // microseconds

	// ---- Preview highlighting ----
	let highlighted = "";
	let cursor = 0;
	let stepCount = 0;

	for (const { match, index } of allMatches) {
		const before = escapeHtml(testStr.slice(cursor, index));
		const text = escapeHtml(match[0]);
		highlighted += before + `<mark>${text}</mark>`;
		cursor = index + match[0].length;
		stepCount++;
	}
	highlighted += escapeHtml(testStr.slice(cursor));
	previewBox.innerHTML = highlighted || '<span class="empty-preview">No content.</span>';

	// ---- Match list ----
	if (allMatches.length === 0) {
		matchesList.innerHTML = '<div class="empty-state">No matches found.</div>';
		matchCountEl.textContent = "0 matches";
		matchCountEl.className = "match-badge no-match";
	} else {
		matchCountEl.textContent = allMatches.length + (allMatches.length === 1 ? " match" : " matches");
		matchCountEl.className = "match-badge";
		matchesList.innerHTML = allMatches
			.map(
				({ match, index }, i) =>
					`<div class="match-item">
        <span class="match-idx">#${i + 1}</span>
        <span class="match-val">${escapeHtml(match[0]) || "(empty)"}</span>
        <span class="match-pos">${index}–${index + match[0].length}</span>
      </div>`,
			)
			.join("");
	}

	// ---- Stats ----
	const numGroups = Object.keys(groupMap).length;
	statMatches.textContent = allMatches.length;
	statGroups.textContent = numGroups;
	statSteps.textContent = stepCount;
	statTime.textContent = elapsed;

	// ---- Groups panel ----
	if (numGroups > 0) {
		groupsSec.style.display = "";
		groupsList.innerHTML = Object.entries(groupMap)
			.map(
				([g, vals]) =>
					`<div class="group-item">
        <span class="group-idx">$${g}</span>
        <div class="group-vals">${vals.map((v) => `<span class="group-val">${escapeHtml(v)}</span>`).join("")}</div>
      </div>`,
			)
			.join("");
	} else {
		groupsSec.style.display = "none";
	}

	// ---- Substitution ----
	if (subToggle) {
		try {
			const replaced = testStr.replace(re, subInput);
			subResult.textContent = replaced;
		} catch {
			subResult.textContent = "Error in substitution.";
		}
	} else {
		subResult.textContent = "—";
	}
}

// ================================================================
// EXPLAINER LOGIC
// ================================================================
function runExplainer() {
	const patternRaw = document.getElementById("explain-input").value;
	const tokenStrip = document.getElementById("token-strip");
	const explainBox = document.getElementById("explanation-box");
	const stepsBox = document.getElementById("steps-box");
	const csBox = document.getElementById("cheatsheet-dynamic");

	if (!patternRaw) {
		tokenStrip.innerHTML = '<div class="empty-state">Tokens will appear here.</div>';
		explainBox.innerHTML = '<div class="empty-state">Enter a pattern above to see its explanation.</div>';
		stepsBox.innerHTML = '<div class="empty-state">Pattern tokens will be listed here with descriptions.</div>';
		csBox.innerHTML = '<div class="empty-state">Relevant tokens from your pattern will appear here.</div>';
		return;
	}

	const tokens = tokenize(patternRaw);

	// Token strip
	tokenStrip.innerHTML = tokens.map((t, i) => `<span class="token ${t.type}" data-tip="${t.title}">${escapeHtml(t.raw)}</span>`).join("");

	// Steps
	stepsBox.innerHTML = tokens
		.map(
			(t) =>
				`<div class="step-item ${t.type}">
      <span class="step-token ${t.type}">${escapeHtml(t.raw)}</span>
      <div>
        <div class="step-title">${t.title}</div>
        <div class="step-desc">${t.desc}</div>
      </div>
    </div>`,
		)
		.join("");

	// Plain English
	const parts = tokens.map((t) => {
		switch (t.type) {
			case "anchor":
				return `<strong>${t.title.toLowerCase()}</strong>`;
			case "quantifier":
				return `<em>${t.title.toLowerCase()}</em>`;
			case "group":
				return `a <strong>${t.title.toLowerCase()}</strong>`;
			case "class":
				return `<code>${t.raw}</code> (${t.title.toLowerCase()})`;
			case "escape":
				return `<code>${t.raw}</code> (${t.title.toLowerCase()})`;
			case "special":
				return `<code>${t.raw}</code>`;
			case "alternation":
				return `<strong>or</strong>`;
			default:
				return `literal <code>${escapeHtml(t.raw)}</code>`;
		}
	});

	explainBox.innerHTML = `<p>This pattern matches: ${parts.join(", ")}.</p>`;

	// Dynamic cheatsheet – unique token types
	const seen = new Set();
	const csTags = tokens
		.filter((t) => {
			const k = t.type + t.raw;
			if (seen.has(k)) return false;
			seen.add(k);
			return true;
		})
		.map((t) => `<div class="cs-tag"><span class="cs-code">${escapeHtml(t.raw)}</span><span class="cs-desc">${t.title}</span></div>`);
	csBox.innerHTML = csTags.join("") || '<div class="empty-state">No tokens to display.</div>';
}

// ================================================================
// LIBRARY
// ================================================================
function renderLibrary(filter = "all", search = "") {
	const grid = document.getElementById("library-grid");
	const filtered = LIBRARY.filter((item) => {
		const matchCat = filter === "all" || item.cat === filter;
		const matchSearch = !search || item.name.toLowerCase().includes(search) || item.desc.toLowerCase().includes(search) || item.pattern.includes(search);
		return matchCat && matchSearch;
	});

	if (!filtered.length) {
		grid.innerHTML = '<div class="empty-state" style="padding:16px">No patterns match your search.</div>';
		return;
	}

	grid.innerHTML = filtered
		.map(
			(item, i) => `
    <div class="lib-card" data-idx="${i}">
      <div class="lib-card-header">
        <span class="lib-card-name">${item.name}</span>
        <span class="lib-card-cat cat-${item.cat}">${item.cat}</span>
      </div>
      <div class="lib-card-pattern">/${escapeHtml(item.pattern)}/${item.flags}</div>
      <div class="lib-card-desc">${item.desc}</div>
      <div class="lib-card-actions">
        <button class="lib-btn primary" onclick="loadPattern('${escapeAttr(item.pattern)}','${item.flags}')">Use in Tester</button>
        <button class="lib-btn" onclick="copyText('${escapeAttr(item.pattern)}', this)">Copy</button>
        <button class="lib-btn" onclick="explainPattern('${escapeAttr(item.pattern)}')">Explain</button>
      </div>
    </div>
  `,
		)
		.join("");
}

function loadPattern(pattern, flags) {
	document.getElementById("regex-input").value = pattern;
	// Set flags
	document.getElementById("flag-g").checked = flags.includes("g");
	document.getElementById("flag-i").checked = flags.includes("i");
	document.getElementById("flag-m").checked = flags.includes("m");
	document.getElementById("flag-s").checked = flags.includes("s");
	document.getElementById("flag-u").checked = flags.includes("u");
	updateFlagsDisplay();
	switchTab("tester");
	runTester();
}

function explainPattern(pattern) {
	document.getElementById("explain-input").value = pattern;
	switchTab("explainer");
	runExplainer();
}

function copyText(text, btn) {
	navigator.clipboard.writeText(text).then(() => {
		const orig = btn.textContent;
		btn.textContent = "Copied!";
		setTimeout(() => {
			btn.textContent = orig;
		}, 1500);
	});
}

// ================================================================
// REFERENCE
// ================================================================
function renderReference() {
	const wrap = document.getElementById("reference-wrap");
	wrap.innerHTML = REFERENCE.map(
		(section) => `
    <div class="ref-section">
      <div class="ref-section-title">${section.title}</div>
      <table class="ref-table">
        ${section.rows.map(([token, desc]) => `<tr><td>${escapeHtml(token)}</td><td>${escapeHtml(desc)}</td></tr>`).join("")}
      </table>
    </div>
  `,
	).join("");
}

// ================================================================
// TABS
// ================================================================
function switchTab(tabId) {
	document.querySelectorAll(".tab").forEach((t) => {
		t.classList.toggle("active", t.dataset.tab === tabId);
	});
	document.querySelectorAll(".tab-content").forEach((s) => {
		s.classList.toggle("active", s.id === "tab-" + tabId);
	});
}

// ================================================================
// UTILS
// ================================================================
function escapeHtml(str) {
	return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeAttr(str) {
	return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// ================================================================
// INIT
// ================================================================
document.addEventListener("DOMContentLoaded", () => {
	// Tab switching
	document.querySelectorAll(".tab").forEach((tab) => {
		tab.addEventListener("click", () => switchTab(tab.dataset.tab));
	});

	// Regex input events
	const regexInput = document.getElementById("regex-input");
	regexInput.addEventListener("input", runTester);
	document.getElementById("test-input").addEventListener("input", runTester);
	document.getElementById("sub-input").addEventListener("input", runTester);

	// Flags
	document.querySelectorAll(".flag-btn input").forEach((cb) => {
		cb.addEventListener("change", () => {
			updateFlagsDisplay();
			runTester();
		});
	});
	updateFlagsDisplay();

	// Substitution toggle
	document.getElementById("sub-toggle").addEventListener("change", (e) => {
		document.getElementById("sub-input").disabled = !e.target.checked;
		runTester();
	});

	// Clear test string
	document.getElementById("btn-clear-test").addEventListener("click", () => {
		document.getElementById("test-input").value = "";
		runTester();
	});

	// Copy regex
	document.getElementById("btn-copy-regex").addEventListener("click", function () {
		const pat = document.getElementById("regex-input").value;
		const flags = getFlags();
		navigator.clipboard.writeText(`/${pat}/${flags}`).then(() => {
			this.title = "Copied!";
			setTimeout(() => {
				this.title = "Copy regex";
			}, 1500);
		});
	});

	// Explainer tab input
	document.getElementById("explain-input").addEventListener("input", runExplainer);

	// Library
	renderLibrary();

	let libFilter = "all";
	let libSearch = "";

	document.querySelectorAll(".lib-cat").forEach((btn) => {
		btn.addEventListener("click", () => {
			document.querySelectorAll(".lib-cat").forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");
			libFilter = btn.dataset.cat;
			renderLibrary(libFilter, libSearch);
		});
	});

	document.getElementById("library-search").addEventListener("input", (e) => {
		libSearch = e.target.value.toLowerCase();
		renderLibrary(libFilter, libSearch);
	});

	// Reference
	renderReference();

	// Seed example
	regexInput.value = String.raw`\b[A-Z][a-z]+\b`;
	document.getElementById("test-input").value = "Hello World! this is a Regex Tester by RegEx Forge.";
	runTester();

	document.getElementById("explain-input").value = String.raw`\b[A-Z][a-z]+\b`;
	runExplainer();
});

/* Cursor Glow Effect */

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
