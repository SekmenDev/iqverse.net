import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import CssGradientBuilder from '@/components/tools/CssGradientBuilder';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('gradient-builder') || {
  title: 'CSS Gradient Builder | IQVerse',
  description: 'Visual linear, radial and conic CSS gradient generator with CSS code export.',
};

export default function CssGradientBuilderPage() {
  return (
    <ToolLayout
      pill="DESIGN"
      title="CSS Gradient Builder"
      subtitle="Visual Linear, Radial & Conic Gradient Generator"
      description="Create multi-stop linear, radial and conic CSS gradients with visual controls and instant CSS code export."
    >
      <CssGradientBuilder />
    </ToolLayout>
  );
}
