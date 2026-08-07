import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import OgPreviewer from '@/components/tools/OgPreviewer';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('og-preview') || {
  title: 'Meta Tag & Open Graph Previewer | IQVerse',
  description: 'Preview social card appearance across Google, X/Twitter, Facebook and LinkedIn.',
};

export default function OgPreviewerPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="Meta Tag & Open Graph Previewer"
      subtitle="Social Card & SEO Meta Generator"
      description="Preview how your web page appears on Google Search, X/Twitter, Facebook and LinkedIn and generate copy-paste HTML meta tags."
    >
      <OgPreviewer />
    </ToolLayout>
  );
}
