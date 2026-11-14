import {
  type BlockProps,
  Container,
  cx,
  Heading,
  NewsletterForm,
  Section,
  Text,
} from '../../kit/index.tsx'

export default function CtaSignup({ content: c, variant, ctx }: BlockProps<'cta'>) {
  const stacked = variant === 'stacked'
  const copy = (
    <div className={cx('flex min-w-0 flex-col gap-sm', stacked && 'items-center text-center')}>
      <Heading ctx={ctx} style="h2" slot="headline">
        {c.headline}
      </Heading>
      {c.subhead && (
        <Text style="lead" slot="subhead" muted>
          {c.subhead}
        </Text>
      )}
    </div>
  )
  const form = c.form && (
    <div className="w-full min-w-0 text-start">
      <NewsletterForm ctx={ctx} form={c.form} />
    </div>
  )

  if (stacked) {
    return (
      <Section ctx={ctx}>
        <Container width="prose" className="flex flex-col items-center gap-lg">
          {copy}
          {form}
        </Container>
      </Section>
    )
  }

  return (
    <Section ctx={ctx}>
      <Container className="grid items-center gap-columns @lg:grid-cols-2">
        {copy}
        {form}
      </Container>
    </Section>
  )
}
