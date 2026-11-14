import type { SurfaceName } from '@repo/spec'
import type { SectionPlan, SitePlan } from './assemble.ts'

// Page rhythm: the order of background colours down a page (docs/m0/02, step 3). It is a decision
// of its own, so two sites with the same blocks still feel different. The decision model picks a
// rhythm by name; code turns it into a surface per block, which the spec stores as usual.

export const RHYTHMS = {
  /** All on the page's ground; only the call to action is coloured. Footer tinted. */
  calm: 'One ground colour, a coloured call to action',
  /** Sections alternate between the ground and a tint. */
  alternate: 'Sections alternate between ground and tint',
  /** Flat colour blocks: every other section is the brand colour or dark. */
  blocks: 'Every other section a block of colour',
  /** Light at the top, darkening towards the end: the last sections and footer are dark. */
  'dark-end': 'Light at the top, dark towards the end',
} as const
export type Rhythm = keyof typeof RHYTHMS
export const RHYTHM_NAMES = Object.keys(RHYTHMS) as Rhythm[]

/** Sections that ask to stand out: they take the strongest surface the rhythm offers. */
const isAction = (s: SectionPlan) => s.sectionType === 'cta'

/** The plan with every block's surface set by the rhythm. The first section (the hero) stays on the ground. */
export function applyRhythm(plan: SitePlan, rhythm: Rhythm): SitePlan {
  const body = plan.sections
  const n = body.length
  const surfaces: SurfaceName[] = body.map((s, i) => {
    if (i === 0) return 'base'
    switch (rhythm) {
      case 'calm':
        return isAction(s) ? 'brand' : 'base'
      case 'alternate':
        return isAction(s) ? 'brand' : i % 2 === 1 ? 'muted' : 'base'
      case 'blocks':
        return isAction(s) ? 'inverse' : i % 2 === 1 ? 'brand' : 'base'
      default:
        // dark-end
        return i >= n - 2 ? 'inverse' : isAction(s) ? 'brand' : i % 2 === 0 ? 'muted' : 'base'
    }
  })
  // Two coloured neighbours of the same colour read as one block; give the second the ground,
  // except where a rhythm means to merge them (the dark end).
  for (let i = 1; i < n; i++)
    if (
      surfaces[i] !== 'base' &&
      surfaces[i] === surfaces[i - 1] &&
      !(rhythm === 'dark-end' && surfaces[i] === 'inverse')
    )
      surfaces[i] = 'base'
  const last = surfaces[n - 1] ?? 'base'
  const footer: SurfaceName =
    rhythm === 'calm'
      ? 'muted'
      : rhythm === 'dark-end'
        ? 'inverse'
        : rhythm === 'blocks'
          ? last === 'inverse'
            ? 'brand'
            : 'inverse'
          : last === 'inverse'
            ? 'muted'
            : 'inverse'
  const header: SurfaceName = rhythm === 'blocks' ? 'inverse' : 'base'
  return {
    ...plan,
    before: plan.before.map((s) => ({ ...s, surface: header })),
    sections: body.map((s, i) => ({ ...s, surface: surfaces[i] ?? 'base' })),
    after: plan.after.map((s) => ({ ...s, surface: footer })),
  }
}
