// The words a sample business's page shows (tools/eval/businesses.ts, the fallback when no words
// could be written), and the tidying every model's words get before they reach a page.

/** The words of one page. */
export type Copy = {
  /** The business's name, written only when the brief has none on record (askName). */
  name?: string
  tagline: string
  headline: string
  subhead: string
  about: string
  /** How to find the place: shown beside the hours. */
  visit: string
  reasons: { title: string; body: string }[]
  steps?: { title: string; body: string }[]
  cta: { headline: string; subhead: string; label: string }
}

/**
 * Plain characters in place of typographic ones some fonts lack: the non-breaking hyphen (U+2011)
 * and the narrow and thin spaces that some models emit.
 */
export function tidy<T>(value: T): T {
  if (typeof value === 'string')
    return value.replace(/\u2011/g, '-').replace(/[\u202f\u2009]/g, ' ') as T
  if (Array.isArray(value)) return value.map(tidy) as T
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, tidy(v)])) as T
  return value
}
