'use client';

import { useState, useMemo } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  } else if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const normalize = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = normalize(rgb.r);
  const g = normalize(rgb.g);
  const b = normalize(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const lum1 = relativeLuminance(rgb1);
  const lum2 = relativeLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

export default function WcagContrastChecker() {
  const [fgColor, setFgColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#121212');

  const ratio = useMemo(() => {
    const res = calculateContrastRatio(fgColor, bgColor);
    return Math.round(res * 100) / 100;
  }, [fgColor, bgColor]);

  const swapColors = () => {
    const temp = fgColor;
    setFgColor(bgColor);
    setBgColor(temp);
  };

  const aaNormalPass = ratio >= 4.5;
  const aaLargePass = ratio >= 3.0;
  const aaaNormalPass = ratio >= 7.0;
  const aaaLargePass = ratio >= 4.5;
  const uiComponentPass = ratio >= 3.0;

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 24 }}>
            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="fgPicker">
                Foreground (Text) Color
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  id="fgPicker"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  style={{ width: 45, height: 38, border: 'none', background: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className={sharedStyles.input}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <button type="button" className={sharedStyles.button} onClick={swapColors} style={{ marginTop: 22 }}>
              ⇄ Swap
            </button>

            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="bgPicker">
                Background Color
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  id="bgPicker"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={{ width: 45, height: 38, border: 'none', background: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className={sharedStyles.input}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>

          {/* Contrast Ratio Result Card */}
          <div
            style={{
              padding: 20,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color, #333)',
              marginBottom: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Contrast Ratio</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', fontFamily: 'monospace', color: ratio >= 4.5 ? '#4caf50' : '#ff4d4f' }}>
                {ratio} : 1
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  textAlign: 'center',
                  background: aaNormalPass ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 77, 79, 0.2)',
                  color: aaNormalPass ? '#4caf50' : '#ff4d4f',
                  border: `1px solid ${aaNormalPass ? '#4caf50' : '#ff4d4f'}`,
                }}
              >
                <div style={{ fontSize: '0.75rem' }}>WCAG AA</div>
                <strong>{aaNormalPass ? 'PASS' : 'FAIL'}</strong>
              </div>

              <div
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  textAlign: 'center',
                  background: aaaNormalPass ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 77, 79, 0.2)',
                  color: aaaNormalPass ? '#4caf50' : '#ff4d4f',
                  border: `1px solid ${aaaNormalPass ? '#4caf50' : '#ff4d4f'}`,
                }}
              >
                <div style={{ fontSize: '0.75rem' }}>WCAG AAA</div>
                <strong>{aaaNormalPass ? 'PASS' : 'FAIL'}</strong>
              </div>
            </div>
          </div>

          {/* Compliance Breakdown Table */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 12 }}>Detailed Compliance Breakdown</h4>
            <div style={{ border: '1px solid var(--border-color, #333)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                <div>Requirement Category</div>
                <div>Min Ratio</div>
                <div>Status</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                <div>AA Normal Text (&lt; 18pt)</div>
                <div>4.5:1</div>
                <strong style={{ color: aaNormalPass ? '#4caf50' : '#ff4d4f' }}>{aaNormalPass ? 'Pass' : 'Fail'}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                <div>AA Large Text (≥ 18pt or 14pt bold)</div>
                <div>3.0:1</div>
                <strong style={{ color: aaLargePass ? '#4caf50' : '#ff4d4f' }}>{aaLargePass ? 'Pass' : 'Fail'}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                <div>AAA Normal Text (&lt; 18pt)</div>
                <div>7.0:1</div>
                <strong style={{ color: aaaNormalPass ? '#4caf50' : '#ff4d4f' }}>{aaaNormalPass ? 'Pass' : 'Fail'}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                <div>AAA Large Text (≥ 18pt or 14pt bold)</div>
                <div>4.5:1</div>
                <strong style={{ color: aaaLargePass ? '#4caf50' : '#ff4d4f' }}>{aaaLargePass ? 'Pass' : 'Fail'}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                <div>UI Components & Graphical Icons</div>
                <div>3.0:1</div>
                <strong style={{ color: uiComponentPass ? '#4caf50' : '#ff4d4f' }}>{uiComponentPass ? 'Pass' : 'Fail'}</strong>
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div>
            <h4 style={{ marginBottom: 12 }}>Typography Preview</h4>
            <div
              style={{
                padding: 24,
                borderRadius: 8,
                color: fgColor,
                backgroundColor: bgColor,
                border: '1px solid var(--border-color, #444)',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>Large Headline Text Sample</h3>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                Normal body text preview. Good contrast ensures users with visual impairments or screen glare can comfortably read page content.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
