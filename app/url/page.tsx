import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import URLTools from '@/components/tools/URLTools';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('url') || {
  title: 'URL Tools | Parse, Build, Encode, Decode',
  description: 'Parse URLs, build URLs from parts, edit query parameters and encode or decode URLs in your browser.',
};

export default function URLPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="URL Tools"
      subtitle="Parse, build, encode, decode"
      description="Inspect URL components, edit query parameters and convert URLs locally in your browser."
    >
      <URLTools />
    </ToolLayout>
  );
}
