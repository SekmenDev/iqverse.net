import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import type {
  DateMatch,
  DictionaryMatch,
  MatchExtended,
  OptionsGraph,
  RegexMatch,
  RepeatMatch,
  SequenceMatch,
  SpatialMatch,
  WordSequenceMatch,
} from '@zxcvbn-ts/core';
import { adjacencyGraphs, dictionary as commonDictionary } from '@zxcvbn-ts/language-common';
import { dictionary as englishDictionary, translations } from '@zxcvbn-ts/language-en';

export type PasswordRating = 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';

export interface CharacterSets {
  hasLower: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  charsetSize: number;
}

export interface DetectedPattern {
  token: string;
  label: string;
  detail: string;
}

export interface PasswordAnalysis extends CharacterSets {
  length: number;
  score: 0 | 1 | 2 | 3 | 4;
  rating: PasswordRating;
  color: string;
  entropy: number;
  guesses: number;
  crackTimeOfflineFast: string;
  crackTimeOfflineSlow: string;
  crackTimeOnline: string;
  crackTimeOnlineThrottled: string;
  warning: string;
  suggestions: string[];
  patterns: DetectedPattern[];
}

const RATINGS: Record<number, { rating: PasswordRating; color: string }> = {
  0: { rating: 'Very Weak', color: '#ff4d4f' },
  1: { rating: 'Weak', color: '#ff9800' },
  2: { rating: 'Medium', color: '#faad14' },
  3: { rating: 'Strong', color: '#8bc34a' },
  4: { rating: 'Very Strong', color: '#4caf50' },
};

const DICTIONARY_LABELS: Record<string, string> = {
  passwords: 'Breached password',
  commonWords: 'Common English word',
  firstnames: 'Common first name',
  lastnames: 'Common last name',
  wikipedia: 'Wikipedia term',
  diceware: 'Diceware word',
  userInputs: 'Site or personal term',
};

const zxcvbn = new ZxcvbnFactory({
  translations,
  graphs: adjacencyGraphs as unknown as OptionsGraph,
  dictionary: { ...commonDictionary, ...englishDictionary },
  useLevenshteinDistance: true,
});

export function getCharacterSets(password: string): CharacterSets {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  let charsetSize = 0;
  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasDigit) charsetSize += 10;
  if (hasSymbol) charsetSize += 33;

  return { hasLower, hasUpper, hasDigit, hasSymbol, charsetSize };
}

function labelDictionary(name: string): string {
  const base = name.replace(/-(common|en)$/, '');
  return DICTIONARY_LABELS[base] ?? 'Dictionary word';
}

function describeMatch(match: MatchExtended): DetectedPattern | null {
  switch (match.pattern) {
    case 'dictionary': {
      const entry = match as DictionaryMatch;
      const notes = [`ranked #${entry.rank}`];
      if (entry.l33t) notes.push('leetspeak substitutions do not help');
      if (entry.reversed) notes.push('reversed spelling does not help');
      return {
        token: entry.token,
        label: labelDictionary(entry.dictionaryName),
        detail: notes.join(', '),
      };
    }
    case 'spatial': {
      const entry = match as SpatialMatch;
      const turns = entry.turns === 1 ? 'straight run' : `${entry.turns} turns`;
      return {
        token: entry.token,
        label: 'Keyboard pattern',
        detail: `${entry.graph} layout, ${turns}`,
      };
    }
    case 'repeat': {
      const entry = match as RepeatMatch;
      const base = Array.isArray(entry.baseToken) ? entry.baseToken.join('') : entry.baseToken;
      return {
        token: entry.token,
        label: 'Repeated characters',
        detail: `"${base}" repeated ${entry.repeatCount} times`,
      };
    }
    case 'sequence': {
      const entry = match as SequenceMatch;
      return {
        token: entry.token,
        label: 'Predictable sequence',
        detail: `${entry.sequenceName}, ${entry.ascending ? 'ascending' : 'descending'}`,
      };
    }
    case 'wordSequence': {
      const entry = match as WordSequenceMatch;
      return {
        token: entry.token,
        label: 'Word sequence',
        detail: `${entry.wordCount} related words in order`,
      };
    }
    case 'date': {
      const entry = match as DateMatch;
      return { token: entry.token, label: 'Date', detail: `looks like the year ${entry.year}` };
    }
    case 'regex': {
      const entry = match as RegexMatch;
      return {
        token: entry.token,
        label: entry.regexName === 'recentYear' ? 'Recent year' : 'Predictable format',
        detail: 'guessed early by cracking tools',
      };
    }
    default:
      return null;
  }
}

export function analyzePassword(password: string, userInputs: string[] = []): PasswordAnalysis {
  const sets = getCharacterSets(password);

  if (password.length === 0) {
    return {
      ...sets,
      length: 0,
      score: 0,
      rating: 'Very Weak',
      color: RATINGS[0].color,
      entropy: 0,
      guesses: 0,
      crackTimeOfflineFast: 'less than a second',
      crackTimeOfflineSlow: 'less than a second',
      crackTimeOnline: 'less than a second',
      crackTimeOnlineThrottled: 'less than a second',
      warning: '',
      suggestions: ['Enter a password to analyze it.'],
      patterns: [],
    };
  }

  const result = zxcvbn.check(password, userInputs);
  const { rating, color } = RATINGS[result.score];

  const suggestions = [...result.feedback.suggestions];
  if (password.length < 12) {
    suggestions.unshift('Use at least 12 characters. Length beats complexity.');
  }

  return {
    ...sets,
    length: password.length,
    score: result.score,
    rating,
    color,
    entropy: Math.round(result.guessesLog10 * Math.log2(10) * 10) / 10,
    guesses: result.guesses,
    crackTimeOfflineFast: result.crackTimes.offlineFastHashingXPerSecond.display,
    crackTimeOfflineSlow: result.crackTimes.offlineSlowHashingXPerSecond.display,
    crackTimeOnline: result.crackTimes.onlineNoThrottlingXPerSecond.display,
    crackTimeOnlineThrottled: result.crackTimes.onlineThrottlingXPerHour.display,
    warning: result.feedback.warning ?? '',
    suggestions,
    patterns: result.sequence
      .map(describeMatch)
      .filter((pattern): pattern is DetectedPattern => pattern !== null),
  };
}
