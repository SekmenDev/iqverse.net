'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

interface LinkItem {
  title: string;
  url: string;
  desc: string;
}

interface Section {
  title: string;
  links: LinkItem[];
}

export default function LlmstxtGenerator() {
  const [activeTab, setActiveTab] = useState<'generate' | 'validate'>('generate');

  // Generator state
  const [siteTitle, setSiteTitle] = useState('IQVerse Tools');
  const [summary, setSummary] = useState('Free open-source developer and AI agent tools operating entirely client-side.');
  const [details, setDetails] = useState('IQVerse provides fast, secure, browser-native tools for web developers, AI agent engineers and security researchers.');
  const [sections, setSections] = useState<Section[]>([
    {
      title: 'Core Tools',
      links: [
        { title: 'AI Agents Scanner', url: 'https://iqverse.net/agentscan/', desc: 'Check website AI agent readiness including robots.txt, sitemaps and MCP' },
        { title: 'Favicon Generator', url: 'https://iqverse.net/favicongen/', desc: 'Generate multi-resolution web favicons and manifest.json' },
      ],
    },
    {
      title: 'Optional Resources',
      links: [
        { title: 'Full Documentation', url: 'https://iqverse.net/llms-full.txt', desc: 'Comprehensive documentation index for LLMs and AI agents' },
      ],
    },
  ]);

  // Validator state
  const [valInput, setValInput] = useState('');
  const [valResults, setValResults] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    linksCount: number;
    hasH1: boolean;
    hasSummary: boolean;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const addSection = () => {
    setSections([...sections, { title: 'New Section', links: [{ title: '', url: '', desc: '' }] }]);
  };

  const removeSection = (idx: number) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  const updateSectionTitle = (idx: number, title: string) => {
    const updated = [...sections];
    updated[idx].title = title;
    setSections(updated);
  };

  const addLink = (secIdx: number) => {
    const updated = [...sections];
    updated[secIdx].links.push({ title: '', url: '', desc: '' });
    setSections(updated);
  };

  const removeLink = (secIdx: number, linkIdx: number) => {
    const updated = [...sections];
    updated[secIdx].links = updated[secIdx].links.filter((_, i) => i !== linkIdx);
    setSections(updated);
  };

  const updateLink = (secIdx: number, linkIdx: number, field: keyof LinkItem, val: string) => {
    const updated = [...sections];
    updated[secIdx].links[linkIdx][field] = val;
    setSections(updated);
  };

  const generateMarkdown = (): string => {
    let md = `# ${siteTitle.trim()}\n\n`;
    if (summary.trim()) {
      md += `> ${summary.trim()}\n\n`;
    }
    if (details.trim()) {
      md += `${details.trim()}\n\n`;
    }

    sections.forEach((sec) => {
      if (sec.title.trim()) {
        md += `## ${sec.title.trim()}\n\n`;
      }
      sec.links.forEach((l) => {
        if (l.title.trim() && l.url.trim()) {
          md += `- [${l.title.trim()}](${l.url.trim()})${l.desc.trim() ? `: ${l.desc.trim()}` : ''}\n`;
        }
      });
      md += '\n';
    });

    return md.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateMarkdown()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'llms.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const runValidation = () => {
    const lines = valInput.split('\n');
    const errors: string[] = [];
    const warnings: string[] = [];
    let hasH1 = false;
    let hasSummary = false;
    let linksCount = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ') && !hasH1) {
        hasH1 = true;
      }
      if (trimmed.startsWith('> ')) {
        hasSummary = true;
      }
      if (trimmed.startsWith('- [')) {
        linksCount++;
        const linkMatch = trimmed.match(/^-\s*\[(.*?)\]\((.*?)\)(?::\s*(.*))?$/);
        if (!linkMatch) {
          warnings.push(`Line ${index + 1}: Link format doesn't match standard '- [Title](URL): Description'`);
        } else {
          const [, title, url] = linkMatch;
          if (!title) errors.push(`Line ${index + 1}: Missing link title`);
          if (!url) errors.push(`Line ${index + 1}: Missing link URL`);
        }
      }
    });

    if (!hasH1) {
      errors.push('Missing main project title header (# H1)');
    }
    if (!hasSummary) {
      warnings.push('Recommended summary blockquote (> Summary) is missing');
    }
    if (linksCount === 0) {
      warnings.push('No links found in document');
    }

    setValResults({
      valid: errors.length === 0,
      errors,
      warnings,
      linksCount,
      hasH1,
      hasSummary,
    });
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button
            type="button"
            className={`${sharedStyles.button} ${activeTab === 'generate' ? sharedStyles.buttonPrimary : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            Generator
          </button>
          <button
            type="button"
            className={`${sharedStyles.button} ${activeTab === 'validate' ? sharedStyles.buttonPrimary : ''}`}
            onClick={() => setActiveTab('validate')}
          >
            Validator
          </button>
        </div>

        {activeTab === 'generate' ? (
          <div className={sharedStyles.card}>
            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="siteTitle">
                Project / Site Title (# H1)
              </label>
              <input
                id="siteTitle"
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className={sharedStyles.input}
                placeholder="e.g. IQVerse"
              />
            </div>

            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="summary">
                Short Summary (&gt; Blockquote)
              </label>
              <input
                id="summary"
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className={sharedStyles.input}
                placeholder="Brief summary for AI crawlers"
              />
            </div>

            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="details">
                Detailed Description
              </label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className={sharedStyles.textarea}
                rows={3}
              />
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sections & Links</h3>
                <button type="button" className={sharedStyles.button} onClick={addSection}>
                  + Add Section
                </button>
              </div>

              {sections.map((sec, secIdx) => (
                <div
                  key={secIdx}
                  style={{
                    border: '1px solid var(--border-color, #333)',
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 16,
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => updateSectionTitle(secIdx, e.target.value)}
                      className={sharedStyles.input}
                      placeholder="Section Title (e.g. Core Docs)"
                      style={{ fontWeight: 'bold' }}
                    />
                    <button
                      type="button"
                      className={sharedStyles.button}
                      onClick={() => removeSection(secIdx)}
                      style={{ color: '#ff6b6b' }}
                    >
                      Delete Section
                    </button>
                  </div>

                  {sec.links.map((link, linkIdx) => (
                    <div
                      key={linkIdx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1.5fr 2fr auto',
                        gap: 8,
                        marginBottom: 8,
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Link Title"
                        value={link.title}
                        onChange={(e) => updateLink(secIdx, linkIdx, 'title', e.target.value)}
                        className={sharedStyles.input}
                      />
                      <input
                        type="text"
                        placeholder="URL (https://...)"
                        value={link.url}
                        onChange={(e) => updateLink(secIdx, linkIdx, 'url', e.target.value)}
                        className={sharedStyles.input}
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={link.desc}
                        onChange={(e) => updateLink(secIdx, linkIdx, 'desc', e.target.value)}
                        className={sharedStyles.input}
                      />
                      <button
                        type="button"
                        className={sharedStyles.button}
                        onClick={() => removeLink(secIdx, linkIdx)}
                        style={{ padding: '6px 10px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className={sharedStyles.button}
                    onClick={() => addLink(secIdx)}
                    style={{ marginTop: 8, fontSize: '0.85rem' }}
                  >
                    + Add Link
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }} className={sharedStyles.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className={sharedStyles.fieldLabel} htmlFor="generatedOutput">
                  Generated llms.txt Output
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className={sharedStyles.button} onClick={handleCopy}>
                    {copied ? 'Copied!' : 'Copy llms.txt'}
                  </button>
                  <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={handleDownload}>
                    Download File
                  </button>
                </div>
              </div>
              <textarea
                id="generatedOutput"
                readOnly
                value={generateMarkdown()}
                className={sharedStyles.outputArea}
                rows={12}
              />
            </div>
          </div>
        ) : (
          <div className={sharedStyles.card}>
            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="valInput">
                Paste llms.txt Content to Validate
              </label>
              <textarea
                id="valInput"
                value={valInput}
                onChange={(e) => setValInput(e.target.value)}
                className={sharedStyles.textarea}
                rows={10}
                placeholder="# Title&#10;&#10;> Brief summary for AI crawlers&#10;&#10;## Section&#10;&#10;- [Doc Link](https://example.com/doc): Detailed description"
              />
            </div>

            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={runValidation}>
              Validate Format
            </button>

            {valResults && (
              <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color, #333)' }}>
                <h4 style={{ margin: '0 0 12px 0', color: valResults.valid ? '#4caf50' : '#ff4d4f' }}>
                  {valResults.valid ? '✓ Valid llms.txt Standard Format' : '✕ Format Issues Found'}
                </h4>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: '0.9rem' }}>
                  <div>Links Found: <strong>{valResults.linksCount}</strong></div>
                  <div>H1 Title: <strong>{valResults.hasH1 ? 'Yes' : 'No'}</strong></div>
                  <div>Summary Block: <strong>{valResults.hasSummary ? 'Yes' : 'No'}</strong></div>
                </div>

                {valResults.errors.length > 0 && (
                  <div style={{ color: '#ff4d4f', marginBottom: 8 }}>
                    <strong>Errors:</strong>
                    <ul>
                      {valResults.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {valResults.warnings.length > 0 && (
                  <div style={{ color: '#faad14' }}>
                    <strong>Warnings / Suggestions:</strong>
                    <ul>
                      {valResults.warnings.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
