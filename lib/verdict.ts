export type Confidence = 'confirmed' | 'likely' | 'possible' | 'unlikely';

export const CONFIDENCE_COLORS: Record<Confidence, string> = {
  confirmed: '#ff4d4f',
  likely: '#ff9800',
  possible: '#faad14',
  unlikely: '#4caf50',
};

export interface Clue {
  id: string;
  label: string;
  detail: string;
  weight: number;
}

export interface Verdict {
  confidence: Confidence;
  score: number;
  headline: string;
  color: string;
  clues: Clue[];
}

export function scoreToConfidence(score: number): Confidence {
  if (score >= 100) return 'confirmed';
  if (score >= 60) return 'likely';
  if (score >= 30) return 'possible';
  return 'unlikely';
}

/** A single clue at this weight is proof on its own. */
export const DEFINITIVE_WEIGHT = 100;

/** Highest score that still grades below 'confirmed'. */
export const INCONCLUSIVE_CEILING = 99;

export interface VerdictOptions {
  /** Ceiling applied before grading, for checks that can never be certain. */
  maxScore?: number;
  /**
   * Withhold 'confirmed' unless one clue is definitive on its own, so a pile of
   * circumstantial evidence cannot add up to certainty.
   */
  requireDefinitive?: boolean;
}

export function buildVerdict(
  clues: Clue[],
  headlines: Record<Confidence, string>,
  options: VerdictOptions = {}
): Verdict {
  const score = clues.reduce((sum, clue) => sum + clue.weight, 0);

  const definitive = clues.some(clue => clue.weight >= DEFINITIVE_WEIGHT);
  const ceiling =
    options.requireDefinitive === true && !definitive
      ? Math.min(options.maxScore ?? INCONCLUSIVE_CEILING, INCONCLUSIVE_CEILING)
      : options.maxScore;

  const graded = ceiling === undefined ? score : Math.min(score, ceiling);
  const confidence = scoreToConfidence(graded);

  return {
    confidence,
    score,
    headline: headlines[confidence],
    color: CONFIDENCE_COLORS[confidence],
    clues,
  };
}
