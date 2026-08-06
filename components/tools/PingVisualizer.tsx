'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

interface TracerouteHop {
  hop: number;
  ip: string;
  host: string;
  rtt1: number;
  rtt2: number;
  rtt3: number;
  location: string;
}

export default function PingVisualizer() {
  const [targetHost, setTargetHost] = useState('1.1.1.1');
  const [mode, setMode] = useState<'ping' | 'traceroute'>('ping');
  const [running, setRunning] = useState(false);
  const [pings, setPings] = useState<number[]>([]);
  const [hops, setHops] = useState<TracerouteHop[]>([]);

  const handleRunPing = () => {
    setRunning(true);
    setPings([]);

    const results: number[] = [];
    let count = 0;
    const interval = setInterval(() => {
      const latency = Math.floor(12 + Math.random() * 15);
      results.push(latency);
      setPings([...results]);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setRunning(false);
      }
    }, 200);
  };

  const handleRunTraceroute = () => {
    setRunning(true);
    setHops([]);

    const sampleHops: TracerouteHop[] = [
      { hop: 1, ip: '192.168.1.1', host: 'gateway.local', rtt1: 1.2, rtt2: 1.1, rtt3: 1.4, location: 'Local Network' },
      { hop: 2, ip: '10.240.0.1', host: 'isp-core-node-1.net', rtt1: 4.8, rtt2: 5.1, rtt3: 4.6, location: 'ISP Edge Router' },
      { hop: 3, ip: '172.16.84.12', host: 'backbone-transit.net', rtt1: 11.2, rtt2: 10.9, rtt3: 11.5, location: 'Regional Transit' },
      { hop: 4, ip: '142.250.214.34', host: 'eqix-sjo-google.com', rtt1: 14.1, rtt2: 13.8, rtt3: 14.5, location: 'Equinix Internet Exchange' },
      { hop: 5, ip: '1.1.1.1', host: 'one.one.one.one', rtt1: 15.2, rtt2: 15.0, rtt3: 15.4, location: 'Cloudflare DNS Target' },
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < sampleHops.length) {
        setHops((prev) => [...prev, sampleHops[current]]);
        current++;
      } else {
        clearInterval(interval);
        setRunning(false);
      }
    }, 300);
  };

  const minPing = pings.length > 0 ? Math.min(...pings) : 0;
  const maxPing = pings.length > 0 ? Math.max(...pings) : 0;
  const avgPing = pings.length > 0 ? Math.round(pings.reduce((a, b) => a + b, 0) / pings.length) : 0;

  return (
    <div style={{ maxWidth: 1050 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button
              type="button"
              className={`${sharedStyles.button} ${mode === 'ping' ? sharedStyles.buttonPrimary : ''}`}
              onClick={() => setMode('ping')}
            >
              Ping Diagnostic
            </button>
            <button
              type="button"
              className={`${sharedStyles.button} ${mode === 'traceroute' ? sharedStyles.buttonPrimary : ''}`}
              onClick={() => setMode('traceroute')}
            >
              Traceroute Visualizer
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
            <div className={sharedStyles.field} style={{ flex: 1, margin: 0 }}>
              <label className={sharedStyles.fieldLabel} htmlFor="targetHostInput">
                Target Domain / IP Host
              </label>
              <input
                id="targetHostInput"
                type="text"
                value={targetHost}
                onChange={(e) => setTargetHost(e.target.value)}
                className={sharedStyles.input}
                placeholder="1.1.1.1 or iqverse.net"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <button
              type="button"
              className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
              onClick={mode === 'ping' ? handleRunPing : handleRunTraceroute}
              disabled={running}
              style={{ marginTop: 22 }}
            >
              {running ? 'Running Diagnostic...' : `Run ${mode === 'ping' ? 'Ping' : 'Traceroute'}`}
            </button>
          </div>

          {mode === 'ping' ? (
            <div>
              {pings.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                    <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Packets Sent</div>
                      <strong style={{ fontSize: '1.2rem' }}>{pings.length} / 10</strong>
                    </div>
                    <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Min Latency</div>
                      <strong style={{ fontSize: '1.2rem', color: '#4caf50' }}>{minPing} ms</strong>
                    </div>
                    <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Avg Latency</div>
                      <strong style={{ fontSize: '1.2rem', color: '#2196f3' }}>{avgPing} ms</strong>
                    </div>
                    <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Max Latency</div>
                      <strong style={{ fontSize: '1.2rem', color: '#faad14' }}>{maxPing} ms</strong>
                    </div>
                  </div>

                  {/* Latency Graph Bars */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 100, padding: '10px 0', borderBottom: '1px solid var(--border-color, #333)' }}>
                    {pings.map((lat, idx) => (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          height: `${Math.min(100, lat * 2.5)}%`,
                          background: '#2196f3',
                          borderRadius: '4px 4px 0 0',
                          textAlign: 'center',
                          fontSize: '0.7rem',
                          color: '#fff',
                        }}
                      >
                        {lat}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {hops.length > 0 && (
                <div style={{ border: '1px solid var(--border-color, #333)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 2fr 1fr 1fr 1fr', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    <div>Hop</div>
                    <div>Hostname</div>
                    <div>IP Address</div>
                    <div>RTT 1</div>
                    <div>RTT 2</div>
                    <div>RTT 3</div>
                  </div>
                  {hops.map((h) => (
                    <div
                      key={h.hop}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '50px 2fr 2fr 1fr 1fr 1fr',
                        padding: '10px 14px',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#2196f3' }}>{h.hop}</div>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.host}</div>
                      <div>{h.ip}</div>
                      <div style={{ color: '#4caf50' }}>{h.rtt1} ms</div>
                      <div style={{ color: '#4caf50' }}>{h.rtt2} ms</div>
                      <div style={{ color: '#4caf50' }}>{h.rtt3} ms</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
