import { describe, it, expect } from 'vitest';
import { CONFIDENCE_COLORS, buildVerdict, scoreToConfidence, type Clue } from '@/lib/verdict';

const HEADLINES = {
  confirmed: 'certain',
  likely: 'probable',
  possible: 'maybe',
  unlikely: 'no',
} as const;

function clue(weight: number, id = `c${weight}`): Clue {
  return { id, label: id, detail: 'detail', weight };
}

describe('Verdict grading (lib/verdict)', () => {
  it('maps scores to confidence bands', () => {
    expect(scoreToConfidence(0)).toBe('unlikely');
    expect(scoreToConfidence(29)).toBe('unlikely');
    expect(scoreToConfidence(30)).toBe('possible');
    expect(scoreToConfidence(59)).toBe('possible');
    expect(scoreToConfidence(60)).toBe('likely');
    expect(scoreToConfidence(99)).toBe('likely');
    expect(scoreToConfidence(100)).toBe('confirmed');
  });

  it('sums clue weights and picks the matching headline and colour', () => {
    const verdict = buildVerdict([clue(35), clue(30)], HEADLINES);
    expect(verdict.score).toBe(65);
    expect(verdict.confidence).toBe('likely');
    expect(verdict.headline).toBe('probable');
    expect(verdict.color).toBe(CONFIDENCE_COLORS.likely);
  });

  it('returns an unlikely verdict for no clues', () => {
    const verdict = buildVerdict([], HEADLINES);
    expect(verdict.score).toBe(0);
    expect(verdict.confidence).toBe('unlikely');
    expect(verdict.clues).toEqual([]);
  });

  it('caps grading without hiding the real score', () => {
    const verdict = buildVerdict([clue(100), clue(60)], HEADLINES, { maxScore: 99 });
    expect(verdict.score).toBe(160);
    expect(verdict.confidence).toBe('likely');
  });

  it('withholds certainty from circumstantial clues alone', () => {
    const verdict = buildVerdict([clue(50), clue(50), clue(40)], HEADLINES, {
      requireDefinitive: true,
    });
    expect(verdict.score).toBe(140);
    expect(verdict.confidence).toBe('likely');
  });

  it('grants certainty when one clue is definitive', () => {
    const verdict = buildVerdict([clue(100)], HEADLINES, { requireDefinitive: true });
    expect(verdict.confidence).toBe('confirmed');
  });

  it('leaves lower bands untouched when requiring a definitive clue', () => {
    expect(buildVerdict([clue(35)], HEADLINES, { requireDefinitive: true }).confidence).toBe(
      'possible'
    );
    expect(buildVerdict([], HEADLINES, { requireDefinitive: true }).confidence).toBe('unlikely');
  });
});
