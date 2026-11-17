// The people, adapted from Shadcn UI Blocks team-03, -04, -05 and -10 (MIT, see ../../../NOTICE.md).
// Only the owner's own team is shown, with their photo when given and their initial otherwise.
// "We're hiring" and social links are removed; the carousel becomes a strip that scrolls sideways.

import { type BlockProps, Button, cx, Img, type SiteContent } from '../../ui.tsx'
import { L } from './parts.tsx'

type M = NonNullable<SiteContent['team']>[number]

function Face({ m, className }: { m: M; className: string }) {
  return m.photo ? (
    <div className={cx('bg-secondary shrink-0 overflow-hidden', className)}>
      <Img photo={{ ...m.photo, alt: m.name }} />
    </div>
  ) : (
    <span
      aria-hidden="true"
      className={cx(
        'bg-primary text-primary-foreground flex shrink-0 items-center justify-center font-medium',
        className,
      )}
    >
      {m.name.trim().charAt(0)}
    </span>
  )
}

/** Heading and words on the left, people in a grid on the right (team-03). */
export function Team03({ c }: BlockProps) {
  if (!c.team?.length) return null
  return (
    <section className="mx-auto flex max-w-7xl flex-col justify-center gap-14 px-6 py-20 lg:flex-row lg:px-8">
      <div className="sm:max-w-sm lg:max-w-xs">
        <p className="text-muted-foreground text-sm font-medium uppercase">{L.team}</p>
        <h2 className="mt-3 text-3xl md:text-4xl">{c.name}</h2>
        <p className="text-foreground/80 mt-4 text-base sm:text-lg">{c.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={c.book} size="lg">
            {c.cta.label}
          </Button>
          <Button href="#about" size="lg" variant="outline">
            {L.about}
          </Button>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 md:grid-cols-3">
        {c.team.map((m) => (
          <div key={m.name} className="flex items-start gap-4 md:flex-col">
            <Face m={m} className="size-16 rounded-full text-3xl sm:size-20" />
            <div>
              <h3 className="text-lg">{m.name}</h3>
              <p className="text-muted-foreground text-sm">{m.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Centred heading, people on soft cards with a round photo (team-04). */
export function Team04({ c }: BlockProps) {
  if (!c.team?.length) return null
  return (
    <section className="mx-auto flex max-w-7xl flex-col justify-center gap-16 px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground text-sm font-medium uppercase">{L.team}</p>
        <h2 className="mt-3 text-4xl sm:text-[2.75rem]">{c.name}</h2>
        <p className="text-muted-foreground mt-4 text-base text-pretty sm:text-xl">{c.tagline}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-10">
        {c.team.map((m) => (
          <div
            key={m.name}
            className="bg-accent text-accent-foreground flex w-full flex-col items-center rounded-(--radius) px-6 py-8 text-center sm:w-64"
          >
            <Face m={m} className="size-16 rounded-full text-3xl sm:size-20" />
            <h3 className="mt-5 text-lg">{m.name}</h3>
            <p className="text-muted-foreground text-sm">{m.role}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Centred heading, people as large square photos (team-05). */
export function Team05({ c }: BlockProps) {
  if (!c.team?.length) return null
  return (
    <section className="mx-auto flex max-w-7xl flex-col justify-center gap-16 px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground text-sm font-medium uppercase">{L.team}</p>
        <h2 className="mt-3 text-4xl sm:text-[2.75rem]">{c.name}</h2>
        <p className="text-muted-foreground mt-4 text-base text-pretty sm:text-xl">{c.tagline}</p>
      </div>
      <div className="grid w-full grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-4">
        {c.team.map((m) => (
          <div key={m.name}>
            <Face m={m} className="aspect-square h-auto w-full rounded-(--radius) text-6xl" />
            <h3 className="mt-4 text-lg">{m.name}</h3>
            <p className="text-muted-foreground text-sm">{m.role}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/** People on bordered tiles in a strip that scrolls sideways (team-10). */
export function Team10({ c }: BlockProps) {
  if (!c.team?.length) return null
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="text-center text-3xl sm:text-4xl md:text-[2.75rem]">{L.team}</h2>
      <p className="text-muted-foreground mt-3 text-center text-lg md:text-2xl">{c.name}</p>
      <ul className="mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
        {c.team.map((m) => (
          <li
            key={m.name}
            className="bg-muted w-full shrink-0 snap-start border py-12 sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.7rem)] lg:w-[calc(25%-0.75rem)]"
          >
            <Face m={m} className="mx-auto size-40 rounded-full text-5xl" />
            <h3 className="mt-6 text-center text-lg">{m.name}</h3>
            <p className="text-muted-foreground mt-0.5 text-center">{m.role}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
