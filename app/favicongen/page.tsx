import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import FaviconGenerator from '@/components/tools/FaviconGenerator';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('favicongen') || {
  title: 'Favicon Generator | IQVerse',
  description: 'Generate favicons and meta tags for your site in seconds, all in your browser.',
  alternates: {
    canonical: 'https://iqverse.net/favicongen/',
  },
};

export default function FaviconGeneratorPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="Favicon Generator"
      subtitle="Meta & Icon Generator"
      description="Drop your logo, fill in the site details and get production-ready head HTML with favicons."
    >
      <FaviconGenerator />
    </ToolLayout>
  );
}
