import type { Metadata } from 'next';
import ImageOptimizer from '@/components/tools/ImageOptimizer';
import ToolLayout from '@/components/layout/ToolLayout';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('imageoptimizer') || {
  title: 'Image Optimizer',
  description: 'Compress images locally in your browser and download a lighter preview.',
  alternates: {
    canonical: 'https://iqverse.net/imageoptimizer/',
  },
};

export default function ImageOptimizerPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOL"
      title="Image"
      subtitle="Optimizer"
      description="Reduce an image’s file size locally with a browser-based preview export."
    >
      <ImageOptimizer />
    </ToolLayout>
  );
}
