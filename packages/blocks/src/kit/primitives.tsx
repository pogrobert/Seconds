import type { Cta, ImageRef, RichText as RichTextValue } from '@repo/spec'
import type { CSSProperties, ReactNode } from 'react'
import { cx, type RenderCtx } from './core.ts'

export function Section(p: {
  ctx: RenderCtx
  label?: string
  /** The element: a page section, or the site's header or footer. */
  as?: 'section' | 'header' | 'footer'
  /** Vertical space: a full section, a compact bar (headers, notices) or none. */
  space?: 'section' | 'compact' | 'none'
  className?: string
  children: ReactNode
}) {
  const Tag = p.as ?? 'section'
  const space = p.space === 'compact' ? 'py-sm' : p.space === 'none' ? 'py-0' : 'py-section'
  return (
    <Tag
      data-block-id={p.ctx.id}
      data-section={p.ctx.section}
      data-block-type={p.ctx.type}
      data-variant={p.ctx.variant}
      data-surface={p.ctx.surface}
      aria-label={p.label}
      className={cx('bg-bg text-fg px-gutter', space, p.className)}
    >
      {p.children}
    </Tag>
  )
}

export function Container(p: {
  width?: 'content' | 'prose' | 'wide'
  className?: string
  children: ReactNode
}) {
  const w =
    p.width === 'prose' ? 'max-w-prose' : p.width === 'wide' ? 'max-w-wide' : 'max-w-content'
  return <div className={cx('mx-auto w-full', w, p.className)}>{p.children}</div>
}

export function Heading(p: {
  ctx: RenderCtx
  /** jumbo: the editorial size, larger than display, for one short line of type that is the design. */
  style: 'jumbo' | 'display' | 'h2' | 'h3'
  slot: string
  className?: string
  children: ReactNode
}) {
  // A section's heading is the page's h1 when its block opens the page, whatever its visual size.
  const level = p.style === 'h3' ? 3 : p.ctx.headingLevel
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  const style =
    p.style === 'jumbo'
      ? 'type-jumbo'
      : p.style === 'display'
        ? 'type-display'
        : p.style === 'h2'
          ? 'type-h2'
          : 'type-h3'
  return (
    <Tag data-slot={p.slot} className={cx(style, 'max-w-full text-balance', p.className)}>
      {p.children}
    </Tag>
  )
}

/**
 * One line of display type that fills the width of its box, such as a wordmark along the footer.
 * Sized from the character count and the theme's measured character width, so it needs no
 * JavaScript. Keep the text short (up to about 28 characters); longer lines become small.
 */
export function FitLine(p: {
  text: string
  /** Rendered as a paragraph unless a heading level is wanted. */
  as?: 'p' | 'h2' | 'h3'
  className?: string
  children?: ReactNode
}) {
  const Tag = p.as ?? 'p'
  const chars = Math.max(4, [...p.text].length)
  return (
    <div className="@container min-w-0 max-w-full">
      <Tag
        className={cx('type-fit min-w-0 max-w-full break-words', p.className)}
        style={{ '--fit-chars': chars } as CSSProperties}
      >
        {p.children ?? p.text}
      </Tag>
    </div>
  )
}

export function Text(p: {
  style: 'lead' | 'body' | 'small'
  slot?: string
  muted?: boolean
  className?: string
  children: ReactNode
}) {
  const style = p.style === 'lead' ? 'type-lead' : p.style === 'small' ? 'type-small' : 'type-body'
  return (
    <p
      data-slot={p.slot}
      className={cx(style, 'text-pretty', p.muted && 'text-fg-muted', p.className)}
    >
      {p.children}
    </p>
  )
}

export function Eyebrow(p: { slot?: string; children: ReactNode }) {
  return (
    <p data-slot={p.slot ?? 'eyebrow'} className="type-eyebrow text-fg-muted">
      {p.children}
    </p>
  )
}

export function ButtonLink(p: {
  ctx: RenderCtx
  cta: Cta
  slot: string
  priority: 'primary' | 'secondary'
}) {
  return (
    <a
      href={p.ctx.href(p.cta.to)}
      data-slot={p.slot}
      data-button={p.priority === 'primary' ? p.ctx.button : 'outline'}
      className="btn type-button inline-flex min-h-tap items-center justify-center rounded-control px-md"
    >
      {p.cta.label}
    </a>
  )
}

export function Actions(p: { ctx: RenderCtx; primary?: Cta; secondary?: Cta; className?: string }) {
  if (!p.primary && !p.secondary) return null
  return (
    <div className={cx('flex flex-wrap gap-sm', p.className)}>
      {p.primary && <ButtonLink ctx={p.ctx} cta={p.primary} slot="primaryCta" priority="primary" />}
      {p.secondary && (
        <ButtonLink ctx={p.ctx} cta={p.secondary} slot="secondaryCta" priority="secondary" />
      )}
    </div>
  )
}

/** The only primitive allowed an inline style: the focal point as two custom properties. */
/** How much of the page width an image takes on wide screens. The kit writes the browser hint. */
export type Share = 'full' | 'half' | 'third' | 'quarter'
const SIZES: Record<Share, string> = {
  full: '100vw',
  half: '(min-width: 1024px) 50vw, 100vw',
  third: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  quarter: '(min-width: 1024px) 25vw, 50vw',
}

export function Picture(p: {
  ctx: RenderCtx
  image: ImageRef
  share: Share
  aspect?: number
  priority?: boolean
  slot?: string
  className?: string
}) {
  const sizes = SIZES[p.share]
  const a = p.ctx.image(p.image, { sizes, aspect: p.aspect })
  const fx = Math.round((p.image.focal?.x ?? 0.5) * 100)
  const fy = Math.round((p.image.focal?.y ?? 0.5) * 100)
  const focal = { '--fx': `${fx}%`, '--fy': `${fy}%` } as CSSProperties
  return (
    <img
      src={a.src}
      srcSet={a.srcSet}
      sizes={sizes}
      width={a.width}
      height={a.height}
      alt={p.image.alt}
      loading={p.priority ? 'eager' : 'lazy'}
      fetchPriority={p.priority ? 'high' : undefined}
      decoding="async"
      data-slot={p.slot}
      style={focal}
      className={cx('media-cover block min-w-0 max-w-full rounded-media', p.className)}
    />
  )
}

/** Rich text: paragraphs, bullet and numbered lists, quotes. Text nodes only, so always escaped. */
export function RichText(p: {
  ctx: RenderCtx
  value: RichTextValue
  slot: string
  className?: string
}) {
  const out: ReactNode[] = []
  let list: { style: 'bullet' | 'number'; items: ReactNode[] } | null = null
  const spans = (para: RichTextValue[number]) =>
    para.spans.map((s, i) => {
      let node: ReactNode = s.text
      if (s.marks?.includes('em')) node = <em>{node}</em>
      if (s.marks?.includes('strong')) node = <strong>{node}</strong>
      if (s.link) node = <a href={p.ctx.href(s.link)}>{node}</a>
      return <span key={i}>{node}</span>
    })
  const flush = () => {
    if (!list) return
    const Tag = list.style === 'bullet' ? 'ul' : 'ol'
    out.push(<Tag key={`l${out.length}`}>{list.items}</Tag>)
    list = null
  }
  p.value.forEach((para, i) => {
    if (para.style === 'bullet' || para.style === 'number') {
      if (list && list.style !== para.style) flush()
      list ??= { style: para.style, items: [] }
      list.items.push(<li key={i}>{spans(para)}</li>)
      return
    }
    flush()
    out.push(
      para.style === 'quote' ? (
        <blockquote key={i}>{spans(para)}</blockquote>
      ) : (
        <p key={i}>{spans(para)}</p>
      ),
    )
  })
  flush()
  return (
    <div data-slot={p.slot} className={cx('prose-flow type-body', p.className)}>
      {out}
    </div>
  )
}

/**
 * Text set over a photo. The area switches to the inverse surface (light text, its own button
 * colours) and sits on a dark shade drawn from the theme, so it stays readable on any photo.
 * Place <PhotoShade> over the photo and <OnPhoto> around the text, in the same stacking context.
 */
export function PhotoShade(p: { from?: 'bottom' | 'start' | 'even' | 'ends'; className?: string }) {
  const shade =
    p.from === 'even'
      ? 'shade-even'
      : p.from === 'start'
        ? 'shade-start'
        : p.from === 'ends'
          ? 'shade-ends'
          : 'shade-bottom'
  return (
    <div aria-hidden="true" className={cx('pointer-events-none relative', shade, p.className)} />
  )
}

/**
 * A box in another surface's colours, such as a brand-coloured half beside a photo. Its text pairs
 * are the theme's checked pairs for that surface, so contrast holds in every palette.
 */
export function Panel(p: {
  surface: 'base' | 'muted' | 'brand' | 'inverse'
  className?: string
  children: ReactNode
}) {
  return (
    <div data-surface={p.surface} className={cx('bg-bg text-fg', p.className)}>
      {p.children}
    </div>
  )
}

export function OnPhoto(p: { className?: string; children: ReactNode }) {
  return (
    <div data-surface="inverse" className={cx('relative text-fg', p.className)}>
      {p.children}
    </div>
  )
}
