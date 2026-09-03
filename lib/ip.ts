export function isIPv4(ip: string): boolean {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const num = Number(p);
    return !Number.isNaN(num) && num >= 0 && num <= 255 && String(num) === p;
  });
}

export function isIPv6(ip: string): boolean {
  const clean = ip.trim();
  const parts = clean.split(':');
  if (parts.length < 3 || parts.length > 8) return false;
  return parts.every((p) => p === '' || /^[0-9a-fA-F]{1,4}$/.test(p));
}

export function isValidIp(ip: string): boolean {
  return isIPv4(ip) || isIPv6(ip);
}

export function validateIpAddress(ip: string): 'IPv4' | 'IPv6' | 'Invalid' {
  if (isIPv4(ip)) return 'IPv4';
  if (isIPv6(ip)) return 'IPv6';
  return 'Invalid';
}

export function calculateSubnetMask(cidrPrefix: number): string {
  if (cidrPrefix <= 0) return '0.0.0.0';
  if (cidrPrefix >= 32) return '255.255.255.255';
  const mask = (0xffffffff << (32 - cidrPrefix)) >>> 0;
  return [
    (mask >>> 24) & 255,
    (mask >>> 16) & 255,
    (mask >>> 8) & 255,
    mask & 255,
  ].join('.');
}

export interface Ipv4SubnetCalculation {
  valid: boolean;
  ip: string;
  cidr: number;
  netmask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  firstHost: string;
  lastUsableIp: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
}

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => ((acc << 8) + Number(octet)) >>> 0, 0);
}

function numberToIp(num: number): string {
  return [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join('.');
}

export function calculateIpv4Subnet(ip: string, cidr: number): Ipv4SubnetCalculation {
  if (!isIPv4(ip) || cidr < 0 || cidr > 32) {
    return {
      valid: false,
      ip,
      cidr,
      netmask: '',
      networkAddress: '',
      broadcastAddress: '',
      firstUsableIp: '',
      firstHost: '',
      lastUsableIp: '',
      lastHost: '',
      totalHosts: 0,
      usableHosts: 0,
    };
  }

  const netmask = calculateSubnetMask(cidr);
  const ipNum = ipToNumber(ip);
  const maskNum = ipToNumber(netmask);

  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | ~maskNum) >>> 0;

  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : Math.max(0, totalHosts - 2);

  const firstUsableIp = cidr >= 31 ? numberToIp(networkNum) : numberToIp(networkNum + 1);
  const lastUsableIp = cidr >= 31 ? numberToIp(broadcastNum) : numberToIp(broadcastNum - 1);

  return {
    valid: true,
    ip,
    cidr,
    netmask,
    networkAddress: numberToIp(networkNum),
    broadcastAddress: numberToIp(broadcastNum),
    firstUsableIp,
    firstHost: firstUsableIp,
    lastUsableIp,
    lastHost: lastUsableIp,
    totalHosts,
    usableHosts,
  };
}
