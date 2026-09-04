interface CfProperties {
  asn?: number;
  asOrganization?: string;
  city?: string;
  continent?: string;
  country?: string;
  region?: string;
  regionCode?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  colo?: string;
  httpProtocol?: string;
  tlsVersion?: string;
  tlsCipher?: string;
  clientTcpRtt?: number;
}

type CfRequest = Request & { cf?: CfProperties };

interface EventContext {
  request: CfRequest;
}

type PagesFunction = (context: EventContext) => Promise<Response> | Response;

const PROXY_HEADERS = [
  'via',
  'forwarded',
  'x-forwarded-host',
  'x-real-ip',
  'client-ip',
  'proxy-connection',
  'x-proxy-id',
];

/**
 * Headers echoed back so the visitor can see what every request already sends.
 * Strictly allow-listed: cookies, authorisation and forwarded addresses stay out.
 */
const REPORTABLE_HEADERS = new Set([
  'accept',
  'accept-encoding',
  'accept-language',
  'cache-control',
  'connection',
  'dnt',
  'forwarded',
  'from',
  'pragma',
  'priority',
  'referer',
  'save-data',
  'sec-ch-ua',
  'sec-ch-ua-arch',
  'sec-ch-ua-bitness',
  'sec-ch-ua-full-version-list',
  'sec-ch-ua-mobile',
  'sec-ch-ua-model',
  'sec-ch-ua-platform',
  'sec-ch-ua-platform-version',
  'sec-ch-ua-wow64',
  'sec-fetch-dest',
  'sec-fetch-mode',
  'sec-fetch-site',
  'sec-fetch-user',
  'sec-gpc',
  'te',
  'upgrade-insecure-requests',
  'user-agent',
  'via',
  'x-requested-with',
]);

function ipVersion(ip: string): 'IPv4' | 'IPv6' | 'Unknown' {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return 'IPv4';
  if (ip.includes(':')) return 'IPv6';
  return 'Unknown';
}

export const onRequestGet: PagesFunction = ({ request }) => {
  const cf = request.cf ?? {};
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  const forwardedFor = request.headers.get('x-forwarded-for') ?? '';

  const forwardedHops = forwardedFor
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean).length;

  const proxyHeaders = PROXY_HEADERS.filter(name => request.headers.get(name) !== null);

  const receivedHeaders: Array<{ name: string; value: string }> = [];
  request.headers.forEach((value, name) => {
    if (REPORTABLE_HEADERS.has(name.toLowerCase())) receivedHeaders.push({ name, value });
  });

  return Response.json(
    {
      ip,
      ipVersion: ipVersion(ip),
      asn: cf.asn ?? null,
      organization: cf.asOrganization ?? '',
      city: cf.city ?? '',
      region: cf.region ?? '',
      regionCode: cf.regionCode ?? '',
      country: cf.country ?? '',
      continent: cf.continent ?? '',
      postalCode: cf.postalCode ?? '',
      latitude: cf.latitude ?? '',
      longitude: cf.longitude ?? '',
      timezone: cf.timezone ?? '',
      colo: cf.colo ?? '',
      httpProtocol: cf.httpProtocol ?? '',
      tlsVersion: cf.tlsVersion ?? '',
      tlsCipher: cf.tlsCipher ?? '',
      clientTcpRtt: cf.clientTcpRtt ?? null,
      torExit: cf.country === 'T1',
      forwardedHops,
      proxyHeaders,
      receivedHeaders,
    },
    {
      headers: {
        'cache-control': 'no-store',
      },
    }
  );
};
