export const VISIT_STORAGE_KEY = 'iqverse.fingerprint.visits';

/** How many superseded fingerprint IDs to keep, newest first. */
export const PREVIOUS_ID_LIMIT = 5;

export interface VisitRecord {
  fingerprintId: string;
  firstSeen: string;
  lastSeen: string;
  visits: number;
  previousIds: string[];
}

export function parseVisitRecord(raw: string | null): VisitRecord | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const record = parsed as Record<string, unknown>;
    if (typeof record.fingerprintId !== 'string' || record.fingerprintId.length === 0) return null;
    if (typeof record.firstSeen !== 'string' || typeof record.lastSeen !== 'string') return null;
    if (typeof record.visits !== 'number' || !Number.isFinite(record.visits)) return null;

    return {
      fingerprintId: record.fingerprintId,
      firstSeen: record.firstSeen,
      lastSeen: record.lastSeen,
      visits: Math.max(1, Math.floor(record.visits)),
      previousIds: Array.isArray(record.previousIds)
        ? record.previousIds.filter((entry): entry is string => typeof entry === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

export function updateVisitRecord(
  existing: VisitRecord | null,
  fingerprintId: string,
  now: Date
): VisitRecord {
  const timestamp = now.toISOString();

  if (!existing) {
    return {
      fingerprintId,
      firstSeen: timestamp,
      lastSeen: timestamp,
      visits: 1,
      previousIds: [],
    };
  }

  const changed = existing.fingerprintId !== fingerprintId;

  return {
    fingerprintId,
    firstSeen: existing.firstSeen,
    lastSeen: timestamp,
    visits: existing.visits + 1,
    previousIds: changed
      ? [existing.fingerprintId, ...existing.previousIds].slice(0, PREVIOUS_ID_LIMIT)
      : existing.previousIds,
  };
}

export function formatElapsed(fromIso: string, now: Date): string {
  const from = new Date(fromIso).getTime();
  if (Number.isNaN(from)) return 'an unknown time ago';

  const seconds = Math.max(0, Math.round((now.getTime() - from) / 1000));
  if (seconds < 60) return 'moments ago';

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

export function describeVisitRecord(record: VisitRecord, now: Date): string {
  if (record.visits <= 1) {
    return 'First time here. This page just stored your fingerprint ID locally so it can recognise the browser on your next visit.';
  }

  const opener = `This browser has been recognised ${record.visits} times since ${formatElapsed(record.firstSeen, now)}.`;

  if (record.previousIds.length === 0) {
    return `${opener} The fingerprint has not changed once. Any site doing this could link every one of those visits without a cookie.`;
  }

  return `${opener} The fingerprint changed ${record.previousIds.length} time${record.previousIds.length === 1 ? '' : 's'}, so something about your browser or hardware shifted. Sites work around that by matching on the signals that stayed put.`;
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadVisitRecord(): VisitRecord | null {
  try {
    return parseVisitRecord(storage()?.getItem(VISIT_STORAGE_KEY) ?? null);
  } catch {
    return null;
  }
}

export function saveVisitRecord(record: VisitRecord): void {
  try {
    storage()?.setItem(VISIT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* private window or blocked storage */
  }
}

export function clearVisitRecord(): void {
  try {
    storage()?.removeItem(VISIT_STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}
