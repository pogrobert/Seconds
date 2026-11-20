// Market: playful and warm, like a stall on market day. A striped awning in the business's colour
// and a butter yellow hangs across the top with a scalloped edge; the closing hangs the same
// scallops the other way. The main button is a round sticker stuck on the corner of the opening
// photo, prices sit on small tilted tags, and photos are soft rounded shapes and one circle.
// Everything else stays calm on a warm cream page. For bakeries, ice cream, children's
// activities and market stalls.

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

const ART = 'img[data-art],img[src^="data:image/svg"]'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 5%,#fffaf1);--blush:color-mix(in oklab,var(--band) 9%,#fff1e0);--sun:color-mix(in oklab,var(--band) 10%,#ffd36e);--ink:color-mix(in oklab,var(--band) 30%,#1d1a17);--quiet:color-mix(in oklab,var(--ink) 70%,var(--paper));--line:color-mix(in oklab,var(--band) 22%,#f1e6d6);--round:calc(var(--radius) * 2.5 + .75rem);--w:72rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4rem,8vw,7rem);--sw:clamp(1.75rem,3.2vw,2.75rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.awn{position:relative;height:clamp(1.75rem,3.5vw,2.75rem);background:repeating-linear-gradient(90deg,var(--acc) 0 var(--sw),var(--sun) var(--sw) calc(var(--sw) * 2));margin-bottom:calc(var(--sw) / 2)}
.awn::after{content:"";position:absolute;inset-inline:0;top:100%;height:calc(var(--sw) / 2);background:radial-gradient(circle at calc(var(--sw) / 2) 0,var(--acc) calc(var(--sw) / 2 - .5px),transparent calc(var(--sw) / 2)) 0 0/calc(var(--sw) * 2) 100% repeat-x,radial-gradient(circle at calc(var(--sw) * 1.5) 0,var(--sun) calc(var(--sw) / 2 - .5px),transparent calc(var(--sw) / 2)) 0 0/calc(var(--sw) * 2) 100% repeat-x}
.top{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:1.5rem 1rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.45rem;letter-spacing:var(--heading-tracking);line-height:1.15}
.top nav{display:flex;gap:.5rem;font-size:.95rem}
.top nav a{text-decoration:none;padding:.45rem 1rem;border-radius:999px;background:var(--blush)}.top nav a:hover{background:var(--sun)}
.hero{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2rem,5vw,4.5rem);align-items:center;padding-block:clamp(2rem,5vw,4rem) var(--sec)}
.tag{display:inline-block;background:var(--sun);color:var(--ink);padding:.4rem 1rem;border-radius:1.2rem;font-weight:600;font-size:.95rem;rotate:-2deg;margin-bottom:1.5rem}
.hero h1{font-size:clamp(2.6rem,5.8vw,5rem);line-height:1.02;margin-bottom:1.5rem}
.hero .sub{font-size:clamp(1.1rem,1.6vw,1.3rem);color:var(--quiet);max-width:36ch}
.media{position:relative;padding-bottom:2.5rem}
.media img{width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;border-radius:var(--round) var(--round) 50% 50% / var(--round) var(--round) 14% 14%}
.stk{position:absolute;inset-inline-start:-1.75rem;bottom:0;display:grid;place-items:center;text-align:center;width:clamp(8rem,12vw,10.5rem);aspect-ratio:1;padding:1rem;border-radius:50%;background:var(--sun);color:var(--ink);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1rem,1.4vw,1.2rem);line-height:1.15;text-decoration:none;rotate:-10deg;box-shadow:0 0 0 .4rem var(--paper);transition:rotate .2s}
.stk:hover{rotate:-4deg}
.hero:has(.media ${ART}){grid-template-columns:minmax(0,1fr) auto;align-items:end}
.hero:has(.media ${ART}) figure{display:none}
.hero:has(.media ${ART}) .media{padding:0}
.hero:has(.media ${ART}) .stk{position:static;width:clamp(9rem,14vw,12rem)}
.sec{padding-block:var(--sec)}
h2{font-size:clamp(1.9rem,3.4vw,2.8rem);line-height:1.08;margin-bottom:clamp(1.75rem,3vw,2.5rem)}
.about{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,7fr);gap:clamp(2rem,5vw,5rem);align-items:center}
.about img{width:100%;height:auto;aspect-ratio:1;object-fit:cover;border-radius:50%}
.about:has(${ART}){grid-template-columns:minmax(0,1fr)}.about figure:has(${ART}){display:none}
.lead{font-family:var(--font-heading);font-size:clamp(1.35rem,2.3vw,1.85rem);line-height:1.4;letter-spacing:var(--heading-tracking);max-width:38ch}
.offer{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:clamp(1.25rem,3vw,2.5rem);align-items:stretch}
.offer:has(.side ${ART}){grid-template-columns:minmax(0,1fr)}.offer .side:has(${ART}){display:none}
.board{background:var(--blush);border-radius:var(--round);padding:clamp(1.75rem,4vw,3.25rem)}
.menu{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(20rem,100%),1fr));gap:.25rem clamp(1.5rem,4vw,3rem)}
.menu li{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;padding-block:1.1rem;border-top:2px dotted var(--line)}
.menu h3{font-size:1.25rem;line-height:1.25}
.menu p{color:var(--quiet);font-size:.97rem;margin-top:.2rem}
.price{flex:none;background:var(--sun);color:var(--ink);padding:.3rem .8rem;border-radius:999px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;rotate:3deg}
.menu li:nth-child(even) .price{rotate:-3deg}
.side img{width:100%;height:100%;min-height:18rem;object-fit:cover;border-radius:var(--round)}
.say{background:var(--acc);color:var(--on-acc);border-radius:var(--round);padding:clamp(2.5rem,7vw,5.5rem) clamp(1.5rem,6vw,5rem);text-align:center}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.7rem,3.8vw,3.1rem);line-height:1.15;letter-spacing:var(--heading-tracking);max-width:26ch;margin-inline:auto;text-wrap:balance}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:2rem clamp(1.5rem,3vw,2.5rem)}
.dot{display:grid;place-items:center;width:3rem;aspect-ratio:1;border-radius:50%;background:var(--sun);margin-bottom:1rem;font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.3rem}
.cols li:nth-child(even) .dot{background:var(--blush)}
.cols h3{font-size:1.3rem;line-height:1.25;margin-bottom:.4rem}.cols p{color:var(--quiet)}
.pair{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,4fr);gap:clamp(1rem,3vw,2rem);align-items:center}
.pair img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:var(--round);rotate:-1.5deg}
.pair figure:last-child img{aspect-ratio:1;rotate:2deg}
.faq>div{max-width:48rem}
.faq details{background:var(--blush);border-radius:calc(var(--round) * .6);padding:1.1rem 1.4rem}.faq details+details{margin-top:.75rem}
.faq summary{font-family:var(--font-heading);font-size:1.2rem;display:flex;justify-content:space-between;gap:1rem}
.faq summary::after{content:"+";flex:none;display:grid;place-items:center;width:1.7rem;height:1.7rem;border-radius:50%;background:var(--sun);font-size:1.1rem;line-height:1}
.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.6rem;max-width:60ch}
.end{position:relative;background:var(--acc);color:var(--on-acc);margin-top:calc(var(--sw) / 2)}
.end::before{content:"";position:absolute;inset-inline:0;bottom:100%;height:calc(var(--sw) / 2);background:radial-gradient(circle at calc(var(--sw) / 2) 100%,var(--acc) calc(var(--sw) / 2 - .5px),transparent calc(var(--sw) / 2)) 0 0/var(--sw) 100% repeat-x}
.end .cl{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2rem,5vw,5rem);padding-block:var(--sec)}
.end h2{font-size:clamp(2.2rem,4.6vw,3.9rem);line-height:1.04;margin-bottom:1.25rem}
.end .sub{font-size:1.15rem;opacity:.92;max-width:38ch;margin-bottom:2rem}
.btn{display:inline-block;padding:.95rem 1.7rem;border-radius:999px;background:var(--sun);color:var(--ink);font-weight:700;text-decoration:none}
.end dl{display:grid;gap:1.4rem;align-content:start}
.end dt{display:inline-block;font-size:.88rem;font-weight:700;padding:.15rem .7rem;border-radius:999px;background:color-mix(in oklab,var(--on-acc) 18%,var(--acc));margin-bottom:.35rem}
.end dd{font-size:1.1rem;overflow-wrap:break-word}.end dd a{text-decoration:none;border-bottom:1px solid currentColor}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-block:1.75rem;font-size:.92rem;border-top:2px dotted color-mix(in oklab,var(--on-acc) 35%,var(--acc))}
@media (max-width:760px){.top nav{display:none}.hero,.about,.offer,.end .cl{grid-template-columns:minmax(0,1fr)}.media{max-width:24rem;margin-inline:auto;width:100%}.stk{inset-inline-start:-.5rem}.about figure{max-width:15rem}.side img{min-height:0;aspect-ratio:4/3}.hero:has(.media ${ART}){grid-template-columns:minmax(0,1fr);align-items:start}.hero:has(.media ${ART}) .media{margin-inline:0}}`

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
        <div className="w faq">
          <div>
            <h2>Questions</h2>
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
          {l.items.map((it, i) => (
            <li key={it.title}>
              <span className="dot" aria-hidden={x === 'steps' ? undefined : true}>
                {x === 'steps' ? i + 1 : ''}
              </span>
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
      <div className="awn" aria-hidden="true" />
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
        <div>
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
        </div>
        <div className="media">
          <figure>
            <Pic photo={c.photos.hero} eager />
          </figure>
          <a className="stk" href="#visit">
            {c.cta.label}
          </a>
        </div>
      </header>
      <main>
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="w about">
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
            <p className="lead">{c.about}</p>
          </div>
        </section>
        <section className="sec" id="offer" style={{ paddingTop: 0 }}>
          <div className="w offer">
            <div className="board">
              <h2>{c.offerTitle}</h2>
              <ul className="menu">
                {offerItems(c).map((it) => (
                  <li key={it.name}>
                    <div>
                      <h3>{it.name}</h3>
                      {it.detail && <p>{it.detail}</p>}
                    </div>
                    {it.price && <span className="price">{it.price}</span>}
                  </li>
                ))}
              </ul>
            </div>
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

export const market: Template = {
  id: 'market',
  label: 'Market',
  text: 'Playful and warm like a market stall: a striped awning with a scalloped edge across the top, a round sticker for a button, prices on little tilted tags and soft rounded photos on a warm cream page; cheerful and friendly without clutter, for bakeries, ice cream shops, cake makers, children’s activities and market stalls.',
  dark: false,
  css: CSS,
  Page,
}
