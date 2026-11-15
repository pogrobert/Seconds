import type { SectionTypeName, SurfaceName } from '@repo/spec'
import type { SectionPlan, SitePlan } from './assemble.ts'
import { DEFAULT_PLANS, type Kind } from './defaults.ts'

// The directions (docs/m0/09-directions.md): finished looks Robert scored 4 and 5. A direction is a
// style family plus a fixed set of blocks and backgrounds, one for every kind of section the default
// pages use. Nothing is mixed across directions: within one, only the words, the photos and the
// optional sections change. Taste lives here, in the library, not in the decision model (CLAUDE.md).

export type Slot = { type: string; variant: string; surface: SurfaceName }

export type Direction = {
  id: 'landscape' | 'wordmark' | 'signature' | 'atelier'
  label: string
  header: Slot
  footer: Slot
  /** One slot per section type; `steps` is the "how it works" cards. */
  sections: Partial<Record<SectionTypeName, Slot>> & { steps?: Slot }
  /** The drawings set for each kind of business, for directions that draw. */
  marks?: Partial<Record<Kind, string>>
  /** Kept in the library but not offered: it did not hold up across businesses (Robert's scores). */
  parked?: string
}

const at = (type: string, variant: string, surface: SurfaceName = 'base'): Slot => ({
  type,
  variant,
  surface,
})

export const DIRECTIONS: Record<Direction['id'], Direction> = {
  landscape: {
    id: 'landscape',
    label: 'Landscape',
    header: at('header/over', 'on-dark'),
    footer: at('footer/simple', 'inline'),
    sections: {
      hero: at('hero/stage', 'sky'),
      'text-media': at('text-media/editorial', 'heading-aside'),
      cards: at('cards/list', 'two-column'),
      steps: at('cards/steps', 'numbered', 'muted'),
      'price-list': at('price-list/classic', 'leaders'),
      'hours-location': at('hours-location/split', 'with-text', 'muted'),
      cta: at('cta/band', 'centered'),
    },
  },
  wordmark: {
    id: 'wordmark',
    label: 'Wordmark',
    header: at('header/over', 'on-dark'),
    footer: at('footer/simple', 'inline', 'inverse'),
    sections: {
      hero: at('hero/stage', 'pair'),
      'text-media': at('text-media/feature', 'quote'),
      cards: at('cards/grid', 'plain'),
      steps: at('cards/steps', 'numbered'),
      'price-list': at('price-list/classic', 'menu-board', 'muted'),
      'hours-location': at('hours-location/split', 'with-text'),
      cta: at('cta/band', 'centered', 'muted'),
    },
  },
  signature: {
    id: 'signature',
    label: 'Signature',
    // Light and warm, no black (Robert, 2026-11-15: "i kinda do not like the black bg and square
    // buttons"). The colour comes from the drawings and one brand-coloured band.
    header: at('header/over', 'on-light'),
    footer: at('footer/simple', 'inline', 'muted'),
    sections: {
      hero: at('hero/stage', 'lettered'),
      'text-media': at('text-media/split', 'text-only', 'muted'),
      cards: at('cards/marks', 'row', 'muted'),
      steps: at('cards/steps', 'numbered'),
      'price-list': at('price-list/menu', 'list'),
      'hours-location': at('hours-location/split', 'with-text', 'brand'),
      cta: at('cta/band', 'centered'),
    },
    marks: {
      restaurant: 'food',
      salon: 'hair',
      clinic: 'dental',
      trades: 'trades',
      fitness: 'fitness',
    },
  },
  atelier: {
    id: 'atelier',
    label: 'Atelier',
    parked:
      'Scored 2 for every business from the library (2026-11-15): its wash fails on anything but one kind of bright photo.',
    header: at('header/over', 'on-light'),
    footer: at('footer/wordmark', 'wordmark'),
    sections: {
      hero: at('hero/stage', 'feature'),
      'text-media': at('text-media/split', 'image-start', 'muted'),
      cards: at('cards/grid', 'images'),
      steps: at('cards/steps', 'rows'),
      'price-list': at('price-list/classic', 'leaders'),
      'hours-location': at('hours-location/panel', 'single'),
      cta: at('cta/band', 'centered', 'muted'),
    },
  },
}

/** The directions on offer. Parked ones stay in the library for sites that already use them. */
export const DIRECTION_IDS = (Object.keys(DIRECTIONS) as Direction['id'][]).filter(
  (d) => !DIRECTIONS[d].parked,
)

/**
 * A kind's default page in a direction: the same sections in the same order with the same menu
 * labels, each drawn with the direction's block and background.
 */
export function directionPlan(kind: Kind, id: Direction['id']): SitePlan {
  const d = DIRECTIONS[id]
  const base = DEFAULT_PLANS[kind]
  const fill = (s: SectionPlan, slot: Slot | undefined): SectionPlan =>
    slot ? { ...s, type: slot.type, variant: slot.variant, surface: slot.surface } : s
  const pick = (s: SectionPlan) =>
    fill(
      s,
      s.type === 'cards/steps' ? (d.sections.steps ?? d.sections.cards) : d.sections[s.sectionType],
    )
  const marks = d.marks?.[kind]
  return {
    before: base.before.map((s) => fill(s, d.header)),
    sections: base.sections.map(pick),
    after: base.after.map((s) => fill(s, d.footer)),
    style: { family: `${id}@1`, axes: marks ? { marks } : {}, mode: 'light' },
  }
}
