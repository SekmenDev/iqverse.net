'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { buildQRPayload } from '@/lib/utils';
import styles from '@/styles/qrforge.module.css';

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

const dotStyles = [
  {
    value: 'square',
    title: 'Square',
    icon: <rect x="3" y="3" width="14" height="14" rx="0" />,
  },
  {
    value: 'rounded',
    title: 'Rounded',
    icon: <rect x="3" y="3" width="14" height="14" rx="4" />,
  },
  {
    value: 'dots',
    title: 'Dots',
    icon: <circle cx="10" cy="10" r="7" />,
  },
  {
    value: 'classy',
    title: 'Classy',
    icon: (
      <>
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <rect x="6" y="6" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </>
    ),
  },
  {
    value: 'classy-rounded',
    title: 'Classy rounded',
    icon: (
      <>
        <rect x="3" y="3" width="14" height="14" rx="5" />
        <circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </>
    ),
  },
  {
    value: 'extra-rounded',
    title: 'Extra rounded',
    icon: <rect x="3" y="3" width="14" height="14" rx="7" />,
  },
];

const cornerStyles = [
  {
    value: 'square',
    title: 'Square',
    icon: <rect x="2" y="2" width="7" height="7" rx="0" fill="none" stroke="currentColor" strokeWidth="2" />,
  },
  {
    value: 'extra-rounded',
    title: 'Rounded',
    icon: <rect x="2" y="2" width="7" height="7" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />,
  },
  {
    value: 'dot',
    title: 'Dot',
    icon: <circle cx="5.5" cy="5.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />,
  },
];

const presets = [
  { name: 'Classic', dots: '#000000', bg: '#ffffff', corner: '#000000', style: { background: '#000', color: '#fff' } },
  { name: 'Ocean', dots: '#1a1a2e', bg: '#e8f4f8', corner: '#0077b6', style: { background: '#1a1a2e', color: '#e8f4f8' } },
  { name: 'Forest', dots: '#2d6a4f', bg: '#d8f3dc', corner: '#1b4332', style: { background: '#2d6a4f', color: '#d8f3dc' } },
  { name: 'Grape', dots: '#7b2d8b', bg: '#fce4ec', corner: '#4a0072', style: { background: '#7b2d8b', color: '#fce4ec' } },
  { name: 'Ember', dots: '#b5451b', bg: '#fff8f0', corner: '#7c2d12', style: { background: '#b5451b', color: '#fff8f0' } },
  { name: 'Night', dots: '#ffffff', bg: '#0f0f0f', corner: '#ffffff', style: { background: '#0f0f0f', color: '#fff', border: '1px solid #333' } },
];

export default function QRForge() {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'logo' | 'export'>('content');
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
  const [dotStyle, setDotStyle] = useState('square');
  const [cornerStyle, setCornerStyle] = useState('square');
  const [dotColor, setDotColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [cornerColor, setCornerColor] = useState('#000000');
  const [margin, setMargin] = useState(20);
  const [qrSize, setQrSize] = useState(320);

  const [logoData, setLogoData] = useState<string | null>(null);
  const [logoFilename, setLogoFilename] = useState('');
  const [logoSize, setLogoSize] = useState(0.2);
  const [logoMargin, setLogoMargin] = useState(4);
  const [logoBgStyle, setLogoBgStyle] = useState('transparent');
  const [isDragOver, setIsDragOver] = useState(false);

  const [exportFmt, setExportFmt] = useState<'png' | 'svg' | 'jpeg' | 'webp'>('png');
  const [filename, setFilename] = useState('my-qr-code');
  const [exportSize, setExportSize] = useState('1024');
  const [customSize, setCustomSize] = useState(800);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const qrCodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const payload = useMemo(() => buildQRPayload(type, values), [type, values]);

  const metaInfo = useMemo(() => {
    const len = new TextEncoder().encode(payload).length;
    const version = Math.min(Math.max(1, Math.ceil(len / 25)), 40);
    const ecMap: Record<string, string> = {
      L: 'Low - 7%',
      M: 'Medium - 15%',
      Q: 'Quartile - 25%',
      H: 'High - 30%',
    };
    return {
      len,
      version: `≈ ${version}`,
      ec: ecMap[errorLevel] || 'Medium - 15%',
    };
  }, [payload, errorLevel]);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      const element = containerRef.current;
      if (!element) return;

      let logoBg: string | undefined = undefined;
      if (logoBgStyle === 'white') logoBg = '#ffffff';
      else if (logoBgStyle === 'qr') logoBg = bgColor;

      const qrOptions = {
        width: qrSize,
        height: qrSize,
        type: 'canvas' as any,
        data: payload || 'https://example.com',
        image: logoData || '',
        dotsOptions: {
          type: dotStyle as any,
          color: dotColor,
        },
        cornersSquareOptions: {
          type: cornerStyle as any,
          color: cornerColor,
        },
        cornersDotOptions: {
          type: '' as any,
          color: cornerColor,
        },
        backgroundOptions: {
          color: bgColor,
        },
        margin: margin,
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: logoMargin,
          imageSize: logoSize,
          ...(logoBg ? { background: logoBg } : {}),
        },
        qrOptions: {
          errorCorrectionLevel: errorLevel as any,
        },
      };

      if (!qrCodeRef.current) {
        qrCodeRef.current = new QRCodeStyling(qrOptions);
        element.innerHTML = '';
        qrCodeRef.current.append(element);
      } else {
        qrCodeRef.current.update(qrOptions);
      }
    });
  }, [
    payload,
    dotStyle,
    cornerStyle,
    dotColor,
    bgColor,
    cornerColor,
    margin,
    qrSize,
    logoData,
    logoSize,
    logoMargin,
    logoBgStyle,
    errorLevel,
  ]);

  function handleFieldChange(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handlePresetClick(preset: (typeof presets)[0]) {
    setDotColor(preset.dots);
    setBgColor(preset.bg);
    setCornerColor(preset.corner);
  }

  function handleFileSelect(file: File) {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoData(e.target?.result as string);
        setLogoFilename(file.name);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleRemoveLogo() {
    setLogoData(null);
    setLogoFilename('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleDownload() {
    const size = exportSize === 'custom' ? customSize : parseInt(exportSize, 10);
    const { default: QRCodeStyling } = await import('qr-code-styling');

    let logoBg: string | undefined = undefined;
    if (logoBgStyle === 'white') logoBg = '#ffffff';
    else if (logoBgStyle === 'qr') logoBg = bgColor;

    const exportQr = new QRCodeStyling({
      width: size,
      height: size,
      type: 'canvas' as any,
      data: payload || 'https://example.com',
      image: logoData || '',
      dotsOptions: { type: dotStyle as any, color: dotColor },
      cornersSquareOptions: { type: cornerStyle as any, color: cornerColor },
      cornersDotOptions: { type: '' as any, color: cornerColor },
      backgroundOptions: { color: bgColor },
      margin: margin,
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: logoMargin,
        imageSize: logoSize,
        ...(logoBg ? { background: logoBg } : {}),
      },
      qrOptions: { errorCorrectionLevel: errorLevel as any },
    });

    exportQr.download({ name: filename || 'my-qr-code', extension: exportFmt });
  }

  async function handleCopy() {
    try {
      const { default: QRCodeStyling } = await import('qr-code-styling');
      let logoBg: string | undefined = undefined;
      if (logoBgStyle === 'white') logoBg = '#ffffff';
      else if (logoBgStyle === 'qr') logoBg = bgColor;

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      document.body.appendChild(tempContainer);

      const tempQr = new QRCodeStyling({
        width: 512,
        height: 512,
        type: 'canvas' as any,
        data: payload || 'https://example.com',
        image: logoData || '',
        dotsOptions: { type: dotStyle as any, color: dotColor },
        cornersSquareOptions: { type: cornerStyle as any, color: cornerColor },
        cornersDotOptions: { type: '' as any, color: cornerColor },
        backgroundOptions: { color: bgColor },
        margin: margin,
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: logoMargin,
          imageSize: logoSize,
          ...(logoBg ? { background: logoBg } : {}),
        },
        qrOptions: { errorCorrectionLevel: errorLevel as any },
      });

      tempQr.append(tempContainer);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const canvas = tempContainer.querySelector('canvas');
      if (canvas) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
          if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
          }
        });
      } else if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const tabOrder: ('content' | 'style' | 'logo' | 'export')[] = ['content', 'style', 'logo', 'export'];
  const currentIndex = tabOrder.indexOf(activeTab);

  return (
    <div className={styles.layout}>
      <aside className={styles.panel}>
        <div className={styles.steps}>
          {tabOrder.map((stepKey, idx) => {
            const isDone = idx < currentIndex;
            const isActive = stepKey === activeTab;
            const stepClass = isActive
              ? `${styles.step} ${styles.stepActive}`
              : isDone
                ? `${styles.step} ${styles.stepDone}`
                : styles.step;

            return (
              <div key={stepKey} style={{ display: 'contents' }}>
                <button className={stepClass} onClick={() => setActiveTab(stepKey)}>
                  <span className={styles.stepNum}>{`0${idx + 1}`}</span>
                  <span className={styles.stepLabel}>{stepKey}</span>
                </button>
                {idx < tabOrder.length - 1 && <div className={styles.stepLine} />}
              </div>
            );
          })}
        </div>

        {/* TAB 1: CONTENT */}
        {activeTab === 'content' && (
          <div className={styles.tabPanel}>
            <div className={styles.sectionTitle}>What to encode</div>

            <div className={styles.typePicker}>
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={type === opt.value ? `${styles.typeBtn} ${styles.typeBtnActive}` : styles.typeBtn}
                  onClick={() => setType(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {type === 'url' && (
              <div className={styles.inputGroup}>
                <label htmlFor="input-url">URL</label>
                <input
                  id="input-url"
                  type="url"
                  className={styles.inputField}
                  value={values.url}
                  onChange={(e) => handleFieldChange('url', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            )}

            {type === 'text' && (
              <div className={styles.inputGroup}>
                <label htmlFor="input-text">Plain text</label>
                <textarea
                  id="input-text"
                  className={styles.textareaField}
                  value={values.text}
                  onChange={(e) => handleFieldChange('text', e.target.value)}
                  placeholder="Enter your message…"
                  rows={4}
                />
              </div>
            )}

            {type === 'email' && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="input-email">Email address</label>
                  <input
                    id="input-email"
                    type="email"
                    className={styles.inputField}
                    value={values.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="hello@example.com"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="input-email-subject">Subject</label>
                  <input
                    id="input-email-subject"
                    type="text"
                    className={styles.inputField}
                    value={values.subject}
                    onChange={(e) => handleFieldChange('subject', e.target.value)}
                    placeholder="Subject line"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="input-email-body">Body</label>
                  <textarea
                    id="input-email-body"
                    className={styles.textareaField}
                    value={values.body}
                    onChange={(e) => handleFieldChange('body', e.target.value)}
                    placeholder="Email body…"
                    rows={3}
                  />
                </div>
              </>
            )}

            {type === 'wifi' && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="input-wifi-ssid">Network name (SSID)</label>
                  <input
                    id="input-wifi-ssid"
                    type="text"
                    className={styles.inputField}
                    value={values.ssid}
                    onChange={(e) => handleFieldChange('ssid', e.target.value)}
                    placeholder="MyNetwork"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="input-wifi-pass">Password</label>
                  <input
                    id="input-wifi-pass"
                    type="text"
                    className={styles.inputField}
                    value={values.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    placeholder="password123"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="input-wifi-sec">Security</label>
                  <select
                    id="input-wifi-sec"
                    className={styles.selectField}
                    value={values.security}
                    onChange={(e) => handleFieldChange('security', e.target.value)}
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
                <div className={styles.inputGroup}>
                  <label htmlFor="input-vcard-name">Full name</label>
                  <input
                    id="input-vcard-name"
                    type="text"
                    className={styles.inputField}
                    value={values.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Jane Smith"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="input-vcard-phone">Phone</label>
                  <input
                    id="input-vcard-phone"
                    type="tel"
                    className={styles.inputField}
                    value={values.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+1 555 000 0000"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="input-vcard-email">Email</label>
                  <input
                    id="input-vcard-email"
                    type="email"
                    className={styles.inputField}
                    value={values.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="jane@example.com"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="input-vcard-company">Company</label>
                  <input
                    id="input-vcard-company"
                    type="text"
                    className={styles.inputField}
                    value={values.company}
                    onChange={(e) => handleFieldChange('company', e.target.value)}
                    placeholder="Acme Inc."
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="input-vcard-url">Website</label>
                  <input
                    id="input-vcard-url"
                    type="url"
                    className={styles.inputField}
                    value={values.urlv}
                    onChange={(e) => handleFieldChange('urlv', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </>
            )}

            <div className={styles.fieldRow} style={{ marginTop: '20px' }}>
              <label className={styles.fieldLabel} htmlFor="error-level">
                Error correction
              </label>
              <select
                id="error-level"
                className={`${styles.selectField} ${styles.selectInline}`}
                value={errorLevel}
                onChange={(e) => setErrorLevel(e.target.value)}
              >
                {errorLevels.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" className={styles.btnNext} onClick={() => setActiveTab('style')}>
              Next: Style <span>→</span>
            </button>
          </div>
        )}

        {/* TAB 2: STYLE */}
        {activeTab === 'style' && (
          <div className={styles.tabPanel}>
            <div className={styles.sectionTitle}>Appearance</div>

            <span className={styles.fieldLabel}>Dot style</span>
            <div className={styles.shapePicker}>
              {dotStyles.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  title={item.title}
                  className={dotStyle === item.value ? `${styles.shapeBtn} ${styles.shapeBtnActive}` : styles.shapeBtn}
                  onClick={() => setDotStyle(item.value)}
                >
                  <svg viewBox="0 0 20 20">{item.icon}</svg>
                </button>
              ))}
            </div>

            <span className={styles.fieldLabel} style={{ marginTop: '18px' }}>
              Corner square style
            </span>
            <div className={styles.shapePicker}>
              {cornerStyles.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  title={item.title}
                  className={
                    cornerStyle === item.value ? `${styles.shapeBtn} ${styles.shapeBtnActive}` : styles.shapeBtn
                  }
                  onClick={() => setCornerStyle(item.value)}
                >
                  <svg viewBox="0 0 20 20">{item.icon}</svg>
                </button>
              ))}
            </div>

            <div className={styles.colorRow}>
              <div className={styles.colorItem}>
                <label htmlFor="color-dots">Dot color</label>
                <div className={styles.colorSwatchWrap}>
                  <input
                    type="color"
                    id="color-dots"
                    className={styles.colorInput}
                    value={dotColor}
                    onChange={(e) => setDotColor(e.target.value)}
                  />
                  <span className={styles.colorHex}>{dotColor}</span>
                </div>
              </div>

              <div className={styles.colorItem}>
                <label htmlFor="color-bg">Background</label>
                <div className={styles.colorSwatchWrap}>
                  <input
                    type="color"
                    id="color-bg"
                    className={styles.colorInput}
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                  <span className={styles.colorHex}>{bgColor}</span>
                </div>
              </div>

              <div className={styles.colorItem}>
                <label htmlFor="color-corner">Corner color</label>
                <div className={styles.colorSwatchWrap}>
                  <input
                    type="color"
                    id="color-corner"
                    className={styles.colorInput}
                    value={cornerColor}
                    onChange={(e) => setCornerColor(e.target.value)}
                  />
                  <span className={styles.colorHex}>{cornerColor}</span>
                </div>
              </div>
            </div>

            <div className={styles.presetLabel}>Presets</div>
            <div className={styles.presetRow}>
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className={styles.presetChip}
                  style={preset.style}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className={styles.fieldRow} style={{ marginTop: '20px' }}>
              <label className={styles.fieldLabel} htmlFor="margin-size">
                Quiet zone (margin)
              </label>
              <div className={styles.sliderRow}>
                <input
                  type="range"
                  id="margin-size"
                  className={styles.rangeInput}
                  min="0"
                  max="40"
                  value={margin}
                  step="4"
                  onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                />
                <span className={styles.sliderVal}>{margin}</span>
              </div>
            </div>

            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel} htmlFor="qr-size">
                QR size
              </label>
              <div className={styles.sliderRow}>
                <input
                  type="range"
                  id="qr-size"
                  className={styles.rangeInput}
                  min="200"
                  max="600"
                  value={qrSize}
                  step="40"
                  onChange={(e) => setQrSize(parseInt(e.target.value, 10))}
                />
                <span className={styles.sliderVal}>{qrSize}px</span>
              </div>
            </div>

            <button type="button" className={styles.btnNext} onClick={() => setActiveTab('logo')}>
              Next: Logo <span>→</span>
            </button>
          </div>
        )}

        {/* TAB 3: LOGO */}
        {activeTab === 'logo' && (
          <div className={styles.tabPanel}>
            <div className={styles.sectionTitle}>Center image</div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            {!logoData ? (
              <div
                className={
                  isDragOver ? `${styles.uploadZone} ${styles.uploadZoneDragOver}` : styles.uploadZone
                }
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileSelect(file);
                }}
              >
                <div className={styles.uploadIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className={styles.uploadText}>
                  Drop image or <span className={styles.uploadLink}>browse</span>
                </div>
                <div className={styles.uploadSub}>PNG, SVG, JPEG. Transparent PNG recommended</div>
              </div>
            ) : (
              <div className={styles.logoPreviewRow}>
                <Image src={logoData} alt="logo preview" width={48} height={48} unoptimized />
                <div>
                  <div className={styles.logoFilename}>{logoFilename}</div>
                  <button type="button" className={styles.removeBtn} onClick={handleRemoveLogo}>
                    Remove
                  </button>
                </div>
              </div>
            )}

            <div className={styles.fieldRow} style={{ marginTop: '20px' }}>
              <label className={styles.fieldLabel} htmlFor="logo-size">
                Logo size
              </label>
              <div className={styles.sliderRow}>
                <input
                  type="range"
                  id="logo-size"
                  className={styles.rangeInput}
                  min="0.1"
                  max="0.4"
                  value={logoSize}
                  step="0.01"
                  onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                />
                <span className={styles.sliderVal}>{Math.round(logoSize * 100)}%</span>
              </div>
            </div>

            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel} htmlFor="logo-margin">
                Logo margin
              </label>
              <div className={styles.sliderRow}>
                <input
                  type="range"
                  id="logo-margin"
                  className={styles.rangeInput}
                  min="0"
                  max="16"
                  value={logoMargin}
                  step="1"
                  onChange={(e) => setLogoMargin(parseInt(e.target.value, 10))}
                />
                <span className={styles.sliderVal}>{logoMargin}px</span>
              </div>
            </div>

            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel} htmlFor="logo-bg-style">
                Background style
              </label>
              <select
                id="logo-bg-style"
                className={`${styles.selectField} ${styles.selectInline}`}
                value={logoBgStyle}
                onChange={(e) => setLogoBgStyle(e.target.value)}
              >
                <option value="transparent">Transparent</option>
                <option value="white">White circle</option>
                <option value="qr">Match QR bg</option>
              </select>
            </div>

            <div className={styles.tipBox}>
              <strong>Tip:</strong> Use Error Correction <em>H (30%)</em> in the Content tab when adding a logo. It ensures the QR remains scannable even with part of it covered.
            </div>

            <button type="button" className={styles.btnNext} onClick={() => setActiveTab('export')}>
              Next: Export <span>→</span>
            </button>
          </div>
        )}

        {/* TAB 4: EXPORT */}
        {activeTab === 'export' && (
          <div className={styles.tabPanel}>
            <div className={styles.sectionTitle}>Download</div>

            <div className={styles.exportOptions}>
              {[
                { fmt: 'png', badge: 'PNG', desc: 'Raster: for web & print' },
                { fmt: 'svg', badge: 'SVG', desc: 'Vector: infinitely scalable' },
                { fmt: 'jpeg', badge: 'JPEG', desc: 'Small file size' },
                { fmt: 'webp', badge: 'WEBP', desc: 'Modern, compressed' },
              ].map((item) => (
                <button
                  key={item.fmt}
                  type="button"
                  className={
                    exportFmt === item.fmt ? `${styles.exportBtn} ${styles.exportBtnActive}` : styles.exportBtn
                  }
                  onClick={() => setExportFmt(item.fmt as any)}
                >
                  <span className={styles.fmtBadge}>{item.badge}</span>
                  <span className={styles.fmtDesc}>{item.desc}</span>
                </button>
              ))}
            </div>

            <div className={styles.inputGroup} style={{ marginTop: '20px' }}>
              <label htmlFor="export-filename">File name</label>
              <div className={styles.filenameRow}>
                <input
                  type="text"
                  id="export-filename"
                  className={styles.inputField}
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                />
                <span className={styles.filenameExt}>{`.${exportFmt}`}</span>
              </div>
            </div>

            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel} htmlFor="export-size">
                Export size
              </label>
              <select
                id="export-size"
                className={`${styles.selectField} ${styles.selectInline}`}
                value={exportSize}
                onChange={(e) => setExportSize(e.target.value)}
              >
                <option value="512">512 × 512</option>
                <option value="1024">1024 × 1024</option>
                <option value="2048">2048 × 2048</option>
                <option value="custom">Custom…</option>
              </select>
            </div>

            {exportSize === 'custom' && (
              <div className={styles.inputGroup}>
                <label htmlFor="custom-size-val">Custom size (px)</label>
                <input
                  type="number"
                  id="custom-size-val"
                  className={styles.inputField}
                  value={customSize}
                  min={100}
                  max={4000}
                  onChange={(e) => setCustomSize(parseInt(e.target.value, 10) || 800)}
                />
              </div>
            )}

            <button type="button" className={styles.btnDownload} onClick={handleDownload}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download QR Code
            </button>

            <div className={styles.shareRow}>
              <button
                type="button"
                className={copied ? `${styles.shareBtn} ${styles.shareBtnSuccess}` : styles.shareBtn}
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy to clipboard
                  </>
                )}
              </button>
            </div>

            <div className={styles.metaBox}>
              <div className={styles.metaRow}>
                <span>Data encoded</span>
                <span>{`${metaInfo.len} bytes`}</span>
              </div>
              <div className={styles.metaRow}>
                <span>QR version</span>
                <span>{metaInfo.version}</span>
              </div>
              <div className={styles.metaRow}>
                <span>Error correction</span>
                <span>{metaInfo.ec}</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      <section className={styles.previewArea}>
        <div className={styles.previewLabel}>Live preview</div>
        <div className={styles.canvasWrap}>
          <div ref={containerRef} className={styles.qrContainer} />
        </div>
        <div className={styles.scanNote}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Scan with your phone camera to test
        </div>
      </section>
    </div>
  );
}
