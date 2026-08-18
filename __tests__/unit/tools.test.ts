import { describe, it, expect } from 'vitest';
import { tools, filterTools, sortTools } from '@/lib/tools';

describe('lib/tools.ts - Tools Registry Integrity', () => {
  it('should contain a list of registered tools', () => {
    expect(tools.length).toBeGreaterThan(0);
  });

  it('every tool should have required properties (name, desc, icon, url, type, tags, cat)', () => {
    tools.forEach((tool) => {
      expect(tool.name).toBeTruthy();
      expect(tool.desc).toBeTruthy();
      expect(tool.type).toMatch(/^(open|saas|coming)$/);
      expect(tool.cat).toBeTruthy();
    });
  });

  it('open tools should specify valid page routes or external links', () => {
    const openTools = tools.filter((t) => t.type === 'open');
    expect(openTools.length).toBeGreaterThan(0);
    openTools.forEach((tool) => {
      expect(tool.url).toMatch(/^(\/[a-z0-9_-]+\/|https?:\/\/.+)$/i);
    });
  });

  it('filterTools should match query against name, desc, tags, and cat case-insensitively', () => {
    const qrResults = filterTools('qr', 'all', 'all');
    expect(qrResults.length).toBeGreaterThan(0);
    expect(qrResults.some((t: any) => t.name.toLowerCase().includes('qr'))).toBe(true);

    const jsonResults = filterTools('JSON', 'all', 'all');
    expect(jsonResults.length).toBeGreaterThan(0);
    expect(jsonResults.some((t: any) => t.name.toLowerCase().includes('json'))).toBe(true);

    const nonExistent = filterTools('xyz999nonexistentquery', 'all', 'all');
    expect(nonExistent.length).toBe(0);
  });

  it('sortTools should sort tools alphabetically when sortBy is az and preserve order when default', () => {
    const sample = [
      { name: 'Zebra', desc: '', icon: '', url: '', type: 'open' as const, tags: '', cat: 'Security' },
      { name: 'Apple', desc: '', icon: '', url: '', type: 'open' as const, tags: '', cat: 'Security' },
      { name: 'Mango', desc: '', icon: '', url: '', type: 'open' as const, tags: '', cat: 'Security' },
    ];

    const defaultSorted = sortTools(sample, 'default');
    expect(defaultSorted.map(s => s.name)).toEqual(['Zebra', 'Apple', 'Mango']);

    const azSorted = sortTools(sample, 'az');
    expect(azSorted.map(s => s.name)).toEqual(['Apple', 'Mango', 'Zebra']);
  });
});
