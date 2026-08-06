import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import DiffChecker from '@/components/tools/DiffChecker';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('diff-checker') || {
  title: 'Diff Checker | IQVerse',
  description: 'Side-by-side text, JSON and code diff viewer with live change highlighting.',
};

export default function DiffCheckerPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="Diff Checker"
      subtitle="Text & Code Comparison Tool"
      description="Compare two text files, JSON snippets, or code blocks with side-by-side or unified line-by-line diff highlighting."
    >
      <DiffChecker />
    </ToolLayout>
  );
}
