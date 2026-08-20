import { describe, it, expect } from 'vitest';
import { inspectSslCertificate } from '@/lib/ssl';

describe('SSL Inspector Engine (lib/ssl)', () => {
  it('inspects domain SSL certificate', () => {
    const cert = inspectSslCertificate('iqverse.net', true);
    expect(cert.domain).toBe('iqverse.net');
    expect(cert.subject).toContain('iqverse.net');
    expect(cert.issuer).toContain('Let\'s Encrypt');
    expect(cert.daysRemaining).toBeGreaterThan(0);
    expect(cert.algo).toContain('RSA');
  });

  it('inspects PEM certificate mode', () => {
    const cert = inspectSslCertificate('sample-pem-data', false);
    expect(cert.subject).toBe('CN=pem-certificate.local');
  });
});
