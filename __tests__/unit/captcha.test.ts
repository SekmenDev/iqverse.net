import { describe, it, expect, vi } from 'vitest';
import {
  DEFAULT_CAPTCHA_ENDPOINT,
  resetCapWidget,
  bindCapWidget,
  getCaptchaToken,
  isCaptchaSolved,
  validateCaptcha,
} from '@/lib/captcha';

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

  it('successfully invokes reset method and clears token state on cap-widget element', () => {
    const wrap = document.createElement('div');
    wrap.className = 'cap-captcha-wrap cap-invalid';
    const errorEl = document.createElement('div');
    errorEl.className = 'cap-captcha-error';
    errorEl.textContent = 'Error';
    errorEl.style.display = 'block';
    wrap.appendChild(errorEl);

    const widget = document.createElement('cap-widget');
    const resetMock = vi.fn();
    (widget as any).reset = resetMock;
    (widget as any).__cap_token = 'existing-token';
    wrap.appendChild(widget);

    const result = resetCapWidget(widget);
    expect(result).toBe(true);
    expect(resetMock).toHaveBeenCalledTimes(1);
    expect((widget as any).__cap_token).toBeNull();
    expect(wrap.classList.contains('cap-invalid')).toBe(false);
    expect(errorEl.style.display).toBe('none');
  });

  describe('getCaptchaToken & isCaptchaSolved', () => {
    it('returns null and false when no token is present', () => {
      const form = document.createElement('form');
      const widget = document.createElement('cap-widget');
      form.appendChild(widget);

      expect(getCaptchaToken(form)).toBeNull();
      expect(isCaptchaSolved(form)).toBe(false);
      expect(getCaptchaToken(null)).toBeNull();
      expect(isCaptchaSolved(undefined)).toBe(false);
    });

    it('extracts token from __cap_token property', () => {
      const widget = document.createElement('cap-widget');
      (widget as any).__cap_token = 'token-123';

      expect(getCaptchaToken(widget)).toBe('token-123');
      expect(isCaptchaSolved(widget)).toBe(true);
    });

    it('extracts token from widget token or value property', () => {
      const widget = document.createElement('cap-widget');
      (widget as any).token = 'token-from-prop';
      expect(getCaptchaToken(widget)).toBe('token-from-prop');

      (widget as any).token = '';
      (widget as any).value = 'token-from-value';
      expect(getCaptchaToken(widget)).toBe('token-from-value');
    });

    it('extracts token from hidden form input', () => {
      const form = document.createElement('form');
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'cap-token';
      input.value = 'hidden-input-token';
      form.appendChild(input);

      expect(getCaptchaToken(form)).toBe('hidden-input-token');
      expect(isCaptchaSolved(form)).toBe(true);
    });
  });

  describe('validateCaptcha', () => {
    it('fails validation, applies cap-invalid class, and displays error when token is missing', () => {
      const form = document.createElement('form');
      const wrap = document.createElement('div');
      wrap.className = 'cap-captcha-wrap';
      const errorEl = document.createElement('div');
      errorEl.className = 'cap-captcha-error';
      wrap.appendChild(errorEl);

      const widget = document.createElement('cap-widget');
      wrap.appendChild(widget);
      form.appendChild(wrap);

      const res = validateCaptcha(form, 'Please solve the captcha first');
      expect(res.valid).toBe(false);
      expect(res.token).toBeNull();
      expect(wrap.classList.contains('cap-invalid')).toBe(true);
      expect(errorEl.style.display).toBe('block');
      expect(errorEl.textContent).toBe('Please solve the captcha first');
    });

    it('passes validation, cleans up error state, and returns token when solved', () => {
      const form = document.createElement('form');
      const wrap = document.createElement('div');
      wrap.className = 'cap-captcha-wrap cap-invalid';
      const errorEl = document.createElement('div');
      errorEl.className = 'cap-captcha-error';
      errorEl.style.display = 'block';
      wrap.appendChild(errorEl);

      const widget = document.createElement('cap-widget');
      (widget as any).__cap_token = 'valid-token-abc';
      wrap.appendChild(widget);
      form.appendChild(wrap);

      const res = validateCaptcha(form);
      expect(res.valid).toBe(true);
      expect(res.token).toBe('valid-token-abc');
      expect(wrap.classList.contains('cap-invalid')).toBe(false);
      expect(errorEl.style.display).toBe('none');
    });
  });

  describe('bindCapWidget lifecycle', () => {
    it('binds events and invokes callbacks correctly', () => {
      const form = document.createElement('form');
      const wrap = document.createElement('div');
      wrap.className = 'cap-captcha-wrap cap-invalid';
      const errorEl = document.createElement('div');
      errorEl.className = 'cap-captcha-error';
      errorEl.style.display = 'block';
      wrap.appendChild(errorEl);

      const widget = document.createElement('cap-widget');
      const resetMock = vi.fn();
      (widget as any).reset = resetMock;
      wrap.appendChild(widget);
      form.appendChild(wrap);
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
      expect((widget as any).__cap_token).toBe('mock-token-xyz');
      expect(wrap.classList.contains('cap-invalid')).toBe(false);
      expect(errorEl.style.display).toBe('none');

      // Test error event
      widget.dispatchEvent(new CustomEvent('error', { detail: { message: 'Failed to verify' } }));
      expect(onError).toHaveBeenCalledWith('Failed to verify');
      expect((widget as any).__cap_token).toBeNull();

      // Test progress event
      widget.dispatchEvent(new CustomEvent('progress', { detail: { progress: 75 } }));
      expect(onProgress).toHaveBeenCalledWith(75);

      // Test parent form reset
      form.dispatchEvent(new Event('reset'));
      expect(resetMock).toHaveBeenCalledTimes(1);
      expect(onReset).toHaveBeenCalledTimes(1);
      expect((widget as any).__cap_token).toBeNull();

      // Cleanup and verify listeners removed
      cleanup();
      form.dispatchEvent(new Event('reset'));
      expect(resetMock).toHaveBeenCalledTimes(1); // no additional calls

      document.body.removeChild(form);
    });
  });
});
