import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import SslInspector from '@/components/tools/SslInspector';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('ssl-inspector') || {
  title: 'SSL / TLS Certificate Inspector | IQVerse',
  description: 'Inspect SSL/TLS certificate validity, issuer details, expiration and trust chain.',
};

export default function SslInspectorPage() {
  return (
    <ToolLayout
      pill="SECURITY"
      title="SSL / TLS Certificate Inspector"
      subtitle="HTTPS Certificate Expiry & Trust Inspector"
      description="Inspect SSL/TLS certificate details, expiration timelines, issuer authorities and SHA-256 fingerprints."
    >
      <SslInspector />
    </ToolLayout>
  );
}
