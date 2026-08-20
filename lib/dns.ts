export interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export interface DnsResponse {
  Status: number;
  TC?: boolean;
  RD?: boolean;
  RA?: boolean;
  AD?: boolean;
  CD?: boolean;
  Question?: { name: string; type: number }[];
  Answer?: DnsAnswer[];
  Authority?: DnsAnswer[];
  Additional?: DnsAnswer[];
  Comment?: string;
}

export interface GroupedDnsRecord {
  type: string;
  answers: DnsAnswer[];
}

export type GroupedRecord = GroupedDnsRecord;

export const DNS_TYPE_MAP: Record<number, string> = {
  1: 'A',
  28: 'AAAA',
  15: 'MX',
  16: 'TXT',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  257: 'CAA',
  12: 'PTR',
  33: 'SRV',
};

export function dnsTypeIdToString(typeId: number): string {
  return DNS_TYPE_MAP[typeId] || `TYPE${typeId}`;
}

export function formatTtl(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${seconds}s (${Math.floor(seconds / 60)}m)`;
  const hours = Math.floor(seconds / 3600);
  const remainderMinutes = Math.floor((seconds % 3600) / 60);
  if (remainderMinutes === 0) return `${seconds}s (${hours}h)`;
  return `${seconds}s (${hours}h ${remainderMinutes}m)`;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function groupDnsAnswers(
  input: DnsAnswer[] | { type: string; data: DnsResponse | null }[]
): { groups: GroupedDnsRecord[]; totalCount: number } {
  if (Array.isArray(input) && input.length > 0 && 'type' in input[0] && 'data' in input[0]) {
    const responses = input as { type: string; data: DnsResponse | null }[];
    const groups: GroupedDnsRecord[] = [];
    let totalCount = 0;

    responses.forEach(({ type, data }) => {
      const answers = data?.Answer || [];
      if (answers.length > 0) {
        groups.push({ type, answers });
        totalCount += answers.length;
      }
    });

    return { groups, totalCount };
  }

  const answers = input as DnsAnswer[];
  const recordMap: Record<string, DnsAnswer[]> = {};

  answers.forEach((ans) => {
    const typeStr = dnsTypeIdToString(ans.type);
    if (!recordMap[typeStr]) recordMap[typeStr] = [];
    recordMap[typeStr].push(ans);
  });

  const groups = Object.entries(recordMap).map(([type, groupAnswers]) => ({
    type,
    answers: groupAnswers,
  }));

  return {
    groups,
    totalCount: answers.length,
  };
}
