import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import QRForge from '@/components/tools/QRForge';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('qrforge') || {
  title: 'QR Forge | Custom QR Code Generator',
  description: 'Create beautiful, custom QR codes with full control over design, colors and logo placement.',
};

export default function QRForgePage() {
  return (
    <ToolLayout
      pill="QR TOOLS"
      title="QR Forge"
      subtitle="Custom QR Code Generator"
      description="Create beautiful, custom QR codes with full control over design, colors and output format. All generation happens locally in your browser."
    >
      <QRForge />
    </ToolLayout>
  );
}
