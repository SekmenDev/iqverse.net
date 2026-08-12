'use client';

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      'cap-widget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'data-cap-api-endpoint'?: string;
          'data-cap-disable-haptics'?: boolean | string;
          'data-cap-worker-count'?: number | string;
          required?: boolean;
        },
        HTMLElement
      >;
    }
  }
  namespace JSX {
    interface IntrinsicElements {
      'cap-widget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'data-cap-api-endpoint'?: string;
          'data-cap-disable-haptics'?: boolean | string;
          'data-cap-worker-count'?: number | string;
          required?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

export interface CapCaptchaRef {
  reset: () => void;
}

export interface CapCaptchaProps {
  endpoint?: string;
  onSolve?: (token: string) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
  onReset?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const CapCaptcha = forwardRef<CapCaptchaRef, CapCaptchaProps>(function CapCaptcha(
  {
    endpoint = 'https://captcha.sekmen.dev/b2962a01e4/',
    onSolve,
    onError,
    onProgress,
    onReset,
    className,
    style,
  },
  ref
) {
  const widgetRef = useRef<HTMLElement>(null);
  const [resetKey, setResetKey] = useState(0);

  const reset = React.useCallback(() => {
    const el = widgetRef.current;
    if (el && typeof (el as any).reset === 'function') {
      try {
        (el as any).reset();
      } catch {
        // Fallback to key increment if element reset throws
      }
    }
    setResetKey((k) => k + 1);
    onReset?.();
  }, [onReset]);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  useEffect(() => {
    const el = widgetRef.current;
    if (!el) return;

    const handleSolve = (e: Event) => {
      const customEvt = e as CustomEvent<{ token: string }>;
      if (onSolve && customEvt.detail?.token) {
        onSolve(customEvt.detail.token);
      }
    };

    const handleError = (e: Event) => {
      const customEvt = e as CustomEvent<{ message: string }>;
      if (onError) {
        onError(customEvt.detail?.message || 'Captcha error');
      }
    };

    const handleProgress = (e: Event) => {
      const customEvt = e as CustomEvent<{ progress: number }>;
      if (onProgress && customEvt.detail?.progress !== undefined) {
        onProgress(customEvt.detail.progress);
      }
    };

    el.addEventListener('solve', handleSolve);
    el.addEventListener('error', handleError);
    el.addEventListener('progress', handleProgress);

    const form = el.closest('form');
    if (form) {
      form.addEventListener('submit', reset);
      form.addEventListener('reset', reset);
    }

    return () => {
      el.removeEventListener('solve', handleSolve);
      el.removeEventListener('error', handleError);
      el.removeEventListener('progress', handleProgress);
      if (form) {
        form.removeEventListener('submit', reset);
        form.removeEventListener('reset', reset);
      }
    };
  }, [onSolve, onError, onProgress, reset]);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', margin: '8px 0', ...style }} className={className}>
      <cap-widget
        key={resetKey}
        ref={widgetRef as any}
        data-cap-api-endpoint={endpoint}
      />
    </div>
  );
});

export default CapCaptcha;

