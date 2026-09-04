import { describe, it, expect } from 'vitest';
import {
  EMOJI_PROBES,
  MAX_ENTROPY_BITS,
  SIGNAL_ADVICE,
  UNAVAILABLE,
  canvasFingerprintSource,
  collectSignals,
  computeFingerprintId,
  detectEmojiSupport,
  inferKeyboardLayout,
  readKeyboardLayout,
  readWebgpu,
  countByImportance,
  describeUniqueness,
  detectFonts,
  effectiveEntropyBits,
  filterSignals,
  formatBytes,
  formatCount,
  groupSignals,
  hashText,
  isAvailable,
  mathFingerprint,
  signalsToJson,
  sortSignals,
  totalEntropyBits,
  type Signal,
} from '@/lib/fingerprint';

function signal(overrides: Partial<Signal> & Pick<Signal, 'id'>): Signal {
  return {
    label: overrides.id,
    group: 'Browser & Engine',
    importance: 'low',
    entropyBits: 1,
    value: 'value',
    note: 'note',
    stable: true,
    ...overrides,
  };
}

const sample: Signal[] = [
  signal({ id: 'low-a', importance: 'low', entropyBits: 0.5, value: 'Yes' }),
  signal({ id: 'critical', importance: 'critical', entropyBits: 8.3, value: 'abc123' }),
  signal({ id: 'high', importance: 'high', entropyBits: 4.8, value: '1920x1080' }),
  signal({ id: 'medium', importance: 'medium', entropyBits: 2, value: UNAVAILABLE }),
  signal({ id: 'low-b', importance: 'low', entropyBits: 3, value: 'unstable', stable: false }),
];

describe('Fingerprint signal ranking (lib/fingerprint)', () => {
  it('sorts by importance first, then by entropy', () => {
    expect(sortSignals(sample).map(s => s.id)).toEqual([
      'critical',
      'high',
      'medium',
      'low-b',
      'low-a',
    ]);
  });

  it('does not mutate the input array', () => {
    const input = [...sample];
    sortSignals(input);
    expect(input.map(s => s.id)).toEqual(sample.map(s => s.id));
  });

  it('treats the placeholder value as unavailable', () => {
    expect(isAvailable(signal({ id: 'a', value: UNAVAILABLE }))).toBe(false);
    expect(isAvailable(signal({ id: 'a', value: '   ' }))).toBe(false);
    expect(isAvailable(signal({ id: 'a', value: '0' }))).toBe(true);
  });

  it('counts signals per importance level', () => {
    expect(countByImportance(sample)).toEqual({
      all: 5,
      critical: 1,
      high: 1,
      medium: 1,
      low: 2,
    });
  });

  it('groups signals under their group heading', () => {
    const grouped = groupSignals([
      signal({ id: 'canvas', group: 'Fingerprint Hashes', importance: 'critical' }),
      signal({ id: 'ua', group: 'Browser & Engine' }),
    ]);
    expect(grouped.map(entry => entry.group)).toEqual(['Fingerprint Hashes', 'Browser & Engine']);
    expect(grouped[0].signals).toHaveLength(1);
  });
});

describe('Fingerprint filtering (lib/fingerprint)', () => {
  it('filters by importance level', () => {
    expect(filterSignals(sample, '', 'low').map(s => s.id)).toEqual(['low-a', 'low-b']);
    expect(filterSignals(sample, '', 'all')).toHaveLength(5);
  });

  it('matches the query against label, value, group and note', () => {
    expect(filterSignals(sample, '1920', 'all').map(s => s.id)).toEqual(['high']);
    expect(filterSignals(sample, 'BROWSER & ENGINE', 'all')).toHaveLength(5);
    expect(filterSignals(sample, 'nothing-here', 'all')).toEqual([]);
  });

  it('combines query and importance filters', () => {
    expect(filterSignals(sample, 'unstable', 'critical')).toEqual([]);
    expect(filterSignals(sample, 'unstable', 'low').map(s => s.id)).toEqual(['low-b']);
  });
});

describe('Fingerprint entropy maths (lib/fingerprint)', () => {
  it('sums entropy only for available signals', () => {
    expect(totalEntropyBits(sample)).toBe(16.6);
  });

  it('caps effective entropy at the world population', () => {
    const many = Array.from({ length: 20 }, (_, index) =>
      signal({ id: `s${index}`, entropyBits: 5 })
    );
    expect(totalEntropyBits(many)).toBe(100);
    expect(effectiveEntropyBits(many)).toBe(MAX_ENTROPY_BITS);
  });

  it('rates identifiability from entropy', () => {
    expect(describeUniqueness(4).rating).toBe('Low');
    expect(describeUniqueness(12).rating).toBe('Moderate');
    expect(describeUniqueness(20).rating).toBe('High');
    expect(describeUniqueness(30).rating).toBe('Very High');
  });

  it('reports the crowd size as a power of two', () => {
    const verdict = describeUniqueness(10);
    expect(verdict.oneIn).toBe(1024);
    expect(verdict.summary).toContain('1 in 1 thousand');
  });

  it('never rates beyond the cap', () => {
    expect(describeUniqueness(500).bits).toBe(MAX_ENTROPY_BITS);
  });
});

describe('Fingerprint formatting (lib/fingerprint)', () => {
  it('formats large counts with word suffixes', () => {
    expect(formatCount(42)).toBe('42');
    expect(formatCount(4200)).toBe('4 thousand');
    expect(formatCount(4.2e6)).toBe('4.2 million');
    expect(formatCount(4.2e9)).toBe('4.2 billion');
    expect(formatCount(4.2e12)).toBe('4.2 trillion');
  });

  it('formats byte quotas', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(2 * 1024 ** 3)).toBe('2.0 GB');
  });
});

describe('Fingerprint identity (lib/fingerprint)', () => {
  it('hashes to a stable lowercase hex string', async () => {
    const hash = await hashText('iqverse');
    expect(hash).toHaveLength(32);
    expect(hash).toMatch(/^[0-9a-f]+$/);
    expect(await hashText('iqverse')).toBe(hash);
  });

  it('ignores unstable and unavailable signals in the fingerprint ID', async () => {
    const withUnstable = await computeFingerprintId(sample);
    const withoutUnstable = await computeFingerprintId(
      sample.filter(s => s.stable && s.value !== UNAVAILABLE)
    );
    expect(withUnstable).toBe(withoutUnstable);
  });

  it('changes the fingerprint ID when a stable value changes', async () => {
    const before = await computeFingerprintId(sample);
    const after = await computeFingerprintId([
      ...sample.filter(s => s.id !== 'critical'),
      signal({ id: 'critical', importance: 'critical', entropyBits: 8.3, value: 'different' }),
    ]);
    expect(after).not.toBe(before);
  });

  it('is independent of signal order', async () => {
    const forward = await computeFingerprintId(sample);
    const reversed = await computeFingerprintId([...sample].reverse());
    expect(reversed).toBe(forward);
  });

  it('exports sorted JSON with the identity metadata', () => {
    const parsed: unknown = JSON.parse(signalsToJson(sample, 'abc'));
    const report = parsed as {
      fingerprintId: string;
      rawEntropyBits: number;
      signals: Array<{ id: string }>;
    };
    expect(report.fingerprintId).toBe('abc');
    expect(report.rawEntropyBits).toBe(16.6);
    expect(report.signals[0].id).toBe('critical');
  });
});

describe('Fingerprint browser probes (lib/fingerprint)', () => {
  it('produces a deterministic math fingerprint', () => {
    expect(mathFingerprint()).toBe(mathFingerprint());
    expect(mathFingerprint()).toContain('acos:');
  });

  it('returns null when the canvas has no 2D context', () => {
    expect(canvasFingerprintSource()).toBeNull();
  });

  it('detects no fonts when text measurement is unavailable', () => {
    expect(detectFonts(['Arial', 'Comic Sans MS'])).toEqual([]);
  });

  it('returns null for emoji support when text measurement is unavailable', () => {
    expect(detectEmojiSupport()).toBeNull();
  });

  it('covers one emoji per Unicode release in ascending order', () => {
    const versions = EMOJI_PROBES.map(probe => Number.parseFloat(probe.version));
    expect(versions).toEqual([...versions].sort((a, b) => a - b));
    expect(new Set(EMOJI_PROBES.map(probe => probe.emoji)).size).toBe(EMOJI_PROBES.length);
  });

  it('reports the Keyboard Map API as unavailable when absent', async () => {
    await expect(readKeyboardLayout()).resolves.toBe(UNAVAILABLE);
  });

  it('returns null for WebGPU when navigator.gpu is absent', async () => {
    await expect(readWebgpu()).resolves.toBeNull();
  });
});

describe('Keyboard layout inference (lib/fingerprint)', () => {
  it('names the common physical layouts', () => {
    expect(inferKeyboardLayout({ KeyQ: 'q', KeyW: 'w', KeyY: 'y', KeyZ: 'z' })).toBe('QWERTY');
    expect(inferKeyboardLayout({ KeyQ: 'q', KeyW: 'w', KeyY: 'z', KeyZ: 'y' })).toBe('QWERTZ');
    expect(inferKeyboardLayout({ KeyQ: 'a', KeyW: 'z', KeyY: 'y', KeyZ: 'w' })).toBe('AZERTY');
  });

  it('falls back to Other for layouts it cannot name', () => {
    expect(inferKeyboardLayout({ KeyQ: 'ф', KeyW: 'ц', KeyY: 'н', KeyZ: 'я' })).toBe('Other');
    expect(inferKeyboardLayout({})).toBe('Other');
  });

  it('ignores case differences from the layout map', () => {
    expect(inferKeyboardLayout({ KeyQ: 'Q', KeyW: 'W', KeyY: 'Y', KeyZ: 'Z' })).toBe('QWERTY');
  });
});

describe('Mitigation advice (lib/fingerprint)', () => {
  it('only maps advice onto signal ids that exist', async () => {
    const signalIds = new Set((await collectSignals()).map(signal => signal.id));
    for (const id of Object.keys(SIGNAL_ADVICE)) {
      expect(signalIds.has(id)).toBe(true);
    }
  });

  it('covers every critical signal', async () => {
    const critical = (await collectSignals()).filter(signal => signal.importance === 'critical');
    expect(critical.length).toBeGreaterThan(0);
    for (const signal of critical) {
      expect(SIGNAL_ADVICE[signal.id]).toBeTruthy();
    }
  });
});
