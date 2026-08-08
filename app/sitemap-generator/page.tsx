import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import SitemapGenerator from '@/components/tools/SitemapGenerator';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('sitemap-generator') || {
  title: 'Sitemap Generator | IQVerse',
  description: 'Crawl web pages or paths to build XML sitemaps ready for search engine indexing.',
  alternates: {
    canonical: 'https://iqverse.net/sitemap-generator/',
  },
};

export default function SitemapGeneratorPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="Sitemap Generator"
      subtitle="XML Sitemap Builder"
      description="Build XML sitemaps with custom URL priorities, change frequencies and bulk URL importer."
    >
      <SitemapGenerator />
    </ToolLayout>
  );
}
