'use client';

import { useState, ChangeEvent } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

interface HashesResult {
  sha1: string;
  sha256: string;
  sha512: string;
  fileName: string;
  fileSize: number;
}

export default function FileHashVerifier() {
  const [hashes, setHashes] = useState<HashesResult | null>(null);
  const [expectedHash, setExpectedHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setHashes(null);

    try {
      const buffer = await file.arrayBuffer();

      const [sha1Buffer, sha256Buffer, sha512Buffer] = await Promise.all([
        crypto.subtle.digest('SHA-1', buffer),
        crypto.subtle.digest('SHA-256', buffer),
        crypto.subtle.digest('SHA-512', buffer),
      ]);

      const bufferToHex = (buf: ArrayBuffer) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

      setHashes({
        sha1: bufferToHex(sha1Buffer),
        sha256: bufferToHex(sha256Buffer),
        sha512: bufferToHex(sha512Buffer),
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (err) {
      console.error('File hashing error:', err);
    } finally {
      setLoading(false);
    }
  };

  const matchStatus = (): { match: boolean; algorithm: string } | null => {
    if (!hashes || !expectedHash.trim()) return null;
    const cleanExpected = expectedHash.trim().toLowerCase();

    if (hashes.sha256.toLowerCase() === cleanExpected) return { match: true, algorithm: 'SHA-256' };
    if (hashes.sha512.toLowerCase() === cleanExpected) return { match: true, algorithm: 'SHA-512' };
    if (hashes.sha1.toLowerCase() === cleanExpected) return { match: true, algorithm: 'SHA-1' };

    return { match: false, algorithm: 'None' };
  };

  const match = matchStatus();

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.field}>
            <label className={sharedStyles.fieldLabel} htmlFor="fileInput">
              Select Local File (Processed 100% Client-Side)
            </label>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className={sharedStyles.input}
              style={{ cursor: 'pointer' }}
            />
          </div>

          {loading && <div style={{ marginTop: 12, opacity: 0.8 }}>Computing cryptographic hashes...</div>}

          {hashes && (
            <div style={{ marginTop: 24 }}>
              <div style={{ marginBottom: 16, fontSize: '0.9rem' }}>
                File: <strong>{hashes.fileName}</strong> ({Math.round(hashes.fileSize / 1024)} KB)
              </div>

              {/* Compare Hash Input */}
              <div className={sharedStyles.field} style={{ marginBottom: 20 }}>
                <label className={sharedStyles.fieldLabel} htmlFor="expHash">
                  Expected Checksum Hash (Verify Integrity)
                </label>
                <input
                  id="expHash"
                  type="text"
                  value={expectedHash}
                  onChange={(e) => setExpectedHash(e.target.value)}
                  className={sharedStyles.input}
                  placeholder="Paste SHA-256 or SHA-512 checksum string to verify..."
                  style={{ fontFamily: 'monospace' }}
                />

                {match && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 10,
                      borderRadius: 6,
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      background: match.match ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 77, 79, 0.2)',
                      color: match.match ? '#4caf50' : '#ff4d4f',
                    }}
                  >
                    {match.match
                      ? `✓ Match Verified! Checksum matches ${match.algorithm} hash.`
                      : '✕ Hash Mismatch! Checksum does not match file.'}
                  </div>
                )}
              </div>

              {/* Hashes List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: 4 }}>SHA-256 Checksum</div>
                  <code style={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', color: '#2196f3' }}>
                    {hashes.sha256}
                  </code>
                </div>

                <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: 4 }}>SHA-512 Checksum</div>
                  <code style={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    {hashes.sha512}
                  </code>
                </div>

                <div style={{ padding: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #333)' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: 4 }}>SHA-1 Checksum</div>
                  <code style={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    {hashes.sha1}
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
