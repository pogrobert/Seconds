import { z } from 'zod'
import { AssetId, BlockId, CollectionId, ItemId, PageId } from './ids.ts'

// Value shapes shared by every field. One shape each, forever (docs/decisions/0001-section-types.md).

/** Where a button or link goes. Pages and items by id, never by URL, so renames never break links. */
export const LinkTarget = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('page'), page: PageId, anchor: BlockId.optional() }),
  z.strictObject({ type: z.literal('item'), collection: CollectionId, item: ItemId }),
  z.strictObject({ type: z.literal('url'), url: z.url({ protocol: /^https?$/ }) }),
  // Contact links are bound to the business record at render, never typed into content.
  z.strictObject({
    type: z.literal('contact'),
    channel: z.enum(['phone', 'email', 'whatsapp', 'directions', 'booking']),
  }),
  z.strictObject({ type: z.literal('asset'), asset: AssetId }), // for example a PDF menu
])
export type LinkTarget = z.infer<typeof LinkTarget>

export type Cta = { label: string; to: LinkTarget }

/** Constrained rich text: paragraphs and list items made of spans. No headings, no markup. */
export const Span = z.strictObject({
  text: z.string().min(1),
  marks: z
    .array(z.enum(['strong', 'em']))
    .max(2)
    .optional(),
  link: LinkTarget.optional(),
})
export const Paragraph = z.strictObject({
  style: z.enum(['p', 'bullet', 'number', 'quote']),
  spans: z.array(Span).min(1),
})
export type Span = z.infer<typeof Span>
export type Paragraph = z.infer<typeof Paragraph>
export type RichText = Paragraph[]

/** Plain characters in a rich text value, used for every length limit. */
export const richTextLength = (r: RichText): number =>
  r.reduce((n, p) => n + p.spans.reduce((m, s) => m + s.text.length, 0), 0)

export const Focal = z.strictObject({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) })

/** An image as used in one place. The asset table holds the file; alt can be overridden here. */
export const ImageRef = z.strictObject({
  asset: AssetId,
  alt: z.string().max(250),
  focal: Focal.optional(),
})
export type ImageRef = z.infer<typeof ImageRef>

/** Money in minor units (pence, cents) with an ISO 4217 currency. Never floats. */
export const Money = z.strictObject({
  amount: z.int().min(0),
  currency: z.string().regex(/^[A-Z]{3}$/),
})
export type Money = z.infer<typeof Money>

/** One price. Shapes from report 06, as the review fixed them (07, S1). */
export const SinglePrice = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('fixed'), money: Money }),
  z.strictObject({ type: z.literal('from'), money: Money }),
  z.strictObject({ type: z.literal('range'), min: Money, max: Money }),
  z.strictObject({
    type: z.literal('per'),
    money: Money,
    unit: z.enum(['hour', 'session', 'class', 'week', 'month', 'year', 'person', 'item']),
  }),
  z.strictObject({ type: z.literal('on-request') }),
])
export type SinglePrice = z.infer<typeof SinglePrice>

/**
 * A price as stored on an item: one price, named options (short / medium / long, standard / student),
 * or one price per column of the collection (Stylist / Senior / Director). Decision 0001, answer 2.
 */
export const Price = z.union([
  SinglePrice,
  z.strictObject({
    type: z.literal('options'),
    options: z
      .array(z.strictObject({ label: z.string().min(1).max(32), price: SinglePrice }))
      .min(2)
      .max(6),
  }),
  z.strictObject({
    type: z.literal('columns'),
    byColumn: z.record(z.string().regex(/^[a-z0-9-]{1,24}$/), SinglePrice),
  }),
])
export type Price = z.infer<typeof Price>
