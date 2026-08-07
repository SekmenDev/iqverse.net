import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import DataConverter from '@/components/tools/DataConverter';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('dataconverter') || {
  title: 'Data Converter | JSON, CSV, Hex, Base64',
  description: 'Convert data between JSON, CSV, Hex and Base64 formats locally in your browser.',
  alternates: {
    canonical: 'https://iqverse.net/dataconverter/',
  },
};

export default function DataConverterPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="Data Converter"
      subtitle="JSON, CSV, Hex, Base64"
      description="Convert data across common text formats locally in your browser."
    >
      <DataConverter />
    </ToolLayout>
  );
}
