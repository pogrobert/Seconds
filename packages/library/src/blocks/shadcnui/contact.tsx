// How to reach the business, adapted from Shadcn UI Blocks contact-02 (MIT, see
// ../../../NOTICE.md). The cards hold only the details the owner gave (email, phone, address,
// hours); live chat is removed, and the form, which would have nowhere to send, becomes a photo.

import { Clock, MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { type BlockProps, hasVisit, Img } from '../../ui.tsx'
import { L, tel } from './parts.tsx'

function Card(p: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="bg-background rounded-[calc(var(--radius)-4px)] border p-6">
      <div className="border-foreground/5 bg-foreground/5 flex size-12 items-center justify-center rounded-(--radius) border">
        {p.icon}
      </div>
      <h3 className="mt-6 text-xl">{p.title}</h3>
      <div className="mt-2.5">{p.children}</div>
    </div>
  )
}

/** Detail cards in a muted frame beside a photo (contact-02). */
export function Contact02({ c }: BlockProps) {
  if (!hasVisit(c)) return null
  const link = 'text-primary font-medium break-words hover:underline'
  return (
    <section id="visit" className="py-20">
      <div className="mx-auto w-full max-w-7xl px-6">
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          {L.visit}
        </p>
        <h2 className="mt-3 text-4xl">{c.cta.headline}</h2>
        <p className="text-muted-foreground mt-3 text-lg md:text-xl">{c.cta.subhead}</p>
        <div className="mt-16 flex flex-col gap-10 lg:flex-row">
          <div className="bg-muted grid w-full max-w-3xl grid-cols-1 gap-1 rounded-(--radius) border p-1 sm:grid-cols-2">
            {c.email && (
              <Card icon={<MailIcon />} title={L.email}>
                <a className={link} href={`mailto:${c.email}`}>
                  {c.email}
                </a>
              </Card>
            )}
            {c.phone && (
              <Card icon={<PhoneIcon />} title={L.call}>
                <a className={link} href={tel(c.phone)}>
                  {c.phone}
                </a>
              </Card>
            )}
            {c.address.length > 0 && (
              <Card icon={<MapPinIcon />} title={L.address}>
                <address className="font-medium not-italic">
                  {c.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </Card>
            )}
            {c.hours.length > 0 && (
              <Card icon={<Clock />} title={L.hours}>
                <dl className="space-y-1">
                  {c.hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">{h.days}</dt>
                      <dd className="tabular-nums">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            )}
          </div>
          <div className="bg-muted min-h-72 w-full overflow-hidden rounded-(--radius) border p-1 lg:max-w-lg">
            <div className="size-full overflow-hidden rounded-[calc(var(--radius)-4px)]">
              <Img photo={c.photos.about} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
