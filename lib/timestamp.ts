export interface ParsedTimestampResult {
  valid: boolean;
  iso: string;
  utc: string;
  relative: string;
  epochSeconds: number;
  epochMilliseconds: number;
}

export function getRelativeTimeString(date: Date, currentTimeSec: number = Math.floor(Date.now() / 1000)): string {
  const deltaSec = currentTimeSec - Math.floor(date.getTime() / 1000);
  if (Math.abs(deltaSec) < 60) return `${deltaSec >= 0 ? deltaSec : -deltaSec} seconds ${deltaSec >= 0 ? 'ago' : 'from now'}`;
  const min = Math.floor(Math.abs(deltaSec) / 60);
  if (min < 60) return `${min} minutes ${deltaSec >= 0 ? 'ago' : 'from now'}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hours ${deltaSec >= 0 ? 'ago' : 'from now'}`;
  const days = Math.floor(hr / 24);
  return `${days} days ${deltaSec >= 0 ? 'ago' : 'from now'}`;
}

export function parseEpochTimestamp(
  rawInput: string | number,
  currentTimeSec: number = Math.floor(Date.now() / 1000)
): ParsedTimestampResult | null {
  const num = Number(rawInput);
  if (Number.isNaN(num) || String(rawInput).trim() === '') {
    return null;
  }

  const isMs = num > 30000000000;
  const dateObj = new Date(isMs ? num : num * 1000);

  if (Number.isNaN(dateObj.getTime())) {
    return null;
  }

  return {
    valid: true,
    iso: dateObj.toISOString(),
    utc: dateObj.toUTCString(),
    relative: getRelativeTimeString(dateObj, currentTimeSec),
    epochSeconds: Math.floor(dateObj.getTime() / 1000),
    epochMilliseconds: dateObj.getTime(),
  };
}

export const parseTimestamp = parseEpochTimestamp;

export function convertDateToEpoch(dateInput: string | Date): {
  seconds: number;
  sec: number;
  milliseconds: number;
  ms: number;
} | null {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return null;

  const seconds = Math.floor(date.getTime() / 1000);
  const milliseconds = date.getTime();

  return {
    seconds,
    sec: seconds,
    milliseconds,
    ms: milliseconds,
  };
}
