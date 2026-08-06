import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FakeDataGenerator from '@/components/tools/FakeDataGenerator';

describe('FakeDataGenerator Component', () => {
  it('renders lorem generator controls and generates text', () => {
    render(<FakeDataGenerator />);
    const genBtn = screen.getByRole('button', { name: /Generate Text/i });
    fireEvent.click(genBtn);
    expect(screen.getByLabelText(/Generated Lorem Ipsum Text/i)).toBeInTheDocument();
  });

  it('switches to JSON mock data mode and generates batch', () => {
    render(<FakeDataGenerator />);
    const jsonTab = screen.getByRole('button', { name: /JSON Mock Data Batch/i });
    fireEvent.click(jsonTab);
    const genBatchBtn = screen.getByRole('button', { name: /Generate JSON Batch/i });
    fireEvent.click(genBatchBtn);
    expect(screen.getByLabelText(/Generated Mock JSON/i)).toBeInTheDocument();
  });
});
