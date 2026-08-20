import { describe, it, expect } from 'vitest';
import { formatTtl, escapeHtml, groupDnsAnswers } from '@/lib/dns';

describe('DNS Engine (lib/dns)', () => {
  it('formats TTL seconds to readable units', () => {
    expect(formatTtl(30)).toBe('30s');
    expect(formatTtl(300)).toBe('300s (5m)');
    expect(formatTtl(7200)).toBe('7200s (2h)');
  });

  it('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('groups DNS answers by record type', () => {
    const responses = [
      {
        type: 'A',
        data: {
          Status: 0,
          Answer: [
            { name: 'iqverse.net', type: 1, TTL: 300, data: '1.2.3.4' },
            { name: 'iqverse.net', type: 1, TTL: 300, data: '1.2.3.5' },
          ],
        },
      },
      {
        type: 'MX',
        data: {
          Status: 0,
          Answer: [
            { name: 'iqverse.net', type: 15, TTL: 3600, data: '10 mail.iqverse.net' },
          ],
        },
      },
      {
        type: 'TXT',
        data: null,
      },
    ];

    const { groups, totalCount } = groupDnsAnswers(responses);
    expect(totalCount).toBe(3);
    expect(groups).toHaveLength(2);
    expect(groups[0].type).toBe('A');
    expect(groups[0].answers).toHaveLength(2);
    expect(groups[1].type).toBe('MX');
    expect(groups[1].answers).toHaveLength(1);
  });
});
