import { describe, it, expect } from 'vitest';
import { generateOgMetaTags, analyzeOgLengths } from '@/lib/og';

describe('OpenGraph Engine (lib/og)', () => {
  it('generates Open Graph and Twitter card meta tags', () => {
    const tags = generateOgMetaTags({
      title: 'IQVerse Developer Tools',
      description: 'Free developer and SEO utilities for modern engineers.',
      url: 'https://iqverse.net',
      imageUrl: 'https://iqverse.net/og.png',
      siteName: 'IQVerse',
      twitterCard: 'summary_large_image',
      twitterHandle: '@iqverse',
    });

    expect(tags).toContain('<meta property="og:title" content="IQVerse Developer Tools">');
    expect(tags).toContain('<meta property="og:description" content="Free developer and SEO utilities for modern engineers.">');
    expect(tags).toContain('<meta property="og:url" content="https://iqverse.net">');
    expect(tags).toContain('<meta property="og:image" content="https://iqverse.net/og.png">');
    expect(tags).toContain('<meta property="og:site_name" content="IQVerse">');
    expect(tags).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(tags).toContain('<meta name="twitter:site" content="@iqverse">');
  });

  it('analyzes title and description length thresholds', () => {
    const analysis = analyzeOgLengths('Short Title', 'A perfectly sized description for optimal social card preview across networks.');
    expect(analysis.titleLength).toBe(11);
    expect(analysis.titleStatus).toBe('optimal');
    expect(analysis.descStatus).toBe('optimal');

    const longTitle = 'a'.repeat(80);
    const longAnalysis = analyzeOgLengths(longTitle, '');
    expect(longAnalysis.titleStatus).toBe('too_long');
  });
});
