import {
  type BlockProps,
  ButtonLink,
  Container,
  cx,
  EmailLink,
  Logo,
  NavMenu,
  PhoneLink,
  type RenderCtx,
  Section,
  SocialLinks,
} from '../../kit/index.tsx'

type HeaderContent = BlockProps<'header'>['content']

/** The contact strip: only facts the section asks for and the business record holds, in the asked order. */
function FactsBar(p: { ctx: RenderCtx; facts: NonNullable<HeaderContent['facts']> }) {
  const b = p.ctx.business
  const sole = b.locations.length === 1 ? b.locations[0] : undefined
  const phone = b.phone ?? sole?.phone
  const email = b.email ?? sole?.email
  // One address only makes sense for one place; a business with several shows none here.
  const address = sole?.address
  const items = p.facts.flatMap((f) => {
    if (f === 'phone' && phone)
      return [
        <li key="phone" className="flex min-h-tap items-center">
          <PhoneLink phone={phone} />
        </li>,
      ]
    if (f === 'email' && email)
      return [
        <li key="email" className="hidden min-h-tap min-w-0 items-center @md:flex">
          <EmailLink email={email} />
        </li>,
      ]
    if (f === 'address' && address)
      return [
        <li key="address" className="hidden min-h-tap items-center @md:flex">
          <address data-slot="address" className="type-body not-italic">
            {[...address.lines, address.locality, address.postalCode].filter(Boolean).join(', ')}
          </address>
        </li>,
      ]
    if (f === 'social' && b.social?.length)
      return [
        <li key="social" className="hidden min-h-tap items-center @md:flex">
          <SocialLinks business={b} />
        </li>,
      ]
    return []
  })
  if (!items.length) return null
  // On phones the strip keeps only the phone number; without one it appears from @md up.
  const phoneShown = items.some((i) => i.key === 'phone')
  return (
    <ul
      data-slot="facts"
      className={cx(
        'flex-wrap items-center gap-x-lg border-b border-border pb-2xs text-fg-muted',
        phoneShown ? 'flex' : 'hidden @md:flex',
      )}
    >
      {items}
    </ul>
  )
}

/** The menu behind a "Menu" button on every width: the phone half of the kit's NavMenu. */
function MenuButton(p: { ctx: RenderCtx; nav: HeaderContent['nav'] }) {
  const menuId = `menu-${p.ctx.id}`
  return (
    <nav data-slot="nav" aria-label="Main">
      <button
        type="button"
        popoverTarget={menuId}
        data-button="outline"
        className="btn type-button min-h-tap rounded-control px-md"
      >
        Menu
      </button>
      <div id={menuId} popover="auto" className="menu-popover">
        <ul className="flex flex-col gap-2xs">
          {p.nav.map((item) => (
            <li key={item.id}>
              {item.children?.length ? (
                <details className="nav-dropdown">
                  <summary className="type-body flex min-h-tap cursor-pointer items-center">
                    {item.label}
                  </summary>
                  <ul className="flex flex-col gap-2xs ps-md">
                    <li>
                      <a
                        href={p.ctx.href(item.to)}
                        className="type-body flex min-h-tap items-center"
                      >
                        {item.label}
                      </a>
                    </li>
                    {item.children.map((c) => (
                      <li key={c.id}>
                        <a
                          href={p.ctx.href(c.to)}
                          className="type-body flex min-h-tap items-center"
                        >
                          {c.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <a href={p.ctx.href(item.to)} className="type-body flex min-h-tap items-center">
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default function HeaderUtility({ content: c, variant, ctx }: BlockProps<'header'>) {
  const cta = c.primaryCta && (
    <ButtonLink ctx={ctx} cta={c.primaryCta} slot="primaryCta" priority="primary" />
  )

  if (variant === 'minimal') {
    return (
      <Section ctx={ctx} label="Site header" className="py-sm">
        <Container className="flex flex-wrap items-center justify-between gap-x-md gap-y-sm py-xs">
          <Logo ctx={ctx} className="flex min-h-tap items-center" />
          <div className="ms-auto flex flex-wrap items-center justify-end gap-sm">
            {cta}
            <MenuButton ctx={ctx} nav={c.nav} />
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <Section ctx={ctx} label="Site header" className="py-xs">
      <Container className="flex flex-col gap-xs">
        {c.facts && <FactsBar ctx={ctx} facts={c.facts} />}
        <div className="flex flex-wrap items-center justify-between gap-x-md gap-y-sm">
          <Logo ctx={ctx} className="flex min-h-tap items-center" />
          <div className="ms-auto flex flex-wrap items-center justify-end gap-sm">
            <NavMenu ctx={ctx} nav={c.nav} />
            {cta}
          </div>
        </div>
      </Container>
    </Section>
  )
}
