import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordAnalyzer from '@/components/tools/PasswordAnalyzer';

describe('PasswordAnalyzer Component', () => {
  it('renders password input and bit entropy score', () => {
    render(<PasswordAnalyzer />);
    expect(screen.getByLabelText(/Password Input/i)).toBeInTheDocument();
    expect(screen.getByText(/Bit Entropy:/i)).toBeInTheDocument();
  });

  it('updates entropy when changing password text', () => {
    render(<PasswordAnalyzer />);
    const input = screen.getByLabelText(/Password Input/i);
    fireEvent.change(input, { target: { value: '123' } });
    expect(screen.getByText(/Very Weak/i)).toBeInTheDocument();
  });
});
