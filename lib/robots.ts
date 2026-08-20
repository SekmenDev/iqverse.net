export interface RobotsRuleGroup {
  userAgent: string;
  disallows?: string[];
  disallow?: string[];
  allows?: string[];
  allow?: string[];
  crawlDelay?: number;
}

export interface RobotsConfig {
  groups: RobotsRuleGroup[];
  sitemaps?: string[];
  sitemapUrl?: string;
  host?: string;
}

export interface PathTestResult {
  allowed: boolean;
  message: string;
  reason: string;
  matchedDirective?: string;
  matchedUserAgent?: string;
}

export const ROBOTS_BOT_PRESETS = [
  { name: 'Googlebot', vendor: 'Google', purpose: 'Web search indexer' },
  { name: 'Bingbot', vendor: 'Microsoft', purpose: 'Bing search indexer' },
  { name: 'GPTBot', vendor: 'OpenAI', purpose: 'AI model training crawler' },
  { name: 'ChatGPT-User', vendor: 'OpenAI', purpose: 'Live browsing for ChatGPT' },
  { name: 'ClaudeBot', vendor: 'Anthropic', purpose: 'Anthropic AI crawler' },
  { name: 'PerplexityBot', vendor: 'Perplexity', purpose: 'Perplexity AI search indexer' },
  { name: 'CCBot', vendor: 'Common Crawl', purpose: 'Open web dataset crawler' },
  { name: 'Bytespider', vendor: 'ByteDance', purpose: 'ByteDance search crawler' },
];

export const STANDARD_ROBOTS_PRESET: RobotsRuleGroup[] = [
  {
    userAgent: '*',
    disallows: ['/admin/', '/private/', '/tmp/'],
    allows: ['/'],
  },
  {
    userAgent: 'Googlebot',
    disallows: ['/no-google/'],
    allows: ['/'],
  },
];

export const BLOCK_AI_ROBOTS_PRESET: RobotsRuleGroup[] = [
  {
    userAgent: '*',
    disallows: ['/admin/'],
    allows: ['/'],
  },
  {
    userAgent: 'GPTBot',
    disallows: ['/'],
    allows: [],
  },
  {
    userAgent: 'ClaudeBot',
    disallows: ['/'],
    allows: [],
  },
];

export const ALLOW_ALL_ROBOTS_PRESET: RobotsRuleGroup[] = [
  {
    userAgent: '*',
    disallows: [],
    allows: ['/'],
  },
];

export const BLOCK_ALL_ROBOTS_PRESET: RobotsRuleGroup[] = [
  {
    userAgent: '*',
    disallows: ['/'],
    allows: [],
  },
];

export const ROBOTS_PRESETS = {
  standard: STANDARD_ROBOTS_PRESET,
  blockAi: BLOCK_AI_ROBOTS_PRESET,
  allowAll: ALLOW_ALL_ROBOTS_PRESET,
  blockAll: BLOCK_ALL_ROBOTS_PRESET,
};

export function generateRobotsTxt(input: RobotsRuleGroup[] | RobotsConfig, sitemapUrl?: string): string {
  let groups: RobotsRuleGroup[] = [];
  const sitemaps: string[] = [];
  let host: string | undefined;

  if (Array.isArray(input)) {
    groups = input;
    if (sitemapUrl) sitemaps.push(sitemapUrl);
  } else {
    groups = input.groups || [];
    if (input.sitemaps) sitemaps.push(...input.sitemaps);
    if (input.sitemapUrl) sitemaps.push(input.sitemapUrl);
    host = input.host;
  }

  let txt = '';
  groups.forEach((g) => {
    txt += `User-agent: ${g.userAgent.trim() || '*'}\n`;
    const disallows = g.disallows || g.disallow || [];
    const allows = g.allows || g.allow || [];

    disallows.forEach((d) => {
      if (d.trim()) txt += `Disallow: ${d.trim()}\n`;
    });
    allows.forEach((a) => {
      if (a.trim()) txt += `Allow: ${a.trim()}\n`;
    });
    if (typeof g.crawlDelay === 'number') {
      txt += `Crawl-delay: ${g.crawlDelay}\n`;
    }
    txt += '\n';
  });

  sitemaps.forEach((sm) => {
    if (sm.trim()) txt += `Sitemap: ${sm.trim()}\n`;
  });

  if (host?.trim()) {
    txt += `Host: ${host.trim()}\n`;
  }

  return txt.trim();
}

export function testRobotsPath(
  groups: RobotsRuleGroup[],
  testAgent: string,
  testPath: string
): PathTestResult {
  const cleanAgent = testAgent.trim() || '*';
  const cleanPath = testPath.trim() || '/';

  const targetGroup =
    groups.find((g) => g.userAgent.toLowerCase() === cleanAgent.toLowerCase()) ||
    groups.find((g) => g.userAgent === '*');

  if (!targetGroup) {
    const msg = `No specific rule blocks "${cleanAgent}" for "${cleanPath}".`;
    return {
      allowed: true,
      message: msg,
      reason: msg,
    };
  }

  const disallows = targetGroup.disallows || targetGroup.disallow || [];
  const allows = targetGroup.allows || targetGroup.allow || [];

  const disallowedMatch = disallows.find(
    (d) => d.trim() && cleanPath.startsWith(d.trim())
  );
  const allowedMatch = allows.find(
    (a) => a.trim() && cleanPath.startsWith(a.trim())
  );

  if (disallowedMatch && (!allowedMatch || disallowedMatch.length >= allowedMatch.length)) {
    const msg = `Matched directive Disallow: ${disallowedMatch} under User-agent: ${targetGroup.userAgent}.`;
    return {
      allowed: false,
      message: msg,
      reason: msg,
      matchedDirective: `Disallow: ${disallowedMatch}`,
      matchedUserAgent: targetGroup.userAgent,
    };
  }

  const msg = allowedMatch
    ? `Matched Allow: ${allowedMatch} for User-agent: ${targetGroup.userAgent}.`
    : `Default crawling allowed for User-agent: ${targetGroup.userAgent}.`;

  return {
    allowed: true,
    message: msg,
    reason: msg,
    matchedDirective: allowedMatch ? `Allow: ${allowedMatch}` : undefined,
    matchedUserAgent: targetGroup.userAgent,
  };
}

export function testRobotsPathAccess(
  arg1: string | RobotsRuleGroup[],
  arg2: RobotsRuleGroup[] | string,
  arg3: string = '*'
): PathTestResult {
  if (Array.isArray(arg1)) {
    return testRobotsPath(arg1, typeof arg2 === 'string' ? arg2 : '*', arg3);
  }
  return testRobotsPath(arg2 as RobotsRuleGroup[], arg3, arg1);
}
