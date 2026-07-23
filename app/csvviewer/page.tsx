import type { Metadata } from 'next';
import CSVViewer from '@/components/tools/CSVViewer';
import ToolLayout from '@/components/layout/ToolLayout';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('csvviewer') || {
  title: 'CSV Viewer & Converter',
  description: 'Preview CSV data and export it to JSON, Markdown or SQL.',
};

export default function CSVViewerPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOL"
      title="CSV"
      subtitle="Viewer & Converter"
      description="Inspect CSV data instantly and turn it into other common formats without leaving the browser."
    >
      <CSVViewer />
    </ToolLayout>
  );
}
