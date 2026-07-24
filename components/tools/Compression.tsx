'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

async function compressText(text: string): Promise<string> {
  if (typeof CompressionStream === 'undefined') {
    throw new TypeError('CompressionStream is not available in this browser.');
  }

  const encoder = new TextEncoder();
  const compressed = await new Response(
    new Blob([await new Response(encoder.encode(text)).arrayBuffer()]).stream().pipeThrough(new CompressionStream('deflate')),
  ).arrayBuffer();
  return btoa(String.fromCodePoint(...new Uint8Array(compressed)));
}

async function decompressText(base64: string): Promise<string> {
  if (typeof DecompressionStream === 'undefined') {
    throw new TypeError('DecompressionStream is not available in this browser.');
  }

  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const decompressed = await new Response(
    new Blob([await new Response(binary).arrayBuffer()]).stream().pipeThrough(new DecompressionStream('deflate')),
  ).arrayBuffer();
  return new TextDecoder().decode(decompressed);
}

export default function Compression() {
  const [input, setInput] = useState('Hello IQVerse compression');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'compress' | 'decompress'>('compress');

  const run = async () => {
    setError('');
    setOutput('');

    try {
      if (mode === 'compress') {
        setOutput(await compressText(input));
      } else {
        setOutput(await decompressText(input));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compression operation failed.');
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>Compression</div>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <span className={sharedStyles.fieldLabel}>Mode</span>
            <div className={sharedStyles.buttonGroup} style={{ margin: 0 }} role="group" aria-label="Compression mode">
              <button
                className={`${sharedStyles.button} ${mode === 'compress' ? sharedStyles.buttonPrimary : sharedStyles.buttonSecondary}`}
                type="button"
                onClick={() => setMode('compress')}
                aria-pressed={mode === 'compress'}
              >
                Compress
              </button>
              <button
                className={`${sharedStyles.button} ${mode === 'decompress' ? sharedStyles.buttonPrimary : sharedStyles.buttonSecondary}`}
                type="button"
                onClick={() => setMode('decompress')}
                aria-pressed={mode === 'decompress'}
              >
                Decompress
              </button>
            </div>
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="compressionInput">
              Input
            </label>
            <textarea
              id="compressionInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={sharedStyles.textarea}
              rows={6}
            />
          </div>

          <div className={sharedStyles.buttonGroup}>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={run}>
              Run
            </button>
          </div>

          <div style={{ marginTop: 18 }} className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="compressionOutput">Output</label>
            <textarea id="compressionOutput" readOnly value={output} className={sharedStyles.outputArea} rows={6} />
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
