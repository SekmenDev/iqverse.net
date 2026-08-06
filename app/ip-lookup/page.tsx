import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import IpLookup from '@/components/tools/IpLookup';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('ip-lookup') || {
  title: 'IP Info & Geolocation Lookup | IQVerse',
  description: 'Inspect IP address geolocation, ASN, ISP details and network routing information.',
};

export default function IpLookupPage() {
  return (
    <ToolLayout
      pill="NETWORK"
      title="IP Info & Geolocation Lookup"
      subtitle="Public IP Address & Geolocation Inspector"
      description="Lookup IP address geolocation, ISP providers, ASN routing numbers, city/region coordinates, and timezone metadata."
    >
      <IpLookup />
    </ToolLayout>
  );
}
