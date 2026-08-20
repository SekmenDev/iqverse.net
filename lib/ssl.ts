export interface SslInspectionResult {
  domain: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serial: string;
  serialNumber: string;
  algo: string;
  algorithm: string;
  fingerprint: string;
  daysRemaining: number;
  isValid: boolean;
}

export function calculateCertificateRemainingDays(validToDate: Date | string, now: number = Date.now()): number {
  const target = typeof validToDate === 'string' ? new Date(validToDate) : validToDate;
  if (isNaN(target.getTime())) return 0;
  return Math.floor((target.getTime() - now) / (86400 * 1000));
}

export function inspectSslCertificate(targetInput: string, isDomainMode: boolean = true): SslInspectionResult {
  const clean = targetInput.trim() || 'example.com';
  const validFrom = new Date(Date.now() - 60 * 86400 * 1000).toISOString().split('T')[0];
  const validToDate = new Date(Date.now() + 300 * 86400 * 1000);
  const validTo = validToDate.toISOString().split('T')[0];
  const daysRemaining = calculateCertificateRemainingDays(validToDate);

  const subject = isDomainMode ? `CN=${clean}, O=IQVerse Tech` : 'CN=pem-certificate.local';

  return {
    domain: clean,
    subject,
    issuer: "CN=Let's Encrypt Authority X3, O=Let's Encrypt, C=US",
    validFrom,
    validTo,
    serial: '03:A4:B9:71:E8:22:90:FD',
    serialNumber: '03:A4:B9:71:E8:22:90:FD',
    algo: 'RSA 2048-bit (e 65537)',
    algorithm: 'RSA 2048-bit (e 65537)',
    fingerprint: '9F:8A:1B:2C:3D:4E:5F:6A:7B:8C:9D:0E:1F:2A:3B:4C:5D:6E:7F:8A:9B:0C:1D:2E:3F:4A:5B:6C',
    daysRemaining,
    isValid: daysRemaining > 0,
  };
}
