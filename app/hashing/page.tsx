import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import Hashing from '@/components/tools/Hashing';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('hashing') || {
  title: 'Hashing | SHA & HMAC Generator',
  description: 'Compute SHA digests and HMAC values with browser-native cryptography.',
  alternates: {
    canonical: 'https://iqverse.net/hashing/',
  },
};

export default function HashingPage() {
  return (
    <ToolLayout
      pill="SECURITY"
      title="Hashing"
      subtitle="SHA & HMAC Generator"
      description="Compute SHA fingerprints and HMAC digests locally in your browser, with hex or Base64 output."
    >
      <Hashing />
    </ToolLayout>
  );
}
