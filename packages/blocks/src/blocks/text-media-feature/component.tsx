import {
  Actions,
  type BlockProps,
  Container,
  cx,
  Eyebrow,
  Heading,
  Picture,
  type RenderCtx,
  RichText,
  Section,
} from '../../kit/index.tsx'

type Body = BlockProps<'text-media'>['content']['body']

const length = (body: Body) =>
  body.reduce((n, p) => n + p.spans.reduce((m, s) => m + s.text.length, 0), 0)

/** One paragraph's spans with their marks and links, for the opening line set large. */
function Spans(p: { para: Body[number]; ctx: RenderCtx }) {
  return p.para.spans.map((s, i) => {
    const em = s.marks?.includes('em') ? <em>{s.text}</em> : s.text
    const strong = s.marks?.includes('strong') ? <strong>{em}</strong> : em
    return (
      <span key={i}>
        {s.link ? (
          <a href={p.ctx.href(s.link)} className="underline">
            {strong}
          </a>
        ) : (
          strong
        )}
      </span>
    )
  })
}

export default function TextMediaFeature({ content: c, variant, ctx }: BlockProps<'text-media'>) {
  if (variant === 'overlap' && c.media) {
    // A large photo; the text sits on a panel in the section's own colour that cuts into one
    // lower corner of it (the start corner on phones, so text keeps the page's edge; the end corner
    // on wide screens) and runs on below it, so the panel grows with the text.
    return (
      <Section ctx={ctx}>
        <Container className="grid @lg:grid-cols-12">
          <Picture
            ctx={ctx}
            image={c.media}
            slot="media"
            aspect={3 / 2}
            share="full"
            className="w-full aspect-portrait @md:aspect-landscape @lg:col-span-10"
          />
          <div className="relative -mt-2xl me-lg flex min-w-0 flex-col items-start gap-md rounded-card bg-bg pt-lg pe-md @md:me-section @lg:col-start-6 @lg:col-span-7 @lg:-mt-section @lg:me-0 @lg:pe-0 @lg:pt-xl @lg:ps-xl">
            {(c.eyebrow || c.headline) && (
              <div className="flex flex-col gap-sm">
                {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
                {c.headline && (
                  <Heading ctx={ctx} style="h2" slot="headline">
                    {c.headline}
                  </Heading>
                )}
              </div>
            )}
            <RichText ctx={ctx} value={c.body} slot="body" className="max-w-prose" />
            <Actions
              ctx={ctx}
              primary={c.primaryCta}
              secondary={c.secondaryCta}
              className="pt-xs"
            />
          </div>
        </Container>
      </Section>
    )
  }

  if (variant === 'columns' && c.media) {
    // Magazine feature: headline, one wide photo, then the text in two columns when it is long
    // enough to fill them, or one column set to the end side when it is short.
    const long = length(c.body) >= 600
    return (
      <Section ctx={ctx}>
        <Container className="flex flex-col gap-xl @lg:gap-2xl">
          {(c.eyebrow || c.headline) && (
            <div className="flex flex-col gap-md @lg:w-5/6">
              {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
              {c.headline && (
                <Heading ctx={ctx} style="display" slot="headline">
                  {c.headline}
                </Heading>
              )}
            </div>
          )}
          <Picture
            ctx={ctx}
            image={c.media}
            slot="media"
            aspect={16 / 9}
            share="full"
            className="w-full aspect-landscape @lg:aspect-wide"
          />
          <div className="grid gap-lg @lg:grid-cols-12 @lg:gap-x-columns">
            <RichText
              ctx={ctx}
              value={c.body}
              slot="body"
              className={cx(
                long
                  ? '@lg:col-span-12 @lg:columns-2 @lg:gap-x-columns'
                  : 'max-w-prose @lg:col-start-7 @lg:col-span-6',
              )}
            />
            <Actions
              ctx={ctx}
              primary={c.primaryCta}
              secondary={c.secondaryCta}
              className={cx(long ? '@lg:col-span-12' : '@lg:col-start-7 @lg:col-span-6')}
            />
          </div>
        </Container>
      </Section>
    )
  }

  // quote (and any variant whose photo is missing): the opening paragraph set large as a
  // statement across the page; under a rule, a small heading beside the rest of the text.
  const [first, ...rest] = c.body
  const lead = first && (first.style === 'p' || first.style === 'quote') ? first : undefined
  const after = lead ? rest : c.body
  const big = lead ? length([lead]) <= 240 : false
  const Tag = ctx.headingLevel === 1 ? 'h1' : 'h2'
  return (
    <Section ctx={ctx}>
      <Container className="grid gap-lg @lg:grid-cols-12 @lg:gap-x-columns @lg:gap-y-xl">
        {(c.eyebrow || c.headline) && (
          <div
            className={cx('flex min-w-0 flex-col gap-xs @lg:col-span-4', lead && '@lg:row-start-2')}
          >
            {c.eyebrow && <Eyebrow>{c.eyebrow}</Eyebrow>}
            {c.headline && (
              <Tag data-slot="headline" className="type-h3 max-w-full text-balance">
                {c.headline}
              </Tag>
            )}
          </div>
        )}
        <div data-slot="body" className="contents">
          {lead && (
            <div className="min-w-0 border-b border-border pb-lg @lg:col-span-12 @lg:row-start-1 @lg:pb-xl">
              <p
                className={cx(
                  'max-w-full @lg:w-5/6',
                  big ? 'type-h2 text-balance' : 'type-lead text-pretty',
                )}
              >
                <Spans para={lead} ctx={ctx} />
              </p>
            </div>
          )}
          {(after.length > 0 || c.primaryCta || c.secondaryCta) && (
            <div
              className={cx(
                'flex min-w-0 flex-col items-start gap-md @lg:col-start-6 @lg:col-span-6',
                lead && '@lg:row-start-2',
              )}
            >
              {after.length > 0 && (
                <RichText ctx={ctx} value={after} slot="body" className="max-w-prose" />
              )}
              <Actions
                ctx={ctx}
                primary={c.primaryCta}
                secondary={c.secondaryCta}
                className="pt-xs"
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
