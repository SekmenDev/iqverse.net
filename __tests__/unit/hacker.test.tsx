import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TerminalClient from '@/app/hacker/TerminalClient';
import fs from 'fs';
import path from 'path';

describe('Hacker Security Check Page & TerminalClient', () => {
  it('renders security terminal header and alert logs correctly', () => {
    render(<TerminalClient />);

    expect(screen.getByText(/SEC_AUDIT_V3.9 \/\/ INTRUSION_DETECTION_ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/SEKMEN.DEV SECURITY/i)).toBeInTheDocument();
    expect(screen.getByText(/SECURITY ALERT:/i)).toBeInTheDocument();
    expect(screen.getByText(/HTTP 403 ACCESS DENIED/i)).toBeInTheDocument();
  });

  it('provides required action links to services, contact, tools, and headers', () => {
    render(<TerminalClient />);

    const servicesBtn = screen.getByRole('link', { name: /View WordPress Services/i });
    expect(servicesBtn).toHaveAttribute('href', 'https://sekmen.dev/wordpress/');

    const contactBtn = screen.getByRole('link', { name: /Contact Security Team/i });
    expect(contactBtn).toHaveAttribute('href', 'https://sekmen.dev/contact/');

    const exploreToolsBtn = screen.getByRole('link', { name: /Explore IQVerse Tools/i });
    expect(exploreToolsBtn).toHaveAttribute('href', '/');

    const headersBtn = screen.getByRole('link', { name: /Scan Site Headers/i });
    expect(headersBtn.getAttribute('href')).toMatch(/^\/headers\/?$/);
  });

  it('handles interactive terminal commands such as help, scan, and whoami', () => {
    render(<TerminalClient />);

    const input = screen.getByLabelText(/Terminal command input/i);

    // Test 'help' command
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.submit(input);
    expect(screen.getByText(/Available commands:/i)).toBeInTheDocument();

    // Test 'scan' command
    fireEvent.change(input, { target: { value: 'scan' } });
    fireEvent.submit(input);
    expect(screen.getByText(/Checking target/i)).toBeInTheDocument();

    // Test 'whoami' command
    fireEvent.change(input, { target: { value: 'whoami' } });
    fireEvent.submit(input);
    expect(screen.getByText(/User-Agent:/i)).toBeInTheDocument();
  });

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
