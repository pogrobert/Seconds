// The people. Adapted from Tailark (MIT, see ../../../NOTICE.md): Mist team one, Veil team one and
// two, Dusk team one. Only the people the owner named appear; where no photo was given, their
// initials stand in. Hiring buttons, social links and bios are removed.

import { type BlockProps, Container } from '../../ui.tsx'
import { Avatar, initials } from './parts.tsx'

/** A labelled rule, then square portraits in four columns (Dusk, team one). */
export function TeamDuskOne({ c }: BlockProps) {
  if (!c.team?.length) return null
  return (
    <section className="py-16 md:py-20">
      <Container wide>
        <div className="grid grid-cols-[auto_1fr] items-center gap-4">
          <h2 className="text-muted-foreground block text-sm">Team</h2>
          <span className="bg-border h-px w-full" />
        </div>
        <div className="mt-12 grid gap-12 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {c.team.map((m) => (
            <div key={m.name}>
              <div className="bg-muted text-muted-foreground flex aspect-square items-center justify-center overflow-hidden rounded-xl">
                {m.photo ? (
                  <img
                    className="photo size-full object-cover object-top"
                    src={m.photo.src}
                    alt={m.photo.alt}
                    width={m.photo.w}
                    height={m.photo.h}
                    loading="lazy"
                  />
                ) : (
                  <span aria-hidden className="font-display text-4xl">
                    {initials(m.name)}
                  </span>
                )}
              </div>
              <div className="pt-3">
                <h3 className="font-medium">{m.name}</h3>
                <p className="text-muted-foreground text-sm">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** On a quiet band, a list of small portraits with name and role (Mist, team one). */
export function TeamMistOne({ c }: BlockProps) {
  if (!c.team?.length) return null
  return (
    <section className="bg-muted/50 py-24">
      <Container className="@container">
        <h2 className="mb-12 text-4xl">Team</h2>
        <div className="grid gap-6 @sm:grid-cols-2 @xl:grid-cols-3 md:gap-y-10">
          {c.team.map((m) => (
            <div key={m.name} className="grid grid-cols-[auto_1fr] items-center gap-3">
              <Avatar name={m.name} photo={m.photo} className="size-10 rounded-(--radius)" />
              <div>
                <span className="font-medium">{m.name}</span>
                <div className="text-muted-foreground text-sm">{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** One person per row, a large portrait framed by fine guide lines (Veil, team one). */
export function TeamVeilOne({ c }: BlockProps) {
  if (!c.team?.length) return null
  return (
    <section className="bg-background overflow-hidden py-24">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-balance text-4xl">Team</h2>
        <div className="mt-12 grid gap-12 text-sm">
          {c.team.map((m) => (
            <div key={m.name} className="relative grid grid-cols-[auto_1fr] gap-4">
              <div aria-hidden className="absolute -inset-x-6 inset-y-1 max-h-26 border-y" />
              <div aria-hidden className="absolute -inset-y-6 inset-x-1 w-26 border-x" />
              <Avatar
                name={m.name}
                photo={m.photo}
                className="size-28 rounded-xl text-2xl shadow-md"
              />
              <div className="flex flex-col justify-center gap-1 py-1">
                <p className="text-foreground text-base font-medium">{m.name}</p>
                <p className="text-muted-foreground text-sm">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Portraits in a grid of three with name and role beneath (Veil, team two). */
export function TeamVeilTwo({ c }: BlockProps) {
  if (!c.team?.length) return null
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-balance text-4xl">Team</h2>
        <div className="mt-12 grid grid-cols-2 gap-3 gap-y-6 text-sm @xl:grid-cols-3 @xl:gap-6">
          {c.team.map((m) => (
            <div key={m.name} className="flex flex-col gap-4">
              <Avatar
                name={m.name}
                photo={m.photo}
                className="size-28 rounded-xl text-2xl shadow-md"
              />
              <div className="space-y-1">
                <p className="text-foreground text-sm font-medium">{m.name}</p>
                <p className="text-muted-foreground text-sm">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
