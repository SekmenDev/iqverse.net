import type { Metadata } from 'next';
import SaasLandingPage from '@/components/layout/SaasLandingPage';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('goo') || {
  title: 'GOO | Modular School Management System',
  description: 'Simplify campus operations with a modular school management platform for records, communication and insight.',
  alternates: {
    canonical: 'https://iqverse.net/goo/',
  },
};

export default function GooPage() {
  return (
    <SaasLandingPage
      brand="GOO"
      appUrl="https://sekmen.dev/products/goo"
      eyebrow="School Management Platform"
      heroTitle="Run your school with"
      heroAccent="one unified platform"
      heroSubtitle="Automate operations, streamline communication and give teams real-time visibility across the institution."
      heroHighlights={['Student records', 'Parent updates', 'Campus insights']}
      heroStats={[
        { label: 'Students', value: '1,248', tone: 'accent' },
        { label: 'Staff', value: '86', tone: 'green' },
        { label: 'Attendance', value: '94%', tone: 'amber' },
      ]}
      trustLogos={['Sunrise Academy', 'Westside Int\'l School', 'Verde Valley Edu']}
      challengeTitle="Why traditional school operations fall short"
      challengeSubtitle="Paper paperwork, disconnected spreadsheets and fragmented communication slow staff down and leave stakeholders uninformed."
      challengeCards={[
        { icon: '📋', title: 'Paperwork overload', description: 'Too much manual record handling pulls teams away from student-facing work.' },
        { icon: '📊', title: 'Fragmented data', description: 'Information is scattered across tools, making decisions slower and less reliable.' },
        { icon: '🔔', title: 'Poor communication', description: 'Parents and teachers often lose momentum when updates arrive too late or too inconsistently.' },
      ]}
      solutionTitle="One platform for every school need"
      solutionSubtitle="Give every department shared context while still keeping workflows role-specific and focused."
      solutionBullets={[
        { title: 'Centralized information', description: 'Bring admissions, attendance, records and communication into a single system of record.' },
        { title: 'Faster decisions', description: 'Give principals and staff clear dashboards that surface what matters most right away.' },
        { title: 'Secure collaboration', description: 'Support role-based access and safe communication for administration, staff and families.' },
      ]}
      featuresTitle="Built for every aspect of school life"
      featuresSubtitle="Start with core modules and expand as your institution grows."
      featureCards={[
        { icon: '🧑‍🏫', title: 'Student management', description: 'Track attendance, profiles, activities and academic progress with less manual effort.' },
        { icon: '📣', title: 'Communication', description: 'Send updates to parents and staff through a consistent in-app workflow.' },
        { icon: '📱', title: 'Modular growth', description: 'Add features when needed without reworking the entire platform.' },
      ]}
      footerText="Give your campus a calmer, more connected operating model with GOO."
    />
  );
}
