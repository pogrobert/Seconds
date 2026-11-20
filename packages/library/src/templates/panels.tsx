// Panels: the page is a stack of full-screen sheets, one idea on each, like cards dealt on top of
// one another. Every sheet takes the next ground on a fixed ladder made from the business's
// colour (the colour, a pale tint, a deep shade, a light tint, round again), and each overlaps the
// one above it with rounded top corners, so the page reads as a deck. On every sheet the heading
// sits big at the top and the content settles at the foot. Needs no photos: the hero shows beside
// the headline and the introduction photo beside the words only when they are real; the gallery
// is a sheet of prints. For gyms, coaches, events and anything that runs in rounds.

import { Fragment, type ReactNode } from 'react'
import {
  type Extra,
  facts,
  hasVisit,
  links,
  listOf,
  offerItems,
  Pic,
  present,
  RESET,
  type Template,
  type TemplateProps,
} from './shared.tsx'

const ART = 'img[data-art],img[src^="data:image/svg"]'

const CSS = `${RESET}
:root{--fg:var(--band-foreground);--ink:color-mix(in oklab,var(--band) 28%,#111);--pale:color-mix(in oklab,var(--band) 7%,#fbfaf7);--tint:color-mix(in oklab,var(--band) 20%,#fff);--deep:color-mix(in oklab,var(--band) 58%,#0a0a0a);--w:84rem;--gut:clamp(1.25rem,4vw,3.5rem);--r:min(calc(var(--radius) * 4),2.75rem);--pad:clamp(4.5rem,9vw,7.5rem)}
body{background:var(--deep);color:var(--ink);font-size:1.0625rem;line-height:1.55}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.sheet{position:relative;min-height:100svh;display:flex;flex-direction:column;padding-block:var(--pad);border-radius:var(--r) var(--r) 0 0;--line:color-mix(in oklab,currentColor 26%,transparent);--quiet:color-mix(in oklab,currentColor 72%,transparent)}
.sheet+.sheet{margin-top:calc(-1 * var(--r))}
.sheet>.w{width:100%;flex:1;display:flex;flex-direction:column;justify-content:space-between;gap:clamp(3rem,7vw,6rem)}
.g0{background:var(--band);color:var(--fg)}
.g1{background:var(--pale);color:var(--ink)}
.g2{background:var(--deep);color:var(--fg)}
.g3{background:var(--tint);color:var(--ink)}
.sheet.open{border-radius:0;padding-top:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:1.5rem;border-bottom:1px solid var(--line)}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:1.2rem;line-height:1.25;min-width:0}
.top nav{display:flex;gap:1.75rem;font-size:.95rem;flex-shrink:0}.top nav a{text-decoration:none}.top nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.open .w{gap:0}
.open .tag{font-size:1.05rem;color:var(--quiet);max-width:40ch;padding-top:clamp(2.5rem,6vw,4.5rem)}
.open .main{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,22rem);gap:clamp(2rem,5vw,5rem);align-items:end;padding-top:clamp(3rem,8vw,6rem);margin-top:auto}
.open h1{font-size:clamp(3rem,8.4vw,8rem);line-height:.94;max-width:14ch;overflow-wrap:break-word}
.open .side{display:grid;gap:1.75rem;justify-items:start}
.open .side p{font-size:clamp(1.1rem,1.5vw,1.3rem);line-height:1.45}
.open figure img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:calc(var(--r) * .5)}
.open figure:has(${ART}),.say2 figure:has(${ART}){display:none}
.btn{display:inline-block;padding:1rem 1.75rem;border-radius:var(--button-radius);font-weight:650;text-decoration:none;font-size:1.05rem}
.g0 .btn,.g2 .btn{background:var(--fg);color:var(--band)}.g1 .btn,.g3 .btn{background:var(--band);color:var(--fg)}
h2{font-size:clamp(2.6rem,8.6vw,8.5rem);line-height:.94;max-width:14ch;overflow-wrap:break-word}
.say2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,26rem);gap:clamp(2rem,6vw,6rem);align-items:end}
.say2{margin-block:auto}.say2 p{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.6rem,3.6vw,3.25rem);line-height:1.2;max-width:26ch}
.say2 figure img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:calc(var(--r) * .5)}
.say2:has(figure ${ART}){grid-template-columns:minmax(0,1fr)}
.big p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(2.2rem,5.6vw,5.25rem);line-height:1.05;max-width:20ch;margin-block:auto}
.offer{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(2rem,5vw,5rem)}
.offer li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.3rem 1.5rem;padding-block:1.25rem;border-top:2px solid var(--line)}
.offer h3{font-size:clamp(1.3rem,2vw,1.65rem);line-height:1.2}
.offer .pr{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.3rem,2vw,1.65rem);line-height:1.2;font-variant-numeric:tabular-nums;white-space:nowrap}
.offer p{grid-column:1/-1;color:var(--quiet);max-width:46ch}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:2.5rem clamp(2rem,4vw,4rem)}
.cols li{border-top:2px solid var(--line);padding-top:1.25rem}
.cols h3{font-size:1.4rem;line-height:1.2;margin-bottom:.5rem}
.cols p{color:var(--quiet);max-width:40ch}
.n{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(3.5rem,6vw,5.5rem);line-height:.9;margin-bottom:1.25rem}
.qa{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 clamp(2rem,5vw,5rem)}
.qa div{border-top:2px solid var(--line);padding-block:1.25rem 1.75rem}
.qa h3{font-size:1.3rem;line-height:1.25;margin-bottom:.5rem}.qa p{color:var(--quiet);max-width:52ch}
.prints{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(.75rem,2vw,1.5rem);margin-block:auto}
.prints img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:calc(var(--r) * .4)}
.sheet.prints-sheet{min-height:0;border-radius:0;margin-top:calc(-1 * var(--r) - 1px);padding-top:0}
.end h2{font-size:clamp(2.6rem,7.6vw,7rem);max-width:13ch}
.end .row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(2rem,5vw,5rem);align-items:end}
.end p.sub{font-size:clamp(1.1rem,1.5vw,1.3rem);max-width:34ch;margin-bottom:1.75rem}
.end dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.5rem 2rem}
.end dt{font-size:.9rem;color:var(--quiet);margin-bottom:.2rem}.end dd{font-size:1.1rem;overflow-wrap:break-word}.end dd a{text-decoration:none;border-bottom:1px solid var(--line)}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-top:1.5rem;border-top:1px solid var(--line);font-size:.92rem;color:var(--quiet)}
@media (max-width:860px){.top nav{display:none}.sheet{min-height:0;padding-block:clamp(4rem,14vw,5.5rem) calc(clamp(4rem,14vw,5.5rem) + var(--r))}.sheet.open{min-height:92svh}.open .main,.say2,.end .row{grid-template-columns:minmax(0,1fr)}.open figure{max-width:18rem}.offer,.qa{grid-template-columns:minmax(0,1fr)}.end dl{grid-template-columns:minmax(0,1fr)}.prints{grid-template-columns:repeat(2,minmax(0,1fr))}.prints figure:nth-child(3):last-child{grid-column:1/-1}.prints figure:nth-child(3):last-child img{aspect-ratio:3/2}}`

/** One sheet; `g` is its place on the ground ladder. */
function Sheet(p: { g: number; className?: string; id?: string; children: ReactNode }) {
  return (
    <section className={`sheet g${p.g % 4}${p.className ? ` ${p.className}` : ''}`} id={p.id}>
      <div className="w">{p.children}</div>
    </section>
  )
}

function Extras({ c, x, g }: { c: TemplateProps['c']; x: Extra; g: number }) {
  if (x === 'statement')
    return (
      <Sheet g={g} className="big">
        <p>{c.statement}</p>
      </Sheet>
    )
  if (x === 'faq')
    return (
      <Sheet g={g} id="questions">
        <h2>Questions</h2>
        <div className="qa">
          {c.faq?.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </Sheet>
    )
  if (x === 'gallery')
    return (
      <section className={`sheet prints-sheet g${g % 4} strip`}>
        <div className="w">
          <div className="prints three">
            <figure>
              <Pic photo={c.photos.d1} />
            </figure>
            <figure>
              <Pic photo={c.photos.d2} />
            </figure>
            <figure>
              <Pic photo={c.photos.cta} />
            </figure>
          </div>
        </div>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <Sheet g={g}>
      <h2>{l.title}</h2>
      <ol className="cols">
        {l.items.map((it, n) => (
          <li key={it.title}>
            {x === 'steps' && <span className="n">{n + 1}</span>}
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </li>
        ))}
      </ol>
    </Sheet>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = f.find((x) => x.href)
  const offer = offerItems(c)
  // The ladder: opening 0, introduction 1, offer 2, then the extras in turn. The gallery takes no
  // step of its own: its prints hang at the foot of the sheet before it, which keeps the ladder
  // whole when it hides for want of real photos.
  let step = offer.length ? 2 : 1
  const steps = xs.map((x) => (x === 'gallery' ? step : ++step))
  // The closing is always a dark sheet: deep, or the colour itself after a deep one.
  const close = step % 4 === 2 ? 0 : 2
  return (
    <>
      <header className="sheet g0 open">
        <div className="w">
          <div className="top">
            <b>{c.name}</b>
            <nav>
              {links(c, extras).map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
          <p className="tag">{c.tagline}</p>
          <div className="main">
            <h1>{c.headline}</h1>
            <div className="side">
              <figure>
                <Pic photo={c.photos.hero} eager />
              </figure>
              <p>{c.subhead}</p>
              <a className="btn" href="#visit">
                {c.cta.label}
              </a>
            </div>
          </div>
        </div>
      </header>
      <main>
        <Sheet g={1}>
          <div className="say2">
            <p>{c.about}</p>
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
          </div>
        </Sheet>
        {offer.length > 0 && (
          <Sheet g={2} id="offer">
            <h2>{c.offerTitle}</h2>
            <ul className="offer">
              {offer.map((it) => (
                <li key={it.name}>
                  <h3>{it.name}</h3>
                  {it.price ? <span className="pr">{it.price}</span> : <span />}
                  {it.detail && <p>{it.detail}</p>}
                </li>
              ))}
            </ul>
          </Sheet>
        )}
        {xs.map((x, i) => (
          <Fragment key={x}>
            <Extras c={c} x={x} g={steps[i] ?? 0} />
          </Fragment>
        ))}
      </main>
      <footer className={`sheet end g${close}`} id="visit">
        <div className="w">
          <h2>{c.cta.headline}</h2>
          <div className="row">
            <div>
              <p className="sub">{c.cta.subhead}</p>
              {reach && (
                <a className="btn" href={reach.href}>
                  {c.cta.label}
                </a>
              )}
            </div>
            {hasVisit(c) && (
              <dl>
                {f.map((x) => (
                  <div key={x.label}>
                    <dt>{x.label}</dt>
                    <dd>{x.href ? <a href={x.href}>{x.value}</a> : x.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div className="foot">
            <span>{c.name}</span>
            <span>{c.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export const panels: Template = {
  id: 'panels',
  label: 'Panels',
  text: "A stack of full-screen sheets dealt one over another, each in its own shade of the organisation's colour from pale tint to deep, one idea per sheet with a big heading at the top and the detail at the foot: energetic, clear and paced like a set of rounds, for gyms, coaches, personal trainers, classes and events.",
  dark: false,
  css: CSS,
  Page,
}
