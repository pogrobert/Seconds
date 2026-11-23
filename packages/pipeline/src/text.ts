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

/** HTML entities a model sometimes writes into plain text ("York B&amp;B", 2026-11-24). */
const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'",
  nbsp: ' ',
}

/**
 * Plain characters in place of typographic ones some fonts lack: the non-breaking hyphen (U+2011)
 * and the narrow and thin spaces that some models emit. HTML entities become the characters they
 * stand for: the page escapes text itself, so "&amp;" would show as it is.
 */
export function tidy<T>(value: T): T {
  if (typeof value === 'string')
    return value
      .replace(/\u2011/g, '-')
      .replace(/[\u202f\u2009]/g, ' ')
      .replace(/&(amp|lt|gt|quot|apos|#39|nbsp);/g, (_, e: string) => ENTITIES[e] ?? _) as T
  if (Array.isArray(value)) return value.map(tidy) as T
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, tidy(v)])) as T
  return value
}
