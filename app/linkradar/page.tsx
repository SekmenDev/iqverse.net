import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import LinkRadar from '@/components/tools/LinkRadar';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('linkradar') || {
  title: 'Link Radar | Broken Link Scanner',
  description: 'Crawl a site from your browser and find broken links. Client-side scanner with optional crawling and asset checks.',
  alternates: {
    canonical: 'https://iqverse.net/linkradar/',
  },
};

export default function LinkRadarPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="LinkRadar"
      subtitle="Broken Link Scanner"
      description="Crawl a website from your browser to find broken links and asset issues. Runs entirely client-side (CORS may limit checks)."
    >
      <LinkRadar />
    </ToolLayout>
  );
}
