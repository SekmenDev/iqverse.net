import { describe, it, expect } from 'vitest';
import { validateIpAddress, calculateIpv4Subnet } from '@/lib/ip';

describe('IP & Subnet Engine (lib/ip)', () => {
  it('validates IPv4 and IPv6 addresses', () => {
    expect(validateIpAddress('192.168.1.1')).toBe('IPv4');
    expect(validateIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe('IPv6');
    expect(validateIpAddress('::1')).toBe('IPv6');
    expect(validateIpAddress('999.999.999.999')).toBe('Invalid');
    expect(validateIpAddress('not-an-ip')).toBe('Invalid');
  });

  it('calculates IPv4 CIDR subnet details', () => {
    const subnet = calculateIpv4Subnet('192.168.1.50', 24);
    expect(subnet.valid).toBe(true);
    expect(subnet.networkAddress).toBe('192.168.1.0');
    expect(subnet.broadcastAddress).toBe('192.168.1.255');
    expect(subnet.firstHost).toBe('192.168.1.1');
    expect(subnet.lastHost).toBe('192.168.1.254');
    expect(subnet.usableHosts).toBe(254);
    expect(subnet.netmask).toBe('255.255.255.0');
  });
});
