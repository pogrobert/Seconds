// Contact and visit sections. Adapted from efferd (MIT, see ../../../NOTICE.md): contact 1 (boxes
// with an icon heading) and contact 2 (a framed card with plus marks). The social links, the second
// phone number, the invented reply times and contact 2's form are removed: a site shows only the
// details its owner gave.

import { Clock } from 'lucide-react'
import { type BlockProps, Button, cx, hasVisit } from '../../ui.tsx'
import { Corners, contactFacts, HoursList } from './parts.tsx'

/** A title, then one box per detail in a ruled grid (efferd contact 1). */
export function ContactBoxes({ c }: BlockProps) {
  if (!hasVisit(c)) return null
  const facts = contactFacts(c)
  const boxes = [
    ...facts.map((f) => ({
      key: f.key,
      icon: f.icon,
      label: f.label,
      body: f.href ? (
        <a className="font-medium text-sm tracking-wide break-all hover:underline" href={f.href}>
          {f.value}
        </a>
      ) : (
        <span className="font-medium text-sm tracking-wide">{f.value}</span>
      ),
    })),
    ...(c.hours.length
      ? [
          {
            key: 'hours',
            icon: Clock,
            label: 'Hours',
            body: <HoursList c={c} className="w-full" />,
          },
        ]
      : []),
  ]
  return (
    <section id="visit" className="py-16">
      <div className="mx-auto max-w-5xl border-y lg:border-x">
        <div className="flex flex-col justify-center px-4 py-16 md:items-center md:text-center">
          <h2 className="text-4xl md:text-5xl">Visit</h2>
          <p className="text-muted-foreground mt-2">{c.name}</p>
        </div>
        <div
          className={cx(
            'grid border-t',
            boxes.length === 2 && 'md:grid-cols-2',
            boxes.length === 3 && 'md:grid-cols-3',
            boxes.length === 4 && 'md:grid-cols-2 lg:grid-cols-4',
          )}
        >
          {boxes.map((b) => (
            <div
              key={b.key}
              className="flex flex-col border-b md:border-e last:border-b-0 md:last:border-e-0"
            >
              <div className="bg-secondary/50 flex items-center gap-x-3 border-b p-4">
                <b.icon aria-hidden className="text-muted-foreground size-5" strokeWidth={1} />
                <h3 className="text-lg tracking-wider">{b.label}</h3>
              </div>
              <div className="flex grow items-center gap-x-2 p-4 py-12">{b.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** A framed card: details on a soft panel, hours and the booking button beside (efferd contact 2). */
export function ContactCard({ c }: BlockProps) {
  if (!hasVisit(c)) return null
  const facts = contactFacts(c)
  return (
    <section id="visit" className="px-4 py-24">
      <div className="relative mx-auto grid w-full max-w-5xl border md:grid-cols-2 lg:grid-cols-3">
        <Corners />
        <div className="bg-secondary/50 flex flex-col justify-between lg:col-span-2">
          <div className="space-y-4 px-4 py-8 md:p-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl">Visit</h2>
            <p className="text-muted-foreground max-w-xl md:text-lg">{c.tagline}</p>
            {facts.length > 0 && (
              <div className="grid gap-4 pt-2 lg:grid-cols-2">
                {facts.map((f) => (
                  <div
                    key={f.key}
                    className={cx(
                      'flex items-center gap-3 py-3',
                      f.key === 'address' && 'lg:col-span-2',
                    )}
                  >
                    <div className="bg-card rounded-(--radius) border p-3 shadow-sm">
                      <f.icon aria-hidden className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{f.label}</p>
                      {f.href ? (
                        <a
                          className="text-muted-foreground text-sm break-all hover:underline"
                          href={f.href}
                        >
                          {f.value}
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm">{f.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="bg-card text-card-foreground flex flex-col justify-center gap-8 border-t px-4 py-8 md:border-t-0 md:border-s md:p-8">
          {c.hours.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg">Hours</h3>
              <HoursList c={c} />
            </div>
          )}
          <Button href={c.book} className="w-full">
            {c.cta.label}
          </Button>
        </div>
      </div>
    </section>
  )
}
