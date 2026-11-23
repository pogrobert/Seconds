// Price tickets: a butcher's or greengrocer's window. The opening and the offer stand against a
// wall of white glazed tiles. Each item of the offer is a bold price ticket: a white card with a
// heavy border in the business's colour and a fine inner line, the price set very large with the
// name beneath (no drawn metal stands: Robert, 2026-11-23, no fake decorations). Every third
// ticket is turned out in the brand colour. With no price the name carries the ticket. The
// headline is the biggest ticket of all, standing beside the opening photo, or alone on the tiles
// without one. The opening hours close the page on a ticket of their own. For butchers,
// fishmongers, greengrocers and delis.

import { Fragment } from 'react'
import {
  type Extra,
  facts,
  hasVisit,
  links,
  listOf,
  Pic,
  present,
  RESET,
  reachOf,
  type Template,
  type TemplateProps,
} from './shared.tsx'

const ART = 'img[data-art],img[src^="data:image/svg"]'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--white:#fff;--page:color-mix(in oklab,var(--band) 3%,#fbfbf9);--tile:color-mix(in oklab,var(--band) 4%,#f6f6f3);--grout:color-mix(in oklab,var(--band) 10%,#dedcd6);--ink:color-mix(in oklab,var(--band) 22%,#151515);--quiet:color-mix(in oklab,var(--ink) 70%,var(--white));--line:color-mix(in oklab,var(--band) 18%,#e2e0da);--steel:color-mix(in oklab,var(--band) 12%,#8d9094);--bd:clamp(3px,.35vw,5px);--rd:calc(var(--radius) + .45rem);--t:3.4rem;--w:74rem;--gut:clamp(1.1rem,4vw,3rem);--sec:clamp(4rem,8vw,6.5rem)}
body{background:var(--page);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.tiles{background-color:var(--tile);background-image:linear-gradient(var(--grout) 1px,transparent 1px),linear-gradient(90deg,var(--grout) 1px,transparent 1px);background-size:var(--t) var(--t);background-position:-1px -1px}
.bar{background:var(--page);border-bottom:var(--bd) solid var(--acc)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:1.2rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.3rem,2.4vw,1.75rem);line-height:1.15;color:var(--acc);overflow-wrap:break-word;min-width:0}
.top nav{display:flex;gap:1.6rem;font-size:.95rem;flex:none}
.top nav a{text-decoration:none}.top nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.tk{position:relative;background:var(--white);color:var(--ink);border:var(--bd) solid var(--acc);border-radius:var(--rd);outline:1px solid var(--acc);outline-offset:calc(var(--bd) * -1 - .45rem);padding:clamp(1.2rem,2.2vw,1.6rem) clamp(1.1rem,2vw,1.5rem) clamp(1.3rem,2.4vw,1.75rem);text-align:center;overflow-wrap:break-word}
.hero{padding-block:clamp(2.5rem,6vw,5rem)}
.hero .w{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(1.5rem,4vw,3.5rem);align-items:stretch}
.hero .card{display:flex;flex-direction:column;min-width:0}
.hero .tk{padding:clamp(2rem,4.5vw,3.5rem) clamp(1.5rem,4vw,3rem)}
.hero .tag{color:var(--quiet);margin-bottom:1rem}
.hero h1{font-size:clamp(2.3rem,4.6vw,4.2rem);line-height:1.02;color:var(--acc);margin-bottom:1.25rem}
.hero .sub{font-size:clamp(1.05rem,1.4vw,1.2rem);color:var(--quiet);max-width:40ch;margin-inline:auto;margin-bottom:1.9rem}
.hero figure{align-self:center}
.hero img{width:100%;aspect-ratio:4/5;object-fit:cover;border:var(--bd) solid var(--white);border-radius:var(--rd)}
.hero .w:has(figure ${ART}){grid-template-columns:minmax(0,1fr);max-width:58rem}
.hero figure:has(${ART}){display:none}
.btn{display:inline-block;padding:.95rem 1.7rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:700;text-decoration:none}
.btn:hover{background:color-mix(in oklab,var(--acc) 80%,#000)}
.sec{padding-block:var(--sec)}
h2{font-size:clamp(1.9rem,3.6vw,3rem);line-height:1.08;margin-bottom:clamp(1.75rem,3vw,2.5rem);max-width:24ch}
.about{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,7fr);gap:clamp(2rem,5vw,5rem);align-items:center}
.about img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--rd)}
.about p{font-family:var(--font-heading);font-size:clamp(1.3rem,2.2vw,1.8rem);line-height:1.42;letter-spacing:var(--heading-tracking);max-width:38ch}
.about:has(${ART}){grid-template-columns:minmax(0,1fr)}.about figure:has(${ART}){display:none}
.offer{padding-block:var(--sec);border-block:var(--bd) solid var(--acc)}
.offer h2{background:var(--page);display:inline-block;padding:.35rem .9rem;margin-inline-start:-.9rem;max-width:100%}
.grp+.grp{margin-top:clamp(3rem,6vw,4.5rem)}
.grp>h3{display:inline-block;background:var(--acc);color:var(--on-acc);font-size:clamp(1.1rem,1.7vw,1.35rem);line-height:1.25;padding:.45rem 1.1rem;border-radius:var(--button-radius);margin-bottom:1.5rem;max-width:100%;overflow-wrap:break-word}
.row{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(14.5rem,100%),1fr));gap:clamp(2rem,4vw,3rem) clamp(1rem,2.5vw,2rem)}
.row li{display:flex;flex-direction:column;min-width:0}
.pr{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(2.5rem,4.4vw,3.6rem);line-height:.98;color:var(--acc);font-variant-numeric:tabular-nums;margin-bottom:.7rem}
.row .tk h4{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.15rem,1.6vw,1.35rem);line-height:1.2;margin:0}
.row .tk p{color:var(--quiet);font-size:.93rem;line-height:1.45;margin-top:.45rem}
.row .np h4{font-size:clamp(1.6rem,2.6vw,2.1rem);line-height:1.08;color:var(--acc)}
.row li:nth-child(3n+2) .tk{background:var(--acc);color:var(--on-acc);border-color:var(--acc);outline-color:color-mix(in oklab,var(--on-acc) 55%,var(--acc))}
.row li:nth-child(3n+2) .pr,.row li:nth-child(3n+2) .np h4{color:var(--on-acc)}
.row li:nth-child(3n+2) .tk p{color:color-mix(in oklab,var(--on-acc) 85%,var(--acc))}
.side{margin-top:clamp(3rem,6vw,4.5rem)}
.side img{width:100%;aspect-ratio:21/9;object-fit:cover;border:var(--bd) solid var(--white);border-radius:var(--rd)}
.side:has(${ART}){display:none}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.8rem,4vw,3.3rem);line-height:1.12;color:var(--acc);max-width:24ch;text-wrap:balance}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(14rem,100%),1fr));gap:2.25rem clamp(1.5rem,3vw,2.5rem)}
.cols li{border-top:var(--bd) solid var(--acc);padding-top:1.2rem}
.cols h3{font-size:1.3rem;line-height:1.25;margin-bottom:.45rem}.cols p{color:var(--quiet)}
.n{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:2.4rem;line-height:1;color:var(--acc);margin-bottom:.6rem}
.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(1rem,2.5vw,2rem)}
.pair img{width:100%;aspect-ratio:4/3;height:100%;object-fit:cover;border-radius:var(--rd)}
.qa{max-width:52rem}
.qa div{padding-block:1.3rem;border-bottom:1px solid var(--line)}.qa div:first-child{border-top:1px solid var(--line)}
.qa h3{font-size:1.25rem;line-height:1.3;margin-bottom:.35rem}.qa p{color:var(--quiet);max-width:62ch}
.end{background:var(--acc);color:var(--on-acc)}
.end .cl{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2rem,5vw,5rem);padding-block:var(--sec);align-items:start}
.end h2{font-size:clamp(2.2rem,4.6vw,3.8rem);line-height:1.04;margin-bottom:1.25rem}
.end .sub{font-size:1.15rem;opacity:.92;max-width:38ch;margin-bottom:2rem}
.end .btn{background:var(--white);color:var(--acc)}.end .btn:hover{background:var(--tile)}
.end .card{display:flex;flex-direction:column}
.end .tk{border-color:var(--white);outline-color:var(--acc);text-align:start}
.end dl div{padding-block:.8rem;border-bottom:1px dashed var(--line)}.end dl div:first-child{padding-top:0}.end dl div:last-child{border-bottom:0;padding-bottom:0}
.end dt{font-size:.88rem;color:var(--quiet)}
.end dd{font-family:var(--font-heading);font-size:1.15rem;line-height:1.35;overflow-wrap:break-word}.end dd a{text-decoration:none;border-bottom:1px solid currentColor}
.foot{display:flex;justify-content:space-between;gap:.5rem 1.5rem;flex-wrap:wrap;padding-block:1.6rem;font-size:.92rem;border-top:1px solid color-mix(in oklab,var(--on-acc) 35%,var(--acc))}
@media (max-width:760px){:root{--t:2.6rem}.top nav{display:none}.hero .w,.about,.end .cl,.pair{grid-template-columns:minmax(0,1fr)}.hero img{aspect-ratio:4/3}.about figure{max-width:16rem}.row{grid-template-columns:repeat(auto-fill,minmax(min(9.5rem,100%),1fr))}.pr{font-size:2.1rem}.row .np h4{font-size:1.35rem}.row .tk h4{font-size:1.05rem}.tk{padding-inline:.9rem}}
/* Questions beside their heading on wide screens: a heading over a narrow list left the right half empty (Robert, 2026-11-23). */
@media (min-width:861px){#questions>.w{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);column-gap:clamp(2rem,5vw,5rem);align-items:start}#questions>.w>h2,#questions>.w>.head{margin:0}#questions .qa{max-width:none}}`

const groups = (c: TemplateProps['c']) => c.prices.filter((g) => g.items.length)

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
  const reach = reachOf(f)
  const gs = groups(c)
  return (
    <>
      <div className="bar">
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
      </div>
      <header className="hero tiles">
        <div className="w">
          <div className="card">
            <div className="tk">
              <p className="tag">{c.tagline}</p>
              <h1>{c.headline}</h1>
              <p className="sub">{c.subhead}</p>
              <a className="btn" href="#visit">
                {c.cta.label}
              </a>
            </div>
          </div>
          <figure>
            <Pic photo={c.photos.hero} eager />
          </figure>
        </div>
      </header>
      <main>
        <section className="sec">
          <div className="w about">
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
            <p>{c.about}</p>
          </div>
        </section>
        <section className="offer tiles" id="offer">
          <div className="w">
            <h2>{c.offerTitle}</h2>
            {gs.map((g, i) => {
              const H = g.group ? 'h4' : 'h3'
              return (
                <div className="grp" key={i}>
                  {g.group && <h3>{g.group}</h3>}
                  <ul className="row">
                    {g.items.map((it) => (
                      <li key={it.name}>
                        <div className={it.price ? 'tk' : 'tk np'}>
                          {it.price && <span className="pr">{it.price}</span>}
                          <H>{it.name}</H>
                          {it.detail && <p>{it.detail}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            <figure className="side">
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
        <div className="w cl">
          <div>
            <h2>{c.cta.headline}</h2>
            <p className="sub">{c.cta.subhead}</p>
            {reach && (
              <a className="btn" href={reach.href}>
                {c.cta.label}
              </a>
            )}
          </div>
          {hasVisit(c) && (
            <div className="card">
              <dl className="tk">
                {f.map((x) => (
                  <div key={x.label}>
                    <dt>{x.label}</dt>
                    <dd>{x.href ? <a href={x.href}>{x.value}</a> : x.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
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

export const tickets: Template = {
  id: 'tickets',
  label: 'Price tickets',
  text: "A butcher's or greengrocer's shop window on white glazed tiles: the headline on one giant price ticket, then every item of the offer on its own bold ticket with a heavy border in the business's colour, the price set huge and the name beneath; direct, cheerful and local, for butchers, fishmongers, greengrocers, delis, cheese shops, farm shops and bakers.",
  dark: false,
  css: CSS,
  Page,
}
