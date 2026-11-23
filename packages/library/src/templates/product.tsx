// Product: a crisp product page on white. Up top, one statement set very large, the promise and a
// button beside it. Under it the one place of colour: a wide panel of the business's colour with
// the introduction in it and the hero photo rising from its lower edge (without a photo the
// introduction alone fills it). The offer is a ruled grid of features: hairlines between the
// cells, no boxes, a small square of the colour heading each. Steps run along a line of numbered
// squares. Everything else is ruled rows. For software, apps, online tools, digital agencies.

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

const ART = 'img[data-art],img[src^="data:image/svg"]'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:#fff;--soft:color-mix(in oklab,var(--band) 6%,#fff);--ink:color-mix(in oklab,var(--band) 18%,#121212);--quiet:color-mix(in oklab,var(--ink) 64%,#fff);--line:color-mix(in oklab,var(--band) 16%,#e2e2e2);--track:color-mix(in oklab,var(--band) 40%,#fff);--sq:calc(var(--radius) * .2);--w:74rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4.5rem,9vw,8rem);--cg:clamp(1.25rem,2.5vw,2.25rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.sec{padding-block:var(--sec) 0}
.top{display:flex;align-items:center;gap:1rem 2rem;padding-block:1.25rem}
.nm{display:flex;align-items:center;gap:.65rem;margin-inline-end:auto;min-width:0;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:1.15rem;line-height:1.25;overflow-wrap:break-word}
.nm::before{content:"";flex:none;width:.8rem;height:.8rem;background:var(--acc);border-radius:var(--sq)}
.top nav{display:flex;align-items:center;gap:1.75rem;font-size:.95rem}
.top nav a{text-decoration:none}.top nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.top nav a:last-child{padding:.6rem 1.1rem;border:1.5px solid var(--ink);border-radius:var(--button-radius);font-weight:600;text-align:center}
.top nav a:last-child:hover{background:var(--ink);color:var(--paper);text-decoration:none}
.hero{padding-block:clamp(3rem,8vw,6.5rem) clamp(2.5rem,5vw,4rem)}
.hero .tag{color:var(--quiet);font-size:1.05rem;margin-bottom:clamp(1rem,2vw,1.5rem);max-width:60ch}
.hero h1{font-size:clamp(2.5rem,6.6vw,5.75rem);line-height:1.01;max-width:17ch;overflow-wrap:break-word}
.hero .row{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:1.75rem 3rem;margin-top:clamp(1.75rem,3.5vw,2.75rem)}
.hero .sub{font-size:clamp(1.1rem,1.5vw,1.3rem);line-height:1.5;max-width:40ch;color:var(--quiet)}
.btn{display:inline-block;padding:1rem 1.75rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:600;text-decoration:none;text-align:center}
.btn:hover{background:color-mix(in oklab,var(--acc) 86%,#000)}
.stage{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(1.5rem,4vw,4rem);padding:clamp(1.75rem,4.5vw,3.75rem) clamp(1.5rem,4.5vw,3.75rem) 0;background:var(--acc);color:var(--on-acc);border-radius:var(--radius);overflow:hidden}
.stage p{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.2rem,1.8vw,1.55rem);line-height:1.42;max-width:32ch;padding-bottom:clamp(1.75rem,4.5vw,3.75rem)}
.stage figure{align-self:end;margin-inline-end:calc(-1 * clamp(1.5rem,4.5vw,3.75rem))}
.stage img{width:100%;aspect-ratio:4/3;object-fit:cover;border-start-start-radius:calc(var(--radius) * .6)}
.stage:has(${ART}){grid-template-columns:minmax(0,1fr)}
.stage figure:has(${ART}){display:none}
.stage:has(${ART}) p{font-size:clamp(1.45rem,2.9vw,2.4rem);line-height:1.28;max-width:36ch;padding-block:clamp(.5rem,2vw,1.5rem) clamp(2.25rem,5vw,4.5rem)}
h2{font-size:clamp(1.9rem,3.8vw,3rem);line-height:1.08;max-width:22ch;margin-bottom:clamp(2rem,4vw,3rem)}
.feat{display:grid;grid-template-columns:minmax(0,1fr);border-top:1.5px solid var(--ink)}
.feat li{display:flex;flex-direction:column;gap:.55rem;min-width:0;padding:clamp(1.5rem,2.5vw,2.25rem) var(--cg) clamp(1.75rem,3vw,2.5rem);border-bottom:1px solid var(--line);border-inline-start:1px solid var(--line)}
.feat li::before{content:"";flex:none;width:.95rem;height:.95rem;background:var(--acc);border-radius:var(--sq);margin-bottom:.85rem}
.feat h3{font-size:clamp(1.2rem,1.6vw,1.4rem);line-height:1.25;overflow-wrap:break-word}
.feat p{color:var(--quiet);font-size:1rem;max-width:44ch}
.feat .pr{margin-top:auto;padding-top:.9rem;font-family:var(--font-heading);font-size:1.15rem;font-variant-numeric:tabular-nums}
.c2{grid-template-columns:repeat(2,minmax(0,1fr))}.c3{grid-template-columns:repeat(3,minmax(0,1fr))}.c4{grid-template-columns:repeat(4,minmax(0,1fr))}
.c1 li,.c2 li:nth-child(2n+1),.c3 li:nth-child(3n+1),.c4 li:nth-child(4n+1){border-inline-start:0;padding-inline-start:0}
.c1 li{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);column-gap:2rem}.c1 li::before{grid-column:1/-1}.c1 li .pr{grid-column:2;padding-top:0}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(1rem,2vw,1.5rem)}
.pair img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:var(--radius)}
.steps{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:var(--cg)}
.steps li{position:relative;min-width:0}
.steps li:not(:last-child)::before{content:"";position:absolute;top:1.375rem;inset-inline:0 calc(-1 * var(--cg));height:1.5px;background:var(--track)}
.steps .n{position:relative;display:grid;place-items:center;width:2.75rem;height:2.75rem;margin-bottom:1.5rem;background:var(--acc);color:var(--on-acc);border-radius:var(--sq);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.2rem;line-height:1;font-variant-numeric:tabular-nums}
.steps h3{font-size:1.3rem;line-height:1.25;margin-bottom:.5rem}
.steps p{color:var(--quiet);max-width:36ch}
.rows{border-top:1.5px solid var(--ink)}
.rows li{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:.4rem 2rem;padding-block:1.5rem;border-bottom:1px solid var(--line)}
.rows h3{font-size:1.25rem;line-height:1.3}
.rows p{color:var(--quiet);max-width:52ch}
.say p{max-width:30ch;padding-inline-start:clamp(1.25rem,3vw,2.25rem);border-inline-start:4px solid var(--acc);font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.7rem,3.8vw,3.1rem);line-height:1.15;text-wrap:balance}
.qa{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(2rem,4vw,4rem);border-top:1.5px solid var(--ink)}
.qa>div{padding-block:1.5rem 2rem;border-bottom:1px solid var(--line)}
.qa h3{font-size:1.2rem;line-height:1.3;margin-bottom:.5rem}
.qa p{color:var(--quiet);max-width:52ch}
.end{margin-top:var(--sec);padding-top:var(--sec);background:var(--soft)}
.end h2{font-size:clamp(2.2rem,5.2vw,4.25rem);line-height:1.03;max-width:18ch;margin-bottom:1.25rem}
.end .sub{color:var(--quiet);font-size:1.15rem;max-width:44ch}
.end .btn{margin-top:2rem}
.end dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr));gap:0 var(--cg);margin-top:clamp(3rem,6vw,4.5rem)}
.end dl>div{padding-block:1.1rem .25rem;border-top:1.5px solid var(--ink);min-width:0}
.end dt{font-size:.9rem;color:var(--quiet);margin-bottom:.2rem}
.end dd{font-size:1.1rem;overflow-wrap:break-word}
.end dd a{text-decoration:none;border-bottom:1px solid var(--track)}.end dd a:hover{border-color:currentColor}
.foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.5rem 2rem;margin-top:clamp(3.5rem,7vw,6rem);padding-block:2rem;border-top:1px solid var(--line);color:var(--quiet);font-size:.9rem}
.foot b{font-weight:600;color:var(--ink)}
@media (max-width:960px){.c3,.c4{grid-template-columns:repeat(2,minmax(0,1fr))}.c3 li:nth-child(n),.c4 li:nth-child(n){border-inline-start:1px solid var(--line);padding-inline-start:var(--cg)}.c3 li:nth-child(2n+1),.c4 li:nth-child(2n+1){border-inline-start:0;padding-inline-start:0}.stage{grid-template-columns:minmax(0,1fr)}.stage p{padding-bottom:0}.stage figure{margin-top:.5rem;margin-inline:calc(-1 * clamp(1.5rem,4.5vw,3.75rem))}.stage img{aspect-ratio:3/2;border-radius:0}.stage:has(${ART}) p{padding-bottom:clamp(2.25rem,5vw,4.5rem)}}
@media (max-width:680px){.top nav a:not(:last-child){display:none}.top nav a:last-child{max-width:11rem;padding:.55rem .9rem}.feat,.c2,.c3,.c4{grid-template-columns:minmax(0,1fr)}.feat li:nth-child(n){border-inline-start:0;padding-inline:0}.c1 li{display:flex}.steps{grid-auto-flow:row;gap:2rem}.steps li{padding-inline-start:4.25rem}.steps .n{position:absolute;inset-inline-start:0;top:0;margin:0}.steps li:not(:last-child)::before{top:2.75rem;bottom:-2rem;inset-inline:1.375rem auto;width:1.5px;height:auto}.rows li{grid-template-columns:minmax(0,1fr)}.qa{grid-template-columns:minmax(0,1fr)}.pair{grid-template-columns:minmax(0,1fr)}}`

/** Columns for the feature grid: rows filled where the count allows. */
const colsFor = (n: number) =>
  n <= 3 ? n : n === 4 ? 2 : n % 3 === 0 ? 3 : n % 4 === 0 ? 4 : n % 3 === 2 ? 3 : 4

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say">
        <div className="w">
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="w">
          <h2>Questions</h2>
          <div className="qa">
            <FaqList faq={c.faq} />
          </div>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="w pair">
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
      <div className="w">
        <h2>{l.title}</h2>
        <ol className={x === 'steps' ? 'steps' : 'rows'}>
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
  const offer = offerItems(c)
  return (
    <>
      <div className="w top">
        <b className="nm">{c.name}</b>
        <nav>
          <NavLinks links={links(c, extras)} />
        </nav>
      </div>
      <header className="w hero">
        <p className="tag">{c.tagline}</p>
        <h1>{c.headline}</h1>
        <div className="row">
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </div>
      </header>
      <main>
        <section className="w">
          <div className="stage">
            <p>{c.about}</p>
            <figure>
              <Pic photo={c.photos.hero} eager />
            </figure>
          </div>
        </section>
        {offer.length > 0 && (
          <section className="sec" id="offer">
            <div className="w">
              <h2>{c.offerTitle}</h2>
              <ul className={`feat c${colsFor(offer.length)}`}>
                {offer.map((it) => (
                  <li key={it.name}>
                    <h3>{it.name}</h3>
                    {it.detail && <p>{it.detail}</p>}
                    {it.price && <span className="pr">{it.price}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
        <section className="sec">
          <div className="w pair">
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
            <figure>
              <Pic photo={c.photos.d1} />
            </figure>
          </div>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
        <div className="w">
          <h2>{c.cta.headline}</h2>
          <p className="sub">{c.cta.subhead}</p>
          {reach && (
            <a className="btn" href={reach.href}>
              {c.cta.label}
            </a>
          )}
          {hasVisit(c) && (
            <dl>
              <FactRows facts={f} />
            </dl>
          )}
          <div className="foot">
            <b>{c.name}</b>
            <span>{c.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export const product: Template = {
  id: 'product',
  label: 'Product',
  text: "A crisp product page on white: one bold statement set very large, a wide panel of the organisation's own colour holding its introduction, the offer laid out as a ruled grid of features and the way it works as numbered steps on a line; clear, modern and confident, and complete with no photos, for software startups, apps, online tools and digital agencies.",
  dark: false,
  draft: true,
  css: CSS,
  Page,
}
