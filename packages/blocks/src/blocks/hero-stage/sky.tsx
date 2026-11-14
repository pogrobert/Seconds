import {
  type BlockProps,
  FitLine,
  OnPhoto,
  PhotoShade,
  Picture,
  Section,
} from '../../kit/index.tsx'

// The photo fills the screen; a shade darkens the top and the foot so the light type reads. The
// name is fitted to the width but capped, so a short name stays elegant rather than enormous.
// The promise is the page's main heading, set small at the foot: the photo and the name lead.
export function Sky({ content: c, ctx }: BlockProps<'hero'>) {
  if (!c.media) return null
  const H = `h${ctx.headingLevel}` as 'h1' | 'h2'
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
      <PhotoShade from="even" className="absolute inset-0 opacity-40" />
      <PhotoShade from="ends" className="absolute inset-0" />
      <OnPhoto className="-mx-gutter flex min-h-svh flex-col px-gutter pt-section pb-lg">
        <div className="text-glow mx-auto mt-section flex w-full max-w-wide flex-col items-center gap-md text-center">
          <FitLine text={ctx.business.name} className="fit-cap-masthead" />
          {c.eyebrow && (
            <p data-slot="eyebrow" className="type-lead">
              {c.eyebrow}
            </p>
          )}
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-xl gap-y-sm pt-section">
          <H data-slot="headline" className="type-body max-w-prose text-pretty">
            {c.headline}
          </H>
          {c.proof && (
            <p data-slot="proof" className="type-small">
              {c.proof.link ? <a href={ctx.href(c.proof.link)}>{c.proof.text}</a> : c.proof.text}
            </p>
          )}
        </div>
      </OnPhoto>
    </Section>
  )
}
