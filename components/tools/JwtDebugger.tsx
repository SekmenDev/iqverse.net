'use client';

import { useEffect, useState, useMemo } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

export default function JwtDebugger() {
  const [tokenInput, setTokenInput] = useState(SAMPLE_JWT);
  const [secretKey, setSecretKey] = useState('your-256-bit-secret');
  const [sigStatus, setSigStatus] = useState<string | null>(null);
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const decodedJwt = useMemo(() => {
    const parts = tokenInput.trim().split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid JWT format. Must contain 3 dot-separated parts (Header.Payload.Signature)' };
    }

    try {
      const headerObj = JSON.parse(base64UrlDecode(parts[0]));
      const payloadObj = JSON.parse(base64UrlDecode(parts[1]));
      const signature = parts[2];

      let expStatus = 'No expiration claim (exp)';
      if (payloadObj.exp) {
        expStatus = payloadObj.exp > nowSec ? `Valid (Expires: ${new Date(payloadObj.exp * 1000).toISOString()})` : `Expired on ${new Date(payloadObj.exp * 1000).toISOString()}`;
      }

      return {
        valid: true,
        header: headerObj,
        payload: payloadObj,
        signature,
        expStatus,
        headerRaw: JSON.stringify(headerObj, null, 2),
        payloadRaw: JSON.stringify(payloadObj, null, 2),
      };
    } catch (err) {
      return { valid: false, error: `Base64 / JSON Decoding Error: ${(err as Error).message}` };
    }
  }, [nowSec, tokenInput]);

  const verifySignature = async () => {
    const parts = tokenInput.trim().split('.');
    if (parts.length !== 3) return;

    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secretKey);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const dataToSign = encoder.encode(`${parts[0]}.${parts[1]}`);
      const computedBuffer = await crypto.subtle.sign('HMAC', cryptoKey, dataToSign);

      const computedBase64Url = btoa(String.fromCharCode(...new Uint8Array(computedBuffer)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      if (computedBase64Url === parts[2]) {
        setSigStatus('✓ Signature Verified Successfully!');
      } else {
        setSigStatus('✕ Signature Mismatch (Invalid Secret or Modified Payload)');
      }
    } catch (err) {
      setSigStatus(`Verification Failure: ${(err as Error).message}`);
    }
  };

  return (
    <div style={{ maxWidth: 1050 }}>
      <section className={sharedStyles.section}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Input JWT */}
          <div className={sharedStyles.card}>
            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="jwtInput">
                Encoded JWT Token
              </label>
              <textarea
                id="jwtInput"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className={sharedStyles.textarea}
                rows={8}
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                placeholder="Paste JWT string..."
              />
            </div>

            {/* Secret Verifier */}
            <div style={{ marginTop: 20 }}>
              <label className={sharedStyles.fieldLabel} htmlFor="secretInput">
                HMAC SHA-256 Secret Key
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  id="secretInput"
                  type="text"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className={sharedStyles.input}
                  style={{ fontFamily: 'monospace' }}
                />
                <button
                  type="button"
                  className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
                  onClick={verifySignature}
                >
                  Verify
                </button>
              </div>

              {sigStatus && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 8,
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    background: sigStatus.startsWith('✓') ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 77, 79, 0.2)',
                    color: sigStatus.startsWith('✓') ? '#4caf50' : '#ff4d4f',
                  }}
                >
                  {sigStatus}
                </div>
              )}
            </div>
          </div>

          {/* Decoded Claims */}
          <div className={sharedStyles.card}>
            {decodedJwt.valid ? (
              <div>
                <div className={sharedStyles.field}>
                  <label className={sharedStyles.fieldLabel} htmlFor="jwtHeaderOut" style={{ color: '#ff4d4f' }}>
                    Header: Algorithm & Token Type
                  </label>
                  <textarea
                    id="jwtHeaderOut"
                    readOnly
                    value={decodedJwt.headerRaw}
                    className={sharedStyles.outputArea}
                    rows={4}
                    style={{ fontFamily: 'monospace', color: '#ff7b72' }}
                  />
                </div>

                <div className={sharedStyles.field}>
                  <label className={sharedStyles.fieldLabel} htmlFor="jwtPayloadOut" style={{ color: '#9c27b0' }}>
                    Payload: Data Claims
                  </label>
                  <textarea
                    id="jwtPayloadOut"
                    readOnly
                    value={decodedJwt.payloadRaw}
                    className={sharedStyles.outputArea}
                    rows={8}
                    style={{ fontFamily: 'monospace', color: '#d2a8ff' }}
                  />
                </div>

                <div style={{ fontSize: '0.85rem', padding: 8, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                  Token Expiry Status: <strong>{decodedJwt.expStatus}</strong>
                </div>
              </div>
            ) : (
              <div className={sharedStyles.errorCard}>
                <div className={sharedStyles.errorMessage}>{decodedJwt.error}</div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
