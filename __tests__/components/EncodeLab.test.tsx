import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EncodeLab from '@/components/tools/EncodeLab';

describe('EncodeLab Component', () => {
  it('renders input area and encoding buttons', () => {
    render(<EncodeLab />);
    expect(screen.getByLabelText(/input/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /base64 encode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /encodeuricomponent/i })).toBeInTheDocument();
  });

  it('encodes input string to Base64 when button is clicked', () => {
    render(<EncodeLab />);
    const textarea = screen.getByLabelText(/input/i);
    fireEvent.change(textarea, { target: { value: 'IQVerse Testing' } });

    const encodeBtn = screen.getByRole('button', { name: /base64 encode/i });
    fireEvent.click(encodeBtn);

    expect(screen.getByDisplayValue('SVFWZXJzZSBUZXN0aW5n')).toBeInTheDocument();
  });
});
