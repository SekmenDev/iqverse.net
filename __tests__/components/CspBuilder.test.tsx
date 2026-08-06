import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CspBuilder from '@/components/tools/CspBuilder';

describe('CspBuilder Component', () => {
  it('renders directives and generated CSP header output', () => {
    render(<CspBuilder />);
    expect(screen.getByLabelText(/Content-Security-Policy Header Value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/HTML <meta> Tag Snippet/i)).toBeInTheDocument();
  });
});
