'use client';

import { useState } from 'react';
import { b64Encode, b64Decode } from '@/lib/encoding';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

export default function EncodeLab() {
  const [text, setText] = useState('');
  const [b64Out, setB64Out] = useState('');
  const [b64In, setB64In] = useState('');
  const [urlOut, setUrlOut] = useState('');
  const [urlIn, setUrlIn] = useState('');
  const [jwtParts, setJwtParts] = useState<{ header: string; payload: string } | null>(null);

  function handleB64Encode(urlSafe = false) {
    setB64Out(b64Encode(text, urlSafe));
  }
  function handleB64Decode(urlSafe = false) {
    setB64In(b64Decode(text, urlSafe));
  }

  function handleUrlEncode(full = false) {
    try {
      setUrlOut(full ? encodeURI(text) : encodeURIComponent(text));
    } catch {
      setUrlOut('Error');
    }
  }
  function handleUrlDecode() {
    try {
      setUrlIn(decodeURIComponent(text));
    } catch {
      setUrlIn('Error');
    }
  }

  function inspectJWT() {
    try {
      const parts = text.trim().split('.');
      if (parts.length < 2) return setJwtParts(null);
      const hdr = b64Decode(parts[0].replace(/-/g, '+').replace(/_/g, '/'), false);
      const pld = b64Decode(parts[1].replace(/-/g, '+').replace(/_/g, '/'), false);
      setJwtParts({ header: hdr, payload: pld });
    } catch {
      setJwtParts(null);
    }
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>EncodeLab</div>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="encode-input">Input</label>
            <textarea id="encode-input" value={text} onChange={(e) => setText(e.target.value)} className={sharedStyles.textarea} rows={6} />
          </div>

          <div className={sharedStyles.buttonGroup}>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={() => handleB64Encode(false)}>Base64 Encode</button>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={() => handleB64Encode(true)}>Base64 URL Safe</button>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={() => handleB64Decode(false)}>Base64 Decode</button>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={() => handleB64Decode(true)}>Base64 URL Decode</button>
          </div>

          <div style={{ marginTop: 12 }} className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="b64-output">Base64 Output</label>
            <textarea id="b64-output" readOnly value={b64Out || b64In} className={sharedStyles.outputArea} rows={4} />
          </div>

          <hr style={{ margin: '18px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.04)' }} />

          <div className={sharedStyles.buttonGroup}>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={() => handleUrlEncode(false)}>encodeURIComponent</button>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={() => handleUrlEncode(true)}>encodeURI (full)</button>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={handleUrlDecode}>Decode</button>
          </div>

          <div style={{ marginTop: 12 }} className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="url-output">URL Output</label>
            <textarea id="url-output" readOnly value={urlOut || urlIn} className={sharedStyles.outputArea} rows={3} />
          </div>

          <hr style={{ margin: '18px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.04)' }} />

          <div className={sharedStyles.buttonGroup}>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={inspectJWT}>Inspect JWT</button>
          </div>

          {jwtParts && (
            <div style={{ marginTop: 12 }}>
              <div className={sharedStyles.sectionLabel}>JWT Header</div>
              <pre className={sharedStyles.outputArea} style={{ whiteSpace: 'pre-wrap' }}>{jwtParts.header}</pre>
              <div className={sharedStyles.sectionLabel}>JWT Payload</div>
              <pre className={sharedStyles.outputArea} style={{ whiteSpace: 'pre-wrap' }}>{jwtParts.payload}</pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
