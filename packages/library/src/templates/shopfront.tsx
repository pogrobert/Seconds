// Shopfront: the opening is drawn as the front of an independent shop. The name is painted on a
// fascia in the business's colour with a fine sign-writer's frame, over a bay of the same
// woodwork: a row of small transom panes, then the shop window holding the opening photo beside
// the door panel with the headline. With no photo the window itself carries the headline like
// lettering on the glass. A panelled stallriser closes the front. The offer is the stock inside:
// each group the owner gave is a shelf, its items standing on a plank in the brand colour with
// their prices on small shelf-edge labels hung under it. Photos sit in the same painted frame.
// Square corners on a quiet paper page. For bookshops, hardware stores, gift shops and record
// shops.

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
  type Template,
  type TemplateProps,
} from './shared.tsx'

const ART = 'img[data-art],img[src^="data:image/svg"]'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 4%,#f8f6f1);--card:color-mix(in oklab,var(--band) 2%,#fffdf9);--glass:color-mix(in oklab,var(--band) 12%,#eef0ee);--ink:color-mix(in oklab,var(--band) 25%,#1a1918);--quiet:color-mix(in oklab,var(--ink) 72%,var(--paper));--line:color-mix(in oklab,var(--band) 20%,#ddd7cc);--deep:color-mix(in oklab,var(--band) 78%,#000);--trim:color-mix(in oklab,var(--on-acc) 42%,var(--band));--fr:clamp(.55rem,1.1vw,.85rem);--w:74rem;--gut:clamp(1.1rem,4vw,3rem);--sec:clamp(4rem,8vw,6.5rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.nav{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:.3rem 1.75rem;padding-block:1rem;font-size:.95rem;color:var(--quiet)}
.nav a{text-decoration:none}.nav a:hover{color:var(--ink);text-decoration:underline;text-underline-offset:.3em}
.shop{background:var(--acc);color:var(--on-acc);padding:0 var(--fr) var(--fr)}
.cornice{height:calc(var(--fr) * 1.4);background:var(--deep);margin-inline:calc(var(--fr) * -1)}
.fascia{padding:clamp(.9rem,2vw,1.4rem) clamp(.4rem,2vw,1.5rem)}
.fascia p{border:1px solid var(--trim);padding:clamp(.8rem,2vw,1.4rem) clamp(.8rem,3vw,2rem);text-align:center;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.6rem,4.2vw,3.4rem);line-height:1.08;overflow-wrap:break-word;text-wrap:balance}
.lights{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--fr);margin-bottom:var(--fr)}
.lights i{display:block;height:clamp(1.3rem,2.6vw,2.2rem);background:var(--glass);opacity:.85}
.bay{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:var(--fr)}
.glass{background:var(--glass)}
.glass img{width:100%;height:100%;min-height:22rem;aspect-ratio:4/3;object-fit:cover}
.door{background:var(--card);color:var(--ink);padding:clamp(1.6rem,3.5vw,3rem);display:flex;flex-direction:column;justify-content:center;align-items:flex-start;min-width:0}
.door .tag{color:var(--quiet);margin-bottom:1rem}
.door h1{font-size:clamp(2rem,3.6vw,3.3rem);line-height:1.05;margin-bottom:1.25rem;overflow-wrap:break-word;max-width:100%}
.door .sub{color:var(--quiet);font-size:clamp(1.05rem,1.4vw,1.2rem);max-width:38ch;margin-bottom:2rem}
.bay:has(.glass ${ART}){grid-template-columns:minmax(0,1fr)}
.bay:has(.glass ${ART}) .glass{display:none}
.bay:has(.glass ${ART}) .door{background:var(--glass);align-items:center;text-align:center;padding-block:clamp(3rem,8vw,6.5rem)}
.bay:has(.glass ${ART}) h1{font-size:clamp(2.4rem,5.6vw,4.9rem);max-width:17ch;line-height:1.02}
.bay:has(.glass ${ART}) .sub{max-width:44ch}
.riser{height:clamp(2.6rem,5vw,4rem);margin-top:var(--fr);background:var(--deep);box-shadow:inset 0 0 0 clamp(.4rem,.8vw,.6rem) var(--acc),inset 0 0 0 calc(clamp(.4rem,.8vw,.6rem) + 1px) var(--trim)}
.btn{display:inline-block;padding:.95rem 1.7rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:650;text-decoration:none}
.btn:hover{background:var(--deep)}
.sec{padding-block:var(--sec)}
h2{font-size:clamp(1.9rem,3.6vw,3rem);line-height:1.08;margin-bottom:clamp(1.75rem,3vw,2.5rem);max-width:24ch}
.pic{border:var(--fr) solid var(--acc);background:var(--acc)}
.pic img{width:100%;object-fit:cover}
.about{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:clamp(2rem,5vw,5rem);align-items:center}
.about p{font-family:var(--font-heading);font-size:clamp(1.3rem,2.2vw,1.8rem);line-height:1.42;letter-spacing:var(--heading-tracking);max-width:36ch}
.about img{aspect-ratio:4/5}
.about:has(${ART}){grid-template-columns:minmax(0,1fr)}.about figure:has(${ART}){display:none}
.shelf+.shelf{margin-top:clamp(3rem,6vw,4.5rem)}
.shelf>h3{display:inline-block;background:var(--acc);color:var(--on-acc);font-size:clamp(1.05rem,1.6vw,1.25rem);line-height:1.25;padding:.45rem 1rem;margin-bottom:.5rem;max-width:100%;overflow-wrap:break-word}
.stock{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(15rem,100%),1fr));row-gap:clamp(2rem,4vw,2.75rem)}
.stock li{display:flex;flex-direction:column;min-width:0}
.it{flex:1;display:flex;flex-direction:column;justify-content:flex-end;padding:1.6rem 1.25rem 1rem;border-inline-start:1px solid var(--line);border-bottom:clamp(.6rem,1vw,.8rem) solid var(--acc)}
.it h4{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.2rem,1.8vw,1.45rem);line-height:1.2;margin:0;overflow-wrap:break-word}
.it p{color:var(--quiet);font-size:.95rem;margin-top:.35rem}
.edge{align-self:flex-start;margin-inline-start:1.25rem;min-height:2.3rem;padding:.3rem .75rem;background:var(--card);border:1px solid var(--line);border-top:0;font-weight:700;font-variant-numeric:tabular-nums;max-width:calc(100% - 1.5rem);overflow-wrap:break-word}
.edge:empty{visibility:hidden}
.side{margin-top:clamp(3rem,6vw,4.5rem)}
.side img{aspect-ratio:21/9}
.side:has(${ART}){display:none}
.say{background:var(--acc);padding:var(--fr)}
.say p{background:var(--glass);color:var(--ink);text-align:center;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.7rem,3.8vw,3.1rem);line-height:1.15;padding:clamp(2.5rem,6vw,5rem) clamp(1.25rem,5vw,4rem);text-wrap:balance}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(14rem,100%),1fr));gap:2.25rem clamp(1.5rem,3vw,2.5rem)}
.cols li{border-top:clamp(.35rem,.6vw,.5rem) solid var(--acc);padding-top:1.25rem}
.cols h3{font-size:1.3rem;line-height:1.25;margin-bottom:.45rem}.cols p{color:var(--quiet)}
.n{display:inline-block;min-width:2.4rem;padding:.2rem .5rem;margin-bottom:.9rem;background:var(--acc);color:var(--on-acc);text-align:center;font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.15rem}
.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(1rem,2.5vw,2rem)}
.pair img{aspect-ratio:4/3;height:100%}
.qa{max-width:56rem}
.qa div{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:.4rem 2.5rem;padding-block:1.4rem;border-top:1px solid var(--line)}
.qa div:last-child{border-bottom:1px solid var(--line)}
.qa h3{font-size:1.2rem;line-height:1.3}.qa p{color:var(--quiet)}
.end{background:var(--acc);color:var(--on-acc);border-top:calc(var(--fr) * 1.4) solid var(--deep)}
.end .cl{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2rem,5vw,5rem);padding-block:var(--sec)}
.end h2{font-size:clamp(2.2rem,4.6vw,3.8rem);line-height:1.04;margin-bottom:1.25rem}
.end .sub{font-size:1.15rem;opacity:.92;max-width:38ch;margin-bottom:2rem}
.end .btn{background:var(--on-acc);color:var(--acc)}.end .btn:hover{background:var(--glass)}
.end dl{display:grid;align-content:start;border:1px solid var(--trim);padding:clamp(1.25rem,3vw,2rem)}
.end dl div{padding-block:.85rem;border-bottom:1px solid var(--trim)}.end dl div:first-child{padding-top:0}.end dl div:last-child{border-bottom:0;padding-bottom:0}
.end dt{font-size:.9rem;opacity:.85}
.end dd{font-size:1.1rem;overflow-wrap:break-word}.end dd a{text-decoration:none;border-bottom:1px solid currentColor}
.foot{display:flex;justify-content:space-between;gap:.5rem 1.5rem;flex-wrap:wrap;padding-block:1.6rem;font-size:.92rem;border-top:1px solid var(--trim)}
@media (max-width:760px){.bay,.about,.end .cl,.pair{grid-template-columns:minmax(0,1fr)}.glass img{min-height:0}.lights{grid-template-columns:repeat(3,minmax(0,1fr))}.lights i:nth-child(4){display:none}.about figure{max-width:18rem}.stock{grid-template-columns:repeat(auto-fill,minmax(min(10rem,100%),1fr))}.it{padding-inline:.9rem}.edge{margin-inline-start:.9rem}.qa div{grid-template-columns:minmax(0,1fr)}.nav{justify-content:flex-start}}`

const groups = (c: TemplateProps['c']) => c.prices.filter((g) => g.items.length)

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec">
        <div className="w">
          <div className="say">
            <p>{c.statement}</p>
          </div>
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
          <figure className="pic">
            <Pic photo={c.photos.d2} />
          </figure>
          <figure className="pic">
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
  const reach = f.find((x) => x.href)
  const gs = groups(c)
  return (
    <>
      <header className="w">
        <nav className="nav">
          {links(c, extras).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="shop">
          <div className="cornice" aria-hidden="true" />
          <div className="fascia">
            <p>{c.name}</p>
          </div>
          <div className="lights" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="bay">
            <figure className="glass">
              <Pic photo={c.photos.hero} eager />
            </figure>
            <div className="door">
              <p className="tag">{c.tagline}</p>
              <h1>{c.headline}</h1>
              <p className="sub">{c.subhead}</p>
              <a className="btn" href="#visit">
                {c.cta.label}
              </a>
            </div>
          </div>
          <div className="riser" aria-hidden="true" />
        </div>
      </header>
      <main>
        <section className="sec">
          <div className="w about">
            <p>{c.about}</p>
            <figure className="pic">
              <Pic photo={c.photos.about} />
            </figure>
          </div>
        </section>
        <section className="sec" id="offer" style={{ paddingTop: 0 }}>
          <div className="w">
            <h2>{c.offerTitle}</h2>
            {gs.map((g, i) => {
              const priced = g.items.some((it) => it.price)
              const H = g.group ? 'h4' : 'h3'
              return (
                <div className="shelf" key={i}>
                  {g.group && <h3>{g.group}</h3>}
                  <ul className="stock">
                    {g.items.map((it) => (
                      <li key={it.name}>
                        <div className="it">
                          <H>{it.name}</H>
                          {it.detail && <p>{it.detail}</p>}
                        </div>
                        {priced && <span className="edge">{it.price}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            <figure className="pic side">
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

export const shopfront: Template = {
  id: 'shopfront',
  label: 'Shopfront',
  text: "Drawn as the front of an independent shop: the name painted on a fascia in the business's colour over a framed shop window that holds the opening photo, or the headline lettered on the glass when there is none, then the stock on shelves by category with prices on little shelf-edge labels, on a quiet paper page with square corners; for bookshops, hardware stores, gift shops, record shops, florists and other independent shops that sell things.",
  dark: false,
  css: CSS,
  Page,
}
