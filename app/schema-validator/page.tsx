import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import SchemaValidator from '@/components/tools/SchemaValidator';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('schema-validator') || {
  title: 'Structured Data (Schema.org) Validator | IQVerse',
  description: 'Test JSON-LD structured data and Schema.org markup for AI agents and search crawlers.',
};

export default function SchemaValidatorPage() {
  return (
    <ToolLayout
      pill="AI & AGENTS"
      title="Structured Data (Schema.org) Validator"
      subtitle="JSON-LD & Microdata Validator"
      description="Validate Schema.org structured data markup for search engines and AI agent web scrapers."
    >
      <SchemaValidator />
    </ToolLayout>
  );
}
