import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JwtDebugger from '@/components/tools/JwtDebugger';

describe('JwtDebugger Component', () => {
  it('renders encoded JWT input and decoded header/payload areas', () => {
    render(<JwtDebugger />);
    expect(screen.getByLabelText(/Encoded JWT Token/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Header: Algorithm & Token Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payload: Data Claims/i)).toBeInTheDocument();
  });

  it('verifies signature when clicking verify button', async () => {
    render(<JwtDebugger />);
    const verifyBtn = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyBtn);
    await waitFor(() => {
      expect(screen.getByText(/Signature/i)).toBeInTheDocument();
    });
  });
});

