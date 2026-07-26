import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordGenerator from '@/components/tools/PasswordGenerator';

describe('PasswordGenerator Component', () => {
  it('renders correctly with default controls and title', () => {
    render(<PasswordGenerator />);
    expect(screen.getByRole('button', { name: /generate password/i })).toBeInTheDocument();
  });

  it('generates password when "Generate Password" button is clicked', () => {
    render(<PasswordGenerator />);
    const generateBtn = screen.getByRole('button', { name: /generate password/i });
    fireEvent.click(generateBtn);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.some((input) => (input as HTMLInputElement).value.length > 0)).toBe(true);
  });

  it('displays error when all character set checkboxes are unchecked', () => {
    render(<PasswordGenerator />);

    const uppercaseCheckbox = screen.getByRole('checkbox', { name: /uppercase \(a-z\)/i });
    const lowercaseCheckbox = screen.getByRole('checkbox', { name: /lowercase \(a-z\)/i });
    const digitsCheckbox = screen.getByRole('checkbox', { name: /digits \(0-9\)/i });
    const symbolsCheckbox = screen.getByRole('checkbox', { name: /^symbols$/i });

    fireEvent.click(uppercaseCheckbox);
    fireEvent.click(lowercaseCheckbox);
    fireEvent.click(digitsCheckbox);
    fireEvent.click(symbolsCheckbox);

    const generateBtn = screen.getByRole('button', { name: /generate password/i });
    fireEvent.click(generateBtn);

    expect(screen.getByText(/select at least one character set/i)).toBeInTheDocument();
  });
});
