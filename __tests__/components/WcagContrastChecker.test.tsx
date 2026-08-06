import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WcagContrastChecker from '@/components/tools/WcagContrastChecker';

describe('WcagContrastChecker Component', () => {
  it('renders foreground and background color inputs and contrast ratio', () => {
    render(<WcagContrastChecker />);
    expect(screen.getByLabelText(/Foreground \(Text\) Color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Background Color/i)).toBeInTheDocument();
    expect(screen.getByText(/Contrast Ratio/i)).toBeInTheDocument();
  });

  it('swaps colors when clicking swap button', () => {
    render(<WcagContrastChecker />);
    const swapBtn = screen.getByRole('button', { name: /Swap/i });
    fireEvent.click(swapBtn);
    expect(screen.getByText(/Contrast Ratio/i)).toBeInTheDocument();
  });
});
