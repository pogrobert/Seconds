// Velvet: a jewel case at night. A deep, almost black ground with ivory type and wide, unhurried
// spacing; the business's colour turns into brass: thin rules, a small cut gem where each section
// begins, the prices, and one filled button. All the boldness is in the opening: the headline set
// large beside a tall portrait held in a fine brass frame that stands off the picture. With no
// photo the frame holds the name's initial as a monogram on a velvet panel of the brand colour.
// Below, headings hang on the left and words sit on the right; the offer reads like a jeweller's
// price cards in two columns. For cocktail bars, jewellers, perfumers, whisky bars and barbers.

import { Fragment } from 'react'
import {
  type Extra,
  FactRows,
  FaqList,
  facts,
  hasVisit,
  ListItems,
  links,
  listOf,
  NavLinks,
  offerItems,
  Pic,
  present,
  RESET,
  reachOf,
  type Template,
  type TemplateProps,
} from './shared.tsx'

const ART = ':is(img[data-art],img[src^="data:image/svg"])'

const CSS = `${RESET}
:root{color-scheme:dark;--ground:color-mix(in oklab,var(--band) 7%,#0c0b0a);--velvet:color-mix(in oklab,var(--band) 42%,#0a0908);--ink:color-mix(in oklab,var(--band) 4%,#efe9df);--quiet:color-mix(in oklab,var(--ink) 62%,var(--ground));--acc:color-mix(in oklab,var(--band) 38%,#e4cf9f);--gem:color-mix(in oklab,var(--band) 62%,#f2dfb4);--brass:color-mix(in oklab,var(--acc) 42%,var(--ground));--line:color-mix(in oklab,var(--ink) 11%,var(--ground));--w:74rem;--gut:clamp(1.25rem,4.5vw,3.5rem);--sec:clamp(5rem,10vw,9.5rem);--off:clamp(.6rem,1.2vw,1rem)}
body{background:var(--ground);color:var(--ink);font-size:1.0625rem;line-height:1.75}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.g{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:clamp(1rem,2.5vw,2.5rem)}
.top{display:flex;justify-content:space-between;align-items:center;gap:1.5rem;padding-block:1.6rem;border-bottom:1px solid var(--line)}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.15rem;line-height:1.2}
.top nav{display:flex;gap:2.25rem;font-size:.9rem;letter-spacing:.05em}.top nav a{text-decoration:none;color:var(--quiet)}.top nav a:hover{color:var(--acc)}
.hero{display:grid;grid-template-columns:minmax(0,13fr) minmax(0,10fr);gap:clamp(2.5rem,6vw,6.5rem);align-items:center;padding-block:clamp(3.5rem,8vw,7rem) var(--sec)}
.tag{display:flex;align-items:center;gap:1rem;color:var(--acc);font-size:.98rem;letter-spacing:.04em;margin-bottom:clamp(1.75rem,3vw,2.5rem)}
.tag::before{content:"";flex:none;width:2.75rem;height:1px;background:var(--acc)}
.hero h1{font-size:clamp(2.7rem,5.8vw,5.4rem);line-height:1.04;margin-bottom:clamp(1.5rem,3vw,2.25rem)}
.hero .sub{color:var(--quiet);font-size:clamp(1.08rem,1.5vw,1.25rem);max-width:36ch;margin-bottom:clamp(2.25rem,4vw,3rem)}
.btn{display:inline-block;padding:1rem 2rem;border-radius:var(--button-radius);background:var(--acc);color:var(--ground);font-weight:600;letter-spacing:.03em;text-decoration:none}
.btn:hover{background:var(--ink)}
.frame{position:relative;margin:var(--off);outline:1px solid var(--brass);outline-offset:var(--off)}
.frame img{width:100%;aspect-ratio:3/4;object-fit:cover}
.mono{display:none}
.frame:has(${ART}) img{display:none}
.frame:has(${ART}) .mono{display:grid;place-items:center;aspect-ratio:3/4;background:var(--velvet);color:var(--acc);font-family:var(--font-heading);font-weight:var(--heading-weight);text-transform:var(--heading-case);font-size:clamp(8rem,17vw,15rem);line-height:1}
.sec{padding-block:var(--sec)}
.sec+.sec,.pair+.sec,main>.sec:first-child{padding-top:0}
.mark{grid-column:1/-1;display:flex;align-items:center;gap:1rem;margin-bottom:clamp(2.75rem,5vw,4.5rem)}
.mark::before{content:"";flex:none;width:.5rem;height:.5rem;background:var(--gem);transform:rotate(45deg)}
.mark::after{content:"";flex:1;height:1px;background:var(--brass)}
.gem{width:.5rem;height:.5rem;background:var(--gem);transform:rotate(45deg);margin:0 auto clamp(2.25rem,4vw,3rem)}
.hang{grid-column:1/span 4}
.hang h2{font-size:clamp(1.7rem,2.8vw,2.4rem);line-height:1.15;max-width:14ch}
.body{grid-column:5/-1}
.lead{grid-column:4/-1;font-family:var(--font-heading);font-size:clamp(1.35rem,2.3vw,1.9rem);line-height:1.5;letter-spacing:var(--heading-tracking);max-width:34ch}
.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(2rem,4vw,4rem)}
.cards li{padding-block:1.6rem 1.9rem;border-top:1px solid var(--line)}
.cards h3{font-size:clamp(1.2rem,1.7vw,1.4rem);line-height:1.3}
.cards .price{display:block;margin-top:.4rem;color:var(--acc);font-variant-numeric:tabular-nums;letter-spacing:.06em;font-size:.95rem}
.cards p{color:var(--quiet);margin-top:.6rem;font-size:.98rem;max-width:40ch}
.n{display:block;color:var(--acc);font-family:var(--font-heading);font-size:1.05rem;letter-spacing:.06em;font-variant-numeric:tabular-nums;margin-bottom:.6rem}
.pair{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:clamp(1rem,3vw,3rem);align-items:end;padding-bottom:var(--sec)}
.pair img{width:100%;aspect-ratio:4/3;object-fit:cover}
.pair figure:last-child img{aspect-ratio:4/5}
.gal{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,7fr);gap:clamp(1rem,3vw,3rem);align-items:start}
.gal img{width:100%;aspect-ratio:4/5;object-fit:cover}
.gal figure:last-child img{aspect-ratio:4/3}
.gal figure:last-child{margin-top:clamp(3rem,8vw,7rem)}
.say{text-align:center}
.say p{font-family:var(--font-heading);font-size:clamp(1.75rem,3.6vw,2.9rem);line-height:1.25;letter-spacing:var(--heading-tracking);max-width:26ch;margin-inline:auto;text-wrap:balance}
.qa div{padding-block:1.6rem;border-top:1px solid var(--line)}
.qa h3{font-size:1.25rem;line-height:1.35;margin-bottom:.5rem}.qa p{color:var(--quiet);max-width:58ch}
.end{border-top:1px solid var(--line);text-align:center}
.end .in{padding-block:var(--sec) clamp(4rem,8vw,6rem)}
.end h2{font-size:clamp(2.1rem,4.4vw,3.6rem);line-height:1.1;max-width:20ch;margin:0 auto 1.25rem}
.end .sub{color:var(--quiet);font-size:1.1rem;max-width:42ch;margin:0 auto 2.25rem}
.go{display:inline-block;color:var(--acc);text-decoration:none;letter-spacing:.04em;padding-bottom:.35rem;border-bottom:1px solid var(--brass)}
.go:hover{border-color:var(--acc)}
.end dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(12rem,100%),1fr));gap:2rem clamp(1.5rem,3vw,3rem);margin:clamp(3.5rem,7vw,5.5rem) auto 0}
.end dl div{padding-top:1.1rem;border-top:1px solid var(--brass)}
.end dt{color:var(--acc);font-size:.9rem;letter-spacing:.05em;margin-bottom:.35rem}
.end dd{overflow-wrap:break-word}.end dd a{text-decoration:none}.end dd a:hover{color:var(--acc)}
.foot{display:flex;justify-content:space-between;gap:.5rem 1.5rem;flex-wrap:wrap;padding-block:1.75rem;border-top:1px solid var(--line);color:var(--quiet);font-size:.88rem;letter-spacing:.04em}
@media (max-width:860px){.top nav{display:none}.hero{grid-template-columns:minmax(0,1fr)}.hero .frame img{aspect-ratio:4/5}.frame:has(${ART}) .mono{aspect-ratio:4/3;font-size:8rem}.g{grid-template-columns:minmax(0,1fr)}.g>*{grid-column:1/-1!important}.hang h2{margin-bottom:2rem;max-width:none}.cards{grid-template-columns:minmax(0,1fr)}.pair,.gal{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.gal figure:last-child{margin-top:3rem}}`

/** The name's first letter, for the monogram that stands in for a missing opening photo. */
const initial = (name: string) => Array.from(name.trim().replace(/^the\s+/i, ''))[0] ?? ''

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say">
        <div className="w">
          <div className="gem" aria-hidden="true" />
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="w g">
          <div className="mark" aria-hidden="true" />
          <div className="hang">
            <h2>Questions</h2>
          </div>
          <div className="body qa">
            <FaqList faq={c.faq} />
          </div>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="w gal">
          <figure>
            <Pic photo={c.photos.d2} />
          </figure>
          <figure>
            <Pic photo={c.photos.cta} />
          </figure>
        </div>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="sec">
      <div className="w g">
        <div className="mark" aria-hidden="true" />
        <div className="hang">
          <h2>{l.title}</h2>
        </div>
        <ol className="body cards">
          <ListItems items={l.items} numbered={x === 'steps'} />
        </ol>
      </div>
    </section>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = reachOf(f)
  return (
    <>
      <div className="w top">
        <b>{c.name}</b>
        <nav>
          <NavLinks links={links(c, extras)} />
        </nav>
      </div>
      <header className="w hero">
        <div>
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </div>
        <figure className="frame">
          <Pic photo={c.photos.hero} eager />
          <span className="mono" aria-hidden="true">
            {initial(c.name)}
          </span>
        </figure>
      </header>
      <main>
        <section className="sec">
          <div className="w g">
            <div className="mark" aria-hidden="true" />
            <p className="lead">{c.about}</p>
          </div>
        </section>
        <section className="sec" id="offer">
          <div className="w g">
            <div className="mark" aria-hidden="true" />
            <div className="hang">
              <h2>{c.offerTitle}</h2>
            </div>
            <ul className="body cards">
              {offerItems(c).map((it) => (
                <li key={it.name}>
                  <h3>{it.name}</h3>
                  {it.price && <span className="price">{it.price}</span>}
                  {it.detail && <p>{it.detail}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="w pair">
          <figure>
            <Pic photo={c.photos.about} />
          </figure>
          <figure>
            <Pic photo={c.photos.d1} />
          </figure>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
        <div className="w in">
          <div className="gem" aria-hidden="true" />
          <h2>{c.cta.headline}</h2>
          <p className="sub">{c.cta.subhead}</p>
          {reach && (
            <a className="go" href={reach.href}>
              {c.cta.label}
            </a>
          )}
          {hasVisit(c) && (
            <dl>
              <FactRows facts={f} />
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

export const velvet: Template = {
  id: 'velvet',
  label: 'Velvet',
  text: "A near-black page with ivory type and wide, unhurried spacing, the organisation's colour used only as brass: fine rules, a small gem where each section begins, the prices and one button, the headline beside a tall portrait in a thin brass frame (or the name's initial as a monogram): dark, refined and luxurious, for cocktail bars, whisky bars, jewellers, perfumers and upmarket barbers.",
  dark: true,
  css: CSS,
  Page,
}
