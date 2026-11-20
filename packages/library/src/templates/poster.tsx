// Poster: loud and confident. The promise is set enormous on a block of the business's own colour,
// a photo strip runs edge to edge under it, and the offer is a list of big names and prices
// between heavy rules. The page alternates two grounds only, the colour and a near-white, so it
// reads like a printed poster. For gyms, barbers, trades and anything with some attitude.

import { Fragment } from 'react'
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

const CSS = `${RESET}
:root{--col:var(--band);--on-col:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 5%,#f6f5f2);--ink:color-mix(in oklab,var(--band) 25%,#121212);--quiet:color-mix(in oklab,var(--ink) 66%,var(--paper));--w:84rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4rem,9vw,8rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.55}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.col{background:var(--col);color:var(--on-col)}
.top{display:flex;justify-content:space-between;align-items:center;gap:1.5rem;padding-block:1.4rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.35rem;letter-spacing:var(--heading-tracking)}
.top nav{display:flex;gap:1.75rem;font-weight:600;font-size:.95rem}.top nav a{text-decoration:none}.top nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.hero{padding-block:clamp(3rem,8vw,7rem) clamp(3rem,6vw,5rem)}
.hero h1{font-size:clamp(3.2rem,10.5vw,9.5rem);line-height:.92;letter-spacing:calc(var(--heading-tracking) - .01em);max-width:13ch;margin-bottom:clamp(2rem,4vw,3rem);overflow-wrap:anywhere}
.hero .under{display:flex;justify-content:space-between;align-items:end;gap:2rem;flex-wrap:wrap}
.hero p.sub{font-size:clamp(1.15rem,1.7vw,1.4rem);max-width:36ch}
.btn{display:inline-block;padding:1.05rem 1.9rem;border-radius:var(--button-radius);font-weight:700;text-decoration:none;font-size:1.05rem}
.col .btn{background:var(--on-col);color:var(--col)}
.paper .btn,.btn.ink{background:var(--ink);color:var(--paper)}
.strip{display:grid;grid-template-columns:2fr 1fr}
.strip img{width:100%;height:100%;aspect-ratio:4/3;object-fit:cover}
.strip figure:first-child img{aspect-ratio:auto;min-height:100%}
.sec{padding-block:var(--sec)}
h2{font-size:clamp(2.2rem,5vw,4.25rem);line-height:.98;margin-bottom:clamp(2rem,4vw,3rem);max-width:16ch}
.about{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(2rem,5vw,5rem);align-items:start}
.about p{font-size:clamp(1.25rem,2vw,1.6rem);line-height:1.45}
.about img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius)}
.big li{display:grid;grid-template-columns:1fr auto;gap:.4rem 2rem;padding-block:clamp(1.1rem,2vw,1.6rem);border-top:3px solid var(--ink)}
.big li:last-child{border-bottom:3px solid var(--ink)}
.big h3{font-size:clamp(1.5rem,3vw,2.4rem);line-height:1.05}
.big .price{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.5rem,3vw,2.4rem);font-variant-numeric:tabular-nums;line-height:1.05}
.big p{grid-column:1/-1;color:var(--quiet);max-width:56ch}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:2rem clamp(1.5rem,3vw,3rem)}
.cols li{border-top:3px solid currentColor;padding-top:1.1rem}
.cols h3{font-size:1.45rem;line-height:1.1;margin-bottom:.5rem}
.col .cols p{opacity:.85}.paper .cols p{color:var(--quiet)}
.n{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:3.5rem;line-height:1;margin-bottom:.5rem}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(2.2rem,5.5vw,4.75rem);line-height:1;letter-spacing:var(--heading-tracking);max-width:18ch}
.qa{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2rem clamp(2rem,5vw,4rem)}
.qa div{border-top:3px solid var(--ink);padding-top:1rem}.qa h3{font-size:1.3rem;line-height:1.2;margin-bottom:.4rem}.qa p{color:var(--quiet)}
.end h2{font-size:clamp(2.6rem,8vw,7rem);line-height:.92;max-width:14ch}
.end .row{display:flex;justify-content:space-between;gap:2rem;flex-wrap:wrap;align-items:end}
.end p.sub{font-size:1.2rem;max-width:36ch;margin-bottom:1.75rem}
.end dl{display:grid;gap:1rem;min-width:16rem}
.end dt{font-size:.9rem;opacity:.75}.end dd{font-size:1.25rem;font-weight:700}.end dd a{text-decoration:none}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-block:1.6rem;border-top:2px solid color-mix(in oklab,var(--on-col) 35%,transparent);font-weight:600;font-size:.92rem}
@media (max-width:860px){.top nav{display:none}.about,.qa{grid-template-columns:1fr}.strip{grid-template-columns:1fr}}`

function Extras({ c, x, i }: { c: TemplateProps['c']; x: Extra; i: number }) {
  // Grounds alternate down the page: colour, paper, colour.
  const ground = i % 2 === 0 ? 'col' : 'paper'
  if (x === 'statement')
    return (
      <section className={`sec say ${ground}`}>
        <div className="w">
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec paper" id="questions">
        <div className="w">
          <h2>Questions</h2>
          <div className="qa">
            {c.faq?.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="strip">
        <figure>
          <Pic photo={c.photos.d2} />
        </figure>
        <figure>
          <Pic photo={c.photos.cta} />
        </figure>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className={`sec ${ground}`}>
      <div className="w">
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
      </div>
    </section>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = f.find((x) => x.href)
  return (
    <>
      <div className="col">
        <div className="w top">
          <b>{c.name}</b>
          <nav>
            {links(c, extras).map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <header className="w hero">
          <h1>{c.headline}</h1>
          <div className="under">
            <p className="sub">{c.subhead}</p>
            <a className="btn" href="#visit">
              {c.cta.label}
            </a>
          </div>
        </header>
      </div>
      <section className="strip">
        <figure>
          <Pic photo={c.photos.hero} eager />
        </figure>
        <figure>
          <Pic photo={c.photos.d1} />
        </figure>
      </section>
      <main>
        <section className="sec paper" id="offer">
          <div className="w">
            <h2>{c.offerTitle}</h2>
            <ul className="big">
              {offerItems(c).map((it) => (
                <li key={it.name}>
                  <h3>{it.name}</h3>
                  {it.price ? <span className="price">{it.price}</span> : <span />}
                  {it.detail && <p>{it.detail}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="sec paper">
          <div className="w about">
            <p>{c.about}</p>
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
          </div>
        </section>
        {xs.map((x, i) => (
          <Fragment key={x}>
            <Extras c={c} x={x} i={i} />
          </Fragment>
        ))}
      </main>
      <footer className="col" id="visit">
        <div className="w sec end">
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
        </div>
        <div className="w foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const poster: Template = {
  id: 'poster',
  label: 'Poster',
  text: "Loud and confident like a printed poster: the promise set enormous on a block of the organisation's own colour, photos edge to edge, the offer as big names and prices between heavy rules, colour and near-white alternating: bold, energetic and direct, for gyms, barbers, trades and places with attitude.",
  dark: false,
  css: CSS,
  Page,
}
