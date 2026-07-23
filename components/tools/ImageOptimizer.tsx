'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

export default function ImageOptimizer() {
  const [fileName, setFileName] = useState('');
  const [quality, setQuality] = useState('0.8');
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setMessage('');

    try {
      const imageUrl = URL.createObjectURL(file);
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Canvas is unavailable in this browser.');
          return;
        }

        ctx.drawImage(image, 0, 0, image.width, image.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setError('Unable to create a compressed preview.');
              return;
            }
            const optimizedUrl = URL.createObjectURL(blob);
            setPreviewUrl(optimizedUrl);
            setMessage(`Preview ready for ${file.name}.`);
          },
          file.type || 'image/webp',
          Number(quality),
        );
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image.');
    }
  };

  const downloadLink = useMemo(() => {
    if (!previewUrl) return null;
    return (
      <a href={previewUrl} download={fileName.replace(/\.[^.]+$/, '') + '.webp'} className={sharedStyles.buttonSmall}>
        Download optimized preview
      </a>
    );
  }, [fileName, previewUrl]);

  return (
    <div style={{ maxWidth: 900 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>Local image compression</div>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="imageFile">Upload image</label>
            <input id="imageFile" type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="imageQuality">Quality</label>
            <input
              id="imageQuality"
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            />
            <div style={{ color: 'var(--text-muted)', marginTop: 6 }}>{quality}</div>
          </div>

          {message && <div className={sharedStyles.successCard} style={{ marginTop: 12 }}><div className={sharedStyles.successMessage}>{message}</div></div>}
          {error && <div className={sharedStyles.errorCard} style={{ marginTop: 12 }}><div className={sharedStyles.errorMessage}>{error}</div></div>}

          {previewUrl && (
            <div style={{ marginTop: 24 }}>
              <img src={previewUrl} alt="Optimized preview" style={{ maxWidth: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
              {downloadLink}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
