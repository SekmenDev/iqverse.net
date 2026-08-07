import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import HttpStatusReference from '@/components/tools/HttpStatusReference';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('http-status') || {
  title: 'HTTP Status Code Reference | IQVerse',
  description: 'Searchable reference of HTTP status codes, standard headers and response scenarios.',
};

export default function HttpStatusReferencePage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="HTTP Status Code Reference"
      subtitle="Complete 1xx-5xx HTTP Status Directory"
      description="Interactive reference guide for 1xx, 2xx, 3xx, 4xx and 5xx HTTP response status codes with RFC definitions."
    >
      <HttpStatusReference />
    </ToolLayout>
  );
}
