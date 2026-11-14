import {
  FIELDS,
  type FieldLimits,
  type FieldName,
  type FieldsOf,
  RESERVED_SECTION_TYPES,
  type RichText,
  richTextLength,
  SECTION_TYPES,
  type SectionTypeName,
} from '@repo/spec'

// The block contract (CLAUDE.md, Rules). Pure data and pure functions: the pipeline imports this,
// never the React components.
//
// A block implements one section type. Its content is that section type's content, nothing more.
// Each variant says which of those fields it shows, which must be filled, how long text may be
// (never longer than the section type allows), and what it is like (its layout signature).
// The decision model is asked about the signature; code picks the variant (review 07, S7).

/** What a variant is like. Closed lists: the decision model answers questions over these. */
export const SIGNATURE = {
  media: ['none', 'image', 'gallery'],
  align: ['start', 'center'],
  density: ['airy', 'regular', 'compact'],
  emphasis: ['type', 'image', 'balanced'],
  arrangement: [
    'stack',
    'split',
    'overlay',
    'grid',
    'list',
    'rows',
    'steps',
    'table',
    'columns',
    'bar',
  ],
} as const
export type Signature = { [K in keyof typeof SIGNATURE]: (typeof SIGNATURE)[K][number] }

/** Named behaviours a block may use. None exist yet; each will be a tiny script or native HTML. */
export const BEHAVIORS = ['disclosure', 'nav-menu', 'dialog'] as const
export type Behavior = (typeof BEHAVIORS)[number]

/** The surfaces a section can sit on. A theme gives each its own colours. */
export const SURFACES = ['base', 'muted', 'brand', 'inverse'] as const
export type Surface = (typeof SURFACES)[number]

/** Licences we may take block code from (CLAUDE.md, Licences). */
export const LICENSES = ['MIT', 'Apache-2.0', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause'] as const

/** A tighter cap for one field in one variant: characters for text, or per-part caps for list items. */
export type Cap = number | { max?: number; parts?: NonNullable<FieldLimits['parts']> }

export type VariantDef<S extends SectionTypeName> = {
  label: string
  /** At most 40 words: a concrete situation where this variant is the right choice. */
  describe: string
  /** Fields this variant shows. Must include every field the section type requires. */
  uses: readonly FieldsOf<S>[]
  /** Fields that must be filled for this variant to be chosen at all (for example an image). */
  requires?: readonly FieldsOf<S>[]
  /** Tighter limits than the section type's, proved in a real browser before release. */
  caps?: Partial<Record<FieldsOf<S>, Cap>>
  signature: Signature
}

export type BlockManifest<S extends SectionTypeName = SectionTypeName> = {
  /** "<section type>/<name>", stable forever: "hero/standard". */
  type: `${S}/${string}`
  version: `${number}.${number}.${number}`
  sectionType: S
  /** Variant names are stored in saved sites and are never renamed. */
  variants: Record<string, VariantDef<S>>
  behaviors: readonly Behavior[]
  license: { spdx: (typeof LICENSES)[number]; source: string; notice?: string }
}

export const defineBlock = <S extends SectionTypeName>(m: BlockManifest<S>): BlockManifest<S> => m

const sectionFields = (s: SectionTypeName) =>
  SECTION_TYPES[s].fields as Partial<Record<FieldName, FieldLimits>>

const textLength = (field: FieldName, v: unknown): number | undefined => {
  const kind = FIELDS[field].kind
  if (kind === 'text') return (v as string).length
  if (kind === 'richText') return richTextLength(v as RichText)
  return undefined
}

/**
 * Can this variant show this content? Requires and character caps only: a length comparison,
 * no fonts and no browser (review 07, B2). Used by the pipeline at request time.
 */
export function eligibility<S extends SectionTypeName>(
  m: BlockManifest<S>,
  variant: string,
  content: Record<string, unknown>,
): { ok: boolean; reasons: string[] } {
  const v = m.variants[variant]
  if (!v) return { ok: false, reasons: [`no variant ${variant}`] }
  const reasons: string[] = []
  for (const f of v.requires ?? []) if (content[f] === undefined) reasons.push(`needs ${f}`)
  for (const [f, cap] of Object.entries(v.caps ?? {}) as [FieldName, Cap][]) {
    const value = content[f]
    if (value === undefined) continue
    const max = typeof cap === 'number' ? cap : cap.max
    const len = textLength(f, value)
    if (max !== undefined && len !== undefined && len > max)
      reasons.push(`${f} is ${len} characters, cap ${max}`)
    if (max !== undefined && Array.isArray(value) && len === undefined && value.length > max)
      reasons.push(`${f} has ${value.length} items, cap ${max}`)
    if (typeof cap === 'object' && cap.parts && Array.isArray(value))
      for (const item of value as Record<string, unknown>[])
        for (const [part, pmax] of Object.entries(cap.parts)) {
          const pv = item[part]
          const plen =
            typeof pv === 'string'
              ? pv.length
              : Array.isArray(pv)
                ? richTextLength(pv as RichText)
                : 0
          if (plen > (pmax as number))
            reasons.push(`${f}.${part} is ${plen} characters, cap ${pmax}`)
        }
  }
  return { ok: reasons.length === 0, reasons }
}

/** Every rule a manifest must follow. Returns the problems found; an empty list means it passes. */
export function checkManifest(m: BlockManifest): string[] {
  const p: string[] = []
  const s = m.sectionType
  if (!(s in SECTION_TYPES)) return [`${m.type}: unknown section type ${s}`]
  if ((RESERVED_SECTION_TYPES as readonly string[]).includes(s))
    p.push(`${m.type}: ${s} is reserved for later`)
  if (!new RegExp(`^${s}/[a-z][a-z0-9-]{1,30}$`).test(m.type))
    p.push(`${m.type}: type must be "${s}/<name>"`)
  if (!/^\d+\.\d+\.\d+$/.test(m.version)) p.push(`${m.type}: version must be semver`)
  if (!LICENSES.includes(m.license.spdx))
    p.push(`${m.type}: licence ${m.license.spdx} is not allowed`)
  const fields = sectionFields(s)
  const required = Object.entries(fields)
    .filter(([, l]) => l?.required)
    .map(([f]) => f)
  const names = Object.keys(m.variants)
  if (names.length < 2) p.push(`${m.type}: needs at least 2 variants`)
  for (const [name, v] of Object.entries(m.variants)) {
    const at = `${m.type}#${name}`
    if (!/^[a-z][a-z0-9-]{0,30}$/.test(name)) p.push(`${at}: variant names are lowercase words`)
    if (v.describe.split(/\s+/).length > 40) p.push(`${at}: describe is longer than 40 words`)
    for (const f of v.uses) if (!(f in fields)) p.push(`${at}: uses ${f}, which ${s} does not have`)
    for (const f of required)
      if (!v.uses.includes(f as never)) p.push(`${at}: must show required field ${f}`)
    for (const f of v.requires ?? [])
      if (!v.uses.includes(f)) p.push(`${at}: requires ${f} but does not show it`)
    for (const [k, allowed] of Object.entries(SIGNATURE))
      if (!(allowed as readonly string[]).includes(v.signature[k as keyof Signature]))
        p.push(`${at}: signature.${k} must be one of ${allowed.join(', ')}`)
    const showsMedia = v.uses.some((f) => f === 'media' || f === 'gallery')
    if (
      v.signature.media === 'none' &&
      (v.requires ?? []).some((f) => f === 'media' || f === 'gallery')
    )
      p.push(`${at}: signature says no media but requires an image`)
    if (v.signature.media !== 'none' && !showsMedia)
      p.push(`${at}: signature says media but shows no image`)
    for (const [f, cap] of Object.entries(v.caps ?? {}) as [FieldName, Cap][]) {
      const lim = fields[f]
      if (!lim) {
        p.push(`${at}: caps ${f}, which ${s} does not have`)
        continue
      }
      const max = typeof cap === 'number' ? cap : cap.max
      if (max !== undefined && lim.max !== undefined && max > lim.max)
        p.push(`${at}: cap on ${f} (${max}) is above the section limit (${lim.max})`)
      if (typeof cap === 'object')
        for (const [part, pmax] of Object.entries(cap.parts ?? {}))
          if (
            (lim.parts?.[part as keyof typeof lim.parts] ?? Number.POSITIVE_INFINITY) <
            (pmax as number)
          )
            p.push(`${at}: cap on ${f}.${part} is above the section limit`)
    }
  }
  return p
}

/** Library-wide rules: every section type with blocks has a variant without an image (CLAUDE.md). */
export function checkLibrary(manifests: readonly BlockManifest[]): string[] {
  const p: string[] = []
  const types = new Set<string>()
  for (const m of manifests) {
    if (types.has(m.type)) p.push(`${m.type}: block type is defined twice`)
    types.add(m.type)
  }
  const bySection = new Map<SectionTypeName, BlockManifest[]>()
  for (const m of manifests)
    bySection.set(m.sectionType, [...(bySection.get(m.sectionType) ?? []), m])
  for (const [s, ms] of bySection) {
    const hasMediaField = 'media' in sectionFields(s) || 'gallery' in sectionFields(s)
    const noImage = ms.some((m) =>
      Object.values(m.variants).some((v) => v.signature.media === 'none'),
    )
    if (hasMediaField && !noImage) p.push(`${s}: no variant works without an image`)
  }
  return p
}
