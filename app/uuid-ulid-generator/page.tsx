import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import UuidUlidGenerator from '@/components/tools/UuidUlidGenerator';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('uuid-ulid-generator') || {
  title: 'UUID / ULID Generator | IQVerse',
  description: 'Batch generate cryptographically secure UUID v4 and sortable ULIDs with one-click copy.',
};

export default function UuidUlidGeneratorPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="UUID / ULID Generator"
      subtitle="Unique Identifier Generator & Decoder"
      description="Generate batch UUID v4 and sortable ULIDs locally using Web Crypto, with custom formatting options and timestamp decoding."
    >
      <UuidUlidGenerator />
    </ToolLayout>
  );
}
