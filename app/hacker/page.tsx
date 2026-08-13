import type { Metadata } from 'next';
import TerminalClient from './TerminalClient';
import styles from './hacker.module.css';

export const metadata: Metadata = {
  title: '403 Access Denied • Intrusion Detected | Sekmen.Dev Security',
  description: 'Unauthorized access probe detected. Intrusion detection active. Request logged and audited by Sekmen.Dev Security.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://iqverse.net/hacker/',
  },
  openGraph: {
    title: '403 Access Denied • Security Check | Sekmen.Dev',
    description: 'Unauthorized WordPress or admin probe detected. Access denied.',
    url: 'https://iqverse.net/hacker/',
  },
};

export default function HackerSecurityPage() {
  return (
    <main className={styles.pageShell}>
      {/* CRT Display Overlay Effects */}
      <div className={styles.crtScanline} aria-hidden="true" />
      <div className={styles.crtVignette} aria-hidden="true" />

      {/* Accessible Heading for Screen Readers */}
      <h1 className="sr-only">403 Access Denied • Intrusion Detected • Sekmen.Dev Security</h1>

      {/* Interactive CRT Security Terminal */}
      <TerminalClient />

      <footer className={styles.footerNote}>
        © Sekmen.Dev Security Operations • Session Logged &amp; Audited •{' '}
        <a href="https://sekmen.dev/" target="_blank" rel="noopener noreferrer">
          Sekmen.Dev
        </a>
      </footer>
    </main>
  );
}
