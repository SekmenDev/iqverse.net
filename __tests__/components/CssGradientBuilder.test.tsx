import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CssGradientBuilder from '@/components/tools/CssGradientBuilder';

describe('CssGradientBuilder Component', () => {
  it('renders gradient preview and CSS output area', () => {
    render(<CssGradientBuilder />);
    expect(screen.getByLabelText(/Generated CSS Code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy CSS/i })).toBeInTheDocument();
  });

  it('switches gradient type to radial', () => {
    render(<CssGradientBuilder />);
    const select = screen.getByLabelText(/Type:/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'radial' } });
    const output = screen.getByLabelText(/Generated CSS Code/i) as HTMLTextAreaElement;
    expect(output.value).toContain('radial-gradient');
  });
});
