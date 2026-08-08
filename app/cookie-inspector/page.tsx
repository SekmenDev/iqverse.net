import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import CookieInspector from '@/components/tools/CookieInspector';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('cookie-inspector') || {
  title: 'Cookie Inspector | IQVerse',
  description: 'Parse and inspect raw Cookie and Set-Cookie headers for SameSite, Secure and Max-Age flags.',
  alternates: {
    canonical: 'https://iqverse.net/cookie-inspector/',
  },
};

export default function CookieInspectorPage() {
  return (
    <ToolLayout
      pill="BROWSER TOOLS"
      title="Cookie Inspector"
      subtitle="HTTP Cookie & Set-Cookie Header Inspector"
      description="Parse Set-Cookie headers to audit SameSite, Secure, HttpOnly and Max-Age flags."
    >
      <CookieInspector />
    </ToolLayout>
  );
}
