import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SitemapGenerator from '@/components/tools/SitemapGenerator';

describe('SitemapGenerator Component', () => {
  it('renders base URL input and sitemap entries', () => {
    render(<SitemapGenerator />);
    expect(screen.getByLabelText(/Base Website URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Generated sitemap.xml/i)).toBeInTheDocument();
  });

  it('adds a new URL entry when clicking Add URL button', () => {
    render(<SitemapGenerator />);
    const addBtn = screen.getByRole('button', { name: /\+ Add URL/i });
    fireEvent.click(addBtn);
    expect(screen.getByText(/Sitemap Entries \(4\)/i)).toBeInTheDocument();
  });
});
