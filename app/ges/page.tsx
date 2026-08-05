import type { Metadata } from 'next';
import SaasLandingPage from '@/components/layout/SaasLandingPage';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('ges') || {
  title: 'GES | Smart Quiz & Exam Platform',
  description: 'Create, share and analyze quizzes and exams in minutes with a polished assessment experience.',
};

export default function GesPage() {
  return (
    <SaasLandingPage
      brand="GES"
      appUrl="https://sekmen.dev/products/ges"
      eyebrow="Quiz & Exam Platform"
      heroTitle="Create smarter exams"
      heroAccent="and get real insights"
      heroSubtitle="Build timed or open-ended quizzes in minutes, share them securely and monitor results with instant reports that help educators move faster."
      heroHighlights={['Timed tests', 'Password protection', 'Instant analytics']}
      heroStats={[
        { label: 'Quizzes', value: '142', tone: 'accent' },
        { label: 'Participants', value: '8.3K', tone: 'green' },
        { label: 'Avg. score', value: '74%', tone: 'amber' },
      ]}
      trustLogos={['Sunrise Academy', 'Westside Int\'l School', 'Maple Leaf Institute']}
      challengeTitle="Why traditional exams slow everyone down"
      challengeSubtitle="Paper forms, spreadsheets and messy email chains create friction that burdens teachers and students alike."
      challengeCards={[
        { icon: '📋', title: 'Manual grading overload', description: 'Reviewing every sheet by hand drains time and introduces avoidable errors.' },
        { icon: '📊', title: 'No performance visibility', description: 'Without analytics, it is hard to identify weak areas or spot progress early.' },
        { icon: '🔒', title: 'Fragmented distribution', description: 'Sharing tests through email and PDFs leads to inconsistent experiences and missed deadlines.' },
      ]}
      solutionTitle="One platform for assessments, reporting and delivery"
      solutionSubtitle="Bring quizzes into a single workflow that feels simple for teachers and clear for learners."
      solutionBullets={[
        { title: 'Fast setup', description: 'Create and publish assessments in minutes without wrestling with complex admin tasks.' },
        { title: 'Secure delivery', description: 'Protect exams with passwords, timed access and flexible sharing options.' },
        { title: 'Actionable reports', description: 'Measure performance trends, identify gaps and share feedback quickly.' },
      ]}
      featuresTitle="Built for modern classrooms and training teams"
      featuresSubtitle="Support everything from quick knowledge checks to formal exams with a polished experience."
      featureCards={[
        { icon: '⚡', title: 'Rapid quiz builder', description: 'Design multi-question assessments with clear structure and an intuitive editing experience.' },
        { icon: '📈', title: 'Live insights', description: 'Monitor engagement and results as submissions arrive in real time.' },
        { icon: '🔐', title: 'Flexible access', description: 'Use public links, private invites or password-protected sessions without friction.' },
      ]}
      footerText="Make assessments easier to create, more secure to deliver and faster to understand with GES."
    />
  );
}
