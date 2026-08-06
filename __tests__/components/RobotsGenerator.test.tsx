import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RobotsGenerator from '@/components/tools/RobotsGenerator';

describe('RobotsGenerator Component', () => {
  it('renders sitemap input and generated robots.txt output', () => {
    render(<RobotsGenerator />);
    expect(screen.getByLabelText(/Sitemap URL Reference/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Generated robots.txt Output/i)).toBeInTheDocument();
  });

  it('tests path rule access', () => {
    render(<RobotsGenerator />);
    const testBtn = screen.getByRole('button', { name: /Test Path Access/i });
    fireEvent.click(testBtn);
    expect(screen.getByText(/Blocked|Allowed/i)).toBeInTheDocument();
  });
});
