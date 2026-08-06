import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import TextCaseConverter from '@/components/tools/TextCaseConverter';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('case-converter') || {
  title: 'Text Case Converter | IQVerse',
  description: 'Toggle between camelCase, snake_case, kebab-case, Title Case and UPPERCASE instantly.',
};

export default function TextCaseConverterPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="Text Case Converter"
      subtitle="String Case & Naming Style Converter"
      description="Convert text between camelCase, snake_case, kebab-case, PascalCase, Title Case, and uppercase styles."
    >
      <TextCaseConverter />
    </ToolLayout>
  );
}
