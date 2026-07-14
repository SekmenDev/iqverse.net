import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://iqverse.net'),
  title: {
    default: 'IQVerse | Free Open-Source Online Developer Tools & Utilities',
    template: '%s | IQVerse Tools',
  },
  description:
    'IQVerse: Free, open-source developer tools built in the browser. JSON formatter, QR code generator, regex tester, link checker, and more. All running 100% in your browser.',
  keywords: [
    'developer tools',
    'dev tools',
    'web utilities',
    'JSON formatter',
    'open source',
    'regex tester',
    'QR code generator',
    'link checker',
    'browser-based tools',
    'free tools',
    'client-side',
    'no telemetry',
  ],
  authors: [{ name: 'Sekmen.Dev' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://iqverse.net',
    siteName: 'IQVerse',
    images: [
      {
        url: '/og-image-1200x630.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image-1200x630.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body>
        {/* Background effects */}
        <div className="bg-grid"></div>
        <div className="bg-glow bg-glow--1"></div>
        <div className="bg-glow bg-glow--2"></div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10, 10, 10, 0.7)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="container" style={{ padding: '1rem 2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
          }}
        >
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/logo.png"
              alt="IQVerse logo"
              width={32}
              height={32}
              style={{ borderRadius: 'var(--radius-sm)' }}
            />
            <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1.1rem' }}>IQVerse</span>
          </a>
          <nav style={{ display: 'flex', gap: '1.5rem', marginLeft: 'auto' }}>
            <a
              href="https://github.com/SekmenDev/iqverse.net"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                transition: 'color 200ms ease',
              }}
            >
              Source Code
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        marginTop: '4rem',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
      }}
    >
      <p>
        Built with ❤️ by developers, for the developer community. MIT Licensed.{' '}
        <a href="https://sekmen.dev" target="_blank" rel="noopener noreferrer">
          Sekmen.Dev
        </a>
      </p>
    </footer>
  );
}
