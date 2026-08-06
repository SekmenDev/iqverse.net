import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IpLookup from '@/components/tools/IpLookup';

describe('IpLookup Component', () => {
  it('renders IP search input and lookup buttons', () => {
    render(<IpLookup />);
    expect(screen.getByLabelText(/Enter IPv4 or IPv6 Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lookup IP/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /My Current IP/i })).toBeInTheDocument();
  });

  it('triggers IP lookup when clicking Lookup IP button', () => {
    render(<IpLookup />);
    const btn = screen.getByRole('button', { name: /Lookup IP/i });
    fireEvent.click(btn);
    expect(screen.getByText(/Query Address/i)).toBeInTheDocument();
  });
});
