import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PortReferenceGuide from '@/components/tools/PortReferenceGuide';

describe('PortReferenceGuide Component', () => {
  it('renders search input and initial port cards', () => {
    render(<PortReferenceGuide />);
    expect(screen.getByLabelText(/Search Port Number/i)).toBeInTheDocument();
    expect(screen.getByText(/Port 80 \/ TCP/i)).toBeInTheDocument();
  });

  it('filters port list when typing in search input', () => {
    render(<PortReferenceGuide />);
    const search = screen.getByLabelText(/Search Port Number/i);
    fireEvent.change(search, { target: { value: '3306' } });
    expect(screen.getAllByText(/MySQL /i)[0]).toBeInTheDocument();
  });
});

