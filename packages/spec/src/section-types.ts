import { z } from 'zod'
import { FIELDS, type FieldLimits, type FieldName, type FieldValues } from './fields.ts'

// The section types: named subsets of the global field list, with limits.
// Accepted on 2026-11-14 (docs/decisions/0001-section-types.md).
// Rule: only ever add. Removing a type or field, making an optional field required, or lowering a
// limit breaks saved sites and needs a spec migration. test/lock.test.ts enforces this.

type SectionDef = {
  /** Plain label shown to the owner in the chat (decision 0001, answer 7). Not stored in sites. */
  label: string
  /** One sentence: what this section is for. Read by the decision model and by coding agents. */
  purpose: string
  fields: Partial<Record<FieldName, FieldLimits>>
  /** Groups of fields of which at most one may be filled. */
  exclusive?: readonly (readonly FieldName[])[]
  /** Groups of fields of which at least one must be filled. */
  atLeastOne?: readonly (readonly FieldName[])[]
}

const H = { max: 70 } as const // a section headline
const SUB = { max: 220 } as const
const EYEBROW = { max: 32 } as const
const CTA = {} as const

export const SECTION_TYPES = {
  header: {
    label: 'Menu bar',
    purpose: 'The logo, the main menu and one button, at the top of every page.',
    fields: {
      nav: { required: true, max: 6, maxChildren: 8, parts: { label: 24 } },
      primaryCta: CTA,
      facts: { allow: ['phone', 'email', 'address', 'social'] },
    },
  },
  footer: {
    label: 'Footer',
    purpose: 'Link columns, contact details, hours, a newsletter sign-up and the legal line.',
    fields: {
      nav: { max: 6, maxChildren: 10, parts: { label: 32 } },
      body: { max: 240 },
      facts: {
        allow: ['hours', 'address', 'map', 'phone', 'email', 'social', 'locations', 'licence'],
      },
      form: { forms: ['newsletter'] },
      note: { max: 200 },
    },
  },
  announcement: {
    label: 'Notice bar',
    purpose: 'One short line across the top of the page, such as an offer or a holiday closure.',
    fields: { headline: { required: true, max: 90 }, primaryCta: CTA },
  },
  hero: {
    label: 'Top banner',
    purpose:
      'The opening of a page: the main promise, one or two buttons, and an image or a few images.',
    fields: {
      headline: { required: true, min: 2, max: 70 },
      eyebrow: EYEBROW,
      subhead: { max: 180 },
      primaryCta: CTA,
      secondaryCta: CTA,
      media: {},
      gallery: { min: 2, max: 3 },
      proof: {},
    },
    exclusive: [['media', 'gallery']],
  },
  'page-title': {
    label: 'Page title',
    purpose: 'A plain title banner at the top of an inner page.',
    fields: {
      headline: { required: true, max: 70 },
      eyebrow: EYEBROW,
      subhead: { max: 200 },
      media: {},
    },
  },
  'text-media': {
    label: 'Text and image',
    purpose: 'A story, an introduction or an explanation, with an optional image.',
    fields: {
      body: { required: true, max: 1500 },
      eyebrow: EYEBROW,
      headline: H,
      media: {},
      gallery: { min: 2, max: 4 },
      primaryCta: CTA,
      secondaryCta: CTA,
    },
    exclusive: [['media', 'gallery']],
  },
  cards: {
    label: 'Cards',
    purpose:
      'A set of short items: services, reasons to choose the business, steps, values or policies.',
    fields: {
      items: {
        required: true,
        min: 2,
        max: 30,
        parts: { title: 60, body: 320, eyebrow: 32, label: 24 },
      },
      eyebrow: EYEBROW,
      headline: H,
      subhead: SUB,
      primaryCta: CTA,
      note: { max: 240 },
    },
  },
  cta: {
    label: 'Action band',
    purpose:
      'A short band that asks the visitor to do one thing: book, call, get a quote or sign up.',
    fields: {
      headline: { required: true, max: 70 },
      subhead: { max: 200 },
      primaryCta: CTA,
      secondaryCta: CTA,
      media: {},
      form: { forms: ['newsletter'] },
    },
  },
  gallery: {
    label: 'Photos',
    purpose: 'A set of photos: the place, the work, the food, past projects.',
    fields: {
      gallery: { required: true, min: 1, max: 24, parts: { caption: 120 } },
      headline: H,
      subhead: SUB,
      primaryCta: CTA,
    },
  },
  logos: {
    label: 'Logos',
    purpose: 'Logos of partners, press, insurers or accreditations.',
    fields: { logos: { required: true, min: 2, max: 16 }, headline: { max: 60 } },
  },
  stats: {
    label: 'Numbers',
    purpose: 'Two to four numbers with labels, such as years in business or clients served.',
    fields: {
      stats: { required: true, min: 2, max: 4, parts: { value: 12, label: 40 } },
      headline: { max: 60 },
    },
  },
  faq: {
    label: 'Questions',
    purpose: 'Questions and answers.',
    fields: {
      items: { required: true, min: 1, max: 30, parts: { title: 140, body: 900 } },
      headline: H,
      subhead: SUB,
    },
  },
  testimonials: {
    label: 'Reviews',
    purpose: 'Quotes from customers, linked to where they were written.',
    fields: { source: { required: true, kinds: ['testimonial'] }, headline: H, primaryCta: CTA },
  },
  'price-list': {
    label: 'Prices',
    purpose:
      'A menu, price list or fee guide, grouped under headings, with optional price columns.',
    fields: {
      source: { required: true, kinds: ['menu-item', 'service'] },
      headline: H,
      subhead: SUB,
      note: { max: 300 },
      primaryCta: CTA,
    },
  },
  'pricing-plans': {
    label: 'Plans',
    purpose: 'Memberships, class packs or service tiers, side by side.',
    fields: {
      source: { required: true, kinds: ['plan'] },
      headline: H,
      subhead: SUB,
      note: { max: 300 },
    },
  },
  team: {
    label: 'Team',
    purpose: 'The people: staff, practitioners, coaches.',
    fields: {
      source: { required: true, kinds: ['team-member'] },
      headline: H,
      subhead: SUB,
      primaryCta: CTA,
    },
  },
  'hours-location': {
    label: 'Hours and location',
    purpose: 'Opening hours, address, map and how to get there, for one or several locations.',
    fields: {
      facts: { required: true, allow: ['hours', 'address', 'map', 'phone', 'email', 'locations'] },
      headline: H,
      body: { max: 600 },
      primaryCta: CTA,
    },
  },
  contact: {
    label: 'Contact',
    purpose: 'Contact details and a form.',
    fields: {
      headline: H,
      body: { max: 600 },
      facts: { allow: ['phone', 'email', 'address', 'map', 'hours', 'social', 'locations'] },
      form: { forms: ['contact', 'quote', 'booking-request', 'callback'] },
      media: {},
    },
    atLeastOne: [['facts', 'form']],
  },
  'service-areas': {
    label: 'Areas served',
    purpose: 'The towns or neighbourhoods the business covers, optionally grouped by region.',
    fields: {
      facts: { required: true, allow: ['serviceAreas'] },
      headline: H,
      body: { max: 800 },
      primaryCta: CTA,
    },
  },
  schedule: {
    label: 'Timetable',
    purpose: 'A weekly class timetable, drawn as a real table.',
    fields: {
      source: { required: true, kinds: ['class-session'] },
      headline: H,
      subhead: SUB,
      note: { max: 300 },
      primaryCta: CTA,
    },
  },
  posts: {
    label: 'News',
    purpose: 'The latest news or blog posts.',
    fields: { source: { required: true, kinds: ['post'] }, headline: H, primaryCta: CTA },
  },
} as const satisfies Record<string, SectionDef>

/** Reserved for later milestones. No block may implement these yet. */
export const RESERVED_SECTION_TYPES = ['embed', 'products'] as const

export type SectionTypeName = keyof typeof SECTION_TYPES
export const SECTION_TYPE_NAMES = Object.keys(SECTION_TYPES) as SectionTypeName[]

type Def<S extends SectionTypeName> = (typeof SECTION_TYPES)[S]['fields']
type RequiredKeys<S extends SectionTypeName> = {
  [K in keyof Def<S>]: Def<S>[K] extends { required: true } ? K : never
}[keyof Def<S>]

/** The content of one section of type S. Every block of that type receives exactly this. */
export type ContentOf<S extends SectionTypeName> = {
  [K in RequiredKeys<S> & FieldName]: FieldValues[K]
} & {
  [K in Exclude<keyof Def<S>, RequiredKeys<S>> & FieldName]?: FieldValues[K]
}

export type FieldsOf<S extends SectionTypeName> = keyof Def<S> & FieldName

export const sectionDef = (s: SectionTypeName): SectionDef => SECTION_TYPES[s]

const schemaCache = new Map<SectionTypeName, z.ZodType>()

/** The Zod schema for one section type's content. Built on first use, then cached (Workers start-up). */
export function contentSchema<S extends SectionTypeName>(s: S): z.ZodType<ContentOf<S>> {
  const cached = schemaCache.get(s)
  if (cached) return cached as z.ZodType<ContentOf<S>>
  const def = sectionDef(s)
  const shape: Record<string, z.ZodType> = {}
  for (const [name, limits] of Object.entries(def.fields) as [FieldName, FieldLimits][]) {
    const schema = FIELDS[name].schema(limits)
    shape[name] = limits.required ? schema : schema.optional()
  }
  let schema: z.ZodType = z.strictObject(shape)
  for (const group of def.exclusive ?? []) {
    schema = schema.refine(
      (c) => group.filter((f) => (c as Record<string, unknown>)[f] !== undefined).length <= 1,
      {
        message: `Only one of ${group.join(', ')} may be filled`,
      },
    )
  }
  for (const group of def.atLeastOne ?? []) {
    schema = schema.refine(
      (c) => group.some((f) => (c as Record<string, unknown>)[f] !== undefined),
      {
        message: `At least one of ${group.join(', ')} must be filled`,
      },
    )
  }
  schemaCache.set(s, schema)
  return schema as z.ZodType<ContentOf<S>>
}
