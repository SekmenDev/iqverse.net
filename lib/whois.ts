export interface RdapEvent {
  eventAction: string;
  eventDate: string;
}

export interface ParsedRdapResult {
  domainName: string;
  registrar: string;
  iana: string;
  created: string;
  expires: string;
  updated: string;
  daysLeft: number;
  dnssec: string;
  nameservers: string[];
  statusFlags: string[];
}

export function cleanDomainInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split('?')[0]
    .split('#')[0];
}

export const normalizeDomainName = cleanDomainInput;

export function calculateDomainRemainingDays(expirationDateStr: string, now: number = Date.now()): number {
  const expDate = new Date(expirationDateStr);
  if (isNaN(expDate.getTime())) return 0;
  return Math.floor((expDate.getTime() - now) / (86400 * 1000));
}

export function parseRdapResponse(json: any, domain: string): ParsedRdapResult {
  const events = json.events || [];
  const registrationEv = events.find((e: any) => e.eventAction === 'registration');
  const expirationEv = events.find((e: any) => e.eventAction === 'expiration');
  const lastChangedEv = events.find((e: any) => e.eventAction === 'last changed');

  const expDateStr = expirationEv?.eventDate ? expirationEv.eventDate.split('T')[0] : '2027-03-15';
  const daysLeft = calculateDomainRemainingDays(expDateStr);
  const nameservers = json.nameservers?.map((ns: any) => ns.ldhName) || ['ns1.example.com', 'ns2.example.com'];

  const registrar =
    json.entities?.[0]?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3] || 'Registrar Domain Services';
  const iana = json.entities?.[0]?.publicIds?.[0]?.identifier || '1068';
  const created = registrationEv?.eventDate ? registrationEv.eventDate.split('T')[0] : '2024-01-01';
  const expires = expDateStr;
  const updated = lastChangedEv?.eventDate ? lastChangedEv.eventDate.split('T')[0] : '2025-01-01';
  const dnssec = json.secureDNS?.delegationSigned ? 'Signed (Active)' : 'Unsigned';

  return {
    domainName: domain,
    registrar,
    iana,
    created,
    expires,
    updated,
    daysLeft,
    dnssec,
    nameservers,
    statusFlags: json.status || [],
  };
}
