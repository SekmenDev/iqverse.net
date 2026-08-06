import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FileHashVerifier from '@/components/tools/FileHashVerifier';

describe('FileHashVerifier Component', () => {
  it('renders local file picker input', () => {
    render(<FileHashVerifier />);
    expect(screen.getByLabelText(/Select Local File/i)).toBeInTheDocument();
  });
});
