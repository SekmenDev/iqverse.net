'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';
import CapCaptcha from '@/components/CapCaptcha';

const SAMPLE_TEMPLATES: Record<string, string> = {
  Article: `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Understanding AI Agents and Web Standards",
  "image": ["https://example.com/photos/1x1/photo.jpg"],
  "datePublished": "2026-01-15T08:00:00+08:00",
  "dateModified": "2026-02-01T09:20:00+08:00",
  "author": [{
    "@type": "Person",
    "name": "Jane Doe",
    "url": "https://example.com/profile/janedoe"
  }]
}`,
  Product: `{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Developer Pro Laptop",
  "image": ["https://example.com/photos/laptop.jpg"],
  "description": "High performance laptop built for AI development.",
  "sku": "0446310",
  "mpn": "925872",
  "brand": {
    "@type": "Brand",
    "name": "TechCorp"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/laptop",
    "priceCurrency": "USD",
    "price": "1499.00",
    "availability": "https://schema.org/InStock"
  }
}`,
  Organization: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "IQVerse",
  "url": "https://iqverse.net",
  "logo": "https://iqverse.net/logo.png",
  "sameAs": [
    "https://github.com/iqverse"
  ]
}`,
  FAQ: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Is IQVerse free?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Yes, IQVerse provides open-source tools running client-side in the browser."
    }
  }]
}`
};

const SAMPLE_URLS = [
  'https://iqverse.net',
  'https://example.com',
  'https://github.com'
];

interface ValidationResult {
  validJson: boolean;
  typeFound: string | null;
  contextFound: string | null;
  errors: string[];
  warnings: string[];
  detectedProperties: string[];
  rawSnippet?: string;
}

function validateSingleSchema(rawInput: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let parsed: Record<string, unknown> | null = null;
  let typeFound: string | null = null;
  let contextFound: string | null = null;
  let detectedProperties: string[] = [];

  let cleanInput = rawInput.trim();
  if (cleanInput.includes('<script')) {
    const match = cleanInput.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (match) {
      cleanInput = match[1].trim();
    }
  }

  try {
    parsed = JSON.parse(cleanInput);
  } catch (err) {
    errors.push(`JSON Syntax Error: ${(err as Error).message}`);
    return {
      validJson: false,
      typeFound: null,
      contextFound: null,
      errors,
      warnings,
      detectedProperties: [],
      rawSnippet: cleanInput.slice(0, 200),
    };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    errors.push('Schema object must be a valid JSON object.');
    return {
      validJson: true,
      typeFound: null,
      contextFound: null,
      errors,
      warnings,
      detectedProperties: [],
      rawSnippet: cleanInput.slice(0, 200),
    };
  }

  // Check @context
  const ctx = parsed['@context'];
  if (!ctx) {
    errors.push('Missing "@context" property (expected "https://schema.org").');
  } else if (typeof ctx === 'string') {
    contextFound = ctx;
    if (!ctx.includes('schema.org')) {
      warnings.push(`"@context" value "${ctx}" does not point to schema.org.`);
    }
  } else if (Array.isArray(ctx)) {
    contextFound = ctx.join(', ');
    if (!ctx.some((c) => typeof c === 'string' && c.includes('schema.org'))) {
      warnings.push('None of the "@context" entries point to schema.org.');
    }
  }

  // Check @type
  const type = parsed['@type'];
  if (!type) {
    errors.push('Missing "@type" property.');
  } else if (typeof type === 'string') {
    typeFound = type;
  } else if (Array.isArray(type)) {
    typeFound = type.join(', ');
  }

  detectedProperties = Object.keys(parsed).filter((k) => !k.startsWith('@'));

  // Required field checks for common types
  if (typeFound === 'Article' || typeFound === 'NewsArticle' || typeFound === 'BlogPosting') {
    if (!parsed.headline) warnings.push('Article schema recommended property "headline" is missing.');
    if (!parsed.image) warnings.push('Article schema recommended property "image" is missing.');
    if (!parsed.author) warnings.push('Article schema recommended property "author" is missing.');
    if (!parsed.datePublished) warnings.push('Article schema recommended property "datePublished" is missing.');
  } else if (typeFound === 'Product') {
    if (!parsed.name) warnings.push('Product schema recommended property "name" is missing.');
    if (!parsed.offers) warnings.push('Product schema recommended property "offers" is missing.');
  } else if (typeFound === 'Organization' || typeFound === 'LocalBusiness') {
    if (!parsed.name) warnings.push('Organization schema recommended property "name" is missing.');
    if (!parsed.url) warnings.push('Organization schema recommended property "url" is missing.');
  } else if (typeFound === 'FAQPage') {
    if (!parsed.mainEntity) warnings.push('FAQPage schema recommended property "mainEntity" is missing.');
  } else if (typeFound === 'WebSite') {
    if (!parsed.name && !parsed.url) warnings.push('WebSite schema recommended properties "name" or "url" are missing.');
  }

  return {
    validJson: true,
    typeFound,
    contextFound,
    errors,
    warnings,
    detectedProperties,
    rawSnippet: cleanInput.slice(0, 200),
  };
}

function extractSchemasFromHtml(html: string): string[] {
  const schemas: string[] = [];

  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const scriptElements = doc.querySelectorAll('script[type="application/ld+json"]');
      scriptElements.forEach((el) => {
        const text = (el.textContent || '').trim();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
              parsed.forEach((item) => schemas.push(JSON.stringify(item, null, 2)));
            } else {
              schemas.push(text);
            }
          } catch {
            schemas.push(text);
          }
        }
      });
      if (schemas.length > 0) return schemas;
    } catch {
      // Fallback to regex
    }
  }

  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[1].trim();
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => schemas.push(JSON.stringify(item, null, 2)));
        } else {
          schemas.push(text);
        }
      } catch {
        schemas.push(text);
      }
    }
  }

  return schemas;
}

export default function SchemaValidator() {
  const [mode, setMode] = useState<'code' | 'url'>('code');
  const [input, setInput] = useState(SAMPLE_TEMPLATES.Article);
  const [urlInput, setUrlInput] = useState('https://iqverse.net');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [results, setResults] = useState<ValidationResult[] | null>(null);

  const handleValidateCode = () => {
    setFetchError(null);
    if (!input.trim()) {
      setResults(null);
      return;
    }
    const res = validateSingleSchema(input);
    setResults([res]);
  };

  const handleValidateUrl = async () => {
    let target = urlInput.trim();
    if (!target) {
      setFetchError('Please enter a URL to analyze.');
      setResults(null);
      return;
    }

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }

    try {
      new URL(target);
    } catch {
      setFetchError('Invalid URL format. Please provide a valid web address.');
      setResults(null);
      return;
    }

    setLoading(true);
    setFetchError(null);
    setResults(null);

    let html = '';
    let errorMsg: string | null = null;

    try {
      const proxyUrl = `/api/check-url?url=${encodeURIComponent(target)}`;
      const res = await fetch(proxyUrl, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        html = json.html || json.body || '';
        if (!html && json.error) {
          errorMsg = json.error;
        }
      } else {
        errorMsg = `HTTP ${res.status}: ${res.statusText}`;
      }
    } catch (e: any) {
      errorMsg = e?.message || 'Network error fetching URL.';
    }

    // Direct fallback if proxy returned empty/error
    if (!html) {
      try {
        const directRes = await fetch(target, { cache: 'no-store' });
        if (directRes.ok) {
          html = await directRes.text();
          errorMsg = null;
        }
      } catch {
        // Retain original errorMsg
      }
    }

    setLoading(false);

    if (!html) {
      setFetchError(errorMsg || `Could not retrieve content from ${target}. Please verify the URL.`);
      return;
    }

    const extracted = extractSchemasFromHtml(html);
    if (extracted.length === 0) {
      setFetchError(`No JSON-LD structured data (<script type="application/ld+json">) found on ${target}.`);
      return;
    }

    const validatedList = extracted.map((snippet) => validateSingleSchema(snippet));
    setResults(validatedList);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'url') {
      void handleValidateUrl();
    } else {
      handleValidateCode();
    }
  };

  const loadTemplate = (key: string) => {
    if (SAMPLE_TEMPLATES[key]) {
      setInput(SAMPLE_TEMPLATES[key]);
      setResults(null);
      setFetchError(null);
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <form className={sharedStyles.card} onSubmit={handleSubmit}>
          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              className={`${sharedStyles.button} ${mode === 'code' ? sharedStyles.buttonPrimary : ''}`}
              onClick={() => {
                setMode('code');
                setFetchError(null);
              }}
              style={{ flex: 1 }}
            >
              JSON-LD Code Input
            </button>
            <button
              type="button"
              className={`${sharedStyles.button} ${mode === 'url' ? sharedStyles.buttonPrimary : ''}`}
              onClick={() => {
                setMode('url');
                setFetchError(null);
              }}
              style={{ flex: 1 }}
            >
              Fetch & Scan URL
            </button>
          </div>

          {mode === 'code' ? (
            <>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Load Sample:</span>
                {Object.keys(SAMPLE_TEMPLATES).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={sharedStyles.button}
                    onClick={() => loadTemplate(key)}
                    style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                  >
                    {key}
                  </button>
                ))}
              </div>

              <div className={sharedStyles.field}>
                <label className={sharedStyles.fieldLabel} htmlFor="schemaInput">
                  JSON-LD / Structured Data Input
                </label>
                <textarea
                  id="schemaInput"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className={sharedStyles.textarea}
                  rows={12}
                  placeholder='Paste JSON-LD object or <script type="application/ld+json"> tag here...'
                />
              </div>

              <button
                type="submit"
                className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
              >
                Validate Structured Data
              </button>
            </>
          ) : (
            <>
              <div className={sharedStyles.field}>
                <label className={sharedStyles.fieldLabel} htmlFor="schemaUrlInput">
                  Target Web Page URL
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    id="schemaUrlInput"
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className={sharedStyles.input}
                    placeholder="https://example.com"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="submit"
                    className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
                    disabled={loading}
                  >
                    {loading ? 'Fetching...' : 'Fetch & Validate URL'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Try:</span>
                {SAMPLE_URLS.map((sampleUrl) => (
                  <button
                    key={sampleUrl}
                    type="button"
                    className={sharedStyles.button}
                    onClick={() => {
                      setUrlInput(sampleUrl);
                      setFetchError(null);
                    }}
                    style={{ fontSize: '0.8rem', padding: '3px 8px' }}
                  >
                    {sampleUrl}
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={{ marginTop: 14 }}>
            <CapCaptcha />
          </div>
        </form>
      </section>

      {fetchError && (
        <section className={sharedStyles.section}>
          <div className={sharedStyles.card} style={{ border: '1px solid #ff4d4f', color: '#ff4d4f' }}>
            <strong>Unable to validate URL structured data</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text)' }}>{fetchError}</p>
          </div>
        </section>
      )}

      {results && results.length > 0 && (
        <section className={sharedStyles.section}>
          <div className={sharedStyles.card}>
            <div style={{ marginBottom: 12, fontWeight: 600, fontSize: '1rem' }}>
              {results.length === 1 ? 'Validation Result' : `Found ${results.length} Schema Markup Item(s)`}
            </div>

            {results.map((res, index) => (
              <div
                key={index}
                style={{
                  marginTop: index > 0 ? 16 : 0,
                  padding: 16,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${res.errors.length === 0 ? 'var(--border-color, #333)' : '#ff4d4f'}`,
                }}
              >
                <h4
                  style={{
                    margin: '0 0 12px 0',
                    color: res.errors.length === 0 ? '#4caf50' : '#ff4d4f',
                  }}
                >
                  {results.length > 1 ? `#${index + 1}: ` : ''}
                  {res.errors.length === 0 ? '✓ Valid Schema Markup Structure' : '✕ Validation Issues Found'}
                </h4>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12, fontSize: '0.9rem' }}>
                  <div>Syntax: <strong>{res.validJson ? 'Valid JSON' : 'Invalid JSON'}</strong></div>
                  {res.typeFound && <div>Schema Type: <strong>{res.typeFound}</strong></div>}
                  {res.contextFound && <div>Context: <strong>{res.contextFound}</strong></div>}
                </div>

                {res.detectedProperties.length > 0 && (
                  <div style={{ marginBottom: 12, fontSize: '0.85rem' }}>
                    <strong>Detected Properties ({res.detectedProperties.length}):</strong>{' '}
                    {res.detectedProperties.map((p) => (
                      <code key={p} style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: 4, marginRight: 4 }}>
                        {p}
                      </code>
                    ))}
                  </div>
                )}

                {res.rawSnippet && (
                  <div style={{ marginBottom: 12, fontSize: '0.85rem' }}>
                    <strong>Schema Snippet Preview:</strong>
                    <pre style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '8px 12px', borderRadius: 6, fontSize: '0.8rem', overflowX: 'auto', margin: '4px 0 0 0', fontFamily: 'monospace' }}>
                      {res.rawSnippet}
                    </pre>
                  </div>
                )}

                {res.errors.length > 0 && (
                  <div style={{ color: '#ff4d4f', marginBottom: 8 }}>
                    <strong>Errors:</strong>
                    <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                      {res.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {res.warnings.length > 0 && (
                  <div style={{ color: '#faad14' }}>
                    <strong>Warnings / Best Practice Recommendations:</strong>
                    <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                      {res.warnings.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

