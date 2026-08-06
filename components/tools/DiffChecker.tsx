'use client';

import { useState, useMemo } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  leftLineNum?: number;
  rightLineNum?: number;
  content: string;
}

function computeDiff(leftText: string, rightText: string, ignoreWhitespace: boolean): DiffLine[] {
  const leftLines = leftText.split('\n');
  const rightLines = rightText.split('\n');
  const result: DiffLine[] = [];

  let i = 0;
  let j = 0;
  let leftNum = 1;
  let rightNum = 1;

  while (i < leftLines.length || j < rightLines.length) {
    const lStr = i < leftLines.length ? leftLines[i] : null;
    const rStr = j < rightLines.length ? rightLines[j] : null;

    const lNorm = lStr !== null ? (ignoreWhitespace ? lStr.trim() : lStr) : null;
    const rNorm = rStr !== null ? (ignoreWhitespace ? rStr.trim() : rStr) : null;

    if (lNorm === rNorm && lNorm !== null) {
      result.push({
        type: 'unchanged',
        leftLineNum: leftNum++,
        rightLineNum: rightNum++,
        content: lStr!,
      });
      i++;
      j++;
    } else {
      // Lookahead check to see if right line matches somewhere ahead in left
      const nextLInR = rNorm !== null ? leftLines.slice(i).findIndex((line) => (ignoreWhitespace ? line.trim() : line) === rNorm) : -1;
      const nextRInL = lNorm !== null ? rightLines.slice(j).findIndex((line) => (ignoreWhitespace ? line.trim() : line) === lNorm) : -1;

      if (nextLInR !== -1 && (nextRInL === -1 || nextLInR <= nextRInL)) {
        // Left has removed lines
        result.push({
          type: 'removed',
          leftLineNum: leftNum++,
          content: lStr!,
        });
        i++;
      } else if (nextRInL !== -1) {
        // Right has added lines
        result.push({
          type: 'added',
          rightLineNum: rightNum++,
          content: rStr!,
        });
        j++;
      } else {
        if (lStr !== null) {
          result.push({
            type: 'removed',
            leftLineNum: leftNum++,
            content: lStr,
          });
          i++;
        }
        if (rStr !== null) {
          result.push({
            type: 'added',
            rightLineNum: rightNum++,
            content: rStr,
          });
          j++;
        }
      }
    }
  }

  return result;
}

export default function DiffChecker() {
  const [leftText, setLeftText] = useState(`{\n  "name": "IQVerse",\n  "version": "1.0.0",\n  "status": "active"\n}`);
  const [rightText, setRightText] = useState(`{\n  "name": "IQVerse",\n  "version": "1.1.0",\n  "status": "active",\n  "tools": 32\n}`);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const diffLines = useMemo(() => computeDiff(leftText, rightText, ignoreWhitespace), [leftText, rightText, ignoreWhitespace]);

  const stats = useMemo(() => {
    const added = diffLines.filter((l) => l.type === 'added').length;
    const removed = diffLines.filter((l) => l.type === 'removed').length;
    return { added, removed };
  }, [diffLines]);

  return (
    <div style={{ maxWidth: 1100 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="leftText">
                Original Text (Left)
              </label>
              <textarea
                id="leftText"
                value={leftText}
                onChange={(e) => setLeftText(e.target.value)}
                className={sharedStyles.textarea}
                rows={8}
                placeholder="Paste original text here..."
              />
            </div>
            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="rightText">
                Modified Text (Right)
              </label>
              <textarea
                id="rightText"
                value={rightText}
                onChange={(e) => setRightText(e.target.value)}
                className={sharedStyles.textarea}
                rows={8}
                placeholder="Paste modified text here..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`${sharedStyles.button} ${viewMode === 'split' ? sharedStyles.buttonPrimary : ''}`}
                onClick={() => setViewMode('split')}
              >
                Split View
              </button>
              <button
                type="button"
                className={`${sharedStyles.button} ${viewMode === 'unified' ? sharedStyles.buttonPrimary : ''}`}
                onClick={() => setViewMode('unified')}
              >
                Unified View
              </button>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              />
              Ignore Whitespace
            </label>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: '0.9rem' }}>
              <span style={{ color: '#4caf50', fontWeight: 'bold' }}>+{stats.added} additions</span>
              <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>-{stats.removed} deletions</span>
            </div>
          </div>

          {/* Diff Result View */}
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              background: '#0d1117',
              border: '1px solid var(--border-color, #30363d)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {viewMode === 'unified' ? (
              <div style={{ overflowX: 'auto' }}>
                {diffLines.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 40px 20px 1fr',
                      padding: '2px 8px',
                      background:
                        line.type === 'added'
                          ? 'rgba(46, 160, 67, 0.15)'
                          : line.type === 'removed'
                          ? 'rgba(248, 81, 73, 0.15)'
                          : 'transparent',
                      color:
                        line.type === 'added'
                          ? '#7ee787'
                          : line.type === 'removed'
                          ? '#ff7b72'
                          : '#c9d1d9',
                    }}
                  >
                    <span style={{ opacity: 0.4, userSelect: 'none' }}>{line.leftLineNum || ''}</span>
                    <span style={{ opacity: 0.4, userSelect: 'none' }}>{line.rightLineNum || ''}</span>
                    <span style={{ opacity: 0.6, userSelect: 'none' }}>
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{line.content}</pre>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ borderRight: '1px solid #30363d', overflowX: 'auto' }}>
                  {diffLines
                    .filter((l) => l.type !== 'added')
                    .map((line, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '40px 1fr',
                          padding: '2px 8px',
                          background: line.type === 'removed' ? 'rgba(248, 81, 73, 0.15)' : 'transparent',
                          color: line.type === 'removed' ? '#ff7b72' : '#c9d1d9',
                        }}
                      >
                        <span style={{ opacity: 0.4, userSelect: 'none' }}>{line.leftLineNum || ''}</span>
                        <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{line.content}</pre>
                      </div>
                    ))}
                </div>

                <div style={{ overflowX: 'auto' }}>
                  {diffLines
                    .filter((l) => l.type !== 'removed')
                    .map((line, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '40px 1fr',
                          padding: '2px 8px',
                          background: line.type === 'added' ? 'rgba(46, 160, 67, 0.15)' : 'transparent',
                          color: line.type === 'added' ? '#7ee787' : '#c9d1d9',
                        }}
                      >
                        <span style={{ opacity: 0.4, userSelect: 'none' }}>{line.rightLineNum || ''}</span>
                        <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{line.content}</pre>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
