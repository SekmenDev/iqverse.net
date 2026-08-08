import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import Compression from '@/components/tools/Compression';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('compression') || {
  title: 'Compression | Deflate Compress & Decompress',
  description: 'Compress and decompress text using browser-native compression support.',
  alternates: {
    canonical: 'https://iqverse.net/compression/',
  },
};

export default function CompressionPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="Compression"
      subtitle="Deflate Compress & Decompress"
      description="Compress text into Base64-deflate data or decompress Base64 deflate data in your browser."
    >
      <Compression />
    </ToolLayout>
  );
}
