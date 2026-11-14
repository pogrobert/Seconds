// Style families: each turns a business's brand colour into the full set of theme variables the kit
// reads (the palette for 4 surfaces, type, spacing, corners), plus its fonts, button style and art.
// Values come from docs/research/07-style-inspiration.md (measured on real sites, 2026-11-14).
// These are OPTIONS for Robert to pick from (CLAUDE.md: design choices are Robert's). Nothing here is
// locked. Every text colour is checked against WCAG 2.2 AA contrast before it is used.

/* ------------------------------------------------------------------ colour */

type RGB = [number, number, number]
const toRgb = (hex: string): RGB => {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16)) as RGB
}
const toHex = (c: RGB) =>
  `#${c
    .map((v) =>
      Math.round(Math.min(255, Math.max(0, v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
/** Mix two colours: t = 0 gives a, t = 1 gives b. */
export const mix = (a: string, b: string, t: number) => {
  const x = toRgb(a)
  const y = toRgb(b)
  return toHex([0, 1, 2].map((i) => (x[i] ?? 0) + ((y[i] ?? 0) - (x[i] ?? 0)) * t) as RGB)
}
const lum = (hex: string) => {
  const [r, g, b] = toRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as RGB
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
/** WCAG contrast ratio between two colours. */
export const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number]
  return (x + 0.05) / (y + 0.05)
}
/** Move `fg` towards black or white (whichever helps) until it reaches `ratio` against `bg`. */
export function ensure(fg: string, bg: string, ratio = 4.5): string {
  if (contrast(fg, bg) >= ratio) return fg
  const target = lum(bg) > 0.18 ? '#000000' : '#ffffff'
  for (let t = 0.05; t <= 1.0001; t += 0.05) {
    const c = mix(fg, target, t)
    if (contrast(c, bg) >= ratio) return c
  }
  return target
}
/** Black or white text, whichever reads better on `bg`. */
const onColour = (bg: string, dark = '#111111', light = '#ffffff') =>
  contrast(dark, bg) >= contrast(light, bg) ? dark : light

type Roles = {
  bg: string
  fg: string
  fgMuted: string
  accent: string
  accentFg: string
  border: string
}
type Palette = Record<'base' | 'muted' | 'brand' | 'inverse', Roles>

/** Fills in readable foregrounds for a surface: every text pair reaches AA. */
function surface(
  bg: string,
  fg: string,
  accent: string,
  opts: { muted?: number; border?: number } = {},
): Roles {
  const f = ensure(fg, bg, 7)
  const accentFill = ensure(accent, bg, 4.5)
  const accentFg = ensure(onColour(accentFill), accentFill, 4.5)
  return {
    bg,
    fg: f,
    fgMuted: ensure(mix(f, bg, opts.muted ?? 0.32), bg, 4.5),
    // The accent is used as a button fill and as link colour, so it must read on bg too.
    accent: accentFill,
    accentFg,
    border: mix(f, bg, opts.border ?? 0.82),
  }
}

/* ------------------------------------------------------------------ families */

export type FamilyId = 'poster' | 'quiet' | 'workshop' | 'soft' | 'deep'

type TypeRole = {
  family: string
  size: string
  leading: number
  tracking: string
  weight: number
  case?: 'uppercase' | 'none'
}

/** One font pairing: every type role, the fonts to load and the jumbo size. */
type Pairing = {
  label: string
  /** Google Fonts css2 query for previews. Published sites will self-host (report 02, D11). */
  fonts: string
  display: TypeRole
  h2: TypeRole
  h3: TypeRole
  body: string
  bodyWeight: number
  label_: TypeRole
  button: TypeRole
  /** The jumbo size: larger than display, for editorial type. */
  jumbo: string
  /**
   * Average width of one character of the display face, in em, measured in Chromium on business
   * names (tools/eval/tasks/advance.task.ts). Lets a wordmark fill its width without JavaScript.
   */
  advance: number
}

type Corners = { control: string; card: string; media: string }

export type Family = {
  id: FamilyId
  label: string
  feel: string
  /** Font pairings; the first is the default. */
  pairings: Record<string, Pairing>
  /** Light palettes; the first is the default. `dark` is used when the site's mode is dark. */
  palettes: Record<string, { label: string; make: (brand: string) => Palette }>
  dark: (brand: string) => Palette
  /** Corner settings; the first is the default. */
  corners: Record<string, Corners>
  sizes: { lead: string; body: string; small: string }
  space: { section: string; scale: number }
  button: 'solid' | 'outline' | 'text'
  art: string
}

const sans = (f: string) => `"${f}", system-ui, -apple-system, "Segoe UI", sans-serif`
const serif = (f: string) => `"${f}", Georgia, "Times New Roman", serif`
const mono = (f: string) => `"${f}", ui-monospace, "SFMono-Regular", Menlo, monospace`
const role = (
  family: string,
  size: string,
  leading: number,
  tracking: string,
  weight: number,
  upper = false,
): TypeRole => ({ family, size, leading, tracking, weight, case: upper ? 'uppercase' : 'none' })

const SQUARE: Corners = { control: '0', card: '0', media: '0' }

/* Poster: loud and local. */
const posterLabel = role(sans('Inter'), '0.75rem', 1.3, '0.18em', 600, true)
const posterDisplay = 'clamp(3rem, 1.6rem + 6.4cqi, 7rem)'
const posterH2 = 'clamp(2.25rem, 1.5rem + 3.4cqi, 4.25rem)'
const posterJumbo = 'clamp(4rem, 0.5rem + 13cqi, 13rem)'

/* Quiet: hushed and expensive. */
const quietDisplay = 'clamp(2rem, 1.5rem + 2.2cqi, 3.25rem)'
const quietH2 = 'clamp(1.5rem, 1.25rem + 1.1cqi, 2.125rem)'

/* Soft: friendly and reassuring. */
const softDisplay = 'clamp(2.5rem, 1.7rem + 4cqi, 4.75rem)'
const softH2 = 'clamp(1.875rem, 1.45rem + 2cqi, 3.125rem)'

export const FAMILIES: Record<FamilyId, Family> = {
  poster: {
    id: 'poster',
    label: 'Poster',
    feel: 'Loud and local: huge condensed capitals, flat colour blocks, square corners.',
    pairings: {
      oswald: {
        label: 'Oswald and Inter',
        fonts: 'family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600',
        display: role(sans('Oswald'), posterDisplay, 0.92, '-0.01em', 700, true),
        h2: role(sans('Oswald'), posterH2, 0.95, '0', 700, true),
        h3: role(sans('Oswald'), '1.375rem', 1.15, '0.01em', 600, true),
        body: sans('Inter'),
        bodyWeight: 400,
        label_: posterLabel,
        button: role(sans('Oswald'), '1.125rem', 1.1, '0.04em', 600, true),
        jumbo: posterJumbo,
        advance: 0.52,
      },
      anton: {
        label: 'Anton and Inter',
        fonts: 'family=Anton&family=Oswald:wght@600&family=Inter:wght@400;500;600',
        display: role(sans('Anton'), posterDisplay, 0.95, '0', 400, true),
        h2: role(sans('Anton'), posterH2, 0.98, '0.005em', 400, true),
        h3: role(sans('Oswald'), '1.375rem', 1.15, '0.01em', 600, true),
        body: sans('Inter'),
        bodyWeight: 400,
        label_: posterLabel,
        button: role(sans('Oswald'), '1.125rem', 1.1, '0.04em', 600, true),
        jumbo: posterJumbo,
        advance: 0.475,
      },
      shoulders: {
        label: 'Big Shoulders and Archivo',
        fonts: 'family=Big+Shoulders+Display:wght@700;800&family=Archivo:wght@400;500;600',
        display: role(sans('Big Shoulders Display'), posterDisplay, 0.9, '0', 800, true),
        h2: role(sans('Big Shoulders Display'), posterH2, 0.94, '0.005em', 800, true),
        h3: role(sans('Big Shoulders Display'), '1.5rem', 1.1, '0.02em', 700, true),
        body: sans('Archivo'),
        bodyWeight: 400,
        label_: role(sans('Archivo'), '0.75rem', 1.3, '0.16em', 600, true),
        button: role(sans('Big Shoulders Display'), '1.25rem', 1.1, '0.05em', 700, true),
        jumbo: posterJumbo,
        advance: 0.458,
      },
    },
    palettes: {
      tint: {
        label: 'Tinted ground',
        make: (brand) => {
          const strong = ensure(brand, '#ffffff', 4.5)
          return {
            base: surface(mix(brand, '#ffffff', 0.9), '#111111', strong),
            muted: surface(mix(brand, '#ffffff', 0.7), '#111111', '#111111'),
            brand: surface(strong, onColour(strong), mix(brand, '#ffffff', 0.85)),
            inverse: surface('#111111', '#ffffff', mix(brand, '#ffffff', 0.55)),
          }
        },
      },
      paper: {
        label: 'Newsprint ground, colour in blocks',
        make: (brand) => {
          const strong = ensure(brand, '#ffffff', 4.5)
          return {
            base: surface('#f4f2ec', '#111111', strong),
            muted: surface(mix(brand, '#ffffff', 0.78), '#111111', '#111111'),
            brand: surface(strong, onColour(strong), mix(brand, '#ffffff', 0.85)),
            inverse: surface('#111111', '#ffffff', mix(brand, '#ffffff', 0.55)),
          }
        },
      },
    },
    dark: (brand) => {
      const bright = ensure(mix(brand, '#ffffff', 0.25), '#131313', 4.5)
      return {
        base: surface('#131313', '#f4f2ec', bright),
        muted: surface('#222121', '#f4f2ec', bright),
        brand: surface(
          ensure(brand, '#ffffff', 4.5),
          onColour(ensure(brand, '#ffffff', 4.5)),
          '#ffffff',
        ),
        inverse: surface('#060606', '#ffffff', bright),
      }
    },
    corners: { square: SQUARE },
    sizes: { lead: 'clamp(1.0625rem, 1rem + 0.4cqi, 1.25rem)', body: '1rem', small: '0.875rem' },
    space: { section: 'clamp(3.5rem, 2rem + 6cqi, 6.5rem)', scale: 1 },
    button: 'solid',
    art: 'screenprint',
  },
  quiet: {
    id: 'quiet',
    label: 'Quiet',
    feel: 'Hushed and expensive: small serif headings, wide margins, one dark ink on warm white.',
    pairings: {
      newsreader: {
        label: 'Newsreader and Hanken Grotesk',
        fonts:
          'family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Hanken+Grotesk:wght@400;500;600',
        display: role(serif('Newsreader'), quietDisplay, 1.12, '-0.01em', 400),
        h2: role(serif('Newsreader'), quietH2, 1.2, '0', 400),
        h3: role(sans('Hanken Grotesk'), '1.0625rem', 1.35, '0', 600),
        body: sans('Hanken Grotesk'),
        bodyWeight: 400,
        label_: role(sans('Hanken Grotesk'), '0.75rem', 1.3, '0.14em', 500, true),
        button: role(sans('Hanken Grotesk'), '0.875rem', 1.2, '0.12em', 500, true),
        jumbo: 'clamp(3rem, 1.4rem + 6.5cqi, 7.5rem)',
        advance: 0.573,
      },
      instrument: {
        label: 'Instrument Serif and Inter Tight',
        fonts: 'family=Instrument+Serif&family=Inter+Tight:wght@400;500;600',
        display: role(
          serif('Instrument Serif'),
          'clamp(2.375rem, 1.7rem + 2.8cqi, 4rem)',
          1.04,
          '-0.01em',
          400,
        ),
        h2: role(
          serif('Instrument Serif'),
          'clamp(1.75rem, 1.4rem + 1.4cqi, 2.5rem)',
          1.1,
          '0',
          400,
        ),
        h3: role(sans('Inter Tight'), '1.0625rem', 1.35, '0', 600),
        body: sans('Inter Tight'),
        bodyWeight: 400,
        label_: role(sans('Inter Tight'), '0.75rem', 1.3, '0.14em', 500, true),
        button: role(sans('Inter Tight'), '0.875rem', 1.2, '0.1em', 500, true),
        jumbo: 'clamp(3.5rem, 1.4rem + 8cqi, 9rem)',
        advance: 0.403,
      },
      cormorant: {
        label: 'Cormorant Garamond and Work Sans',
        fonts: 'family=Cormorant+Garamond:wght@500;600&family=Work+Sans:wght@400;500;600',
        display: role(
          serif('Cormorant Garamond'),
          'clamp(2.25rem, 1.6rem + 2.6cqi, 3.75rem)',
          1.06,
          '-0.005em',
          500,
        ),
        h2: role(
          serif('Cormorant Garamond'),
          'clamp(1.75rem, 1.4rem + 1.3cqi, 2.5rem)',
          1.12,
          '0',
          500,
        ),
        h3: role(sans('Work Sans'), '1rem', 1.4, '0', 600),
        body: sans('Work Sans'),
        bodyWeight: 400,
        label_: role(sans('Work Sans'), '0.75rem', 1.3, '0.16em', 500, true),
        button: role(sans('Work Sans'), '0.8125rem', 1.2, '0.14em', 500, true),
        jumbo: 'clamp(3.25rem, 1.4rem + 7.5cqi, 8.5rem)',
        advance: 0.512,
      },
    },
    palettes: {
      paper: {
        label: 'Warm paper',
        make: (brand) => {
          const ink = mix(brand, '#0b0d14', 0.72)
          const paper = '#fffcf8'
          return {
            base: surface(paper, ink, ink, { muted: 0.38 }),
            muted: surface('#f3efe8', ink, ink, { muted: 0.38 }),
            brand: surface(ink, paper, paper),
            inverse: surface('#1b1a18', '#f6f1e9', '#f6f1e9'),
          }
        },
      },
      stone: {
        label: 'Cool stone',
        make: (brand) => {
          const ink = mix(brand, '#0b0d14', 0.78)
          return {
            base: surface('#f2f2ef', ink, ink, { muted: 0.38 }),
            muted: surface('#e3e4df', ink, ink, { muted: 0.38 }),
            brand: surface(mix(brand, '#e3e4df', 0.55), ink, ink, { muted: 0.38 }),
            inverse: surface('#191a1a', '#eeeeea', '#eeeeea'),
          }
        },
      },
    },
    dark: (brand) => {
      const cream = '#efe8dc'
      return {
        base: surface('#171614', cream, cream, { muted: 0.38 }),
        muted: surface('#22201d', cream, cream, { muted: 0.38 }),
        brand: surface(mix(brand, '#0b0d14', 0.55), cream, cream),
        inverse: surface('#0d0c0b', cream, cream),
      }
    },
    corners: {
      square: SQUARE,
      soft: { control: '0.25rem', card: '0.375rem', media: '0.25rem' },
    },
    sizes: { lead: 'clamp(1.0625rem, 1rem + 0.3cqi, 1.1875rem)', body: '1rem', small: '0.875rem' },
    space: { section: 'clamp(4.5rem, 2.5rem + 8cqi, 9rem)', scale: 1.15 },
    button: 'outline',
    art: 'aquatint',
  },
  workshop: {
    id: 'workshop',
    label: 'Workshop',
    feel: 'Practical and precise: plain grotesk with typewriter labels, hairlines, one safety colour.',
    pairings: {
      schibsted: {
        label: 'Schibsted Grotesk and IBM Plex Mono',
        fonts: 'family=Schibsted+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500',
        display: role(
          sans('Schibsted Grotesk'),
          'clamp(2.25rem, 1.5rem + 3.6cqi, 4.25rem)',
          1.02,
          '-0.025em',
          600,
        ),
        h2: role(
          sans('Schibsted Grotesk'),
          'clamp(1.75rem, 1.35rem + 1.8cqi, 2.75rem)',
          1.08,
          '-0.02em',
          600,
        ),
        h3: role(sans('Schibsted Grotesk'), '1.1875rem', 1.3, '-0.01em', 600),
        body: sans('Schibsted Grotesk'),
        bodyWeight: 400,
        label_: role(mono('IBM Plex Mono'), '0.75rem', 1.3, '0.08em', 500, true),
        button: role(mono('IBM Plex Mono'), '0.875rem', 1.2, '0.06em', 500, true),
        jumbo: 'clamp(3.25rem, 1.2rem + 8cqi, 8.5rem)',
        advance: 0.573,
      },
    },
    palettes: {
      paper: {
        label: 'Drafting paper',
        make: (brand) => {
          const charcoal = '#292728'
          const signal = ensure(brand, '#f8f8f2', 3)
          return {
            base: surface('#f8f8f2', charcoal, signal, { border: 0.7 }),
            muted: surface('#ebe8de', charcoal, signal, { border: 0.7 }),
            brand: surface(ensure(brand, '#ffffff', 4.5), '#ffffff', '#ffffff'),
            inverse: surface(charcoal, '#f8f8f2', mix(brand, '#ffffff', 0.25)),
          }
        },
      },
    },
    dark: (brand) => {
      const signal = ensure(mix(brand, '#ffffff', 0.2), '#1f1e1e', 4.5)
      return {
        base: surface('#1f1e1e', '#f0efe8', signal, { border: 0.7 }),
        muted: surface('#2a2828', '#f0efe8', signal, { border: 0.7 }),
        brand: surface(ensure(brand, '#ffffff', 4.5), '#ffffff', '#ffffff'),
        inverse: surface('#111010', '#f0efe8', signal),
      }
    },
    corners: { square: SQUARE },
    sizes: { lead: 'clamp(1.0625rem, 1rem + 0.35cqi, 1.25rem)', body: '1rem', small: '0.875rem' },
    space: { section: 'clamp(3.5rem, 2rem + 5cqi, 6rem)', scale: 1 },
    button: 'solid',
    art: 'linework',
  },
  soft: {
    id: 'soft',
    label: 'Soft',
    feel: 'Friendly and reassuring: light sans, rounded cards and photos, pill buttons, pale tints.',
    pairings: {
      geist: {
        label: 'Geist',
        fonts: 'family=Geist:wght@300;400;500;600',
        display: role(sans('Geist'), softDisplay, 1.04, '-0.035em', 300),
        h2: role(sans('Geist'), softH2, 1.1, '-0.03em', 300),
        h3: role(sans('Geist'), '1.25rem', 1.3, '-0.01em', 500),
        body: sans('Geist'),
        bodyWeight: 400,
        label_: role(sans('Geist'), '0.8125rem', 1.3, '0', 500),
        button: role(sans('Geist'), '1rem', 1.2, '0', 500),
        jumbo: 'clamp(3.5rem, 1.4rem + 8.5cqi, 9.5rem)',
        advance: 0.53,
      },
      fraunces: {
        label: 'Fraunces and Geist',
        fonts: 'family=Fraunces:opsz,wght@9..144,300;9..144,400&family=Geist:wght@400;500;600',
        display: role(serif('Fraunces'), softDisplay, 1.04, '-0.02em', 300),
        h2: role(serif('Fraunces'), softH2, 1.1, '-0.015em', 300),
        h3: role(sans('Geist'), '1.25rem', 1.3, '-0.01em', 500),
        body: sans('Geist'),
        bodyWeight: 400,
        label_: role(sans('Geist'), '0.8125rem', 1.3, '0', 500),
        button: role(sans('Geist'), '1rem', 1.2, '0', 500),
        jumbo: 'clamp(3.5rem, 1.4rem + 8.5cqi, 9.5rem)',
        advance: 0.474,
      },
      outfit: {
        label: 'Outfit',
        fonts: 'family=Outfit:wght@300;400;500;600',
        display: role(sans('Outfit'), softDisplay, 1.04, '-0.025em', 300),
        h2: role(sans('Outfit'), softH2, 1.1, '-0.02em', 300),
        h3: role(sans('Outfit'), '1.25rem', 1.3, '0', 500),
        body: sans('Outfit'),
        bodyWeight: 400,
        label_: role(sans('Outfit'), '0.8125rem', 1.3, '0.01em', 500),
        button: role(sans('Outfit'), '1rem', 1.2, '0', 500),
        jumbo: 'clamp(3.5rem, 1.4rem + 8.5cqi, 9.5rem)',
        advance: 0.534,
      },
    },
    palettes: {
      tint: {
        label: 'Pale tint',
        make: (brand) => {
          const ink = mix(brand, '#0d1117', 0.82)
          const fill = ensure(brand, '#ffffff', 4.5)
          return {
            base: surface(mix(brand, '#ffffff', 0.94), ink, fill),
            muted: surface('#ffffff', ink, fill),
            brand: surface(mix(brand, '#ffffff', 0.78), ink, mix(brand, '#0d1117', 0.55)),
            inverse: surface(ink, '#ffffff', mix(brand, '#ffffff', 0.8)),
          }
        },
      },
      white: {
        label: 'White with tinted panels',
        make: (brand) => {
          const ink = mix(brand, '#0d1117', 0.82)
          const fill = ensure(brand, '#ffffff', 4.5)
          return {
            base: surface('#ffffff', ink, fill),
            muted: surface(mix(brand, '#ffffff', 0.92), ink, fill),
            brand: surface(mix(brand, '#ffffff', 0.72), ink, mix(brand, '#0d1117', 0.55)),
            inverse: surface(ink, '#ffffff', mix(brand, '#ffffff', 0.8)),
          }
        },
      },
    },
    dark: (brand) => {
      const ground = mix(brand, '#0d1117', 0.86)
      const pale = mix(brand, '#ffffff', 0.8)
      return {
        base: surface(ground, '#ffffff', pale),
        muted: surface(mix(brand, '#0d1117', 0.76), '#ffffff', pale),
        brand: surface(
          mix(brand, '#ffffff', 0.78),
          mix(brand, '#0d1117', 0.82),
          mix(brand, '#0d1117', 0.55),
        ),
        inverse: surface('#07090d', '#ffffff', pale),
      }
    },
    corners: {
      round: { control: '999px', card: '1.5rem', media: '1.25rem' },
      gentle: { control: '0.625rem', card: '0.875rem', media: '0.75rem' },
    },
    sizes: { lead: 'clamp(1.0625rem, 1rem + 0.4cqi, 1.25rem)', body: '1rem', small: '0.875rem' },
    space: { section: 'clamp(3.5rem, 2rem + 6cqi, 6.5rem)', scale: 1.05 },
    button: 'solid',
    art: 'underpaint',
  },
  deep: {
    id: 'deep',
    label: 'Deep',
    feel: 'Moody and rich: dark jewel ground, pale compressed capitals, typewriter labels, pill buttons.',
    pairings: {
      antonio: {
        label: 'Antonio, Inter and Oxygen Mono',
        fonts: 'family=Antonio:wght@500;600;700&family=Inter:wght@400;500&family=Oxygen+Mono',
        display: role(
          sans('Antonio'),
          'clamp(3rem, 1.4rem + 7.5cqi, 8rem)',
          0.9,
          '-0.01em',
          700,
          true,
        ),
        h2: role(sans('Antonio'), 'clamp(2.25rem, 1.4rem + 4cqi, 4.75rem)', 0.95, '0', 700, true),
        h3: role(sans('Antonio'), '1.5rem', 1.1, '0.01em', 600, true),
        body: sans('Inter'),
        bodyWeight: 400,
        label_: role(mono('Oxygen Mono'), '0.8125rem', 1.3, '0.04em', 400, true),
        button: role(mono('Oxygen Mono'), '0.9375rem', 1.2, '0.03em', 400, true),
        jumbo: 'clamp(4.5rem, 0.5rem + 15cqi, 15rem)',
        advance: 0.456,
      },
    },
    palettes: {
      jewel: {
        label: 'Jewel ground',
        make: (brand) => {
          const jewel = mix(brand, '#05070a', 0.78)
          const pale = mix(brand, '#fffbe8', 0.86)
          return {
            base: surface(jewel, pale, pale),
            muted: surface(mix(brand, '#05070a', 0.64), pale, pale),
            brand: surface(pale, jewel, jewel),
            inverse: surface('#0b0b0c', '#f4f1ea', pale),
          }
        },
      },
    },
    dark: (brand) => (FAMILIES.deep.palettes.jewel as { make: (b: string) => Palette }).make(brand),
    corners: { round: { control: '999px', card: '1rem', media: '0.75rem' } },
    sizes: { lead: 'clamp(1.0625rem, 1rem + 0.4cqi, 1.25rem)', body: '1rem', small: '0.875rem' },
    space: { section: 'clamp(4rem, 2.2rem + 7cqi, 7.5rem)', scale: 1.1 },
    button: 'solid',
    art: 'mezzotint',
  },
}

export const FAMILY_IDS = Object.keys(FAMILIES) as FamilyId[]

/** The three families M0 tests (Robert, 2026-11-14; docs/decisions/0002-style-families.md). */
export const M0_FAMILIES = ['poster', 'quiet', 'soft'] as const satisfies readonly FamilyId[]

/* ------------------------------------------------------------------ settings (style axes) */

/** Spacing settings shared by every family: a multiplier on all space. */
const DENSITY = { regular: 1, airy: 1.2, compact: 0.85 } as const
/**
 * How coloured sections sit on the page: as full-width bands, or as inset panels with the card
 * corner on the page's own ground. Base sections are never framed.
 */
const FRAME = ['bleed', 'inset'] as const

/**
 * How every photo on the site is treated: as taken, black and white, or toned in the brand colour.
 * One treatment for the whole site, so photos from different sources read as one set.
 */
const PHOTO = ['natural', 'mono', 'tint'] as const

/** The brand's hue in degrees and its saturation (0 to 1), from HSL. */
const hueSat = (hex: string): [number, number] => {
  const [r, g, b] = toRgb(hex).map((v) => v / 255) as RGB
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return [0, 0]
  const l = (max + min) / 2
  const s = d / (1 - Math.abs(2 * l - 1))
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [(h * 60 + 360) % 360, s]
}

/**
 * The CSS filter for a photo treatment. `tint` is a soft one-colour photo in the brand's hue: grey,
 * then half sepia (whose hue is about 38°), turned to the brand's hue. Stronger settings looked neon
 * (Wall round 3, by eye). A brand with almost no colour (black,
 * grey) gives a warm sepia instead.
 */
export function photoFilter(treatment: string, brand: string): string {
  if (treatment === 'mono') return 'grayscale(1) contrast(1.06)'
  if (treatment !== 'tint') return 'none'
  const [h, s] = hueSat(brand)
  if (s < 0.15) return 'grayscale(1) sepia(0.55) contrast(1.04)'
  return `grayscale(1) sepia(0.5) hue-rotate(${Math.round(h - 38)}deg) saturate(0.9) contrast(1.02)`
}

/**
 * Each family's settings, as closed lists (review 07, S3): `type` (font pairing), `palette`,
 * `corners`, `density`, `frame` and `photo`. The first value of each list is the default. Light or dark is
 * the site's `mode`, not an axis.
 */
export function familyAxes(id: FamilyId): Record<AxisName, string[]> {
  const f = FAMILIES[id]
  return {
    type: Object.keys(f.pairings),
    palette: Object.keys(f.palettes),
    corners: Object.keys(f.corners),
    density: Object.keys(DENSITY),
    frame: [...FRAME],
    photo: [...PHOTO],
  }
}
export const AXIS_NAMES = ['type', 'palette', 'corners', 'density', 'frame', 'photo'] as const
export type AxisName = (typeof AXIS_NAMES)[number]
export type Axes = Partial<Record<AxisName, string>>

/** Problems with a style's family and settings. Empty when valid. */
export function checkStyle(style: { family: string; axes: Record<string, string> }): string[] {
  const [name, version] = style.family.split('@')
  if (!(name && name in FAMILIES)) return [`unknown family "${style.family}"`]
  if (version !== '1') return [`unknown version of ${name}: "${version}"`]
  const lists = familyAxes(name as FamilyId)
  const problems: string[] = []
  for (const [axis, value] of Object.entries(style.axes)) {
    const list = lists[axis as AxisName]
    if (!list) problems.push(`${name} has no setting "${axis}"`)
    else if (!list.includes(value))
      problems.push(`${name}: "${value}" is not a ${axis} (${list.join(', ')})`)
  }
  return problems
}

/** The family and settings named by a style's family string, with defaults filled in. */
export function resolveStyle(style: {
  family: string
  axes: Record<string, string>
  mode?: 'light' | 'dark'
}): { id: FamilyId; axes: Required<Axes>; mode: 'light' | 'dark' } {
  const problems = checkStyle(style)
  if (problems.length) throw new Error(problems.join('; '))
  const id = style.family.split('@')[0] as FamilyId
  const lists = familyAxes(id)
  const axes = Object.fromEntries(
    AXIS_NAMES.map((a) => [a, style.axes[a] ?? lists[a][0]]),
  ) as Required<Axes>
  return { id, axes, mode: style.mode ?? 'light' }
}

/* ------------------------------------------------------------------ output */

const vars = (prefix: string, t: TypeRole) =>
  [
    `--type-${prefix}-family: ${t.family};`,
    `--type-${prefix}-size: ${t.size};`,
    `--type-${prefix}-leading: ${t.leading};`,
    `--type-${prefix}-tracking: ${t.tracking};`,
    `--type-${prefix}-weight: ${t.weight};`,
    `--type-${prefix}-case: ${t.case ?? 'none'};`,
  ].join('\n  ')

/**
 * The theme for one site: CSS variables on [data-site], the fonts link and the kit's button style.
 * `axes` and `mode` are the site's style settings; missing settings take the family's defaults.
 */
export function theme(
  id: FamilyId,
  brand: string,
  choice: { axes?: Axes; mode?: 'light' | 'dark' } = {},
) {
  const { axes, mode } = resolveStyle({
    family: `${id}@1`,
    axes: (choice.axes ?? {}) as Record<string, string>,
    mode: choice.mode,
  })
  const f = FAMILIES[id]
  const t = f.pairings[axes.type] as Pairing
  const p =
    mode === 'dark'
      ? f.dark(brand)
      : (f.palettes[axes.palette] as { make: (b: string) => Palette }).make(brand)
  const c = f.corners[axes.corners] as Corners
  const d = DENSITY[axes.density as keyof typeof DENSITY]
  const pal = (Object.entries(p) as [keyof Palette, Roles][])
    .map(
      ([s, r]) =>
        `--p-${s}-bg: ${r.bg}; --p-${s}-fg: ${r.fg}; --p-${s}-fg-muted: ${r.fgMuted}; --p-${s}-accent: ${r.accent}; --p-${s}-accent-fg: ${r.accentFg}; --p-${s}-border: ${r.border};`,
    )
    .join('\n  ')
  const k = f.space.scale * d
  const rem = (x: number) => `${(x * k).toFixed(3)}rem`
  const frame =
    axes.frame === 'inset'
      ? `
[data-site] > [data-block-id]:not(header):not([data-surface="base"]) {
  margin: var(--space-sm) var(--space-gutter);
  border-radius: var(--corner-card);
  overflow: clip;
}
`
      : ''
  const filter = photoFilter(axes.photo, brand)
  const photo = filter === 'none' ? '' : `\n[data-site] img.media-cover { filter: ${filter}; }\n`
  const css = `[data-site] {
  color-scheme: ${mode};
  ${pal}
  ${vars('display', t.display)}
  ${vars('h2', t.h2)}
  ${vars('h3', t.h3)}
  ${vars('eyebrow', t.label_)}
  ${vars('button', t.button)}
  --type-jumbo-size: ${t.jumbo};
  --type-display-advance: ${t.advance};
  --type-body-family: ${t.body};
  --type-body-weight: ${t.bodyWeight};
  --type-body-size: ${f.sizes.body};
  --type-body-leading: 1.6;
  --type-lead-size: ${f.sizes.lead};
  --type-lead-leading: 1.5;
  --type-small-size: ${f.sizes.small};
  --type-small-leading: 1.5;
  --space-2xs: ${rem(0.25)}; --space-xs: ${rem(0.5)}; --space-sm: ${rem(0.75)}; --space-md: ${rem(1.25)};
  --space-lg: ${rem(2)}; --space-xl: ${rem(3)}; --space-2xl: ${rem(4.5)};
  --space-section: calc(${f.space.section} * ${d});
  --space-gutter: clamp(1rem, 0.5rem + 2cqi, 2.5rem);
  --space-columns: clamp(1.5rem, 1rem + 2cqi, 3rem);
  --corner-control: ${c.control}; --corner-card: ${c.card}; --corner-media: ${c.media};
}
${frame}${photo}`
  return {
    css,
    fontsHref: `https://fonts.googleapis.com/css2?${t.fonts}&display=swap`,
    button: f.button,
    art: f.art,
    palette: p,
    axes,
    mode,
  }
}
