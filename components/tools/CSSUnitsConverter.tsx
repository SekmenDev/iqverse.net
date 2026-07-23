'use client';

import { useMemo, useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

type Unit = 'px' | 'rem' | 'em' | 'vh' | 'vw' | '%';

const units: Unit[] = ['px', 'rem', 'em', 'vh', 'vw', '%'];

function convertValue(value: number, from: Unit, to: Unit, rootFontSize: number): number {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const toPx = (() => {
    switch (from) {
      case 'px':
        return value;
      case 'rem':
        return value * rootFontSize;
      case 'em':
        return value * rootFontSize;
      case 'vh':
        return value * (viewportHeight / 100);
      case 'vw':
        return value * (viewportWidth / 100);
      case '%':
        return value * 0.01 * viewportWidth;
      default:
        return value;
    }
  })();

  switch (to) {
    case 'px':
      return toPx;
    case 'rem':
      return toPx / rootFontSize;
    case 'em':
      return toPx / rootFontSize;
    case 'vh':
      return (toPx / viewportHeight) * 100;
    case 'vw':
      return (toPx / viewportWidth) * 100;
    case '%':
      return (toPx / viewportWidth) * 100;
    default:
      return toPx;
  }
}

export default function CSSUnitsConverter() {
  const [value, setValue] = useState('16');
  const [fromUnit, setFromUnit] = useState<Unit>('px');
  const [toUnit, setToUnit] = useState<Unit>('rem');
  const [rootFontSize, setRootFontSize] = useState('16');

  const preview = useMemo(() => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return 'Please enter a valid number.';

    const rootValue = Number(rootFontSize);
    if (Number.isNaN(rootValue) || rootValue <= 0) return 'Root font size must be positive.';

    const converted = convertValue(numericValue, fromUnit, toUnit, rootValue);
    return `${converted.toFixed(3)}${toUnit}`;
  }, [value, fromUnit, toUnit, rootFontSize]);

  return (
    <div style={{ maxWidth: 900 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>Converter</div>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="cssValue">Value</label>
            <input
              id="cssValue"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={sharedStyles.textarea}
              style={{ minHeight: 'auto', padding: '0.9rem 1rem' }}
            />
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="cssFrom">From</label>
            <select id="cssFrom" value={fromUnit} onChange={(e) => setFromUnit(e.target.value as Unit)}>
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="cssTo">To</label>
            <select id="cssTo" value={toUnit} onChange={(e) => setToUnit(e.target.value as Unit)}>
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="cssRoot">Root font size (px)</label>
            <input
              id="cssRoot"
              type="number"
              value={rootFontSize}
              onChange={(e) => setRootFontSize(e.target.value)}
              className={sharedStyles.textarea}
              style={{ minHeight: 'auto', padding: '0.9rem 1rem' }}
            />
          </div>

          <div className={sharedStyles.sectionLabel} style={{ marginTop: 24 }}>Result</div>
          <div className={sharedStyles.successCard}>
            <div className={sharedStyles.successMessage}>{preview}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
