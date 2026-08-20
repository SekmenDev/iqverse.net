export interface CronPreset {
  label: string;
  expr: string;
}

export const CRON_PRESETS: CronPreset[] = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *' },
  { label: 'Every hour at :00', expr: '0 * * * *' },
  { label: 'Every day at midnight (00:00)', expr: '0 0 * * *' },
  { label: 'Every Monday at 09:00', expr: '0 9 * * 1' },
  { label: 'First day of every month at 00:00', expr: '0 0 1 * *' },
];

export interface CronParts {
  min: string;
  hour: string;
  dom: string;
  mon: string;
  dow: string;
}

export function parseCronToParts(expr: string): CronParts {
  const parts = expr.trim().split(/\s+/);
  return {
    min: parts[0] || '*',
    hour: parts[1] || '*',
    dom: parts[2] || '*',
    mon: parts[3] || '*',
    dow: parts[4] || '*',
  };
}

export function translateCronField(val: string, fieldName: string): string {
  if (val === '*') return `every ${fieldName}`;
  if (val.startsWith('*/')) return `every ${val.slice(2)} ${fieldName}s`;
  return `${fieldName} ${val}`;
}

export function getHumanDescription(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return 'Invalid cron format (must be 5 space-separated parts: minute hour day-of-month month day-of-week)';
  }

  const [min, hour, dom, mon, dow] = parts;

  let timeDesc = '';
  if (min === '*' && hour === '*') {
    timeDesc = 'every minute';
  } else {
    const minDesc = min === '*' ? 'every minute' : (min.startsWith('*/') ? `every ${min.slice(2)} minutes` : `minute ${min}`);
    const hourDesc = hour === '*' ? 'every hour' : (hour.startsWith('*/') ? `every ${hour.slice(2)} hours` : `hour ${hour}`);
    timeDesc = `At ${minDesc}, ${hourDesc}`;
  }

  let dateDesc = '';
  if (dom === '*' && mon === '*' && dow === '*') {
    dateDesc = 'every day';
  } else {
    const details = [];
    if (dom !== '*') details.push(`on day ${dom} of the month`);
    if (mon !== '*') details.push(`in month ${mon}`);
    if (dow !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dNum = Number(dow);
      details.push(`on ${days[dNum] || `day-of-week ${dow}`}`);
    }
    dateDesc = details.join(', ');
  }

  return `${timeDesc}, ${dateDesc}`;
}

export function validateCronExpression(expr: string): boolean {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  const cronPartRegex = /^(\*|\*\/\d+|\d+|\d+-\d+|\d+(,\d+)*)$/;
  return parts.every((p) => cronPartRegex.test(p));
}

export function describeCronExpression(expr: string): string {
  return getHumanDescription(expr);
}

export function calculateCronNextRuns(
  expr: string,
  count: number = 5,
  startDate: Date = new Date()
): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minStr, hourStr] = parts;
  const runs: Date[] = [];
  let current = new Date(startDate.getTime());

  let stepMinutes = 1;
  if (minStr.startsWith('*/')) {
    stepMinutes = parseInt(minStr.slice(2), 10) || 1;
  }

  for (let i = 0; i < count * 1440 && runs.length < count; i++) {
    current = new Date(current.getTime() + stepMinutes * 60 * 1000);
    const m = current.getUTCMinutes();
    const h = current.getUTCHours();

    const minMatch =
      minStr === '*' ||
      (minStr.startsWith('*/') && m % stepMinutes === 0) ||
      Number(minStr) === m;
    const hourMatch =
      hourStr === '*' ||
      (hourStr.startsWith('*/') &&
        h % (parseInt(hourStr.slice(2), 10) || 1) === 0) ||
      Number(hourStr) === h;

    if (minMatch && hourMatch) {
      runs.push(new Date(current.getTime()));
    }
  }

  return runs;
}
