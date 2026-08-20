import { describe, it, expect } from 'vitest';
import { HTTP_STATUS_CODES, filterHttpStatusCodes } from '@/lib/http-status';

describe('HTTP Status Engine (lib/http-status)', () => {
  it('contains standard HTTP status codes', () => {
    expect(HTTP_STATUS_CODES.length).toBeGreaterThan(30);
    const notFound = HTTP_STATUS_CODES.find((c) => c.code === 404);
    expect(notFound?.phrase).toBe('Not Found');
    expect(notFound?.category).toBe('4xx');
  });

  it('filters status codes by category and search keyword', () => {
    const serverErrors = filterHttpStatusCodes(HTTP_STATUS_CODES, '5xx', '');
    expect(serverErrors.every((c) => c.category === '5xx')).toBe(true);

    const teapot = filterHttpStatusCodes(HTTP_STATUS_CODES, 'all', 'teapot');
    expect(teapot).toHaveLength(1);
    expect(teapot[0].code).toBe(418);
  });
});
