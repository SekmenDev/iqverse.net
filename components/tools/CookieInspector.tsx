'use client';

import { useState, useMemo } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

interface ParsedCookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: string;
  maxAge?: string;
  sameSite?: 'Strict' | 'Lax' | 'None' | string;
  secure: boolean;
  httpOnly: boolean;
  partitioned: boolean;
  warnings: string[];
}

function parseSetCookieHeader(input: string): ParsedCookie[] {
  const lines = input.split('\n').filter((l) => l.trim().length > 0);
  const cookies: ParsedCookie[] = [];

  lines.forEach((line) => {
    let clean = line.trim();
    if (clean.toLowerCase().startsWith('set-cookie:')) {
      clean = clean.slice(11).trim();
    }

    const parts = clean.split(';').map((p) => p.trim());
    if (parts.length === 0 || !parts[0].includes('=')) return;

    const firstEq = parts[0].indexOf('=');
    const name = parts[0].slice(0, firstEq).trim();
    const value = parts[0].slice(firstEq + 1).trim();

    let domain: string | undefined;
    let path: string | undefined;
    let expires: string | undefined;
    let maxAge: string | undefined;
    let sameSite: string | undefined;
    let secure = false;
    let httpOnly = false;
    let partitioned = false;
    const warnings: string[] = [];

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const lower = part.toLowerCase();
      if (lower.startsWith('domain=')) domain = part.slice(7).trim();
      else if (lower.startsWith('path=')) path = part.slice(5).trim();
      else if (lower.startsWith('expires=')) expires = part.slice(8).trim();
      else if (lower.startsWith('max-age=')) maxAge = part.slice(8).trim();
      else if (lower.startsWith('samesite=')) sameSite = part.slice(9).trim();
      else if (lower === 'secure') secure = true;
      else if (lower === 'httponly') httpOnly = true;
      else if (lower === 'partitioned') partitioned = true;
    }

    if (sameSite?.toLowerCase() === 'none' && !secure) {
      warnings.push('SameSite=None requires Secure flag to prevent browser rejection.');
    }
    if (!httpOnly && (name.toLowerCase().includes('session') || name.toLowerCase().includes('token') || name.toLowerCase().includes('auth'))) {
      warnings.push('Sensitive session token missing HttpOnly flag (vulnerable to XSS theft).');
    }
    if (!secure) {
      warnings.push('Cookie missing Secure flag (transmitted over insecure HTTP connection).');
    }

    cookies.push({
      name,
      value,
      domain,
      path,
      expires,
      maxAge,
      sameSite,
      secure,
      httpOnly,
      partitioned,
      warnings,
    });
  });

  return cookies;
}

export default function CookieInspector() {
  const [inputHeader, setInputHeader] = useState(
    `Set-Cookie: session_id=xyz12345; Path=/; Domain=iqverse.net; Secure; HttpOnly; SameSite=Lax; Max-Age=3600\nSet-Cookie: tracking_id=abc987; Path=/; SameSite=None`
  );

  const parsedCookies = useMemo(() => parseSetCookieHeader(inputHeader), [inputHeader]);

  return (
    <div style={{ maxWidth: 1050 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="cookieInput">
              Paste Raw Set-Cookie Header(s)
            </label>
            <textarea
              id="cookieInput"
              value={inputHeader}
              onChange={(e) => setInputHeader(e.target.value)}
              className={sharedStyles.textarea}
              rows={4}
              placeholder="Set-Cookie: name=value; Path=/; Secure; HttpOnly..."
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>
              Parsed Cookie Directives ({parsedCookies.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {parsedCookies.map((cookie, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${cookie.warnings.length === 0 ? 'var(--border-color, #333)' : '#faad14'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem', color: '#2196f3' }}>{cookie.name}</strong> ={' '}
                      <code style={{ fontFamily: 'monospace' }}>{cookie.value}</code>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          background: cookie.httpOnly ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          color: cookie.httpOnly ? '#4caf50' : '#888',
                        }}
                      >
                        HttpOnly: {cookie.httpOnly ? 'Yes' : 'No'}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          background: cookie.secure ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          color: cookie.secure ? '#4caf50' : '#888',
                        }}
                      >
                        Secure: {cookie.secure ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: '0.85rem' }}>
                    <div>Domain: <strong>{cookie.domain || 'Unspecified'}</strong></div>
                    <div>Path: <strong>{cookie.path || '/'}</strong></div>
                    <div>SameSite: <strong>{cookie.sameSite || 'Default (Lax)'}</strong></div>
                    <div>Max-Age: <strong>{cookie.maxAge || 'Session'}</strong></div>
                  </div>

                  {cookie.warnings.length > 0 && (
                    <div style={{ marginTop: 12, padding: 8, borderRadius: 4, background: 'rgba(250, 173, 20, 0.1)', border: '1px solid rgba(250, 173, 20, 0.3)', color: '#faad14', fontSize: '0.85rem' }}>
                      <strong>Security Warnings:</strong>
                      <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                        {cookie.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
