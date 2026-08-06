import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import YamlJsonTomlConverter from '@/components/tools/YamlJsonTomlConverter';

describe('YamlJsonTomlConverter Component', () => {
  it('renders source format input and target output areas', () => {
    render(<YamlJsonTomlConverter />);
    expect(screen.getByLabelText(/Source Data \(JSON\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Convert Format/i })).toBeInTheDocument();
  });

  it('converts JSON input to YAML output', () => {
    render(<YamlJsonTomlConverter />);
    const convBtn = screen.getByRole('button', { name: /Convert Format/i });
    fireEvent.click(convBtn);
    expect(screen.getByLabelText(/Converted Output \(YAML\)/i)).toBeInTheDocument();
  });
});
