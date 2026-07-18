import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import Chromata from '@/components/tools/Chromata';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('chromata') || {
  title: 'Chromata | Color Palette Generator',
  description: 'Generate harmonious color palettes and export them as CSS, Tailwind, JSON and more.',
};

export default function ChromataPage() {
  return (
    <ToolLayout
      pill="DESIGN"
      title="Chromata"
      subtitle="Color Palette Generator"
      description="Build color harmony palettes, adjust contrast, simulate color blindness and export your theme for CSS, Tailwind, Figma, JSON or Swift."
    >
      <Chromata />
    </ToolLayout>
  );
}
