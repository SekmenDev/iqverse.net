'use client';

import { useState, useMemo } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *' },
  { label: 'Every hour at :00', expr: '0 * * * *' },
  { label: 'Every day at midnight (00:00)', expr: '0 0 * * *' },
  { label: 'Every Monday at 09:00', expr: '0 9 * * 1' },
  { label: 'First day of every month at 00:00', expr: '0 0 1 * *' },
];

function translateCronField(val: string, fieldName: string): string {
  if (val === '*') return `every ${fieldName}`;
  if (val.startsWith('*/')) return `every ${val.slice(2)} ${fieldName}s`;
  return `${fieldName} ${val}`;
}

function getHumanDescription(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return 'Invalid cron format (must be 5 space-separated parts: minute hour day-of-month month day-of-week)';
  }

  const [min, hour, dom, mon, dow] = parts;

  let timeDesc = '';
  if (min === '*' && hour === '*') {
    timeDesc = 'Every minute';
  } else if (min.startsWith('*/') && hour === '*') {
    timeDesc = `Every ${min.slice(2)} minutes`;
  } else if (min === '0' && hour === '*') {
    timeDesc = 'At minute 0 of every hour';
  } else if (!isNaN(Number(min)) && !isNaN(Number(hour))) {
    const formattedHour = Number(hour).toString().padStart(2, '0');
    const formattedMin = Number(min).toString().padStart(2, '0');
    timeDesc = `At ${formattedHour}:${formattedMin}`;
  } else {
    timeDesc = `At ${translateCronField(min, 'minute')}, ${translateCronField(hour, 'hour')}`;
  }

  let dateDesc = '';
  if (dom === '*' && mon === '*' && dow === '*') {
    dateDesc = 'every day';
  } else {
    const details = [];
    if (dom !== '*') details.push(`on day ${dom} of the month`);
    if (mon !== '*') details.push(`in month ${mon}`);
    if (dow !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dNum = Number(dow);
      details.push(`on ${days[dNum] || `day-of-week ${dow}`}`);
    }
    dateDesc = details.join(', ');
  }

  return `${timeDesc}, ${dateDesc}`;
}

function calculateNextRuns(expr: string, count: number = 5): string[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minStr, hourStr] = parts;
  const runs: string[] = [];
  let current = new Date();

  let stepMinutes = 1;
  if (minStr.startsWith('*/')) {
    stepMinutes = parseInt(minStr.slice(2)) || 1;
  } else if (minStr !== '*' && !isNaN(Number(minStr))) {
    stepMinutes = 1;
  }

  for (let i = 0; i < count * 60 && runs.length < count; i++) {
    current = new Date(current.getTime() + stepMinutes * 60 * 1000);
    const m = current.getMinutes();
    const h = current.getHours();

    const minMatch = minStr === '*' || (minStr.startsWith('*/') && m % stepMinutes === 0) || Number(minStr) === m;
    const hourMatch = hourStr === '*' || (hourStr.startsWith('*/') && h % (parseInt(hourStr.slice(2)) || 1) === 0) || Number(hourStr) === h;

    if (minMatch && hourMatch) {
      runs.push(current.toLocaleString());
    }
  }

  return runs;
}

export default function CronBuilder() {
  const [cronExpr, setCronExpr] = useState('0 0 * * *');
  const [copied, setCopied] = useState(false);

  const humanText = useMemo(() => getHumanDescription(cronExpr), [cronExpr]);
  const nextRuns = useMemo(() => calculateNextRuns(cronExpr, 5), [cronExpr]);

  const parts = useMemo(() => {
    const split = cronExpr.trim().split(/\s+/);
    return {
      min: split[0] || '*',
      hour: split[1] || '*',
      dom: split[2] || '*',
      mon: split[3] || '*',
      dow: split[4] || '*',
    };
  }, [cronExpr]);

  const updatePart = (index: number, val: string) => {
    const split = cronExpr.trim().split(/\s+/);
    while (split.length < 5) split.push('*');
    split[index] = val || '*';
    setCronExpr(split.join(' '));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cronExpr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.expr}
                type="button"
                className={sharedStyles.button}
                onClick={() => setCronExpr(p.expr)}
                style={{ fontSize: '0.8rem', padding: '4px 10px' }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className={sharedStyles.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className={sharedStyles.fieldLabel} htmlFor="cronExprInput">
                Cron Expression (5-part standard)
              </label>
              <button type="button" className={sharedStyles.button} onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy Expression'}
              </button>
            </div>
            <input
              id="cronExprInput"
              type="text"
              value={cronExpr}
              onChange={(e) => setCronExpr(e.target.value)}
              className={sharedStyles.input}
              style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 'bold' }}
            />
          </div>

          {/* Visual Fields Builder */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12,
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>Minute (0-59)</label>
              <input
                type="text"
                value={parts.min}
                onChange={(e) => updatePart(0, e.target.value)}
                className={sharedStyles.input}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>Hour (0-23)</label>
              <input
                type="text"
                value={parts.hour}
                onChange={(e) => updatePart(1, e.target.value)}
                className={sharedStyles.input}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>Day of Month (1-31)</label>
              <input
                type="text"
                value={parts.dom}
                onChange={(e) => updatePart(2, e.target.value)}
                className={sharedStyles.input}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>Month (1-12)</label>
              <input
                type="text"
                value={parts.mon}
                onChange={(e) => updatePart(3, e.target.value)}
                className={sharedStyles.input}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>Day of Week (0-6)</label>
              <input
                type="text"
                value={parts.dow}
                onChange={(e) => updatePart(4, e.target.value)}
                className={sharedStyles.input}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>

          {/* Human Readable Explanation */}
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: 'rgba(33, 150, 243, 0.08)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 4 }}>Human-Readable Schedule:</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2196f3' }}>{humanText}</div>
          </div>

          {/* Next Execution Times */}
          {nextRuns.length > 0 && (
            <div>
              <h4 style={{ marginBottom: 12 }}>Next Scheduled Execution Times</h4>
              <div className={sharedStyles.outputArea} style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {nextRuns.map((time, idx) => (
                  <div key={idx} style={{ padding: '4px 0' }}>
                    {idx + 1}. {time}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
