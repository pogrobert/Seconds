// A business's theme as shadcn/ui tokens (docs/m0/16-block-library.md). The colour and type rules
// (tools/eval/src/grammar: colour-rules.ts, type-rules.ts) stay the source of taste; this maps
// their output onto the token names every shadcn-style block uses, so the same block looks like
// the business it is drawn for.

/** A palette from a colour rule: --ground, --ink, --muted, --line, --tint, --accent, --btn… */
export type Palette = Record<string, string>
/** A type rule: its fonts query and its CSS variables (--f-d, --w-d, --t-d, --c-d, --f-b…). */
export type TypeSystem = { fonts: string; vars: Record<string, string> }

export type Theme = { css: string; fontsHref: string; dark: boolean }

const luminance = (hex: string) => {
  const n = Number.parseInt(hex.replace('#', '').slice(0, 6), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * (c[0] ?? 0) + 0.7152 * (c[1] ?? 0) + 0.0722 * (c[2] ?? 0)
}

/**
 * Neutral colours (shadcn/ui's "neutral" scale). The tinted grounds and brand
 * colours from the colour rules looked cheap. A colour rule now only decides light or dark; every
 * site is black, white and greys, and the photos carry the colour.
 */
const NEUTRAL = {
  light: {
    '--background': '#ffffff',
    '--foreground': '#0a0a0a',
    '--card': '#fafafa',
    '--muted': '#f5f5f5',
    '--muted-foreground': '#737373',
    '--border': '#e5e5e5',
    '--primary': '#0a0a0a',
    '--primary-foreground': '#fafafa',
    '--band': '#0a0a0a',
    '--band-foreground': '#fafafa',
  },
  dark: {
    '--background': '#0a0a0a',
    '--foreground': '#fafafa',
    '--card': '#141414',
    '--muted': '#1c1c1c',
    '--muted-foreground': '#a3a3a3',
    '--border': '#262626',
    '--primary': '#fafafa',
    '--primary-foreground': '#0a0a0a',
    '--band': '#171717',
    '--band-foreground': '#fafafa',
  },
}

/**
 * The colour rule's palette as tokens ("leave the colour choices to Jev").
 * Jev picks a named colour and one of the quiet colour rules (a warm off-white page with the colour
 * as accent and bands, or a near-black page); the loud rules stay out (make-site.ts).
 */
function coloured(p: Palette): Record<string, string> {
  const g = (k: string, d: string) => p[k] ?? d
  return {
    '--background': g('--ground', '#ffffff'),
    '--foreground': g('--ink', '#0a0a0a'),
    '--card': g('--ground', '#ffffff'),
    '--muted': g('--tint', '#f5f5f5'),
    '--muted-foreground': g('--muted', '#737373'),
    '--border': g('--line', '#e5e5e5'),
    '--primary': g('--btn', '#0a0a0a'),
    '--primary-foreground': g('--on-btn', '#fafafa'),
    '--band': g('--band', '#0a0a0a'),
    '--band-foreground': g('--on-band', '#fafafa'),
  }
}

export function theme(p: Palette, t: TypeSystem, o: { neutral?: boolean } = {}): Theme {
  const dark = luminance(p['--ground'] ?? '#ffffff') < 0.2
  const n = o.neutral || !p['--ground'] ? (dark ? NEUTRAL.dark : NEUTRAL.light) : coloured(p)
  const pill = (t.vars['--radius'] ?? '') === '999px'
  const radius = pill ? '1rem' : (t.vars['--radius'] ?? '0.5rem')
  const tokens: Record<string, string> = {
    ...n,
    '--card-foreground': n['--foreground'],
    '--secondary': n['--muted'],
    '--secondary-foreground': n['--foreground'],
    // shadcn's "accent" is the soft hover ground.
    '--accent': n['--muted'],
    '--accent-foreground': n['--foreground'],
    '--input': n['--border'],
    '--ring': n['--muted-foreground'],
    '--radius': radius,
    '--button-radius': pill ? '999px' : radius,
    '--font-heading': t.vars['--f-d'] ?? 'Georgia, serif',
    '--font-body': t.vars['--f-b'] ?? 'system-ui, sans-serif',
    '--font-label': t.vars['--f-l'] ?? t.vars['--f-b'] ?? 'system-ui, sans-serif',
    '--heading-weight': t.vars['--w-d'] ?? '600',
    '--heading-tracking': t.vars['--t-d'] ?? '-0.02em',
    '--heading-case': t.vars['--c-d'] ?? 'none',
  }
  const css = `:root{${Object.entries(tokens)
    .map(([k, val]) => `${k}:${val}`)
    .join(';')}}`
  return { css, fontsHref: `https://fonts.googleapis.com/css2?${t.fonts}&display=swap`, dark }
}
