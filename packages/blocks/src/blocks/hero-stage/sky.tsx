import {
  type BlockProps,
  cx,
  FitLine,
  OnPhoto,
  PhotoShade,
  Picture,
  Section,
  toneOf,
  wordsOn,
} from '../../kit/index.tsx'

// The photo fills the screen; a shade darkens the top and the foot so the menu and the foot line
// read. The name sits on the calmer of the photo's top and middle thirds, on a soft halo of shade
// as strong as that photo needs (wordsOn, from the photo's measured tone). It is fitted to the
// width but capped, so a short name stays elegant rather than enormous. The promise is the page's
// main heading, set small at the foot: the photo and the name lead.
export function Sky({ content: c, ctx }: BlockProps<'hero'>) {
  if (!c.media) return null
  const H = `h${ctx.headingLevel}` as 'h1' | 'h2'
  const w = wordsOn([toneOf(ctx, c.media)], ['top', 'middle'])
  const place = w.band === 'top' ? 'mt-section' : 'my-auto'
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
      <div aria-hidden="true" className={cx('photo-dim absolute inset-0', w.dim)} />
      <PhotoShade from="ends" className="absolute inset-0" />
      <OnPhoto className="-mx-gutter flex min-h-svh flex-col px-gutter pt-section pb-lg">
        <div
          className={cx(
            'text-glow relative mx-auto flex w-full max-w-wide flex-col items-center gap-md text-center',
            place,
          )}
        >
          <div
            aria-hidden="true"
            className={cx('photo-halo pointer-events-none absolute inset-x-0 -inset-y-xl', w.halo)}
          />
          <div className="relative flex w-full flex-col items-center gap-md">
            <FitLine text={ctx.business.name} className="fit-cap-masthead" />
            {c.eyebrow && (
              <p data-slot="eyebrow" className="type-lead">
                {c.eyebrow}
              </p>
            )}
          </div>
        </div>
        <div className="relative mt-auto flex flex-wrap items-end justify-between gap-x-xl gap-y-sm pt-section">
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
