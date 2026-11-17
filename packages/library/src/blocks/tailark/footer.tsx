// Page feet. Adapted from Tailark (MIT, see ../../../NOTICE.md): Mist footer one, two and three;
// Veil footer one to six; Dusk footer one and two. Product, legal and social link lists, newsletter
// forms, theme switchers and "AI summary" buttons are removed; the columns hold the business's own
// pages, hours and contact details, and only what the owner gave.

import { type BlockProps, Container, cx } from '../../ui.tsx'
import { ContactLines, HoursList, Links, Nav2, Wordmark } from './parts.tsx'

const year = () => new Date().getFullYear()
const Copy = (p: BlockProps & { className?: string }) => (
  <p className={cx('text-muted-foreground text-sm', p.className)}>
    © {year()} {p.c.name}
  </p>
)

/** Columns of what a visitor looks for: pages, hours, contact. */
function Columns(p: BlockProps & { heading: string }) {
  const { c } = p
  return (
    <>
      <div>
        <h3 className={p.heading}>{c.name}</h3>
        <Links c={c} className="mt-4 space-y-4 text-sm" />
      </div>
      {c.hours.length > 0 && (
        <div>
          <h3 className={p.heading}>Hours</h3>
          <HoursList c={c} className="text-muted-foreground mt-4 space-y-4 text-sm" />
        </div>
      )}
      {(c.phone || c.email || c.address.length > 0) && (
        <div>
          <h3 className={p.heading}>Visit</h3>
          <ContactLines c={c} className="text-muted-foreground mt-4 space-y-4 text-sm" />
        </div>
      )}
    </>
  )
}

/** Centred name, links, contact line and copyright on a quiet band (Mist, footer one). */
export function FooterMistOne({ c }: BlockProps) {
  return (
    <footer className="bg-muted py-16">
      <Container className="text-center">
        <Wordmark c={c} className="mx-auto block w-fit" />
        <Nav2 c={c} className="my-8 justify-center gap-6 text-base" />
        <ContactLines
          c={c}
          className="text-muted-foreground my-8 flex flex-wrap justify-center gap-6 text-sm"
        />
        <Copy c={c} />
      </Container>
    </footer>
  )
}

/** Name on the left, columns on the right, a ruled line with copyright below (Mist, two). */
export function FooterMistTwo({ c }: BlockProps) {
  return (
    <footer className="bg-background border-b pt-20">
      <Container>
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Wordmark c={c} />
            <p className="text-muted-foreground mt-4 max-w-xs text-sm">{c.tagline}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 md:col-span-3">
            <Columns c={c} heading="block font-medium" />
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
          <Copy c={c} />
          <Nav2 c={c} className="gap-6" />
        </div>
      </Container>
    </footer>
  )
}

/** Name and contact on the left, hours and links as columns on the right (Mist, footer three). */
export function FooterMistThree({ c }: BlockProps) {
  return (
    <footer className="bg-background border-b py-8 sm:py-20">
      <Container>
        <div className="grid gap-12 md:grid-cols-5">
          <div className="space-y-6 md:col-span-2">
            <Wordmark c={c} />
            <ContactLines c={c} />
            <Copy c={c} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:col-span-3">
            <div className="space-y-4">
              <span className="block font-medium">{c.offerTitle}</span>
              <Links c={c} className="flex flex-wrap gap-4 text-sm sm:flex-col" />
            </div>
            {c.hours.length > 0 && (
              <div className="space-y-4">
                <span className="block font-medium">Hours</span>
                <HoursList c={c} className="text-muted-foreground space-y-2 text-sm" />
              </div>
            )}
          </div>
        </div>
      </Container>
    </footer>
  )
}

/** Name and tagline, then columns, then copyright and contact on a rule (Veil, footer one). */
export function FooterVeilOne({ c }: BlockProps) {
  return (
    <footer className="bg-background @container border-t py-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="grid grid-cols-2 gap-8 @sm:grid-cols-3">
          <div className="col-span-full">
            <Wordmark c={c} className="text-lg" />
            <p className="text-muted-foreground mt-4 max-w-xs text-sm">{c.tagline}</p>
          </div>
          <Columns c={c} heading="text-foreground mb-3 text-sm font-medium" />
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8">
          <Copy c={c} />
        </div>
      </div>
    </footer>
  )
}

/** Centred: name, links, contact, copyright (Veil, footer two). */
export function FooterVeilTwo({ c }: BlockProps) {
  return (
    <footer className="bg-background @container border-t py-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        <Wordmark c={c} className="text-lg" />
        <Nav2 c={c} className="mt-8 justify-center gap-x-6" />
        <ContactLines
          c={c}
          className="text-muted-foreground mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm"
        />
        <Copy c={c} className="mt-8" />
      </div>
    </footer>
  )
}

/** Name and links in a ruled band, copyright and contact beneath (Veil, footer three). */
export function FooterVeilThree({ c }: BlockProps) {
  return (
    <footer className="bg-background @container py-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="border-y py-8">
          <div className="flex flex-col gap-6 @xl:flex-row @xl:items-center">
            <Wordmark c={c} className="text-lg" />
            <Nav2 c={c} className="gap-x-6 @xl:ml-auto" />
          </div>
        </div>
        <div className="flex flex-col-reverse gap-4 pt-8 @xl:flex-row @xl:justify-between">
          <Copy c={c} />
          <ContactLines c={c} className="text-muted-foreground flex flex-wrap gap-4 text-sm" />
        </div>
      </div>
    </footer>
  )
}

/** Name, tagline and contact above a rule, links, then copyright (Veil, footer four). */
export function FooterVeilFour({ c }: BlockProps) {
  return (
    <footer className="bg-background @container border-t py-12">
      <div className="mx-auto grid max-w-3xl gap-8 px-6">
        <div className="border-b pb-8">
          <Wordmark c={c} className="text-lg" />
          <p className="text-muted-foreground mt-4 max-w-xs text-sm">{c.tagline}</p>
          <ContactLines c={c} className="text-muted-foreground mt-6 space-y-1 text-sm" />
        </div>
        <Nav2 c={c} className="gap-x-8 gap-y-3" />
        <div className="border-t pt-8">
          <Copy c={c} />
        </div>
      </div>
    </footer>
  )
}

/** A small stack: name, a row of links, copyright on a rule (Veil, footer five). */
export function FooterVeilFive({ c }: BlockProps) {
  return (
    <footer className="bg-background py-12">
      <div className="mx-auto flex max-w-2xl flex-col px-6">
        <Wordmark c={c} className="text-lg" />
        <Nav2 c={c} className="my-8" />
        <Copy c={c} className="mt-2 border-t pt-6" />
      </div>
    </footer>
  )
}

/** A small stack with the links in a column and contact beside, dashed rule (Veil, footer six). */
export function FooterVeilSix({ c }: BlockProps) {
  return (
    <footer className="bg-background py-12">
      <div className="mx-auto flex max-w-2xl flex-col px-6">
        <Wordmark c={c} className="text-lg" />
        <div className="my-8 flex flex-wrap justify-between gap-8">
          <Links c={c} className="flex flex-col gap-y-4 text-sm" />
          <ContactLines c={c} className="text-muted-foreground space-y-4 text-sm sm:text-end" />
        </div>
        <Copy c={c} className="border-foreground/10 mt-2 border-t border-dashed pt-6" />
      </div>
    </footer>
  )
}

/** A tall foot: the name, then columns, copyright far below (Dusk, footer one). */
export function FooterDuskOne({ c }: BlockProps) {
  return (
    <footer>
      <Container wide className="space-y-16 pb-16 pt-24 md:pt-32">
        <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:grid-cols-4 lg:grid-cols-5">
          <div className="max-lg:col-span-full lg:col-span-2">
            <Wordmark c={c} className="text-2xl" />
          </div>
          <Columns c={c} heading="text-sm font-medium" />
        </div>
        <Copy c={c} />
      </Container>
    </footer>
  )
}

/** The name wide across half, columns beside, a ruled foot with tagline (Dusk, footer two). */
export function FooterDuskTwo({ c }: BlockProps) {
  return (
    <footer>
      <Container wide className="space-y-16 pb-6 pt-24 md:pt-32">
        <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-full lg:col-span-3">
            <Wordmark c={c} className="text-4xl md:text-5xl" />
          </div>
          <Columns c={c} heading="text-foreground text-sm" />
        </div>
        <div className="mt-24 grid gap-x-3 gap-y-6 border-t pt-6 sm:grid-cols-2">
          <p className="text-muted-foreground text-sm">{c.tagline}</p>
          <Copy c={c} className="sm:text-end" />
        </div>
      </Container>
    </footer>
  )
}
