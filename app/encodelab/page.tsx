import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import EncodeLab from '@/components/tools/EncodeLab';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('encodelab') || {
  title: 'EncodeLab | Base64 & URL Encoder/Decoder',
  description: 'Encode and decode Base64, URL parameters and inspect JWTs in your browser.',
};

export default function EncodeLabPage() {
  return (
    <ToolLayout
      pill="ENCODE"
      title="EncodeLab"
      subtitle="Base64 & URL Encoder/Decoder"
      description="Encode and decode Base64, URL parameters, inspect JWTs and convert files locally in your browser."
    >
      <EncodeLab />
    </ToolLayout>
  );
}
