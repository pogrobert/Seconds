// Postcard: the opening is a postcard lying on a warm table. One side is the photo in a white
// border; the other is the writing side, with a perforated stamp drawn in CSS, a postmark, the
// message (the headline) and the business's own name and address on ruled lines. With no photo
// the card shows its writing side alone, message beside address, as the back of a real postcard.
// Below, every photo is a white-bordered print, the offer reads like an itinerary on perforated
// lines, and the closing has an airmail edge. For B&Bs, holiday lets, tours and campsites.

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
:root{--acc:var(--band);--on-acc:var(--band-foreground);--desk:color-mix(in oklab,var(--band) 9%,#f3eee5);--paper:color-mix(in oklab,var(--band) 3%,#fdfbf7);--card:#fff;--ink:color-mix(in oklab,var(--band) 25%,#1c1a18);--quiet:color-mix(in oklab,var(--ink) 66%,var(--paper));--line:color-mix(in oklab,var(--band) 20%,#e6e0d6);--sun:color-mix(in oklab,var(--band) 12%,#f6c86a);--w:74rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4.5rem,9vw,8rem);--edge:clamp(.6rem,1.2vw,1rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.desk{background:var(--desk)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:1.4rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.3rem;letter-spacing:var(--heading-tracking);line-height:1.2}
.top nav{display:flex;gap:1.75rem;font-size:.95rem}.top nav a{text-decoration:none;color:var(--quiet)}.top nav a:hover{color:var(--ink)}
.hero{padding-block:clamp(1.5rem,4vw,3.5rem) clamp(4rem,8vw,7rem)}
.card{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);background:var(--card);padding:var(--edge);rotate:-.8deg;box-shadow:0 1px 2px rgb(0 0 0/.08),0 24px 50px -28px rgb(0 0 0/.35)}
.front{position:relative;min-height:clamp(24rem,42vw,34rem)}
.front img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.back{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"tag stamp" "msg msg" "addr addr";gap:1.25rem 1.5rem;align-content:space-between;padding:clamp(1.25rem,2.6vw,2.25rem)}
.back .tag{grid-area:tag;color:var(--quiet);font-size:.98rem;align-self:start}
.stamp{grid-area:stamp;position:relative;width:clamp(4.5rem,6vw,5.75rem);aspect-ratio:4/5;background:var(--desk);border:.3rem dotted var(--card);outline:1px solid var(--line);outline-offset:-.3rem;padding:.3rem;rotate:3deg}
.stamp i{position:relative;display:block;height:100%;overflow:hidden;background:var(--acc)}
.stamp i::before{content:"";position:absolute;width:42%;aspect-ratio:1;border-radius:50%;background:var(--sun);top:16%;inset-inline-end:16%}
.stamp i::after{content:"";position:absolute;width:150%;height:55%;border-radius:50%;background:color-mix(in oklab,var(--on-acc) 30%,var(--acc));bottom:-30%;inset-inline-start:-25%}
.mark{position:absolute;width:4.5rem;aspect-ratio:1;border-radius:50%;border:2px solid color-mix(in oklab,var(--ink) 35%,transparent);bottom:-1.5rem;inset-inline-start:-2.75rem;rotate:-14deg}
.mark::after{content:"";position:absolute;top:50%;translate:0 -50%;inset-inline-end:60%;width:5rem;height:1.1rem;background:repeating-linear-gradient(180deg,color-mix(in oklab,var(--ink) 35%,transparent) 0 2px,transparent 2px .45rem)}
.msg{grid-area:msg}
.msg h1{font-size:clamp(2rem,3.6vw,3.4rem);line-height:1.05;margin-bottom:1rem}
.msg .sub{color:var(--quiet);font-size:clamp(1.02rem,1.3vw,1.15rem);max-width:38ch;margin-bottom:1.5rem}
.btn{display:inline-block;padding:.9rem 1.5rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:600;text-decoration:none}
.addr{grid-area:addr;font-family:var(--font-heading);font-size:1.1rem;line-height:1.3}
.addr li{border-bottom:1px solid var(--line);padding-block:.55rem .3rem;overflow-wrap:break-word}
.card:has(.front ${ART}){grid-template-columns:minmax(0,1fr);max-width:62rem;margin-inline:auto}
.card:has(.front ${ART}) .front{display:none}
.card:has(.front ${ART}) .back{grid-template-columns:minmax(0,3fr) minmax(0,2fr);grid-template-areas:"tag stamp" "msg addr";gap:2rem clamp(1.5rem,4vw,3.5rem);padding:clamp(1.5rem,4vw,3.5rem)}
.card:has(.front ${ART}) .stamp{justify-self:end}
.card:has(.front ${ART}) .addr{align-self:end;border-inline-start:1px solid var(--line);padding-inline-start:clamp(1.25rem,3vw,2.5rem)}
.card:has(.front ${ART}) .msg h1{font-size:clamp(2.2rem,4.4vw,3.9rem)}
.print img{width:100%;height:auto;object-fit:cover;border:var(--edge) solid var(--card);box-shadow:0 1px 2px rgb(0 0 0/.1),0 16px 34px -22px rgb(0 0 0/.4)}
.sec{padding-block:var(--sec)}
h2{font-size:clamp(1.9rem,3.4vw,2.8rem);line-height:1.1;margin-bottom:clamp(1.75rem,3vw,2.5rem)}
.about{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,6fr);gap:clamp(2rem,6vw,6rem);align-items:center}
.about img{aspect-ratio:4/5;rotate:2deg}
.about:has(${ART}){grid-template-columns:minmax(0,1fr);max-width:52rem}.about figure:has(${ART}){display:none}
.lead{font-family:var(--font-heading);font-size:clamp(1.35rem,2.2vw,1.8rem);line-height:1.45;letter-spacing:var(--heading-tracking);max-width:36ch}
.offer{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:clamp(2rem,6vw,6rem);align-items:start}
.offer:has(.print ${ART}){grid-template-columns:minmax(0,1fr);max-width:52rem}.offer .print:has(${ART}){display:none}
.offer .print img{aspect-ratio:3/4;rotate:-2deg}
.trip li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.25rem 1.5rem;padding-block:1.2rem;border-top:2px dashed var(--line)}
.trip li:last-child{border-bottom:2px dashed var(--line)}
.trip h3{font-size:1.3rem;line-height:1.25}
.trip .price{font-family:var(--font-heading);font-size:1.25rem;font-variant-numeric:tabular-nums;white-space:nowrap}
.trip p{grid-column:1/-1;color:var(--quiet);max-width:52ch}
.say{background:var(--desk);text-align:center}
.say p{font-family:var(--font-heading);font-size:clamp(1.8rem,3.8vw,3.1rem);line-height:1.2;letter-spacing:var(--heading-tracking);max-width:26ch;margin-inline:auto;text-wrap:balance}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:2.25rem clamp(1.5rem,3vw,3rem)}
.cols li{border-top:2px dashed var(--line);padding-top:1.1rem}
.cols h3{font-size:1.25rem;line-height:1.25;margin-bottom:.4rem}.cols p{color:var(--quiet)}
.n{display:block;font-family:var(--font-heading);font-size:1.6rem;line-height:1;color:var(--acc);margin-bottom:.6rem}
.strip{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,4fr);gap:clamp(1.5rem,4vw,3.5rem);align-items:center}
.strip img{aspect-ratio:4/3;rotate:-1.5deg}
.strip figure:last-child img{aspect-ratio:4/5;rotate:2deg}
.faq>div{max-width:50rem}
.faq details{border-top:2px dashed var(--line);padding-block:1.15rem}.faq details:last-child{border-bottom:2px dashed var(--line)}
.faq summary{font-family:var(--font-heading);font-size:1.2rem;display:flex;justify-content:space-between;gap:1rem}
.faq summary::after{content:"+";color:var(--acc);flex:none}.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.6rem;max-width:60ch}
.end{background:var(--acc);color:var(--on-acc);border-top:.75rem solid transparent;border-image:repeating-linear-gradient(-45deg,var(--on-acc) 0 .9rem,var(--sun) .9rem 1.8rem,var(--on-acc) 1.8rem 2.7rem,color-mix(in oklab,var(--acc) 55%,#000) 2.7rem 3.6rem) 1}
.end .cl{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2rem,5vw,5rem);padding-block:var(--sec)}
.end h2{font-size:clamp(2.2rem,4.6vw,3.8rem);line-height:1.05;margin-bottom:1.25rem}
.end .sub{font-size:1.15rem;opacity:.92;max-width:38ch;margin-bottom:2rem}
.end .btn{background:var(--on-acc);color:var(--acc)}
.end dl{display:grid;gap:1.3rem;align-content:start}
.end dt{font-size:.9rem;opacity:.75}.end dd{font-family:var(--font-heading);font-size:1.15rem;overflow-wrap:break-word}.end dd a{text-decoration:none;border-bottom:1px solid currentColor}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-block:1.75rem;font-size:.92rem;opacity:.85;border-top:1px solid color-mix(in oklab,var(--on-acc) 25%,transparent)}
@media (max-width:760px){.top nav{display:none}.card{grid-template-columns:minmax(0,1fr);rotate:none}.front{min-height:0;aspect-ratio:4/3}.card:has(.front ${ART}) .back{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"tag stamp" "msg msg" "addr addr"}.card:has(.front ${ART}) .addr{border-inline-start:0;padding-inline-start:0}.about,.offer,.strip,.end .cl{grid-template-columns:minmax(0,1fr)}.about figure{max-width:17rem}.offer .print{max-width:17rem}.mark{width:3.5rem;inset-inline-start:-2rem}.mark::after{width:3rem}}`

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
        <div className="w strip">
          <figure className="print">
            <Pic photo={c.photos.d2} />
          </figure>
          <figure className="print">
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
  const reach = f.find((x) => x.href)
  // The writing side's address lines: the name, then where the business is (or how to reach it).
  const lines = [
    c.name,
    ...(c.address.length ? c.address : [c.phone, c.email].filter((v): v is string => !!v)),
  ]
  return (
    <>
      <div className="desk">
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
          <div className="card">
            <figure className="front">
              <Pic photo={c.photos.hero} eager />
            </figure>
            <div className="back">
              <p className="tag">{c.tagline}</p>
              <div className="stamp" aria-hidden="true">
                <i />
                <span className="mark" />
              </div>
              <div className="msg">
                <h1>{c.headline}</h1>
                <p className="sub">{c.subhead}</p>
                <a className="btn" href="#visit">
                  {c.cta.label}
                </a>
              </div>
              <ul className="addr">
                {lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          </div>
        </header>
      </div>
      <main>
        <section className="sec">
          <div className="w about">
            <figure className="print">
              <Pic photo={c.photos.about} />
            </figure>
            <p className="lead">{c.about}</p>
          </div>
        </section>
        <section className="sec" id="offer" style={{ paddingTop: 0 }}>
          <div className="w offer">
            <div>
              <h2>{c.offerTitle}</h2>
              <ul className="trip">
                {offerItems(c).map((it) => (
                  <li key={it.name}>
                    <h3>{it.name}</h3>
                    {it.price ? <span className="price">{it.price}</span> : <span />}
                    {it.detail && <p>{it.detail}</p>}
                  </li>
                ))}
              </ul>
            </div>
            <figure className="print">
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

export const postcard: Template = {
  id: 'postcard',
  label: 'Postcard',
  text: 'Opens with a postcard on a warm table: the photo in a white border beside a writing side with a drawn stamp, the promise as the message and the address on ruled lines; below, photos as white-bordered prints, the offer like an itinerary and an airmail edge on the closing: relaxed, personal and full of travel, for B&Bs, holiday lets, guesthouses, tours and campsites.',
  dark: false,
  css: CSS,
  Page,
}
