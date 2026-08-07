import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://iqverse.net/',
  },
};

export default function Home() {
  return <HomeClient />;
}
