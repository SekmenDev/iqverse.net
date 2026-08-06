import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CookieInspector from '@/components/tools/CookieInspector';

describe('CookieInspector Component', () => {
  it('renders raw cookie input and parsed cookie cards', () => {
    render(<CookieInspector />);
    expect(screen.getByLabelText(/Paste Raw Set-Cookie Header/i)).toBeInTheDocument();
    expect(screen.getByText(/Parsed Cookie Directives/i)).toBeInTheDocument();
  });
});

