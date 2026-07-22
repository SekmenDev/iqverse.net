'use client';

import { useState } from 'react';
import { pickRandom, shuffle } from '@/lib/random';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

const DEFAULT_SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SIMILAR = '0Oo1IlL';
const AMBIGUOUS = '{}[]()/\\\'"`~,;:.<>?';

export default function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [customSymbols, setCustomSymbols] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [minUpper, setMinUpper] = useState(1);
  const [minLower, setMinLower] = useState(1);
  const [minDigits, setMinDigits] = useState(1);
  const [minSymbols, setMinSymbols] = useState(1);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function buildPool() {
    let pool = '';
    if (useUpper) pool += UPPER;
    if (useLower) pool += LOWER;
    if (useDigits) pool += DIGITS;
    if (useSymbols) pool += customSymbols.trim() || DEFAULT_SYMBOLS;

    if (excludeSimilar) {
      pool = [...pool].filter((char) => !SIMILAR.includes(char)).join('');
    }
    if (excludeAmbiguous) {
      pool = [...pool].filter((char) => !AMBIGUOUS.includes(char)).join('');
    }

    return pool;
  }

  function generatePassword() {
    setError('');
    const pool = buildPool();

    if (!useUpper && !useLower && !useDigits && !useSymbols) {
      setError('Select at least one character set.');
      setOutput('');
      return;
    }

    if (!pool.length) {
      setError('Character pool is empty after filters.');
      setOutput('');
      return;
    }

    const coreLength = length - prefix.length - suffix.length;
    if (coreLength < 1) {
      setError('Length is too short for the selected prefix and suffix.');
      setOutput('');
      return;
    }

    const required: string[] = [];
    if (useUpper) {
      for (let i = 0; i < minUpper; i += 1) {
        const chars = [...UPPER].filter((char) => pool.includes(char));
        if (chars.length) required.push(pickRandom(chars));
      }
    }
    if (useLower) {
      for (let i = 0; i < minLower; i += 1) {
        const chars = [...LOWER].filter((char) => pool.includes(char));
        if (chars.length) required.push(pickRandom(chars));
      }
    }
    if (useDigits) {
      for (let i = 0; i < minDigits; i += 1) {
        const chars = [...DIGITS].filter((char) => pool.includes(char));
        if (chars.length) required.push(pickRandom(chars));
      }
    }
    if (useSymbols) {
      const symbols = customSymbols.trim() || DEFAULT_SYMBOLS;
      for (let i = 0; i < minSymbols; i += 1) {
        const chars = [...symbols].filter((char) => pool.includes(char));
        if (chars.length) required.push(pickRandom(chars));
      }
    }

    const remaining = coreLength - required.length;
    if (remaining < 0) {
      setError('Minimum counts exceed password length.');
      setOutput('');
      return;
    }

    const passwordChars = [...required];
    const poolChars = [...pool];
    for (let i = 0; i < remaining; i += 1) {
      passwordChars.push(pickRandom(poolChars));
    }

    const result = prefix + shuffle(passwordChars).join('') + suffix;
    setOutput(result);
  }

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    setOutput('');
    setError('');
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>Password Generator</div>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="pwdLength">Length: {length}</label>
            <input
              id="pwdLength"
              type="range"
              min={4}
              max={128}
              value={length}
              onChange={(event) => setLength(Number(event.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel}>Character sets</label>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <label>
                <input type="checkbox" checked={useUpper} onChange={(event) => setUseUpper(event.target.checked)} /> Uppercase (A-Z)
              </label>
              <label>
                <input type="checkbox" checked={useLower} onChange={(event) => setUseLower(event.target.checked)} /> Lowercase (a-z)
              </label>
              <label>
                <input type="checkbox" checked={useDigits} onChange={(event) => setUseDigits(event.target.checked)} /> Digits (0-9)
              </label>
              <label>
                <input type="checkbox" checked={useSymbols} onChange={(event) => setUseSymbols(event.target.checked)} /> Symbols
              </label>
            </div>
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel}>Filters</label>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <label>
                <input type="checkbox" checked={excludeSimilar} onChange={(event) => setExcludeSimilar(event.target.checked)} /> Exclude similar characters (0Oo1IlL)
              </label>
              <label>
                <input type="checkbox" checked={excludeAmbiguous} onChange={(event) => setExcludeAmbiguous(event.target.checked)} /> Exclude ambiguous characters ({`{}[]()/\\'"\~,;:.<>?`})
              </label>
            </div>
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="customSymbols">Custom symbols</label>
            <input
              id="customSymbols"
              type="text"
              value={customSymbols}
              onChange={(event) => setCustomSymbols(event.target.value)}
              placeholder="Leave blank for default symbols"
              className={sharedStyles.textarea}
            />
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel}>Prefix / Suffix</label>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <input
                type="text"
                value={prefix}
                onChange={(event) => setPrefix(event.target.value)}
                placeholder="Prefix"
                className={sharedStyles.textarea}
              />
              <input
                type="text"
                value={suffix}
                onChange={(event) => setSuffix(event.target.value)}
                placeholder="Suffix"
                className={sharedStyles.textarea}
              />
            </div>
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel}>Minimum counts</label>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <label>
                Uppercase min
                <input
                  type="number"
                  min={0}
                  max={128}
                  value={minUpper}
                  onChange={(event) => setMinUpper(Number(event.target.value))}
                  className={sharedStyles.textarea}
                />
              </label>
              <label>
                Lowercase min
                <input
                  type="number"
                  min={0}
                  max={128}
                  value={minLower}
                  onChange={(event) => setMinLower(Number(event.target.value))}
                  className={sharedStyles.textarea}
                />
              </label>
              <label>
                Digits min
                <input
                  type="number"
                  min={0}
                  max={128}
                  value={minDigits}
                  onChange={(event) => setMinDigits(Number(event.target.value))}
                  className={sharedStyles.textarea}
                />
              </label>
              <label>
                Symbols min
                <input
                  type="number"
                  min={0}
                  max={128}
                  value={minSymbols}
                  onChange={(event) => setMinSymbols(Number(event.target.value))}
                  className={sharedStyles.textarea}
                />
              </label>
            </div>
          </div>

          <div className={sharedStyles.buttonGroup}>
            <button className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={generatePassword}>
              Generate Password
            </button>
            <button className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>
      </section>

      {error && (
        <section className={sharedStyles.section}>
          <div className={sharedStyles.sectionLabel}>Error</div>
          <div className={sharedStyles.errorCard}>
            <div className={sharedStyles.errorMessage}>{error}</div>
          </div>
        </section>
      )}

      {output && !error && (
        <section className={sharedStyles.section}>
          <div className={sharedStyles.sectionLabel}>Generated Password</div>
          <div className={sharedStyles.card}>
            <textarea readOnly value={output} className={sharedStyles.outputArea} rows={4} />
            <button className={`${sharedStyles.button} ${sharedStyles.buttonSmall}`} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
