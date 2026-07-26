import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataConverter from '@/components/tools/DataConverter';

describe('DataConverter Component', () => {
  it('renders input area, format selectors, and convert button', () => {
    render(<DataConverter />);
    expect(screen.getByRole('button', { name: /convert/i })).toBeInTheDocument();
  });

  it('converts JSON array of objects to CSV', () => {
    render(<DataConverter />);
    const textarea = screen.getByLabelText(/^input$/i);
    fireEvent.change(textarea, { target: { value: '[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]' } });

    const convertBtn = screen.getByRole('button', { name: /convert/i });
    fireEvent.click(convertBtn);

    const outputs = screen.getAllByRole('textbox');
    const outputTextarea = outputs[outputs.length - 1];
    expect((outputTextarea as HTMLTextAreaElement).value).toContain('id,name\n1,Alice\n2,Bob');
  });
});
