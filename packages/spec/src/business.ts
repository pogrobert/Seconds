import { z } from 'zod'
import { AssetId, ItemId, LocationId } from './ids.ts'

// The business record: hard facts. Never written by the text model (architecture README, Pipeline).
// Detailed field ownership belongs to the business-schema work (report 06); this is the part sections need.
// Status of each fact (suggested, confirmed, owner entered) lives in the spec's provenance map, not here.

/** ISO weekday: 1 = Monday … 7 = Sunday (review 07, S1). */
export const Weekday = z.int().min(1).max(7)
export const HHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)

/** Several ranges per day are allowed (lunch and dinner). */
export const OpeningHours = z
  .array(z.strictObject({ day: Weekday, opens: HHMM, closes: HHMM }))
  .max(28)
export const SpecialHours = z
  .array(
    z.strictObject({
      date: z.iso.date(),
      closed: z.boolean(),
      opens: HHMM.optional(),
      closes: HHMM.optional(),
      note: z.string().max(80).optional(),
    }),
  )
  .max(60)

export const Address = z.strictObject({
  lines: z.array(z.string().min(1).max(80)).min(1).max(3),
  locality: z.string().min(1).max(60),
  region: z.string().max(60).optional(),
  postalCode: z.string().max(16).optional(),
  country: z.string().regex(/^[A-Z]{2}$/),
})

/** E.164, for example +442071234567. */
export const Phone = z.string().regex(/^\+[1-9]\d{6,14}$/)

export const Location = z.strictObject({
  id: LocationId,
  name: z.string().min(1).max(60),
  address: Address.optional(),
  geo: z
    .strictObject({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
    .optional(),
  phone: Phone.optional(),
  email: z.email().optional(),
  hours: OpeningHours.optional(),
  specialHours: SpecialHours.optional(),
  bookingUrl: z.url({ protocol: /^https?$/ }).optional(),
  note: z.string().max(160).optional(), // "Free parking behind the shop"
})

export const Business = z.strictObject({
  name: z.string().min(1).max(80),
  logo: AssetId.optional(),
  timeZone: z.string().max(40).optional(), // IANA, for example Europe/London
  phone: Phone.optional(),
  email: z.email().optional(),
  bookingUrl: z.url({ protocol: /^https?$/ }).optional(),
  /** One or more places. A business with one shop has one location. */
  locations: z.array(Location).max(20),
  serviceAreas: z
    .array(
      z.strictObject({
        id: ItemId,
        name: z.string().min(1).max(60),
        group: z.string().max(40).optional(),
      }),
    )
    .max(200)
    .optional(),
  social: z
    .array(
      z.strictObject({
        network: z.enum([
          'instagram',
          'facebook',
          'tiktok',
          'youtube',
          'x',
          'linkedin',
          'pinterest',
          'google',
          'yelp',
          'tripadvisor',
          'other',
        ]),
        url: z.url({ protocol: /^https?$/ }),
      }),
    )
    .max(12)
    .optional(),
  /** Licence or registration numbers, shown as facts: "Gas Safe 123456", "GDC 98765". */
  licences: z
    .array(z.strictObject({ label: z.string().min(1).max(40), number: z.string().min(1).max(40) }))
    .max(8)
    .optional(),
  /** A claim with its source, shown as the hero's proof line. Never written by the text model. */
  proof: z
    .strictObject({
      text: z.string().min(1).max(60),
      source: z.url({ protocol: /^https?$/ }).optional(),
    })
    .optional(),
})
export type Business = z.infer<typeof Business>
export type Location = z.infer<typeof Location>
