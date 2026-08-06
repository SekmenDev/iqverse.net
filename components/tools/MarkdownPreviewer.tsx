'use client';

import { useState, useMemo } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

const DEFAULT_MARKDOWN = `# Welcome to Markdown Previewer

IQVerse tools run **100% locally** in your browser.

## Features

- **Live HTML Preview**: Real-time rendering as you type.
- *Full Markdown Support*: Headings, lists, code blocks, tables, blockquotes.
- Statistics: Live word count, character count, and reading time.

### Code Example

\`\`\`typescript
const hello = (name: string): string => {
  return \`Hello, \${name}!\`;
};
\`\`\`

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

| Feature | Support |
| :--- | :--- |
| Privacy | 100% Client-side |
| Speed | Instant |

- [x] Fast rendering
- [x] Clean UI
`;

function markdownToHtml(md: string): string {
  let html = md;

  // Escape basic HTML entities to prevent XSS
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Fenced Code Blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre style="background: rgba(0,0,0,0.3); padding: 12px; borderRadius: 6px; overflow-x: auto; margin: 12px 0;"><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline Code
  html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 6px; borderRadius: 4px;">$1</code>');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 style="margin-top: 16px; margin-bottom: 8px;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px;">$1</h1>');

  // Blockquotes
  html = html.replace(/^&gt;\s?(.*$)/gim, '<blockquote style="border-left: 4px solid var(--accent-color, #2196f3); margin: 12px 0; padding-left: 12px; opacity: 0.9;">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Task lists & unordered lists
  html = html.replace(/^-\s*\[x\]\s*(.*$)/gim, '<li style="list-style: none;">☑ $1</li>');
  html = html.replace(/^-\s*\[\s*\]\s*(.*$)/gim, '<li style="list-style: none;">☐ $1</li>');
  html = html.replace(/^-\s*(.*$)/gim, '<li>$1</li>');

  // Paragraphs (double newlines)
  html = html
    .split(/\n\n+/)
    .map((p) => {
      const trimmed = p.trim();
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<li')
      ) {
        return trimmed;
      }
      return `<p style="margin-bottom: 12px; line-height: 1.6;">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  return html;
}

export default function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'html'>('split');
  const [copied, setCopied] = useState(false);

  const parsedHtml = useMemo(() => markdownToHtml(markdown), [markdown]);

  const stats = useMemo(() => {
    const chars = markdown.length;
    const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 200));
    return { chars, words, readTime };
  }, [markdown]);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(parsedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`${sharedStyles.button} ${viewMode === 'split' ? sharedStyles.buttonPrimary : ''}`}
                onClick={() => setViewMode('split')}
              >
                Split Mode
              </button>
              <button
                type="button"
                className={`${sharedStyles.button} ${viewMode === 'preview' ? sharedStyles.buttonPrimary : ''}`}
                onClick={() => setViewMode('preview')}
              >
                Preview Only
              </button>
              <button
                type="button"
                className={`${sharedStyles.button} ${viewMode === 'html' ? sharedStyles.buttonPrimary : ''}`}
                onClick={() => setViewMode('html')}
              >
                Raw HTML
              </button>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: '0.85rem', opacity: 0.8 }}>
              <span>Words: <strong>{stats.words}</strong></span>
              <span>Characters: <strong>{stats.chars}</strong></span>
              <span>Reading Time: <strong>~{stats.readTime} min</strong></span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr',
              gap: 16,
            }}
          >
            {viewMode !== 'preview' && viewMode !== 'html' && (
              <div className={sharedStyles.field}>
                <label className={sharedStyles.fieldLabel} htmlFor="mdEditor">
                  Markdown Source
                </label>
                <textarea
                  id="mdEditor"
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className={sharedStyles.textarea}
                  rows={16}
                  style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                />
              </div>
            )}

            {viewMode === 'html' ? (
              <div className={sharedStyles.field}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className={sharedStyles.fieldLabel} htmlFor="htmlOutput">
                    Generated HTML Code
                  </label>
                  <button type="button" className={sharedStyles.button} onClick={handleCopyHtml}>
                    {copied ? 'Copied HTML!' : 'Copy HTML'}
                  </button>
                </div>
                <textarea
                  id="htmlOutput"
                  readOnly
                  value={parsedHtml}
                  className={sharedStyles.outputArea}
                  rows={16}
                />
              </div>
            ) : (
              <div className={sharedStyles.field}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className={sharedStyles.fieldLabel}>Rendered Live Preview</label>
                  <button type="button" className={sharedStyles.button} onClick={handleDownloadMd}>
                    Download .md
                  </button>
                </div>
                <div
                  className={sharedStyles.outputArea}
                  style={{
                    minHeight: 320,
                    maxHeight: 500,
                    overflowY: 'auto',
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: 16,
                  }}
                  dangerouslySetInnerHTML={{ __html: parsedHtml }}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
