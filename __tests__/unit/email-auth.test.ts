import { describe, it, expect } from 'vitest';
import {
  detectRecordKind,
  dkimLookupName,
  dmarcLookupName,
  estimateKeyBits,
  parseDkim,
  parseDmarc,
  parseEmailAuthRecord,
  parseSpf,
  type Finding,
} from '@/lib/email-auth';

const messages = (findings: Finding[]) => findings.map(f => f.message).join(' | ');
const hasError = (findings: Finding[]) => findings.some(f => f.severity === 'error');

describe('Email Auth (lib/email-auth) - detectRecordKind', () => {
  it('recognises each record type', () => {
    expect(detectRecordKind('v=spf1 -all')).toBe('spf');
    expect(detectRecordKind('v=DMARC1; p=reject')).toBe('dmarc');
    expect(detectRecordKind('v=DKIM1; k=rsa; p=MIGf')).toBe('dkim');
    expect(detectRecordKind('some random text')).toBe('unknown');
  });

  it('ignores surrounding quotes and split TXT strings', () => {
    expect(detectRecordKind('"v=spf1 -all"')).toBe('spf');
    expect(detectRecordKind('"v=spf1 include:_spf.example.com" " -all"')).toBe('spf');
  });
});

describe('Email Auth (lib/email-auth) - parseSpf', () => {
  it('parses mechanisms with their qualifiers', () => {
    const result = parseSpf('v=spf1 include:_spf.google.com ip4:192.0.2.0/24 ~all');

    expect(result.mechanisms).toHaveLength(3);
    expect(result.mechanisms[0]).toEqual({
      qualifier: '+',
      type: 'include',
      value: '_spf.google.com',
      causesLookup: true,
    });
    expect(result.mechanisms[1].type).toBe('ip4');
    expect(result.mechanisms[1].causesLookup).toBe(false);
    expect(result.allQualifier).toBe('~');
  });

  it('counts only mechanisms that trigger a DNS lookup', () => {
    const result = parseSpf('v=spf1 a mx include:one.com ip4:1.2.3.4 ip6:::1 -all');
    expect(result.lookupCount).toBe(3);
  });

  it('flags exceeding the 10 lookup limit', () => {
    const includes = Array.from({ length: 11 }, (_, i) => `include:host${i}.com`).join(' ');
    const result = parseSpf(`v=spf1 ${includes} -all`);

    expect(result.lookupCount).toBe(11);
    expect(hasError(result.findings)).toBe(true);
    expect(messages(result.findings)).toContain('permerror');
  });

  it('warns when approaching the lookup limit', () => {
    const includes = Array.from({ length: 8 }, (_, i) => `include:host${i}.com`).join(' ');
    const result = parseSpf(`v=spf1 ${includes} -all`);

    expect(hasError(result.findings)).toBe(false);
    expect(messages(result.findings)).toContain('8 of 10 DNS lookups');
  });

  it('rejects +all as unsafe', () => {
    const result = parseSpf('v=spf1 +all');
    expect(hasError(result.findings)).toBe(true);
    expect(messages(result.findings)).toContain('any host');
  });

  it('warns about a neutral or missing all mechanism', () => {
    expect(messages(parseSpf('v=spf1 ?all').findings)).toContain('neutral');
    expect(messages(parseSpf('v=spf1 include:one.com').findings)).toContain('No "all" mechanism');
  });

  it('warns about the deprecated ptr mechanism', () => {
    expect(messages(parseSpf('v=spf1 ptr -all').findings)).toContain('deprecated');
  });

  it('errors when the version prefix is missing', () => {
    expect(hasError(parseSpf('include:one.com -all').findings)).toBe(true);
  });

  it('reports a clean record', () => {
    const result = parseSpf('v=spf1 include:_spf.google.com -all');
    expect(hasError(result.findings)).toBe(false);
    expect(result.findings[0].severity).toBe('info');
  });
});

describe('Email Auth (lib/email-auth) - parseDmarc', () => {
  it('reads the policy tags', () => {
    const result = parseDmarc('v=DMARC1; p=reject; sp=quarantine; pct=100; rua=mailto:a@b.com');

    expect(result.policy).toBe('reject');
    expect(result.subdomainPolicy).toBe('quarantine');
    expect(result.percentage).toBe(100);
    expect(result.reportUris).toEqual(['mailto:a@b.com']);
    expect(hasError(result.findings)).toBe(false);
  });

  it('splits multiple report addresses', () => {
    const result = parseDmarc('v=DMARC1; p=none; rua=mailto:a@b.com,mailto:c@d.com; ruf=mailto:f@g.com');
    expect(result.reportUris).toHaveLength(2);
    expect(result.forensicUris).toEqual(['mailto:f@g.com']);
  });

  it('defaults pct to 100 when absent', () => {
    expect(parseDmarc('v=DMARC1; p=reject; rua=mailto:a@b.com').percentage).toBe(100);
  });

  it('warns about monitoring-only and partial policies', () => {
    expect(messages(parseDmarc('v=DMARC1; p=none; rua=mailto:a@b.com').findings)).toContain('only monitors');
    expect(messages(parseDmarc('v=DMARC1; p=reject; pct=50; rua=mailto:a@b.com').findings)).toContain('50%');
  });

  it('errors on a missing or invalid policy', () => {
    expect(hasError(parseDmarc('v=DMARC1; rua=mailto:a@b.com').findings)).toBe(true);
    expect(hasError(parseDmarc('v=DMARC1; p=block').findings)).toBe(true);
  });

  it('errors on an invalid pct and alignment mode', () => {
    expect(hasError(parseDmarc('v=DMARC1; p=reject; pct=150').findings)).toBe(true);
    expect(hasError(parseDmarc('v=DMARC1; p=reject; adkim=x; rua=mailto:a@b.com').findings)).toBe(true);
  });

  it('warns when aggregate reporting is not configured', () => {
    expect(messages(parseDmarc('v=DMARC1; p=reject').findings)).toContain('aggregate reports');
  });

  it('errors when the version prefix is wrong', () => {
    expect(hasError(parseDmarc('v=DMARC2; p=reject').findings)).toBe(true);
  });
});

describe('Email Auth (lib/email-auth) - parseDkim', () => {
  const rsa2048 = 'A'.repeat(392);

  it('reads key type, flags and public key', () => {
    const result = parseDkim(`v=DKIM1; k=rsa; t=y:s; p=${rsa2048}`);

    expect(result.keyType).toBe('rsa');
    expect(result.flags).toEqual(['y', 's']);
    expect(result.publicKey).toBe(rsa2048);
  });

  it('defaults the key type to rsa', () => {
    expect(parseDkim(`v=DKIM1; p=${rsa2048}`).keyType).toBe('rsa');
  });

  it('estimates the RSA modulus size', () => {
    expect(parseDkim(`v=DKIM1; k=rsa; p=${rsa2048}`).keyBits).toBe(2048);
  });

  it('reports ed25519 keys as 256 bits', () => {
    expect(parseDkim('v=DKIM1; k=ed25519; p=11qYAYKxCrfVS/7TyWQHOg7hcvPapiMlrwIaaPcHURo=').keyBits).toBe(256);
  });

  it('errors on a missing public key and warns on a revoked one', () => {
    expect(hasError(parseDkim('v=DKIM1; k=rsa').findings)).toBe(true);
    expect(messages(parseDkim('v=DKIM1; k=rsa; p=').findings)).toContain('revokes');
  });

  it('errors on a non-base64 public key', () => {
    expect(hasError(parseDkim('v=DKIM1; k=rsa; p=not valid!!!').findings)).toBe(true);
  });

  it('flags weak RSA keys', () => {
    expect(hasError(parseDkim(`v=DKIM1; k=rsa; p=${'A'.repeat(128)}`).findings)).toBe(true);
    expect(messages(parseDkim(`v=DKIM1; k=rsa; p=${'A'.repeat(216)}`).findings)).toContain('1024-bit');
  });

  it('warns about testing mode', () => {
    expect(messages(parseDkim(`v=DKIM1; k=rsa; t=y; p=${rsa2048}`).findings)).toContain('testing');
  });

  it('errors on an unsupported key type', () => {
    expect(hasError(parseDkim(`v=DKIM1; k=dsa; p=${rsa2048}`).findings)).toBe(true);
  });
});

describe('Email Auth (lib/email-auth) - helpers', () => {
  it('returns null when estimating an empty key', () => {
    expect(estimateKeyBits('')).toBeNull();
    expect(estimateKeyBits('   ')).toBeNull();
  });

  it('builds DMARC and DKIM lookup names', () => {
    expect(dmarcLookupName('example.com')).toBe('_dmarc.example.com');
    expect(dmarcLookupName('  example.com. ')).toBe('_dmarc.example.com');
    expect(dkimLookupName('example.com', 'google')).toBe('google._domainkey.example.com');
  });

  it('routes each record to the right parser', () => {
    expect(parseEmailAuthRecord('v=spf1 -all').kind).toBe('spf');
    expect(parseEmailAuthRecord('v=DMARC1; p=reject').kind).toBe('dmarc');
    expect(parseEmailAuthRecord('v=DKIM1; p=AAAA').kind).toBe('dkim');

    const unknown = parseEmailAuthRecord('hello world');
    expect(unknown.kind).toBe('unknown');
    expect(hasError(unknown.findings)).toBe(true);
  });
});
