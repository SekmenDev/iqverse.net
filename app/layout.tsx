import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://iqverse.net'),
  title: {
    default: 'IQVerse | Free Open-Source Online Developer Tools & Utilities',
    template: '%s | IQVerse Tools',
  },
  description:
    'IQVerse offers free, open-source browser-based developer tools for AI agent scanning, QR generation, link checking, favicon creation, JSON validation, CSS conversion, image optimization, and more. All running locally in your browser with no login, no telemetry, and no cost.',
  keywords: [
    'developer tools',
    'dev tools',
    'web utilities',
    'open source apps',
    'AI agents scanner',
    'QR code generator',
    'link checker',
    'favicon generator',
    'JSON formatter',
    'regex tester',
    'CSS unit converter',
    'image optimizer',
    'browser-based tools',
    'free tools',
    'client-side',
    'no telemetry',
  ],
  authors: [{ name: 'Sekmen.Dev' }],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://iqverse.net/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://iqverse.net/',
    siteName: 'IQVerse',
    title: 'IQVerse | Free Open-Source Online Developer Tools & Utilities',
    description:
      'Explore IQVerse’s free, open-source browser tools for AI agent checks, QR codes, link scanning, favicon design, JSON formatting, regex testing, CSS conversion, and image optimization.',
    images: [
      {
        url: '/og-image-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'IQVerse home page preview showing open-source browser-based developer tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IQVerse | Free Open-Source Online Developer Tools & Utilities',
    description:
      'Free, open-source browser-based developer tools for AI agent scanning, QR codes, link checking, favicon generation, JSON processing, and more.',
    images: ['/og-image-1200x630.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', rel: 'icon' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.json',
  other: {
    'msapplication-TileColor': '#ffffff',
    'msapplication-TileImage': '/ms-icon-144x144.png',
    'theme-color': '#ffffff',
    language: 'English',
  },
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
