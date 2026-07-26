import { describe, it, expect } from 'vitest';
import { tools } from '@/lib/tools';

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
});
