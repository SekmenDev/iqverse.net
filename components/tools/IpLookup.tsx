'use client';

import { useState, useEffect } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

interface IpDetails {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  isp: string;
  asn: string;
  lat: number;
  lon: number;
  timezone: string;
  postal: string;
}

export default function IpLookup() {
  const [queryIp, setQueryIp] = useState('8.8.8.8');
  const [loading, setLoading] = useState(false);
  const [ipData, setIpData] = useState<IpDetails | null>({
    ip: '8.8.8.8',
    country: 'United States',
    countryCode: 'US',
    region: 'California',
    city: 'Mountain View',
    isp: 'Google LLC',
    asn: 'AS15169 Google LLC',
    lat: 37.4056,
    lon: -122.0775,
    timezone: 'America/Los_Angeles',
    postal: '94043',
  });

  const fetchIpData = async (targetIp?: string) => {
    setLoading(true);
    const url = targetIp ? `https://ipapi.co/${targetIp}/json/` : 'https://ipapi.co/json/';

    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setIpData({
          ip: json.ip || targetIp || '8.8.8.8',
          country: json.country_name || 'Unknown',
          countryCode: json.country_code || 'US',
          region: json.region || 'Unknown',
          city: json.city || 'Unknown',
          isp: json.org || json.asn || 'Google LLC',
          asn: json.asn || 'AS15169',
          lat: json.latitude || 37.4056,
          lon: json.longitude || -122.0775,
          timezone: json.timezone || 'UTC',
          postal: json.postal || '94043',
        });
      }
    } catch (err) {
      console.warn('IP lookup fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = () => {
    if (queryIp.trim()) {
      fetchIpData(queryIp.trim());
    }
  };

  const handleMyIp = () => {
    setQueryIp('');
    fetchIpData();
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div className={sharedStyles.field} style={{ flex: 1, margin: 0 }}>
              <label className={sharedStyles.fieldLabel} htmlFor="ipSearchInput">
                Enter IPv4 or IPv6 Address
              </label>
              <input
                id="ipSearchInput"
                type="text"
                value={queryIp}
                onChange={(e) => setQueryIp(e.target.value)}
                className={sharedStyles.input}
                placeholder="e.g., 8.8.8.8 or 2001:4860:4860::8888"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <button
              type="button"
              className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
              onClick={handleLookup}
              style={{ marginTop: 22 }}
            >
              Lookup IP
            </button>
            <button
              type="button"
              className={sharedStyles.button}
              onClick={handleMyIp}
              style={{ marginTop: 22 }}
            >
              My Current IP
            </button>
          </div>

          {loading && <div style={{ opacity: 0.8, marginTop: 12 }}>Fetching IP geolocation metadata...</div>}

          {ipData && (
            <div
              style={{
                marginTop: 20,
                padding: 20,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color, #333)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Query Address</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#2196f3' }}>
                    {ipData.ip}
                  </div>
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: '0.85rem',
                    background: 'rgba(33, 150, 243, 0.1)',
                    color: '#2196f3',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                  }}
                >
                  {ipData.countryCode} - {ipData.country}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: '0.9rem' }}>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>City / Region</div>
                  <strong>{ipData.city}, {ipData.region}</strong>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>ISP / Provider</div>
                  <strong>{ipData.isp}</strong>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Autonomous System (ASN)</div>
                  <strong style={{ fontFamily: 'monospace' }}>{ipData.asn}</strong>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Coordinates (Lat, Lon)</div>
                  <strong style={{ fontFamily: 'monospace' }}>{ipData.lat}, {ipData.lon}</strong>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Timezone</div>
                  <strong>{ipData.timezone}</strong>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Postal Code</div>
                  <strong>{ipData.postal}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
