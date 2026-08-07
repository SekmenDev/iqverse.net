import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import WhoisRdapLookup from '@/components/tools/WhoisRdapLookup';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('whois-lookup') || {
  title: 'WHOIS & RDAP Lookup | IQVerse',
  description: 'Query domain registration metadata, registrar details and expiration timelines via RDAP.',
};

export default function WhoisRdapLookupPage() {
  return (
    <ToolLayout
      pill="NETWORK"
      title="WHOIS & RDAP Lookup"
      subtitle="Domain Registration & Registrar Lookup"
      description="Query domain registration metadata, registrar organization, creation/expiration dates and name server delegation via RDAP."
    >
      <WhoisRdapLookup />
    </ToolLayout>
  );
}
