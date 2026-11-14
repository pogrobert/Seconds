import {
  type BlockProps,
  ButtonLink,
  Container,
  cx,
  Logo,
  NavMenu,
  Section,
} from '../../kit/index.tsx'

export default function HeaderClassic({ content: c, variant, ctx }: BlockProps<'header'>) {
  const stacked = variant === 'stacked'
  return (
    <Section ctx={ctx} label="Site header" className="py-sm">
      <Container
        className={cx(
          'flex flex-wrap items-center gap-y-sm',
          stacked ? 'flex-col py-xs text-center' : 'justify-between gap-x-md',
        )}
      >
        <Logo ctx={ctx} className="flex min-h-tap items-center" />
        <div
          className={cx(
            'flex flex-wrap items-center gap-sm',
            stacked ? 'justify-center' : 'ms-auto justify-end',
          )}
        >
          <NavMenu ctx={ctx} nav={c.nav} />
          {c.primaryCta && (
            <ButtonLink ctx={ctx} cta={c.primaryCta} slot="primaryCta" priority="primary" />
          )}
        </div>
      </Container>
    </Section>
  )
}
