// Atelier: crafted and personal, like a maker's workroom kept tidy. Warm pale paper; the name sewn
// on like a garment label; beside the promise, a photo in a stitched mount (no swatch card: Robert,
// 2026-11-23, no fake decorations). The offer hangs from a rail
// as fabric tags, each on its own thread with a punched hole and a stitched edge, the price at the
// foot. Sections are parted by dashed seams; the facts at the close sit on a sewn-in care label.
// Calm and premium, with the maker's hand only in the details. For tailors, dressmakers, interior
// designers, upholsterers, dog groomers and other makers.

import { Fragment } from 'react'
import type { Photo } from '../ui.tsx'
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

const isArt = (p: Photo) => p.src.startsWith('data:image/svg')

/** A pinked edge (cut with pinking shears) along the bottom of a swatch. */
const PINK = (() => {
  const n = 8
  const pts = ['0 0', '100% 0']
  for (let i = n; i >= 0; i--) {
    const x = (i / n) * 100
    pts.push(`${x}% ${i % 2 ? '100%' : 'calc(100% - 7px)'}`)
  }
  return `polygon(${pts.join(',')})`
})()

const TINTS = [100, 72, 48, 28, 14]

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 4%,#faf8f4);--card:color-mix(in oklab,var(--band) 2%,#fffefc);--tint:color-mix(in oklab,var(--band) 10%,#f6f2ea);--seam:color-mix(in oklab,var(--band) 45%,#b9b0a2);--line:color-mix(in oklab,var(--band) 18%,#e2dbcf);--ink:color-mix(in oklab,var(--band) 20%,#1d1b18);--quiet:color-mix(in oklab,var(--ink) 70%,var(--paper));--deep:color-mix(in oklab,var(--band) 85%,#000);--w:74rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4.5rem,8.5vw,7.5rem);--r:calc(var(--radius) * .5)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.65}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1rem 2rem;padding-block:1.5rem}
.lbl{display:inline-block;background:var(--acc);color:var(--on-acc);padding:.55rem 1.1rem;outline:1.5px dashed color-mix(in oklab,var(--on-acc) 60%,transparent);outline-offset:-5px;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:1.15rem;line-height:1.3;max-width:100%;overflow-wrap:anywhere}
.top nav{display:flex;gap:1.75rem;font-size:.98rem}
.top nav a{text-decoration:none;padding-block:.35rem;border-bottom:1.5px dashed transparent}
.top nav a:hover{border-bottom-color:var(--seam)}
.hero{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(2.5rem,6vw,6rem);align-items:center;padding-block:clamp(2.5rem,6vw,5rem) var(--sec)}
.tag{color:var(--quiet);margin-bottom:1.25rem;font-size:1.05rem}
.hero h1{font-size:clamp(2.6rem,5.6vw,4.9rem);line-height:1.05;margin-bottom:1.5rem}
.hero p.sub{font-size:clamp(1.15rem,1.6vw,1.3rem);color:var(--quiet);max-width:36ch;margin-bottom:2.25rem}
.btn{display:inline-block;padding:.95rem 1.7rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:600;text-decoration:none;line-height:1.3;outline:1.5px dashed color-mix(in oklab,var(--on-acc) 55%,transparent);outline-offset:-5px}
.btn:hover{filter:brightness(1.08)}
.btn:focus-visible{outline:2px solid var(--ink);outline-offset:3px}
.st{background:var(--card);padding:.8rem;border:1px solid var(--line);border-radius:var(--r);position:relative}
.st::after{content:"";position:absolute;inset:.4rem;border:1.5px dashed var(--seam);border-radius:calc(var(--r) * .6);pointer-events:none}
.st img{width:100%;object-fit:cover;border-radius:calc(var(--r) * .5)}
.visual{position:relative;padding-bottom:3.5rem;padding-inline-start:2.5rem}
.visual img{aspect-ratio:4/5}
${TINTS.map((t, i) => `.sq:nth-child(5n+${i + 1}) .mark{background:color-mix(in oklab,var(--band) ${t}%,var(--paper))}`).join('\n')}
.sec{padding-block:var(--sec)}
.sec+.sec,.seam{border-top:1.5px dashed var(--seam)}
h2{font-size:clamp(1.9rem,3.4vw,2.75rem);line-height:1.12;max-width:24ch;margin-bottom:clamp(2rem,4vw,3rem)}
.about{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(2.5rem,6vw,6rem);align-items:center}
.about.solo{grid-template-columns:minmax(0,1fr)}
.about img{aspect-ratio:1/1}
.about p{font-family:var(--font-heading);font-size:clamp(1.45rem,2.3vw,1.95rem);line-height:1.45;letter-spacing:var(--heading-tracking);max-width:36ch}
.rail{display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));row-gap:2.5rem}
.rail>li{border-top:3px solid var(--ink);position:relative;padding-inline:clamp(.6rem,1.2vw,1rem);--s:1.6rem}
.rail>li:nth-child(3n+2){--s:2.8rem}.rail>li:nth-child(3n){--s:2.1rem}
.rail>li::before{content:"";position:absolute;top:0;left:50%;width:1px;height:calc(var(--s) + 1.2rem);background:var(--ink)}
.ft{position:relative;margin-top:var(--s);background:var(--tint);padding:2.6rem 1.25rem 1.3rem;clip-path:polygon(22% 0,78% 0,100% 1.4rem,100% 100%,0 100%,0 1.4rem);transform-origin:50% 0}
.rail>li:nth-child(4n+1) .ft{transform:rotate(-1.2deg)}.rail>li:nth-child(4n+3) .ft{transform:rotate(1deg)}
.ft::before{content:"";position:absolute;top:.7rem;left:50%;width:.8rem;height:.8rem;margin-left:-.4rem;border-radius:50%;background:var(--paper);box-shadow:inset 0 0 0 2px var(--seam)}
.ft::after{content:"";position:absolute;inset:1.7rem .45rem .45rem;border:1.5px dashed var(--seam);border-top:0;pointer-events:none}
.ft h3{font-size:1.2rem;line-height:1.3;overflow-wrap:anywhere}
.ft p{color:var(--quiet);font-size:.98rem;margin-top:.45rem;overflow-wrap:anywhere}
.ft .price{display:block;margin-top:1rem;padding-top:.7rem;border-top:1px solid var(--line);font-family:var(--font-heading);font-size:1.2rem;font-variant-numeric:tabular-nums}
.pair{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:clamp(1.5rem,4vw,3.5rem);align-items:start}
.pair figure:last-child{margin-top:clamp(3rem,8vw,7rem)}
.pair img{aspect-ratio:4/5}
.patch{background:var(--acc);color:var(--on-acc);padding:clamp(2.5rem,6vw,4.5rem) clamp(1.75rem,6vw,5rem);outline:1.5px dashed color-mix(in oklab,var(--on-acc) 55%,transparent);outline-offset:-.75rem;border-radius:var(--r);max-width:58rem}
.patch p{font-family:var(--font-heading);font-size:clamp(1.7rem,3.4vw,2.6rem);line-height:1.28;letter-spacing:var(--heading-tracking);text-wrap:balance}
.cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(2.25rem,4vw,3.5rem) clamp(2rem,6vw,5rem);max-width:62rem}
.sq{display:grid;grid-template-columns:auto minmax(0,1fr);gap:0 1.25rem}
.sq .mark{width:1.9rem;height:2.6rem;clip-path:${PINK};margin-top:.2rem}
.cols h3{font-size:1.3rem;line-height:1.3;margin-bottom:.45rem}
.cols p{color:var(--quiet)}
.n{display:grid;place-items:center;width:3rem;height:3rem;border-radius:50%;border:1.5px dashed var(--seam);color:var(--deep);font-family:var(--font-heading);font-size:1.3rem;line-height:1;margin-bottom:1.1rem;font-variant-numeric:tabular-nums}
.faq{max-width:50rem}
.faq details{border-top:1.5px dashed var(--seam);padding-block:1.3rem}
.faq details:last-child{border-bottom:1.5px dashed var(--seam)}
.faq summary{display:flex;justify-content:space-between;gap:1.25rem;font-family:var(--font-heading);font-size:1.25rem;line-height:1.35}
.faq summary::after{content:"+";color:var(--deep);font-size:1.4rem;line-height:1}
.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.75rem;max-width:60ch}
.end{background:var(--acc);color:var(--on-acc)}
.end .in{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(2.5rem,6vw,6rem);align-items:center;padding-block:var(--sec)}
.end .in.solo{grid-template-columns:minmax(0,1fr)}
.end h2{font-size:clamp(2.1rem,4.4vw,3.6rem);line-height:1.08;margin-bottom:1.25rem}
.end p.sub{font-size:1.15rem;opacity:.92;max-width:38ch;margin-bottom:2.25rem}
.end .btn{background:var(--on-acc);color:var(--acc);outline-color:color-mix(in oklab,var(--acc) 45%,transparent)}
.care{background:var(--card);color:var(--ink);padding:2rem 1.75rem 2.4rem;position:relative;clip-path:${PINK}}
.care::after{content:"";position:absolute;inset:.5rem .5rem 1rem;border:1.5px dashed var(--seam);pointer-events:none}
.care dl{display:grid;gap:1.1rem}
.care dt{font-size:.88rem;color:var(--quiet)}
.care dd{font-weight:600;line-height:1.45;overflow-wrap:anywhere}
.care dd a{text-decoration:none;border-bottom:1px solid var(--line)}
.foot{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:2rem 2.5rem;font-size:.92rem;opacity:.85;border-top:1.5px dashed color-mix(in oklab,var(--on-acc) 35%,transparent)}
@media (max-width:860px){.hero,.about,.end .in{grid-template-columns:minmax(0,1fr)}.visual{max-width:30rem}.visual img{aspect-ratio:4/3}.about figure{max-width:22rem}.cols{grid-template-columns:minmax(0,1fr)}.top nav a:not(:last-child){display:none}}
@media (max-width:560px){.rail{grid-template-columns:minmax(0,1fr);row-gap:0;border-inline-start:3px solid var(--ink)}.rail>li{border-top:0;padding-block:.75rem;padding-inline:1.5rem 0}.rail>li::before{top:2rem;left:auto;inset-inline-start:0;width:1.5rem;height:1px}.ft,.rail>li:nth-child(n) .ft{margin-top:0;transform:none;clip-path:none;padding:1.2rem 1.2rem 1.2rem 2.75rem}.ft::before{top:1.6rem;left:auto;inset-inline-start:.9rem;margin:0}.ft::after{inset:.4rem;border-top:1.5px dashed var(--seam)}.pair{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:1rem}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec">
        <div className="w">
          <div className="patch">
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
          <div className="faq">
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
          <figure className="st">
            <Pic photo={c.photos.d2} />
          </figure>
          <figure className="st">
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
            <li key={it.title} className={x === 'steps' ? undefined : 'sq'}>
              {x === 'steps' ? <span className="n">{i + 1}</span> : <i className="mark" />}
              <div>
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </div>
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
  const call = f.find((x) => x.href)
  const aboutPhoto = !isArt(c.photos.about)
  const offer = offerItems(c)
  return (
    <>
      <div className="w top">
        <b className="lbl">{c.name}</b>
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
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </div>
        <div className="visual">
          <figure className="st">
            <Pic photo={c.photos.hero} eager />
          </figure>
        </div>
      </header>
      <main>
        <section className="sec seam">
          <div className={aboutPhoto ? 'w about' : 'w about solo'}>
            {aboutPhoto && (
              <figure className="st">
                <Pic photo={c.photos.about} />
              </figure>
            )}
            <p>{c.about}</p>
          </div>
        </section>
        {offer.length > 0 && (
          <section className="sec" id="offer">
            <div className="w">
              <h2>{c.offerTitle}</h2>
              <ul className="rail">
                {offer.map((it) => (
                  <li key={it.name}>
                    <div className="ft">
                      <h3>{it.name}</h3>
                      {it.detail && <p>{it.detail}</p>}
                      {it.price && <span className="price">{it.price}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
        {!xs.includes('gallery') && (
          <section className="sec">
            <div className="w pair">
              <figure className="st">
                <Pic photo={c.photos.d1} />
              </figure>
              <figure className="st">
                <Pic photo={c.photos.d2} />
              </figure>
            </div>
          </section>
        )}
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
        <div className={hasVisit(c) ? 'w in' : 'w in solo'}>
          <div>
            <h2>{c.cta.headline}</h2>
            <p className="sub">{c.cta.subhead}</p>
            {call && (
              <a className="btn" href={call.href}>
                {c.cta.label}
              </a>
            )}
          </div>
          {hasVisit(c) && (
            <div className="care">
              <dl>
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
        <div className="w">
          <div className="foot">
            <span>{c.name}</span>
            <span>{c.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export const atelier: Template = {
  id: 'atelier',
  label: 'Atelier',
  text: "Crafted and personal like a maker's workroom: the name sewn on like a garment label, the opening photo in a stitched mount, the offer hanging from a rail as fabric tags with stitched edges and prices, dashed seams between sections and the details on a sewn-in care label; calm and premium with a handmade touch, for tailors, dressmakers, alterations, interior designers, upholsterers, curtain makers and dog groomers.",
  dark: false,
  css: CSS,
  Page,
}
