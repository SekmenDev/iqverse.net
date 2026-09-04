import { describe, it, expect } from 'vitest';
import { detectAutomation, type AutomationContext } from '@/lib/automation';

function context(overrides: Partial<AutomationContext> = {}): AutomationContext {
  return {
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
    webdriver: false,
    pluginCount: 5,
    languageCount: 2,
    webglRenderer: 'ANGLE (NVIDIA GeForce RTX 4070)',
    outerWidth: 1512,
    outerHeight: 982,
    notificationPermission: 'default',
    hasChromeObject: true,
    hardwareConcurrency: 16,
    deviceMemory: 8,
    isChromium: true,
    ...overrides,
  };
}

function ids(overrides: Partial<AutomationContext> = {}): string[] {
  return detectAutomation(context(overrides)).clues.map(clue => clue.id);
}

describe('Automation detection (lib/automation)', () => {
  it('finds nothing on a normal desktop Chrome', () => {
    const verdict = detectAutomation(context());
    expect(verdict.confidence).toBe('unlikely');
    expect(verdict.clues).toEqual([]);
  });

  it('confirms automation from the webdriver flag', () => {
    const verdict = detectAutomation(context({ webdriver: true }));
    expect(verdict.confidence).toBe('confirmed');
    expect(verdict.headline).toContain('under automation');
  });

  it('confirms automation from a headless user agent', () => {
    expect(
      ids({ userAgent: 'Mozilla/5.0 HeadlessChrome/151.0.0.0 Safari/537.36' })
    ).toContain('automation-headless-ua');
  });

  it('flags a window with no outer dimensions', () => {
    expect(ids({ outerWidth: 0, outerHeight: 0 })).toContain('automation-no-window');
  });

  it('flags a missing window.chrome object on Chromium', () => {
    expect(ids({ hasChromeObject: false })).toContain('automation-chrome-object');
  });

  it('flags notifications denied by default', () => {
    expect(ids({ notificationPermission: 'denied' })).toContain('automation-notifications');
  });

  it('flags software rendering', () => {
    expect(ids({ webglRenderer: 'Google SwiftShader' })).toContain('automation-software-gpu');
    expect(ids({ webglRenderer: 'llvmpipe (LLVM 15.0.7)' })).toContain('automation-software-gpu');
  });

  it('flags an empty language list', () => {
    expect(ids({ languageCount: 0 })).toContain('automation-languages');
  });

  it('flags missing hardware hints only when both are absent', () => {
    expect(ids({ deviceMemory: null, hardwareConcurrency: null })).toContain(
      'automation-missing-hardware'
    );
    expect(ids({ deviceMemory: null })).not.toContain('automation-missing-hardware');
  });

  it('skips Chromium-only checks on other engines', () => {
    expect(
      ids({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0',
        isChromium: false,
        pluginCount: 0,
        hasChromeObject: false,
        notificationPermission: 'denied',
        deviceMemory: null,
        hardwareConcurrency: null,
      })
    ).toEqual([]);
  });

  it('accumulates weaker clues without ever reaching certainty', () => {
    const verdict = detectAutomation(
      context({
        pluginCount: 0,
        hasChromeObject: false,
        notificationPermission: 'denied',
        webglRenderer: 'Google SwiftShader',
      })
    );
    expect(verdict.clues).toHaveLength(4);
    expect(verdict.score).toBeGreaterThan(100);
    expect(verdict.confidence).toBe('likely');
  });
});
