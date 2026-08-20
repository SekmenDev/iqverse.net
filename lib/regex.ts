export interface RegexMatchItem {
  match: string;
  index: number;
  groups?: string[];
  namedGroups?: Record<string, string>;
}

export interface RegexEvaluationResult {
  isValid: boolean;
  matches: RegexMatchItem[];
  matchCount: number;
  replacedText: string;
  error?: string;
  errorMessage?: string;
}

export function safeCompileRegex(pattern: string, flags: string = ''): RegExp | null {
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

export function evaluateRegex(
  pattern: string,
  flags: string,
  testText: string,
  replacement: string = ''
): RegexEvaluationResult {
  try {
    let effectiveFlags = flags;
    if (!effectiveFlags.includes('g')) {
      effectiveFlags += 'g';
    }

    const regex = new RegExp(pattern, effectiveFlags);
    const matches: RegexMatchItem[] = [];

    const rawMatches = Array.from(testText.matchAll(regex));
    rawMatches.forEach((m) => {
      matches.push({
        match: m[0],
        index: m.index ?? -1,
        groups: m.slice(1),
        namedGroups: m.groups,
      });
    });

    const replacedText = testText.replace(regex, replacement);

    return {
      isValid: true,
      matches,
      matchCount: matches.length,
      replacedText,
    };
  } catch (err: any) {
    const msg = err.message || 'Invalid regular expression syntax.';
    return {
      isValid: false,
      matches: [],
      matchCount: 0,
      replacedText: '',
      error: msg,
      errorMessage: msg,
    };
  }
}
