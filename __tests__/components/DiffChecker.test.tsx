import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DiffChecker from '@/components/tools/DiffChecker';

describe('DiffChecker Component', () => {
  it('renders left and right textareas', () => {
    render(<DiffChecker />);
    expect(screen.getByLabelText(/Original Text \(Left\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Modified Text \(Right\)/i)).toBeInTheDocument();
  });

  it('switches between split view and unified view', () => {
    render(<DiffChecker />);
    const unifiedBtn = screen.getByRole('button', { name: /Unified View/i });
    fireEvent.click(unifiedBtn);
    expect(screen.getByText(/additions/i)).toBeInTheDocument();
  });
});
