'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

const algorithms = [
  { value: 'SHA-1', label: 'SHA-1' },
  { value: 'SHA-256', label: 'SHA-256' },
  { value: 'SHA-384', label: 'SHA-384' },
  { value: 'SHA-512', label: 'SHA-512' },
  { value: 'HMAC-SHA-1', label: 'HMAC-SHA-1' },
  { value: 'HMAC-SHA-256', label: 'HMAC-SHA-256' },
  { value: 'HMAC-SHA-384', label: 'HMAC-SHA-384' },
  { value: 'HMAC-SHA-512', label: 'HMAC-SHA-512' },
];

const outputFormats = [
  { value: 'hex', label: 'Hex' },
  { value: 'base64', label: 'Base64' },
];

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(bytes).toString('base64');
}

async function computeDigest(algorithm: string, text: string, key: string | null): Promise<ArrayBuffer> {
  const data = new TextEncoder().encode(text);

  if (algorithm.startsWith('HMAC-')) {
    const hashAlgo = algorithm.slice(5);
    if (!key) {
      throw new TypeError('A key is required for HMAC algorithms.');
    }

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key),
      { name: 'HMAC', hash: { name: hashAlgo } },
      false,
      ['sign'],
    );
    return crypto.subtle.sign('HMAC', cryptoKey, data);
  }

  return crypto.subtle.digest(algorithm, data);
}

export default function Hashing() {
  const [input, setInput] = useState('Hello, IQVerse!');
  const [key, setKey] = useState('');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [format, setFormat] = useState('hex');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleCompute = async () => {
    setError('');
    setOutput('');

    try {
      const result = await computeDigest(algorithm, input, algorithm.startsWith('HMAC-') ? key : null);
      setOutput(format === 'base64' ? arrayBufferToBase64(result) : arrayBufferToHex(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to compute digest.');
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>Hashing</div>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="hashInput">
              Input
            </label>
            <textarea
              id="hashInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={sharedStyles.textarea}
              rows={6}
            />
          </div>

          <div className={sharedStyles.buttonGroup} style={{ alignItems: 'center' }}>
            <label>
              Algorithm
              <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} style={{ marginLeft: 8 }}>
                {algorithms.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Output
              <select value={format} onChange={(e) => setFormat(e.target.value)} style={{ marginLeft: 8 }}>
                {outputFormats.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={handleCompute}>
              Compute
            </button>
          </div>

          {algorithm.startsWith('HMAC-') && (
            <div className={sharedStyles.field} style={{ marginTop: 12 }}>
              <label className={sharedStyles.fieldLabel} htmlFor="hashKey">
                HMAC Key
              </label>
              <input
                id="hashKey"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className={sharedStyles.textarea}
                style={{ minHeight: 'auto' }}
                placeholder="Enter a secret key for HMAC"
              />
            </div>
          )}

          <div style={{ marginTop: 18 }} className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel}>Output</label>
            <textarea readOnly value={output} className={sharedStyles.outputArea} rows={6} />
          </div>

          {error && (
            <div className={sharedStyles.errorCard} style={{ marginTop: 12 }}>
              <div className={sharedStyles.errorMessage}>{error}</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
