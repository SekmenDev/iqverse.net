import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SchemaValidator from '@/components/tools/SchemaValidator';

describe('SchemaValidator Component', () => {
  it('renders input area and sample buttons', () => {
    render(<SchemaValidator />);
    expect(screen.getByLabelText(/JSON-LD \/ Structured Data Input/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Validate Structured Data/i })).toBeInTheDocument();
  });

  it('validates pre-loaded JSON-LD content', () => {
    render(<SchemaValidator />);
    const valBtn = screen.getByRole('button', { name: /Validate Structured Data/i });
    fireEvent.click(valBtn);
    expect(screen.getByText(/Valid Schema Markup Structure/i)).toBeInTheDocument();
  });
});
