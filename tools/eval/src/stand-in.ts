import type { SectionPlan } from '@repo/pipeline'
import type { Asset, RichText } from '@repo/spec'
import type { SampleBusiness } from './businesses.ts'

// Section content from a sample business's facts and stand-in copy. A placeholder for the text
// model: it fills the same typed fields, so layouts can be judged before the pipeline writes text.

const para = (text: string): RichText => [{ style: 'p', spans: [{ text }] }]
const aid = (kind: string, n: number) =>
  `a_${kind.slice(0, 4).padEnd(4, 'x')}${String(n).padStart(6, '0')}` as const
const iid = (n: number) => `i_${String(n).padStart(10, '0')}` as const
const fid = 'f_newsletter' as const

export function sampleAssets(s: SampleBusiness): Asset[] {
  const make = (n: number, seed: string, alt: string): Asset => ({
    id: aid(s.kind, n),
    type: 'image',
    source: { type: 'generated', generator: 'surfaces', style: 'riso', seed: `${s.kind}-${seed}` },
    alt,
  })
  return [
    make(1, 'hero', `${s.business.name}: ${s.standIn.tagline}`),
    make(2, 'about', `Inside ${s.business.name}`),
    make(3, 'cta', `${s.business.name}`),
    make(4, 'detail-1', 'Detail'),
    make(5, 'detail-2', 'Detail'),
  ]
}

export function standInContent(s: SampleBusiness, sec: SectionPlan): Record<string, unknown> {
  const t = s.standIn
  const booking = {
    type: 'contact' as const,
    channel: s.business.bookingUrl ? ('booking' as const) : ('phone' as const),
  }
  const cta = { label: t.cta.label, to: booking }
  const img = (n: number) => ({
    asset: aid(s.kind, n),
    alt: n === 1 ? `${s.business.name}: ${t.tagline}` : `Inside ${s.business.name}`,
  })
  const collection = s.collections[0]
  switch (sec.sectionType) {
    case 'header':
      return {
        primaryCta: { label: s.business.bookingUrl ? 'Book' : 'Call us', to: booking },
        facts: ['phone', 'address'],
      }
    case 'footer':
      return {
        facts: [
          'address',
          'hours',
          'phone',
          'email',
          'social',
          ...(s.business.licences ? ['licence' as const] : []),
        ],
        note: `© 2026 ${s.business.name}`,
      }
    case 'hero':
      return {
        eyebrow: t.tagline,
        headline: t.headline,
        subhead: t.subhead,
        primaryCta: cta,
        ...(sec.variant === 'collage'
          ? { gallery: [1, 4, 5].map((n, i) => ({ id: iid(900 + i), image: img(n) })) }
          : sec.variant === 'centered'
            ? {}
            : { media: img(1) }),
        ...(s.business.proof ? { proof: { text: s.business.proof.text } } : {}),
      }
    case 'text-media':
      return {
        eyebrow: 'About us',
        headline: `About ${s.business.name}`,
        body: para(t.about),
        ...(sec.variant === 'text-only' || sec.variant === 'heading-aside'
          ? {}
          : sec.variant === 'gallery'
            ? { gallery: [2, 4, 5].map((n, i) => ({ id: iid(920 + i), image: img(n) })) }
            : { media: img(2) }),
      }
    case 'cards': {
      const list = sec.type === 'cards/steps' && t.steps ? t.steps : t.reasons
      return {
        headline:
          sec.type === 'cards/steps'
            ? 'How it works'
            : sec.navLabel === 'Services'
              ? 'What we do'
              : `Why ${s.business.name}`,
        items: list.map((r, i) => ({ id: iid(800 + i), title: r.title, body: para(r.body) })),
      }
    }
    case 'cta':
      return {
        headline: t.cta.headline,
        subhead: t.cta.subhead,
        ...(sec.type === 'cta/signup'
          ? { form: { form: fid, kind: 'newsletter' } }
          : { primaryCta: cta }),
        ...(sec.variant === 'split' ? { media: img(3) } : {}),
      }
    case 'price-list':
      return collection
        ? {
            headline: sec.navLabel ?? 'Prices',
            source: { collection: collection.id, groupBy: 'group' },
            note:
              s.kind === 'restaurant'
                ? 'V vegetarian · GF gluten free. Please tell us about allergies.'
                : 'Prices may change; we always confirm before we start.',
            ...(s.business.bookingUrl ? { primaryCta: { label: 'Book online', to: booking } } : {}),
          }
        : { source: { collection: 'c_missing000' } }
    case 'hours-location':
      return {
        headline: sec.navLabel === 'Contact' ? 'Get in touch' : 'Visit us',
        facts: ['hours', 'address', 'map', 'phone'],
        ...(sec.variant === 'with-text'
          ? { body: para(s.business.locations[0]?.note ?? 'Find us here.') }
          : {}),
        primaryCta: { label: 'Get directions', to: { type: 'contact', channel: 'directions' } },
      }
    default:
      return {}
  }
}
