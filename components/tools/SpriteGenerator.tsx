'use client';

import { useState, ChangeEvent } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

interface SpriteIcon {
  id: string;
  name: string;
  file: File;
  previewUrl: string;
}

interface SpriteOutput {
  dataUrl: string;
  css: string;
  json: string;
  width: number;
  height: number;
}

export default function SpriteGenerator() {
  const [icons, setIcons] = useState<SpriteIcon[]>([]);
  const [padding, setPadding] = useState(8);
  const [columns, setColumns] = useState(4);
  const [iconSize, setIconSize] = useState(32);
  const [output, setOutput] = useState<SpriteOutput | null>(null);
  const [copiedCss, setCopiedCss] = useState(false);

  const handleFilesUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newIcons: SpriteIcon[] = files.map((file, i) => ({
      id: `icon_${Date.now()}_${i}`,
      name: file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setIcons([...icons, ...newIcons]);
    setOutput(null);
  };

  const removeIcon = (idx: number) => {
    setIcons(icons.filter((_, i) => i !== idx));
    setOutput(null);
  };

  const generateSprite = () => {
    if (icons.length === 0) return;

    const cols = Math.min(columns, icons.length);
    const rows = Math.ceil(icons.length / cols);
    const cellWidth = iconSize + padding * 2;
    const cellHeight = iconSize + padding * 2;

    const canvasWidth = cols * cellWidth;
    const canvasHeight = rows * cellHeight;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cssStr = `.sprite {\n  background-image: url('sprite.png');\n  background-repeat: no-repeat;\n  display: inline-block;\n}\n\n`;
    const jsonMapping: Record<string, { x: number; y: number; width: number; height: number }> = {};

    let loadedCount = 0;
    icons.forEach((icon, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      const x = col * cellWidth + padding;
      const y = row * cellHeight + padding;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = icon.previewUrl;

      img.onload = () => {
        ctx.drawImage(img, x, y, iconSize, iconSize);
        loadedCount++;

        cssStr += `.icon-${icon.name} {\n  width: ${iconSize}px;\n  height: ${iconSize}px;\n  background-position: -${x}px -${y}px;\n}\n\n`;
        jsonMapping[icon.name] = { x, y, width: iconSize, height: iconSize };

        if (loadedCount === icons.length) {
          const dataUrl = canvas.toDataURL('image/png');
          setOutput({
            dataUrl,
            css: cssStr.trim(),
            json: JSON.stringify(jsonMapping, null, 2),
            width: canvasWidth,
            height: canvasHeight,
          });
        }
      };
    });
  };

  const handleCopyCss = () => {
    if (!output) return;
    navigator.clipboard.writeText(output.css);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!output) return;
    const a = document.createElement('a');
    a.href = output.dataUrl;
    a.download = 'sprite.png';
    a.click();
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="spriteFileInput">
              Upload Icon Files (PNG, SVG)
            </label>
            <input
              id="spriteFileInput"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesUpload}
              className={sharedStyles.input}
            />
          </div>

          {/* Configuration Controls */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
              <label htmlFor="iconSz">Icon Size:</label>
              <select
                id="iconSz"
                value={iconSize}
                onChange={(e) => setIconSize(Number(e.target.value))}
                style={{ marginLeft: 8 }}
              >
                <option value={16}>16x16 px</option>
                <option value={24}>24x24 px</option>
                <option value={32}>32x32 px</option>
                <option value={48}>48x48 px</option>
                <option value={64}>64x64 px</option>
              </select>
            </div>

            <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
              <label htmlFor="colCount">Columns:</label>
              <input
                id="colCount"
                type="number"
                min={1}
                max={20}
                value={columns}
                onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))}
                className={sharedStyles.input}
                style={{ width: 70, marginLeft: 8 }}
              />
            </div>

            <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
              <label htmlFor="padVal">Padding:</label>
              <input
                id="padVal"
                type="number"
                min={0}
                max={32}
                value={padding}
                onChange={(e) => setPadding(Math.max(0, parseInt(e.target.value) || 0))}
                className={sharedStyles.input}
                style={{ width: 70, marginLeft: 8 }}
              />
            </div>

            <button
              type="button"
              className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
              onClick={generateSprite}
              disabled={icons.length === 0}
            >
              Generate Sprite Sheet ({icons.length})
            </button>
          </div>

          {/* Icons Grid List */}
          {icons.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>Loaded Icons ({icons.length})</h4>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {icons.map((icon, idx) => (
                  <div
                    key={icon.id}
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color, #333)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <img src={icon.previewUrl} alt={icon.name} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{icon.name}</span>
                    <button type="button" className={sharedStyles.button} onClick={() => removeIcon(idx)} style={{ padding: '2px 6px', color: '#ff4d4f' }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output Results */}
          {output && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>
                  Generated Sprite Sheet ({output.width} x {output.height} px)
                </h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className={sharedStyles.button} onClick={handleCopyCss}>
                    {copiedCss ? 'Copied CSS!' : 'Copy CSS'}
                  </button>
                  <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={handleDownloadImage}>
                    Download sprite.png
                  </button>
                </div>
              </div>

              {/* Preview Sprite Image */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px dashed var(--border-color, #444)',
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <img src={output.dataUrl} alt="Sprite Sheet" style={{ border: '1px solid #555' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className={sharedStyles.field}>
                  <label className={sharedStyles.fieldLabel} htmlFor="spriteCssOut">
                    CSS Coordinate Classes
                  </label>
                  <textarea
                    id="spriteCssOut"
                    readOnly
                    value={output.css}
                    className={sharedStyles.outputArea}
                    rows={10}
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>

                <div className={sharedStyles.field}>
                  <label className={sharedStyles.fieldLabel} htmlFor="spriteJsonOut">
                    JSON Coordinate Mapping
                  </label>
                  <textarea
                    id="spriteJsonOut"
                    readOnly
                    value={output.json}
                    className={sharedStyles.outputArea}
                    rows={10}
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
