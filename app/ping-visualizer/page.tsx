import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import PingVisualizer from '@/components/tools/PingVisualizer';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('ping-visualizer') || {
  title: 'Ping & Traceroute Visualizer | IQVerse',
  description: 'Visualize network latency and hop trace routes via backend diagnostic relay.',
};

export default function PingVisualizerPage() {
  return (
    <ToolLayout
      pill="NETWORK"
      title="Ping & Traceroute Visualizer"
      subtitle="Network Latency & Route Diagnostic Tool"
      description="Visualize round-trip network ping latency, jitter, packet loss and hop-by-hop traceroute paths."
    >
      <PingVisualizer />
    </ToolLayout>
  );
}
