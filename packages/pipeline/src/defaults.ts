import type { BlockManifest } from '@repo/blocks/manifest'
import type { SectionTypeName } from '@repo/spec'
import type { SectionPlan, SitePlan } from './assemble.ts'

// Arm B of M0: sensible defaults written in code, with no model (docs/technical/README.md).
// One default page per kind of business: which sections, in what order, which block and variant.
// Arm C, random valid choices, is here too, so both baselines live next to each other.

export const KINDS = ['restaurant', 'salon', 'clinic', 'trades', 'fitness'] as const
export type Kind = (typeof KINDS)[number]

const s = (type: string, variant: string, extra: Partial<SectionPlan> = {}): SectionPlan => ({
  sectionType: type.split('/')[0] as SectionTypeName,
  type,
  variant,
  ...extra,
})

const STYLE = { family: 'draft@1', axes: {}, mode: 'light' as const }

export const DEFAULT_PLANS: Record<Kind, SitePlan> = {
  restaurant: {
    before: [s('header/classic', 'inline')],
    sections: [
      s('hero/overlay', 'bottom'),
      s('text-media/split', 'image-end'),
      s('price-list/menu', 'list', { navLabel: 'Menu', surface: 'muted' }),
      s('hours-location/panel', 'single', { navLabel: 'Visit' }),
      s('cta/band', 'centered', { surface: 'brand' }),
    ],
    after: [s('footer/simple', 'centered', { surface: 'muted' })],
    style: STYLE,
  },
  salon: {
    before: [s('header/classic', 'inline')],
    sections: [
      s('hero/standard', 'split'),
      s('cards/grid', 'plain', { navLabel: 'Why us' }),
      s('price-list/menu', 'table', { navLabel: 'Prices', surface: 'muted' }),
      s('text-media/editorial', 'heading-aside', { navLabel: 'About' }),
      s('hours-location/split', 'with-text', { navLabel: 'Visit' }),
      s('cta/band', 'centered', { surface: 'brand' }),
    ],
    after: [s('footer/simple', 'inline', { surface: 'muted' })],
    style: STYLE,
  },
  clinic: {
    before: [s('header/utility', 'bar')],
    sections: [
      s('hero/standard', 'split'),
      s('cards/grid', 'bordered', { navLabel: 'Why us' }),
      s('price-list/menu', 'list', { navLabel: 'Fees', surface: 'muted' }),
      s('text-media/split', 'image-start', { navLabel: 'About' }),
      s('hours-location/panel', 'single', { navLabel: 'Visit' }),
      s('cta/band', 'centered', { surface: 'brand' }),
    ],
    after: [s('footer/columns', 'columns', { surface: 'muted' })],
    style: STYLE,
  },
  trades: {
    before: [s('header/utility', 'bar')],
    sections: [
      s('hero/standard', 'centered'),
      s('cards/grid', 'bordered', { navLabel: 'Services' }),
      s('cards/steps', 'numbered', { navLabel: 'How it works', surface: 'muted' }),
      s('text-media/split', 'text-only', { navLabel: 'About' }),
      s('cta/band', 'centered', { surface: 'brand' }),
      s('hours-location/split', 'compact', { navLabel: 'Contact' }),
    ],
    after: [s('footer/simple', 'inline', { surface: 'muted' })],
    style: STYLE,
  },
  fitness: {
    before: [s('header/classic', 'inline')],
    sections: [
      s('hero/overlay', 'center'),
      s('cards/grid', 'plain', { navLabel: 'Why us' }),
      s('price-list/cards', 'groups', { navLabel: 'Prices', surface: 'muted' }),
      s('text-media/split', 'image-start', { navLabel: 'Studio' }),
      s('cta/signup', 'inline', { surface: 'brand' }),
      s('hours-location/panel', 'single', { navLabel: 'Visit' }),
    ],
    after: [s('footer/columns', 'columns', { surface: 'muted' })],
    style: STYLE,
  },
}

/** A small seeded random generator (mulberry32), so a random plan can be reproduced. */
export function rng(seed: string) {
  let h = 1779033703
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353)
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Arm C: random valid choices. The same sections as the kind's default (so the content is the same),
 * but each section's block, variant and surface is drawn at random from what the library allows,
 * and the middle sections are shuffled. `allowed` filters out variants the content cannot fill.
 */
export function randomPlan(
  kind: Kind,
  seed: string,
  manifests: readonly BlockManifest[],
  allowed: (m: BlockManifest, variant: string, section: SectionPlan) => boolean,
): SitePlan {
  const rand = rng(seed)
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)] as T
  const base = DEFAULT_PLANS[kind]
  const redraw = (sec: SectionPlan, surface: boolean): SectionPlan => {
    const options = manifests
      .filter((m) => m.sectionType === sec.sectionType)
      .flatMap((m) => Object.keys(m.variants).map((v) => ({ m, v })))
      .filter(({ m, v }) => allowed(m, v, sec))
    const choice = options.length ? pick(options) : null
    return {
      ...sec,
      ...(choice ? { type: choice.m.type, variant: choice.v } : {}),
      ...(surface ? { surface: pick(['base', 'muted', 'brand', 'inverse'] as const) } : {}),
    }
  }
  const [first, ...rest] = base.sections
  const middle = rest.map((x) => redraw(x, true))
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[middle[i], middle[j]] = [middle[j] as SectionPlan, middle[i] as SectionPlan]
  }
  return {
    before: base.before.map((x) => redraw(x, false)),
    sections: [...(first ? [redraw(first, false)] : []), ...middle],
    after: base.after.map((x) => redraw(x, false)),
    style: base.style,
  }
}
