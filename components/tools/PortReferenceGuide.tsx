'use client';

import { useState, useMemo } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

interface PortEntry {
  port: number;
  protocol: 'TCP' | 'UDP' | 'TCP/UDP';
  name: string;
  category: 'Web' | 'Database' | 'Remote Access' | 'Email' | 'Infrastructure';
  desc: string;
  securityNote: string;
}

const COMMON_PORTS: PortEntry[] = [
  { port: 21, protocol: 'TCP', name: 'FTP', category: 'Remote Access', desc: 'File Transfer Protocol for transferring files between host and client.', securityNote: 'Insecure plaintext transmission. Prefer SFTP (SSH port 22).' },
  { port: 22, protocol: 'TCP', name: 'SSH / SFTP', category: 'Remote Access', desc: 'Secure Shell for encrypted remote command line shell sessions and SFTP file transfers.', securityNote: 'Use key-based authentication and disable root login.' },
  { port: 25, protocol: 'TCP', name: 'SMTP', category: 'Email', desc: 'Simple Mail Transfer Protocol for mail server-to-server routing.', securityNote: 'Often blocked by ISPs to prevent spam relays.' },
  { port: 53, protocol: 'TCP/UDP', name: 'DNS', category: 'Infrastructure', desc: 'Domain Name System for resolving hostname to IP addresses.', securityNote: 'Ensure DNS amplification DDoS protections are enabled.' },
  { port: 80, protocol: 'TCP', name: 'HTTP', category: 'Web', desc: 'Hypertext Transfer Protocol for unencrypted web page delivery.', securityNote: 'Redirect all HTTP traffic to HTTPS (port 443).' },
  { port: 110, protocol: 'TCP', name: 'POP3', category: 'Email', desc: 'Post Office Protocol for retrieving email from mail servers.', securityNote: 'Prefer POP3S (port 995 with SSL/TLS encryption).' },
  { port: 143, protocol: 'TCP', name: 'IMAP', category: 'Email', desc: 'Internet Message Access Protocol for syncing mailbox folders across devices.', securityNote: 'Prefer IMAPS (port 993 with SSL/TLS encryption).' },
  { port: 443, protocol: 'TCP', name: 'HTTPS', category: 'Web', desc: 'Hypertext Transfer Protocol Secure (TLS/SSL encrypted web traffic).', securityNote: 'Standard secure port for modern web traffic.' },
  { port: 465, protocol: 'TCP', name: 'SMTPS', category: 'Email', desc: 'SMTP over SSL/TLS for secure mail submission.', securityNote: 'Recommended secure SMTP port alongside 587.' },
  { port: 1433, protocol: 'TCP', name: 'MS SQL Server', category: 'Database', desc: 'Microsoft SQL Server database engine listener.', securityNote: 'Do not expose directly to public internet; restrict via firewall/VPC.' },
  { port: 3306, protocol: 'TCP', name: 'MySQL / MariaDB', category: 'Database', desc: 'MySQL and MariaDB relational database server listener.', securityNote: 'Bind to 127.0.0.1 or internal private subnet.' },
  { port: 3389, protocol: 'TCP/UDP', name: 'RDP', category: 'Remote Access', desc: 'Remote Desktop Protocol for graphical Windows Desktop administration.', securityNote: 'High target for brute-force ransomware attacks. Require VPN or Bastion.' },
  { port: 5432, protocol: 'TCP', name: 'PostgreSQL', category: 'Database', desc: 'PostgreSQL object-relational database server listener.', securityNote: 'Configure pg_hba.conf for strict IP restriction.' },
  { port: 6379, protocol: 'TCP', name: 'Redis', category: 'Database', desc: 'In-memory key-value data store and cache.', securityNote: 'Default installation lacks password authentication. Never expose to public internet.' },
  { port: 8080, protocol: 'TCP', name: 'HTTP Alternate / Proxy', category: 'Web', desc: 'Common alternate port for web dev servers (Vite, Next.js) and proxy servers.', securityNote: 'Check dev server configuration before deploying to production.' },
  { port: 27017, protocol: 'TCP', name: 'MongoDB', category: 'Database', desc: 'MongoDB NoSQL database engine default instance.', securityNote: 'Enable MongoDB authentication and TLS.' },
];

export default function PortReferenceGuide() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredPorts = useMemo(() => {
    return COMMON_PORTS.filter((entry) => {
      const matchesSearch =
        entry.port.toString().includes(search.trim()) ||
        entry.name.toLowerCase().includes(search.toLowerCase()) ||
        entry.desc.toLowerCase().includes(search.toLowerCase());

      const matchesCat = selectedCategory === 'All' || entry.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory]);

  return (
    <div style={{ maxWidth: 1100 }}>
      <section className={sharedStyles.section}>
        <div className={sharedStyles.card}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <div className={sharedStyles.field} style={{ flex: 1, margin: 0 }}>
              <label className={sharedStyles.fieldLabel} htmlFor="portSearch">
                Search Port Number or Service Name
              </label>
              <input
                id="portSearch"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={sharedStyles.input}
                placeholder="e.g., 3306, SSH, MySQL, HTTPS..."
              />
            </div>

            <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
              <label htmlFor="catFilter">Category:</label>
              <select
                id="catFilter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ marginLeft: 8 }}
              >
                <option value="All">All Categories</option>
                <option value="Web">Web</option>
                <option value="Database">Database</option>
                <option value="Remote Access">Remote Access</option>
                <option value="Email">Email</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredPorts.map((entry) => (
              <div
                key={entry.port}
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color, #333)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        fontSize: '1.1rem',
                        background: 'rgba(33, 150, 243, 0.1)',
                        color: '#2196f3',
                        border: '1px solid rgba(33, 150, 243, 0.3)',
                      }}
                    >
                      Port {entry.port} / {entry.protocol}
                    </span>
                    <strong style={{ fontSize: '1.1rem' }}>{entry.name}</strong>
                  </div>

                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: 12,
                      fontSize: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#aaa',
                    }}
                  >
                    {entry.category}
                  </span>
                </div>

                <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', opacity: 0.9 }}>{entry.desc}</p>

                <div style={{ fontSize: '0.825rem', color: '#faad14', background: 'rgba(250, 173, 20, 0.08)', padding: '6px 10px', borderRadius: 4, border: '1px solid rgba(250, 173, 20, 0.2)' }}>
                  <strong>🔒 Security Note:</strong> {entry.securityNote}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
