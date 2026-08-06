'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function generateRandomBytes(count: number): Uint8Array {
  const bytes = new Uint8Array(count);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < count; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}

function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = generateRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xx

  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generateUlid(now: number = Date.now()): string {
  // 48-bit timestamp
  let timeStr = '';
  let time = now;
  for (let i = 9; i >= 0; i--) {
    const mod = time % 32;
    timeStr = CROCKFORD_BASE32[mod] + timeStr;
    time = Math.floor(time / 32);
  }

  // 80-bit random bytes (10 bytes -> 16 base32 chars)
  const randBytes = generateRandomBytes(10);
  let randStr = '';
  for (let i = 0; i < 16; i++) {
    const charIndex = randBytes[i % 10] % 32;
    randStr += CROCKFORD_BASE32[charIndex];
  }

  return timeStr.padStart(10, '0') + randStr;
}

function decodeUlidTimestamp(ulid: string): string | null {
  const clean = ulid.trim().toUpperCase();
  if (clean.length < 10) return null;
  const timePart = clean.slice(0, 10);
  let timestamp = 0;
  for (let i = 0; i < 10; i++) {
    const char = timePart[i];
    const val = CROCKFORD_BASE32.indexOf(char);
    if (val === -1) return null;
    timestamp = timestamp * 32 + val;
  }
  return new Date(timestamp).toISOString();
}

export default function UuidUlidGenerator() {
  const [type, setType] = useState<'uuid' | 'ulid'>('uuid');
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [removeHyphens, setRemoveHyphens] = useState(false);
  const [braces, setBraces] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Inspector state
  const [inspectInput, setInspectInput] = useState('');
  const [inspectResult, setInspectResult] = useState<string | null>(null);

  const handleGenerate = () => {
    const generated: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = type === 'uuid' ? generateUuidV4() : generateUlid();
      if (type === 'uuid' && removeHyphens) {
        id = id.replace(/-/g, '');
      }
      if (uppercase) {
        id = id.toUpperCase();
      } else if (type === 'uuid') {
        id = id.toLowerCase();
      }
      if (braces) {
        id = `{${id}}`;
      }
      generated.push(id);
    }
    setOutput(generated);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(output.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInspect = () => {
    const dateStr = decodeUlidTimestamp(inspectInput);
    if (dateStr) {
      setInspectResult(`Timestamp: ${dateStr}`);
    } else {
      setInspectResult('Invalid ULID string format.');
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
              <label htmlFor="idType">Type:</label>
              <select
                id="idType"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                style={{ marginLeft: 8 }}
              >
                <option value="uuid">UUID v4 (Random)</option>
                <option value="ulid">ULID (Sortable)</option>
              </select>
            </div>

            <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
              <label htmlFor="idCount">Quantity:</label>
              <input
                id="idCount"
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className={sharedStyles.input}
                style={{ width: 80, marginLeft: 8 }}
              />
            </div>

            <button
              type="button"
              className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
              onClick={handleGenerate}
            >
              Generate IDs
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', fontSize: '0.875rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
              />
              UPPERCASE
            </label>

            {type === 'uuid' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={removeHyphens}
                  onChange={(e) => setRemoveHyphens(e.target.checked)}
                />
                Remove Hyphens
              </label>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={braces}
                onChange={(e) => setBraces(e.target.checked)}
              />
              Enclose in Braces `{}`
            </label>
          </div>

          {output.length > 0 && (
            <div className={sharedStyles.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className={sharedStyles.fieldLabel} htmlFor="outputIds">
                  Generated {type.toUpperCase()} Batch ({output.length})
                </label>
                <button type="button" className={sharedStyles.button} onClick={handleCopyAll}>
                  {copied ? 'Copied All!' : 'Copy Batch'}
                </button>
              </div>
              <textarea
                id="outputIds"
                readOnly
                value={output.join('\n')}
                className={sharedStyles.outputArea}
                rows={Math.min(12, output.length + 1)}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          )}

          {/* ULID Timestamp Inspector */}
          <div
            style={{
              marginTop: 28,
              padding: 16,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color, #333)',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0' }}>ULID Timestamp Decoder</h4>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="text"
                value={inspectInput}
                onChange={(e) => setInspectInput(e.target.value)}
                className={sharedStyles.input}
                placeholder="Paste ULID string (e.g. 01ARZ3NDEKTSV4RRFFQ69G5FAV)"
                style={{ flex: 1 }}
              />
              <button type="button" className={sharedStyles.button} onClick={handleInspect}>
                Decode Date
              </button>
            </div>

            {inspectResult && (
              <div style={{ marginTop: 12, fontSize: '0.9rem', color: inspectResult.startsWith('Timestamp:') ? '#4caf50' : '#ff4d4f' }}>
                <strong>{inspectResult}</strong>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
