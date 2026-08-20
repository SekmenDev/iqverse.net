export interface FaviconResolution {
  name: string;
  filename: string;
  size: number;
  label: string;
  usage: string;
  id: string;
}

export const FAVICON_SIZES: FaviconResolution[] = [
  { id: '16', name: 'favicon-16x16.png', filename: 'favicon-16x16.png', size: 16, label: '16 × 16', usage: 'Standard browser tab' },
  { id: '32', name: 'favicon-32x32.png', filename: 'favicon-32x32.png', size: 32, label: '32 × 32', usage: 'Retina browser tab' },
  { id: '48', name: 'favicon-48x48.png', filename: 'favicon-48x48.png', size: 48, label: '48 × 48', usage: 'Windows site shortcut' },
  { id: '180', name: 'apple-touch-icon.png', filename: 'apple-touch-icon.png', size: 180, label: '180 × 180', usage: 'iOS Home Screen / Safari' },
  { id: '192', name: 'android-chrome-192x192.png', filename: 'android-chrome-192x192.png', size: 192, label: '192 × 192', usage: 'Android home screen' },
  { id: '512', name: 'android-chrome-512x512.png', filename: 'android-chrome-512x512.png', size: 512, label: '512 × 512', usage: 'PWA Splash & Android HD' },
];

export function generateFaviconHtmlSnippet(themeColor: string = '#13161F'): string {
  return `<!-- Standard Favicons -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

<!-- Web App Manifest -->
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="${themeColor}" />`;
}

export function generateWebManifest(
  appName: string = 'My App',
  shortName: string = 'App',
  themeColor: string = '#13161F',
  backgroundColor: string = '#0C0E14'
): string {
  return JSON.stringify(
    {
      name: appName,
      short_name: shortName,
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      theme_color: themeColor,
      background_color: backgroundColor,
      display: 'standalone',
    },
    null,
    2
  );
}
