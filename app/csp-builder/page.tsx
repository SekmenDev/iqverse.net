import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import CspBuilder from '@/components/tools/CspBuilder';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('csp-builder') || {
  title: 'CSP Header Builder | IQVerse',
  description: 'Interactive Content-Security-Policy generator and security directive validator.',
};

export default function CspBuilderPage() {
  return (
    <ToolLayout
      pill="SECURITY"
      title="CSP Header Builder"
      subtitle="Content-Security-Policy Generator & Analyzer"
      description="Build and validate Content-Security-Policy (CSP) headers and meta tags to protect against XSS and data injection."
    >
      <CspBuilder />
    </ToolLayout>
  );
}
