import { describe, it, expect } from 'vitest';
import {
  CATEGORIES,
  countByCategory,
  countByStatus,
  getFeaturedTools,
  getUniqueCategories,
  getUniqueStatuses,
  groupByPrimaryCategory,
  isExternalUrl,
  matchesFilters,
  primaryCategory,
  sortTools,
  toolKey,
  tools,
  TOOL_TYPES,
  type Tool,
} from '@/lib/tools';

function stub(overrides: Partial<Tool> = {}): Tool {
  return {
    name: 'Stub',
    desc: 'Stub description',
    icon: '🔧',
    url: '/stub/',
    type: 'open',
    tags: 'stub',
    cats: ['Security'],
    ...overrides,
  };
}

describe('lib/tools.ts - registry integrity', () => {
  it('contains registered tools', () => {
    expect(tools.length).toBeGreaterThan(0);
  });

  it('gives every tool the required properties', () => {
    tools.forEach(tool => {
      expect(tool.name).toBeTruthy();
      expect(tool.desc).toBeTruthy();
      expect(tool.icon).toBeTruthy();
      expect(tool.type).toMatch(/^(open|saas|coming)$/);
      expect(tool.tags).toBeTruthy();
    });
  });

  it('gives every tool at least one known category with no duplicates', () => {
    tools.forEach(tool => {
      expect(tool.cats.length).toBeGreaterThan(0);
      expect(new Set(tool.cats).size).toBe(tool.cats.length);
      tool.cats.forEach(cat => expect(CATEGORIES).toContain(cat));
    });
  });

  it('keeps tool urls unique so they work as registry keys', () => {
    const urls = tools.map(t => t.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('points open tools at valid page routes or external links', () => {
    const openTools = tools.filter(t => t.type === 'open');
    expect(openTools.length).toBeGreaterThan(0);
    openTools.forEach(tool => {
      expect(tool.url).toMatch(/^(\/[a-z0-9_-]+\/|https?:\/\/.+)$/i);
    });
  });

  it('exposes multi-category tools', () => {
    expect(tools.some(t => t.cats.length > 1)).toBe(true);
  });
});

describe('lib/tools.ts - helpers', () => {
  it('treats the first category as primary', () => {
    expect(primaryCategory(stub({ cats: ['Network', 'Security'] }))).toBe('Network');
  });

  it('lists every used category once, prefixed with all', () => {
    const categories = getUniqueCategories();
    expect(categories[0]).toBe('all');
    expect(new Set(categories).size).toBe(categories.length);
    categories.slice(1).forEach(cat => expect(CATEGORIES).toContain(cat));
  });

  it('lists only statuses that have tools, prefixed with all', () => {
    const statuses = getUniqueStatuses();
    const counts = countByStatus();

    expect(statuses[0]).toBe('all');
    statuses.slice(1).forEach(status => expect(counts[status]).toBeGreaterThan(0));
    TOOL_TYPES.filter(s => counts[s] === 0).forEach(s => expect(statuses).not.toContain(s));
  });

  it('counts a tool under every category it declares', () => {
    const counts = countByCategory();
    expect(counts.all).toBe(tools.length);

    const total = CATEGORIES.reduce((sum, cat) => sum + counts[cat], 0);
    const declared = tools.reduce((sum, tool) => sum + tool.cats.length, 0);
    expect(total).toBe(declared);
    expect(total).toBeGreaterThan(tools.length);
  });

  it('counts each tool under exactly one status', () => {
    const counts = countByStatus();
    expect(counts.open + counts.saas + counts.coming).toBe(tools.length);
  });

  it('places every tool in either the featured row or its primary category, exactly once', () => {
    const groups = groupByPrimaryCategory();
    const rendered = [...getFeaturedTools(), ...groups.flatMap(g => g.tools)];

    expect(rendered).toHaveLength(tools.length);
    expect(new Set(rendered.map(toolKey)).size).toBe(tools.length);

    groups.forEach(group => {
      group.tools.forEach(tool => expect(primaryCategory(tool)).toBe(group.category));
    });
  });

  it('returns only flagged tools as featured', () => {
    const featured = getFeaturedTools();
    expect(featured.length).toBeGreaterThan(0);
    featured.forEach(tool => expect(tool.featured).toBe(true));
  });

  it('matches a tool on any of its categories, not just the primary', () => {
    const tool = stub({ cats: ['Security', 'Network'] });
    expect(matchesFilters(tool, 'Security', 'all')).toBe(true);
    expect(matchesFilters(tool, 'Network', 'all')).toBe(true);
    expect(matchesFilters(tool, 'Design', 'all')).toBe(false);
    expect(matchesFilters(tool, 'all', 'open')).toBe(true);
    expect(matchesFilters(tool, 'all', 'saas')).toBe(false);
  });

  it('sorts alphabetically on az and preserves order on default', () => {
    const sample = [stub({ name: 'Zebra' }), stub({ name: 'Apple' }), stub({ name: 'Mango' })];

    expect(sortTools(sample, 'default').map(s => s.name)).toEqual(['Zebra', 'Apple', 'Mango']);
    expect(sortTools(sample, 'az').map(s => s.name)).toEqual(['Apple', 'Mango', 'Zebra']);
  });

  it('does not mutate the input when sorting', () => {
    const sample = [stub({ name: 'Zebra' }), stub({ name: 'Apple' })];
    sortTools(sample, 'az');
    expect(sample.map(s => s.name)).toEqual(['Zebra', 'Apple']);
  });

  it('detects external urls', () => {
    expect(isExternalUrl('https://github.com/foo')).toBe(true);
    expect(isExternalUrl('mailto:a@b.co')).toBe(true);
    expect(isExternalUrl('/json/')).toBe(false);
  });
});
