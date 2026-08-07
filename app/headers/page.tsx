import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import HeaderScan from '@/components/tools/HeaderScan';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('headers') || {
  title: 'HeaderScan | HTTP Security Headers Analyzer',
  description: 'Inspect response headers for security, performance and privacy best practices.',
  alternates: {
    canonical: 'https://iqverse.net/headers/',
  },
};

export default function HeadersPage() {
  return (
    <ToolLayout
      pill="SECURITY TOOLS"
      title="HeaderScan"
      subtitle="HTTP Header Analyzer"
      description="Audit response headers for security posture, caching quality and privacy concerns without leaving your browser."
    >
      <HeaderScan />
    </ToolLayout>
  );
}
