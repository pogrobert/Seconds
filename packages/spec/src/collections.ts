import { z } from 'zod'
import { CollectionId, ItemId, LocationId } from './ids.ts'
import { type Cta, ImageRef, LinkTarget, Price, SinglePrice } from './values.ts'

// Collections hold repeated entities. Sections show them through the `source` field.
// Prices, durations and names are facts: the text model never writes them.

const CtaSchema = z.strictObject({
  label: z.string().min(1).max(32),
  to: LinkTarget,
}) satisfies z.ZodType<Cta>

export const Offering = z.strictObject({
  id: ItemId,
  name: z.string().min(1).max(80),
  description: z.string().max(400).optional(),
  price: Price.optional(),
  /** Minutes, for services. */
  duration: z.int().min(1).max(1440).optional(),
  tags: z.array(z.string().min(1).max(24)).max(6).optional(),
  image: ImageRef.optional(),
  group: z.string().max(60).optional(),
})

export const TeamMember = z.strictObject({
  id: ItemId,
  name: z.string().min(1).max(60),
  role: z.string().max(60).optional(),
  /** Matches a column id of a price collection, for example "senior". */
  level: z
    .string()
    .regex(/^[a-z0-9-]{1,24}$/)
    .optional(),
  credentials: z.string().max(120).optional(),
  bio: z.string().max(1200).optional(),
  photo: ImageRef.optional(),
  links: z.array(LinkTarget).max(4).optional(),
  location: LocationId.optional(),
})

export const Testimonial = z.strictObject({
  id: ItemId,
  quote: z.string().min(1).max(600),
  name: z.string().min(1).max(60),
  detail: z.string().max(60).optional(),
  rating: z.int().min(1).max(5).optional(),
  /** Where the review lives, if it came from an outside site. Google review text is never stored. */
  source: z.url({ protocol: /^https?$/ }).optional(),
})

export const Plan = z.strictObject({
  id: ItemId,
  name: z.string().min(1).max(60),
  price: SinglePrice,
  summary: z.string().max(160).optional(),
  includes: z.array(z.string().min(1).max(80)).max(10).optional(),
  highlight: z.boolean().optional(),
  cta: CtaSchema.optional(),
})

export const ClassSession = z.strictObject({
  id: ItemId,
  name: z.string().min(1).max(60),
  day: z.int().min(1).max(7),
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  level: z.string().max(40).optional(),
  teacher: z.string().max(60).optional(),
  location: LocationId.optional(),
})

export const Post = z.strictObject({
  id: ItemId,
  title: z.string().min(1).max(100),
  date: z.iso.date(),
  summary: z.string().max(240).optional(),
  image: ImageRef.optional(),
  to: LinkTarget.optional(),
})

export const COLLECTION_KINDS = [
  'menu-item',
  'service',
  'team-member',
  'testimonial',
  'plan',
  'class-session',
  'post',
] as const
export type CollectionKind = (typeof COLLECTION_KINDS)[number]

export const ItemSchemas = {
  'menu-item': Offering,
  service: Offering,
  'team-member': TeamMember,
  testimonial: Testimonial,
  plan: Plan,
  'class-session': ClassSession,
  post: Post,
} as const satisfies Record<CollectionKind, z.ZodType>

export type ItemOf<K extends CollectionKind> = z.infer<(typeof ItemSchemas)[K]>

/** Named price columns, for example Stylist / Senior / Director. Up to 4 (decision 0001, answer 2). */
export const PriceColumns = z
  .array(
    z.strictObject({ id: z.string().regex(/^[a-z0-9-]{1,24}$/), label: z.string().min(1).max(24) }),
  )
  .min(2)
  .max(4)

const collectionOf = <K extends CollectionKind>(kind: K) =>
  z.strictObject({
    id: CollectionId,
    kind: z.literal(kind),
    name: z.string().min(1).max(60),
    columns: PriceColumns.optional(),
    /** A price shared by every item in a group: { "Reformer": … }. */
    groupPrices: z.record(z.string().max(60), Price).optional(),
    items: z.array(ItemSchemas[kind]).max(500),
  })

export const Collection = z.discriminatedUnion('kind', [
  collectionOf('menu-item'),
  collectionOf('service'),
  collectionOf('team-member'),
  collectionOf('testimonial'),
  collectionOf('plan'),
  collectionOf('class-session'),
  collectionOf('post'),
])

export type CollectionValue = {
  [K in CollectionKind]: {
    id: CollectionId
    kind: K
    name: string
    columns?: { id: string; label: string }[]
    groupPrices?: Record<string, Price>
    items: ItemOf<K>[]
  }
}[CollectionKind]
