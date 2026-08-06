import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimestampConverter from '@/components/tools/TimestampConverter';

describe('TimestampConverter Component', () => {
  it('renders current epoch time and timestamp input', () => {
    render(<TimestampConverter />);
    expect(screen.getByText(/Current Unix Epoch Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter Timestamp/i)).toBeInTheDocument();
  });

  it('converts entered timestamp to ISO 8601', () => {
    render(<TimestampConverter />);
    const input = screen.getByLabelText(/Enter Timestamp/i);
    fireEvent.change(input, { target: { value: '1700000000' } });
    expect(screen.getByText(/2023-11-14T22:13:20.000Z/i)).toBeInTheDocument();
  });
});
