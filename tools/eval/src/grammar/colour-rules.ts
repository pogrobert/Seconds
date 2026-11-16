// Colour layer of the design-rules proof (round 2, docs/m0/13-design-rules-2.md). Four strategies,
// each built from the business's brand colour in OKLCH (culori, MIT), with every text pair checked
// against WCAG 2 contrast before a page is drawn. Award-level local sites commit to their colour:
// a deep brand colour and a warm off-white, with the brand colour filling whole surfaces or all
// the text (docs/research/2026-11-16-fine-to-ten.md). "Paper" is round 1's look, kept as one option.

import { clampChroma, formatHex, type Oklch, oklch, wcagContrast } from 'culori'

export type Palette = Record<string, string>

export type ColourRule = {
  key: string
  label: string
  /** What the decision model reads. */
  text: string
  /** Whether the strategy works for this brand colour (a grey brand cannot be "vivid"). */
  fits: (brand: string) => boolean
  palette: (brand: string) => Palette
}

const lch = (hex: string): Oklch => oklch(hex) ?? { mode: 'oklch', l: 0.5, c: 0, h: 0 }
/** A colour at a lightness and chroma, on the brand's hue, pulled into the sRGB gamut. */
const at = (brand: string, l: number, c: number) => {
  const b = lch(brand)
  // A colourless brand (black, grey) has no hue to tint with: use a warm neutral (paper, stone).
  const h = (b.c ?? 0) < 0.02 ? 75 : (b.h ?? 0)
  return formatHex(clampChroma({ mode: 'oklch', l, c, h }, 'oklch')) ?? '#000000'
}
const chroma = (brand: string) => lch(brand).c ?? 0
const contrast = (a: string, b: string) => wcagContrast(a, b)

/**
 * Moves `fg` in lightness, away from `bg`, until the pair reaches `min` contrast. Keeps hue and
 * chroma, so tinted text stays tinted.
 */
function ensure(fg: string, bg: string, min: number): string {
  let c = lch(fg)
  const dark = (lch(bg).l ?? 0) > 0.55
  for (let i = 0; i < 60 && contrast(formatHex(c) ?? fg, bg) < min; i++)
    c = { ...c, l: Math.max(0, Math.min(1, (c.l ?? 0) + (dark ? -0.01 : 0.01))) }
  return formatHex(clampChroma(c, 'oklch')) ?? fg
}

/** The text roles for a ground: ink for reading, muted for secondary text, a line colour. */
function text(ground: string, inkSeed: string, muteSeed: string, lineSeed: string) {
  return {
    '--ground': ground,
    '--ink': ensure(inkSeed, ground, 7),
    '--muted': ensure(muteSeed, ground, 4.6),
    '--line': lineSeed,
  }
}

const brandC = (brand: string, max: number) => Math.min(chroma(brand), max)

export const COLOUR_RULES: ColourRule[] = [
  {
    key: 'paper',
    label: 'Paper',
    text: 'A light, warm off-white page with dark text, the brand colour used only for buttons and small accents: quiet and neutral',
    fits: () => true,
    palette: (brand) => {
      const ground = at(brand, 0.97, 0.008)
      const band = ensure(at(brand, 0.42, brandC(brand, 0.14)), '#ffffff', 5)
      return {
        ...text(ground, at(brand, 0.22, 0.02), at(brand, 0.45, 0.02), at(brand, 0.86, 0.015)),
        '--tint': at(brand, 0.93, Math.min(0.03, chroma(brand))),
        '--accent': band,
        '--btn': band,
        '--on-btn': '#ffffff',
        '--band': band,
        '--on-band': '#ffffff',
        '--night': at(brand, 0.2, 0.02),
        '--on-night': at(brand, 0.95, 0.01),
      }
    },
  },
  {
    key: 'ink',
    label: 'Brand ink',
    text: 'A warm off-white page where all the text, lines and buttons are set in one deep brand colour instead of black: confident, crafted and distinctive',
    fits: (brand) => chroma(brand) >= 0.04,
    palette: (brand) => {
      const ground = at(brand, 0.965, 0.012)
      const ink = ensure(at(brand, 0.32, brandC(brand, 0.12)), ground, 8)
      return {
        ...text(ground, ink, at(brand, 0.46, brandC(brand, 0.07)), at(brand, 0.8, 0.04)),
        '--tint': at(brand, 0.92, Math.min(0.04, chroma(brand))),
        '--accent': ink,
        '--btn': ink,
        '--on-btn': ground,
        '--band': ink,
        '--on-band': ground,
        '--night': ink,
        '--on-night': ground,
      }
    },
  },
  {
    key: 'deep',
    label: 'Deep',
    text: 'The whole page in a deep, dark version of the brand colour with cream text: rich, moody and luxurious, like an evening venue',
    fits: () => true,
    palette: (brand) => {
      const ground = at(brand, 0.26, brandC(brand, 0.08))
      const cream = at(brand, 0.95, 0.02)
      return {
        ...text(ground, cream, at(brand, 0.8, 0.03), at(brand, 0.38, brandC(brand, 0.07))),
        '--tint': at(brand, 0.31, brandC(brand, 0.08)),
        '--accent': ensure(at(brand, 0.78, brandC(brand, 0.1)), ground, 4.5),
        '--btn': cream,
        '--on-btn': ground,
        '--band': cream,
        '--on-band': ground,
        '--night': at(brand, 0.19, brandC(brand, 0.06)),
        '--on-night': cream,
      }
    },
  },
  {
    key: 'vivid',
    label: 'Vivid',
    text: 'The whole page in the bright brand colour itself, with near-black text and deep colour bands: bold, joyful and loud',
    fits: (brand) => chroma(brand) >= 0.08,
    palette: (brand) => {
      const ground = at(brand, 0.72, Math.max(0.12, brandC(brand, 0.17)))
      const ink = at(brand, 0.17, 0.03)
      const deep = at(brand, 0.27, brandC(brand, 0.1))
      return {
        ...text(ground, ink, at(brand, 0.27, 0.05), at(brand, 0.6, brandC(brand, 0.14))),
        '--tint': at(brand, 0.79, Math.max(0.1, brandC(brand, 0.14))),
        '--accent': ink,
        '--btn': ink,
        '--on-btn': ground,
        '--band': deep,
        '--on-band': ensure(at(brand, 0.92, 0.04), deep, 7),
        '--night': deep,
        '--on-night': ensure(at(brand, 0.92, 0.04), deep, 7),
      }
    },
  },
]

/**
 * Night (round 3): near-black with the faintest warmth of the brand, cream text, the brand colour
 * only as a small accent. Dogpound, Remedy Place and Humming Puppy, the darkest of Robert's loves.
 */
COLOUR_RULES.push({
  key: 'night',
  label: 'Night',
  text: 'A near-black page with soft cream text and the brand colour only as a small accent: dark, cinematic and exclusive, like a members club at night',
  fits: () => true,
  palette: (brand) => {
    const ground = at(brand, 0.17, Math.min(0.012, chroma(brand)))
    const cream = at(brand, 0.93, 0.015)
    return {
      ...text(ground, cream, at(brand, 0.74, 0.015), at(brand, 0.28, 0.012)),
      '--tint': at(brand, 0.21, Math.min(0.015, chroma(brand))),
      '--accent': ensure(at(brand, 0.72, brandC(brand, 0.12)), ground, 4.5),
      '--btn': cream,
      '--on-btn': ground,
      '--band': at(brand, 0.24, brandC(brand, 0.06)),
      '--on-band': cream,
      '--night': at(brand, 0.12, 0.008),
      '--on-night': cream,
    }
  },
})

/** Contrast of every text pair in a palette, for the report. */
export function palettePairs(p: Palette): Record<string, number> {
  const pair = (a: string, b: string) =>
    Math.round(contrast(p[a] ?? '#000', p[b] ?? '#fff') * 10) / 10
  return {
    ink: pair('--ink', '--ground'),
    muted: pair('--muted', '--ground'),
    mutedOnTint: pair('--muted', '--tint'),
    btn: pair('--on-btn', '--btn'),
    band: pair('--on-band', '--band'),
    night: pair('--on-night', '--night'),
  }
}
