export interface PortReferenceItem {
  port: number;
  protocol: 'TCP' | 'UDP' | 'TCP/UDP';
  name: string;
  service?: string;
  category: 'Web' | 'Database' | 'Remote Access' | 'Email' | 'Infrastructure' | string;
  desc: string;
  securityNote: string;
}

export const COMMON_PORTS: PortReferenceItem[] = [
  { port: 20, protocol: 'TCP', name: 'FTP Data', service: 'FTP Data', category: 'Remote Access', desc: 'File Transfer Protocol data transfer channel.', securityNote: 'Plaintext data channel.' },
  { port: 21, protocol: 'TCP', name: 'FTP', service: 'FTP', category: 'Remote Access', desc: 'File Transfer Protocol control channel.', securityNote: 'Insecure plaintext transmission. Prefer SFTP (SSH port 22).' },
  { port: 22, protocol: 'TCP', name: 'SSH / SFTP', service: 'SSH', category: 'Remote Access', desc: 'Secure Shell for encrypted remote command line shell sessions and SFTP file transfers.', securityNote: 'Use key-based authentication and disable root login.' },
  { port: 23, protocol: 'TCP', name: 'Telnet', service: 'Telnet', category: 'Remote Access', desc: 'Unencrypted text communications protocol.', securityNote: 'Deprecated and insecure. Never use in production.' },
  { port: 25, protocol: 'TCP', name: 'SMTP', service: 'SMTP', category: 'Email', desc: 'Simple Mail Transfer Protocol for mail server-to-server routing.', securityNote: 'Often blocked by ISPs to prevent spam relays.' },
  { port: 53, protocol: 'TCP/UDP', name: 'DNS', service: 'DNS', category: 'Infrastructure', desc: 'Domain Name System for resolving hostname to IP addresses.', securityNote: 'Ensure DNS amplification DDoS protections are enabled.' },
  { port: 67, protocol: 'UDP', name: 'DHCP Server', service: 'DHCP', category: 'Infrastructure', desc: 'Dynamic Host Configuration Protocol server broadcast listener.', securityNote: 'Ensure rogue DHCP detection on switched networks.' },
  { port: 68, protocol: 'UDP', name: 'DHCP Client', service: 'DHCP', category: 'Infrastructure', desc: 'Dynamic Host Configuration Protocol client endpoint.', securityNote: 'Local network broadcast.' },
  { port: 80, protocol: 'TCP', name: 'HTTP', service: 'HTTP', category: 'Web', desc: 'Hypertext Transfer Protocol for unencrypted web page delivery.', securityNote: 'Redirect all HTTP traffic to HTTPS (port 443).' },
  { port: 110, protocol: 'TCP', name: 'POP3', service: 'POP3', category: 'Email', desc: 'Post Office Protocol for retrieving email from mail servers.', securityNote: 'Prefer POP3S (port 995 with SSL/TLS encryption).' },
  { port: 123, protocol: 'UDP', name: 'NTP', service: 'NTP', category: 'Infrastructure', desc: 'Network Time Protocol for clock synchronization over packet-switched networks.', securityNote: 'Disable monlist command to prevent amplification attacks.' },
  { port: 143, protocol: 'TCP', name: 'IMAP', service: 'IMAP', category: 'Email', desc: 'Internet Message Access Protocol for syncing mailbox folders across devices.', securityNote: 'Prefer IMAPS (port 993 with SSL/TLS encryption).' },
  { port: 161, protocol: 'UDP', name: 'SNMP', service: 'SNMP', category: 'Infrastructure', desc: 'Simple Network Management Protocol for monitoring network devices.', securityNote: 'Avoid SNMPv1/v2 default community strings. Use SNMPv3 with encryption.' },
  { port: 389, protocol: 'TCP/UDP', name: 'LDAP', service: 'LDAP', category: 'Infrastructure', desc: 'Lightweight Directory Access Protocol for directory lookup.', securityNote: 'Prefer LDAPS (port 636) to encrypt authentication credentials.' },
  { port: 443, protocol: 'TCP', name: 'HTTPS', service: 'HTTPS', category: 'Web', desc: 'Hypertext Transfer Protocol Secure (TLS/SSL encrypted web traffic).', securityNote: 'Standard secure port for modern web traffic.' },
  { port: 465, protocol: 'TCP', name: 'SMTPS', service: 'SMTPS', category: 'Email', desc: 'SMTP over SSL/TLS for secure mail submission.', securityNote: 'Recommended secure SMTP port alongside 587.' },
  { port: 587, protocol: 'TCP', name: 'SMTP Submission', service: 'SMTP', category: 'Email', desc: 'Standard encrypted email client-to-server submission.', securityNote: 'Requires STARTTLS authentication.' },
  { port: 993, protocol: 'TCP', name: 'IMAPS', service: 'IMAPS', category: 'Email', desc: 'IMAP over SSL/TLS.', securityNote: 'Encrypted email folder synchronization.' },
  { port: 995, protocol: 'TCP', name: 'POP3S', service: 'POP3S', category: 'Email', desc: 'POP3 over SSL/TLS.', securityNote: 'Encrypted mailbox retrieval.' },
  { port: 1433, protocol: 'TCP', name: 'MS SQL Server', service: 'MSSQL', category: 'Database', desc: 'Microsoft SQL Server database engine listener.', securityNote: 'Do not expose directly to public internet; restrict via firewall/VPC.' },
  { port: 3306, protocol: 'TCP', name: 'MySQL / MariaDB', service: 'MySQL', category: 'Database', desc: 'MySQL and MariaDB relational database server listener.', securityNote: 'Bind to 127.0.0.1 or internal private subnet.' },
  { port: 3389, protocol: 'TCP/UDP', name: 'RDP', service: 'RDP', category: 'Remote Access', desc: 'Remote Desktop Protocol for graphical Windows Desktop administration.', securityNote: 'High target for brute-force ransomware attacks. Require VPN or Bastion.' },
  { port: 5432, protocol: 'TCP', name: 'PostgreSQL', service: 'PostgreSQL', category: 'Database', desc: 'PostgreSQL object-relational database server listener.', securityNote: 'Configure pg_hba.conf for strict IP restriction.' },
  { port: 6379, protocol: 'TCP', name: 'Redis', service: 'Redis', category: 'Database', desc: 'In-memory key-value data store and cache.', securityNote: 'Default installation lacks password authentication. Never expose to public internet.' },
  { port: 8080, protocol: 'TCP', name: 'HTTP Alternate / Proxy', service: 'HTTP-Alt', category: 'Web', desc: 'Common alternate port for web dev servers (Vite, Next.js) and proxy servers.', securityNote: 'Check dev server configuration before deploying to production.' },
  { port: 27017, protocol: 'TCP', name: 'MongoDB', service: 'MongoDB', category: 'Database', desc: 'MongoDB NoSQL database engine default instance.', securityNote: 'Enable MongoDB authentication and TLS.' },
];

export function filterPorts(
  arg1?: PortReferenceItem[] | string,
  arg2?: string,
  arg3?: string
): PortReferenceItem[] {
  let ports = COMMON_PORTS;
  let category = 'All';
  let query = '';

  if (Array.isArray(arg1)) {
    ports = arg1;
    category = arg2 || 'All';
    query = arg3 || '';
  } else {
    category = arg1 || 'All';
    query = arg2 || '';
  }

  const lq = query.toLowerCase().trim();

  return ports.filter((entry) => {
    const matchesSearch =
      !lq ||
      entry.port.toString().includes(lq) ||
      entry.name.toLowerCase().includes(lq) ||
      (entry.service && entry.service.toLowerCase().includes(lq)) ||
      entry.desc.toLowerCase().includes(lq);

    const matchesCat =
      category.toLowerCase() === 'all' ||
      entry.category.toLowerCase() === category.toLowerCase() ||
      entry.protocol.toLowerCase().includes(category.toLowerCase());

    return matchesSearch && matchesCat;
  });
}
