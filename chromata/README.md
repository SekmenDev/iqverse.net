# Chromata — Color Palette Generator

> Generate accessible, harmonious color palettes from a seed color.  
> Export as CSS variables, Tailwind config, Figma tokens, SCSS, JSON or Swift UIColor.

![License](https://img.shields.io/badge/license-MIT-green) ![Open Source](https://img.shields.io/badge/open-source-blue) ![Browser](https://img.shields.io/badge/browser-based-9cf)

📍 [Launch Tool](https://iqverse.net/chromata/)

---

## Features

| Category                   | Details                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| **Seed color**             | Pick any hex color or click Randomize                                                         |
| **Shade generation**       | 5–15 shades with Linear / Ease-In / Ease-Out lightness curves                                 |
| **Saturation control**     | ±50 boost per group                                                                           |
| **Harmony rules**          | Complementary, Triadic, Analogous, Split-Complementary, Tetradic, Monochromatic               |
| **Neutrals**               | Auto-generated warm-neutral scale                                                             |
| **Semantic colors**        | Success, Warning, Danger included automatically                                               |
| **Accessibility**          | WCAG A / AA / AAA contrast checker per swatch                                                 |
| **Color blindness sim**    | Deuteranopia, Protanopia, Tritanopia, Achromatopsia                                           |
| **Hue / lightness offset** | Fine-tune the whole palette globally                                                          |
| **Export formats**         | CSS variables, SCSS, Tailwind `theme.extend.colors`, Figma Design Tokens, JSON, Swift UIColor |
| **Color notation**         | HEX, RGB, HSL                                                                                 |
| **Custom prefix**          | Namespace variables (`--brand-primary-500`, `--ds-neutral-200`, …)                            |
| **View modes**             | Strip (hover-expand) and Grid                                                                 |
| **Save & reload**          | Palettes persist to localStorage                                                              |

---

## Workflow

1. **Seed Color** — Choose your base color, set shades count and lightness curve.
2. **Harmony** — Pick a color theory harmony rule to generate companion colors.
3. **Refine** — Check WCAG contrast ratios, simulate color blindness, apply hue/lightness offsets.
4. **Export** — Choose a format, set your prefix, copy or download.

---

## Export examples

**CSS Variables**:

```css
:root {
  --color-primary-100: #eef2ff;
  --color-primary-500: #6366f1;
  --color-primary-900: #1e1b4b;
  ...
}
```

**Tailwind Config**:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'color-primary': {
          '100': '#eef2ff',
          '500': '#6366f1',
          ...
        }
      }
    }
  }
}
```

**Figma Design Tokens**:

```json
{
	"color": {
		"primary": {
			"500": { "value": "#6366f1", "type": "color" }
		}
	}
}
```

---

## Privacy

Everything runs in your browser.  
**No data is ever sent to a server.**

---

## 📄 License

All tools are released under the **MIT License**. See individual repositories for license details.

---

## 🔗 Links

- **IQVerse:** [iqverse.net](https://iqverse.net)
- **Sekmen.Dev** [Sekmen.Dev](https://sekmen.dev)

---

**Built with ❤️ by developers, for the developer community.**
