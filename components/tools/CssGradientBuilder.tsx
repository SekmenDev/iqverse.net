'use client';

import { useState, useMemo } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

interface ColorStop {
  color: string;
  stop: number;
}

export default function CssGradientBuilder() {
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: '#2196f3', stop: 0 },
    { color: '#e91e63', stop: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const addStop = () => {
    setStops([...stops, { color: '#9c27b0', stop: 50 }].sort((a, b) => a.stop - b.stop));
  };

  const removeStop = (idx: number) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((_, i) => i !== idx));
  };

  const updateStopColor = (idx: number, color: string) => {
    const updated = [...stops];
    updated[idx].color = color;
    setStops(updated);
  };

  const updateStopPosition = (idx: number, pos: number) => {
    const updated = [...stops];
    updated[idx].stop = pos;
    setStops(updated);
  };

  const cssString = useMemo(() => {
    const stopString = stops.map((s) => `${s.color} ${s.stop}%`).join(', ');
    if (gradientType === 'linear') {
      return `background: linear-gradient(${angle}deg, ${stopString});`;
    } else if (gradientType === 'radial') {
      return `background: radial-gradient(circle at center, ${stopString});`;
    } else {
      return `background: conic-gradient(from ${angle}deg at 50% 50%, ${stopString});`;
    }
  }, [gradientType, angle, stops]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          {/* Gradient Preview Canvas */}
          <div
            style={{
              height: 180,
              borderRadius: 8,
              marginBottom: 20,
              border: '1px solid var(--border-color, #333)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              background: cssString.replace('background: ', '').replace(';', ''),
            }}
          />

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
              <label htmlFor="gradType">Type:</label>
              <select
                id="gradType"
                value={gradientType}
                onChange={(e) => setGradientType(e.target.value as any)}
                style={{ marginLeft: 8 }}
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
                <option value="conic">Conic</option>
              </select>
            </div>

            {gradientType !== 'radial' && (
              <div className={sharedStyles.buttonGroup} style={{ margin: 0, alignItems: 'center', display: 'flex' }}>
                <label htmlFor="gradAngle">Angle ({angle}°):</label>
                <input
                  id="gradAngle"
                  type="range"
                  min={0}
                  max={360}
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  style={{ marginLeft: 8, width: 120 }}
                />
              </div>
            )}

            <button type="button" className={sharedStyles.button} onClick={addStop} style={{ marginLeft: 'auto' }}>
              + Add Color Stop
            </button>
          </div>

          {/* Color Stops Controls */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 12 }}>Color Stops ({stops.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stops.map((stop, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto',
                    gap: 12,
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: 8,
                    borderRadius: 6,
                    border: '1px solid var(--border-color, #333)',
                  }}
                >
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateStopColor(idx, e.target.value)}
                    style={{ width: 40, height: 32, cursor: 'pointer', border: 'none', background: 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stop.stop}
                      onChange={(e) => updateStopPosition(idx, Number(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: '0.85rem', width: 45, fontFamily: 'monospace' }}>{stop.stop}%</span>
                  </div>
                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => updateStopColor(idx, e.target.value)}
                    className={sharedStyles.input}
                    style={{ width: 90, fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    className={sharedStyles.button}
                    onClick={() => removeStop(idx)}
                    disabled={stops.length <= 2}
                    style={{ color: '#ff4d4f' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Output Code */}
          <div className={sharedStyles.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className={sharedStyles.fieldLabel} htmlFor="cssOutput">
                Generated CSS Code
              </label>
              <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={handleCopy}>
                {copied ? 'Copied CSS!' : 'Copy CSS'}
              </button>
            </div>
            <textarea
              id="cssOutput"
              readOnly
              value={cssString}
              className={sharedStyles.outputArea}
              rows={3}
              style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
