import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import HomeClient from '@/components/HomeClient';
import { getToolsCollectionJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'IQVerse | Free Open-Source Online Developer Tools & Utilities',
  description:
    'IQVerse offers free, open-source browser-based developer tools for AI agent scanning, QR generation, link checking, favicon creation, JSON validation, CSS conversion, image optimization and more. All running locally in your browser with no login, no telemetry and no cost.',
  alternates: {
    canonical: 'https://iqverse.net/',
  },
};

export default function Home() {
  return (
    <>
      <JsonLd data={getToolsCollectionJsonLd()} />
      <HomeClient />
    </>
  );
}
