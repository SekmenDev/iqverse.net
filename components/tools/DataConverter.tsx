'use client';

import { useMemo, useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';
import { hexDecode, hexEncode } from '@/lib/encoding';

const formats = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'hex', label: 'Hex' },
  { value: 'base64', label: 'Base64' },
];

export default function DataConverter() {
  const [input, setInput] = useState('');
  const [inputFormat, setInputFormat] = useState('json');
  const [outputFormat, setOutputFormat] = useState('csv');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const convert = () => {
    setError('');
    setOutput('');

    try {
      let parsed: unknown = input;

      if (inputFormat === 'json') {
        parsed = JSON.parse(input);
      } else if (inputFormat === 'csv') {
        const lines = input.split(/\r?\n/).filter(Boolean);
        const [header, ...rows] = lines;
        const columns = header.split(',').map((value) => value.trim());
        parsed = rows.map((row) => {
          const values = row.split(',').map((value) => value.trim());
          return columns.reduce((obj, col, idx) => ({ ...obj, [col]: values[idx] ?? '' }), {});
        });
      } else if (inputFormat === 'hex') {
        parsed = hexDecode(input);
      } else if (inputFormat === 'base64') {
        parsed = atob(input);
      }

      if (outputFormat === 'json') {
        setOutput(JSON.stringify(parsed, null, 2));
      } else if (outputFormat === 'csv') {
        if (!Array.isArray(parsed) || parsed.length === 0 || typeof parsed[0] !== 'object' || parsed[0] === null) {
          throw new TypeError('CSV output requires an array of objects.');
        }
        const rows = parsed as Record<string, unknown>[];
        const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
        const csv = [headers.join(',')];
        rows.forEach((row) => {
          csv.push(headers.map((header) => String(row[header] ?? '')).join(','));
        });
        setOutput(csv.join('\n'));
      } else if (outputFormat === 'hex') {
        if (typeof parsed === 'string') {
          setOutput(hexEncode(parsed));
        } else {
          setOutput(hexEncode(JSON.stringify(parsed)));
        }
      } else if (outputFormat === 'base64') {
        const text = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
        setOutput(btoa(text));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed.');
    }
  };

  const preview = useMemo(() => {
    if (!input) return '';
    if (inputFormat === 'json') {
      try {
        return JSON.stringify(JSON.parse(input), null, 2);
      } catch {
        return 'Invalid JSON preview';
      }
    }
    return '';
  }, [input, inputFormat]);

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>Data Converter</div>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="inputFormat">
              Input Format
            </label>
            <select id="inputFormat" value={inputFormat} onChange={(e) => setInputFormat(e.target.value)}>
              {formats.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="outputFormat">
              Output Format
            </label>
            <select id="outputFormat" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
              {formats.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="converterInput">
              Input
            </label>
            <textarea
              id="converterInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={sharedStyles.textarea}
              rows={8}
            />
          </div>

          <div className={sharedStyles.buttonGroup}>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={convert}>
              Convert
            </button>
          </div>

          {preview && (
            <div className={sharedStyles.sectionLabel} style={{ marginTop: 18 }}>
              Preview
            </div>
          )}

          {preview && (
            <div className={sharedStyles.field}>
              <textarea readOnly value={preview} className={sharedStyles.outputArea} rows={6} />
            </div>
          )}

          <div className={sharedStyles.sectionLabel} style={{ marginTop: 18 }}>
            Output
          </div>

          <div className={sharedStyles.field}>
            <textarea readOnly value={output} className={sharedStyles.outputArea} rows={8} />
          </div>

          {error && (
            <div className={sharedStyles.errorCard} style={{ marginTop: 12 }}>
              <div className={sharedStyles.errorMessage}>{error}</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
