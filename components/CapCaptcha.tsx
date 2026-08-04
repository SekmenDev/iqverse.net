'use client';

import React, { useEffect, useRef } from 'react';

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

interface CapCaptchaProps {
  endpoint?: string;
  onSolve?: (token: string) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function CapCaptcha({
  endpoint = 'https://captcha.sekmen.dev/31445706ae/',
  onSolve,
  onError,
  onProgress,
  className,
  style,
}: CapCaptchaProps) {
  const widgetRef = useRef<HTMLElement>(null);

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

    return () => {
      el.removeEventListener('solve', handleSolve);
      el.removeEventListener('error', handleError);
      el.removeEventListener('progress', handleProgress);
    };
  }, [onSolve, onError, onProgress]);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', margin: '8px 0', ...style }} className={className}>
      <cap-widget
        ref={widgetRef as any}
        data-cap-api-endpoint={endpoint}
      />
    </div>
  );
}
