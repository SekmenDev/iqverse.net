'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

function b64Encode(input: string, urlSafe = false) {
  try {
    const encoded = typeof btoa !== 'undefined' ? btoa(unescape(encodeURIComponent(input))) : Buffer.from(input, 'utf-8').toString('base64');
    return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded;
  } catch (e) {
    return 'Encoding error';
  }
}

function b64Decode(input: string, urlSafe = false) {
  try {
    let data = input;
    if (urlSafe) {
      data = data.replace(/-/g, '+').replace(/_/g, '/');
      while (data.length % 4) data += '=';
    }
    const decoded = typeof atob !== 'undefined' ? decodeURIComponent(escape(atob(data))) : Buffer.from(data, 'base64').toString('utf-8');
    return decoded;
  } catch (e) {
    return 'Decoding error';
  }
}

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
    } catch (e) {
      setUrlOut('Error');
    }
  }
  function handleUrlDecode() {
    try {
      setUrlIn(decodeURIComponent(text));
    } catch (e) {
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
            <label className={sharedStyles.fieldLabel}>Input</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className={sharedStyles.textarea} rows={6} />
          </div>

          <div className={sharedStyles.buttonGroup}>
            <button className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={() => handleB64Encode(false)}>Base64 Encode</button>
            <button className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={() => handleB64Encode(true)}>Base64 URL Safe</button>
            <button className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={() => handleB64Decode(false)}>Base64 Decode</button>
            <button className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={() => handleB64Decode(true)}>Base64 URL Decode</button>
          </div>

          <div style={{ marginTop: 12 }} className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel}>Base64 Output</label>
            <textarea readOnly value={b64Out || b64In} className={sharedStyles.outputArea} rows={4} />
          </div>

          <hr style={{ margin: '18px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.04)' }} />

          <div className={sharedStyles.buttonGroup}>
            <button className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={() => handleUrlEncode(false)}>encodeURIComponent</button>
            <button className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={() => handleUrlEncode(true)}>encodeURI (full)</button>
            <button className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={handleUrlDecode}>Decode</button>
          </div>

          <div style={{ marginTop: 12 }} className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel}>URL Output</label>
            <textarea readOnly value={urlOut || urlIn} className={sharedStyles.outputArea} rows={3} />
          </div>

          <hr style={{ margin: '18px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.04)' }} />

          <div className={sharedStyles.buttonGroup}>
            <button className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={inspectJWT}>Inspect JWT</button>
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
