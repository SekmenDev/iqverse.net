import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CSSUnitsConverter from '@/components/tools/CSSUnitsConverter';

describe('CSSUnitsConverter Component', () => {
  it('renders input field and unit selection controls', () => {
    render(<CSSUnitsConverter />);
    expect(screen.getAllByDisplayValue('16').length).toBeGreaterThan(0);
  });

  it('converts px to rem correctly based on root font size', () => {
    render(<CSSUnitsConverter />);
    const inputs = screen.getAllByRole('spinbutton');
    const valueInput = inputs[0];

    fireEvent.change(valueInput, { target: { value: '32' } });
    expect(screen.getByText('2.000rem')).toBeInTheDocument();
  });
});
