import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import WcagContrastChecker from '@/components/tools/WcagContrastChecker';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('wcag-contrast') || {
  title: 'WCAG Contrast Checker | IQVerse',
  description: 'Calculate contrast ratios for foreground/background colors with WCAG AA/AAA compliance badges.',
};

export default function WcagContrastCheckerPage() {
  return (
    <ToolLayout
      pill="DESIGN"
      title="WCAG Contrast Checker"
      subtitle="Color Contrast & Accessibility Compliance"
      description="Calculate WCAG 2.1 relative luminance and contrast ratios between text foreground and background colors."
    >
      <WcagContrastChecker />
    </ToolLayout>
  );
}
