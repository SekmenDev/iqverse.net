import type { Metadata } from 'next';
import SaasLandingPage from '@/components/layout/SaasLandingPage';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('gyp') || {
  title: 'GYP | Client Management & License Tracking Platform',
  description: 'Manage clients, software licenses, payments and service requests from one streamlined workspace.',
  alternates: {
    canonical: 'https://iqverse.net/gyp/',
  },
};

export default function GypPage() {
  return (
    <SaasLandingPage
      brand="GYP"
      appUrl="https://sekmen.dev/products/gyp"
      eyebrow="Client & License Platform"
      heroTitle="Manage clients and licenses"
      heroAccent="at enterprise scale"
      heroSubtitle="Track customers, renewals, payments and support requests in one place so your team can stay on top of revenue and delivery."
      heroHighlights={['Multi-tenant ready', 'Renewal alerts', 'Unified customer view']}
      heroStats={[
        { label: 'Clients', value: '247', tone: 'accent' },
        { label: 'Receivables', value: '$1.2M', tone: 'green' },
        { label: 'Collection rate', value: '89%', tone: 'amber' },
      ]}
      trustLogos={['TechCore Solutions', 'GlobalSoft Inc', 'CloudFirst Systems']}
      challengeTitle="Managing growth gets complex fast"
      challengeSubtitle="Revenue, licensing and service history are often scattered across spreadsheets, inboxes and disconnected systems."
      challengeCards={[
        { icon: '📊', title: 'Visibility gaps', description: 'It is difficult to know which accounts are paid, pending or at risk without a single source of truth.' },
        { icon: '📅', title: 'License complexity', description: 'Renewals, entitlements and access windows are easy to lose track of when updates are manual.' },
        { icon: '🔗', title: 'Fragmented context', description: 'Customer communication and billing details rarely live in the same place.' },
      ]}
      solutionTitle="A better operating layer for client operations"
      solutionSubtitle="Keep commercial and support workflows connected so your team can move with confidence."
      solutionBullets={[
        { title: 'Centralized records', description: 'Bring client profiles, licenses and transaction history into one consistent workspace.' },
        { title: 'Automated follow-up', description: 'Set renewal reminders, payment milestones and service workflows without manual chasing.' },
        { title: 'Clear ownership', description: 'Assign tasks and track requests so no client issue falls through the cracks.' },
      ]}
      featuresTitle="Purpose-built for modern service businesses"
      featuresSubtitle="Support growth without adding more tools, tabs or tribal knowledge."
      featureCards={[
        { icon: '🧾', title: 'License lifecycle tracking', description: 'Monitor current, expiring and expired entitlements with clarity and control.' },
        { icon: '💳', title: 'Billing visibility', description: 'Keep invoices, payments and outstanding balances aligned in the same view.' },
        { icon: '🛠️', title: 'Service request workflow', description: 'Route support updates, approvals and next steps through a reliable process.' },
      ]}
      footerText="Give your operations team the visibility they need to grow without operational drag."
    />
  );
}
