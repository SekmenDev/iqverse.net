import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://iqverse.net'),
  title: {
    default: 'IQVerse | Free Open-Source Online Developer Tools & Utilities',
    template: '%s | IQVerse Tools',
  },
  description:
    'IQVerse: Free, open-source developer tools built in the browser. JSON formatter, QR code generator, regex tester, link checker and more. All running 100% in your browser.',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0C0E14" />
      </head>
      <body>
        {children}

        <footer className="pageFooter">
            <span className="footerNote">
                Made with ❤️ by <a href="https://sekmen.dev" target="_blank">Sekmen.Dev</a> and published on <a href="https://github.com/SekmenDev/iqverse.net" target="_blank">Github</a>
            </span>
            <span className="footerNote">
                Open source. MIT License. No servers. No tracking. No cost.
            </span>
        </footer>
      </body>
    </html>
  );
}
