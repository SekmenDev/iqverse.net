import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import SvgOptimizer from '@/components/tools/SvgOptimizer';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('svg-optimizer') || {
  title: 'SVG Optimizer | IQVerse',
  description: 'Minify and clean inline SVG markup by stripping redundant metadata and attributes.',
  alternates: {
    canonical: 'https://iqverse.net/svg-optimizer/',
  },
};

export default function SvgOptimizerPage() {
  return (
    <ToolLayout
      pill="DESIGN"
      title="SVG Optimizer"
      subtitle="Vector SVG Cleaner & Minifier"
      description="Clean, minify and strip unused comments and metadata from inline SVG markup to reduce payload size."
    >
      <SvgOptimizer />
    </ToolLayout>
  );
}
