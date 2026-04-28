/* =============================================
   DNS Lookup Tool — app.js
   IQVerse · dns.google DoH API
   ============================================= */

'use strict';

// ── DNS record type numbers ──
const TYPE_MAP = {
  A: 1, NS: 2, CNAME: 5, SOA: 6, PTR: 12, MX: 15,
  TXT: 16, AAAA: 28, SRV: 33, DS: 43, DNSKEY: 48, CAA: 257
};

const ALL_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'SRV', 'PTR', 'CAA', 'DS', 'DNSKEY'];

const RCODE_NAMES = {
  0: 'NOERROR', 1: 'FORMERR', 2: 'SERVFAIL',
  3: 'NXDOMAIN', 4: 'NOTIMP', 5: 'REFUSED'
};

// ── State ──
let selectedType = 'ALL';
let lastResults = null;
let activeTab = null;
let history = JSON.parse(localStorage.getItem('dns-history') || '[]');

// ── DOM refs ──
const domainInput   = document.getElementById('domain-input');
const lookupBtn     = document.getElementById('lookup-btn');
const dnssecToggle  = document.getElementById('dnssec-toggle');
const cdToggle      = document.getElementById('cd-toggle');
const ednsToggle    = document.getElementById('edns-toggle');

const idleState     = document.getElementById('idle-state');
const loadingState  = document.getElementById('loading-state');
const loadingText   = document.getElementById('loading-text');
const errorState    = document.getElementById('error-state');
const errorTitle    = document.getElementById('error-title');
const errorMsg      = document.getElementById('error-msg');
const resultsContent = document.getElementById('results-content');
const presetRow = document.getElementsByClassName('preset-row')[0];

const sumDomain     = document.getElementById('sum-domain');
const sumStatus     = document.getElementById('sum-status');
const sumCount      = document.getElementById('sum-count');
const sumTime       = document.getElementById('sum-time');
const sumAuth       = document.getElementById('sum-auth');
const sumDnssec     = document.getElementById('sum-dnssec');

const resultTabs    = document.getElementById('result-tabs');
const tableWrap     = document.getElementById('table-wrap');
const rawPre        = document.getElementById('raw-pre');
const historyList   = document.getElementById('history-list');
const toast         = document.getElementById('toast');

// ── Record type button selection ──
document.querySelectorAll('.type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedType = btn.dataset.type;
  });
});

// ── Preset buttons ──
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    domainInput.value = btn.dataset.domain;
    domainInput.focus();
  });
});

// ── Main lookup trigger ──
lookupBtn.addEventListener('click', runLookup);
domainInput.addEventListener('keydown', e => { if (e.key === 'Enter') runLookup(); });

document.getElementById('retry-btn').addEventListener('click', runLookup);
document.getElementById('new-lookup-btn').addEventListener('click', () => {
  showState('idle');
  domainInput.value = '';
  domainInput.focus();
});

// ── Action bar ──
document.getElementById('copy-json-btn').addEventListener('click', () => {
  if (!lastResults) return;
  copyText(JSON.stringify(lastResults, null, 2));
  showToast('JSON copied!');
});

document.getElementById('copy-raw-btn').addEventListener('click', () => {
  if (!lastResults) return;
  copyText(buildRawText(lastResults));
  showToast('Raw text copied!');
});

document.getElementById('export-csv-btn').addEventListener('click', () => {
  if (!lastResults) return;
  downloadCSV(lastResults);
});

document.getElementById('share-btn').addEventListener('click', () => {
  const domain = domainInput.value.trim();
  if (!domain) return;
  const url = `${location.origin}${location.pathname}?domain=${encodeURIComponent(domain)}&type=${encodeURIComponent(selectedType)}`;
  copyText(url);
  showToast('Share link copied!');
});

document.getElementById('clear-history-btn').addEventListener('click', () => {
  history = [];
  saveHistory();
  renderHistory();
});

// ── Core lookup function ──
async function runLookup() {
  const raw = domainInput.value.trim();
  if (!raw) {
    domainInput.focus();
    showToast('Please enter a domain name.');
    return;
  }

  const domain = normalizeDomain(raw);
  domainInput.value = domain;

  showState('loading');
  lookupBtn.disabled = true;

  const startMs = performance.now();
  const types = selectedType === 'ALL' ? ALL_TYPES : [selectedType];

  try {
    const allData = await queryTypes(domain, types);
    const elapsed = Math.round(performance.now() - startMs);

    lastResults = { domain, types, elapsed, data: allData };
    renderResults(domain, allData, elapsed);
    addHistory(domain, selectedType, true);
    presetRow.scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    console.error(err);
    showError('Query failed', err.message || 'Network error. Check your connection and try again.');
    addHistory(domain, selectedType, false);
  } finally {
    lookupBtn.disabled = false;
  }
}

// ── Query one or many record types ──
async function queryTypes(domain, types) {
  const results = {};
  const doCheck = dnssecToggle.checked;
  const doCD = cdToggle.checked;

  const fetchers = types.map(async type => {
    const params = new URLSearchParams({ name: domain, type });
    if (doCheck) params.set('do', '1');
    if (doCD) params.set('cd', '1');
    if (!ednsToggle.checked) params.set('edns_client_subnet', '0.0.0.0/0');

    const url = `https://dns.google/resolve?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} querying ${type}`);
    const json = await res.json();
    results[type] = json;
  });

  await Promise.allSettled(fetchers).then(settled => {
    settled.forEach((s, i) => {
      if (s.status === 'rejected') {
        results[types[i]] = { Status: -1, _error: s.reason?.message };
      }
    });
  });

  return results;
}

// ── Render results ──
function renderResults(domain, data, elapsed) {
  showState('results');

  // Pick first successful response for meta
  const firstGood = Object.values(data).find(d => d.Status !== undefined && d.Status !== -1);
  const rcode = firstGood ? firstGood.Status : -1;
  const rcodeName = RCODE_NAMES[rcode] || `RCODE ${rcode}`;

  // Count total records
  let total = 0;
  Object.values(data).forEach(d => { if (d.Answer) total += d.Answer.length; });

  sumDomain.textContent = domain;
  sumStatus.textContent = rcodeName;
  sumStatus.className = 'summary-val ' + (rcode === 0 ? 'status-ok' : rcode === 3 ? 'status-nxdomain' : 'status-err');
  sumCount.textContent = `${total} record${total !== 1 ? 's' : ''}`;
  sumTime.textContent = `${elapsed}ms`;
  sumAuth.textContent = firstGood?.AD ? 'Yes' : 'No';
  sumAuth.className = 'summary-val ' + (firstGood?.AD ? 'badge-yes' : 'badge-no');
  sumDnssec.textContent = firstGood?.AD ? 'Validated ✓' : '—';
  sumDnssec.className = 'summary-val ' + (firstGood?.AD ? 'badge-yes' : 'badge-no');

  // Build tabs
  const types = Object.keys(data);
  buildTabs(types, data);

  // Raw JSON
  rawPre.textContent = JSON.stringify(data, null, 2);
}

// ── Build tabs ──
function buildTabs(types, data) {
  resultTabs.innerHTML = '';

  // "All" tab
  const allTab = makeTab('ALL', countAllRecords(data), data);
  resultTabs.appendChild(allTab);
  activateTab(allTab, 'ALL', data);

  types.forEach(type => {
    const count = (data[type]?.Answer || []).length;
    const tab = makeTab(type, count, data);
    resultTabs.appendChild(tab);
  });
}

function makeTab(label, count, data) {
  const tab = document.createElement('button');
  tab.className = 'result-tab';
  tab.dataset.tab = label;
  tab.innerHTML = `${label} <span class="tab-count">${count}</span>`;
  tab.addEventListener('click', () => {
    document.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeTab = label;
    if (label === 'ALL') renderAllTable(data);
    else renderTypeTable(label, data[label]);
  });
  return tab;
}

function activateTab(tab, label, data) {
  tab.classList.add('active');
  activeTab = label;
  renderAllTable(data);
}

function countAllRecords(data) {
  return Object.values(data).reduce((sum, d) => sum + (d.Answer?.length || 0), 0);
}

// ── Render "ALL" aggregated table ──
function renderAllTable(data) {
  const allAnswers = [];
  Object.entries(data).forEach(([type, res]) => {
    if (res.Answer) {
      res.Answer.forEach(ans => allAnswers.push({ ...ans, _type: type }));
    }
  });

  if (allAnswers.length === 0) {
    tableWrap.innerHTML = `<div class="no-records">No records found for this domain.</div>`;
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Type</th>
        <th>Name</th>
        <th>TTL</th>
        <th>Data</th>
      </tr>
    </thead>
  `;
  const tbody = document.createElement('tbody');
  allAnswers.forEach(ans => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-type">${escapeHtml(typeNumberToName(ans.type) || ans._type)}</td>
      <td class="td-name">${escapeHtml(ans.name || '')}</td>
      <td class="td-ttl">${formatTTL(ans.TTL)}</td>
      <td class="td-data">${formatData(ans)}</td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableWrap.innerHTML = '';
  tableWrap.appendChild(table);
}

// ── Render single type table ──
function renderTypeTable(type, res) {
  if (!res || res.Status === -1) {
    tableWrap.innerHTML = `<div class="no-records">Error querying ${type}: ${escapeHtml(res?._error || 'Unknown error')}</div>`;
    return;
  }

  const rcode = res.Status;
  const rcodeName = RCODE_NAMES[rcode] || `RCODE ${rcode}`;

  if (rcode !== 0 || !res.Answer || res.Answer.length === 0) {
    let msg = rcode === 0 ? `No ${type} records found.` : `DNS response: ${rcodeName}`;
    if (res.Authority && res.Authority.length > 0) {
      msg += ` (SOA authority: ${res.Authority[0]?.data || ''})`;
    }
    tableWrap.innerHTML = `<div class="no-records">${escapeHtml(msg)}</div>`;
    return;
  }

  const cols = getColumns(type);
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr>
    </thead>
  `;
  const tbody = document.createElement('tbody');
  res.Answer.forEach(ans => {
    const tr = document.createElement('tr');
    tr.innerHTML = cols.map(c => `<td class="${c.cls || ''}">${c.render(ans)}</td>`).join('');
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableWrap.innerHTML = '';
  tableWrap.appendChild(table);
}

// ── Column configs per record type ──
function getColumns(type) {
  const base = [
    { label: 'Name', cls: 'td-name', render: a => escapeHtml(a.name || '') },
    { label: 'TTL',  cls: 'td-ttl',  render: a => formatTTL(a.TTL) }
  ];

  switch (type) {
    case 'MX':
      return [...base,
        { label: 'Priority', render: a => escapeHtml(parseMXPriority(a.data)) },
        { label: 'Mail Server', cls: 'td-data', render: a => escapeHtml(parseMXHost(a.data)) }
      ];
    case 'SOA':
      return [...base, { label: 'Value', cls: 'td-data', render: a => formatSOA(a.data) }];
    case 'SRV':
      return [...base,
        { label: 'Priority', render: a => escapeHtml(parseSRVField(a.data, 0)) },
        { label: 'Weight',   render: a => escapeHtml(parseSRVField(a.data, 1)) },
        { label: 'Port',     render: a => escapeHtml(parseSRVField(a.data, 2)) },
        { label: 'Target', cls: 'td-data', render: a => escapeHtml(parseSRVField(a.data, 3)) }
      ];
    case 'TXT':
      return [...base, { label: 'Text', cls: 'td-data', render: a => formatTXT(a.data) }];
    case 'CAA':
      return [...base,
        { label: 'Flags', render: a => escapeHtml(parseCAAField(a.data, 0)) },
        { label: 'Tag',   render: a => escapeHtml(parseCAAField(a.data, 1)) },
        { label: 'Value', cls: 'td-data', render: a => escapeHtml(parseCAAField(a.data, 2)) }
      ];
    default:
      return [...base, { label: 'Value', cls: 'td-data', render: a => escapeHtml(a.data || '') }];
  }
}

// ── Data parsers ──
function parseMXPriority(data) {
  return (data || '').split(' ')[0] || '';
}
function parseMXHost(data) {
  const parts = (data || '').split(' ');
  return parts.slice(1).join(' ') || '';
}
function parseSRVField(data, idx) {
  return ((data || '').split(' ')[idx] || '');
}
function parseCAAField(data, idx) {
  return ((data || '').split(' ')[idx] || '');
}

function formatSOA(data) {
  if (!data) return '—';
  const [mname, rname, serial, refresh, retry, expire, minimum] = (data || '').split(' ');
  return `
    <span class="tag">MNAME</span>${escapeHtml(mname || '')}
    <br><span class="tag">RNAME</span>${escapeHtml(rname || '')}
    <br><span class="tag">serial</span>${escapeHtml(serial || '')}
    <br><span class="tag">refresh</span>${formatTTL(parseInt(refresh) || 0)}
    <br><span class="tag">retry</span>${formatTTL(parseInt(retry) || 0)}
    <br><span class="tag">expire</span>${formatTTL(parseInt(expire) || 0)}
    <br><span class="tag">min-ttl</span>${formatTTL(parseInt(minimum) || 0)}
  `.trim();
}

function formatTXT(data) {
  if (!data) return '—';
  // Strip surrounding quotes from TXT
  const clean = data.replace(/^"|"$/g, '').replace(/""/g, '');
  // Detect well-known TXT patterns
  if (clean.startsWith('v=spf1')) return `<span class="tag">SPF</span>${escapeHtml(clean)}`;
  if (clean.startsWith('v=DMARC1')) return `<span class="tag">DMARC</span>${escapeHtml(clean)}`;
  if (clean.startsWith('v=DKIM1')) return `<span class="tag">DKIM</span>${escapeHtml(clean)}`;
  if (clean.startsWith('google-site-verification')) return `<span class="tag">Google</span>${escapeHtml(clean)}`;
  if (clean.startsWith('MS=')) return `<span class="tag">Microsoft</span>${escapeHtml(clean)}`;
  return escapeHtml(clean);
}

function formatData(ans) {
  switch (typeNumberToName(ans.type)) {
    case 'TXT': return formatTXT(ans.data);
    case 'SOA': return formatSOA(ans.data);
    case 'MX':  return `<span class="tag">pri:${parseMXPriority(ans.data)}</span>${escapeHtml(parseMXHost(ans.data))}`;
    default:    return escapeHtml(ans.data || '');
  }
}

function formatTTL(seconds) {
  if (seconds === undefined || seconds === null) return '—';
  const s = parseInt(seconds);
  if (isNaN(s)) return '—';
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s/60)}m ${s%60}s`;
  if (s < 86400) return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m`;
  return `${Math.floor(s/86400)}d ${Math.floor((s%86400)/3600)}h`;
}

function typeNumberToName(num) {
  const n = parseInt(num);
  return Object.entries(TYPE_MAP).find(([,v]) => v === n)?.[0] || String(num);
}

// ── State switcher ──
function showState(state) {
  idleState.classList.add('hidden');
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  resultsContent.classList.add('hidden');

  if (state === 'idle') idleState.classList.remove('hidden');
  else if (state === 'loading') loadingState.classList.remove('hidden');
  else if (state === 'error') errorState.classList.remove('hidden');
  else if (state === 'results') resultsContent.classList.remove('hidden');
}

function showError(title, msg) {
  showState('error');
  errorTitle.textContent = title;
  errorMsg.textContent = msg;
}

// ── History ──
function addHistory(domain, type, ok) {
  const item = { domain, type, ok, ts: Date.now() };
  history.unshift(item);
  if (history.length > 20) history = history.slice(0, 20);
  saveHistory();
  renderHistory();
}

function saveHistory() {
  localStorage.setItem('dns-history', JSON.stringify(history));
}

function renderHistory() {
  historyList.innerHTML = '';
  if (history.length === 0) {
    historyList.innerHTML = '<p class="history-empty">No lookups yet. Run your first query above.</p>';
    return;
  }
  history.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <span class="${item.ok ? 'history-status-ok' : 'history-status-err'}"></span>
      <span class="history-domain">${escapeHtml(item.domain)}</span>
      <span class="history-type">${escapeHtml(item.type)}</span>
      <span class="history-time">${timeAgo(item.ts)}</span>
    `;
    div.addEventListener('click', () => {
      domainInput.value = item.domain;
      // Activate the matching type button
      document.querySelectorAll('.type-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.type === item.type);
      });
      selectedType = item.type;
      runLookup();
    });
    historyList.appendChild(div);
  });
}

function timeAgo(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

// ── Export helpers ──
function buildRawText(results) {
  const lines = [];
  Object.entries(results.data || {}).forEach(([type, res]) => {
    if (res.Answer && res.Answer.length > 0) {
      res.Answer.forEach(ans => {
        const ttl = formatTTL(ans.TTL);
        lines.push(`${ans.name}\t${ttl}\tIN\t${type}\t${ans.data}`);
      });
    }
  });
  return lines.join('\n');
}

function downloadCSV(results) {
  const rows = [['Type', 'Name', 'TTL (s)', 'Data']];
  Object.entries(results.data || {}).forEach(([type, res]) => {
    if (res.Answer) {
      res.Answer.forEach(ans => {
        rows.push([type, ans.name, ans.TTL, `"${(ans.data || '').replace(/"/g, '""')}"`]);
      });
    }
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `dns-${results.domain}-${Date.now()}.csv`;
  a.click();
  showToast('CSV downloaded!');
}

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
  });
}

// ── Toast ──
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ── Utils ──
function normalizeDomain(input) {
  return input.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0].toLowerCase();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── URL param auto-lookup ──
function checkURLParams() {
  const params = new URLSearchParams(location.search);
  const domain = params.get('domain');
  const type = params.get('type');
  if (domain) {
    domainInput.value = domain;
    if (type) {
      document.querySelectorAll('.type-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.type === type);
      });
      selectedType = type || 'ALL';
    }
    runLookup();
  }
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

// ── Init ──
renderHistory();
checkURLParams();
initCursorGlow();
