import { describe, it, expect } from 'vitest';
import { generateLlmsTxt, validateLlmsTxt } from '@/lib/llmstxt';

describe('llms.txt Engine (lib/llmstxt)', () => {
  const sampleConfig = {
    title: 'IQVerse Developer Tools',
    summary: 'A curated collection of web, developer and SEO tools.',
    sections: [
      {
        title: 'Core Tools',
        links: [
          { title: 'DNS Lookup', url: 'https://iqverse.net/dnslookup', desc: 'Authoritative DoH DNS inspector' },
          { title: 'CORS Tester', url: 'https://iqverse.net/cors-tester', desc: 'Cross-origin header validator' },
        ],
      },
    ],
    optionalLinks: [
      { title: 'Full LLMs Spec', url: 'https://iqverse.net/llms-full.txt', desc: 'Comprehensive llms content' },
    ],
  };

  it('generates compliant llms.txt markdown', () => {
    const txt = generateLlmsTxt(sampleConfig);
    expect(txt).toContain('# IQVerse Developer Tools');
    expect(txt).toContain('> A curated collection of web, developer and SEO tools.');
    expect(txt).toContain('## Core Tools');
    expect(txt).toContain('- [DNS Lookup](https://iqverse.net/dnslookup): Authoritative DoH DNS inspector');
    expect(txt).toContain('## Optional');
    expect(txt).toContain('- [Full LLMs Spec](https://iqverse.net/llms-full.txt): Comprehensive llms content');
  });

  it('validates llms.txt structure correctly', () => {
    const validTxt = generateLlmsTxt(sampleConfig);
    const validResult = validateLlmsTxt(validTxt);
    expect(validResult.valid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    const invalidTxt = `Just some text without an H1 title or summary.`;
    const invalidResult = validateLlmsTxt(invalidTxt);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.some((e) => e.includes('H1'))).toBe(true);
  });
});
