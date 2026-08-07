import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import YamlJsonTomlConverter from '@/components/tools/YamlJsonTomlConverter';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('yaml-json-toml') || {
  title: 'YAML / JSON / TOML Converter | IQVerse',
  description: 'Convert seamlessly between YAML, JSON and TOML formats directly in your browser.',
};

export default function YamlJsonTomlConverterPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="YAML / JSON / TOML Converter"
      subtitle="Data Model & Config Converter"
      description="Convert data and configuration files between JSON, YAML and TOML formats in your browser."
    >
      <YamlJsonTomlConverter />
    </ToolLayout>
  );
}
