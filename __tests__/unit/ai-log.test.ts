import { describe, it, expect } from 'vitest';
import { parseAccessLogs } from '@/lib/ai-log';

describe('AI Log Analyzer Engine (lib/ai-log)', () => {
  it('parses Combined / Common log format entries for AI crawlers', () => {
    const rawLogs = `
192.168.1.10 - - [20/Aug/2026:10:00:00 +0000] "GET /docs HTTP/1.1" 200 4500 "-" "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)"
10.0.0.5 - - [20/Aug/2026:10:01:00 +0000] "GET /llms.txt HTTP/1.1" 200 1200 "-" "ClaudeBot/1.0; +https://www.anthropic.com/claudebot"
172.16.0.1 - - [20/Aug/2026:10:02:00 +0000] "GET /pricing HTTP/1.1" 404 350 "-" "Mozilla/5.0 Chrome/120.0"
`;

    const result = parseAccessLogs(rawLogs);
    expect(result.totalLines).toBe(3);
    expect(result.aiHits).toBe(2);
    expect(result.botCounts['GPTBot']).toBe(1);
    expect(result.botCounts['ClaudeBot']).toBe(1);
    expect(result.statusCounts[200]).toBe(2);
  });

  it('handles empty log input gracefully', () => {
    const result = parseAccessLogs('');
    expect(result.totalLines).toBe(0);
    expect(result.aiHits).toBe(0);
    expect(result.entries).toHaveLength(0);
  });
});
