'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { getSecureRandomNumber } from '@/lib/tools';

import {
  PaletteGroup,
  hslToHex,
  generatePalette,
  luminance,
  contrastRatio,
  wcagPass,
  simulateColorBlind,
  formatColor,
  exportCSS,
  exportSass,
  exportTailwind,
  exportFigma,
  exportJSON,
  exportSwift,
} from '@/lib/colors';
import sharedStyles from '@/styles/shared-tool-styles.module.css';
import styles from '@/styles/chromata.module.css';

type SavedPalette = {
  id: number;
  seed: string;
  harmony: string;
  shades: number;
  preview: string[];
  timestamp: string;
  palette: PaletteGroup[];
};

const HARMONY_OPTIONS = [
  { value: 'complementary', label: 'Complementary' },
  { value: 'triadic', label: 'Triadic' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'split-complementary', label: 'Split Complementary' },
  { value: 'tetradic', label: 'Tetradic' },
  { value: 'monochromatic', label: 'Monochromatic' },
];

const EXPORT_FORMATS = [
  { value: 'css', label: 'CSS' },
  { value: 'tailwind', label: 'Tailwind' },
  { value: 'figma', label: 'Figma' },
  { value: 'sass', label: 'SASS' },
  { value: 'json', label: 'JSON' },
  { value: 'swift', label: 'Swift' },
];

const COLOR_FORMATS = [
  { value: 'hex', label: 'HEX' },
  { value: 'rgb', label: 'RGB' },
  { value: 'hsl', label: 'HSL' },
];

const COLOR_BLIND_MODES = [
  { value: 'none', label: 'Normal' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'protanopia', label: 'Protanopia' },
  { value: 'tritanopia', label: 'Tritanopia' },
  { value: 'achromatopsia', label: 'Achromatopsia' },
];

export default function Chromata() {
  const [seedHex, setSeedHex] = useState('#6366f1');
  const [shadesCount, setShadesCount] = useState(10);
  const [lightnessCurve, setLightnessCurve] = useState('linear');
  const [satBoost, setSatBoost] = useState(0);
  const [harmony, setHarmony] = useState('complementary');
  const [includeNeutrals, setIncludeNeutrals] = useState(true);
  const [includeSemantic, setIncludeSemantic] = useState(true);
  const [contrastTarget, setContrastTarget] = useState('white');
  const [wcagLevel, setWcagLevel] = useState('AA');
  const [colorBlindMode, setColorBlindMode] = useState('none');
  const [hueRotate, setHueRotate] = useState(0);
  const [lightnessShift, setLightnessShift] = useState(0);
  const [exportFormat, setExportFormat] = useState('css');
  const [exportPrefix, setExportPrefix] = useState('color');
  const [colorFormat, setColorFormat] = useState('hex');
  const [viewMode, setViewMode] = useState<'strip' | 'grid'>('strip');
  const [activeStep, setActiveStep] = useState<'seed' | 'harmony' | 'refine' | 'export'>('seed');
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef<number | null>(null);

  const palette = useMemo(
    () =>
      generatePalette(
        seedHex,
        harmony,
        shadesCount,
        lightnessCurve,
        satBoost,
        hueRotate,
        lightnessShift,
        includeNeutrals,
        includeSemantic,
      ),
    [seedHex, harmony, shadesCount, lightnessCurve, satBoost, hueRotate, lightnessShift, includeNeutrals, includeSemantic],
  );

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('chromata_saved') : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        Promise.resolve().then(() => setSavedPalettes(parsed));
      } catch {
        Promise.resolve().then(() => setSavedPalettes([]));
      }
    }
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToastMessage(''), 2200);
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, [toastMessage]);

  const getExportCode = useCallback(() => {
    switch (exportFormat) {
      case 'css':
        return exportCSS(palette, exportPrefix, colorFormat);
      case 'sass':
        return exportSass(palette, exportPrefix, colorFormat);
      case 'tailwind':
        return exportTailwind(palette, exportPrefix, colorFormat);
      case 'figma':
        return exportFigma(palette, exportPrefix, colorFormat);
      case 'json':
        return exportJSON(palette, exportPrefix, colorFormat);
      case 'swift':
        return exportSwift(palette, exportPrefix);
      default:
        return exportCSS(palette, exportPrefix, colorFormat);
    }
  }, [exportFormat, palette, exportPrefix, colorFormat]);

  const codeOutput = useMemo(() => getExportCode(), [getExportCode]);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleSeedHexChange = (value: string) => {
    const normalized = value.trim();
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
      const expanded = normalized.length === 4
        ? `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
        : normalized;
      setSeedHex(expanded.toLowerCase());
    } else if (/^[0-9a-fA-F]{3}$/.test(normalized)) {
      setSeedHex(`#${normalized.toLowerCase()}`);
    } else if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
      setSeedHex(`#${normalized.toLowerCase()}`);
    } else {
      setSeedHex('#6366f1');
    }
  };

  const savePalette = () => {
    const entry: SavedPalette = {
      id: Date.now(),
      seed: seedHex,
      harmony,
      shades: shadesCount,
      preview: palette.slice(0, 2).flatMap((group) => group.shades.slice(0, 4).map((shade) => shade.hex)),
      timestamp: new Date().toLocaleString(),
      palette,
    };
    const next = [entry, ...savedPalettes].slice(0, 20);
    setSavedPalettes(next);
    window.localStorage.setItem('chromata_saved', JSON.stringify(next));
    showToast('Palette saved!');
  };

  const clearSaved = () => {
    setSavedPalettes([]);
    window.localStorage.removeItem('chromata_saved');
    showToast('Saved palettes cleared');
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(codeOutput);
    showToast('Code copied!');
  };

  const downloadFile = () => {
    const ext: Record<string, string> = {
      css: 'css',
      sass: 'scss',
      tailwind: 'js',
      figma: 'json',
      json: 'json',
      swift: 'swift',
    };
    const mime: Record<string, string> = {
      css: 'text/css',
      sass: 'text/x-scss',
      tailwind: 'application/javascript',
      figma: 'application/json',
      json: 'application/json',
      swift: 'text/swift',
    };
    const blob = new Blob([codeOutput], { type: mime[exportFormat] || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${exportPrefix || 'color'}-palette.${ext[exportFormat] || 'txt'}`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('File downloaded!');
  };

  const visiblePalette = palette;
  const totalShades = visiblePalette.reduce((sum, group) => sum + group.shades.length, 0);
  const passingCount = visiblePalette.reduce((sum, group) => {
    return sum + group.shades.filter((shade) => {
      const displayHex = simulateColorBlind(shade.hex, colorBlindMode);
      const ratioW = contrastRatio(displayHex, '#ffffff');
      const ratioB = contrastRatio(displayHex, '#000000');
      if (contrastTarget === 'white') return wcagPass(ratioW, wcagLevel);
      if (contrastTarget === 'black') return wcagPass(ratioB, wcagLevel);
      return wcagPass(ratioW, wcagLevel) || wcagPass(ratioB, wcagLevel);
    }).length;
  }, 0);
  const passPercent = totalShades ? Math.round((passingCount / totalShades) * 100) : 0;

  return (
    <div className={styles.appLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.stepsNav}>
          <button className={`${styles.stepBtn} ${activeStep === 'seed' ? styles.active : ''}`} onClick={() => setActiveStep('seed')}>
            <span className={styles.stepNum}>01</span>
            <span>Seed Color</span>
          </button>
          <button className={`${styles.stepBtn} ${activeStep === 'harmony' ? styles.active : ''}`} onClick={() => setActiveStep('harmony')}>
            <span className={styles.stepNum}>02</span>
            <span>Harmony</span>
          </button>
          <button className={`${styles.stepBtn} ${activeStep === 'refine' ? styles.active : ''}`} onClick={() => setActiveStep('refine')}>
            <span className={styles.stepNum}>03</span>
            <span>Refine</span>
          </button>
          <button className={`${styles.stepBtn} ${activeStep === 'export' ? styles.active : ''}`} onClick={() => setActiveStep('export')}>
            <span className={styles.stepNum}>04</span>
            <span>Export</span>
          </button>
        </div>

        <div className={styles.panelContainer}>
          {activeStep === 'seed' && (
            <div className={styles.stepPanel}>
              <div className={styles.panelTitle}>Seed Color</div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Pick a color</label>
                <div className={styles.colorInputRow}>
                  <input
                    type="color"
                    value={seedHex}
                    className={styles.colorPickerSwatch}
                    onChange={(event) => setSeedHex(event.target.value)}
                  />
                  <input
                    type="text"
                    value={seedHex}
                    className={styles.hexInput}
                    onChange={(event) => setSeedHex(event.target.value)}
                    onBlur={(event) => handleSeedHexChange(event.target.value)}
                    maxLength={7}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Random seed</label>
                <button className={`${sharedStyles.button} ${sharedStyles.buttonSecondary}`} onClick={() => setSeedHex(randomHex())}>
                  Randomize Color
                </button>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Shades count</label>
                <div className={styles.sliderRow}>
                  <input
                    type="range"
                    min={5}
                    max={15}
                    value={shadesCount}
                    className={styles.rangeInput}
                    onChange={(event) => setShadesCount(Number(event.target.value))}
                  />
                  <span className={styles.rangeValue}>{shadesCount}</span>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Lightness curve</label>
                <div className={styles.segmentControl}>
                  {['linear', 'ease-in', 'ease-out'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`${styles.segBtn} ${lightnessCurve === value ? styles.activeSegBtn : ''}`}
                      onClick={() => setLightnessCurve(value)}
                    >
                      {value === 'linear' ? 'Linear' : value === 'ease-in' ? 'Ease In' : 'Ease Out'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Saturation boost</label>
                <div className={styles.sliderRow}>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={satBoost}
                    className={styles.rangeInput}
                    onChange={(event) => setSatBoost(Number(event.target.value))}
                  />
                  <span className={styles.rangeValue}>{satBoost > 0 ? `+${satBoost}` : satBoost}</span>
                </div>
              </div>

              <button className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={() => setActiveStep('harmony')}>
                Next: Harmony →
              </button>
            </div>
          )}

          {activeStep === 'harmony' && (
            <div className={styles.stepPanel}>
              <div className={styles.panelTitle}>Color Harmony</div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Harmony rule</label>
                <div className={styles.harmonyGrid}>
                  {HARMONY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.harmonyBtn} ${harmony === option.value ? styles.activeHarmony : ''}`}
                      onClick={() => setHarmony(option.value)}
                    >
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={includeNeutrals}
                    onChange={(event) => setIncludeNeutrals(event.target.checked)}
                  />
                  <span className={styles.toggle} />
                  Generate neutral scale
                </label>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={includeSemantic}
                    onChange={(event) => setIncludeSemantic(event.target.checked)}
                  />
                  <span className={styles.toggle} />
                  Include semantic colors
                </label>
              </div>

              <button className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={() => setActiveStep('refine')}>
                Next: Refine →
              </button>
            </div>
          )}

          {activeStep === 'refine' && (
            <div className={styles.stepPanel}>
              <div className={styles.panelTitle}>Refine & Accessibility</div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Contrast check target</label>
                <div className={styles.segmentControl}>
                  {['white', 'black', 'both'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`${styles.segBtn} ${contrastTarget === value ? styles.activeSegBtn : ''}`}
                      onClick={() => setContrastTarget(value)}
                    >
                      {value === 'both' ? 'Both' : value === 'white' ? 'White' : 'Black'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>WCAG level</label>
                <div className={styles.segmentControl}>
                  {['A', 'AA', 'AAA'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`${styles.segBtn} ${wcagLevel === value ? styles.activeSegBtn : ''}`}
                      onClick={() => setWcagLevel(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Color blindness simulation</label>
                <select
                  value={colorBlindMode}
                  className={styles.selectInput}
                  onChange={(event) => setColorBlindMode(event.target.value)}
                >
                  {COLOR_BLIND_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Hue rotation offset</label>
                <div className={styles.sliderRow}>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={hueRotate}
                    className={styles.rangeInput}
                    onChange={(event) => setHueRotate(Number(event.target.value))}
                  />
                  <span className={styles.rangeValue}>{hueRotate}°</span>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Global lightness shift</label>
                <div className={styles.sliderRow}>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    value={lightnessShift}
                    className={styles.rangeInput}
                    onChange={(event) => setLightnessShift(Number(event.target.value))}
                  />
                  <span className={styles.rangeValue}>{lightnessShift > 0 ? `+${lightnessShift}` : lightnessShift}</span>
                </div>
              </div>

              <button className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={() => setActiveStep('export')}>
                Next: Export →
              </button>
            </div>
          )}

          {activeStep === 'export' && (
            <div className={styles.stepPanel}>
              <div className={styles.panelTitle}>Export</div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Format</label>
                <div className={styles.exportFormatGrid}>
                  {EXPORT_FORMATS.map((format) => (
                    <button
                      key={format.value}
                      type="button"
                      className={`${styles.formatBtn} ${exportFormat === format.value ? styles.activeFormatBtn : ''}`}
                      onClick={() => setExportFormat(format.value)}
                    >
                      <span className={styles.formatExt}>{format.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Prefix / namespace</label>
                <input
                  type="text"
                  value={exportPrefix}
                  className={styles.textInput}
                  onChange={(event) => setExportPrefix(event.target.value)}
                  placeholder="e.g. brand, app, ds"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Color format</label>
                <div className={styles.segmentControl}>
                  {COLOR_FORMATS.map((format) => (
                    <button
                      key={format.value}
                      type="button"
                      className={`${styles.segBtn} ${colorFormat === format.value ? styles.activeSegBtn : ''}`}
                      onClick={() => setColorFormat(format.value)}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.codeBlockWrapper}>
                <div className={styles.codeBlockHeader}>
                  <span>{exportFormat === 'css' ? 'CSS Variables' : exportFormat === 'tailwind' ? 'Tailwind Config' : exportFormat === 'figma' ? 'Figma Tokens' : exportFormat === 'sass' ? 'SASS Variables' : exportFormat === 'json' ? 'JSON' : 'Swift UIColor'}</span>
                  <button className={styles.iconBtn} onClick={copyCode} title="Copy to clipboard">Copy</button>
                </div>
                <pre className={styles.codeBlock}>{codeOutput}</pre>
              </div>

              <button className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`} onClick={downloadFile}>
                Download File
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className={styles.previewArea}>
        <div className={styles.previewHeader}>
          <div className={styles.previewTitleRow}>
            <h1 className={styles.previewTitle}>Color Palette</h1>
            <div className={styles.previewMeta}>
              <span>{seedHex.toUpperCase()}</span>
              <span className={styles.metaSep}>·</span>
              <span>{harmony.replace(/-/g, ' ')}</span>
              <span className={styles.metaSep}>·</span>
              <span>{shadesCount} shades</span>
            </div>
          </div>
          <div className={styles.previewActions}>
            <button className={styles.iconBtnLg} onClick={() => setViewMode(viewMode === 'strip' ? 'grid' : 'strip')} title="Toggle view mode">
              {viewMode === 'strip' ? 'Grid' : 'Strip'}
            </button>
            <button className={styles.iconBtnLg} onClick={savePalette} title="Save palette">
              Save
            </button>
          </div>
        </div>

        <div className={`${styles.paletteContainer} ${viewMode === 'grid' ? styles.gridView : ''}`}>
          {visiblePalette.map((group) => (
            <div className={styles.paletteGroup} key={group.key}>
              <div className={styles.paletteGroupLabel}>{group.name}</div>
              <div className={styles.paletteSwatches}>
                {group.shades.map((shade) => {
                  const displayHex = simulateColorBlind(shade.hex, colorBlindMode);
                  const ratioW = contrastRatio(displayHex, '#ffffff');
                  const ratioB = contrastRatio(displayHex, '#000000');
                  const passes = contrastTarget === 'white'
                    ? wcagPass(ratioW, wcagLevel)
                    : contrastTarget === 'black'
                    ? wcagPass(ratioB, wcagLevel)
                    : wcagPass(ratioW, wcagLevel) || wcagPass(ratioB, wcagLevel);
                  const textColor = luminance(displayHex) > 0.4 ? '#000000dd' : '#ffffffdd';

                  return (
                    <button
                      key={shade.label}
                      type="button"
                      className={styles.swatch}
                      style={{ background: displayHex }}
                      onClick={() => {
                        navigator.clipboard.writeText(formatColor(displayHex, colorFormat));
                        showToast(`Copied ${formatColor(displayHex, colorFormat)}`);
                      }}
                    >
                      <div className={`${styles.swatchA11yBadge} ${passes ? styles.badgePass : styles.badgeFail}`}>
                        {wcagLevel}{passes ? ' ✓' : ' ✗'}
                      </div>
                      <div className={styles.swatchInfo}>
                        <div className={styles.swatchHex} style={{ color: textColor }}>{displayHex.toUpperCase()}</div>
                        <div className={styles.swatchLabel} style={{ color: textColor }}>{group.key}-{shade.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.a11yPanel}>
          <div className={styles.a11yHeader}>
            <span className={styles.a11yTitle}>Accessibility Report</span>
            <span className={`${styles.a11yBadge} ${passPercent >= 70 ? styles.pass : passPercent >= 40 ? styles.warn : styles.fail}`}>
              {passPercent}% pass ({passingCount}/{totalShades})
            </span>
          </div>
          <div className={styles.a11yGrid}>
            {visiblePalette.flatMap((group) =>
              group.shades.map((shade) => {
                const displayHex = simulateColorBlind(shade.hex, colorBlindMode);
                const ratioW = contrastRatio(displayHex, '#ffffff');
                const ratioB = contrastRatio(displayHex, '#000000');
                const checkW = wcagPass(ratioW, wcagLevel);
                const checkB = wcagPass(ratioB, wcagLevel);
                return (
                  <div className={styles.a11yCell} key={`${group.key}-${shade.label}`}>
                    <div className={styles.a11yCellColor}>
                      <div className={styles.a11yDot} style={{ background: displayHex }} />
                      <div className={styles.a11yCellHex}>{displayHex.toUpperCase()}</div>
                    </div>
                    <div className={styles.a11yRatios}>
                      {(contrastTarget === 'white' || contrastTarget === 'both') && (
                        <span className={`${styles.ratioTag} ${checkW ? styles.pass : styles.fail}`}>W: {ratioW.toFixed(1)}</span>
                      )}
                      {(contrastTarget === 'black' || contrastTarget === 'both') && (
                        <span className={`${styles.ratioTag} ${checkB ? styles.pass : styles.fail}`}>B: {ratioB.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                );
              }),
            )}
          </div>
        </div>

        <div className={styles.savedSection}>
          <div className={styles.savedHeader}>
            <span className={styles.savedTitle}>Saved Palettes</span>
            <button className={styles.iconBtn} onClick={clearSaved}>
              Clear
            </button>
          </div>
          {savedPalettes.length === 0 ? (
            <div className={styles.savedEmpty}>No saved palettes yet.</div>
          ) : (
            <div className={styles.savedList}>
              {savedPalettes.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={styles.savedItem}
                  onClick={() => {
                    setSeedHex(entry.seed);
                    setHarmony(entry.harmony);
                    setShadesCount(entry.shades);
                    showToast('Palette loaded');
                  }}
                >
                  <div className={styles.savedItemSwatches}>
                    {entry.preview.map((hex, index) => (
                      <div key={index} className={styles.savedSwatchMini} style={{ background: hex }} />
                    ))}
                  </div>
                  <div className={styles.savedItemInfo}>
                    <div className={styles.savedItemLabel}>{entry.seed.toUpperCase()}</div>
                    <div className={styles.savedItemMeta}>{entry.harmony} · {entry.shades} shades</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}
    </div>
  );
}

function randomHex() {
  const h = getSecureRandomNumber(0, 360);
  const s = getSecureRandomNumber(55, 90);
  const l = getSecureRandomNumber(40, 65);
  return hslToHex(h, s, l);
}
