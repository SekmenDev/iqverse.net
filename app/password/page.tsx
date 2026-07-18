import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import PasswordGenerator from '@/components/tools/PasswordGenerator';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('password') || {
  title: 'SecretForge | Password & Secret Generator',
  description: 'Generate strong passwords and secure secrets locally in your browser.',
};

export default function PasswordPage() {
  return (
    <ToolLayout
      pill="SECURITY"
      title="SecretForge"
      subtitle="Password & Secret Generator"
      description="Generate strong passwords and tokens with full control over length, symbols, prefixes, suffixes and character sets."
    >
      <PasswordGenerator />
    </ToolLayout>
  );
}
