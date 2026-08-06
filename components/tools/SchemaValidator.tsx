'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

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

interface ValidationResult {
  validJson: boolean;
  typeFound: string | null;
  contextFound: string | null;
  errors: string[];
  warnings: string[];
  detectedProperties: string[];
}

export default function SchemaValidator() {
  const [input, setInput] = useState(SAMPLE_TEMPLATES.Article);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleValidate = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let parsed: Record<string, unknown> | null = null;
    let typeFound: string | null = null;
    let contextFound: string | null = null;
    let detectedProperties: string[] = [];

    // Extract JSON if wrapped in <script type="application/ld+json">
    let cleanInput = input.trim();
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
      setResult({
        validJson: false,
        typeFound: null,
        contextFound: null,
        errors,
        warnings,
        detectedProperties: [],
      });
      return;
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      errors.push('Schema object must be a valid JSON object.');
      setResult({
        validJson: true,
        typeFound: null,
        contextFound: null,
        errors,
        warnings,
        detectedProperties: [],
      });
      return;
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
    if (typeFound === 'Article') {
      if (!parsed.headline) warnings.push('Article schema recommended property "headline" is missing.');
      if (!parsed.image) warnings.push('Article schema recommended property "image" is missing.');
      if (!parsed.author) warnings.push('Article schema recommended property "author" is missing.');
      if (!parsed.datePublished) warnings.push('Article schema recommended property "datePublished" is missing.');
    } else if (typeFound === 'Product') {
      if (!parsed.name) warnings.push('Product schema recommended property "name" is missing.');
      if (!parsed.offers) warnings.push('Product schema recommended property "offers" is missing.');
    } else if (typeFound === 'Organization') {
      if (!parsed.name) warnings.push('Organization schema recommended property "name" is missing.');
      if (!parsed.url) warnings.push('Organization schema recommended property "url" is missing.');
    }

    setResult({
      validJson: true,
      typeFound,
      contextFound,
      errors,
      warnings,
      detectedProperties,
    });
  };

  const loadTemplate = (key: string) => {
    if (SAMPLE_TEMPLATES[key]) {
      setInput(SAMPLE_TEMPLATES[key]);
      setResult(null);
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
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
            type="button"
            className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
            onClick={handleValidate}
          >
            Validate Structured Data
          </button>

          {result && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${result.errors.length === 0 ? 'var(--border-color, #333)' : '#ff4d4f'}`,
              }}
            >
              <h4
                style={{
                  margin: '0 0 12px 0',
                  color: result.errors.length === 0 ? '#4caf50' : '#ff4d4f',
                }}
              >
                {result.errors.length === 0 ? '✓ Valid Schema Markup Structure' : '✕ Validation Issues Found'}
              </h4>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12, fontSize: '0.9rem' }}>
                <div>Syntax: <strong>{result.validJson ? 'Valid JSON' : 'Invalid JSON'}</strong></div>
                {result.typeFound && <div>Schema Type: <strong>{result.typeFound}</strong></div>}
                {result.contextFound && <div>Context: <strong>{result.contextFound}</strong></div>}
              </div>

              {result.detectedProperties.length > 0 && (
                <div style={{ marginBottom: 12, fontSize: '0.85rem' }}>
                  <strong>Detected Properties ({result.detectedProperties.length}):</strong>{' '}
                  {result.detectedProperties.map((p) => (
                    <code key={p} style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: 4, marginRight: 4 }}>
                      {p}
                    </code>
                  ))}
                </div>
              )}

              {result.errors.length > 0 && (
                <div style={{ color: '#ff4d4f', marginBottom: 8 }}>
                  <strong>Errors:</strong>
                  <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.warnings.length > 0 && (
                <div style={{ color: '#faad14' }}>
                  <strong>Warnings / Best Practice Recommendations:</strong>
                  <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                    {result.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
