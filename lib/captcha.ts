export const DEFAULT_CAPTCHA_ENDPOINT = 'https://captcha.sekmen.dev/b2962a01e4/';

export interface CapWidgetElement extends HTMLElement {
  reset?: () => void;
  token?: string | null;
  value?: string | null;
  __cap_token?: string | null;
  __cap_bound?: boolean;
  __cap_error?: boolean;
  __cap_load_failed?: boolean;
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
  resetOnSubmit?: boolean;
  onSolve?: (token: string) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
  onReset?: () => void;
}

export const CAPTCHA_MSG_UNSOLVED = '⚠️ Please complete the CAPTCHA challenge before proceeding.';
export const CAPTCHA_MSG_NOT_LOADED = '⚠️ Security verification failed to load. Please disable ad blockers, check your network connection, and reload the page.';
export const CAPTCHA_MSG_ERROR = '⚠️ CAPTCHA verification encountered an error. Please try again or reload the page.';

export type CaptchaValidationReason = 'unsolved' | 'not_loaded' | 'error';

/**
 * Checks whether a cap-widget custom element is loaded, registered, and ready.
 */
export function isCaptchaLoaded(
  containerOrWidget: HTMLElement | null | undefined
): boolean {
  if (!containerOrWidget) return false;

  let widget: CapWidgetElement | null = null;
  if (containerOrWidget.tagName?.toLowerCase() === 'cap-widget') {
    widget = containerOrWidget as CapWidgetElement;
  } else {
    widget = containerOrWidget.querySelector('cap-widget') as CapWidgetElement | null;
  }

  if (!widget) return false;

  // If marked with explicit load failure or error
  if ((widget as any).__cap_error || (widget as any).__cap_load_failed) {
    return false;
  }

  // Check if custom element is defined in browser registry or upgraded
  if (typeof customElements !== 'undefined' && typeof customElements.get === 'function') {
    const isRegistered = Boolean(customElements.get('cap-widget'));
    const isUpgraded =
      typeof (widget as any).reset === 'function' ||
      Boolean((widget as any).__cap_loaded);

    if (!isRegistered && !isUpgraded) {
      return false;
    }
  }

  return true;
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
export function resetCapWidget(
  containerOrWidget: HTMLElement | null | undefined
): boolean {
  if (!containerOrWidget) return false;

  let widgets: CapWidgetElement[] = [];

  if (containerOrWidget.tagName?.toLowerCase() === 'cap-widget') {
    widgets = [containerOrWidget as CapWidgetElement];
  } else {
    widgets = Array.from(
      containerOrWidget.querySelectorAll<CapWidgetElement>('cap-widget')
    );
  }

  if (widgets.length === 0) {
    const wrap = containerOrWidget.classList?.contains('cap-captcha-wrap')
      ? containerOrWidget
      : containerOrWidget.closest?.('.cap-captcha-wrap');
    if (wrap) {
      const errorEl = wrap.querySelector('.cap-captcha-error') as HTMLElement | null;
      if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
      }
      wrap.classList.remove('cap-invalid');
    }
    return false;
  }

  let resetAny = false;

  widgets.forEach((el) => {
    el.__cap_token = null;
    el.token = null as any;
    if ('value' in el) {
      (el as any).value = '';
    }
    el.removeAttribute('data-cap-token');

    const wrap = el.closest('.cap-captcha-wrap') || el.parentElement;
    if (wrap) {
      const errorEl = wrap.querySelector('.cap-captcha-error') as HTMLElement | null;
      if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
      }
      wrap.classList.remove('cap-invalid');
    }

    const form = el.closest('form');
    const hiddenInputs = form
      ? form.querySelectorAll<HTMLInputElement>(
          'input[name="cap-token"], input[name="c-t"], input[data-cap-token]'
        )
      : wrap?.querySelectorAll<HTMLInputElement>(
          'input[name="cap-token"], input[name="c-t"], input[data-cap-token]'
        );

    hiddenInputs?.forEach((input) => {
      input.value = '';
    });

    if (typeof el.reset === 'function') {
      try {
        el.reset();
        resetAny = true;
      } catch {
        // Ignore reset errors on individual widgets
      }
    } else {
      if (typeof customElements !== 'undefined' && customElements.whenDefined) {
        customElements.whenDefined('cap-widget').then(() => {
          if (typeof el.reset === 'function') {
            try {
              el.reset();
            } catch {
              // ignore
            }
          }
        });
      }
      resetAny = true;
    }
  });

  return resetAny;
}

/**
 * Validates whether the CAPTCHA is solved within the container/form.
 * If unsolved, unloaded, or errored, displays visual error feedback and prevents submission.
 */
export function validateCaptcha(
  containerOrForm: HTMLElement | null | undefined,
  customMessage?: string
): { valid: boolean; token: string | null; reason?: CaptchaValidationReason } {
  if (!containerOrForm) {
    return { valid: false, token: null, reason: 'not_loaded' };
  }

  const token = getCaptchaToken(containerOrForm);

  const wrap = containerOrForm.classList?.contains('cap-captcha-wrap')
    ? containerOrForm
    : containerOrForm.querySelector('.cap-captcha-wrap') || containerOrForm.closest('.cap-captcha-wrap');
  const errorEl = (containerOrForm.querySelector('.cap-captcha-error') ||
    wrap?.querySelector('.cap-captcha-error')) as HTMLElement | null;

  if (token) {
    if (wrap) {
      wrap.classList.remove('cap-invalid');
    }
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
    return { valid: true, token };
  }

  const widget = (
    containerOrForm.tagName?.toLowerCase() === 'cap-widget'
      ? containerOrForm
      : containerOrForm.querySelector('cap-widget')
  ) as CapWidgetElement | null;

  const loaded = isCaptchaLoaded(containerOrForm);
  const isErr = Boolean(widget && (widget as any).__cap_error);

  let reason: CaptchaValidationReason = 'unsolved';
  let message = customMessage;

  if (isErr) {
    reason = 'error';
    message = message || CAPTCHA_MSG_ERROR;
  } else if (!loaded) {
    reason = 'not_loaded';
    message = message || CAPTCHA_MSG_NOT_LOADED;
  } else {
    reason = 'unsolved';
    message = message || CAPTCHA_MSG_UNSOLVED;
  }

  if (wrap) {
    wrap.classList.remove('cap-invalid');
    // Trigger reflow to restart CSS shake animation
    void (wrap as HTMLElement).offsetWidth;
    wrap.classList.add('cap-invalid');
  }
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
  widget?.focus();

  return { valid: false, token: null, reason };
}

/**
 * Attaches event listeners to a cap-widget element and binds reset/validation handling to its parent form.
 */
export function bindCapWidget(
  widget: HTMLElement,
  options?: CapCaptchaOptions
): () => void {
  const el = widget as CapWidgetElement;

  const handleSolve = (e: Event) => {
    (el as any).__cap_error = false;
    (el as any).__cap_load_failed = false;

    const customEvt = e as CustomEvent<CapSolveDetail>;
    const token =
      customEvt.detail?.token ||
      el.token ||
      (el as any).value ||
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
    (el as any).__cap_error = true;
    const customEvt = e as CustomEvent<CapErrorDetail>;
    const msg = customEvt.detail?.message || 'Captcha error';

    const wrap = el.closest('.cap-captcha-wrap') || el.parentElement;
    if (wrap) {
      wrap.classList.remove('cap-invalid');
      void (wrap as HTMLElement).offsetWidth;
      wrap.classList.add('cap-invalid');
      const errorEl = wrap.querySelector('.cap-captcha-error') as HTMLElement | null;
      if (errorEl) {
        errorEl.textContent = `⚠️ CAPTCHA error: ${msg}. Please refresh or try again.`;
        errorEl.style.display = 'block';
      }
    }

    if (options?.onError) {
      options.onError(msg);
    }
  };

  const handleProgress = (e: Event) => {
    const customEvt = e as CustomEvent<CapProgressDetail>;
    if (options?.onProgress && customEvt.detail?.progress !== undefined) {
      options.onProgress(customEvt.detail.progress);
    }
  };

  const handleReset = () => {
    el.__cap_token = null;
    const wrap = el.closest('.cap-captcha-wrap') || el.parentElement;
    if (wrap) {
      wrap.classList.remove('cap-invalid');
      const errorEl = wrap.querySelector('.cap-captcha-error') as HTMLElement | null;
      if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
      }
    }
    options?.onReset?.();
  };

  const form = widget.closest('form');
  const handleFormReset = () => {
    resetCapWidget(widget);
    options?.onReset?.();
  };

  let submitTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let loadTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Detect if custom element failed to define after timeout
  if (typeof customElements !== 'undefined' && customElements.whenDefined) {
    if (!customElements.get('cap-widget')) {
      loadTimeoutId = setTimeout(() => {
        if (!customElements.get('cap-widget')) {
          (el as any).__cap_load_failed = true;
          const wrap = el.closest('.cap-captcha-wrap') || el.parentElement;
          if (wrap) {
            const errorEl = wrap.querySelector('.cap-captcha-error') as HTMLElement | null;
            if (errorEl && errorEl.style.display === 'none') {
              errorEl.textContent = CAPTCHA_MSG_NOT_LOADED;
              errorEl.style.display = 'block';
            }
          }
        }
      }, 4000);

      customElements.whenDefined('cap-widget').then(() => {
        if (loadTimeoutId) {
          clearTimeout(loadTimeoutId);
          loadTimeoutId = null;
        }
        (el as any).__cap_load_failed = false;
        const wrap = el.closest('.cap-captcha-wrap') || el.parentElement;
        if (wrap && !(el as any).__cap_error) {
          const errorEl = wrap.querySelector('.cap-captcha-error') as HTMLElement | null;
          if (errorEl && errorEl.textContent === CAPTCHA_MSG_NOT_LOADED) {
            errorEl.style.display = 'none';
            errorEl.textContent = '';
            wrap.classList.remove('cap-invalid');
          }
        }
      });
    }
  }

  const handleFormSubmitCapture = (e: Event) => {
    const { valid } = validateCaptcha(widget);
    if (!valid) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    const attrReset = widget.getAttribute('data-cap-reset-on-submit');
    const shouldReset =
      options?.resetOnSubmit !== undefined
        ? options.resetOnSubmit
        : attrReset !== 'false';

    if (shouldReset) {
      if (submitTimeoutId) {
        clearTimeout(submitTimeoutId);
      }
      submitTimeoutId = setTimeout(() => {
        submitTimeoutId = null;
        resetCapWidget(widget);
        options?.onReset?.();
      }, 0);
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
  widget.addEventListener('reset', handleReset);
  widget.addEventListener('invalid', handleInvalid);

  let submitButtons: HTMLElement[] = [];
  if (form) {
    form.addEventListener('reset', handleFormReset);
    form.addEventListener('submit', handleFormSubmitCapture, true);
    submitButtons = Array.from(
      form.querySelectorAll<HTMLElement>('button[type="submit"], input[type="submit"]')
    );
    submitButtons.forEach((btn) => btn.addEventListener('click', handleBtnClick, true));
  }

  return () => {
    if (submitTimeoutId) {
      clearTimeout(submitTimeoutId);
      submitTimeoutId = null;
    }
    if (loadTimeoutId) {
      clearTimeout(loadTimeoutId);
      loadTimeoutId = null;
    }
    widget.removeEventListener('solve', handleSolve);
    widget.removeEventListener('error', handleError);
    widget.removeEventListener('progress', handleProgress);
    widget.removeEventListener('reset', handleReset);
    widget.removeEventListener('invalid', handleInvalid);
    if (form) {
      form.removeEventListener('reset', handleFormReset);
      form.removeEventListener('submit', handleFormSubmitCapture, true);
      submitButtons.forEach((btn) => btn.removeEventListener('click', handleBtnClick, true));
    }
  };
}
