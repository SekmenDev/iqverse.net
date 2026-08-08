import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import PortReferenceGuide from '@/components/tools/PortReferenceGuide';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('port-reference') || {
  title: 'Port Status & Reference Guide | IQVerse',
  description: 'Common TCP/UDP port reference guide with service definitions and reachability status checks.',
  alternates: {
    canonical: 'https://iqverse.net/port-reference/',
  },
};

export default function PortReferenceGuidePage() {
  return (
    <ToolLayout
      pill="NETWORK"
      title="Port Status & Reference Guide"
      subtitle="TCP & UDP Networking Port Database"
      description="Searchable reference guide of standard TCP/UDP ports, service protocol definitions and security recommendations."
    >
      <PortReferenceGuide />
    </ToolLayout>
  );
}
