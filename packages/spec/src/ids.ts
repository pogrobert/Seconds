import { z } from 'zod'

// Ids are random, prefixed and lowercase, made by code and never by a model.
// They are safe in paths, URLs, CSS selectors and HTML attributes without escaping.
// Template-literal types instead of Zod brands: brands make Record indexing awkward (report 01, §3).

const idOf = <P extends string>(prefix: P) =>
  z.string().regex(new RegExp(`^${prefix}_[a-z0-9]{10}$`)) as unknown as z.ZodType<`${P}_${string}`>

export const BlockId = idOf('b')
export const PageId = idOf('p')
export const ItemId = idOf('i')
export const AssetId = idOf('a')
export const CollectionId = idOf('c')
export const FormId = idOf('f')
export const LocationId = idOf('l')

export type BlockId = z.infer<typeof BlockId>
export type PageId = z.infer<typeof PageId>
export type ItemId = z.infer<typeof ItemId>
export type AssetId = z.infer<typeof AssetId>
export type CollectionId = z.infer<typeof CollectionId>
export type FormId = z.infer<typeof FormId>
export type LocationId = z.infer<typeof LocationId>
