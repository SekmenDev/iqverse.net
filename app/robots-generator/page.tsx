import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import RobotsGenerator from '@/components/tools/RobotsGenerator';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('robots-generator') || {
  title: 'robots.txt Generator & Validator | IQVerse',
  description: 'Build and test robots.txt directives for web crawlers and AI search bots.',
};

export default function RobotsGeneratorPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="robots.txt Generator & Validator"
      subtitle="Web Crawler Directive Builder"
      description="Create, customize and validate robots.txt files for search engine crawlers and AI bots with path testing."
    >
      <RobotsGenerator />
    </ToolLayout>
  );
}
