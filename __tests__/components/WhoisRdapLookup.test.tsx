import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WhoisRdapLookup from '@/components/tools/WhoisRdapLookup';

describe('WhoisRdapLookup Component', () => {
  it('renders domain input and lookup button', () => {
    render(<WhoisRdapLookup />);
    expect(screen.getByLabelText(/Domain Name \(WHOIS \/ RDAP\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lookup Domain Metadata/i })).toBeInTheDocument();
  });

  it('triggers domain lookup when clicking button', () => {
    render(<WhoisRdapLookup />);
    const btn = screen.getByRole('button', { name: /Lookup Domain Metadata/i });
    fireEvent.click(btn);
    expect(screen.getByText(/Target Domain/i)).toBeInTheDocument();
  });
});
