import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import FakeDataGenerator from '@/components/tools/FakeDataGenerator';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('fake-data-generator') || {
  title: 'Lorem Ipsum & Fake Data Generator | IQVerse',
  description: 'Generate names, addresses, emails and mock JSON data batches locally.',
  alternates: {
    canonical: 'https://iqverse.net/fake-data-generator/',
  },
};

export default function FakeDataGeneratorPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="Lorem Ipsum & Fake Data Generator"
      subtitle="Mock Text & JSON Dataset Generator"
      description="Generate placeholder text and mock JSON array batches locally in your browser for testing and prototyping."
    >
      <FakeDataGenerator />
    </ToolLayout>
  );
}
