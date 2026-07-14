'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

export default function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    try {
      setError('');
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
    }
  };

  const handleMinify = () => {
    try {
      setError('');
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
    }
  };

  const handleValidate = () => {
    try {
      JSON.parse(input);
      setError('');
      setOutput('✓ Valid JSON');
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      {/* Input Section */}
      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>Input</div>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="jsonInput">JSON Input</label>
            <textarea
              id="jsonInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'{"name": "John", "age": 30}'}
              className={sharedStyles.textarea}
            />
          </div>
          <div className={sharedStyles.buttonGroup}>
            <button
              className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
              onClick={handleFormat}
            >
              Format (Pretty Print)
            </button>
            <button
              className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`}
              onClick={handleMinify}
            >
              Minify
            </button>
            <button
              className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`}
              onClick={handleValidate}
            >
              Validate
            </button>
            <button
              className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`}
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* Output Section */}
      {output && !error && (
        <section className={sharedStyles.section}>
          <div className={sharedStyles.sectionLabel}>Output</div>
          <div className={sharedStyles.card}>
            <textarea
              readOnly
              value={output}
              className={sharedStyles.outputArea}
            />
            <button
              className={`${sharedStyles.button} ${sharedStyles.buttonSmall}`}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </section>
      )}

      {/* Error Section */}
      {error && (
        <section className={sharedStyles.section}>
          <div className={sharedStyles.sectionLabel}>Error</div>
          <div className={sharedStyles.errorCard}>
            <div className={sharedStyles.errorMessage}>{error}</div>
          </div>
        </section>
      )}
    </div>
  );
}
