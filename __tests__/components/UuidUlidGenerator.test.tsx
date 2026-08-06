import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UuidUlidGenerator from '@/components/tools/UuidUlidGenerator';

describe('UuidUlidGenerator Component', () => {
  it('renders type dropdown and generates UUID batch', () => {
    render(<UuidUlidGenerator />);
    const genBtn = screen.getByRole('button', { name: /Generate IDs/i });
    fireEvent.click(genBtn);
    expect(screen.getByLabelText(/Generated UUID Batch/i)).toBeInTheDocument();
  });

  it('decodes ULID timestamp', () => {
    render(<UuidUlidGenerator />);
    const input = screen.getByPlaceholderText(/Paste ULID string/i);
    fireEvent.change(input, { target: { value: '01ARZ3NDEKTSV4RRFFQ69G5FAV' } });
    const decodeBtn = screen.getByRole('button', { name: /Decode Date/i });
    fireEvent.click(decodeBtn);
    expect(screen.getByText(/Timestamp:/i)).toBeInTheDocument();
  });
});
