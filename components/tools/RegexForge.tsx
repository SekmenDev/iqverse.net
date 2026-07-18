'use client';

import { useMemo, useState } from 'react';

const options = [
  { value: 'g', label: 'Global' },
  { value: 'i', label: 'Ignore Case' },
  { value: 'm', label: 'Multiline' },
  { value: 's', label: 'Dot All' },
  { value: 'u', label: 'Unicode' },
  { value: 'y', label: 'Sticky' },
];

function safeRegExp(pattern: string, flags: string) {
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

export default function RegexForge() {
  const [pattern, setPattern] = useState('https?://[^\s]+');
  const [flags, setFlags] = useState('g');
  const [input, setInput] = useState('https://example.com\nhttp://test.dev');
  const [replacement, setReplacement] = useState('[$&]');

  const regex = useMemo(() => safeRegExp(pattern, flags), [pattern, flags]);

  const matches = useMemo(() => {
    if (!regex) return [];
    return Array.from(input.matchAll(regex));
  }, [input, regex]);

  const replaced = useMemo(() => {
    if (!regex) return '';
    return input.replace(regex, replacement);
  }, [input, regex, replacement]);

  return (
    <div className="tool-panel">
      <div className="tool-grid">
        <section className="tool-form card">
          <div className="section-header">
            <h2>Regex Tester</h2>
            <p>Write a pattern, pick flags and test it against sample text.</p>
          </div>

          <div className="field-group">
            <label>Pattern</label>
            <input
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              placeholder="Enter regular expression pattern"
            />
          </div>

          <div className="field-group">
            <label>Flags</label>
            <div className="select-group wrap">
              {options.map((option) => (
                <label key={option.value} className="checkbox-pill">
                  <input
                    type="checkbox"
                    checked={flags.includes(option.value)}
                    onChange={(event) => {
                      const nextFlags = event.target.checked
                        ? `${flags}${option.value}`
                        : flags.replace(option.value, '');
                      setFlags(nextFlags);
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label>Test text</label>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={6}
            />
          </div>

          <div className="field-group">
            <label>Replacement</label>
            <input
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
              placeholder="Replacement text"
            />
          </div>
        </section>

        <section className="tool-preview card">
          <div className="section-header">
            <h2>Results</h2>
            <p>Matches, details and replacement output.</p>
          </div>

          <div className="match-summary">
            <p>
              <strong>Valid pattern:</strong>{' '}
              {regex ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Matches found:</strong> {matches.length}
            </p>
          </div>

          <div className="result-block">
            <div>
              <h3>Matches</h3>
              <pre>{regex ? matches.map((match, index) => `${index + 1}. ${JSON.stringify(match, null, 0)}`).join('\n') : 'Invalid regex pattern'}</pre>
            </div>
            <div>
              <h3>Replacement</h3>
              <pre>{regex ? replaced : 'Invalid regex pattern'}</pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
