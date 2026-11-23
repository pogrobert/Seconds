// What every template reads: a site's content, and two small helpers over it.

export type Photo = { src: string; alt: string; w: number; h: number }

/** What every template reads. Structurally the same as the rules engine's Content (grammar/page.ts). */
export type SiteContent = {
  name: string
  tagline: string
  headline: string
  subhead: string
  about: string
  reasons: { title: string; body: string }[]
  reasonsTitle: string
  offerTitle: string
  prices: { group: string; items: { name: string; detail?: string; price: string }[] }[]
  hours: { days: string; time: string }[]
  address: string[]
  phone: string
  email: string
  book: string
  cta: { headline: string; subhead: string; label: string }
  photos: { hero: Photo; about: Photo; cta: Photo; d1: Photo; d2: Photo }
  /**
   * Sections that need real facts. Each appears only when the owner gave them (or, for questions,
   * when the words could answer them truthfully); a block for these returns null without them.
   */
  faq?: { q: string; a: string }[]
  /** One or two sentences in the owner's voice, set large. */
  statement?: string
  /** How working with them goes, 3 or 4 steps. */
  steps?: { title: string; items: { title: string; body: string }[] }
  /** Who it is for, 3 or 4 groups. */
  audience?: { title: string; items: { title: string; body: string }[] }
  stats?: { value: string; label: string }[]
  testimonials?: { quote: string; name: string; role?: string }[]
  team?: { name: string; role: string; photo?: Photo }[]
}

export const items = (c: SiteContent) => c.prices.flatMap((g) => g.items)
export const hasVisit = (c: SiteContent) =>
  !!(c.hours.length || c.address.length || c.phone || c.email)
