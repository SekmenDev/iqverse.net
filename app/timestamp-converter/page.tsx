import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import TimestampConverter from '@/components/tools/TimestampConverter';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('timestamp-converter') || {
  title: 'Timestamp Converter | IQVerse',
  description: 'Convert Unix timestamps to ISO 8601 and human-readable dates with timezone support.',
};

export default function TimestampConverterPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="Timestamp Converter"
      subtitle="Unix Epoch & ISO Date Converter"
      description="Convert Unix timestamps (seconds & milliseconds) to ISO 8601, UTC and relative human time."
    >
      <TimestampConverter />
    </ToolLayout>
  );
}
