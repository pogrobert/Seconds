// Ticker: one bold thing, and everything else held still. Bands of the offer's own names (or the
// tagline when there are none) slide slowly across the page between sections, like the moving
// sign over a bar: the first in the business's colour running left, the second between heavy
// rules running right. CSS only, and still when the visitor asks for less motion. The rest is
// disciplined: a near-white page, a large headline, the offer as a plain two-column list with
// prices in the brand colour, hairline rules, square corners. Photos are optional: drawn art is
// left out and the page closes up. For cafés, bars, gyms and tattoo studios.

import { type CSSProperties, Fragment } from 'react'
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

const ART = 'img[data-art],img[src^="data:image/svg"]'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 4%,#f7f6f3);--ink:color-mix(in oklab,var(--band) 22%,#111);--quiet:color-mix(in oklab,var(--ink) 66%,var(--paper));--rule:color-mix(in oklab,var(--ink) 18%,var(--paper));--w:80rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4rem,8vw,7rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:1.4rem;border-bottom:1px solid var(--rule)}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:1.25rem;line-height:1.2;min-width:0}
.top nav{display:flex;gap:1.75rem;font-size:.95rem;flex-shrink:0}.top nav a{text-decoration:none}.top nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.hero{padding-block:clamp(3rem,8vw,6.5rem) clamp(2.5rem,5vw,4rem)}
.hero .tag{color:var(--quiet);font-size:1.05rem;margin-bottom:1.25rem;max-width:50ch}
.hero h1{font-size:clamp(2.8rem,8vw,7rem);line-height:.96;max-width:15ch;margin-bottom:clamp(2rem,4vw,3rem);overflow-wrap:break-word}
.hero .row{display:flex;justify-content:space-between;align-items:end;gap:1.5rem 3rem;flex-wrap:wrap}
.hero .sub{font-size:clamp(1.1rem,1.6vw,1.35rem);max-width:40ch}
.btn{display:inline-block;padding:1rem 1.8rem;border-radius:var(--button-radius);background:var(--ink);color:var(--paper);font-weight:650;text-decoration:none}
.btn:hover{background:var(--acc);color:var(--on-acc)}
.shot{padding-bottom:clamp(2.5rem,5vw,4rem)}
.shot img{width:100%;aspect-ratio:21/9;object-fit:cover;border-radius:var(--radius)}
.shot:has(${ART}){display:none}
.tk{direction:ltr;overflow:hidden;white-space:nowrap;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.9rem,4.2vw,3.6rem);line-height:1.1;user-select:none}
.tk.a{background:var(--acc);color:var(--on-acc);padding-block:clamp(1rem,2vw,1.5rem)}
.tk.b{color:var(--acc);border-block:3px solid var(--ink);padding-block:clamp(.8rem,1.6vw,1.2rem)}
.run{display:flex;width:max-content;animation:tk var(--d,40s) linear infinite}
.tk.b .run{animation-direction:reverse}
.half{display:flex;align-items:center;flex:none}
.half span{unicode-bidi:isolate;padding-inline:.5em}
.half i{flex:none;width:.42em;height:.42em;background:currentColor;clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%)}
@keyframes tk{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){.run{animation:none}}
.sec{padding-block:var(--sec)}
h2{font-size:clamp(2rem,4.2vw,3.5rem);line-height:1.02;margin-bottom:clamp(2rem,4vw,3rem);max-width:18ch}
.about{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(2rem,6vw,6rem);align-items:center}
.about img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius)}
.about p{font-size:clamp(1.25rem,2.1vw,1.7rem);line-height:1.45;max-width:36ch}
.about:has(${ART}){grid-template-columns:minmax(0,1fr)}.about figure:has(${ART}){display:none}
.menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(2rem,6vw,6rem)}
.menu li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.3rem 1.5rem;align-items:baseline;padding-block:1.3rem;border-top:1px solid var(--rule)}
.menu h3{font-size:clamp(1.3rem,2vw,1.65rem);line-height:1.2;overflow-wrap:break-word}
.menu .price{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.2rem,1.8vw,1.5rem);color:var(--acc);font-variant-numeric:tabular-nums;white-space:nowrap}
.menu p{grid-column:1/-1;color:var(--quiet);max-width:52ch}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(2rem,4.8vw,4rem);line-height:1.05;max-width:22ch}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:2.5rem clamp(1.5rem,3vw,3rem)}
.cols li{border-top:3px solid var(--ink);padding-top:1.1rem}
.cols h3{font-size:1.35rem;line-height:1.2;margin-bottom:.45rem}.cols p{color:var(--quiet)}
.n{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:2.6rem;line-height:1;color:var(--acc);margin-bottom:.6rem}
.pair{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(1rem,2vw,1.5rem)}
.pair img{width:100%;height:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius)}
.qa{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 clamp(2rem,6vw,6rem)}
.qa div{border-top:1px solid var(--rule);padding-block:1.3rem}
.qa h3{font-size:1.25rem;line-height:1.3;margin-bottom:.4rem}.qa p{color:var(--quiet);max-width:58ch}
.end{background:var(--acc);color:var(--on-acc)}
.end .cl{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(2rem,6vw,6rem);padding-block:var(--sec)}
.end h2{font-size:clamp(2.4rem,6vw,5rem);line-height:.98;max-width:14ch;margin-bottom:1.5rem}
.end .sub{font-size:1.2rem;max-width:38ch;margin-bottom:2rem;opacity:.92}
.end .btn{background:var(--on-acc);color:var(--acc)}.end .btn:hover{background:transparent;color:var(--on-acc);box-shadow:inset 0 0 0 2px var(--on-acc)}
.end dl{display:grid;align-content:start}
.end dl div{padding-block:1rem;border-top:1px solid color-mix(in oklab,var(--on-acc) 35%,var(--acc))}
.end dt{font-size:.9rem;opacity:.8}.end dd{font-size:1.15rem;font-weight:600;overflow-wrap:break-word}.end dd a{text-decoration:none}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-block:1.6rem;border-top:1px solid color-mix(in oklab,var(--on-acc) 35%,var(--acc));font-size:.92rem}
@media (max-width:800px){.top nav{display:none}.about,.menu,.qa,.pair,.end .cl{grid-template-columns:minmax(0,1fr)}.shot img{aspect-ratio:4/3}.about figure{max-width:22rem}}`

/** The words a band repeats: the offer's names, or the tagline when there are none. */
function words(c: TemplateProps['c']): string[] {
  const names = offerItems(c).map((it) => it.name)
  const base = names.length ? names : [c.tagline].filter(Boolean)
  if (!base.length) return []
  // Repeat so each half of the loop is wider than a wide screen.
  const len = base.reduce((n, w) => n + w.length + 4, 0)
  const times = Math.max(1, Math.ceil(90 / len))
  return Array.from({ length: times }, () => base).flat()
}

function Band({ ws, kind }: { ws: string[]; kind: 'a' | 'b' }) {
  if (!ws.length) return null
  const len = ws.reduce((n, w) => n + w.length + 4, 0)
  // Speed stays about the same however many words there are.
  const style = { '--d': `${Math.max(24, Math.round(len * 0.45))}s` } as CSSProperties
  const half = (
    <div className="half">
      {ws.map((w, i) => (
        <Fragment key={i}>
          <span>{w}</span>
          <i />
        </Fragment>
      ))}
    </div>
  )
  // The band only repeats words that are on the page already: hidden from screen readers.
  return (
    <div className={`tk ${kind}`} aria-hidden="true">
      <div className="run" style={style}>
        {half}
        {half}
      </div>
    </div>
  )
}

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
  const ws = words(c)
  const list = offerItems(c)
  return (
    <>
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
        <p className="tag">{c.tagline}</p>
        <h1>{c.headline}</h1>
        <div className="row">
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </div>
      </header>
      <figure className="w shot">
        <Pic photo={c.photos.hero} eager />
      </figure>
      <Band ws={ws} kind="a" />
      <main>
        <section className="sec">
          <div className="w about">
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
            <p>{c.about}</p>
          </div>
        </section>
        <section className="sec" id="offer" style={{ paddingTop: 0 }}>
          <div className="w">
            <h2>{c.offerTitle}</h2>
            {list.length > 0 && (
              <ul className="menu">
                {list.map((it) => (
                  <li key={it.name}>
                    <h3>{it.name}</h3>
                    {it.price ? <span className="price">{it.price}</span> : <span />}
                    {it.detail && <p>{it.detail}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <Band ws={ws} kind="b" />
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

export const ticker: Template = {
  id: 'ticker',
  label: 'Ticker',
  text: 'Lively but disciplined: bands of the offer’s own names slide slowly across the page between sections, one in the organisation’s colour and one between heavy rules, while everything else stays still on a near-white page with a large headline, a plain two-column list with prices in colour and hairline rules: energetic, modern and a little loud, for cafés, bars, gyms, tattoo studios and places with a buzz.',
  dark: false,
  css: CSS,
  Page,
}
