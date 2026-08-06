import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import SpriteGenerator from '@/components/tools/SpriteGenerator';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('sprite-generator') || {
  title: 'Icon & Sprite Sheet Generator | IQVerse',
  description: 'Combine multiple icons into a single sprite sheet with CSS and JSON coordinates.',
};

export default function SpriteGeneratorPage() {
  return (
    <ToolLayout
      pill="DESIGN"
      title="Icon & Sprite Sheet Generator"
      subtitle="CSS Sprite Sheet Builder & Mapper"
      description="Merge multiple SVG/PNG icons into a single optimized sprite sheet image with auto-generated CSS background positions."
    >
      <SpriteGenerator />
    </ToolLayout>
  );
}
