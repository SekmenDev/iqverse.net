import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JSONFormatter from '@/components/tools/JSONFormatter';

describe('JSONFormatter Component', () => {
  it('renders input area and format buttons', () => {
    render(<JSONFormatter />);
    expect(screen.getByLabelText(/json input/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /format/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /minify/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /validate/i })).toBeInTheDocument();
  });

  it('formats valid JSON correctly', () => {
    render(<JSONFormatter />);
    const textarea = screen.getByLabelText(/json input/i);
    fireEvent.change(textarea, { target: { value: '{"name":"iqverse","active":true}' } });

    const formatBtn = screen.getByRole('button', { name: /format/i });
    fireEvent.click(formatBtn);

    const textareas = screen.getAllByRole('textbox');
    const outputArea = textareas[textareas.length - 1] as HTMLTextAreaElement;
    expect(outputArea.value).toContain('{\n  "name": "iqverse"');
  });

  it('displays error for invalid JSON', () => {
    render(<JSONFormatter />);
    const textarea = screen.getByLabelText(/json input/i);
    fireEvent.change(textarea, { target: { value: '{invalid_json}' } });

    const formatBtn = screen.getByRole('button', { name: /format/i });
    fireEvent.click(formatBtn);

    expect(screen.getByText(/error:/i)).toBeInTheDocument();
  });
});
