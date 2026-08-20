import { describe, it, expect } from 'vitest';
import { cleanDomainInput, parseRdapResponse } from '@/lib/whois';

describe('WHOIS / RDAP Engine (lib/whois)', () => {
  it('cleans domain inputs from protocol and path clutter', () => {
    expect(cleanDomainInput('https://iqverse.net/tools')).toBe('iqverse.net');
    expect(cleanDomainInput('HTTP://WWW.EXAMPLE.COM/path?query=1')).toBe('www.example.com');
  });

  it('parses RDAP JSON events and status', () => {
    const mockRdap = {
      events: [
        { eventAction: 'registration', eventDate: '2020-01-15T00:00:00Z' },
        { eventAction: 'expiration', eventDate: '2030-01-15T00:00:00Z' },
        { eventAction: 'last changed', eventDate: '2024-01-15T00:00:00Z' },
      ],
      nameservers: [{ ldhName: 'ns1.cloudflare.com' }, { ldhName: 'ns2.cloudflare.com' }],
      status: ['active', 'clientTransferProhibited'],
      secureDNS: { delegationSigned: true },
      entities: [
        {
          vcardArray: [
            'vcard',
            [
              ['fn', {}, 'text', 'Cloudflare, Inc.'],
            ],
          ],
          publicIds: [{ identifier: '1910' }],
        },
      ],
    };

    const parsed = parseRdapResponse(mockRdap, 'iqverse.net');
    expect(parsed.domainName).toBe('iqverse.net');
    expect(parsed.created).toBe('2020-01-15');
    expect(parsed.expires).toBe('2030-01-15');
    expect(parsed.daysLeft).toBeGreaterThan(100);
    expect(parsed.registrar).toBe('Cloudflare, Inc.');
    expect(parsed.iana).toBe('1910');
    expect(parsed.dnssec).toBe('Signed (Active)');
    expect(parsed.nameservers).toEqual(['ns1.cloudflare.com', 'ns2.cloudflare.com']);
  });
});
