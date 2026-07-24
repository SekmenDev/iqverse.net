'use client';

import { useMemo, useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

function parseCSV(text: string) {
  const rows = text.split(/\r?\n/).filter((row) => row.trim().length > 0);
  if (rows.length === 0) return [];

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.split(',').map((value) => value.trim());

  return dataRows.map((row) => {
    const values = row.split(',').map((value) => value.trim());
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] ?? '';
      return acc;
    }, {});
  });
}

export default function CSVViewer() {
  const [csvInput, setCsvInput] = useState('name,age,city\nAda,36,London\nLinus,54,New York');
  const [output, setOutput] = useState('');

  const rows = useMemo(() => parseCSV(csvInput), [csvInput]);

  const exportJson = () => {
    setOutput(JSON.stringify(rows, null, 2));
  };

  const exportMarkdown = () => {
    if (rows.length === 0) {
      setOutput('');
      return;
    }

    const headers = Object.keys(rows[0]);
    const lines = [
      `| ${headers.join(' | ')} |`,
      `| ${headers.map(() => '---').join(' | ')} |`,
      ...rows.map((row) => `| ${headers.map((header) => row[header]).join(' | ')} |`),
    ];
    setOutput(lines.join('\n'));
  };

  const exportSql = () => {
    if (rows.length === 0) {
      setOutput('');
      return;
    }

    const headers = Object.keys(rows[0]);
    const inserts = rows.map((row) => {
      const values = headers.map((header) => {
        const escaped = String(row[header]).split("'").join("''");
        return `'${escaped}'`;
      }).join(', ');
      return `INSERT INTO table_name (${headers.join(', ')}) VALUES (${values});`;
    });
    setOutput(inserts.join('\n'));
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>CSV Input</div>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="csvInput">Paste CSV</label>
            <textarea
              id="csvInput"
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              className={sharedStyles.textarea}
            />
          </div>

          <div className={sharedStyles.buttonGroup}>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={exportJson}>Export JSON</button>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={exportMarkdown}>Export Markdown</button>
            <button type="button" className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={exportSql}>Export SQL</button>
          </div>
        </div>
      </section>

      <section className={sharedStyles.section}>
        <div className={sharedStyles.sectionLabel}>Preview</div>
        <div className={sharedStyles.card}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {rows[0] && Object.keys(rows[0]).map((header) => (
                    <th key={header} style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${Object.values(row).join('-')}-${index}`}>
                    {Object.keys(row).map((header) => (
                      <td key={header} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {output && (
        <section className={sharedStyles.section}>
          <div className={sharedStyles.sectionLabel}>Export</div>
          <div className={sharedStyles.card}>
            <textarea readOnly value={output} className={sharedStyles.outputArea} rows={8} />
          </div>
        </section>
      )}
    </div>
  );
}
