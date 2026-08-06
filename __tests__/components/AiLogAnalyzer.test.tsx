import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AiLogAnalyzer from '@/components/tools/AiLogAnalyzer';

describe('AiLogAnalyzer Component', () => {
  it('renders log textarea and analyze button', () => {
    render(<AiLogAnalyzer />);
    expect(screen.getByLabelText(/Server Access Log Lines/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze AI Crawler Logs/i })).toBeInTheDocument();
  });

  it('parses log sample and displays statistics', () => {
    render(<AiLogAnalyzer />);
    const btn = screen.getByRole('button', { name: /Analyze AI Crawler Logs/i });
    fireEvent.click(btn);
    expect(screen.getByText(/Total Log Lines/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Crawler Visits/i)).toBeInTheDocument();
  });
});
