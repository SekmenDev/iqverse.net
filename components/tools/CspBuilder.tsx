'use client';

import { useState, useMemo } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

interface DirectiveState {
  self: boolean;
  unsafeInline: boolean;
  unsafeEval: boolean;
  https: boolean;
  data: boolean;
  custom: string;
}

const INITIAL_DIRECTIVES: Record<string, DirectiveState> = {
  'default-src': { self: true, unsafeInline: false, unsafeEval: false, https: false, data: false, custom: '' },
  'script-src': { self: true, unsafeInline: false, unsafeEval: false, https: false, data: false, custom: 'https://cdn.jsdelivr.net' },
  'style-src': { self: true, unsafeInline: true, unsafeEval: false, https: false, data: false, custom: 'https://fonts.googleapis.com' },
  'img-src': { self: true, unsafeInline: false, unsafeEval: false, https: true, data: true, custom: '' },
  'connect-src': { self: true, unsafeInline: false, unsafeEval: false, https: true, data: false, custom: 'https://api.iqverse.net' },
  'font-src': { self: true, unsafeInline: false, unsafeEval: false, https: false, data: true, custom: 'https://fonts.gstatic.com' },
  'object-src': { self: false, unsafeInline: false, unsafeEval: false, https: false, data: false, custom: "'none'" },
  'base-uri': { self: true, unsafeInline: false, unsafeEval: false, https: false, data: false, custom: '' },
  'form-action': { self: true, unsafeInline: false, unsafeEval: false, https: false, data: false, custom: '' },
};

export default function CspBuilder() {
  const [directives, setDirectives] = useState(INITIAL_DIRECTIVES);
  const [upgradeInsecure, setUpgradeInsecure] = useState(true);
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [copiedMeta, setCopiedMeta] = useState(false);

  const toggleDirectiveFlag = (name: string, field: keyof Omit<DirectiveState, 'custom'>) => {
    setDirectives((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: !prev[name][field],
      },
    }));
  };

  const updateCustom = (name: string, val: string) => {
    setDirectives((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        custom: val,
      },
    }));
  };

  const generatedCsp = useMemo(() => {
    const parts: string[] = [];

    if (upgradeInsecure) {
      parts.push('upgrade-insecure-requests');
    }

    Object.entries(directives).forEach(([name, state]) => {
      const tokens: string[] = [];
      if (state.self) tokens.push("'self'");
      if (state.unsafeInline) tokens.push("'unsafe-inline'");
      if (state.unsafeEval) tokens.push("'unsafe-eval'");
      if (state.https) tokens.push('https:');
      if (state.data) tokens.push('data:');
      if (state.custom.trim()) tokens.push(state.custom.trim());

      if (tokens.length > 0) {
        parts.push(`${name} ${tokens.join(' ')}`);
      }
    });

    return parts.join('; ');
  }, [directives, upgradeInsecure]);

  const securityWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (directives['script-src']?.unsafeInline) {
      warnings.push("⚠️ 'unsafe-inline' in script-src allows inline scripts (increases vulnerability to XSS attacks).");
    }
    if (directives['script-src']?.unsafeEval) {
      warnings.push("⚠️ 'unsafe-eval' in script-src permits eval() execution.");
    }
    if (directives['object-src']?.custom !== "'none'") {
      warnings.push("💡 Recommended: Set object-src to 'none' to block legacy Flash/Java plugins.");
    }
    return warnings;
  }, [directives]);

  const metaTagSnippet = `<meta http-equiv="Content-Security-Policy" content="${generatedCsp}">`;

  const handleCopyHeader = () => {
    navigator.clipboard.writeText(generatedCsp);
    setCopiedHeader(true);
    setTimeout(() => setCopiedHeader(false), 2000);
  };

  const handleCopyMeta = () => {
    navigator.clipboard.writeText(metaTagSnippet);
    setCopiedMeta(true);
    setTimeout(() => setCopiedMeta(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={upgradeInsecure}
                onChange={(e) => setUpgradeInsecure(e.target.checked)}
              />
              <strong>Include `upgrade-insecure-requests` directive</strong>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 24 }}>
            {Object.entries(directives).map(([name, state]) => (
              <div
                key={name}
                style={{
                  padding: 12,
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color, #333)',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#2196f3', fontFamily: 'monospace' }}>
                  {name}
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8, fontSize: '0.8rem' }}>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={state.self}
                      onChange={() => toggleDirectiveFlag(name, 'self')}
                    />{' '}
                    'self'
                  </label>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={state.unsafeInline}
                      onChange={() => toggleDirectiveFlag(name, 'unsafeInline')}
                    />{' '}
                    'unsafe-inline'
                  </label>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={state.https}
                      onChange={() => toggleDirectiveFlag(name, 'https')}
                    />{' '}
                    https:
                  </label>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={state.data}
                      onChange={() => toggleDirectiveFlag(name, 'data')}
                    />{' '}
                    data:
                  </label>
                </div>

                <input
                  type="text"
                  value={state.custom}
                  onChange={(e) => updateCustom(name, e.target.value)}
                  className={sharedStyles.input}
                  placeholder="Custom domains or 'none'"
                  style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
                />
              </div>
            ))}
          </div>

          {securityWarnings.length > 0 && (
            <div style={{ marginBottom: 20, padding: 12, borderRadius: 6, background: 'rgba(250, 173, 20, 0.1)', border: '1px solid rgba(250, 173, 20, 0.3)', color: '#faad14', fontSize: '0.85rem' }}>
              <strong>Policy Security Analysis:</strong>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {securityWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Generated Header Output */}
          <div className={sharedStyles.field} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className={sharedStyles.fieldLabel} htmlFor="cspHeaderOut">
                Content-Security-Policy Header Value
              </label>
              <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={handleCopyHeader}>
                {copiedHeader ? 'Copied Header!' : 'Copy Policy Header'}
              </button>
            </div>
            <textarea
              id="cspHeaderOut"
              readOnly
              value={generatedCsp}
              className={sharedStyles.outputArea}
              rows={4}
              style={{ fontFamily: 'monospace' }}
            />
          </div>

          {/* HTML Meta Tag */}
          <div className={sharedStyles.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className={sharedStyles.fieldLabel} htmlFor="cspMetaOut">
                HTML &lt;meta&gt; Tag Snippet
              </label>
              <button type="button" className={sharedStyles.button} onClick={handleCopyMeta}>
                {copiedMeta ? 'Copied Meta Tag!' : 'Copy Meta Tag'}
              </button>
            </div>
            <textarea
              id="cspMetaOut"
              readOnly
              value={metaTagSnippet}
              className={sharedStyles.outputArea}
              rows={3}
              style={{ fontFamily: 'monospace' }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
