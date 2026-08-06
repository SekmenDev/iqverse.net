import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TextCaseConverter from '@/components/tools/TextCaseConverter';

describe('TextCaseConverter Component', () => {
  it('renders input area and case options', () => {
    render(<TextCaseConverter />);
    expect(screen.getByLabelText(/Input Text/i)).toBeInTheDocument();
    expect(screen.getByText(/camelCase/i)).toBeInTheDocument();
    expect(screen.getByText(/snake_case/i)).toBeInTheDocument();
  });

  it('updates conversions when text changes', () => {
    render(<TextCaseConverter />);
    const input = screen.getByLabelText(/Input Text/i);
    fireEvent.change(input, { target: { value: 'my new variable' } });
    expect(screen.getByText('myNewVariable')).toBeInTheDocument();
    expect(screen.getByText('my_new_variable')).toBeInTheDocument();
  });
});
