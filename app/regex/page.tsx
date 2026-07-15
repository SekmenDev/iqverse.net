import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import RegexForge from '@/components/tools/RegexForge';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('regex') || {
  title: 'RegEx Forge | Regex Tester & Explainer',
  description: 'Build, test and understand regular expressions with a live tester and explainer.',
};

export default function RegexForgePage() {
  return (
    <ToolLayout
      pill="REGEX"
      title="RegEx Forge"
      subtitle="Regex Tester & Explainer"
      description="Build, test and understand regular expressions with live highlighting, substitutions and match details."
    >
      <RegexForge />
    </ToolLayout>
  );
}
