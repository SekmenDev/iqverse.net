export type IpVersion = 4 | 6;

export interface CidrInfo {
  version: IpVersion;
  address: string;
  prefix: number;
  network: string;
  broadcast: string | null;
  firstHost: string;
  lastHost: string;
  netmask: string | null;
  wildcard: string | null;
  totalAddresses: string;
  usableHosts: string;
  range: string;
  cidr: string;
  scope: string;
}

export type CidrResult = { ok: true; info: CidrInfo } | { ok: false; error: string };

export type SplitResult = { ok: true; subnets: CidrInfo[]; truncated: boolean } | { ok: false; error: string };

const IPV4_BITS = 32;
const IPV6_BITS = 128;
const MAX_SPLIT = 256;

function bits(version: IpVersion): number {
  return version === 4 ? IPV4_BITS : IPV6_BITS;
}

export function ipv4ToBigInt(value: string): bigint | null {
  const octets = value.split('.');
  if (octets.length !== 4) return null;

  let result = 0n;
  for (const octet of octets) {
    if (!/^\d{1,3}$/.test(octet)) return null;
    if (octet.length > 1 && octet.startsWith('0')) return null;
    const num = Number(octet);
    if (num > 255) return null;
    result = (result << 8n) | BigInt(num);
  }
  return result;
}

export function bigIntToIpv4(value: bigint): string {
  return [24n, 16n, 8n, 0n].map(shift => String((value >> shift) & 0xffn)).join('.');
}

export function ipv6ToBigInt(value: string): bigint | null {
  let text = value.trim().toLowerCase();

  const embedded = /(\d{1,3}(?:\.\d{1,3}){3})$/.exec(text);
  if (embedded) {
    const mapped = ipv4ToBigInt(embedded[1]);
    if (mapped === null) return null;
    const head = ((mapped >> 16n) & 0xffffn).toString(16);
    const tail = (mapped & 0xffffn).toString(16);
    text = `${text.slice(0, embedded.index)}${head}:${tail}`;
  }

  const halves = text.split('::');
  if (halves.length > 2) return null;

  const toGroups = (part: string): string[] => (part ? part.split(':') : []);
  let groups: string[];

  if (halves.length === 2) {
    const head = toGroups(halves[0]);
    const tail = toGroups(halves[1]);
    const fill = 8 - head.length - tail.length;
    if (fill < 1) return null;
    groups = [...head, ...Array<string>(fill).fill('0'), ...tail];
  } else {
    groups = toGroups(text);
  }

  if (groups.length !== 8) return null;

  let result = 0n;
  for (const group of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(group)) return null;
    result = (result << 16n) | BigInt(parseInt(group, 16));
  }
  return result;
}

export function bigIntToIpv6(value: bigint): string {
  const groups: string[] = [];
  for (let i = 7; i >= 0; i -= 1) {
    groups.push(((value >> BigInt(i * 16)) & 0xffffn).toString(16));
  }

  let bestStart = -1;
  let bestLength = 0;
  let start = -1;
  let length = 0;

  groups.forEach((group, index) => {
    if (group !== '0') {
      start = -1;
      length = 0;
      return;
    }
    if (start === -1) start = index;
    length += 1;
    if (length > bestLength) {
      bestLength = length;
      bestStart = start;
    }
  });

  if (bestLength < 2) return groups.join(':');
  return `${groups.slice(0, bestStart).join(':')}::${groups.slice(bestStart + bestLength).join(':')}`;
}

function toBigInt(address: string, version: IpVersion): bigint | null {
  return version === 4 ? ipv4ToBigInt(address) : ipv6ToBigInt(address);
}

function toAddress(value: bigint, version: IpVersion): string {
  return version === 4 ? bigIntToIpv4(value) : bigIntToIpv6(value);
}

const IPV4_SCOPES: Array<{ cidr: string; label: string }> = [
  { cidr: '10.0.0.0/8', label: 'Private (RFC 1918)' },
  { cidr: '172.16.0.0/12', label: 'Private (RFC 1918)' },
  { cidr: '192.168.0.0/16', label: 'Private (RFC 1918)' },
  { cidr: '127.0.0.0/8', label: 'Loopback' },
  { cidr: '169.254.0.0/16', label: 'Link-local' },
  { cidr: '100.64.0.0/10', label: 'Carrier-grade NAT' },
  { cidr: '224.0.0.0/4', label: 'Multicast' },
];

const IPV6_SCOPES: Array<{ cidr: string; label: string }> = [
  { cidr: '::1/128', label: 'Loopback' },
  { cidr: 'fe80::/10', label: 'Link-local' },
  { cidr: 'fc00::/7', label: 'Unique local' },
  { cidr: 'ff00::/8', label: 'Multicast' },
];

function classifyScope(network: bigint, version: IpVersion): string {
  const ranges = version === 4 ? IPV4_SCOPES : IPV6_SCOPES;

  for (const entry of ranges) {
    const [base, prefixText] = entry.cidr.split('/');
    const baseValue = toBigInt(base, version);
    if (baseValue === null) continue;
    const mask = maskFor(Number(prefixText), version);
    if ((network & mask) === (baseValue & mask)) return entry.label;
  }

  return 'Public';
}

function maskFor(prefix: number, version: IpVersion): bigint {
  const total = bits(version);
  const hostBits = BigInt(total - prefix);
  const full = (1n << BigInt(total)) - 1n;
  return full ^ ((1n << hostBits) - 1n);
}

function buildInfo(address: string, prefix: number, version: IpVersion, value: bigint): CidrInfo {
  const total = bits(version);
  const mask = maskFor(prefix, version);
  const size = 1n << BigInt(total - prefix);
  const network = value & mask;
  const last = network + size - 1n;

  const isV4 = version === 4;
  let firstHost = network;
  let lastHost = last;
  let usable = size;

  if (isV4) {
    if (prefix <= 30) {
      firstHost = network + 1n;
      lastHost = last - 1n;
      usable = size - 2n;
    } else if (prefix === 31) {
      usable = 2n;
    } else {
      usable = 1n;
    }
  }

  return {
    version,
    address,
    prefix,
    network: toAddress(network, version),
    broadcast: isV4 ? toAddress(last, version) : null,
    firstHost: toAddress(firstHost, version),
    lastHost: toAddress(lastHost, version),
    netmask: isV4 ? toAddress(mask, version) : null,
    wildcard: isV4 ? toAddress(size - 1n, version) : null,
    totalAddresses: size.toString(),
    usableHosts: usable.toString(),
    range: `${toAddress(network, version)} – ${toAddress(last, version)}`,
    cidr: `${toAddress(network, version)}/${prefix}`,
    scope: classifyScope(network, version),
  };
}

export function parseCidr(input: string): CidrResult {
  const text = input.trim();
  if (!text) return { ok: false, error: 'Enter an IP address or CIDR block.' };

  const slashes = text.split('/');
  if (slashes.length > 2) return { ok: false, error: 'A CIDR block takes a single "/" separator.' };

  const [address, prefixText] = slashes;
  const version: IpVersion = address.includes(':') ? 6 : 4;
  const value = toBigInt(address, version);

  if (value === null) {
    return { ok: false, error: `"${address}" is not a valid IPv${version} address.` };
  }

  const total = bits(version);
  const prefix = prefixText === undefined ? total : Number(prefixText);

  if (!/^\d+$/.test(prefixText ?? String(total)) || !Number.isInteger(prefix) || prefix < 0 || prefix > total) {
    return { ok: false, error: `Prefix length must be a whole number between 0 and ${total}.` };
  }

  return { ok: true, info: buildInfo(address, prefix, version, value) };
}

export function splitSubnet(input: string, newPrefix: number, limit: number = MAX_SPLIT): SplitResult {
  const parsed = parseCidr(input);
  if (!parsed.ok) return parsed;

  const { info } = parsed;
  const total = bits(info.version);

  if (!Number.isInteger(newPrefix) || newPrefix < info.prefix || newPrefix > total) {
    return {
      ok: false,
      error: `Split prefix must be between /${info.prefix} and /${total}.`,
    };
  }

  const count = 1n << BigInt(newPrefix - info.prefix);
  const step = 1n << BigInt(total - newPrefix);
  const shown = count > BigInt(limit) ? BigInt(limit) : count;

  const base = toBigInt(info.network, info.version);
  if (base === null) return { ok: false, error: 'Could not read the network address.' };

  const subnets: CidrInfo[] = [];
  for (let i = 0n; i < shown; i += 1n) {
    const start = base + i * step;
    subnets.push(buildInfo(toAddress(start, info.version), newPrefix, info.version, start));
  }

  return { ok: true, subnets, truncated: count > shown };
}

export function isIpInCidr(ip: string, cidr: string): boolean {
  const block = parseCidr(cidr);
  if (!block.ok) return false;

  const version = ip.includes(':') ? 6 : 4;
  if (version !== block.info.version) return false;

  const value = toBigInt(ip.trim(), block.info.version);
  const network = toBigInt(block.info.network, block.info.version);
  if (value === null || network === null) return false;

  const mask = maskFor(block.info.prefix, block.info.version);
  return (value & mask) === (network & mask);
}
