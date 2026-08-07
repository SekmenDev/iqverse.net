import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import AiLogAnalyzer from '@/components/tools/AiLogAnalyzer';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('ai-log-analyzer') || {
  title: 'AI Crawler Log Analyzer | IQVerse',
  description: 'Parse server access logs locally to identify and analyze visits from GPTBot, ClaudeBot and PerplexityBot.',
};

export default function AiLogAnalyzerPage() {
  return (
    <ToolLayout
      pill="AI & AGENTS"
      title="AI Crawler Log Analyzer"
      subtitle="Server Access Log Parser"
      description="Parse access logs in your browser to track visits from GPTBot, ClaudeBot, PerplexityBot and other AI crawlers."
    >
      <AiLogAnalyzer />
    </ToolLayout>
  );
}
