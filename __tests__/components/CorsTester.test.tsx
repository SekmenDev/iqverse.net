import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CorsTester from '@/components/tools/CorsTester';

describe('CorsTester Component', () => {
  it('renders target URL input and test button', () => {
    render(<CorsTester />);
    expect(screen.getByLabelText(/Target API Endpoint URL/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Test CORS Preflight & Headers/i })).toBeInTheDocument();
  });
});
