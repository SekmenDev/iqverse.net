import { arrayBufferToBase64 } from './hashing';

export const SRI_ALGORITHMS = ['sha256', 'sha384', 'sha512'] as const;

export type SriAlgorithm = (typeof SRI_ALGORITHMS)[number];

export interface IntegrityHash {
  algorithm: SriAlgorithm;
  base64: string;
}

export type ResourceKind = 'script' | 'style' | 'unknown';

const SUBTLE_NAMES: Record<SriAlgorithm, string> = {
  sha256: 'SHA-256',
  sha384: 'SHA-384',
  sha512: 'SHA-512',
};

// Base64 length for each digest, including padding
const DIGEST_LENGTHS: Record<SriAlgorithm, number> = {
  sha256: 44,
  sha384: 64,
  sha512: 88,
};

export function isSriAlgorithm(value: string): value is SriAlgorithm {
  return (SRI_ALGORITHMS as readonly string[]).includes(value);
}

export async function computeIntegrity(
  data: ArrayBuffer | Uint8Array | string,
  algorithm: SriAlgorithm = 'sha384'
): Promise<string> {
  if (typeof globalThis.crypto?.subtle === 'undefined') {
    throw new Error('Web Crypto API is not available');
  }

  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const buffer = await globalThis.crypto.subtle.digest(
    SUBTLE_NAMES[algorithm],
    bytes instanceof Uint8Array ? (bytes.slice().buffer as ArrayBuffer) : bytes
  );

  return `${algorithm}-${arrayBufferToBase64(buffer)}`;
}

export async function computeAllIntegrity(
  data: ArrayBuffer | Uint8Array | string
): Promise<Record<SriAlgorithm, string>> {
  const entries = await Promise.all(
    SRI_ALGORITHMS.map(async algorithm => [algorithm, await computeIntegrity(data, algorithm)] as const)
  );

  return Object.fromEntries(entries) as Record<SriAlgorithm, string>;
}

export function parseIntegrity(value: string): IntegrityHash[] {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(token => {
      const index = token.indexOf('-');
      if (index === -1) return null;

      const algorithm = token.slice(0, index).toLowerCase();
      const base64 = token.slice(index + 1);
      if (!isSriAlgorithm(algorithm)) return null;
      if (base64.length !== DIGEST_LENGTHS[algorithm]) return null;
      if (!/^[A-Za-z0-9+/]+=*$/.test(base64)) return null;

      return { algorithm, base64 };
    })
    .filter((entry): entry is IntegrityHash => entry !== null);
}

export function isValidIntegrity(value: string): boolean {
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 && parseIntegrity(value).length === tokens.length;
}

export function detectResourceKind(url: string): ResourceKind {
  const path = url.split(/[?#]/)[0].toLowerCase();
  if (path.endsWith('.js') || path.endsWith('.mjs')) return 'script';
  if (path.endsWith('.css')) return 'style';
  return 'unknown';
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function isCrossOrigin(url: string, pageOrigin: string): boolean {
  try {
    return new URL(url, pageOrigin).origin !== new URL(pageOrigin).origin;
  } catch {
    return false;
  }
}

export function buildTag(
  url: string,
  integrity: string,
  kind: ResourceKind = detectResourceKind(url),
  crossorigin: string = 'anonymous'
): string {
  const safeUrl = escapeAttribute(url);
  const safeIntegrity = escapeAttribute(integrity);
  const safeCrossOrigin = escapeAttribute(crossorigin);

  if (kind === 'style') {
    return `<link rel="stylesheet" href="${safeUrl}" integrity="${safeIntegrity}" crossorigin="${safeCrossOrigin}">`;
  }

  return `<script src="${safeUrl}" integrity="${safeIntegrity}" crossorigin="${safeCrossOrigin}"></script>`;
}
