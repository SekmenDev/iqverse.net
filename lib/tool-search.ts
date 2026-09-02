import Fuse, { type IFuseOptions } from 'fuse.js';
import {
  matchesFilters,
  sortTools,
  toolKey,
  tools,
  type Category,
  type Tool,
  type ToolType,
} from './tools';
import { escapeHtml } from './utils';

export type Range = [number, number];

export interface SearchResult {
  tool: Tool;
  score: number;
  nameRanges: Range[];
  descRanges: Range[];
}

export interface SearchOptions {
  category?: Category | 'all';
  status?: ToolType | 'all';
  sort?: 'default' | 'az';
  limit?: number;
}

const FUSE_OPTIONS: IFuseOptions<Tool> = {
  includeScore: true,
  ignoreLocation: true,
  threshold: 0.34,
  minMatchCharLength: 2,
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'aliases', weight: 0.2 },
    { name: 'tags', weight: 0.2 },
    { name: 'desc', weight: 0.13 },
    { name: 'cats', weight: 0.07 },
  ],
};

const SUGGEST_OPTIONS: IFuseOptions<Tool> = { ...FUSE_OPTIONS, threshold: 0.6 };

let strictIndex: Fuse<Tool> | null = null;
let looseIndex: Fuse<Tool> | null = null;
let byKey: Map<string, Tool> | null = null;

function getStrictIndex(): Fuse<Tool> {
  strictIndex ??= new Fuse(tools, FUSE_OPTIONS);
  return strictIndex;
}

function getLooseIndex(): Fuse<Tool> {
  looseIndex ??= new Fuse(tools, SUGGEST_OPTIONS);
  return looseIndex;
}

function getByKey(): Map<string, Tool> {
  byKey ??= new Map(tools.map(tool => [toolKey(tool), tool]));
  return byKey;
}

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,]+/)
    .map(token => token.trim())
    .filter(Boolean);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function prefixBoost(tool: Tool, token: string): number {
  const name = tool.name.toLowerCase();
  if (name.startsWith(token)) return 0.35;
  if (new RegExp(`\\b${escapeRegExp(token)}`).test(name)) return 0.2;
  if (tool.tags.toLowerCase().split(/\s+/).includes(token)) return 0.12;
  return 0;
}

function mergeRanges(ranges: Range[]): Range[] {
  if (ranges.length < 2) return ranges;
  const sorted = [...ranges].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: Range[] = [sorted[0]];
  for (const [start, end] of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}

export function literalRanges(text: string, tokens: string[]): Range[] {
  const lower = text.toLowerCase();
  const ranges: Range[] = [];

  for (const token of tokens) {
    let from = 0;
    for (;;) {
      const at = lower.indexOf(token, from);
      if (at === -1) break;
      ranges.push([at, at + token.length]);
      from = at + token.length;
    }
  }

  return mergeRanges(ranges);
}

export function highlight(text: string, ranges: Range[]): string {
  if (ranges.length === 0) return escapeHtml(text);

  let html = '';
  let cursor = 0;

  for (const [start, end] of ranges) {
    html += escapeHtml(text.slice(cursor, start));
    html += `<mark>${escapeHtml(text.slice(start, end))}</mark>`;
    cursor = end;
  }

  return html + escapeHtml(text.slice(cursor));
}

function toResults(list: Tool[], tokens: string[], scores: Map<string, number>): SearchResult[] {
  return list.map(tool => ({
    tool,
    score: scores.get(toolKey(tool)) ?? 0,
    nameRanges: literalRanges(tool.name, tokens),
    descRanges: literalRanges(tool.desc, tokens),
  }));
}

export function searchTools(query: string, options: SearchOptions = {}): SearchResult[] {
  const { category = 'all', status = 'all', sort = 'default', limit } = options;
  const tokens = tokenize(query);
  const visible = (tool: Tool) => matchesFilters(tool, category, status);

  if (tokens.length === 0) {
    const list = sortTools(tools.filter(visible), sort);
    const capped = limit === undefined ? list : list.slice(0, limit);
    return toResults(capped, tokens, new Map());
  }

  const index = getStrictIndex();
  let scores: Map<string, number> | null = null;

  for (const token of tokens) {
    const hits = new Map<string, number>();

    for (const hit of index.search(token)) {
      const key = toolKey(hit.item);
      const score = Math.max(0, (hit.score ?? 1) - prefixBoost(hit.item, token));
      hits.set(key, Math.min(hits.get(key) ?? Number.POSITIVE_INFINITY, score));
    }

    if (scores === null) {
      scores = hits;
    } else {
      const intersection = new Map<string, number>();
      for (const [key, score] of hits) {
        const previous = scores.get(key);
        if (previous !== undefined) intersection.set(key, previous + score);
      }
      scores = intersection;
    }

    if (scores.size === 0) break;
  }

  const lookup = getByKey();
  const matched = [...(scores ?? new Map<string, number>()).keys()]
    .map(key => lookup.get(key))
    .filter((tool): tool is Tool => tool !== undefined)
    .filter(visible);

  const ordered =
    sort === 'az'
      ? sortTools(matched, 'az')
      : matched.sort((a, b) => {
          const diff = (scores?.get(toolKey(a)) ?? 1) - (scores?.get(toolKey(b)) ?? 1);
          return diff !== 0 ? diff : a.name.localeCompare(b.name);
        });

  const capped = limit === undefined ? ordered : ordered.slice(0, limit);
  return toResults(capped, tokens, scores ?? new Map());
}

export function suggestTools(query: string, limit = 3): Tool[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return getLooseIndex()
    .search(trimmed)
    .slice(0, limit)
    .map(hit => hit.item);
}
