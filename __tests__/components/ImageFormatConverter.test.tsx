import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageFormatConverter from '@/components/tools/ImageFormatConverter';

describe('ImageFormatConverter Component', () => {
  it('renders image file picker input', () => {
    render(<ImageFormatConverter />);
    expect(screen.getByLabelText(/Select Image File/i)).toBeInTheDocument();
  });
});
