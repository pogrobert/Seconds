// Questions and answers. Adapted from efferd (MIT, see ../../../NOTICE.md): faqs 1 to 5. The Radix
// accordion becomes <details>, so answers open without script. Faqs 4 and 5 lose their category
// filter and search box (both need script and invented categories); "contact our support team"
// becomes the owner's own phone and email, when given.

import { PlusIcon } from 'lucide-react'
import type { BlockProps } from '../../ui.tsx'
import { AskLine, Question } from './parts.tsx'

/** Heading, then the questions joined in one card (efferd faqs 1). */
export function FaqCard({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-3xl space-y-7 px-4">
        <h2 className="text-3xl md:text-4xl">Questions</h2>
        <div className="bg-card text-card-foreground w-full -space-y-px rounded-(--radius) shadow">
          {c.faq.map((f, i) => (
            <Question
              key={f.q}
              q={f.q}
              a={f.a}
              open={i === 0}
              className="relative border first:rounded-t-(--radius) last:rounded-b-(--radius)"
            />
          ))}
        </div>
        <AskLine c={c} />
      </div>
    </section>
  )
}

/** Two ruled columns: heading on one side, questions on the other (efferd faqs 2). */
export function FaqSplit({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-5xl border-y lg:border-x">
        <div className="mx-4 grid grid-cols-1 border-x md:mx-0 md:grid-cols-2 md:border-x-0">
          <div className="space-y-4 px-4 pt-12 pb-6 md:border-e">
            <h2 className="text-3xl md:text-4xl">Questions</h2>
          </div>
          <div className="place-content-center py-6 md:py-12">
            {c.faq.map((f, i) => (
              <Question
                key={f.q}
                q={f.q}
                a={f.a}
                open={i === 0}
                className="border-b first:border-t open:bg-card"
              />
            ))}
          </div>
        </div>
        {(c.phone || c.email) && (
          <div className="flex min-h-14 items-center justify-center border-t px-4 py-3">
            <AskLine c={c} className="justify-center" />
          </div>
        )}
      </div>
    </section>
  )
}

/** A large heading beside questions strung on a vertical guide line (efferd faqs 3). */
export function FaqGuide({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="mx-auto grid w-full max-w-5xl grid-cols-1 py-16 md:grid-cols-2 lg:border-x">
      <div className="px-4 pt-12 pb-6">
        <div className="space-y-5">
          <h2 className="text-4xl md:text-6xl">Questions</h2>
          <AskLine c={c} className="flex-col" />
        </div>
      </div>
      <div className="relative place-content-center">
        <div
          aria-hidden="true"
          className="bg-border pointer-events-none absolute inset-y-0 start-3 h-full w-px"
        />
        {c.faq.map((f) => (
          <div key={f.q} className="group/item relative border-b ps-5 first:border-t">
            <PlusIcon
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute start-[7.5px] -bottom-[5.5px] size-2.5 group-last/item:hidden"
            />
            <Question q={f.q} a={f.a} />
          </div>
        ))}
      </div>
    </section>
  )
}

/** A centred heading over questions in separate cards (efferd faqs 4, without the topics). */
export function FaqStack({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-24">
      <div className="flex flex-col items-center justify-center gap-4 pb-12 text-center">
        <h2 className="text-4xl md:text-5xl">Questions</h2>
        <AskLine c={c} className="justify-center" />
      </div>
      <div className="space-y-2">
        {c.faq.map((f, i) => (
          <Question
            key={f.q}
            q={f.q}
            a={f.a}
            open={i === 0}
            summaryClassName="bg-card text-card-foreground rounded-(--radius) border shadow-sm"
            answerClassName="pt-4"
          />
        ))}
      </div>
    </section>
  )
}

/** A framed column: heading, then rounded cards that lift when open (efferd faqs 5). */
export function FaqFramed({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-3xl border-y md:border-x">
        <div className="border-b px-4 py-16 lg:px-6">
          <h2 className="text-3xl md:text-4xl">Questions</h2>
        </div>
        <div className="space-y-2 px-4 py-12 lg:px-6">
          {c.faq.map((f, i) => (
            <Question
              key={f.q}
              q={f.q}
              a={f.a}
              open={i === 0}
              className="bg-card/20 open:bg-card rounded-(--radius) border shadow-sm"
              answerClassName="pt-2"
            />
          ))}
        </div>
        {(c.phone || c.email) && (
          <div className="border-t px-4 py-6 lg:px-6">
            <AskLine c={c} />
          </div>
        )}
      </div>
    </section>
  )
}
