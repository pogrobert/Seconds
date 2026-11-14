import { z } from 'zod'
import type { CollectionKind } from './collections.ts'
import { CollectionId, FormId, ItemId } from './ids.ts'
import {
  type Cta,
  ImageRef,
  LinkTarget,
  Paragraph,
  type RichText,
  richTextLength,
} from './values.ts'

// The one global list of content fields (docs/decisions/0001-section-types.md).
// Each field has one value shape. A section type picks fields and sets their limits.
// A block can never add a field. Changing or removing a field needs a spec migration.

/** Who may write a field's value. The text model only ever writes `text-model` fields. */
export type Writer = 'text-model' | 'owner' | 'code'

export const FACT_KEYS = [
  'hours',
  'address',
  'map',
  'phone',
  'email',
  'social',
  'locations',
  'serviceAreas',
  'licence',
] as const
export type FactKey = (typeof FACT_KEYS)[number]

export const FORM_KINDS = ['contact', 'quote', 'booking-request', 'callback', 'newsletter'] as const
export type FormKind = (typeof FORM_KINDS)[number]

export type GalleryItem = { id: `i_${string}`; image: ImageRef; caption?: string }
export type Item = {
  id: `i_${string}`
  title: string
  body?: RichText
  eyebrow?: string
  icon?: string
  media?: ImageRef
  link?: Cta
  group?: string
}
export type Logo = { id: `i_${string}`; image: ImageRef; name: string; link?: LinkTarget }
export type Stat = { id: `i_${string}`; value: string; label: string }
export type Proof = { text: string; link?: LinkTarget }
export type NavLink = { id: `i_${string}`; label: string; to: LinkTarget }
export type NavItem = NavLink & { children?: NavLink[] }
export type CollectionSource = {
  collection: `c_${string}`
  pick?: `i_${string}`[]
  groupBy?: 'group'
  limit?: number
}
export type FormRef = { form: `f_${string}`; kind: FormKind }

/** The value type of every field. */
export type FieldValues = {
  eyebrow: string
  headline: string
  subhead: string
  body: RichText
  note: string
  primaryCta: Cta
  secondaryCta: Cta
  media: ImageRef
  gallery: GalleryItem[]
  items: Item[]
  logos: Logo[]
  stats: Stat[]
  proof: Proof
  nav: NavItem[]
  source: CollectionSource
  facts: FactKey[]
  form: FormRef
}
export type FieldName = keyof FieldValues

/** Limits a section type sets on a field. Which keys apply depends on the field's kind. */
export type FieldLimits = {
  required?: boolean
  /** Characters, for text and rich text. For lists, the bounds on the number of items. */
  min?: number
  max?: number
  /** Per-part caps for list items, in characters. */
  parts?: Partial<Record<'title' | 'body' | 'eyebrow' | 'caption' | 'label' | 'value', number>>
  /** For nav: children per top-level item. */
  maxChildren?: number
  /** For source: which collection kinds may feed it. */
  kinds?: readonly CollectionKind[]
  /** For facts: which facts may be shown. */
  allow?: readonly FactKey[]
  /** For form: which form kinds may be shown. */
  forms?: readonly FormKind[]
}

type FieldDef = {
  kind:
    | 'text'
    | 'richText'
    | 'cta'
    | 'image'
    | 'gallery'
    | 'items'
    | 'logos'
    | 'stats'
    | 'proof'
    | 'nav'
    | 'source'
    | 'facts'
    | 'form'
  label: string
  writer: Writer
  /** Which limit keys a section type must set for this field. */
  needs: readonly (keyof FieldLimits)[]
  schema: (l: FieldLimits) => z.ZodType
}

const text = (l: FieldLimits) =>
  z
    .string()
    .min(l.min ?? 1)
    .max(l.max ?? 0)
const cap = (l: FieldLimits, part: keyof NonNullable<FieldLimits['parts']>, fallback: number) =>
  l.parts?.[part] ?? fallback
const list = <T extends z.ZodType>(item: T, l: FieldLimits) =>
  z
    .array(item)
    .min(l.min ?? 0)
    .max(l.max ?? 0)
const cta = (l: FieldLimits) =>
  z.strictObject({
    label: z
      .string()
      .min(1)
      .max(cap(l, 'label', 24)),
    to: LinkTarget,
  })
const richText = (l: FieldLimits) =>
  z
    .array(Paragraph)
    .min(1)
    .refine((r) => richTextLength(r) <= (l.max ?? 0), {
      message: `longer than ${l.max} characters`,
    })
const navLink = (l: FieldLimits) =>
  z.strictObject({
    id: ItemId,
    label: z
      .string()
      .min(1)
      .max(cap(l, 'label', 24)),
    to: LinkTarget,
  })

export const FIELDS: Record<FieldName, FieldDef> = {
  eyebrow: { kind: 'text', label: 'Eyebrow', writer: 'text-model', needs: ['max'], schema: text },
  headline: { kind: 'text', label: 'Headline', writer: 'text-model', needs: ['max'], schema: text },
  subhead: {
    kind: 'text',
    label: 'Subheading',
    writer: 'text-model',
    needs: ['max'],
    schema: text,
  },
  body: { kind: 'richText', label: 'Text', writer: 'text-model', needs: ['max'], schema: richText },
  note: { kind: 'text', label: 'Small print', writer: 'text-model', needs: ['max'], schema: text },
  primaryCta: { kind: 'cta', label: 'Main button', writer: 'text-model', needs: [], schema: cta },
  secondaryCta: {
    kind: 'cta',
    label: 'Second button',
    writer: 'text-model',
    needs: [],
    schema: cta,
  },
  media: { kind: 'image', label: 'Image', writer: 'code', needs: [], schema: () => ImageRef },
  gallery: {
    kind: 'gallery',
    label: 'Images',
    writer: 'code',
    needs: ['min', 'max'],
    schema: (l) =>
      list(
        z.strictObject({
          id: ItemId,
          image: ImageRef,
          caption: z
            .string()
            .max(cap(l, 'caption', 120))
            .optional(),
        }),
        l,
      ),
  },
  items: {
    kind: 'items',
    label: 'Items',
    writer: 'text-model',
    needs: ['min', 'max', 'parts'],
    schema: (l) =>
      list(
        z.strictObject({
          id: ItemId,
          title: z
            .string()
            .min(1)
            .max(cap(l, 'title', 60)),
          body: richText({ max: cap(l, 'body', 300) }).optional(),
          eyebrow: z
            .string()
            .max(cap(l, 'eyebrow', 32))
            .optional(),
          icon: z
            .string()
            .regex(/^[a-z][a-z0-9-]{0,40}$/)
            .optional(),
          media: ImageRef.optional(),
          link: cta(l).optional(),
          group: z.string().max(60).optional(),
        }),
        l,
      ),
  },
  logos: {
    kind: 'logos',
    label: 'Logos',
    writer: 'owner',
    needs: ['min', 'max'],
    schema: (l) =>
      list(
        z.strictObject({
          id: ItemId,
          image: ImageRef,
          name: z.string().min(1).max(60),
          link: LinkTarget.optional(),
        }),
        l,
      ),
  },
  stats: {
    kind: 'stats',
    label: 'Numbers',
    writer: 'owner',
    needs: ['min', 'max'],
    schema: (l) =>
      list(
        z.strictObject({
          id: ItemId,
          value: z
            .string()
            .min(1)
            .max(cap(l, 'value', 12)),
          label: z
            .string()
            .min(1)
            .max(cap(l, 'label', 40)),
        }),
        l,
      ),
  },
  proof: {
    kind: 'proof',
    label: 'Proof line',
    writer: 'owner',
    needs: [],
    schema: () => z.strictObject({ text: z.string().min(1).max(60), link: LinkTarget.optional() }),
  },
  nav: {
    kind: 'nav',
    label: 'Menu',
    writer: 'code',
    needs: ['max', 'maxChildren'],
    schema: (l) =>
      list(
        navLink(l).extend({
          children: z
            .array(navLink(l))
            .max(l.maxChildren ?? 0)
            .optional(),
        }),
        { ...l, min: l.min ?? 0 },
      ),
  },
  source: {
    kind: 'source',
    label: 'Items from a list',
    writer: 'code',
    needs: ['kinds'],
    schema: () =>
      z.strictObject({
        collection: CollectionId,
        pick: z.array(ItemId).max(100).optional(),
        groupBy: z.literal('group').optional(),
        limit: z.int().min(1).max(100).optional(),
      }),
  },
  facts: {
    kind: 'facts',
    label: 'Business details',
    writer: 'code',
    needs: ['allow'],
    schema: (l) => z.array(z.enum(l.allow as [FactKey, ...FactKey[]])).min(1),
  },
  form: {
    kind: 'form',
    label: 'Form',
    writer: 'code',
    needs: ['forms'],
    schema: (l) =>
      z.strictObject({ form: FormId, kind: z.enum(l.forms as [FormKind, ...FormKind[]]) }),
  },
}

export const FIELD_NAMES = Object.keys(FIELDS) as FieldName[]
