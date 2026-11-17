// Numbers, adapted from Shadcn UI Blocks stats-10 (MIT, see ../../../NOTICE.md). Only the owner's
// own figures are shown; the demo percentages are removed.

import { ArrowUpRight } from 'lucide-react'
import { type BlockProps, Button } from '../../ui.tsx'

/** Heading and button on the left, each figure on its own muted panel on the right (stats-10). */
export function Stats10({ c }: BlockProps) {
  if (!c.stats?.length) return null
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-start gap-14 px-6 py-20 sm:gap-10 md:flex-row">
      <div className="max-w-md lg:max-w-lg">
        <h2 className="text-4xl">{c.reasonsTitle}</h2>
        <p className="text-muted-foreground mt-3.5 text-xl md:text-2xl/normal">{c.tagline}</p>
        <Button href={c.book} size="lg" className="mt-8 sm:mt-10">
          {c.cta.label} <ArrowUpRight className="size-5 rtl:-scale-x-100" />
        </Button>
      </div>
      <dl className="w-full grow space-y-4">
        {c.stats.map((s) => (
          <div key={s.label} className="bg-muted flex flex-col gap-3 rounded-(--radius) p-6">
            <dt className="text-foreground/80 order-2 text-lg">{s.label}</dt>
            <dd className="font-display order-1 text-5xl tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
