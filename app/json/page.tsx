import type { Metadata } from 'next';
import JSONFormatter from '@/components/tools/JSONFormatter';
import ToolLayout from '@/components/layout/ToolLayout';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('json') || {
  title: 'JSON Formatter & Validator',
  description: 'Format and validate your JSON data with ease.',
};

export default function JSONFormatterPage() {
  return (
    <ToolLayout
      pill="JSON TOOLS"
      title="JSON"
      subtitle="Formatter & Validator"
      description="Validate, format, minify and transform your JSON data. No servers, no tracking, all in your browser."
    >
      <JSONFormatter />
    </ToolLayout>
  );
}
