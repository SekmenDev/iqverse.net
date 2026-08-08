import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import CapCaptcha, { CapCaptchaRef } from '@/components/CapCaptcha';

describe('CapCaptcha Component', () => {
  it('renders cap-widget element', () => {
    const { container } = render(<CapCaptcha />);
    const widget = container.querySelector('cap-widget');
    expect(widget).not.toBeNull();
  });

  it('exposes reset method via ref and triggers reset', () => {
    const ref = createRef<CapCaptchaRef>();
    const onReset = vi.fn();
    const { container } = render(<CapCaptcha ref={ref} onReset={onReset} />);

    expect(ref.current).toHaveProperty('reset');
    
    // Call reset within act
    act(() => {
      ref.current?.reset();
    });
    expect(onReset).toHaveBeenCalledTimes(1);

    // Verify key updated re-rendering cap-widget
    const widget = container.querySelector('cap-widget');
    expect(widget).not.toBeNull();
  });

  it('resets automatically when parent form is reset', () => {
    const onReset = vi.fn();
    const { container } = render(
      <form data-testid="test-form">
        <CapCaptcha onReset={onReset} />
        <button type="reset">Reset</button>
      </form>
    );

    const form = container.querySelector('form');
    expect(form).not.toBeNull();

    fireEvent.reset(form!);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
