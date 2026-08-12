import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SchemaValidator from '@/components/tools/SchemaValidator';

describe('SchemaValidator Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders input area, sample buttons, and captcha element', () => {
    const { container } = render(<SchemaValidator />);
    expect(screen.getByLabelText(/JSON-LD \/ Structured Data Input/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Validate Structured Data/i })).toBeInTheDocument();
    expect(container.querySelector('cap-widget')).not.toBeNull();
  });

  it('validates pre-loaded JSON-LD content', () => {
    render(<SchemaValidator />);
    const valBtn = screen.getByRole('button', { name: /Validate Structured Data/i });
    fireEvent.click(valBtn);
    expect(screen.getByText(/Valid Schema Markup Structure/i)).toBeInTheDocument();
  });

  it('switches mode to URL scanner and renders URL input field', () => {
    render(<SchemaValidator />);
    const urlTabBtn = screen.getByRole('button', { name: /Fetch & Scan URL/i });
    fireEvent.click(urlTabBtn);

    expect(screen.getByLabelText(/Target Web Page URL/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fetch & Validate URL/i })).toBeInTheDocument();
  });

  it('fetches URL and extracts JSON-LD schemas', async () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "TestOrg",
              "url": "https://example.com"
            }
          </script>
        </head>
        <body></body>
      </html>
    `;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (typeof url === 'string' && url.includes('check-url')) {
        return new Response(JSON.stringify({ status: 200, html: mockHtml }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(mockHtml, { status: 200 });
    });

    render(<SchemaValidator />);
    fireEvent.click(screen.getByRole('button', { name: /Fetch & Scan URL/i }));
    fireEvent.click(screen.getByRole('button', { name: /Fetch & Validate URL/i }));

    await waitFor(() => {
      expect(screen.getByText(/Valid Schema Markup Structure/i)).toBeInTheDocument();
      expect(screen.getByText(/TestOrg/i)).toBeInTheDocument();
    });
  });
});

