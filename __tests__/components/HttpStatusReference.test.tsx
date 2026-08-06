import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HttpStatusReference from '@/components/tools/HttpStatusReference';

describe('HttpStatusReference Component', () => {
  it('renders search input and initial 200 OK status code card', () => {
    render(<HttpStatusReference />);
    expect(screen.getByLabelText(/Search Status Codes/i)).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('filters by category button 4xx', () => {
    render(<HttpStatusReference />);
    const btn4xx = screen.getByRole('button', { name: /4xx/i });
    fireEvent.click(btn4xx);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.queryByText('200')).not.toBeInTheDocument();
  });
});
