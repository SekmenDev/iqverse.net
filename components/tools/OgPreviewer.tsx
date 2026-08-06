'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

export default function OgPreviewer() {
  const [title, setTitle] = useState('IQVerse - Free Developer & AI Agent Tools');
  const [description, setDescription] = useState('Fast, private, client-side browser tools for developers, AI engineers, and security researchers.');
  const [url, setUrl] = useState('https://iqverse.net');
  const [imageUrl, setImageUrl] = useState('https://iqverse.net/og-banner.png');
  const [siteName, setSiteName] = useState('IQVerse');
  const [twitterHandle, setTwitterHandle] = useState('@iqverse');
  const [activePlatform, setActivePlatform] = useState<'google' | 'twitter' | 'facebook' | 'linkedin'>('google');

  const [copied, setCopied] = useState(false);

  const generateMetaHtml = (): string => {
    let html = `<!-- Primary Meta Tags -->\n`;
    html += `<title>${title.trim()}</title>\n`;
    html += `<meta name="title" content="${title.trim()}">\n`;
    html += `<meta name="description" content="${description.trim()}">\n\n`;

    html += `<!-- Open Graph / Facebook -->\n`;
    html += `<meta property="og:type" content="website">\n`;
    html += `<meta property="og:url" content="${url.trim()}">\n`;
    html += `<meta property="og:title" content="${title.trim()}">\n`;
    html += `<meta property="og:description" content="${description.trim()}">\n`;
    if (imageUrl.trim()) html += `<meta property="og:image" content="${imageUrl.trim()}">\n`;
    if (siteName.trim()) html += `<meta property="og:site_name" content="${siteName.trim()}">\n\n`;

    html += `<!-- Twitter / X -->\n`;
    html += `<meta property="twitter:card" content="summary_large_image">\n`;
    html += `<meta property="twitter:url" content="${url.trim()}">\n`;
    html += `<meta property="twitter:title" content="${title.trim()}">\n`;
    html += `<meta property="twitter:description" content="${description.trim()}">\n`;
    if (imageUrl.trim()) html += `<meta property="twitter:image" content="${imageUrl.trim()}">\n`;
    if (twitterHandle.trim()) html += `<meta property="twitter:site" content="${twitterHandle.trim()}">\n`;

    return html.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMetaHtml());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <section className={sharedStyles.section}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Inputs */}
          <div className={sharedStyles.card}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Meta Tags Input</h3>

            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="ogTitle">
                Page Title ({title.length}/60 chars)
              </label>
              <input
                id="ogTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={sharedStyles.input}
              />
            </div>

            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="ogDesc">
                Meta Description ({description.length}/160 chars)
              </label>
              <textarea
                id="ogDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={sharedStyles.textarea}
                rows={3}
              />
            </div>

            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="ogUrl">
                Canonical URL
              </label>
              <input
                id="ogUrl"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={sharedStyles.input}
              />
            </div>

            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="ogImg">
                Open Graph Image URL (og:image)
              </label>
              <input
                id="ogImg"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={sharedStyles.input}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className={sharedStyles.field}>
                <label className={sharedStyles.fieldLabel} htmlFor="siteName">
                  Site Name
                </label>
                <input
                  id="siteName"
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className={sharedStyles.input}
                />
              </div>
              <div className={sharedStyles.field}>
                <label className={sharedStyles.fieldLabel} htmlFor="twHandle">
                  Twitter Handle
                </label>
                <input
                  id="twHandle"
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  className={sharedStyles.input}
                />
              </div>
            </div>
          </div>

          {/* Social Card Preview */}
          <div className={sharedStyles.card}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {(['google', 'twitter', 'facebook', 'linkedin'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${sharedStyles.button} ${activePlatform === p ? sharedStyles.buttonPrimary : ''}`}
                  onClick={() => setActivePlatform(p)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Google Search Card */}
            {activePlatform === 'google' && (
              <div
                style={{
                  padding: 16,
                  background: '#ffffff',
                  color: '#202124',
                  borderRadius: 8,
                  fontFamily: 'arial, sans-serif',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: '#202124', marginBottom: 2 }}>{url}</div>
                <div style={{ fontSize: '1.2rem', color: '#1a0dab', fontWeight: 'bold', marginBottom: 4, cursor: 'pointer' }}>
                  {title || 'Page Title'}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#4d5156', lineHeight: 1.4 }}>
                  {description || 'Page description preview...'}
                </div>
              </div>
            )}

            {/* Twitter / X Card */}
            {activePlatform === 'twitter' && (
              <div
                style={{
                  border: '1px solid #333',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#000000',
                  color: '#ffffff',
                }}
              >
                {imageUrl && (
                  <div
                    style={{
                      height: 180,
                      background: `#222 url(${imageUrl}) center/cover no-repeat`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                )}
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: 2 }}>{url.replace(/https?:\/\//, '')}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.3 }}>{description}</div>
                </div>
              </div>
            )}

            {/* Facebook Card */}
            {activePlatform === 'facebook' && (
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#f2f3f5',
                  color: '#1c1e21',
                  fontFamily: 'helvetica, arial, sans-serif',
                }}
              >
                {imageUrl && (
                  <div style={{ height: 180, background: `#ccc url(${imageUrl}) center/cover no-repeat` }} />
                )}
                <div style={{ padding: 12, background: '#f2f3f5' }}>
                  <div style={{ fontSize: '0.75rem', color: '#606770', textTransform: 'uppercase', marginBottom: 2 }}>
                    {url.replace(/https?:\/\//, '').split('/')[0]}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1d2129', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#606770', lineHeight: 1.3 }}>{description}</div>
                </div>
              </div>
            )}

            {/* LinkedIn Card */}
            {activePlatform === 'linkedin' && (
              <div
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: '#ffffff',
                  color: '#000000',
                }}
              >
                {imageUrl && (
                  <div style={{ height: 180, background: `#ddd url(${imageUrl}) center/cover no-repeat` }} />
                )}
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.9)', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)' }}>{url.replace(/https?:\/\//, '')}</div>
                </div>
              </div>
            )}

            {/* Code Output */}
            <div style={{ marginTop: 24 }} className={sharedStyles.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className={sharedStyles.fieldLabel} htmlFor="metaCodeOutput">
                  Generated HTML Meta Tags
                </label>
                <button type="button" className={sharedStyles.button} onClick={handleCopy}>
                  {copied ? 'Copied HTML!' : 'Copy Tags'}
                </button>
              </div>
              <textarea
                id="metaCodeOutput"
                readOnly
                value={generateMetaHtml()}
                className={sharedStyles.outputArea}
                rows={10}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
