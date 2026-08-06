'use client';

import { useState, useMemo } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

function toWords(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export default function TextCaseConverter() {
  const [input, setInput] = useState('Hello world! IQVerse developer tools');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const conversions = useMemo(() => {
    const words = toWords(input);

    const camelCase = words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');
    const PascalCase = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    const snake_case = words.map((w) => w.toLowerCase()).join('_');
    const kebabCase = words.map((w) => w.toLowerCase()).join('-');
    const CONSTANT_CASE = words.map((w) => w.toUpperCase()).join('_');
    const TitleCase = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    const UPPERCASE = input.toUpperCase();
    const lowercase = input.toLowerCase();
    const dotCase = words.map((w) => w.toLowerCase()).join('.');
    const alternatingCase = input
      .split('')
      .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
      .join('');

    return [
      { label: 'camelCase', value: camelCase },
      { label: 'PascalCase', value: PascalCase },
      { label: 'snake_case', value: snake_case },
      { label: 'kebab-case', value: kebabCase },
      { label: 'CONSTANT_CASE', value: CONSTANT_CASE },
      { label: 'Title Case', value: TitleCase },
      { label: 'UPPERCASE', value: UPPERCASE },
      { label: 'lowercase', value: lowercase },
      { label: 'dot.case', value: dotCase },
      { label: 'aLtErNaTiNg cAsE', value: alternatingCase },
    ];
  }, [input]);

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="caseInput">
              Input Text
            </label>
            <textarea
              id="caseInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={sharedStyles.textarea}
              rows={4}
              placeholder="Type or paste text to convert..."
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Conversions ({conversions.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              {conversions.map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color, #333)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 600 }}>{item.label}</span>
                    <button
                      type="button"
                      className={sharedStyles.button}
                      onClick={() => handleCopy(item.value, item.label)}
                      style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                    >
                      {copiedKey === item.label ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      wordBreak: 'break-all',
                      color: 'var(--foreground, #fff)',
                    }}
                  >
                    {item.value || <span style={{ opacity: 0.4 }}>—</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
