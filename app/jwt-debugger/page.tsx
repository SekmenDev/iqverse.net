import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import JwtDebugger from '@/components/tools/JwtDebugger';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('jwt-debugger') || {
  title: 'JWT Debugger & Verifier | IQVerse',
  description: 'Decode JWT headers and claims and verify signatures locally using Web Crypto API.',
  alternates: {
    canonical: 'https://iqverse.net/jwt-debugger/',
  },
};

export default function JwtDebuggerPage() {
  return (
    <ToolLayout
      pill="SECURITY"
      title="JWT Debugger & Verifier"
      subtitle="JSON Web Token Decoder & Signature Verifier"
      description="Decode JWT headers and payload claims locally in your browser and verify HMAC SHA-256 signatures with Web Crypto."
    >
      <JwtDebugger />
    </ToolLayout>
  );
}
