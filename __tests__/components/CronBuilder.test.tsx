import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CronBuilder from '@/components/tools/CronBuilder';

describe('CronBuilder Component', () => {
  it('renders cron expression input and human translation', () => {
    render(<CronBuilder />);
    expect(screen.getByLabelText(/Cron Expression/i)).toBeInTheDocument();
    expect(screen.getByText(/Human-Readable Schedule:/i)).toBeInTheDocument();
  });

  it('updates expression when clicking a preset button', () => {
    render(<CronBuilder />);
    const presetBtn = screen.getByRole('button', { name: /Every 5 minutes/i });
    fireEvent.click(presetBtn);
    const input = screen.getByLabelText(/Cron Expression/i) as HTMLInputElement;
    expect(input.value).toBe('*/5 * * * *');
  });
});
