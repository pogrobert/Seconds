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
    // Oranges, browns and yellows turn to mud when taken this dark (Robert, 2026-11-17: "the bg
    // colour ... is awful", a deep brown). They get night or brand ink instead.
    fits: (brand) => {
      const b = lch(brand)
      const h = b.h ?? 0
      return (b.c ?? 0) >= 0.05 && !(h >= 30 && h <= 105)
    },
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

/**
 * Cream (2026-11-19, docs/m0/22-concept.md): the same warm off-white page for every business, with
 * the brand colour only on buttons, accents and bands. The rivals' best pages work this way; the
 * tinted grounds of "paper" (a green-white page for a green brand) read as cheap.
 */
COLOUR_RULES.push({
  key: 'cream',
  label: 'Cream',
  text: 'A warm cream page with near-black text, the brand colour on buttons, small accents and one deep colour band: calm, warm and quietly expensive',
  fits: () => true,
  palette: (brand) => {
    const warm = (l: number, c: number) =>
      formatHex(clampChroma({ mode: 'oklch', l, c, h: 80 }, 'oklch')) ?? '#ffffff'
    const ground = warm(0.975, 0.012)
    const band = ensure(at(brand, 0.4, brandC(brand, 0.12)), ground, 5.5)
    return {
      ...text(ground, warm(0.22, 0.012), warm(0.47, 0.02), warm(0.88, 0.02)),
      '--tint': warm(0.945, 0.018),
      '--accent': band,
      '--btn': band,
      '--on-btn': ground,
      '--band': band,
      '--on-band': ensure(ground, band, 7),
      '--night': warm(0.2, 0.012),
      '--on-night': ground,
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

/**
 * Brand colours by name, for any business (docs/m0/15-any-business.md). The decision model reads
 * names and moods, never hex codes (it is weak with those); code holds the values.
 */
export const NAMED_COLOURS: { key: string; hex: string; mood: string }[] = [
  { key: 'oxblood', hex: '#6b1e2a', mood: 'deep red-brown; old, rich, serious' },
  { key: 'burgundy', hex: '#7a2238', mood: 'wine red; luxurious, romantic' },
  { key: 'claret', hex: '#8f1d36', mood: 'bright wine; confident, festive' },
  { key: 'cherry', hex: '#b3122e', mood: 'clear red; bold, energetic' },
  { key: 'terracotta', hex: '#b5532f', mood: 'baked clay; warm, earthy, Mediterranean' },
  { key: 'rust', hex: '#a4442a', mood: 'weathered orange-red; crafted, rugged' },
  { key: 'tangerine', hex: '#e8762d', mood: 'bright orange; cheerful, playful' },
  { key: 'saffron', hex: '#d99a1e', mood: 'golden yellow; sunny, generous' },
  { key: 'mustard', hex: '#c9a227', mood: 'muted yellow; retro, friendly' },
  { key: 'olive', hex: '#6b7034', mood: 'olive green; natural, grown-up' },
  { key: 'moss', hex: '#4f6b3a', mood: 'moss green; outdoors, calm' },
  { key: 'sage', hex: '#7d9473', mood: 'soft grey-green; gentle, wellbeing' },
  { key: 'forest', hex: '#1f4d3a', mood: 'deep green; established, trustworthy, natural' },
  { key: 'bottle green', hex: '#1d5a45', mood: 'rich green; heritage, quality' },
  { key: 'teal', hex: '#1f6f78', mood: 'blue-green; fresh, clinical but warm' },
  { key: 'petrol', hex: '#1d4e5f', mood: 'dark blue-green; calm, modern' },
  { key: 'ocean', hex: '#1f5f8b', mood: 'sea blue; open, coastal, honest' },
  { key: 'cobalt', hex: '#2742a8', mood: 'vivid blue; bold, modern, energetic' },
  { key: 'navy', hex: '#1e2f55', mood: 'dark blue; dependable, formal, civic' },
  { key: 'ink', hex: '#22314f', mood: 'blue-black; editorial, quiet authority' },
  { key: 'slate', hex: '#4a5866', mood: 'blue-grey; understated, practical' },
  { key: 'plum', hex: '#5b2a4f', mood: 'dark purple; indulgent, mysterious' },
  { key: 'aubergine', hex: '#3f2340', mood: 'near-black purple; moody, night-time' },
  { key: 'violet', hex: '#5b4a7a', mood: 'muted purple; creative, calm' },
  { key: 'lavender', hex: '#8f7fb8', mood: 'soft purple; light, soothing' },
  { key: 'rose', hex: '#b85d72', mood: 'dusky pink; soft, beauty, care' },
  { key: 'hot pink', hex: '#d63b7a', mood: 'loud pink; fun, fearless' },
  { key: 'coral', hex: '#e0725c', mood: 'pink-orange; warm, sociable' },
  { key: 'sand', hex: '#b49a74', mood: 'warm beige; relaxed, natural' },
  { key: 'espresso', hex: '#4a3226', mood: 'dark brown; coffee, craft, warmth' },
  { key: 'charcoal', hex: '#2b2b2b', mood: 'near black; minimal, strong' },
  { key: 'black', hex: '#141414', mood: 'black; sharp, exclusive, stark' },
]
