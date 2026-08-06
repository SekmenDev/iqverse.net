import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SpriteGenerator from '@/components/tools/SpriteGenerator';

describe('SpriteGenerator Component', () => {
  it('renders file upload input and configuration options', () => {
    render(<SpriteGenerator />);
    expect(screen.getByLabelText(/Upload Icon Files/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Sprite Sheet/i })).toBeInTheDocument();
  });
});
