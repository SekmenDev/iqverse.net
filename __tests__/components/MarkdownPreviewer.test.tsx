import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MarkdownPreviewer from '@/components/tools/MarkdownPreviewer';

describe('MarkdownPreviewer Component', () => {
  it('renders markdown editor and preview', () => {
    render(<MarkdownPreviewer />);
    expect(screen.getByLabelText(/Markdown Source/i)).toBeInTheDocument();
    expect(screen.getByText(/Rendered Live Preview/i)).toBeInTheDocument();
  });

  it('switches to raw HTML mode', () => {
    render(<MarkdownPreviewer />);
    const htmlBtn = screen.getByRole('button', { name: /Raw HTML/i });
    fireEvent.click(htmlBtn);
    expect(screen.getByLabelText(/Generated HTML Code/i)).toBeInTheDocument();
  });
});
