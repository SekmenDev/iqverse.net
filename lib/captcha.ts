export const DEFAULT_CAPTCHA_ENDPOINT = 'https://captcha.sekmen.dev/b2962a01e4/';

export interface CapWidgetElement extends HTMLElement {
  reset?: () => void;
  token?: string;
  value?: string;
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
 * Resets a cap-widget element if it exists and supports reset.
 */
export function resetCapWidget(widget: HTMLElement | null | undefined): boolean {
  if (!widget) return false;
  const el = widget as CapWidgetElement;
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
 * Attaches event listeners to a cap-widget element and binds auto-reset to its parent form.
 */
export function bindCapWidget(
  widget: HTMLElement,
  options?: CapCaptchaOptions
): () => void {
  const handleSolve = (e: Event) => {
    const customEvt = e as CustomEvent<CapSolveDetail>;
    if (options?.onSolve && customEvt.detail?.token) {
      options.onSolve(customEvt.detail.token);
    }
  };

  const handleError = (e: Event) => {
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
  const handleFormResetOrSubmit = () => {
    resetCapWidget(widget);
    options?.onReset?.();
  };

  widget.addEventListener('solve', handleSolve);
  widget.addEventListener('error', handleError);
  widget.addEventListener('progress', handleProgress);

  if (form) {
    form.addEventListener('submit', handleFormResetOrSubmit);
    form.addEventListener('reset', handleFormResetOrSubmit);
  }

  return () => {
    widget.removeEventListener('solve', handleSolve);
    widget.removeEventListener('error', handleError);
    widget.removeEventListener('progress', handleProgress);
    if (form) {
      form.removeEventListener('submit', handleFormResetOrSubmit);
      form.removeEventListener('reset', handleFormResetOrSubmit);
    }
  };
}
