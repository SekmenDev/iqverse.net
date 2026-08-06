'use client';

import { useState, useMemo } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

function calculateEntropy(pwd: string): {
  entropy: number;
  charsetSize: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
} {
  let charsetSize = 0;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);

  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasDigit) charsetSize += 10;
  if (hasSymbol) charsetSize += 32;

  if (pwd.length === 0 || charsetSize === 0) {
    return { entropy: 0, charsetSize: 0, hasLower, hasUpper, hasDigit, hasSymbol };
  }

  const entropy = Math.round(pwd.length * Math.log2(charsetSize) * 10) / 10;
  return { entropy, charsetSize, hasLower, hasUpper, hasDigit, hasSymbol };
}

function formatCrackTime(seconds: number): string {
  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} minutes`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hours`;
  const days = Math.round(hours / 24);
  if (days < 365) return `${days} days`;
  const years = Math.round(days / 365);
  if (years < 1000) return `${years} years`;
  if (years < 1000000) return `${Math.round(years / 1000)} thousand years`;
  return `${Math.round(years / 1000000)} million years`;
}

export default function PasswordAnalyzer() {
  const [password, setPassword] = useState('P@ssw0rd2026!');
  const [showPwd, setShowPwd] = useState(true);

  const analysis = useMemo(() => {
    const stats = calculateEntropy(password);
    const combinations = Math.pow(stats.charsetSize, password.length);

    // Crack time estimates:
    // Offline fast hash (e.g. MD5/SHA-256 GPU cluster): 100 Billion attempts/sec
    const offlineSec = combinations / 1e11;
    // Online unthrottled API: 1,000 attempts/sec
    const onlineFastSec = combinations / 1000;
    // Online throttled API: 10 attempts/sec
    const onlineSlowSec = combinations / 10;

    let rating: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong' = 'Weak';
    let color = '#ff4d4f';

    if (stats.entropy >= 80) {
      rating = 'Very Strong';
      color = '#4caf50';
    } else if (stats.entropy >= 60) {
      rating = 'Strong';
      color = '#8bc34a';
    } else if (stats.entropy >= 40) {
      rating = 'Medium';
      color = '#faad14';
    } else if (stats.entropy >= 20) {
      rating = 'Weak';
      color = '#ff9800';
    } else {
      rating = 'Very Weak';
      color = '#ff4d4f';
    }

    return {
      ...stats,
      combinations,
      offlineTime: formatCrackTime(offlineSec),
      onlineFastTime: formatCrackTime(onlineFastSec),
      onlineSlowTime: formatCrackTime(onlineSlowSec),
      rating,
      color,
    };
  }, [password]);

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className={sharedStyles.fieldLabel} htmlFor="pwdInput">
                Password Input ({password.length} characters)
              </label>
              <button
                type="button"
                className={sharedStyles.button}
                onClick={() => setShowPwd(!showPwd)}
                style={{ fontSize: '0.8rem', padding: '2px 8px' }}
              >
                {showPwd ? 'Hide Password' : 'Show Password'}
              </button>
            </div>
            <input
              id="pwdInput"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={sharedStyles.input}
              style={{ fontFamily: 'monospace', fontSize: '1.2rem' }}
              placeholder="Enter a password to test..."
            />
          </div>

          {/* Score Indicator */}
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${analysis.color}`,
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Bit Entropy:</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', marginLeft: 12, color: analysis.color, fontFamily: 'monospace' }}>
                  {analysis.entropy} <span style={{ fontSize: '1rem' }}>bits</span>
                </span>
              </div>
              <span
                style={{
                  padding: '6px 16px',
                  borderRadius: 16,
                  fontWeight: 'bold',
                  background: `${analysis.color}22`,
                  color: analysis.color,
                  border: `1px solid ${analysis.color}`,
                }}
              >
                {analysis.rating}
              </span>
            </div>

            {/* Character pool check */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <div style={{ color: analysis.hasLower ? '#4caf50' : '#888' }}>
                {analysis.hasLower ? '✓' : '✕'} Lowercase (a-z)
              </div>
              <div style={{ color: analysis.hasUpper ? '#4caf50' : '#888' }}>
                {analysis.hasUpper ? '✓' : '✕'} Uppercase (A-Z)
              </div>
              <div style={{ color: analysis.hasDigit ? '#4caf50' : '#888' }}>
                {analysis.hasDigit ? '✓' : '✕'} Digits (0-9)
              </div>
              <div style={{ color: analysis.hasSymbol ? '#4caf50' : '#888' }}>
                {analysis.hasSymbol ? '✓' : '✕'} Symbols (!@#$)
              </div>
            </div>
          </div>

          {/* Crack Time Estimates */}
          <div>
            <h4 style={{ marginBottom: 12 }}>Estimated Time to Crack (Brute Force)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Offline Fast GPU Hash (100B/sec)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: 4, color: analysis.color }}>
                  {analysis.offlineTime}
                </div>
              </div>

              <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Online Fast API (1,000 req/sec)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: 4 }}>
                  {analysis.onlineFastTime}
                </div>
              </div>

              <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Online Throttled API (10 req/sec)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: 4 }}>
                  {analysis.onlineSlowTime}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
