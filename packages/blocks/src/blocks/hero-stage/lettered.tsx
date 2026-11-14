import { type BlockProps, FitLine, LetteredName, Section } from '../../kit/index.tsx'

// The name is fitted by its longest word, since it is set one word to a line. The buttons are
// joined plain blocks in the surface's colours swapped, like tickets, rather than the theme button.
export function Lettered({ content: c, ctx }: BlockProps<'hero'>) {
  const name = ctx.business.name
  const longest = name.split(/\s+/).reduce((a, w) => (w.length > a.length ? w : a), '')
  const H = `h${ctx.headingLevel}` as 'h1' | 'h2'
  const cta = [
    c.primaryCta && { cta: c.primaryCta, slot: 'primaryCta' },
    c.secondaryCta && { cta: c.secondaryCta, slot: 'secondaryCta' },
  ].filter((x) => !!x)
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
      {cta.length > 0 && (
        <div className="flex flex-wrap justify-center">
          {cta.map((x) => (
            <a
              key={x.slot}
              data-slot={x.slot}
              href={ctx.href(x.cta.to)}
              className="type-button min-h-tap border-e border-bg bg-fg px-lg py-sm text-bg no-underline last:border-e-0"
            >
              {x.cta.label}
            </a>
          ))}
        </div>
      )}
    </Section>
  )
}
