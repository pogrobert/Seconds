import type {
  Asset,
  BlockInstance,
  Business,
  CollectionValue,
  NavItem,
  PageId,
  SectionTypeName,
  SiteSpec,
  Style,
  SurfaceName,
} from '@repo/spec'

// Turns a plan (which sections, which blocks and variants, in what order) plus facts and text into a
// site spec. The three M0 arms (decision model, code defaults, random) differ only in the plan they
// pass here, so the comparison is about decisions, not text (docs/technical/README.md, Build order).

export type SectionPlan = {
  sectionType: SectionTypeName
  /** Block type, "<section>/<name>". */
  type: string
  variant: string
  surface?: SurfaceName
  /** Shown in the menu bar when set: "Prices", "Visit". */
  navLabel?: string
}

export type SitePlan = {
  /** Before the page (menu bar), the page's sections, after the page (footer). */
  before: SectionPlan[]
  sections: SectionPlan[]
  after: SectionPlan[]
  style: Omit<Style, 'color'>
}

export type Facts = {
  business: Business
  collections: CollectionValue[]
  assets: Asset[]
  color: string
  locale: string
  dir: 'ltr' | 'rtl'
  mobileActions?: ('call' | 'directions' | 'book')[]
}

/** Section content without nav, which assemble builds from the plan. */
export type ContentFor = (s: SectionPlan, index: number) => Record<string, unknown>

/** Ids made by code. A seeded counter, so the same inputs give the same spec. */
export const idMaker = (seed: string) => {
  let n = 0
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return <P extends string>(prefix: P) => {
    n++
    const body = ((h + n * 2654435761) >>> 0).toString(36).padStart(7, '0').slice(-7)
    return `${prefix}_${body}${String(n).padStart(3, '0').slice(-3)}` as `${P}_${string}`
  }
}

/** One home page: menu bar, sections, footer. Menu links point at sections on the page. */
export function assemble(
  plan: SitePlan,
  facts: Facts,
  contentFor: ContentFor,
  opts: { seed: string; release: string },
): SiteSpec {
  const newId = idMaker(opts.seed)
  const pageId: PageId = newId('p')
  const shellId = `sh_${newId('x').slice(2)}` as `sh_${string}`
  const all = [...plan.before, ...plan.sections, ...plan.after]
  const ids = all.map(() => newId('b'))
  const blocks: Record<string, BlockInstance> = {}
  const content: Record<string, Record<string, unknown>> = {}

  const nav: NavItem[] = plan.sections
    .map((s, i) => ({ s, id: ids[plan.before.length + i] }))
    .filter(
      (x): x is { s: SectionPlan & { navLabel: string }; id: `b_${string}` } =>
        !!x.s.navLabel && !!x.id,
    )
    .map((x) => ({
      id: newId('i'),
      label: x.s.navLabel,
      to: { type: 'page' as const, page: pageId, anchor: x.id },
    }))

  all.forEach((s, i) => {
    const id = ids[i] as `b_${string}`
    const [, name] = s.type.split('/')
    blocks[id] = {
      id,
      sectionType: s.sectionType,
      type: `${s.sectionType}/${name}`,
      v: 1,
      variant: s.variant,
      props: s.surface ? { surface: s.surface } : {},
    }
    const c = contentFor(s, i)
    content[id] = s.sectionType === 'header' ? { ...c, nav } : c
  })

  return {
    specVersion: 1,
    release: opts.release,
    structure: {
      pages: {
        [pageId]: {
          id: pageId,
          kind: 'home',
          path: '/',
          shell: shellId,
          body: ids.slice(
            plan.before.length,
            plan.before.length + plan.sections.length,
          ) as `b_${string}`[],
        },
      },
      shells: {
        [shellId]: {
          id: shellId,
          before: ids.slice(0, plan.before.length) as `b_${string}`[],
          after: ids.slice(plan.before.length + plan.sections.length) as `b_${string}`[],
        },
      },
      blocks,
    },
    style: { ...plan.style, color: facts.color },
    content: {
      business: facts.business,
      pages: { [pageId]: { navLabel: 'Home' } },
      blocks: content,
      collections: Object.fromEntries(facts.collections.map((c) => [c.id, c])),
      assets: Object.fromEntries(facts.assets.map((a) => [a.id, a])),
    },
    settings: {
      locale: facts.locale,
      dir: facts.dir,
      ...(facts.mobileActions ? { mobileActions: facts.mobileActions } : {}),
    },
  }
}
