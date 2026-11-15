import { Actions, type BlockProps, FitLine, LetteredName, Section } from '../../kit/index.tsx'

// The name is fitted by its longest word, since it is set one word to a line. The buttons are the
// theme's own (rounded in the Signature family).
export function Lettered({ content: c, ctx }: BlockProps<'hero'>) {
  const name = ctx.business.name
  const longest = name.split(/\s+/).reduce((a, w) => (w.length > a.length ? w : a), '')
  const H = `h${ctx.headingLevel}` as 'h1' | 'h2'
  return (
    <Section
      ctx={ctx}
      space="none"
      className="flex min-h-svh flex-col items-center justify-center gap-lg pt-section pb-xl text-center"
    >
      <div className="w-full max-w-wide">
        <FitLine text={longest} className="fit-cap-lettered">
          <LetteredName name={name} marks={ctx.axes.marks} />
        </FitLine>
      </div>
      <H data-slot="headline" className="type-lead max-w-prose text-balance">
        {c.headline}
      </H>
      <Actions
        ctx={ctx}
        primary={c.primaryCta}
        secondary={c.secondaryCta}
        className="justify-center"
      />
    </Section>
  )
}
