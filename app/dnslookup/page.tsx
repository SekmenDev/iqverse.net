import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import DNSLookup from '@/components/tools/DNSLookup';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata =
  getToolMetadata('dnslookup') || {
    title: 'DNS Lookup | IQVerse',
    description:
      'Professional DNS lookup tool. Query A, AAAA, MX, TXT, NS, CNAME, SOA, SRV records and more. No server. No tracking. Just fast, private DNS queries powered by Google Public DNS-over-HTTPS.',
  };

export default function DNSLookupPage() {
  return (
    <ToolLayout
      pill="NETWORKING · DEVOPS"
      title="DNS Lookup"
      subtitle="Query DNS Records for Any Domain"
      description="Professional DNS lookup tool. Query A, AAAA, MX, TXT, NS, CNAME, SOA, SRV records and more. Powered by Google Public DNS-over-HTTPS. No servers. No tracking."
    >
      <DNSLookup />
    </ToolLayout>
  );
}
