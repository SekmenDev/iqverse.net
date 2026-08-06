'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

interface CorsResult {
  status?: number;
  statusText?: string;
  allowedOrigin?: string;
  allowedMethods?: string;
  allowedHeaders?: string;
  allowedCredentials?: string;
  maxAge?: string;
  allHeaders: Record<string, string>;
  isCorsAllowed: boolean;
  notes: string[];
}

export default function CorsTester() {
  const [targetUrl, setTargetUrl] = useState('https://api.github.com/zen');
  const [requestMethod, setRequestMethod] = useState<'GET' | 'POST' | 'OPTIONS' | 'PUT' | 'DELETE'>('GET');
  const [originHeader, setOriginHeader] = useState('https://iqverse.net');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CorsResult | null>(null);
  const [error, setError] = useState('');

  const handleTestCors = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    const notes: string[] = [];
    let isCorsAllowed = false;

    try {
      const response = await fetch(targetUrl, {
        method: requestMethod,
        headers: {
          'Origin': originHeader,
        },
        mode: 'cors',
      });

      const allHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        allHeaders[key.toLowerCase()] = val;
      });

      const allowedOrigin = allHeaders['access-control-allow-origin'];
      const allowedMethods = allHeaders['access-control-allow-methods'];
      const allowedHeaders = allHeaders['access-control-allow-headers'];
      const allowedCredentials = allHeaders['access-control-allow-credentials'];
      const maxAge = allHeaders['access-control-max-age'];

      if (allowedOrigin === '*' || allowedOrigin === originHeader) {
        isCorsAllowed = true;
        notes.push(`✓ Origin allowed: ${allowedOrigin}`);
      } else if (allowedOrigin) {
        notes.push(`✕ Origin mismatch: Server returned Access-Control-Allow-Origin: ${allowedOrigin}`);
      } else {
        notes.push('✕ Missing Access-Control-Allow-Origin header in response.');
      }

      if (allowedCredentials === 'true') {
        notes.push('ℹ Access-Control-Allow-Credentials is enabled.');
        if (allowedOrigin === '*') {
          notes.push('⚠️ Security Warning: Wildcard (*) origin cannot be used with Credentials=true.');
          isCorsAllowed = false;
        }
      }

      setResult({
        status: response.status,
        statusText: response.statusText,
        allowedOrigin,
        allowedMethods,
        allowedHeaders,
        allowedCredentials,
        maxAge,
        allHeaders,
        isCorsAllowed,
        notes,
      });
    } catch (err) {
      setError(`CORS Request Failed: ${(err as Error).message || 'Browser blocked cross-origin network fetch.'}`);
      notes.push('✕ Network request was blocked by browser CORS policy or endpoint is unreachable.');
      setResult({
        allHeaders: {},
        isCorsAllowed: false,
        notes,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="targetUrl">
              Target API Endpoint URL
            </label>
            <input
              id="targetUrl"
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className={sharedStyles.input}
              placeholder="https://api.example.com/v1/resource"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="reqMethod">
                HTTP Method
              </label>
              <select
                id="reqMethod"
                value={requestMethod}
                onChange={(e) => setRequestMethod(e.target.value as any)}
                className={sharedStyles.input}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="OPTIONS">OPTIONS (Preflight)</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="originHeader">
                Simulated Origin Header
              </label>
              <input
                id="originHeader"
                type="text"
                value={originHeader}
                onChange={(e) => setOriginHeader(e.target.value)}
                className={sharedStyles.input}
                placeholder="https://myapp.com"
              />
            </div>
          </div>

          <button
            type="button"
            className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
            onClick={handleTestCors}
            disabled={loading}
          >
            {loading ? 'Testing CORS Response...' : 'Test CORS Preflight & Headers'}
          </button>

          {error && (
            <div className={sharedStyles.errorCard} style={{ marginTop: 16 }}>
              <div className={sharedStyles.errorMessage}>{error}</div>
            </div>
          )}

          {result && (
            <div
              style={{
                marginTop: 24,
                padding: 16,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${result.isCorsAllowed ? '#4caf50' : '#ff4d4f'}`,
              }}
            >
              <h4 style={{ margin: '0 0 12px 0', color: result.isCorsAllowed ? '#4caf50' : '#ff4d4f' }}>
                {result.isCorsAllowed ? '✓ CORS Allowed for Endpoint' : '✕ CORS Request Blocked or Invalid'}
              </h4>

              {result.status && (
                <div style={{ marginBottom: 12, fontSize: '0.9rem' }}>
                  HTTP Status: <strong>{result.status} {result.statusText}</strong>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <strong>CORS Analysis Notes:</strong>
                <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                  {result.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>

              {Object.keys(result.allHeaders).length > 0 && (
                <div>
                  <h5 style={{ margin: '0 0 8px 0' }}>Received Response Headers</h5>
                  <div className={sharedStyles.outputArea} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {Object.entries(result.allHeaders).map(([k, v]) => (
                      <div key={k}>
                        <strong style={{ color: k.startsWith('access-control') ? '#4caf50' : 'inherit' }}>{k}:</strong> {v}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
