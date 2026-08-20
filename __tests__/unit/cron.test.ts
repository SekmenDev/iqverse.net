import { describe, it, expect } from 'vitest';
import { describeCronExpression, calculateCronNextRuns, validateCronExpression } from '@/lib/cron';

describe('Cron Engine (lib/cron)', () => {
  it('validates 5-part cron expressions', () => {
    expect(validateCronExpression('0 0 * * *')).toBe(true);
    expect(validateCronExpression('*/15 0 1,15 * 1-5')).toBe(true);
    expect(validateCronExpression('invalid cron text')).toBe(false);
    expect(validateCronExpression('0 0 * *')).toBe(false);
  });

  it('describes cron expressions in clear human language', () => {
    const desc = describeCronExpression('0 0 * * *');
    expect(desc).toContain('minute 0');
    expect(desc).toContain('hour 0');

    const descStar = describeCronExpression('* * * * *');
    expect(descStar).toContain('every minute');
  });

  it('calculates future cron run schedules', () => {
    const baseTime = new Date('2026-08-20T12:00:00Z');
    const runs = calculateCronNextRuns('0 * * * *', 3, baseTime);
    expect(runs).toHaveLength(3);
    expect(runs[0].toISOString()).toBe('2026-08-20T13:00:00.000Z');
    expect(runs[1].toISOString()).toBe('2026-08-20T14:00:00.000Z');
    expect(runs[2].toISOString()).toBe('2026-08-20T15:00:00.000Z');
  });
});
