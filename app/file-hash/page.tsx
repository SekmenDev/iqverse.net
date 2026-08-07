import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import FileHashVerifier from '@/components/tools/FileHashVerifier';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('file-hash') || {
  title: 'File Hash Verifier | IQVerse',
  description: 'Calculate and compare MD5, SHA-1, SHA-256 and SHA-512 hashes of local files.',
};

export default function FileHashVerifierPage() {
  return (
    <ToolLayout
      pill="SECURITY"
      title="File Hash Verifier"
      subtitle="Local File Integrity & Checksum Verifier"
      description="Compute and compare SHA-256, SHA-512 and SHA-1 checksum hashes of local files with zero server upload."
    >
      <FileHashVerifier />
    </ToolLayout>
  );
}
