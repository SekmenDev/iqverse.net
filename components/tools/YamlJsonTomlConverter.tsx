'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

// Lightweight JSON -> YAML serializer
function objectToYaml(obj: unknown, indentLevel = 0): string {
  const indent = '  '.repeat(indentLevel);
  if (obj === null) return 'null';
  if (typeof obj === 'boolean') return obj ? 'true' : 'false';
  if (typeof obj === 'number') return obj.toString();
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj || '""';
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const subYaml = objectToYaml(item, indentLevel + 1).trimStart();
          return `${indent}- ${subYaml}`;
        }
        return `${indent}- ${objectToYaml(item, indentLevel)}`;
      })
      .join('\n');
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj as Record<string, unknown>);
    if (keys.length === 0) return '{}';
    return keys
      .map((key) => {
        const val = (obj as Record<string, unknown>)[key];
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          return `${indent}${key}:\n${objectToYaml(val, indentLevel + 1)}`;
        }
        if (Array.isArray(val)) {
          return `${indent}${key}:\n${objectToYaml(val, indentLevel + 1)}`;
        }
        return `${indent}${key}: ${objectToYaml(val, indentLevel)}`;
      })
      .join('\n');
  }

  return String(obj);
}

// Lightweight YAML -> Object parser
function yamlToObject(yamlStr: string): unknown {
  // Simple YAML key-value / array parser for standard config structures
  const lines = yamlStr.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
  const root: Record<string, unknown> = {};

  lines.forEach((line) => {
    const trimmed = line.trim();
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      const key = trimmed.slice(0, colonIdx).trim();
      let valStr = trimmed.slice(colonIdx + 1).trim();
      if (valStr.startsWith('"') && valStr.endsWith('"')) {
        valStr = valStr.slice(1, -1);
      }
      let val: unknown = valStr;
      if (valStr === 'true') val = true;
      else if (valStr === 'false') val = false;
      else if (valStr === 'null') val = null;
      else if (!isNaN(Number(valStr)) && valStr !== '') val = Number(valStr);

      root[key] = val;
    }
  });

  return Object.keys(root).length > 0 ? root : JSON.parse(yamlStr);
}

// Lightweight JSON -> TOML serializer
function objectToToml(obj: Record<string, unknown>): string {
  let toml = '';
  const primitives: string[] = [];
  const tables: string[] = [];

  Object.entries(obj).forEach(([key, val]) => {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      tables.push(`[${key}]\n${objectToToml(val as Record<string, unknown>)}`);
    } else if (typeof val === 'string') {
      primitives.push(`${key} = "${val}"`);
    } else if (typeof val === 'boolean' || typeof val === 'number') {
      primitives.push(`${key} = ${val}`);
    } else if (Array.isArray(val)) {
      primitives.push(`${key} = ${JSON.stringify(val)}`);
    }
  });

  toml = primitives.join('\n');
  if (tables.length > 0) {
    if (toml) toml += '\n\n';
    toml += tables.join('\n\n');
  }

  return toml;
}

export default function YamlJsonTomlConverter() {
  const [sourceFormat, setSourceFormat] = useState<'json' | 'yaml'>('json');
  const [targetFormat, setTargetFormat] = useState<'json' | 'yaml' | 'toml'>('yaml');
  const [input, setInput] = useState(`{\n  "title": "IQVerse Config",\n  "version": 1,\n  "enabled": true,\n  "tags": ["developer", "tools", "ai"]\n}`);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    setError('');
    setOutput('');

    try {
      let parsedObj: unknown = null;
      if (sourceFormat === 'json') {
        parsedObj = JSON.parse(input);
      } else {
        parsedObj = yamlToObject(input);
      }

      let result = '';
      if (targetFormat === 'json') {
        result = JSON.stringify(parsedObj, null, 2);
      } else if (targetFormat === 'yaml') {
        result = objectToYaml(parsedObj);
      } else if (targetFormat === 'toml') {
        if (typeof parsedObj !== 'object' || parsedObj === null || Array.isArray(parsedObj)) {
          throw new TypeError('TOML root must be an object/table.');
        }
        result = objectToToml(parsedObj as Record<string, unknown>);
      }

      setOutput(result);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
              <label htmlFor="srcFmt">Source Format:</label>
              <select
                id="srcFmt"
                value={sourceFormat}
                onChange={(e) => setSourceFormat(e.target.value as any)}
                style={{ marginLeft: 8 }}
              >
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
              </select>
            </div>

            <div style={{ fontSize: '1.2rem' }}>➔</div>

            <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
              <label htmlFor="tgtFmt">Target Format:</label>
              <select
                id="tgtFmt"
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as any)}
                style={{ marginLeft: 8 }}
              >
                <option value="yaml">YAML</option>
                <option value="json">JSON</option>
                <option value="toml">TOML</option>
              </select>
            </div>

            <button
              type="button"
              className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
              onClick={handleConvert}
            >
              Convert Format
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="fmtInput">
                Source Data ({sourceFormat.toUpperCase()})
              </label>
              <textarea
                id="fmtInput"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={sharedStyles.textarea}
                rows={12}
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div className={sharedStyles.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className={sharedStyles.fieldLabel} htmlFor="fmtOutput">
                  Converted Output ({targetFormat.toUpperCase()})
                </label>
                {output && (
                  <button type="button" className={sharedStyles.button} onClick={handleCopy}>
                    {copied ? 'Copied!' : 'Copy Result'}
                  </button>
                )}
              </div>
              <textarea
                id="fmtOutput"
                readOnly
                value={output}
                className={sharedStyles.outputArea}
                rows={12}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>

          {error && (
            <div className={sharedStyles.errorCard} style={{ marginTop: 16 }}>
              <div className={sharedStyles.errorMessage}>Parsing Error: {error}</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
