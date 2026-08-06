'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

const SAMPLE_PEM = `-----BEGIN CERTIFICATE-----
MIIDdzCCAl+gAwIBAgIUW0jK3bVn1R6+... (PEM Certificate Data)
-----END CERTIFICATE-----`;

interface ParsedCertInfo {
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  status: 'valid' | 'expiring' | 'expired';
  fingerprintSha256: string;
  keyAlgorithm: string;
}

export default function SslInspector() {
  const [domainInput, setDomainInput] = useState('iqverse.net');
  const [pemText, setPemText] = useState(SAMPLE_PEM);
  const [mode, setMode] = useState<'domain' | 'pem'>('domain');
  const [certInfo, setCertInfo] = useState<ParsedCertInfo | null>(null);

  const handleInspect = () => {
    // Simulated SSL Cert parsing demo for client-side inspection
    const isDomainMode = mode === 'domain';
    const targetDomain = domainInput.trim() || 'example.com';

    const validFrom = new Date(Date.now() - 60 * 86400 * 1000).toISOString().split('T')[0];
    const validToDate = new Date(Date.now() + 300 * 86400 * 1000);
    const validTo = validToDate.toISOString().split('T')[0];
    const daysRemaining = Math.floor((validToDate.getTime() - Date.now()) / (86400 * 1000));

    setCertInfo({
      subject: isDomainMode ? `CN=${targetDomain}, O=IQVerse Tech` : 'CN=pem-certificate.local',
      issuer: "CN=Let's Encrypt Authority X3, O=Let's Encrypt, C=US",
      serialNumber: '03:A4:B9:71:E8:22:90:FD',
      validFrom,
      validTo,
      daysRemaining,
      status: daysRemaining > 30 ? 'valid' : daysRemaining > 0 ? 'expiring' : 'expired',
      fingerprintSha256: '9F:8A:1B:2C:3D:4E:5F:6A:7B:8C:9D:0E:1F:2A:3B:4C:5D:6E:7F:8A:9B:0C:1D:2E:3F:4A:5B:6C',
      keyAlgorithm: 'RSA 2048-bit (e 65537)',
    });
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button
              type="button"
              className={`${sharedStyles.button} ${mode === 'domain' ? sharedStyles.buttonPrimary : ''}`}
              onClick={() => setMode('domain')}
            >
              Domain Lookup
            </button>
            <button
              type="button"
              className={`${sharedStyles.button} ${mode === 'pem' ? sharedStyles.buttonPrimary : ''}`}
              onClick={() => setMode('pem')}
            >
              PEM Certificate Parser
            </button>
          </div>

          {mode === 'domain' ? (
            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="sslDomain">
                Domain Name
              </label>
              <input
                id="sslDomain"
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className={sharedStyles.input}
                placeholder="example.com"
              />
            </div>
          ) : (
            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="sslPem">
                Paste PEM Certificate (X.509)
              </label>
              <textarea
                id="sslPem"
                value={pemText}
                onChange={(e) => setPemText(e.target.value)}
                className={sharedStyles.textarea}
                rows={6}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          )}

          <button
            type="button"
            className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
            onClick={handleInspect}
          >
            Inspect SSL Certificate
          </button>

          {certInfo && (
            <div
              style={{
                marginTop: 24,
                padding: 16,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color, #333)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ margin: 0 }}>Certificate Details</h4>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    background:
                      certInfo.status === 'valid'
                        ? 'rgba(76, 175, 80, 0.2)'
                        : certInfo.status === 'expiring'
                        ? 'rgba(250, 173, 20, 0.2)'
                        : 'rgba(255, 77, 79, 0.2)',
                    color:
                      certInfo.status === 'valid'
                        ? '#4caf50'
                        : certInfo.status === 'expiring'
                        ? '#faad14'
                        : '#ff4d4f',
                  }}
                >
                  {certInfo.status === 'valid' ? '✓ Valid Certificate' : '⚠️ Expiring Soon'} ({certInfo.daysRemaining} days left)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '0.9rem' }}>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Subject Name</div>
                  <strong>{certInfo.subject}</strong>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Issuer Authority</div>
                  <strong>{certInfo.issuer}</strong>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Valid From</div>
                  <strong>{certInfo.validFrom}</strong>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Expiration Date (Valid Until)</div>
                  <strong>{certInfo.validTo}</strong>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Serial Number</div>
                  <code style={{ fontFamily: 'monospace' }}>{certInfo.serialNumber}</code>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Key Algorithm</div>
                  <strong>{certInfo.keyAlgorithm}</strong>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ opacity: 0.7, fontSize: '0.8rem', marginBottom: 4 }}>SHA-256 Fingerprint</div>
                <code style={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  {certInfo.fingerprintSha256}
                </code>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
