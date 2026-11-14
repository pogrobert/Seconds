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

export type Family = {
  id: FamilyId
  label: string
  feel: string
  /** Google Fonts css2 query for previews. Published sites will self-host (report 02, D11). */
  fonts: string
  type: {
    display: TypeRole
    h2: TypeRole
    h3: TypeRole
    body: string
    bodyWeight: number
    label: TypeRole
    button: TypeRole
  }
  sizes: { lead: string; body: string; small: string }
  space: { section: string; scale: number }
  corners: { control: string; card: string; media: string }
  button: 'solid' | 'outline' | 'text'
  art: string
  palette: (brand: string) => Palette
}

const sans = (f: string) => `"${f}", system-ui, -apple-system, "Segoe UI", sans-serif`
const serif = (f: string) => `"${f}", Georgia, "Times New Roman", serif`
const mono = (f: string) => `"${f}", ui-monospace, "SFMono-Regular", Menlo, monospace`

export const FAMILIES: Record<FamilyId, Family> = {
  poster: {
    id: 'poster',
    label: 'Poster',
    feel: 'Loud and local: huge condensed capitals, flat colour blocks, square corners.',
    fonts: 'family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600',
    type: {
      display: {
        family: sans('Oswald'),
        size: 'clamp(3rem, 1.6rem + 6.4cqi, 7rem)',
        leading: 0.92,
        tracking: '-0.01em',
        weight: 700,
        case: 'uppercase',
      },
      h2: {
        family: sans('Oswald'),
        size: 'clamp(2.25rem, 1.5rem + 3.4cqi, 4.25rem)',
        leading: 0.95,
        tracking: '0',
        weight: 700,
        case: 'uppercase',
      },
      h3: {
        family: sans('Oswald'),
        size: '1.375rem',
        leading: 1.15,
        tracking: '0.01em',
        weight: 600,
        case: 'uppercase',
      },
      body: sans('Inter'),
      bodyWeight: 400,
      label: {
        family: sans('Inter'),
        size: '0.75rem',
        leading: 1.3,
        tracking: '0.18em',
        weight: 600,
        case: 'uppercase',
      },
      button: {
        family: sans('Oswald'),
        size: '1.125rem',
        leading: 1.1,
        tracking: '0.04em',
        weight: 600,
        case: 'uppercase',
      },
    },
    sizes: { lead: 'clamp(1.0625rem, 1rem + 0.4cqi, 1.25rem)', body: '1rem', small: '0.875rem' },
    space: { section: 'clamp(3.5rem, 2rem + 6cqi, 6.5rem)', scale: 1 },
    corners: { control: '0', card: '0', media: '0' },
    button: 'solid',
    art: 'screenprint',
    palette: (brand) => {
      const strong = ensure(brand, '#ffffff', 4.5)
      const ground = mix(brand, '#ffffff', 0.9)
      return {
        base: surface(ground, '#111111', strong),
        muted: surface(mix(brand, '#ffffff', 0.7), '#111111', '#111111'),
        brand: surface(strong, onColour(strong), mix(brand, '#ffffff', 0.85)),
        inverse: surface('#111111', '#ffffff', mix(brand, '#ffffff', 0.55)),
      }
    },
  },
  quiet: {
    id: 'quiet',
    label: 'Quiet',
    feel: 'Hushed and expensive: small serif headings, wide margins, one dark ink on warm white.',
    fonts: 'family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Hanken+Grotesk:wght@400;500;600',
    type: {
      display: {
        family: serif('Newsreader'),
        size: 'clamp(2rem, 1.5rem + 2.2cqi, 3.25rem)',
        leading: 1.12,
        tracking: '-0.01em',
        weight: 400,
      },
      h2: {
        family: serif('Newsreader'),
        size: 'clamp(1.5rem, 1.25rem + 1.1cqi, 2.125rem)',
        leading: 1.2,
        tracking: '0',
        weight: 400,
      },
      h3: {
        family: sans('Hanken Grotesk'),
        size: '1.0625rem',
        leading: 1.35,
        tracking: '0',
        weight: 600,
      },
      body: sans('Hanken Grotesk'),
      bodyWeight: 400,
      label: {
        family: sans('Hanken Grotesk'),
        size: '0.75rem',
        leading: 1.3,
        tracking: '0.14em',
        weight: 500,
        case: 'uppercase',
      },
      button: {
        family: sans('Hanken Grotesk'),
        size: '0.875rem',
        leading: 1.2,
        tracking: '0.12em',
        weight: 500,
        case: 'uppercase',
      },
    },
    sizes: { lead: 'clamp(1.0625rem, 1rem + 0.3cqi, 1.1875rem)', body: '1rem', small: '0.875rem' },
    space: { section: 'clamp(4.5rem, 2.5rem + 8cqi, 9rem)', scale: 1.15 },
    corners: { control: '0', card: '0', media: '0' },
    button: 'outline',
    art: 'aquatint',
    palette: (brand) => {
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
  workshop: {
    id: 'workshop',
    label: 'Workshop',
    feel: 'Practical and precise: plain grotesk with typewriter labels, hairlines, one safety colour.',
    fonts: 'family=Schibsted+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500',
    type: {
      display: {
        family: sans('Schibsted Grotesk'),
        size: 'clamp(2.25rem, 1.5rem + 3.6cqi, 4.25rem)',
        leading: 1.02,
        tracking: '-0.025em',
        weight: 600,
      },
      h2: {
        family: sans('Schibsted Grotesk'),
        size: 'clamp(1.75rem, 1.35rem + 1.8cqi, 2.75rem)',
        leading: 1.08,
        tracking: '-0.02em',
        weight: 600,
      },
      h3: {
        family: sans('Schibsted Grotesk'),
        size: '1.1875rem',
        leading: 1.3,
        tracking: '-0.01em',
        weight: 600,
      },
      body: sans('Schibsted Grotesk'),
      bodyWeight: 400,
      label: {
        family: mono('IBM Plex Mono'),
        size: '0.75rem',
        leading: 1.3,
        tracking: '0.08em',
        weight: 500,
        case: 'uppercase',
      },
      button: {
        family: mono('IBM Plex Mono'),
        size: '0.875rem',
        leading: 1.2,
        tracking: '0.06em',
        weight: 500,
        case: 'uppercase',
      },
    },
    sizes: { lead: 'clamp(1.0625rem, 1rem + 0.35cqi, 1.25rem)', body: '1rem', small: '0.875rem' },
    space: { section: 'clamp(3.5rem, 2rem + 5cqi, 6rem)', scale: 1 },
    corners: { control: '0', card: '0', media: '0' },
    button: 'solid',
    art: 'linework',
    palette: (brand) => {
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
  soft: {
    id: 'soft',
    label: 'Soft',
    feel: 'Friendly and reassuring: light sans, rounded cards and photos, pill buttons, pale tints.',
    fonts: 'family=Geist:wght@300;400;500;600',
    type: {
      display: {
        family: sans('Geist'),
        size: 'clamp(2.5rem, 1.7rem + 4cqi, 4.75rem)',
        leading: 1.04,
        tracking: '-0.035em',
        weight: 300,
      },
      h2: {
        family: sans('Geist'),
        size: 'clamp(1.875rem, 1.45rem + 2cqi, 3.125rem)',
        leading: 1.1,
        tracking: '-0.03em',
        weight: 300,
      },
      h3: {
        family: sans('Geist'),
        size: '1.25rem',
        leading: 1.3,
        tracking: '-0.01em',
        weight: 500,
      },
      body: sans('Geist'),
      bodyWeight: 400,
      label: { family: sans('Geist'), size: '0.8125rem', leading: 1.3, tracking: '0', weight: 500 },
      button: { family: sans('Geist'), size: '1rem', leading: 1.2, tracking: '0', weight: 500 },
    },
    sizes: { lead: 'clamp(1.0625rem, 1rem + 0.4cqi, 1.25rem)', body: '1rem', small: '0.875rem' },
    space: { section: 'clamp(3.5rem, 2rem + 6cqi, 6.5rem)', scale: 1.05 },
    corners: { control: '999px', card: '1.5rem', media: '1.25rem' },
    button: 'solid',
    art: 'underpaint',
    palette: (brand) => {
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
  deep: {
    id: 'deep',
    label: 'Deep',
    feel: 'Moody and rich: dark jewel ground, pale compressed capitals, typewriter labels, pill buttons.',
    fonts: 'family=Antonio:wght@500;600;700&family=Inter:wght@400;500&family=Oxygen+Mono',
    type: {
      display: {
        family: sans('Antonio'),
        size: 'clamp(3rem, 1.4rem + 7.5cqi, 8rem)',
        leading: 0.9,
        tracking: '-0.01em',
        weight: 700,
        case: 'uppercase',
      },
      h2: {
        family: sans('Antonio'),
        size: 'clamp(2.25rem, 1.4rem + 4cqi, 4.75rem)',
        leading: 0.95,
        tracking: '0',
        weight: 700,
        case: 'uppercase',
      },
      h3: {
        family: sans('Antonio'),
        size: '1.5rem',
        leading: 1.1,
        tracking: '0.01em',
        weight: 600,
        case: 'uppercase',
      },
      body: sans('Inter'),
      bodyWeight: 400,
      label: {
        family: mono('Oxygen Mono'),
        size: '0.8125rem',
        leading: 1.3,
        tracking: '0.04em',
        weight: 400,
        case: 'uppercase',
      },
      button: {
        family: mono('Oxygen Mono'),
        size: '0.9375rem',
        leading: 1.2,
        tracking: '0.03em',
        weight: 400,
        case: 'uppercase',
      },
    },
    sizes: { lead: 'clamp(1.0625rem, 1rem + 0.4cqi, 1.25rem)', body: '1rem', small: '0.875rem' },
    space: { section: 'clamp(4rem, 2.2rem + 7cqi, 7.5rem)', scale: 1.1 },
    corners: { control: '999px', card: '1rem', media: '0.75rem' },
    button: 'solid',
    art: 'mezzotint',
    palette: (brand) => {
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
}

export const FAMILY_IDS = Object.keys(FAMILIES) as FamilyId[]

/** The three families M0 tests (Robert, 2026-11-14; docs/decisions/0002-style-families.md). */
export const M0_FAMILIES = ['poster', 'quiet', 'soft'] as const satisfies readonly FamilyId[]

/* ------------------------------------------------------------------ output */

const role = (prefix: string, t: TypeRole) =>
  [
    `--type-${prefix}-family: ${t.family};`,
    `--type-${prefix}-size: ${t.size};`,
    `--type-${prefix}-leading: ${t.leading};`,
    `--type-${prefix}-tracking: ${t.tracking};`,
    `--type-${prefix}-weight: ${t.weight};`,
    `--type-${prefix}-case: ${t.case ?? 'none'};`,
  ].join('\n  ')

/** The theme for one site: CSS variables on [data-site], the fonts link and the kit's button style. */
export function theme(id: FamilyId, brand: string) {
  const f = FAMILIES[id]
  const p = f.palette(brand)
  const pal = (Object.entries(p) as [keyof Palette, Roles][])
    .map(
      ([s, r]) =>
        `--p-${s}-bg: ${r.bg}; --p-${s}-fg: ${r.fg}; --p-${s}-fg-muted: ${r.fgMuted}; --p-${s}-accent: ${r.accent}; --p-${s}-accent-fg: ${r.accentFg}; --p-${s}-border: ${r.border};`,
    )
    .join('\n  ')
  const k = f.space.scale
  const rem = (x: number) => `${(x * k).toFixed(3)}rem`
  const css = `[data-site] {
  ${pal}
  ${role('display', f.type.display)}
  ${role('h2', f.type.h2)}
  ${role('h3', f.type.h3)}
  ${role('eyebrow', f.type.label)}
  ${role('button', f.type.button)}
  --type-body-family: ${f.type.body};
  --type-body-weight: ${f.type.bodyWeight};
  --type-body-size: ${f.sizes.body};
  --type-body-leading: 1.6;
  --type-lead-size: ${f.sizes.lead};
  --type-lead-leading: 1.5;
  --type-small-size: ${f.sizes.small};
  --type-small-leading: 1.5;
  --space-2xs: ${rem(0.25)}; --space-xs: ${rem(0.5)}; --space-sm: ${rem(0.75)}; --space-md: ${rem(1.25)};
  --space-lg: ${rem(2)}; --space-xl: ${rem(3)}; --space-2xl: ${rem(4.5)};
  --space-section: ${f.space.section};
  --space-gutter: clamp(1rem, 0.5rem + 2cqi, 2.5rem);
  --space-columns: clamp(1.5rem, 1rem + 2cqi, 3rem);
  --corner-control: ${f.corners.control}; --corner-card: ${f.corners.card}; --corner-media: ${f.corners.media};
}
`
  return {
    css,
    fontsHref: `https://fonts.googleapis.com/css2?${f.fonts}&display=swap`,
    button: f.button,
    art: f.art,
    palette: p,
  }
}
