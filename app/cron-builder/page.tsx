import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import CronBuilder from '@/components/tools/CronBuilder';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('cron-builder') || {
  title: 'Cron Expression Builder | IQVerse',
  description: 'Visual cron schedule generator with human-readable explanations and next execution times.',
};

export default function CronBuilderPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="Cron Expression Builder"
      subtitle="Visual Cron Schedule Generator"
      description="Build and validate cron expressions visually with human-readable explanations and upcoming run times."
    >
      <CronBuilder />
    </ToolLayout>
  );
}
