'use client';

import { useState, useEffect, useMemo } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

export default function TimestampConverter() {
  const [nowSec, setNowSec] = useState(Math.floor(Date.now() / 1000));
  const [timestampInput, setTimestampInput] = useState(Math.floor(Date.now() / 1000).toString());
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 16));

  useEffect(() => {
    const timer = setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const parsedFromTimestamp = useMemo(() => {
    const num = Number(timestampInput.trim());
    if (isNaN(num) || timestampInput.trim() === '') return null;

    // Detect seconds vs milliseconds (ms > 30000000000)
    const isMs = num > 30000000000;
    const dateObj = new Date(isMs ? num : num * 1000);

    if (isNaN(dateObj.getTime())) return null;

    return {
      iso: dateObj.toISOString(),
      utc: dateObj.toUTCString(),
      local: dateObj.toString(),
      relative: getRelativeTimeString(dateObj),
      isMs,
    };
  }, [timestampInput]);

  const parsedFromDate = useMemo(() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;

    return {
      sec: Math.floor(d.getTime() / 1000),
      ms: d.getTime(),
      iso: d.toISOString(),
    };
  }, [dateInput]);

  function getRelativeTimeString(date: Date): string {
    const deltaSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (Math.abs(deltaSec) < 60) return `${deltaSec >= 0 ? deltaSec : -deltaSec} seconds ${deltaSec >= 0 ? 'ago' : 'from now'}`;
    const min = Math.floor(Math.abs(deltaSec) / 60);
    if (min < 60) return `${min} minutes ${deltaSec >= 0 ? 'ago' : 'from now'}`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hours ${deltaSec >= 0 ? 'ago' : 'from now'}`;
    const days = Math.floor(hr / 24);
    return `${days} days ${deltaSec >= 0 ? 'ago' : 'from now'}`;
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        {/* Live Clock Card */}
        <div className={sharedStyles.card} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Current Unix Epoch Time</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2196f3', fontFamily: 'monospace' }}>
                {nowSec} <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>seconds</span>
              </div>
            </div>
            <button
              type="button"
              className={sharedStyles.button}
              onClick={() => setTimestampInput(nowSec.toString())}
            >
              Use Current Time
            </button>
          </div>
        </div>

        <div className={sharedStyles.card}>
          {/* Timestamp to Date */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Unix Timestamp → Date & Time</h3>
            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="tsInput">
                Enter Timestamp (Seconds or Milliseconds)
              </label>
              <input
                id="tsInput"
                type="text"
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                className={sharedStyles.input}
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            {parsedFromTimestamp ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 16 }}>
                <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>ISO 8601</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{parsedFromTimestamp.iso}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>UTC Time</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{parsedFromTimestamp.utc}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Relative Time</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4caf50' }}>{parsedFromTimestamp.relative}</div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#ff4d4f', fontSize: '0.875rem', marginTop: 8 }}>Invalid numeric timestamp.</div>
            )}
          </div>

          {/* Date to Timestamp */}
          <div style={{ paddingTop: 20, borderTop: '1px solid var(--border-color, #333)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Human Date → Unix Timestamp</h3>
            <div className={sharedStyles.field}>
              <label className={sharedStyles.fieldLabel} htmlFor="dtInput">
                Select Date & Time
              </label>
              <input
                id="dtInput"
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className={sharedStyles.input}
              />
            </div>

            {parsedFromDate && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 16 }}>
                <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Epoch Seconds</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#2196f3' }}>
                    {parsedFromDate.sec}
                  </div>
                </div>
                <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Epoch Milliseconds</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {parsedFromDate.ms}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
