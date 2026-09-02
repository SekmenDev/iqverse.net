import { describe, it, expect } from 'vitest';
import {
  bigIntToIpv4,
  bigIntToIpv6,
  ipv4ToBigInt,
  ipv6ToBigInt,
  isIpInCidr,
  parseCidr,
  splitSubnet,
} from '@/lib/cidr';

function info(input: string) {
  const result = parseCidr(input);
  if (!result.ok) throw new Error(result.error);
  return result.info;
}

describe('CIDR Calculator (lib/cidr) - address conversion', () => {
  it('round-trips IPv4 addresses', () => {
    expect(ipv4ToBigInt('192.168.1.1')).toBe(3232235777n);
    expect(bigIntToIpv4(3232235777n)).toBe('192.168.1.1');
    expect(bigIntToIpv4(0n)).toBe('0.0.0.0');
    expect(bigIntToIpv4(4294967295n)).toBe('255.255.255.255');
  });

  it('rejects malformed IPv4 addresses', () => {
    expect(ipv4ToBigInt('192.168.1')).toBeNull();
    expect(ipv4ToBigInt('192.168.1.256')).toBeNull();
    expect(ipv4ToBigInt('192.168.01.1')).toBeNull();
    expect(ipv4ToBigInt('192.168.1.1.1')).toBeNull();
    expect(ipv4ToBigInt('a.b.c.d')).toBeNull();
  });

  it('expands :: when parsing IPv6', () => {
    expect(ipv6ToBigInt('::')).toBe(0n);
    expect(ipv6ToBigInt('::1')).toBe(1n);
    expect(ipv6ToBigInt('2001:db8::1')).toBe(ipv6ToBigInt('2001:0db8:0000:0000:0000:0000:0000:0001'));
  });

  it('parses IPv4-mapped IPv6 addresses', () => {
    expect(ipv6ToBigInt('::ffff:192.168.1.1')).toBe(ipv6ToBigInt('::ffff:c0a8:101'));
  });

  it('rejects malformed IPv6 addresses', () => {
    expect(ipv6ToBigInt('2001:db8::1::2')).toBeNull();
    expect(ipv6ToBigInt('2001:db8:1')).toBeNull();
    expect(ipv6ToBigInt('gggg::1')).toBeNull();
  });

  it('compresses the longest zero run when printing IPv6', () => {
    expect(bigIntToIpv6(0n)).toBe('::');
    expect(bigIntToIpv6(1n)).toBe('::1');
    expect(bigIntToIpv6(ipv6ToBigInt('2001:db8:0:0:0:0:0:1') as bigint)).toBe('2001:db8::1');
    expect(bigIntToIpv6(ipv6ToBigInt('2001:0:0:1:0:0:0:1') as bigint)).toBe('2001:0:0:1::1');
  });
});

describe('CIDR Calculator (lib/cidr) - parseCidr', () => {
  it('derives the full IPv4 subnet layout', () => {
    const result = info('192.168.1.130/24');

    expect(result.version).toBe(4);
    expect(result.network).toBe('192.168.1.0');
    expect(result.broadcast).toBe('192.168.1.255');
    expect(result.firstHost).toBe('192.168.1.1');
    expect(result.lastHost).toBe('192.168.1.254');
    expect(result.netmask).toBe('255.255.255.0');
    expect(result.wildcard).toBe('0.0.0.255');
    expect(result.totalAddresses).toBe('256');
    expect(result.usableHosts).toBe('254');
    expect(result.cidr).toBe('192.168.1.0/24');
  });

  it('handles a /31 point-to-point link per RFC 3021', () => {
    const result = info('10.0.0.0/31');
    expect(result.totalAddresses).toBe('2');
    expect(result.usableHosts).toBe('2');
    expect(result.firstHost).toBe('10.0.0.0');
    expect(result.lastHost).toBe('10.0.0.1');
  });

  it('handles a single-host /32', () => {
    const result = info('10.0.0.7/32');
    expect(result.totalAddresses).toBe('1');
    expect(result.usableHosts).toBe('1');
    expect(result.network).toBe('10.0.0.7');
    expect(result.broadcast).toBe('10.0.0.7');
  });

  it('defaults to a host route when no prefix is given', () => {
    expect(info('8.8.8.8').prefix).toBe(32);
    expect(info('2001:db8::1').prefix).toBe(128);
  });

  it('counts a /0 as the whole IPv4 space', () => {
    expect(info('0.0.0.0/0').totalAddresses).toBe('4294967296');
  });

  it('derives IPv6 ranges without a broadcast address', () => {
    const result = info('2001:db8::/64');

    expect(result.version).toBe(6);
    expect(result.network).toBe('2001:db8::');
    expect(result.broadcast).toBeNull();
    expect(result.netmask).toBeNull();
    expect(result.lastHost).toBe('2001:db8::ffff:ffff:ffff:ffff');
    expect(result.totalAddresses).toBe('18446744073709551616');
  });

  it('classifies address scope', () => {
    expect(info('10.1.2.3/24').scope).toBe('Private (RFC 1918)');
    expect(info('172.16.5.1/24').scope).toBe('Private (RFC 1918)');
    expect(info('172.32.5.1/24').scope).toBe('Public');
    expect(info('127.0.0.1/8').scope).toBe('Loopback');
    expect(info('8.8.8.8/32').scope).toBe('Public');
    expect(info('fe80::1/64').scope).toBe('Link-local');
  });

  it('reports readable errors', () => {
    expect(parseCidr('')).toEqual({ ok: false, error: 'Enter an IP address or CIDR block.' });
    expect(parseCidr('192.168.1.0/24/8').ok).toBe(false);
    expect(parseCidr('192.168.1.999/24').ok).toBe(false);
    expect(parseCidr('192.168.1.0/33').ok).toBe(false);
    expect(parseCidr('2001:db8::/129').ok).toBe(false);
  });
});

describe('CIDR Calculator (lib/cidr) - splitSubnet', () => {
  it('splits a block into equal subnets', () => {
    const result = splitSubnet('192.168.1.0/24', 26);
    if (!result.ok) throw new Error(result.error);

    expect(result.subnets).toHaveLength(4);
    expect(result.truncated).toBe(false);
    expect(result.subnets.map(s => s.cidr)).toEqual([
      '192.168.1.0/26',
      '192.168.1.64/26',
      '192.168.1.128/26',
      '192.168.1.192/26',
    ]);
  });

  it('returns the original block when the prefix is unchanged', () => {
    const result = splitSubnet('10.0.0.0/8', 8);
    if (!result.ok) throw new Error(result.error);
    expect(result.subnets).toHaveLength(1);
  });

  it('caps huge splits and flags them as truncated', () => {
    const result = splitSubnet('10.0.0.0/8', 24, 10);
    if (!result.ok) throw new Error(result.error);

    expect(result.subnets).toHaveLength(10);
    expect(result.truncated).toBe(true);
  });

  it('rejects a prefix smaller than the block', () => {
    expect(splitSubnet('192.168.1.0/24', 16).ok).toBe(false);
    expect(splitSubnet('192.168.1.0/24', 33).ok).toBe(false);
  });

  it('splits IPv6 blocks', () => {
    const result = splitSubnet('2001:db8::/48', 50);
    if (!result.ok) throw new Error(result.error);

    expect(result.subnets.map(s => s.cidr)).toEqual([
      '2001:db8::/50',
      '2001:db8:0:4000::/50',
      '2001:db8:0:8000::/50',
      '2001:db8:0:c000::/50',
    ]);
  });
});

describe('CIDR Calculator (lib/cidr) - isIpInCidr', () => {
  it('matches addresses inside the block', () => {
    expect(isIpInCidr('192.168.1.55', '192.168.1.0/24')).toBe(true);
    expect(isIpInCidr('192.168.2.55', '192.168.1.0/24')).toBe(false);
    expect(isIpInCidr('10.1.2.3', '10.0.0.0/8')).toBe(true);
  });

  it('matches IPv6 addresses', () => {
    expect(isIpInCidr('2001:db8::5', '2001:db8::/32')).toBe(true);
    expect(isIpInCidr('2001:db9::5', '2001:db8::/32')).toBe(false);
  });

  it('never matches across address families', () => {
    expect(isIpInCidr('192.168.1.1', '2001:db8::/32')).toBe(false);
    expect(isIpInCidr('2001:db8::1', '192.168.1.0/24')).toBe(false);
  });

  it('returns false for invalid input instead of throwing', () => {
    expect(isIpInCidr('nonsense', '192.168.1.0/24')).toBe(false);
    expect(isIpInCidr('192.168.1.1', 'nonsense')).toBe(false);
  });
});
