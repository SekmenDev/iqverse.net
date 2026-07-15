'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';

const typeOptions = [
  { value: 'url', label: 'URL' },
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'vcard', label: 'vCard' },
];

const errorLevels = [
  { value: 'L', label: 'Low (7%)' },
  { value: 'M', label: 'Medium (15%)' },
  { value: 'Q', label: 'Quartile (25%)' },
  { value: 'H', label: 'High (30%)' },
];

function buildPayload(type: string, values: Record<string, string>) {
  switch (type) {
    case 'email':
      return `mailto:${values.email || ''}?subject=${encodeURIComponent(values.subject || '')}&body=${encodeURIComponent(values.body || '')}`;
    case 'wifi':
      return `WIFI:T:${values.security || ''};S:${values.ssid || ''};P:${values.password || ''};;`;
    case 'vcard':
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${values.name || ''}\nTEL:${values.phone || ''}\nEMAIL:${values.email || ''}\nORG:${values.company || ''}\nURL:${values.url || ''}\nEND:VCARD`;
    case 'text':
      return values.text || '';
    default:
      return values.url || '';
  }
}

export default function QRForge() {
  const [type, setType] = useState('url');
  const [values, setValues] = useState({
    url: 'https://example.com',
    text: '',
    email: '',
    subject: '',
    body: '',
    ssid: '',
    password: '',
    security: 'WPA',
    name: '',
    phone: '',
    company: '',
    urlv: '',
  });
  const [errorLevel, setErrorLevel] = useState('M');
  const [dotColor, setDotColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [cornerColor, setCornerColor] = useState('#000000');
  const [dataUri, setDataUri] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const payload = useMemo(() => buildPayload(type, values), [type, values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    QRCode.toCanvas(canvas, payload, {
      errorCorrectionLevel: errorLevel as 'L' | 'M' | 'Q' | 'H',
      color: {
        dark: dotColor,
        light: bgColor,
      },
      margin: 1,
      width: 320,
    })
      .then(() => {
        const uri = canvas.toDataURL('image/png');
        setDataUri(uri);
      })
      .catch(() => {
        setDataUri('');
      });
  }, [payload, errorLevel, dotColor, bgColor]);

  function handleFieldChange(field: string, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  return (
    <div className="tool-panel">
      <div className="tool-grid">
        <section className="tool-form card">
          <div className="section-header">
            <h2>QR Settings</h2>
            <p>Choose content, style and output for your QR code.</p>
          </div>

          <div className="field-group">
            <label>Data type</label>
            <div className="select-group">
              {typeOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={option.value === type ? 'pill active' : 'pill'}
                  onClick={() => setType(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {type === 'url' && (
            <div className="field-group">
              <label>URL</label>
              <input
                value={values.url}
                onChange={(event) => handleFieldChange('url', event.target.value)}
                placeholder="https://example.com"
              />
            </div>
          )}

          {type === 'text' && (
            <div className="field-group">
              <label>Plain text</label>
              <textarea
                value={values.text}
                onChange={(event) => handleFieldChange('text', event.target.value)}
                placeholder="Enter your message…"
                rows={4}
              />
            </div>
          )}

          {type === 'email' && (
            <>
              <div className="field-group">
                <label>Email address</label>
                <input
                  type="email"
                  value={values.email}
                  onChange={(event) => handleFieldChange('email', event.target.value)}
                  placeholder="hello@example.com"
                />
              </div>
              <div className="field-group">
                <label>Subject</label>
                <input
                  value={values.subject}
                  onChange={(event) => handleFieldChange('subject', event.target.value)}
                  placeholder="Subject line"
                />
              </div>
              <div className="field-group">
                <label>Body</label>
                <textarea
                  value={values.body}
                  onChange={(event) => handleFieldChange('body', event.target.value)}
                  placeholder="Email body…"
                  rows={3}
                />
              </div>
            </>
          )}

          {type === 'wifi' && (
            <>
              <div className="field-group">
                <label>Network name (SSID)</label>
                <input
                  value={values.ssid}
                  onChange={(event) => handleFieldChange('ssid', event.target.value)}
                  placeholder="MyNetwork"
                />
              </div>
              <div className="field-group">
                <label>Password</label>
                <input
                  value={values.password}
                  onChange={(event) => handleFieldChange('password', event.target.value)}
                  placeholder="password123"
                />
              </div>
              <div className="field-group">
                <label>Security</label>
                <select
                  value={values.security}
                  onChange={(event) => handleFieldChange('security', event.target.value)}
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="">None</option>
                </select>
              </div>
            </>
          )}

          {type === 'vcard' && (
            <>
              <div className="field-group">
                <label>Full name</label>
                <input
                  value={values.name}
                  onChange={(event) => handleFieldChange('name', event.target.value)}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="field-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={values.phone}
                  onChange={(event) => handleFieldChange('phone', event.target.value)}
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div className="field-group">
                <label>Email</label>
                <input
                  type="email"
                  value={values.email}
                  onChange={(event) => handleFieldChange('email', event.target.value)}
                  placeholder="jane@example.com"
                />
              </div>
              <div className="field-group">
                <label>Company</label>
                <input
                  value={values.company}
                  onChange={(event) => handleFieldChange('company', event.target.value)}
                  placeholder="Acme Inc."
                />
              </div>
              <div className="field-group">
                <label>Website</label>
                <input
                  value={values.urlv}
                  onChange={(event) => handleFieldChange('urlv', event.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </>
          )}

          <div className="field-group">
            <label>Error correction</label>
            <select
              value={errorLevel}
              onChange={(event) => setErrorLevel(event.target.value)}
            >
              {errorLevels.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group color-fields">
            <div>
              <label>Dot color</label>
              <input
                type="color"
                value={dotColor}
                onChange={(event) => setDotColor(event.target.value)}
              />
            </div>
            <div>
              <label>Background</label>
              <input
                type="color"
                value={bgColor}
                onChange={(event) => setBgColor(event.target.value)}
              />
            </div>
            <div>
              <label>Corner color</label>
              <input
                type="color"
                value={cornerColor}
                onChange={(event) => setCornerColor(event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="tool-preview card">
          <div className="section-header">
            <h2>Preview</h2>
            <p>Live QR code preview and download options.</p>
          </div>

          <div className="qr-preview">
            <canvas ref={canvasRef} aria-label="QR code preview" />
            {dataUri ? (
              <a href={dataUri} download="qr-code.png" className="btn-primary">
                Download PNG
              </a>
            ) : (
              <p className="helper-text">Enter content to generate a QR code.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
