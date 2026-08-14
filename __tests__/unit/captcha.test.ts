import { describe, it, expect, vi } from 'vitest';
import { DEFAULT_CAPTCHA_ENDPOINT, resetCapWidget, bindCapWidget } from '@/lib/captcha';

describe('CapCaptcha utilities & bindings', () => {
  it('has valid default captcha endpoint', () => {
    expect(DEFAULT_CAPTCHA_ENDPOINT).toBe('https://captcha.sekmen.dev/b2962a01e4/');
  });

  it('safely handles reset on null/undefined elements or elements without reset method', () => {
    expect(resetCapWidget(null)).toBe(false);
    expect(resetCapWidget(undefined)).toBe(false);

    const el = document.createElement('div');
    expect(resetCapWidget(el)).toBe(false);
  });

  it('successfully invokes reset method on cap-widget element', () => {
    const el = document.createElement('div');
    const resetMock = vi.fn();
    (el as any).reset = resetMock;

    const result = resetCapWidget(el);
    expect(result).toBe(true);
    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it('binds events and invokes callbacks correctly', () => {
    const form = document.createElement('form');
    const widget = document.createElement('cap-widget');
    const resetMock = vi.fn();
    (widget as any).reset = resetMock;
    form.appendChild(widget);
    document.body.appendChild(form);

    const onSolve = vi.fn();
    const onError = vi.fn();
    const onProgress = vi.fn();
    const onReset = vi.fn();

    const cleanup = bindCapWidget(widget, {
      onSolve,
      onError,
      onProgress,
      onReset,
    });

    // Test solve event
    widget.dispatchEvent(new CustomEvent('solve', { detail: { token: 'mock-token-xyz' } }));
    expect(onSolve).toHaveBeenCalledWith('mock-token-xyz');

    // Test error event
    widget.dispatchEvent(new CustomEvent('error', { detail: { message: 'Failed to verify' } }));
    expect(onError).toHaveBeenCalledWith('Failed to verify');

    // Test progress event
    widget.dispatchEvent(new CustomEvent('progress', { detail: { progress: 75 } }));
    expect(onProgress).toHaveBeenCalledWith(75);

    // Test parent form reset
    form.dispatchEvent(new Event('reset'));
    expect(resetMock).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);

    // Test parent form submit
    form.dispatchEvent(new Event('submit'));
    expect(resetMock).toHaveBeenCalledTimes(2);
    expect(onReset).toHaveBeenCalledTimes(2);

    // Cleanup and verify listeners removed
    cleanup();
    form.dispatchEvent(new Event('reset'));
    expect(resetMock).toHaveBeenCalledTimes(2); // no additional calls

    document.body.removeChild(form);
  });
});
