import { type BlockProps, ButtonLink, Logo, NavMenu, OnPhoto, Section } from '../../kit/index.tsx'

// Laid over the opening block: the section has no ground and sits at the top of the page. on-dark
// draws in the inverse surface's light colours (OnPhoto), on-light in the page's own ink. The bar
// keeps a ground of its own (dark or light) unless a full-screen opening sits under it (kit.css,
// .over-ground), so it stays readable wherever it is placed.
export default function HeaderOver({ content: c, variant, ctx }: BlockProps<'header'>) {
  const row = (
    <div className="over-ground -mx-gutter flex flex-wrap items-center justify-between gap-x-md gap-y-sm bg-bg px-gutter py-sm">
      <Logo ctx={ctx} className="flex min-h-tap items-center" />
      <div className="ms-auto flex flex-wrap items-center justify-end gap-md">
        <NavMenu ctx={ctx} nav={c.nav} />
        {c.primaryCta && (
          <ButtonLink
            ctx={ctx}
            cta={c.primaryCta}
            slot="primaryCta"
            priority={variant === 'on-light' ? 'primary' : 'secondary'}
          />
        )}
      </div>
    </div>
  )
  return (
    <Section
      ctx={ctx}
      as="header"
      label="Site header"
      space="none"
      clear
      className="absolute inset-x-0 top-0 z-10"
    >
      {variant === 'on-light' ? row : <OnPhoto>{row}</OnPhoto>}
    </Section>
  )
}
