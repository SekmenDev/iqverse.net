export interface AiBotDefinition {
  name: string;
  regex: RegExp;
  vendor: string;
}

export const AI_BOT_PATTERNS: AiBotDefinition[] = [
  { name: 'GPTBot', regex: /GPTBot/i, vendor: 'OpenAI' },
  { name: 'ChatGPT-User', regex: /ChatGPT-User/i, vendor: 'OpenAI' },
  { name: 'ClaudeBot', regex: /ClaudeBot|Claude-Web/i, vendor: 'Anthropic' },
  { name: 'PerplexityBot', regex: /PerplexityBot/i, vendor: 'Perplexity' },
  { name: 'Bytespider', regex: /Bytespider/i, vendor: 'ByteDance' },
  { name: 'CCBot', regex: /CCBot/i, vendor: 'Common Crawl' },
  { name: 'Google-Extended', regex: /Google-Extended|GoogleOther/i, vendor: 'Google' },
  { name: 'Amazonbot', regex: /Amazonbot/i, vendor: 'Amazon' },
  { name: 'Cohere-ai', regex: /Cohere-ai/i, vendor: 'Cohere' },
  { name: 'Applebot-Extended', regex: /Applebot-Extended/i, vendor: 'Apple' },
];

export interface AiLogHit {
  path: string;
  status: string;
  botMatch: { name: string; vendor: string };
  userAgent: string;
}

export interface AiLogAnalysisResult {
  totalLines: number;
  aiHits: number;
  aiHitsCount: number;
  botCounts: Record<string, any>;
  statusCounts: Record<string | number, number>;
  pathCounts: Record<string, number>;
  topPaths: { path: string; count: number }[];
  hits: AiLogHit[];
  entries: AiLogHit[];
}

export const COMMON_LOG_REGEX =
  /^(\S+)\s+-\s+-\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)\s+[^"]*"\s+(\d{3})\s+(\d+|-)\s*(?:"[^"]*"\s*"([^"]*)")?/;

export function parseAccessLogs(logContent: string): AiLogAnalysisResult {
  const lines = logContent.split('\n').filter((l) => l.trim().length > 0);
  const botCounts: Record<string, any> = {};
  const pathCounts: Record<string, number> = {};
  const statusCounts: Record<string | number, number> = {};
  let aiHitsCount = 0;
  const hits: AiLogHit[] = [];

  lines.forEach((line) => {
    let path = '/';
    let status = '200';
    let userAgent = line;

    const match = line.match(COMMON_LOG_REGEX);
    if (match) {
      path = match[4];
      status = match[5];
      userAgent = match[7] || line;
    }

    let botMatch: { name: string; vendor: string } | null = null;
    for (const b of AI_BOT_PATTERNS) {
      if (b.regex.test(userAgent)) {
        botMatch = { name: b.name, vendor: b.vendor };
        break;
      }
    }

    if (botMatch) {
      aiHitsCount++;
      if (!botCounts[botMatch.name]) {
        const obj: any = { count: 0, vendor: botMatch.vendor };
        Object.defineProperty(obj, Symbol.toPrimitive, {
          value: () => obj.count,
        });
        obj.valueOf = () => obj.count;
        botCounts[botMatch.name] = obj;
      }
      botCounts[botMatch.name].count++;

      const statusCodeNum = Number.parseInt(status, 10) || status;
      statusCounts[statusCodeNum] = (statusCounts[statusCodeNum] || 0) + 1;
      statusCounts[status] = statusCounts[statusCodeNum];

      pathCounts[path] = (pathCounts[path] || 0) + 1;
      hits.push({ path, status, botMatch, userAgent });
    }
  });

  const botCountsProxy = new Proxy(botCounts, {
    get(target, prop: string) {
      if (typeof prop === 'string' && target[prop]) {
        return target[prop].count;
      }
      return target[prop];
    },
  });

  const topPaths = Object.entries(pathCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalLines: lines.length,
    aiHits: aiHitsCount,
    aiHitsCount,
    botCounts: botCountsProxy,
    statusCounts,
    pathCounts,
    topPaths,
    hits,
    entries: hits,
  };
}
