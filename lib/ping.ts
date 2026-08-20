export interface TracerouteHop {
  hop: number;
  host: string;
  ip: string;
  rtt1: number;
  rtt2: number;
  rtt3: number;
}

export interface PingStatsSummary {
  count: number;
  min: number;
  max: number;
  avg: number;
}

export function calculatePingStats(latencies: number[]): PingStatsSummary {
  if (latencies.length === 0) {
    return { count: 0, min: 0, max: 0, avg: 0 };
  }

  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  const sum = latencies.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / latencies.length);

  return {
    count: latencies.length,
    min,
    max,
    avg,
  };
}

export const SAMPLE_HOPS: TracerouteHop[] = [
  { hop: 1, host: 'gateway.local', ip: '192.168.1.1', rtt1: 1.2, rtt2: 1.1, rtt3: 1.4 },
  { hop: 2, host: 'isp-core-node-1.net', ip: '10.240.0.1', rtt1: 4.8, rtt2: 5.1, rtt3: 4.6 },
  { hop: 3, host: 'backbone-transit.net', ip: '172.16.84.12', rtt1: 11.2, rtt2: 10.9, rtt3: 11.5 },
  { hop: 4, host: 'eqix-sjo-google.com', ip: '142.250.214.34', rtt1: 14.1, rtt2: 13.8, rtt3: 14.5 },
  { hop: 5, host: 'one.one.one.one', ip: '1.1.1.1', rtt1: 15.2, rtt2: 15.0, rtt3: 15.4 },
];
