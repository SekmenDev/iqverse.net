import type { Metadata } from 'next';
import CSSUnitsConverter from '@/components/tools/CSSUnitsConverter';
import ToolLayout from '@/components/layout/ToolLayout';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('cssunits') || {
  title: 'CSS Units Converter',
  description: 'Convert CSS units like px, rem, em, vw, vh and percentages in your browser.',
};

export default function CSSUnitsPage() {
  return (
    <ToolLayout
      pill="DESIGN TOOL"
      title="CSS Units"
      subtitle="Converter"
      description="Translate between common CSS units with a simple live converter that works entirely in your browser."
    >
      <CSSUnitsConverter />
    </ToolLayout>
  );
}
