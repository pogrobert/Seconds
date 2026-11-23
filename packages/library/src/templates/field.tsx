// Field: the first screen is a field of the business's own colour, the name and promise set large
// on it, one tall photo hanging over its lower edge into the page. Below, every section hangs its
// heading in a left column and its content in a right one, on one 12-column grid and one width.
// Photos are all 4:5 portraits, used once each. For studios, cafés, salons, clinics, makers.

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
  reachOf,
  type Template,
  type TemplateProps,
} from './shared.tsx'

const CSS = `${RESET}
:root{--fld:var(--band);--on-fld:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 4%,#fff);--soft:color-mix(in oklab,var(--band) 9%,#fff);--line:color-mix(in oklab,var(--band) 22%,#fff);--ink:color-mix(in oklab,var(--band) 22%,#161616);--quiet:color-mix(in oklab,var(--ink) 66%,var(--paper));--w:76rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4.5rem,9vw,8rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.g{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:clamp(1rem,2.5vw,2.5rem)}
.fld{background:var(--fld);color:var(--on-fld)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:1.4rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.25rem;letter-spacing:var(--heading-tracking)}
.top nav{display:flex;gap:1.75rem;font-size:.95rem}.top nav a{text-decoration:none;opacity:.85}.top nav a:hover{opacity:1;text-decoration:underline;text-underline-offset:.3em}
.hero{padding-block:clamp(3rem,8vw,7rem) 0}
.hero .copy{grid-column:1/span 7;padding-bottom:clamp(3rem,7vw,6rem);align-self:end}
.hero .tag{font-size:1rem;opacity:.8;margin-bottom:1.5rem}
.hero h1{font-size:clamp(2.75rem,6.4vw,5.75rem);line-height:1.02;margin-bottom:1.75rem}
.hero p.sub{font-size:clamp(1.1rem,1.6vw,1.3rem);max-width:34ch;opacity:.92;margin-bottom:2.25rem}
.hero .pic{grid-column:9/span 4;margin-bottom:calc(-1 * clamp(5rem,10vw,9rem));position:relative}
.pic img,.pair img,.gal img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:calc(var(--radius) * .5)}
.btn{display:inline-block;padding:.95rem 1.6rem;border-radius:var(--button-radius);font-weight:600;text-decoration:none;font-size:1rem}
.fld .btn{background:var(--on-fld);color:var(--fld)}
.paper .btn{background:var(--fld);color:var(--on-fld)}
.sec{padding-block:var(--sec)}
.sec+.sec{border-top:1px solid var(--line)}
.lead{grid-column:1/span 8;font-family:var(--font-heading);font-size:clamp(1.45rem,2.4vw,2rem);line-height:1.35;letter-spacing:var(--heading-tracking)}
.first{padding-top:calc(var(--sec) + clamp(5rem,10vw,9rem) * .6)}
.hang{grid-column:1/span 4}
.hang h2{font-size:clamp(1.75rem,3vw,2.5rem);line-height:1.1;position:sticky;top:2rem}
.body{grid-column:5/span 8}
.rows>li{display:grid;grid-template-columns:1fr auto;gap:.35rem 2rem;padding-block:1.4rem;border-top:1px solid var(--line)}
.rows>li:last-child{border-bottom:1px solid var(--line)}
.rows h3{font-size:1.35rem;line-height:1.25}
.rows .price{font-variant-numeric:tabular-nums;font-size:1.15rem;font-family:var(--font-heading)}
.rows p{grid-column:1/-1;color:var(--quiet);max-width:52ch}
.pair{grid-column:1/-1;display:grid;grid-template-columns:5fr 4fr;gap:clamp(1rem,2.5vw,2.5rem);align-items:start}
.pair figure:last-child{margin-top:clamp(4rem,9vw,8rem)}
.cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2.5rem 2.5rem}
.cols h3{font-size:1.3rem;line-height:1.25;margin-bottom:.6rem}
.cols p{color:var(--quiet)}
.n{display:block;font-family:var(--font-heading);font-size:2.25rem;line-height:1;color:var(--fld);margin-bottom:1rem}
.say{background:var(--soft)}
.say p{grid-column:2/span 10;font-family:var(--font-heading);font-size:clamp(1.9rem,4vw,3.4rem);line-height:1.15;letter-spacing:var(--heading-tracking);text-wrap:balance}
.faq details{border-top:1px solid var(--line);padding-block:1.25rem}.faq details:last-child{border-bottom:1px solid var(--line)}
.faq summary{font-family:var(--font-heading);font-size:1.25rem;display:flex;justify-content:space-between;gap:1rem}
.faq summary::after{content:"+";color:var(--fld);font-size:1.4rem;line-height:1}.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.75rem;max-width:60ch}
.gal{grid-column:1/-1;display:grid;grid-template-columns:4fr 5fr;gap:clamp(1rem,2.5vw,2.5rem);align-items:start}
.gal figure:first-child{margin-top:clamp(4rem,9vw,8rem)}
.end{padding-block:var(--sec)}
.end .say2{grid-column:1/span 7}
.end h2{font-size:clamp(2.25rem,5vw,4.25rem);line-height:1.05;margin-bottom:1.5rem}
.end p.sub{opacity:.9;max-width:40ch;margin-bottom:2.25rem;font-size:1.15rem}
.end dl{grid-column:9/span 4;display:grid;gap:1.25rem;align-content:start}
.end dt{font-size:.9rem;opacity:.75}.end dd{font-size:1.1rem}
.end dd a{text-decoration:none;border-bottom:1px solid currentColor}
.foot{padding-block:2.5rem;display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;font-size:.9rem;opacity:.8;border-top:1px solid color-mix(in oklab,var(--on-fld) 25%,transparent)}
@media (max-width:860px){.g{grid-template-columns:minmax(0,1fr)}.g>*{grid-column:1/-1!important}.hero .pic{margin-bottom:-4rem;max-width:22rem}.first{padding-top:calc(var(--sec) + 3rem)}.hang h2{position:static;margin-bottom:1.75rem}.cols{grid-template-columns:1fr}.pair,.gal{grid-template-columns:1fr 1fr}.end dl{margin-top:2.5rem}.top nav{display:none}.say p{font-size:1.75rem}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say">
        <div className="w g">
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="w g">
          <div className="hang">
            <h2>Questions</h2>
          </div>
          <div className="body faq">
            {c.faq?.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="w g">
          <div className="gal">
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
    <section className="sec">
      <div className="w g">
        <div className="hang">
          <h2>{l.title}</h2>
        </div>
        <ol className="body cols">
          {l.items.map((it, i) => (
            <li key={it.title}>
              {x === 'steps' && <span className="n">{i + 1}</span>}
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
  return (
    <>
      <div className="fld">
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
        <header className="w g hero">
          <div className="copy">
            <p className="tag">{c.tagline}</p>
            <h1>{c.headline}</h1>
            <p className="sub">{c.subhead}</p>
            <a className="btn" href="#visit">
              {c.cta.label}
            </a>
          </div>
          <figure className="pic">
            <Pic photo={c.photos.hero} eager />
          </figure>
        </header>
      </div>
      <main className="paper">
        <section className="sec first">
          <div className="w g">
            <p className="lead">{c.about}</p>
          </div>
        </section>
        <section className="sec" id="offer">
          <div className="w g">
            <div className="hang">
              <h2>{c.offerTitle}</h2>
            </div>
            <ul className="body rows">
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
        <section className="sec">
          <div className="w g">
            <div className="pair">
              <figure>
                <Pic photo={c.photos.about} />
              </figure>
              <figure>
                <Pic photo={c.photos.d1} />
              </figure>
            </div>
          </div>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="fld" id="visit">
        <div className="w g end">
          <div className="say2">
            <h2>{c.cta.headline}</h2>
            <p className="sub">{c.cta.subhead}</p>
            {reachOf(f)?.href ? (
              <a className="btn" href={reachOf(f)?.href}>
                {c.cta.label}
              </a>
            ) : null}
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
        <div className="w foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const field: Template = {
  id: 'field',
  label: 'Field',
  text: "The first screen filled with the organisation's own colour, its promise set large, one tall photo hanging over the edge; below, calm sections on a pale page with headings on the left: warm, personal and quietly confident, for studios, cafés, salons, clinics and makers.",
  dark: false,
  css: CSS,
  Page,
}
