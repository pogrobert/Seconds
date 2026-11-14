import { type BlockManifest, eligibility, manifests } from '@repo/blocks/manifest'
import type { SectionPlan } from '@repo/pipeline'
import type { SampleBusiness } from './businesses.ts'
import { standInContent } from './stand-in.ts'

// Section content for a sample business with every picture a variant can show: one photo, a
// gallery, a photo per item, a form. The same rules as the Wall's round 3 (tasks/wall.task.ts):
// the banner takes the site's lead photo and the sections below take the others in turn, so a page
// repeats a photo only when it runs out. A variant uses only the fields it names.

const aid = (kind: string, n: number) =>
  `a_${kind.slice(0, 4).padEnd(4, 'x')}${String(n).padStart(6, '0')}`

/** The photos a business has (asset numbers), with the lead first. Photo 3 never leads. */
export const photoOrder = (lead: number) => [lead, ...[1, 2, 3, 4, 5].filter((n) => n !== lead)]

export function sectionContent(
  sample: SampleBusiness,
  photos: number[],
  m: BlockManifest,
  variant: string,
  sec: SectionPlan,
  /** The section's place on the page, so neighbouring sections start on different photos. */
  seat: number,
): Record<string, unknown> {
  const img = (n: number) => ({ asset: aid(sample.kind, n), alt: `Inside ${sample.business.name}` })
  const c = standInContent(sample, { ...sec, type: m.type, variant: 'rich' })
  const v = m.variants[variant]
  const uses = new Set<string>([
    ...((v?.uses ?? []) as readonly string[]),
    ...((v?.requires ?? []) as readonly string[]),
  ])
  const requires = new Set<string>((v?.requires ?? []) as readonly string[])
  const hero = sec.sectionType === 'hero'
  const rest = photos.slice(1)
  let next = 0
  const take = () => {
    if (hero && next === 0) {
      next++
      return photos[0] as number
    }
    return rest[(seat + next++) % rest.length] as number
  }
  if (requires.has('gallery') || (uses.has('gallery') && !uses.has('media'))) {
    c.gallery = [take(), take(), take()].map((n, k) => ({
      id: `i_${String(950 + k).padStart(10, '0')}`,
      image: img(n),
    }))
    delete c.media
  } else if (uses.has('media')) {
    c.media = img(take())
    delete c.gallery
  }
  if (v && v.signature.media !== 'none' && Array.isArray(c.items))
    c.items = (c.items as Record<string, unknown>[]).map((it) => ({ ...it, media: img(take()) }))
  if (uses.has('form') && c.form === undefined)
    c.form = { form: 'f_newsletter', kind: 'newsletter' }
  return c
}

const manifestOf = (type: string) => manifests.find((m) => m.type === type)

/** Content for every section of a plan, in the order assemble() asks for it. */
export const contentFor =
  (sample: SampleBusiness, photos: number[]) => (sec: SectionPlan, index: number) => {
    const m = manifestOf(sec.type)
    return m ? sectionContent(sample, photos, m, sec.variant, sec, index) : {}
  }

/** Can this variant show this business's content? */
export const eligibleFor = (sample: SampleBusiness, photos: number[]) => (sec: SectionPlan) => {
  const m = manifestOf(sec.type)
  return (
    !!m && eligibility(m, sec.variant, sectionContent(sample, photos, m, sec.variant, sec, 0)).ok
  )
}
