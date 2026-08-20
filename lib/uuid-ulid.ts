export const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export interface IdGeneratorOptions {
  type: 'uuid' | 'ulid';
  count: number;
  uppercase?: boolean;
  removeHyphens?: boolean;
  braces?: boolean;
}

export function generateRandomBytes(count: number): Uint8Array {
  const bytes = new Uint8Array(count);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < count; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}

export function generateUuidV4(): string {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  const bytes = generateRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xx
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function generateUlid(now: number = Date.now()): string {
  let timeStr = '';
  let time = now;
  for (let i = 9; i >= 0; i--) {
    const mod = time % 32;
    timeStr = CROCKFORD_BASE32[mod] + timeStr;
    time = Math.floor(time / 32);
  }

  const randBytes = generateRandomBytes(10);
  let randStr = '';
  for (let i = 0; i < 16; i++) {
    const charIndex = randBytes[i % 10] % 32;
    randStr += CROCKFORD_BASE32[charIndex];
  }
  return timeStr.padStart(10, '0') + randStr;
}

export function decodeUlidTimestamp(ulid: string): string | null {
  const clean = ulid.trim().toUpperCase();
  if (clean.length < 10) return null;
  const timePart = clean.slice(0, 10);
  let timestamp = 0;
  for (let i = 0; i < 10; i++) {
    const char = timePart[i];
    const val = CROCKFORD_BASE32.indexOf(char);
    if (val === -1) return null;
    timestamp = timestamp * 32 + val;
  }
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function generateIdBatch(options: IdGeneratorOptions): string[] {
  const count = Math.max(1, Math.min(options.count || 5, 500));
  const list: string[] = [];

  for (let i = 0; i < count; i++) {
    let id = options.type === 'uuid' ? generateUuidV4() : generateUlid();
    if (options.type === 'uuid' && options.removeHyphens) {
      id = id.replace(/-/g, '');
    }
    if (options.uppercase) {
      id = id.toUpperCase();
    } else if (options.type === 'uuid') {
      id = id.toLowerCase();
    }
    if (options.braces) {
      id = `{${id}}`;
    }
    list.push(id);
  }

  return list;
}

export const generateBatchIds = generateIdBatch;
