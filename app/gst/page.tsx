import type { Metadata } from 'next';
import SaasLandingPage from '@/components/layout/SaasLandingPage';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('gst') || {
  title: 'GST | Minimalist Stock & Expense Tracking System',
  description: 'Track inventory and daily expenses in a simple, mobile-first workspace for small workshops and boutiques.',
};

export default function GstPage() {
  return (
    <SaasLandingPage
      brand="GST"
      appUrl="https://sekmen.dev/products/gst"
      eyebrow="Stock & Expense Platform"
      heroTitle="Manage your workshop"
      heroAccent="as simply as a notebook"
      heroSubtitle="Track inventory and cash expenses from a lightweight, mobile-first workspace built for small businesses and workshops."
      heroHighlights={['Group inventory', 'Expense tracking', 'Offline-ready']}
      heroStats={[
        { label: 'Low stock groups', value: '4', tone: 'accent' },
        { label: 'Daily expenses', value: '$1,240', tone: 'green' },
        { label: 'Pending salaries', value: '$12.5K', tone: 'amber' },
      ]}
      trustLogos={['Workshop Collective', 'NorthBridge Craft', 'Blue Oak Studio']}
      challengeTitle="No complexity, just what you need"
      challengeSubtitle="Small teams need a fast, clear way to stay on top of stock levels and daily spending without heavy software."
      challengeCards={[
        { icon: '📦', title: 'Inventory drift', description: 'It is easy to lose track of low-stock groups when information is spread across notes and spreadsheets.' },
        { icon: '💸', title: 'Expense blind spots', description: 'Daily spending can pile up without a simple overview of where money is going.' },
        { icon: '📱', title: 'Mobile friction', description: 'Traditional tools can feel bulky when the work is happening on the shop floor or in the field.' },
      ]}
      solutionTitle="A calm, practical operating layer for daily operations"
      solutionSubtitle="Keep the essentials visible and the workflow simple enough for everyday use."
      solutionBullets={[
        { title: 'Simple inventory view', description: 'Monitor core product groups and stock changes without getting lost in detail.' },
        { title: 'Expense awareness', description: 'Track daily and monthly spending so budgets stay under control.' },
        { title: 'Flexible use', description: 'Use the workspace from your browser on any device and keep working without friction.' },
      ]}
      featuresTitle="Built for practical day-to-day work"
      featuresSubtitle="Support small teams with a clean interface and reliable essentials."
      featureCards={[
        { icon: '🧺', title: 'Group-based inventory', description: 'Organize stock around the categories that matter most to your business.' },
        { icon: '💳', title: 'Expense tracking', description: 'Capture rent, invoices, purchases and salary-related costs in one place.' },
        { icon: '🌐', title: 'Mobile-first access', description: 'Work straight from the browser, whether you are in the workshop or on the move.' },
      ]}
      footerText="Keep operations clear, lightweight and under control with GST."
    />
  );
}
