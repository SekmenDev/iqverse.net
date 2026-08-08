import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import WebhookInspector from '@/components/tools/WebhookInspector';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('webhook-inspector') || {
  title: 'Webhook Inspector | IQVerse',
  description: 'Inspect and debug incoming HTTP webhook payloads and request headers in real time.',
  alternates: {
    canonical: 'https://iqverse.net/webhook-inspector/',
  },
};

export default function WebhookInspectorPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="Webhook Inspector"
      subtitle="HTTP Webhook Payload & Signature Inspector"
      description="Inspect HTTP webhook headers, validate JSON body payloads and calculate HMAC SHA-256 signatures."
    >
      <WebhookInspector />
    </ToolLayout>
  );
}
