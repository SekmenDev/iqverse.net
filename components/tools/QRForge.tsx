'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { buildQRPayload } from '@/lib/utils';

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

  const payload = useMemo(() => buildQRPayload(type, values), [type, values]);

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
            <label htmlFor="qrType">Data type</label>
            <div className="select-group" id="qrType">
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
              <label htmlFor="qrUrl">URL</label>
              <input
                id="qrUrl"
                value={values.url}
                onChange={(event) => handleFieldChange('url', event.target.value)}
                placeholder="https://example.com"
              />
            </div>
          )}

          {type === 'text' && (
            <div className="field-group">
              <label htmlFor="qrText">Plain text</label>
              <textarea
                id="qrText"
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
                <label htmlFor="qrEmail">Email address</label>
                <input
                  id="qrEmail"
                  type="email"
                  value={values.email}
                  onChange={(event) => handleFieldChange('email', event.target.value)}
                  placeholder="hello@example.com"
                />
              </div>
              <div className="field-group">
                <label htmlFor="qrSubject">Subject</label>
                <input
                  id="qrSubject"
                  value={values.subject}
                  onChange={(event) => handleFieldChange('subject', event.target.value)}
                  placeholder="Subject line"
                />
              </div>
              <div className="field-group">
                <label htmlFor="qrBody">Body</label>
                <textarea
                  id="qrBody"
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
                <label htmlFor="qrSsid">Network name (SSID)</label>
                <input
                  id="qrSsid"
                  value={values.ssid}
                  onChange={(event) => handleFieldChange('ssid', event.target.value)}
                  placeholder="MyNetwork"
                />
              </div>
              <div className="field-group">
                <label htmlFor="qrPassword">Password</label>
                <input
                  id="qrPassword"
                  value={values.password}
                  onChange={(event) => handleFieldChange('password', event.target.value)}
                  placeholder="password123"
                />
              </div>
              <div className="field-group">
                <label htmlFor="qrSecurity">Security</label>
                <select
                  id="qrSecurity"
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
                <label htmlFor="qrName">Full name</label>
                <input
                  id="qrName"
                  value={values.name}
                  onChange={(event) => handleFieldChange('name', event.target.value)}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="field-group">
                <label htmlFor="qrPhone">Phone</label>
                <input
                  id="qrPhone"
                  type="tel"
                  value={values.phone}
                  onChange={(event) => handleFieldChange('phone', event.target.value)}
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div className="field-group">
                <label htmlFor="qrVcardEmail">Email</label>
                <input
                  id="qrVcardEmail"
                  type="email"
                  value={values.email}
                  onChange={(event) => handleFieldChange('email', event.target.value)}
                  placeholder="jane@example.com"
                />
              </div>
              <div className="field-group">
                <label htmlFor="qrCompany">Company</label>
                <input
                  id="qrCompany"
                  value={values.company}
                  onChange={(event) => handleFieldChange('company', event.target.value)}
                  placeholder="Acme Inc."
                />
              </div>
              <div className="field-group">
                <label htmlFor="qrWebsite">Website</label>
                <input
                  id="qrWebsite"
                  value={values.urlv}
                  onChange={(event) => handleFieldChange('urlv', event.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </>
          )}

          <div className="field-group">
            <label htmlFor="qrErrorLevel">Error correction</label>
            <select
              id="qrErrorLevel"
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
              <label htmlFor="qrDotColor">Dot color</label>
              <input
                id="qrDotColor"
                type="color"
                value={dotColor}
                onChange={(event) => setDotColor(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="qrBgColor">Background</label>
              <input
                id="qrBgColor"
                type="color"
                value={bgColor}
                onChange={(event) => setBgColor(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="qrCornerColor">Corner color</label>
              <input
                id="qrCornerColor"
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
