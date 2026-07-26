import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RegexForge from '@/components/tools/RegexForge';

describe('RegexForge Component', () => {
  it('renders regex pattern input and flags', () => {
    render(<RegexForge />);
    expect(screen.getByLabelText(/pattern/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/https\?:/i)).toBeInTheDocument();
  });

  it('updates matches when regex pattern changes', () => {
    render(<RegexForge />);
    const patternInput = screen.getByLabelText(/pattern/i);
    fireEvent.change(patternInput, { target: { value: 'example' } });

    expect(screen.getByText('Matches found:')).toBeInTheDocument();
  });
});
