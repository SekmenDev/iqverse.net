import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LlmstxtGenerator from '@/components/tools/LlmstxtGenerator';

describe('LlmstxtGenerator Component', () => {
  it('renders title input and default output', () => {
    render(<LlmstxtGenerator />);
    expect(screen.getByLabelText(/Project \/ Site Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Generated llms.txt Output/i)).toBeInTheDocument();
  });

  it('switches to validator tab', () => {
    render(<LlmstxtGenerator />);
    const valTab = screen.getByRole('button', { name: /Validator/i });
    fireEvent.click(valTab);
    expect(screen.getByLabelText(/Paste llms.txt Content to Validate/i)).toBeInTheDocument();
  });
});

