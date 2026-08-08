'use client';

import { useState, ChangeEvent } from 'react';
import NextImage from 'next/image';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

export default function ImageFormatConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('webp');
  const [quality, setQuality] = useState(85);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState<number | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setConvertedUrl(null);
    setConvertedSize(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleConvert = () => {
    if (!previewUrl || !selectedFile) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = previewUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (targetFormat === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const mimeType = `image/${targetFormat}`;
      const dataUrl = canvas.toDataURL(mimeType, quality / 100);

      setConvertedUrl(dataUrl);

      // Estimate byte size from DataURL
      const head = `data:${mimeType};base64,`;
      const sizeInBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
      setConvertedSize(sizeInBytes);
    };
  };

  const handleDownload = () => {
    if (!convertedUrl || !selectedFile) return;
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = convertedUrl;
    a.download = `${baseName}.${targetFormat}`;
    a.click();
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="imgFileInput">
              Select Image File (PNG, JPEG, WebP, SVG)
            </label>
            <input
              id="imgFileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={sharedStyles.input}
            />
          </div>

          {selectedFile && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
                <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
                  <label htmlFor="targetFmt">Output Format:</label>
                  <select
                    id="targetFmt"
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value as any)}
                    style={{ marginLeft: 8 }}
                  >
                    <option value="webp">WebP (Modern & Compact)</option>
                    <option value="png">PNG (Lossless)</option>
                    <option value="jpeg">JPEG (Lossy)</option>
                  </select>
                </div>

                {targetFormat !== 'png' && (
                  <div className={sharedStyles.buttonGroup} style={{ margin: 0, alignItems: 'center', display: 'flex' }}>
                    <label htmlFor="imgQuality">Quality ({quality}%):</label>
                    <input
                      id="imgQuality"
                      type="range"
                      min={10}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      style={{ marginLeft: 8, width: 120 }}
                    />
                  </div>
                )}

                <button
                  type="button"
                  className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
                  onClick={handleConvert}
                >
                  Convert Format
                </button>
              </div>

              {convertedUrl && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    background: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    marginBottom: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ Conversion Complete</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                      Original: {Math.round(selectedFile.size / 1024)} KB ➔ Converted ({targetFormat.toUpperCase()}): {convertedSize ? Math.round(convertedSize / 1024) : 0} KB
                    </div>
                  </div>
                  <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={handleDownload}>
                    Download Image
                  </button>
                </div>
              )}

              {/* Image Preview Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <h4 style={{ marginBottom: 8 }}>Original Image</h4>
                  {previewUrl && (
                    <NextImage
                      src={previewUrl}
                      alt="Original Preview"
                      width={1000}
                      height={240}
                      unoptimized
                      style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 6, border: '1px solid var(--border-color, #333)', objectFit: 'contain' }}
                    />
                  )}
                </div>
                <div>
                  <h4 style={{ marginBottom: 8 }}>Converted Preview</h4>
                  {convertedUrl ? (
                    <NextImage
                      src={convertedUrl}
                      alt="Converted Preview"
                      width={1000}
                      height={240}
                      unoptimized
                      style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 6, border: '1px solid var(--border-color, #333)', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ height: 240, border: '1px dashed var(--border-color, #444)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                      Click Convert to preview
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
