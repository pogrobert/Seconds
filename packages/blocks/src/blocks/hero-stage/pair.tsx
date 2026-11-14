import {
  type BlockProps,
  FitLine,
  OnPhoto,
  PhotoShade,
  Picture,
  Section,
} from '../../kit/index.tsx'

// Two photos share the screen (side by side on wide screens, one above the other on phones). An
// even shade keeps the light name readable over both. The name is fitted to the full width.
export function Pair({ content: c, ctx }: BlockProps<'hero'>) {
  const pics = (c.gallery ?? []).slice(0, 2)
  if (pics.length < 2) return null
  const H = `h${ctx.headingLevel}` as 'h1' | 'h2'
  return (
    <Section ctx={ctx} space="none" className="relative overflow-clip">
      <div data-slot="gallery" className="absolute inset-0 grid grid-cols-1 @md:grid-cols-2">
        {pics.map((g, i) => (
          <Picture
            key={g.id}
            ctx={ctx}
            image={g.image}
            aspect={4 / 5}
            priority={i === 0}
            share="half"
            className="h-full w-full rounded-none"
          />
        ))}
      </div>
      <PhotoShade from="even" className="absolute inset-0 opacity-60" />
      <PhotoShade from="ends" className="absolute inset-0" />
      <OnPhoto className="-mx-gutter flex min-h-svh flex-col justify-between px-gutter pt-section pb-lg">
        <span aria-hidden="true" />
        <FitLine text={ctx.business.name} className="fit-cap-wordmark text-glow text-center" />
        <div className="flex flex-wrap items-end justify-between gap-x-xl gap-y-sm">
          <H data-slot="headline" className="type-eyebrow max-w-prose text-pretty">
            {c.headline}
          </H>
          {c.proof && (
            <p data-slot="proof" className="type-eyebrow">
              {c.proof.link ? <a href={ctx.href(c.proof.link)}>{c.proof.text}</a> : c.proof.text}
            </p>
          )}
        </div>
      </OnPhoto>
    </Section>
  )
}
