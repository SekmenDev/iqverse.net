import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import MarkdownPreviewer from '@/components/tools/MarkdownPreviewer';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('markdown-preview') || {
  title: 'Markdown Previewer | IQVerse',
  description: 'Live Markdown to HTML renderer with instant preview and file export.',
  alternates: {
    canonical: 'https://iqverse.net/markdown-preview/',
  },
};

export default function MarkdownPreviewerPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="Markdown Previewer"
      subtitle="Live Editor & HTML Exporter"
      description="Write Markdown with instant HTML rendering, word counts, reading time analysis and export options."
    >
      <MarkdownPreviewer />
    </ToolLayout>
  );
}
