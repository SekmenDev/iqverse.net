import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import PasswordAnalyzer from '@/components/tools/PasswordAnalyzer';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('password-analyzer') || {
  title: 'Password Strength & Entropy Analyzer | IQVerse',
  description: 'Evaluate password strength, calculate bit entropy and estimate crack time offline.',
};

export default function PasswordAnalyzerPage() {
  return (
    <ToolLayout
      pill="SECURITY"
      title="Password Strength & Entropy Analyzer"
      subtitle="Bit Entropy & Crack Time Calculator"
      description="Evaluate password strength, calculate bit entropy and estimate brute-force crack time offline."
    >
      <PasswordAnalyzer />
    </ToolLayout>
  );
}
