import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SslInspector from '@/components/tools/SslInspector';

describe('SslInspector Component', () => {
  it('renders domain input and inspect button', () => {
    render(<SslInspector />);
    expect(screen.getByLabelText(/Domain Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Inspect SSL Certificate/i })).toBeInTheDocument();
  });

  it('inspects certificate and displays valid status', () => {
    render(<SslInspector />);
    const btn = screen.getByRole('button', { name: /Inspect SSL Certificate/i });
    fireEvent.click(btn);
    expect(screen.getByText(/Certificate Details/i)).toBeInTheDocument();
  });
});
