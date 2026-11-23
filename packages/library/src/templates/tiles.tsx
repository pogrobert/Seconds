// Tiles: the page is a modular grid of squares. Words sit on tiles of the business's colour and
// its tints; photos fill tiles of their own; the spaces between are colour tiles with one plain
// shape each (a quarter circle, a half circle, a circle, a ring). A photo that is missing becomes
// a shape tile in the same place, so the grid stays whole and the page looks finished with no
// photos at all. Every row is filled to the edge. For yoga, design studios, florists, nurseries.

import { Fragment, type ReactNode } from 'react'
import type { Photo } from '../ui.tsx'
import {
  type Extra,
  FaqDetails,
  facts,
  hasVisit,
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
const REAL = 'img:not([data-art]):not([src^="data:image/svg"])'

const CSS = `${RESET}
:root{--paper:color-mix(in oklab,var(--band) 3%,#fff);--t1:color-mix(in oklab,var(--band) 11%,#fff);--t2:color-mix(in oklab,var(--band) 30%,#fff);--deep:color-mix(in oklab,var(--band) 62%,#000);--ink:color-mix(in oklab,var(--band) 25%,#141414);--quiet:color-mix(in oklab,var(--ink) 70%,var(--t1));--line:color-mix(in oklab,var(--band) 18%,#fff);--w:78rem;--gut:clamp(1rem,3vw,2.5rem);--gap:clamp(.5rem,1vw,.75rem);--cols:4;--cell:calc((min(100vw - 2 * var(--gut),var(--w) - 2 * var(--gut)) - (var(--cols) - 1) * var(--gap)) / var(--cols))}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.55}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:1.25rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.3rem;letter-spacing:var(--heading-tracking);line-height:1.2}
.top nav{display:flex;gap:1.5rem;font-size:.95rem}.top nav a{text-decoration:none}.top nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.grid{display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));grid-auto-rows:minmax(var(--cell),auto);gap:var(--gap)}
main>section,footer>.grid{margin-top:var(--gap)}
.t{position:relative;overflow:hidden;padding:clamp(1.1rem,2vw,1.75rem);display:flex;flex-direction:column;justify-content:space-between;gap:1rem;min-width:0}
.s2{grid-column:span 2}.s3{grid-column:span 3}.s4{grid-column:1/-1}.r2{grid-row:span 2}
.band{background:var(--band);color:var(--band-foreground);--shape:color-mix(in oklab,var(--band-foreground) 22%,var(--band))}
.deep{background:var(--deep);color:var(--band-foreground);--shape:var(--band)}
.t1{background:var(--t1);--shape:var(--t2)}
.t2{background:var(--t2);--shape:var(--band)}
.pap{background:var(--paper);box-shadow:inset 0 0 0 1px var(--line);--shape:var(--t1)}
.sh,.ph{container-type:size;padding:0}
.sh>i,.ph>i{position:absolute;display:block;width:min(100cqw,100cqh);aspect-ratio:1;background:var(--shape)}
.q>i{left:0;bottom:0;border-start-end-radius:100%}
[dir=rtl] .q>i,.q:dir(rtl)>i{left:auto;right:0}
.h>i{left:50%;bottom:0;translate:-50% 50%;border-radius:50%}
.o>i{left:50%;top:50%;translate:-50% -50%;scale:.72;border-radius:50%}
.r>i{left:50%;top:50%;translate:-50% -50%;scale:.72;border-radius:50%;background:none;border:clamp(.9rem,7cqmin,2.25rem) solid var(--shape)}
.ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ph:has(${ART}) img{display:none}
.hero h1{font-size:clamp(2.25rem,4.6vw,4.25rem);line-height:1.02}
.tagt .tag{font-family:var(--font-heading);font-size:clamp(1.1rem,1.6vw,1.35rem);line-height:1.3;letter-spacing:var(--heading-tracking)}
.hero .sub{font-size:clamp(1.05rem,1.4vw,1.2rem);max-width:34ch;opacity:.92;margin-top:1rem}
.btn{display:inline-block;align-self:flex-start;padding:.9rem 1.5rem;border-radius:var(--button-radius);font-weight:600;text-decoration:none;background:var(--band);color:var(--band-foreground)}
.band .btn,.deep .btn{background:var(--band-foreground);color:var(--band)}
.fact dt{font-size:.9rem;opacity:.75}.fact dd{font-family:var(--font-heading);font-size:clamp(1.05rem,1.5vw,1.3rem);line-height:1.3;overflow-wrap:break-word}
.fact dd a{text-decoration:none}
.lead{font-family:var(--font-heading);font-size:clamp(1.2rem,1.9vw,1.6rem);line-height:1.4;letter-spacing:var(--heading-tracking);max-width:36ch}
h2{font-size:clamp(1.6rem,2.6vw,2.4rem);line-height:1.08;overflow-wrap:anywhere}
.item h3{font-size:clamp(1.1rem,1.5vw,1.3rem);line-height:1.25;overflow-wrap:anywhere}
.item p{font-size:.95rem;margin-top:.4rem;opacity:.8}
.item .price{font-family:var(--font-heading);font-size:clamp(1.4rem,2.4vw,2rem);line-height:1;font-variant-numeric:tabular-nums}
.n{font-family:var(--font-heading);font-size:clamp(2.25rem,4vw,3.5rem);line-height:1}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.6rem,3.4vw,3rem);line-height:1.15;letter-spacing:var(--heading-tracking);max-width:28ch;text-wrap:balance}
.qs{justify-content:flex-start}
.qs details{border-top:1px solid var(--line);padding-block:1rem}.qs details:last-child{border-bottom:1px solid var(--line)}
.qs summary{font-family:var(--font-heading);font-size:1.2rem;display:flex;justify-content:space-between;gap:1rem}
.qs summary::after{content:"+";flex:none}.qs details[open] summary::after{content:"−"}
.qs p{padding-top:.6rem;color:var(--quiet);max-width:60ch}
.end h2{font-size:clamp(2rem,4vw,3.5rem);line-height:1.04}
.end .sub{opacity:.9;margin-top:1rem;max-width:36ch;font-size:1.1rem}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-block:2rem;font-size:.92rem;color:var(--quiet)}
section.gal:not(:has(${REAL})){display:none}
@media (max-width:760px){:root{--cols:2}.top nav{display:none}.s3,.s4,.m2{grid-column:1/-1}.r2{grid-row:auto}.dk{display:none}.hero .copy{min-height:calc(var(--cell) * 2)}#questions{grid-auto-rows:auto}}`

/** An email address may break after its @ and before its dots, never inside a word. */
const breakable = (v: string) =>
  v.includes('@')
    ? v.split(/(?=[@.])/).map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          {part}
        </Fragment>
      ))
    : v

/** A colour tile with one shape: the filler that keeps every row of the grid whole. */
const shapes = ['q', 'h', 'o', 'r'] as const
const tones = ['t2', 'band', 't1', 'deep'] as const
function Shape(p: { k: number; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`t sh ${shapes[p.k % 4]} ${tones[(p.k + 1) % 4]} ${p.className ?? ''}`}
    >
      <i />
    </div>
  )
}

/** A photo tile; with no photo it shows its shape instead, in the same place. */
function Ph(p: { photo: Photo; k: number; className?: string; eager?: boolean }) {
  return (
    <figure className={`t ph ${shapes[p.k % 4]} ${tones[p.k % 4]} ${p.className ?? ''}`}>
      <i aria-hidden="true" />
      <Pic photo={p.photo} eager={p.eager} />
    </figure>
  )
}

/**
 * Fill the rest of the last row: `used` grid units at 4 columns and at 2 (phone). Fillers needed
 * only at 4 columns are hidden on a phone.
 */
function fill(used4: number, used2: number, seed: number): ReactNode[] {
  const n4 = (4 - (used4 % 4)) % 4
  const n2 = (2 - (used2 % 2)) % 2
  return Array.from({ length: n4 }, (_, i) => (
    <Shape key={`f${seed}-${i}`} k={seed + i} className={i < n2 ? '' : 'dk'} />
  ))
}

function List({ c, x, k }: { c: TemplateProps['c']; x: Extra; k: number }) {
  const l = listOf(c, x)
  if (!l) return null
  const tone = ['t1', 'pap', 't1', 'pap']
  return (
    <section className="w grid">
      <div className="t band">
        <h2>{l.title}</h2>
      </div>
      {l.items.map((it, i) => (
        <div key={it.title} className={`t item ${tone[i % 4]}`}>
          {x === 'steps' ? <span className="n">{i + 1}</span> : <span />}
          <div>
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </div>
        </div>
      ))}
      {fill(1 + l.items.length, 1 + l.items.length, k)}
    </section>
  )
}

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="w grid">
        <div className="t s3 deep say">
          <span />
          <p>{c.statement}</p>
        </div>
        <Shape k={0} className="dk" />
      </section>
    )
  if (x === 'faq')
    return (
      <section className="w grid" id="questions">
        <div className="t t2 m2">
          <h2>Questions</h2>
        </div>
        <div className="t s3 pap qs">
          <FaqDetails faq={c.faq} />
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="w grid gal">
        <Ph photo={c.photos.d2} k={1} className="s2" />
        <Ph photo={c.photos.cta} k={2} />
        <Shape k={2} />
      </section>
    )
  return <List c={c} x={x} k={x === 'reasons' ? 1 : x === 'audience' ? 2 : 3} />
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const its = offerItems(c)
  const offerTones = ['t1', 'pap', 't2', 'pap', 't1']
  const reach = reachOf(f)
  return (
    <>
      <div className="w top">
        <b>{c.name}</b>
        <nav>
          <NavLinks links={links(c, extras)} />
        </nav>
      </div>
      <header className="w grid hero">
        <div className="t band s2 r2 copy">
          <span />
          <div>
            <h1>{c.headline}</h1>
            <p className="sub">{c.subhead}</p>
          </div>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </div>
        <Ph photo={c.photos.hero} k={1} className="s2" eager />
        <Shape k={0} />
        <div className="t t1 tagt">
          <span />
          <p className="tag">{c.tagline}</p>
        </div>
      </header>
      <main>
        <section className="w grid">
          <div className="t s2 pap">
            <span />
            <p className="lead">{c.about}</p>
          </div>
          <Ph photo={c.photos.about} k={2} />
          <Shape k={3} />
        </section>
        <section className="w grid" id="offer">
          <div className="t deep">
            <h2>{c.offerTitle}</h2>
          </div>
          {its.map((it, i) => (
            <Fragment key={it.name}>
              <div className={`t item ${offerTones[i % 5]}`}>
                <div>
                  <h3>{it.name}</h3>
                  {it.detail && <p>{it.detail}</p>}
                </div>
                {it.price ? <span className="price">{it.price}</span> : <span />}
              </div>
              {i === 1 && <Ph photo={c.photos.d1} k={3} />}
            </Fragment>
          ))}
          {its.length < 2 && <Ph photo={c.photos.d1} k={3} />}
          {fill(2 + its.length, 2 + its.length, 1)}
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer id="visit">
        <div className="w grid end">
          <div className="t band s2 r2">
            <div>
              <h2>{c.cta.headline}</h2>
              <p className="sub">{c.cta.subhead}</p>
            </div>
            {reach && (
              <a className="btn" href={reach.href}>
                {c.cta.label}
              </a>
            )}
          </div>
          {hasVisit(c) &&
            f.map((x, i) => (
              <dl key={x.label} className={`t fact ${i % 3 === 1 ? 't2' : 't1'}`}>
                <dt>{x.label}</dt>
                <dd>{x.href ? <a href={x.href}>{breakable(x.value)}</a> : x.value}</dd>
              </dl>
            ))}
          {Array.from({ length: 4 - (hasVisit(c) ? f.length : 0) }, (_, i) => (
            <Shape key={i} k={i + 2} className={i < (hasVisit(c) ? f.length : 0) % 2 ? '' : 'dk'} />
          ))}
        </div>
        <div className="w foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const tiles: Template = {
  id: 'tiles',
  label: 'Tiles',
  text: "A modular grid of squares: the promise on a tile of the organisation's own colour, photos on tiles of their own and colour tiles with one simple shape between them, every row filled to the edge; bright, orderly and made, and complete even with no photos, for yoga studios, design studios, florists, nurseries and makers.",
  dark: false,
  css: CSS,
  Page,
}
