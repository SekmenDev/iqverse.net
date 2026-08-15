export const DEFAULT_CAPTCHA_ENDPOINT = 'https://captcha.sekmen.dev/b2962a01e4/';

export interface CapWidgetElement extends HTMLElement {
  reset?: () => void;
  token?: string;
  value?: string;
  __cap_token?: string | null;
  __cap_bound?: boolean;
}

export interface CapSolveDetail {
  token: string;
}

export interface CapErrorDetail {
  message: string;
}

export interface CapProgressDetail {
  progress: number;
}

export interface CapCaptchaOptions {
  endpoint?: string;
  onSolve?: (token: string) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
  onReset?: () => void;
}

/**
 * Extracts a solved CAPTCHA token from a widget, form, or container.
 */
export function getCaptchaToken(
  containerOrWidget: HTMLElement | null | undefined
): string | null {
  if (!containerOrWidget) return null;

  let widget: CapWidgetElement | null = null;
  if (containerOrWidget.tagName?.toLowerCase() === 'cap-widget') {
    widget = containerOrWidget as CapWidgetElement;
  } else {
    widget = containerOrWidget.querySelector('cap-widget') as CapWidgetElement | null;
  }

  if (widget) {
    if (widget.__cap_token && typeof widget.__cap_token === 'string') {
      const trimmed = widget.__cap_token.trim();
      if (trimmed) return trimmed;
    }
    if (widget.token && typeof widget.token === 'string') {
      const trimmed = widget.token.trim();
      if (trimmed) return trimmed;
    }
    if (widget.value && typeof widget.value === 'string') {
      const trimmed = widget.value.trim();
      if (trimmed) return trimmed;
    }
    const dataToken = widget.getAttribute('data-cap-token');
    if (dataToken && dataToken.trim()) {
      return dataToken.trim();
    }
  }

  // Also check form hidden input if present
  const hiddenInput = containerOrWidget.querySelector<HTMLInputElement>(
    'input[name="cap-token"], input[name="c-t"], input[data-cap-token]'
  );
  if (hiddenInput && hiddenInput.value && hiddenInput.value.trim()) {
    return hiddenInput.value.trim();
  }

  return null;
}

/**
 * Returns true if a valid CAPTCHA token has been generated and solved.
 */
export function isCaptchaSolved(
  containerOrWidget: HTMLElement | null | undefined
): boolean {
  return Boolean(getCaptchaToken(containerOrWidget));
}

/**
 * Resets a cap-widget element if it exists and supports reset.
 */
export function resetCapWidget(widget: HTMLElement | null | undefined): boolean {
  if (!widget) return false;
  const el = widget as CapWidgetElement;
  el.__cap_token = null;

  const wrap = el.closest('.cap-captcha-wrap') || el.parentElement;
  if (wrap) {
    const errorEl = wrap.querySelector('.cap-captcha-error') as HTMLElement | null;
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
    wrap.classList.remove('cap-invalid');
  }

  const hiddenInput = el.closest('form')?.querySelector<HTMLInputElement>(
    'input[name="cap-token"], input[name="c-t"]'
  );
  if (hiddenInput) {
    hiddenInput.value = '';
  }

  if (typeof el.reset === 'function') {
    try {
      el.reset();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Validates whether the CAPTCHA is solved within the container/form.
 * If unsolved, displays visual error feedback and focus.
 */
export function validateCaptcha(
  containerOrForm: HTMLElement | null | undefined,
  customMessage: string = 'Please complete the CAPTCHA challenge before proceeding.'
): { valid: boolean; token: string | null } {
  const token = getCaptchaToken(containerOrForm);

  if (!containerOrForm) {
    return { valid: Boolean(token), token };
  }

  const wrap = containerOrForm.classList?.contains('cap-captcha-wrap')
    ? containerOrForm
    : containerOrForm.querySelector('.cap-captcha-wrap') || containerOrForm.closest('.cap-captcha-wrap');
  const errorEl = (containerOrForm.querySelector('.cap-captcha-error') ||
    wrap?.querySelector('.cap-captcha-error')) as HTMLElement | null;

  if (!token) {
    if (wrap) {
      wrap.classList.remove('cap-invalid');
      // Trigger reflow to restart CSS shake animation
      void (wrap as HTMLElement).offsetWidth;
      wrap.classList.add('cap-invalid');
    }
    if (errorEl) {
      errorEl.textContent = customMessage;
      errorEl.style.display = 'block';
    }
    const widget = containerOrForm.querySelector('cap-widget') as HTMLElement | null;
    widget?.focus();
    return { valid: false, token: null };
  }

  if (wrap) {
    wrap.classList.remove('cap-invalid');
  }
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  return { valid: true, token };
}

/**
 * Attaches event listeners to a cap-widget element and binds reset handling to its parent form.
 */
export function bindCapWidget(
  widget: HTMLElement,
  options?: CapCaptchaOptions
): () => void {
  const el = widget as CapWidgetElement;

  const handleSolve = (e: Event) => {
    const customEvt = e as CustomEvent<CapSolveDetail>;
    const token =
      customEvt.detail?.token ||
      el.token ||
      el.value ||
      '';

    el.__cap_token = token;

    const wrap = el.closest('.cap-captcha-wrap') || el.parentElement;
    if (wrap) {
      wrap.classList.remove('cap-invalid');
      const errorEl = wrap.querySelector('.cap-captcha-error') as HTMLElement | null;
      if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
      }
    }

    if (options?.onSolve && token) {
      options.onSolve(token);
    }
  };

  const handleError = (e: Event) => {
    el.__cap_token = null;
    const customEvt = e as CustomEvent<CapErrorDetail>;
    if (options?.onError) {
      options.onError(customEvt.detail?.message || 'Captcha error');
    }
  };

  const handleProgress = (e: Event) => {
    const customEvt = e as CustomEvent<CapProgressDetail>;
    if (options?.onProgress && customEvt.detail?.progress !== undefined) {
      options.onProgress(customEvt.detail.progress);
    }
  };

  const form = widget.closest('form');
  const handleFormReset = () => {
    resetCapWidget(widget);
    options?.onReset?.();
  };

  const handleFormSubmitCapture = (e: Event) => {
    const { valid } = validateCaptcha(widget);
    if (!valid) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  };

  const handleBtnClick = (e: Event) => {
    const { valid } = validateCaptcha(widget);
    if (!valid) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleInvalid = () => {
    validateCaptcha(widget);
  };

  widget.addEventListener('solve', handleSolve);
  widget.addEventListener('error', handleError);
  widget.addEventListener('progress', handleProgress);
  widget.addEventListener('invalid', handleInvalid);

  let submitButtons: HTMLElement[] = [];
  if (form) {
    form.addEventListener('reset', handleFormReset);
    form.addEventListener('submit', handleFormSubmitCapture, true);
    submitButtons = Array.from(form.querySelectorAll<HTMLElement>('button[type="submit"], input[type="submit"]'));
    submitButtons.forEach((btn) => btn.addEventListener('click', handleBtnClick, true));
  }

  return () => {
    widget.removeEventListener('solve', handleSolve);
    widget.removeEventListener('error', handleError);
    widget.removeEventListener('progress', handleProgress);
    widget.removeEventListener('invalid', handleInvalid);
    if (form) {
      form.removeEventListener('reset', handleFormReset);
      form.removeEventListener('submit', handleFormSubmitCapture, true);
      submitButtons.forEach((btn) => btn.removeEventListener('click', handleBtnClick, true));
    }
  };
}
