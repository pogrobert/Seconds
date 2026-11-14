import { Actions, type BlockProps, Heading, Picture, Section, Text } from '../../kit/index.tsx'

// Dark words on a light photo: a wash of the page colour runs in from the start edge on wide
// screens and up from the foot on narrow ones, so the words always sit on calm ground.
export function Feature({ content: c, ctx }: BlockProps<'hero'>) {
  if (!c.media) return null
  return (
    <Section ctx={ctx} space="none" className="relative overflow-clip">
      <Picture
        ctx={ctx}
        image={c.media}
        slot="media"
        aspect={16 / 9}
        priority
        share="full"
        className="absolute inset-0 h-full w-full rounded-none"
      />
      <div aria-hidden="true" className="wash-bottom absolute inset-0 @lg:hidden" />
      <div aria-hidden="true" className="wash-start absolute inset-0 hidden @lg:block" />
      <div className="relative -mx-gutter flex min-h-svh flex-col justify-end px-gutter pt-section pb-xl">
        <div className="flex max-w-content flex-col items-start gap-lg">
          <Heading ctx={ctx} style="display" slot="headline" className="max-w-wide">
            {c.headline}
          </Heading>
          {c.subhead && (
            <Text style="lead" slot="subhead" className="max-w-prose">
              {c.subhead}
            </Text>
          )}
          <Actions ctx={ctx} primary={c.primaryCta} secondary={c.secondaryCta} />
        </div>
      </div>
    </Section>
  )
}
