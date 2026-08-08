import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import CorsTester from '@/components/tools/CorsTester';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('cors-tester') || {
  title: 'CORS Tester | IQVerse',
  description: 'Test CORS configuration and header response rules for API endpoints.',
  alternates: {
    canonical: 'https://iqverse.net/cors-tester/',
  },
};

export default function CorsTesterPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="CORS Tester"
      subtitle="Cross-Origin Resource Sharing Inspector"
      description="Inspect preflight OPTIONS and cross-origin fetch response headers for API endpoints."
    >
      <CorsTester />
    </ToolLayout>
  );
}
