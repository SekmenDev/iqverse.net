import { buildVerdict, type Clue, type Verdict } from './verdict';
import { readPluginCount } from './utils';

export interface AutomationContext {
  userAgent: string;
  webdriver: boolean;
  pluginCount: number;
  languageCount: number;
  webglRenderer: string;
  outerWidth: number | null;
  outerHeight: number | null;
  notificationPermission: string | null;
  hasChromeObject: boolean;
  hardwareConcurrency: number | null;
  deviceMemory: number | null;
  isChromium: boolean;
}

export function detectAutomation(context: AutomationContext): Verdict {
  const clues: Clue[] = [];

  if (context.webdriver) {
    clues.push({
      id: 'automation-webdriver',
      label: 'navigator.webdriver is true',
      detail: 'The browser openly declares that it is under WebDriver or DevTools Protocol control.',
      weight: 100,
    });
  }

  if (/Headless/i.test(context.userAgent)) {
    clues.push({
      id: 'automation-headless-ua',
      label: 'User agent says headless',
      detail: 'The user agent contains "Headless", which Chrome adds when it runs without a window.',
      weight: 100,
    });
  }

  if (
    context.outerWidth !== null &&
    context.outerHeight !== null &&
    (context.outerWidth === 0 || context.outerHeight === 0)
  ) {
    clues.push({
      id: 'automation-no-window',
      label: 'Window has no outer dimensions',
      detail: 'window.outerWidth or outerHeight is 0, so there is no real browser chrome around this page.',
      weight: 50,
    });
  }

  if (context.isChromium && context.pluginCount === 0) {
    clues.push({
      id: 'automation-plugins',
      label: 'No plugins on a Chromium build',
      detail: 'Chromium ships a fixed set of PDF viewer plugin entries. Automation runtimes commonly report none.',
      weight: 25,
    });
  }

  if (context.isChromium && !context.hasChromeObject) {
    clues.push({
      id: 'automation-chrome-object',
      label: 'window.chrome is missing',
      detail: 'Every genuine Chrome build exposes a window.chrome object. Its absence points to a stripped or spoofed runtime.',
      weight: 30,
    });
  }

  if (context.isChromium && context.notificationPermission === 'denied') {
    clues.push({
      id: 'automation-notifications',
      label: 'Notifications denied by default',
      detail: 'Headless Chrome reports notification permission as denied while a normal profile reports default.',
      weight: 25,
    });
  }

  if (/swiftshader|llvmpipe|software/i.test(context.webglRenderer)) {
    clues.push({
      id: 'automation-software-gpu',
      label: 'Software rendering in use',
      detail: `WebGL renders through "${context.webglRenderer}" rather than a physical GPU, which is the default in headless and virtualised environments.`,
      weight: 25,
    });
  }

  if (context.languageCount === 0) {
    clues.push({
      id: 'automation-languages',
      label: 'Empty language list',
      detail: 'navigator.languages is empty. Real browsers always carry at least one locale.',
      weight: 30,
    });
  }

  if (context.isChromium && context.deviceMemory === null && context.hardwareConcurrency === null) {
    clues.push({
      id: 'automation-missing-hardware',
      label: 'Hardware hints missing on Chromium',
      detail: 'Chromium normally reports both deviceMemory and hardwareConcurrency. Neither is present here.',
      weight: 20,
    });
  }

  return buildVerdict(
    clues,
    {
      confirmed: 'This browser is under automation',
      likely: 'Automation or a headless runtime is very likely',
      possible: 'Some automation indicators found',
      unlikely: 'No automation indicators',
    },
    { requireDefinitive: true }
  );
}

type ChromiumWindow = Window & { chrome?: unknown };

export function readAutomationContext(webglRenderer: string): AutomationContext {
  const hasNavigator = typeof navigator !== 'undefined';
  const hasWindow = typeof window !== 'undefined';
  const userAgent = hasNavigator ? navigator.userAgent : '';
  const memoryNavigator = navigator as Navigator & { deviceMemory?: number };

  let notificationPermission: string | null = null;
  try {
    notificationPermission = typeof Notification === 'undefined' ? null : Notification.permission;
  } catch {
    notificationPermission = null;
  }

  return {
    userAgent,
    webdriver: hasNavigator && navigator.webdriver === true,
    pluginCount: readPluginCount(),
    languageCount: hasNavigator ? navigator.languages.length : 0,
    webglRenderer,
    outerWidth: hasWindow ? window.outerWidth : null,
    outerHeight: hasWindow ? window.outerHeight : null,
    notificationPermission,
    hasChromeObject: hasWindow && (window as ChromiumWindow).chrome !== undefined,
    hardwareConcurrency: hasNavigator ? (navigator.hardwareConcurrency ?? null) : null,
    deviceMemory: hasNavigator ? (memoryNavigator.deviceMemory ?? null) : null,
    isChromium: /Chrome\/|Chromium\/|CriOS\//.test(userAgent) && !/Firefox\//.test(userAgent),
  };
}
