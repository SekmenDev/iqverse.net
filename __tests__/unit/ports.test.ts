import { describe, it, expect } from 'vitest';
import { COMMON_PORTS, filterPorts } from '@/lib/ports';

describe('Ports Engine (lib/ports)', () => {
  it('contains well-known network ports', () => {
    expect(COMMON_PORTS.length).toBeGreaterThan(20);
    const https = COMMON_PORTS.find((p) => p.port === 443);
    expect(https?.service).toBe('HTTPS');
    expect(https?.protocol).toBe('TCP');
  });

  it('filters ports by protocol and query term', () => {
    const udpPorts = filterPorts(COMMON_PORTS, 'UDP', '');
    expect(udpPorts.every((p) => p.protocol.includes('UDP'))).toBe(true);

    const ssh = filterPorts(COMMON_PORTS, 'all', '22');
    expect(ssh.some((p) => p.port === 22)).toBe(true);
  });
});
