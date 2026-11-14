import { z } from 'zod'
import { Business } from './business.ts'
import { Collection, type CollectionValue } from './collections.ts'
import { FIELDS, type FieldLimits, type FieldName } from './fields.ts'
import { AssetId, BlockId, PageId } from './ids.ts'
import {
  contentSchema,
  RESERVED_SECTION_TYPES,
  SECTION_TYPES,
  type SectionTypeName,
} from './section-types.ts'
import { Focal, type LinkTarget } from './values.ts'

// The site spec, version 1: the plain data file that says which blocks, in what order, with what
// text, colours and fonts. Four parts: structure, style, content, settings (architecture README).
// It holds no CSS, HTML or code. The same spec always renders the same site.

export const ShellId = z.string().regex(/^sh_[a-z0-9]{10}$/) as unknown as z.ZodType<`sh_${string}`>
export type ShellId = z.infer<typeof ShellId>

export const SURFACES = ['base', 'muted', 'brand', 'inverse'] as const
export type SurfaceName = (typeof SURFACES)[number]

/* ------------------------------------------------------------------ structure */

export const BlockInstance = z.strictObject({
  id: BlockId,
  sectionType: z.enum(Object.keys(SECTION_TYPES) as [SectionTypeName, ...SectionTypeName[]]),
  /** "<section type>/<name>": which design draws it. */
  type: z.string().regex(/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/),
  /** The block's major version. Minor and patch versions float. */
  v: z.int().min(1),
  variant: z.string().regex(/^[a-z][a-z0-9-]{0,30}$/),
  /** Layout settings only: small closed choices. Content lives in content.blocks. */
  props: z.strictObject({ surface: z.enum(SURFACES).optional() }),
  hidden: z.boolean().optional(),
})
export type BlockInstance = z.infer<typeof BlockInstance>

export const PAGE_KINDS = [
  'home',
  'about',
  'services',
  'menu',
  'contact',
  'gallery',
  'team',
  'custom',
] as const

export const Page = z.strictObject({
  id: PageId,
  kind: z.enum(PAGE_KINDS),
  path: z.string().regex(/^\/([a-z0-9-]+(\/[a-z0-9-]+)*)?$/),
  shell: ShellId,
  body: z.array(BlockId),
  hidden: z.boolean().optional(),
})
export type Page = z.infer<typeof Page>

/** Shared parts around pages: header and notice bar before, footer after. */
export const Shell = z.strictObject({
  id: ShellId,
  before: z.array(BlockId),
  after: z.array(BlockId),
})

export const Structure = z.strictObject({
  pages: z.record(PageId, Page),
  shells: z.record(ShellId, Shell),
  blocks: z.record(BlockId, BlockInstance),
})

/* ------------------------------------------------------------------ style */

/**
 * Style is a set of choices, never CSS. A family is named and versioned ("quiet@1"); its axes are
 * closed lists that the family's registry defines and validates (review 07, S3). Hero layout and
 * grid are layout, chosen by variant, not style.
 */
export const Style = z.strictObject({
  family: z.string().regex(/^[a-z][a-z0-9-]*@\d+$/),
  axes: z.record(z.string().regex(/^[a-z][a-zA-Z]*$/), z.string().regex(/^[a-z0-9][a-z0-9-]*$/)),
  /** The brand colour, as hex. The family derives the palette from it. */
  color: z.string().regex(/^#[0-9a-f]{6}$/),
  mode: z.enum(['light', 'dark']),
})
export type Style = z.infer<typeof Style>

/* ------------------------------------------------------------------ content */

export const Asset = z.strictObject({
  id: AssetId,
  type: z.literal('image'),
  source: z.discriminatedUnion('type', [
    z.strictObject({ type: z.literal('upload'), key: z.string().min(1).max(200) }),
    /**
     * A licensed stock photo, stored by us (Pexels allows storing and resizing; decided 2026-11-14).
     * The credit is kept so the photographer and Pexels can always be named.
     */
    z.strictObject({
      type: z.literal('stock'),
      provider: z.literal('pexels'),
      id: z.string().regex(/^\d{1,12}$/),
      /** The photo's page on the provider's site. */
      page: z.url({ protocol: /^https$/ }),
      photographer: z.string().min(1).max(80),
      photographerUrl: z.url({ protocol: /^https$/ }).optional(),
      /** Where our stored copy lives. */
      key: z.string().min(1).max(200),
    }),
    /** Generated art from Surfaces: the same parameters always draw the same picture. */
    z.strictObject({
      type: z.literal('generated'),
      generator: z.literal('surfaces'),
      style: z.string().min(1).max(40),
      seed: z.string().min(1).max(80),
    }),
  ]),
  width: z.int().positive().optional(),
  height: z.int().positive().optional(),
  alt: z.string().max(250),
  focal: Focal.optional(),
})
export type Asset = z.infer<typeof Asset>

export const PageContent = z.strictObject({
  navLabel: z.string().min(1).max(24),
  title: z.string().max(70).optional(),
  description: z.string().max(170).optional(),
})

/** Where a value came from. Facts that are only suggested block publishing (review 07, S1). */
export const Provenance = z.strictObject({
  by: z.enum(['owner', 'fact', 'generated', 'default', 'import']),
  status: z.enum(['suggested', 'confirmed', 'owner_entered']).optional(),
  source: z.url().optional(),
})

export const Content = z.strictObject({
  business: Business,
  pages: z.record(PageId, PageContent),
  /** Content per block instance, checked against the block's section type. */
  blocks: z.record(BlockId, z.record(z.string(), z.unknown())),
  collections: z.record(z.string(), Collection),
  assets: z.record(AssetId, Asset),
  /** Keyed by address ("blocks/b_x/headline", "business/locations/l_x/hours"). */
  provenance: z.record(z.string(), Provenance).optional(),
})

/* ------------------------------------------------------------------ settings */

export const Settings = z.strictObject({
  locale: z.string().regex(/^[a-z]{2,3}(-[A-Z]{2})?$/),
  dir: z.enum(['ltr', 'rtl']),
  /** The sticky Call / Directions / Book bar on phones (decision 0001, answer 4). */
  mobileActions: z
    .array(z.enum(['call', 'directions', 'book']))
    .min(1)
    .max(3)
    .optional(),
})

/* ------------------------------------------------------------------ the spec */

const reserved = z.never().optional()

export const SiteSpec = z.strictObject({
  specVersion: z.literal(1),
  /** The library release the site was made with (review 07, S4). */
  release: z.string().regex(/^\d{4}\.\d{2}\.\d{2}(\.\d+)?$/),
  structure: Structure,
  style: Style,
  content: Content,
  settings: Settings,
  // Reserved for apps later (06, D3). Must stay absent in version 1.
  capabilities: reserved,
  automations: reserved,
  permissions: reserved,
  integrations: reserved,
  extensions: reserved,
})
export type SiteSpec = z.infer<typeof SiteSpec>

/* ------------------------------------------------------------------ whole-site checks */

const linkTargets = (v: unknown, out: LinkTarget[] = []): LinkTarget[] => {
  if (Array.isArray(v)) for (const x of v) linkTargets(x, out)
  else if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    if (
      typeof o.type === 'string' &&
      ['page', 'item', 'url', 'contact', 'asset'].includes(o.type) &&
      Object.keys(o).length <= 3
    )
      out.push(o as LinkTarget)
    for (const x of Object.values(o)) linkTargets(x, out)
  }
  return out
}
const assetRefs = (v: unknown, out: string[] = []): string[] => {
  if (Array.isArray(v)) for (const x of v) assetRefs(x, out)
  else if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    if (typeof o.asset === 'string') out.push(o.asset)
    for (const x of Object.values(o)) assetRefs(x, out)
  }
  return out
}

/**
 * Validates a whole site: the shape, then the rules that span parts. Returns problems; an empty list
 * means the spec is valid. Runs on every change, so it stays cheap (no browser, no fonts).
 */
export function validateSite(
  input: unknown,
): { ok: true; spec: SiteSpec } | { ok: false; problems: string[] } {
  const parsed = SiteSpec.safeParse(input)
  if (!parsed.success)
    return {
      ok: false,
      problems: parsed.error.issues.slice(0, 20).map((i) => `${i.path.join('/')}: ${i.message}`),
    }
  const spec = parsed.data
  const p: string[] = []
  const { pages, shells, blocks } = spec.structure

  // Every block placed exactly once, and only placed blocks exist.
  const placed = new Map<string, number>()
  for (const page of Object.values(pages))
    for (const b of page.body) placed.set(b, (placed.get(b) ?? 0) + 1)
  for (const shell of Object.values(shells))
    for (const b of [...shell.before, ...shell.after]) placed.set(b, (placed.get(b) ?? 0) + 1)
  for (const [id, n] of placed) {
    if (!blocks[id as keyof typeof blocks]) p.push(`structure: ${id} is placed but does not exist`)
    if (n > 1) p.push(`structure: ${id} is placed ${n} times`)
  }
  for (const id of Object.keys(blocks))
    if (!placed.has(id)) p.push(`structure: ${id} exists but is not placed`)

  // Pages: one home page at "/", unique paths, shells exist, page content exists.
  const homes = Object.values(pages).filter((pg) => pg.kind === 'home')
  if (homes.length !== 1 || homes[0]?.path !== '/')
    p.push('pages: there must be exactly one home page, at "/"')
  const paths = new Set<string>()
  for (const [id, page] of Object.entries(pages)) {
    if (page.id !== id) p.push(`pages/${id}: id does not match its key`)
    if (paths.has(page.path)) p.push(`pages/${id}: path ${page.path} is used twice`)
    paths.add(page.path)
    if (!shells[page.shell]) p.push(`pages/${id}: shell ${page.shell} does not exist`)
    if (!spec.content.pages[page.id]) p.push(`pages/${id}: no page content (navLabel)`)
  }

  // Blocks: known, not reserved, content valid for the section type.
  for (const [id, b] of Object.entries(blocks)) {
    if (b.id !== id) p.push(`blocks/${id}: id does not match its key`)
    if ((RESERVED_SECTION_TYPES as readonly string[]).includes(b.sectionType))
      p.push(`blocks/${id}: ${b.sectionType} is reserved`)
    if (!b.type.startsWith(`${b.sectionType}/`))
      p.push(`blocks/${id}: type ${b.type} is not a ${b.sectionType} block`)
    const content = spec.content.blocks[id as keyof typeof spec.content.blocks]
    if (!content) {
      p.push(`blocks/${id}: no content`)
      continue
    }
    const r = contentSchema(b.sectionType).safeParse(content)
    if (!r.success)
      for (const i of r.error.issues.slice(0, 5))
        p.push(`blocks/${id}/${i.path.join('/')}: ${i.message}`)
    // Collections fed into a section must exist and be of an allowed kind.
    const limits = SECTION_TYPES[b.sectionType].fields as Partial<Record<FieldName, FieldLimits>>
    const source = (content as { source?: { collection: string } }).source
    if (source && limits.source) {
      const col = spec.content.collections[source.collection] as CollectionValue | undefined
      if (!col) p.push(`blocks/${id}/source: collection ${source.collection} does not exist`)
      else if (!limits.source.kinds?.includes(col.kind))
        p.push(`blocks/${id}/source: ${col.kind} cannot feed a ${b.sectionType} section`)
    }
  }

  // Links and images resolve.
  const contentRoot = { blocks: spec.content.blocks, collections: spec.content.collections }
  for (const t of linkTargets(contentRoot)) {
    if (t.type === 'page' && !pages[t.page]) p.push(`links: page ${t.page} does not exist`)
    if (t.type === 'page' && t.anchor && !placed.has(t.anchor))
      p.push(`links: anchor ${t.anchor} does not exist`)
    if (t.type === 'asset' && !spec.content.assets[t.asset])
      p.push(`links: file ${t.asset} does not exist`)
  }
  for (const a of assetRefs(contentRoot))
    if (!spec.content.assets[a as keyof typeof spec.content.assets])
      p.push(`images: ${a} does not exist`)
  if (spec.content.business.logo && !spec.content.assets[spec.content.business.logo])
    p.push('business/logo: image does not exist')

  // Facts a section asks for must exist in the business record.
  for (const [id, b] of Object.entries(blocks)) {
    const facts = (
      spec.content.blocks[id as keyof typeof spec.content.blocks] as
        | { facts?: string[] }
        | undefined
    )?.facts
    if (!facts || !FIELDS.facts) continue
    if (facts.includes('serviceAreas') && !spec.content.business.serviceAreas?.length)
      p.push(`blocks/${id}/facts: shows service areas, but the business has none`)
    if (facts.includes('hours') && !spec.content.business.locations.some((l) => l.hours?.length))
      p.push(`blocks/${id}/facts: shows opening hours, but no location has any`)
    if (b.sectionType === 'hours-location' && spec.content.business.locations.length === 0)
      p.push(`blocks/${id}: hours and location needs at least one location`)
  }

  return p.length ? { ok: false, problems: p } : { ok: true, spec }
}
