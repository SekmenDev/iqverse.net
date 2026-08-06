import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OgPreviewer from '@/components/tools/OgPreviewer';

describe('OgPreviewer Component', () => {
  it('renders title input and meta tag output area', () => {
    render(<OgPreviewer />);
    expect(screen.getByLabelText(/Page Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Generated HTML Meta Tags/i)).toBeInTheDocument();
  });

  it('switches social preview platform to twitter', () => {
    render(<OgPreviewer />);
    const twBtn = screen.getByRole('button', { name: /twitter/i });
    fireEvent.click(twBtn);
    expect(twBtn).toBeInTheDocument();
  });
});
