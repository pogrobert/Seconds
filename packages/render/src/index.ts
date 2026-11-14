import type { BlockProps, RenderCtx } from '@repo/blocks/components'
import { type BlockManifest, eligibility } from '@repo/blocks/manifest'
import type { Asset, BlockInstance, LinkTarget, PageId, SiteSpec } from '@repo/spec'
import { type ComponentType, createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// Spec to page. Pure: no Cloudflare, no Node. Runs in a Worker at publish, in Node for the eval
// tools, and in tests. The same spec and library always give the same bytes.
// Published pages get plain HTML and one stylesheet, and no JavaScript (architecture README, 10).

export type ImageUrl = (
  asset: Asset,
  o: { aspect?: number; sizes: string },
) => {
  src: string
  srcSet?: string
  width: number
  height: number
}

export type Library = {
  manifests: readonly BlockManifest[]
  // biome-ignore lint/suspicious/noExplicitAny: blocks of every section type share this map
  components: Record<string, ComponentType<BlockProps<any>>>
}

export type RenderOptions = {
  library: Library
  imageUrl: ImageUrl
  /** The theme's button style. */
  button: RenderCtx['button']
  formAction?: RenderCtx['formAction']
}

/** Where a link goes. Pages by their path, contact links from the business record. */
export function resolveHref(spec: SiteSpec, to: LinkTarget): string {
  const b = spec.content.business
  const first = b.locations[0]
  switch (to.type) {
    case 'page': {
      const page = spec.structure.pages[to.page]
      return `${page?.path ?? '/'}${to.anchor ? `#${to.anchor}` : ''}`
    }
    case 'url':
      return to.url
    case 'asset':
      return `/files/${to.asset}`
    case 'item':
      return '#' // item detail pages come later
    case 'contact': {
      const phone = b.phone ?? first?.phone
      if (to.channel === 'phone') return phone ? `tel:${phone}` : '#'
      if (to.channel === 'whatsapp') return phone ? `https://wa.me/${phone.replace('+', '')}` : '#'
      if (to.channel === 'email')
        return (b.email ?? first?.email) ? `mailto:${b.email ?? first?.email}` : '#'
      if (to.channel === 'booking') return b.bookingUrl ?? first?.bookingUrl ?? '#'
      const g = first?.geo
      const a = first?.address
      const dest = g
        ? `${g.lat},${g.lng}`
        : a
          ? [...a.lines, a.locality, a.postalCode].filter(Boolean).join(', ')
          : ''
      return dest
        ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`
        : '#'
    }
  }
}

/**
 * Picks what to draw for one block instance. Defensive (report 01, D16): an unknown block type or a
 * variant that cannot show this content falls back to another block or variant of the same section
 * type, and a page never fails because of one block.
 */
export function chooseBlock(
  b: BlockInstance,
  content: Record<string, unknown>,
  library: Library,
): { type: string; variant: string; fallback: boolean } | null {
  const tryOne = (m: BlockManifest | undefined, preferred?: string) => {
    if (!m || !library.components[m.type]) return null
    const order = [preferred, ...Object.keys(m.variants)].filter(
      (v): v is string => !!v && v in m.variants,
    )
    for (const v of order) if (eligibility(m, v, content).ok) return v
    return null
  }
  const own = library.manifests.find((m) => m.type === b.type)
  const v = tryOne(own, b.variant)
  if (own && v) return { type: own.type, variant: v, fallback: v !== b.variant }
  for (const m of library.manifests.filter(
    (x) => x.sectionType === b.sectionType && x.type !== b.type,
  )) {
    const fv = tryOne(m)
    if (fv) return { type: m.type, variant: fv, fallback: true }
  }
  return null
}

export type RenderedPage = {
  /** The page's body HTML: header, sections and footer. */
  html: string
  /** Block types drawn, for building the page's stylesheet. */
  types: string[]
  /** Blocks drawn with a fallback, and why. Shown to the owner, never to visitors. */
  notes: string[]
}

export function renderPage(spec: SiteSpec, pageId: PageId, o: RenderOptions): RenderedPage {
  const page = spec.structure.pages[pageId]
  if (!page) throw new Error(`no page ${pageId}`)
  const shell = spec.structure.shells[page.shell]
  const order = [...(shell?.before ?? []), ...page.body, ...(shell?.after ?? [])]
  const firstBody = page.body.find((id) => !spec.structure.blocks[id]?.hidden)
  const types = new Set<string>()
  const notes: string[] = []
  const parts: string[] = []

  for (const id of order) {
    const b = spec.structure.blocks[id]
    if (!b || b.hidden) continue
    const content = (spec.content.blocks[id] ?? {}) as Record<string, unknown>
    const pick = chooseBlock(b, content, o.library)
    if (!pick) {
      notes.push(`${id}: no block can show this ${b.sectionType} content; left out`)
      continue
    }
    if (pick.fallback)
      notes.push(`${id}: drawn as ${pick.type}#${pick.variant} instead of ${b.type}#${b.variant}`)
    const Component = o.library.components[pick.type]
    if (!Component) continue
    types.add(pick.type)
    const ctx: RenderCtx = {
      id,
      section: b.sectionType,
      type: pick.type,
      variant: pick.variant,
      surface: b.props.surface ?? 'base',
      headingLevel: id === firstBody ? 1 : 2,
      button: o.button,
      href: (to) => resolveHref(spec, to),
      image: (img, io) => {
        const asset = spec.content.assets[img.asset]
        if (!asset) return { src: '', width: 1, height: 1 }
        return o.imageUrl({ ...asset, alt: img.alt, focal: img.focal ?? asset.focal }, io)
      },
      business: spec.content.business,
      collection: (cid) => spec.content.collections[cid],
      locale: spec.settings.locale,
      dir: spec.settings.dir,
      formAction: o.formAction ?? ((f) => `/_x/forms/${f.form}`),
    }
    parts.push(
      renderToStaticMarkup(
        createElement(Component, { content: content as never, variant: pick.variant, ctx }),
      ),
    )
  }

  return { html: parts.join(''), types: [...types], notes }
}

const escapeText = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** A complete HTML document for one page. `css` is the site's stylesheet: kit, theme and blocks used. */
export function renderDocument(
  spec: SiteSpec,
  pageId: PageId,
  o: RenderOptions & { css: string },
): RenderedPage {
  const r = renderPage(spec, pageId, o)
  const page = spec.structure.pages[pageId]
  const pc = page ? spec.content.pages[page.id] : undefined
  const name = spec.content.business.name
  const title = pc?.title ?? (page?.kind === 'home' ? name : `${pc?.navLabel ?? ''} · ${name}`)
  const meta = pc?.description
    ? `<meta name="description" content="${escapeText(pc.description)}">`
    : ''
  const html = `<!doctype html><html lang="${spec.settings.locale}" dir="${spec.settings.dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeText(title)}</title>${meta}<style>${o.css}</style></head><body data-site>${r.html}</body></html>`
  return { ...r, html }
}
