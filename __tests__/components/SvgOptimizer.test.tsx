import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SvgOptimizer from '@/components/tools/SvgOptimizer';

describe('SvgOptimizer Component', () => {
  it('renders raw SVG input and optimized output textarea', () => {
    render(<SvgOptimizer />);
    expect(screen.getByLabelText(/Raw SVG Code Input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Optimized SVG Code/i)).toBeInTheDocument();
  });
});
