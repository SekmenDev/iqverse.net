import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import LlmstxtGenerator from '@/components/tools/LlmstxtGenerator';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('llmstxt') || {
  title: 'llms.txt Generator & Validator | IQVerse',
  description: 'Create and validate llms.txt standard files for AI crawler site summaries.',
  alternates: {
    canonical: 'https://iqverse.net/llmstxt/',
  },
};

export default function LlmstxtPage() {
  return (
    <ToolLayout
      pill="AI & AGENTS"
      title="llms.txt Generator & Validator"
      subtitle="AI Crawler Site Summary Builder"
      description="Create and validate standard llms.txt files to help LLMs and AI agents index your site."
    >
      <LlmstxtGenerator />
    </ToolLayout>
  );
}
