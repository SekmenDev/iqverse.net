import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PingVisualizer from '@/components/tools/PingVisualizer';

describe('PingVisualizer Component', () => {
  it('renders target host input and run diagnostic buttons', () => {
    render(<PingVisualizer />);
    expect(screen.getByLabelText(/Target Domain \/ IP Host/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run Ping/i })).toBeInTheDocument();
  });

  it('switches mode to traceroute', () => {
    render(<PingVisualizer />);
    const traceBtn = screen.getByRole('button', { name: /Traceroute Visualizer/i });
    fireEvent.click(traceBtn);
    expect(screen.getByRole('button', { name: /Run Traceroute/i })).toBeInTheDocument();
  });
});
