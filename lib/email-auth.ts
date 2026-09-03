export type RecordKind = 'spf' | 'dmarc' | 'dkim' | 'unknown';

export type Severity = 'error' | 'warning' | 'info';

export interface Finding {
  severity: Severity;
  message: string;
}

export interface SpfMechanism {
  qualifier: '+' | '-' | '~' | '?';
  type: string;
  value: string;
  causesLookup: boolean;
}

export interface SpfRecord {
  kind: 'spf';
  raw: string;
  mechanisms: SpfMechanism[];
  allQualifier: string | null;
  lookupCount: number;
  findings: Finding[];
}

export interface DmarcRecord {
  kind: 'dmarc';
  raw: string;
  tags: Record<string, string>;
  policy: string | null;
  subdomainPolicy: string | null;
  percentage: number;
  reportUris: string[];
  forensicUris: string[];
  findings: Finding[];
}

export interface DkimRecord {
  kind: 'dkim';
  raw: string;
  tags: Record<string, string>;
  keyType: string;
  publicKey: string;
  keyBits: number | null;
  flags: string[];
  findings: Finding[];
}

export interface UnknownRecord {
  kind: 'unknown';
  raw: string;
  findings: Finding[];
}

export type ParsedRecord = SpfRecord | DmarcRecord | DkimRecord | UnknownRecord;

// Mechanisms that trigger a DNS query and count toward the RFC 7208 limit of 10
const LOOKUP_MECHANISMS = new Set(['include', 'a', 'mx', 'ptr', 'exists', 'redirect']);
const SPF_LOOKUP_LIMIT = 10;

const QUALIFIERS: Record<string, SpfMechanism['qualifier']> = {
  '+': '+',
  '-': '-',
  '~': '~',
  '?': '?',
};

function normalize(record: string): string {
  return record
    .trim()
    .replaceAll(/^["']|["']$/g, '')
    .replaceAll(/"\s*"/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

export function detectRecordKind(record: string): RecordKind {
  const text = normalize(record).toLowerCase();
  if (text.startsWith('v=spf1')) return 'spf';
  if (text.startsWith('v=dmarc1')) return 'dmarc';
  if (text.startsWith('v=dkim1') || /(^|;\s*)p=/.test(text)) return 'dkim';
  return 'unknown';
}

function parseTags(record: string): Record<string, string> {
  const tags: Record<string, string> = {};

  for (const part of record.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const index = trimmed.indexOf('=');
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim().toLowerCase();
    const value = trimmed.slice(index + 1).trim();
    if (key) tags[key] = value;
  }

  return tags;
}

export function parseSpf(record: string): SpfRecord {
  const raw = normalize(record);
  const findings: Finding[] = [];
  const mechanisms: SpfMechanism[] = [];

  const terms = raw.split(' ').filter(Boolean);
  if (terms[0]?.toLowerCase() !== 'v=spf1') {
    findings.push({ severity: 'error', message: 'An SPF record must start with "v=spf1".' });
  }

  let allQualifier: string | null = null;
  let lookupCount = 0;

  for (const term of terms.slice(1)) {
    const first = term.charAt(0);
    const qualifier = QUALIFIERS[first] ?? '+';
    const body = QUALIFIERS[first] ? term.slice(1) : term;

    const separator = body.search(/[:=]/);
    const type = (separator === -1 ? body : body.slice(0, separator)).toLowerCase();
    const value = separator === -1 ? '' : body.slice(separator + 1);

    const causesLookup = LOOKUP_MECHANISMS.has(type);
    if (causesLookup) lookupCount += 1;

    if (type === 'all') allQualifier = qualifier;

    mechanisms.push({ qualifier, type, value, causesLookup });
  }

  if (lookupCount > SPF_LOOKUP_LIMIT) {
    findings.push({
      severity: 'error',
      message: `${lookupCount} DNS-lookup mechanisms exceed the limit of ${SPF_LOOKUP_LIMIT}. Receivers will return permerror.`,
    });
  } else if (lookupCount > SPF_LOOKUP_LIMIT - 3) {
    findings.push({
      severity: 'warning',
      message: `${lookupCount} of ${SPF_LOOKUP_LIMIT} DNS lookups used. Adding another provider will break the record.`,
    });
  }

  if (allQualifier === null) {
    findings.push({
      severity: 'warning',
      message: 'No "all" mechanism. Senders outside the record are neither marked nor rejected.',
    });
  } else if (allQualifier === '+') {
    findings.push({
      severity: 'error',
      message: '"+all" lets any host send as your domain. Use "-all" or "~all".',
    });
  } else if (allQualifier === '?') {
    findings.push({
      severity: 'warning',
      message: '"?all" is neutral and gives no protection. Prefer "~all" or "-all".',
    });
  }

  if (mechanisms.some(m => m.type === 'ptr')) {
    findings.push({
      severity: 'warning',
      message: 'The "ptr" mechanism is deprecated by RFC 7208 and many receivers ignore it.',
    });
  }

  if (raw.length > 255) {
    findings.push({
      severity: 'warning',
      message: `The record is ${raw.length} characters, so it must be split into multiple strings in DNS.`,
    });
  }

  if (findings.length === 0) {
    findings.push({ severity: 'info', message: 'No problems found in this SPF record.' });
  }

  return { kind: 'spf', raw, mechanisms, allQualifier, lookupCount, findings };
}

export function parseDmarc(record: string): DmarcRecord {
  const raw = normalize(record);
  const tags = parseTags(raw);
  const findings: Finding[] = [];

  if ((tags.v ?? '').toLowerCase() !== 'dmarc1') {
    findings.push({ severity: 'error', message: 'A DMARC record must start with "v=DMARC1".' });
  }

  const policy = tags.p?.toLowerCase() ?? null;
  const subdomainPolicy = tags.sp?.toLowerCase() ?? null;

  if (!policy) {
    findings.push({ severity: 'error', message: 'The required "p" policy tag is missing.' });
  } else if (!['none', 'quarantine', 'reject'].includes(policy)) {
    findings.push({ severity: 'error', message: `"p=${policy}" is not a valid policy.` });
  } else if (policy === 'none') {
    findings.push({
      severity: 'warning',
      message: '"p=none" only monitors. Move to quarantine or reject once your reports look clean.',
    });
  }

  const rawPct = tags.pct === undefined ? 100 : Number(tags.pct);
  const percentage = Number.isFinite(rawPct) ? rawPct : 100;

  if (!Number.isFinite(rawPct) || percentage < 0 || percentage > 100) {
    findings.push({ severity: 'error', message: '"pct" must be a whole number between 0 and 100.' });
  } else if (percentage < 100) {
    findings.push({
      severity: 'warning',
      message: `The policy applies to only ${percentage}% of failing mail.`,
    });
  }

  const toUris = (value: string | undefined): string[] =>
    value
      ? value
          .split(',')
          .map(entry => entry.trim())
          .filter(Boolean)
      : [];

  const reportUris = toUris(tags.rua);
  const forensicUris = toUris(tags.ruf);

  if (reportUris.length === 0) {
    findings.push({
      severity: 'warning',
      message: 'No "rua" address, so you will not receive aggregate reports.',
    });
  }

  for (const alignment of ['adkim', 'aspf'] as const) {
    const value = tags[alignment]?.toLowerCase();
    if (value && !['r', 's'].includes(value)) {
      findings.push({ severity: 'error', message: `"${alignment}=${value}" must be "r" or "s".` });
    }
  }

  if (findings.length === 0) {
    findings.push({ severity: 'info', message: 'No problems found in this DMARC record.' });
  }

  return {
    kind: 'dmarc',
    raw,
    tags,
    policy,
    subdomainPolicy,
    percentage,
    reportUris,
    forensicUris,
    findings,
  };
}

export function estimateKeyBits(publicKey: string): number | null {
  const clean = publicKey.replaceAll(/\s/g, '');
  if (!clean) return null;

  // Base64 length maps to DER bytes; subtract the SubjectPublicKeyInfo header
  const bytes = Math.floor((clean.length * 3) / 4) - (clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0);
  const modulusBits = (bytes - 38) * 8;

  const candidates = [512, 1024, 2048, 4096];
  const nearest = candidates.find(size => Math.abs(modulusBits - size) < 128);
  return nearest ?? (modulusBits > 0 ? modulusBits : null);
}

export function parseDkim(record: string): DkimRecord {
  const raw = normalize(record);
  const tags = parseTags(raw);
  const findings: Finding[] = [];

  const version = tags.v?.toLowerCase();
  if (version && version !== 'dkim1') {
    findings.push({ severity: 'error', message: `"v=${tags.v}" is not a valid DKIM version.` });
  }

  const keyType = (tags.k ?? 'rsa').toLowerCase();
  if (!['rsa', 'ed25519'].includes(keyType)) {
    findings.push({ severity: 'error', message: `Unsupported key type "k=${keyType}".` });
  }

  const publicKey = tags.p ?? '';
  if (!('p' in tags)) {
    findings.push({ severity: 'error', message: 'The required "p" public key tag is missing.' });
  } else if (publicKey === '') {
    findings.push({
      severity: 'warning',
      message: 'An empty "p" tag revokes this selector. Signatures using it will fail.',
    });
  } else if (!/^[A-Za-z0-9+/=]+$/.test(publicKey.replaceAll(/\s/g, ''))) {
    findings.push({ severity: 'error', message: 'The "p" tag is not valid base64.' });
  }

  const keyBits = keyType === 'rsa' ? estimateKeyBits(publicKey) : 256;

  if (keyType === 'rsa' && keyBits !== null && keyBits < 1024) {
    findings.push({ severity: 'error', message: `A ${keyBits}-bit RSA key is too weak. Use 2048 bits.` });
  } else if (keyType === 'rsa' && keyBits === 1024) {
    findings.push({ severity: 'warning', message: 'A 1024-bit RSA key is the minimum. Prefer 2048 bits.' });
  }

  const flags = (tags.t ?? '')
    .split(':')
    .map(flag => flag.trim())
    .filter(Boolean);

  if (flags.includes('y')) {
    findings.push({
      severity: 'warning',
      message: '"t=y" marks this selector as testing, so receivers ignore signature failures.',
    });
  }

  if (findings.length === 0) {
    findings.push({ severity: 'info', message: 'No problems found in this DKIM record.' });
  }

  return { kind: 'dkim', raw, tags, keyType, publicKey, keyBits, flags, findings };
}

export function parseEmailAuthRecord(record: string): ParsedRecord {
  const raw = normalize(record);

  switch (detectRecordKind(raw)) {
    case 'spf':
      return parseSpf(raw);
    case 'dmarc':
      return parseDmarc(raw);
    case 'dkim':
      return parseDkim(raw);
    default:
      return {
        kind: 'unknown',
        raw,
        findings: [
          {
            severity: 'error',
            message: 'Not an SPF, DMARC or DKIM record. Expected it to start with v=spf1, v=DMARC1 or v=DKIM1.',
          },
        ],
      };
  }
}

export function dmarcLookupName(domain: string): string {
  return `_dmarc.${domain.trim().replaceAll(/^\.+|\.+$/g, '')}`;
}

export function dkimLookupName(domain: string, selector: string): string {
  const cleanDomain = domain.trim().replaceAll(/^\.+|\.+$/g, '');
  const cleanSelector = selector.trim().replaceAll(/^\.+|\.+$/g, '');
  return `${cleanSelector}._domainkey.${cleanDomain}`;
}
