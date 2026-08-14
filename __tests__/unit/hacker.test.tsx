import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Hacker Security Honeypot Redirects Configuration', () => {
  it('validates public/_redirects file structure and honeypot rules', () => {
    const redirectsPath = path.join(process.cwd(), 'public', '_redirects');
    expect(fs.existsSync(redirectsPath)).toBe(true);

    const content = fs.readFileSync(redirectsPath, 'utf-8');
    expect(content).toContain('/wp-admin/*          /hacker/ 302');
    expect(content).toContain('/wp-login.php        /hacker/ 302');
    expect(content).toContain('/administrator       /hacker/ 302');
    expect(content).toContain('/admin               /hacker/ 302');
    expect(content).toContain('/.env                /hacker/ 302');
    expect(content).toContain('/db.sql              /hacker/ 302');
    expect(content).toContain('/shell.php           /hacker/ 302');
  });
});
