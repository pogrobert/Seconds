// Questions and answers. Adapted from Tailark (MIT, see ../../../NOTICE.md): Mist faqs one, two and
// three, Veil faqs one, two and four, Dusk faqs one. The accordions open without script
// (<details>); "contact support" lines become the business's own phone and email.

import { type BlockProps, Container } from '../../ui.tsx'
import { AskMore, Question } from './parts.tsx'

/** A card of questions on a quiet band (Mist, faqs one). */
export function FaqMistOne({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="bg-muted py-16 md:py-24">
      <Container>
        <h2 className="text-4xl">Questions</h2>
        <div className="mt-12">
          <div className="bg-card text-card-foreground w-full divide-y divide-dotted rounded-(--radius) px-8 py-3 shadow ring-1 ring-foreground/5">
            {c.faq.map((f) => (
              <Question key={f.q} q={f.q} a={f.a} answerClassName="text-base" />
            ))}
          </div>
          <AskMore c={c} />
        </div>
      </Container>
    </section>
  )
}

/** Heading on the left, questions ruled on the right (Mist, faqs two). */
export function FaqMistTwo({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="py-16 md:py-24">
      <Container className="grid gap-8 md:grid-cols-5 md:gap-12">
        <div className="md:col-span-2">
          <h2 className="text-4xl">Questions</h2>
          <AskMore c={c} className="text-muted-foreground mt-6" />
        </div>
        <div className="divide-y border-b md:col-span-3">
          {c.faq.map((f) => (
            <Question key={f.q} q={f.q} a={f.a} answerClassName="text-base" />
          ))}
        </div>
      </Container>
    </section>
  )
}

/** Centred heading, rounded rows that tint when open (Mist, faqs three). */
export function FaqMistThree({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl space-y-12 px-6">
        <h2 className="text-center text-4xl">Questions</h2>
        <div className="-mx-2 sm:mx-0">
          {c.faq.map((f) => (
            <div key={f.q} className="group/row">
              <Question
                q={f.q}
                a={f.a}
                className="open:bg-muted rounded-xl px-5 py-1 md:px-7"
                answerClassName="text-base"
              />
              <hr className="mx-5 group-last/row:hidden md:mx-7" />
            </div>
          ))}
        </div>
        <AskMore c={c} className="text-muted-foreground text-center" />
      </div>
    </section>
  )
}

/** Centred serif heading over one outlined card of questions (Veil, faqs one). */
export function FaqVeilOne({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-balance text-center text-4xl">Questions</h2>
        <div className="mt-12 rounded-xl border p-2">
          {c.faq.map((f) => (
            <Question
              key={f.q}
              q={f.q}
              a={f.a}
              className="px-4"
              summaryClassName="text-sm"
              answerClassName="text-muted-foreground text-sm"
            />
          ))}
        </div>
        <AskMore c={c} className="text-muted-foreground mt-6 text-center text-sm" />
      </div>
    </section>
  )
}

/** A narrow heading column beside dashed rows (Veil, faqs two). */
export function FaqVeilTwo({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex flex-col gap-8 @xl:flex-row @xl:items-start @xl:gap-12">
          <div className="shrink-0 @xl:sticky @xl:top-24 @xl:w-64">
            <h2 className="text-3xl">Questions</h2>
            <AskMore c={c} className="text-muted-foreground mt-6 text-sm" />
          </div>
          <div className="flex-1 divide-y divide-dashed border-b border-dashed">
            {c.faq.map((f) => (
              <Question
                key={f.q}
                q={f.q}
                a={f.a}
                summaryClassName="text-sm"
                answerClassName="text-muted-foreground text-sm"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Every answer open, in soft cards two across (Veil, faqs four). */
export function FaqVeilFour({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-balance text-center text-4xl">Questions</h2>
        <div className="mt-12 grid gap-3 @lg:grid-cols-2">
          {c.faq.map((f) => (
            <div key={f.q} className="bg-foreground/5 border-foreground/5 rounded-xl border p-5">
              <h3 className="text-foreground text-sm font-medium">{f.q}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{f.a}</p>
            </div>
          ))}
        </div>
        <AskMore c={c} className="text-muted-foreground mt-8 text-center text-sm" />
      </div>
    </section>
  )
}

/** Heading on the left, dashed rows on the right, wide (Dusk, faqs one). */
export function FaqDuskOne({ c }: BlockProps) {
  if (!c.faq?.length) return null
  return (
    <section className="py-16 md:py-24">
      <Container wide>
        <div className="grid gap-12 md:grid-cols-2 md:gap-6">
          <h2 className="max-w-sm text-balance text-4xl">Questions</h2>
          <div>
            <div className="divide-y divide-dashed border-b border-dashed">
              {c.faq.map((f) => (
                <Question key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
            <AskMore c={c} />
          </div>
        </div>
      </Container>
    </section>
  )
}
