import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import AgentScan from '@/components/tools/AgentScan';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata =
  getToolMetadata('agentscan') || {
    title: 'AgentScan | AI Agent Readiness Scanner',
    description:
      'Scan any website to discover how compatible it is with AI agents. Check robots.txt, sitemap, MCP, OAuth, markdown negotiation and commerce metadata using a browser-based scanner.',
    alternates: {
      canonical: 'https://iqverse.net/agentscan/',
    },
  };

export default function AgentScanPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="AgentScan"
      subtitle="AI Agent Readiness Scanner"
      description="Scan any website to discover its AI agent compatibility and get actionable recommendations for improving discoverability, bot access, MCP support, commerce signals and security."
    >
      <AgentScan />
    </ToolLayout>
  );
}
