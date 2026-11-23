// Ink: a black gallery catalogue. The page is near black and the photos are the work: the opening
// picture runs edge to edge across the whole screen, the about picture bleeds off the right edge,
// two more hang side by side edge to edge. All the words are small, white and exact, set on one
// 12-column grid like an exhibition catalogue: a hairline across the width opens every section,
// its heading sits small in the left quarter and the content to the right, the offer as a list of
// works (name, detail, price). The business's colour is only a light tint on prices and step
// numbers. With no photos the opening becomes a tall black cover with the headline set large at
// its foot, and the page reads as a type-led catalogue. Photos are square-cornered. For tattoo
// studios, photographers, galleries, bands and designers.

import { Fragment } from 'react'
import {
  type Extra,
  FactRows,
  FaqDetails,
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
:root{color-scheme:dark;--black:color-mix(in oklab,var(--band) 5%,#0a0a0a);--ink:color-mix(in oklab,var(--band) 3%,#f4f3f0);--quiet:color-mix(in oklab,var(--ink) 60%,var(--black));--acc:color-mix(in oklab,var(--band) 42%,#f1ede6);--line:color-mix(in oklab,var(--ink) 20%,var(--black));--w:88rem;--gut:clamp(1.25rem,3.5vw,3rem);--cg:clamp(1rem,2vw,2rem);--sec:clamp(5rem,11vw,10rem)}
body{background:var(--black);color:var(--ink);font-size:1rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.g{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--cg)}
.top{align-items:baseline;padding-block:1.3rem 1.2rem}
.top b{grid-column:1/span 7;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.05rem;line-height:1.3;overflow-wrap:anywhere}
.top nav{grid-column:8/-1;display:flex;justify-content:flex-end;flex-wrap:wrap;gap:.3rem 1.75rem;font-size:.875rem;color:var(--quiet)}
.top nav a{text-decoration:none}.top nav a:hover{color:var(--ink)}
.plate img{width:100%;aspect-ratio:3/2;max-height:72svh;object-fit:cover}
.cap{padding-top:clamp(1.5rem,3vw,2.5rem);row-gap:1.25rem;align-items:start}
.cap .tag{grid-column:1/span 3;color:var(--quiet);font-size:.875rem;padding-top:.55rem}
.cap h1{grid-column:4/span 6;font-size:clamp(1.9rem,3.3vw,3rem);line-height:1.06;overflow-wrap:break-word}
.cap .side{grid-column:10/span 3;padding-top:.55rem}
.cap .sub{color:var(--quiet);font-size:.95rem;max-width:34ch}
.btn{display:inline-block;margin-top:1.5rem;padding:.75rem 1.25rem;background:var(--ink);color:var(--black);border-radius:var(--button-radius);text-decoration:none;font-size:.9rem;font-weight:600;line-height:1.3}
.btn:hover{background:var(--acc)}
.open:has(.plate ${ART}) .plate{display:none}
.open:has(.plate ${ART}) .cap{min-height:min(80svh,50rem);align-content:end;padding-block:clamp(5rem,12vw,9rem) clamp(2.5rem,5vw,4rem);border-bottom:1px solid var(--line)}
.open:has(.plate ${ART}) .cap .tag{grid-column:1/-1;padding-top:0}
.open:has(.plate ${ART}) .cap h1{grid-column:1/span 9;font-size:clamp(2.6rem,6.6vw,6.25rem);line-height:1}
.open:has(.plate ${ART}) .cap .side{grid-column:10/span 3;align-self:end;padding-top:0}
.sec{padding-top:var(--sec)}
.row{border-top:1px solid var(--line)}.row>.g{padding-top:1rem}
.head{grid-column:1/span 3}
.head h2{font-size:clamp(1.1rem,1.5vw,1.35rem);line-height:1.25;padding-inline-end:1rem}
.lead{grid-column:4/span 7;font-family:var(--font-heading);font-size:clamp(1.3rem,2.1vw,1.75rem);line-height:1.45;letter-spacing:var(--heading-tracking)}
figure.bleed{margin-top:var(--sec)}
.bleed img{width:100%;aspect-ratio:16/9;max-height:90svh;object-fit:cover}
.bleed.right{margin-inline-start:calc(max(0px,(100vw - var(--w)) / 2) + var(--gut) + (min(100vw,var(--w)) - 2 * var(--gut) - 11 * var(--cg)) / 4 + 3 * var(--cg))}.bleed.right img{aspect-ratio:3/2}
.works{grid-column:4/-1}
.works li{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr) minmax(4.5rem,auto);gap:.3rem var(--cg);align-items:baseline;padding-block:1.1rem;border-bottom:1px solid var(--line)}
.works li:first-child{padding-top:0}
.works h3{font-size:1.05rem;line-height:1.35;overflow-wrap:break-word}
.works p{color:var(--quiet);font-size:.925rem}
.works .price{text-align:end;color:var(--acc);font-variant-numeric:tabular-nums;white-space:nowrap;font-size:.95rem}
section.pair{margin-top:var(--sec);display:grid;grid-template-columns:7fr 5fr;gap:clamp(.25rem,.5vw,.5rem);height:clamp(20rem,48vw,46rem)}
.pair figure{min-width:0;height:100%}
.pair img{width:100%;height:100%;object-fit:cover}
section.pair:has(${ART}){height:auto}
.say p{grid-column:1/span 9;font-family:var(--font-heading);font-size:clamp(1.7rem,3.5vw,2.9rem);line-height:1.16;letter-spacing:var(--heading-tracking);text-wrap:balance}
.cols{grid-column:4/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(14rem,100%),1fr));gap:2.25rem var(--cg)}
.cols h3{font-size:1.05rem;line-height:1.35;margin-bottom:.4rem}
.cols p{color:var(--quiet);font-size:.95rem;max-width:36ch}
.n{display:block;color:var(--acc);font-size:.875rem;font-variant-numeric:tabular-nums;margin-bottom:.45rem}
.qs{grid-column:4/-1}
.qs details{border-bottom:1px solid var(--line);padding-block:1.1rem}.qs details:first-child{padding-top:0}
.qs summary{font-family:var(--font-heading);font-size:1.05rem;line-height:1.4;display:flex;justify-content:space-between;gap:1.5rem}
.qs summary::after{content:"+";color:var(--quiet);flex:none}.qs details[open] summary::after{content:"−"}
.qs p{color:var(--quiet);font-size:.95rem;padding-top:.5rem;max-width:62ch}
.end{padding-top:var(--sec)}.end>.row+.row{margin-top:var(--sec)}
.end .say2{grid-column:1/span 7}
.end h2{font-size:clamp(1.9rem,3.6vw,3rem);line-height:1.06;margin-bottom:1rem}
.end .sub{color:var(--quiet);max-width:40ch}
.end dl{grid-column:9/span 4;display:grid;gap:1.1rem;align-content:start}
.end dt{color:var(--quiet);font-size:.8125rem}
.end dd{font-size:.95rem;overflow-wrap:anywhere}
.end dd a{text-decoration:none;border-bottom:1px solid var(--line)}.end dd a:hover{border-color:currentColor}
.foot{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.25rem 1.75rem;color:var(--quiet);font-size:.8125rem}
@media (max-width:860px){.g{grid-template-columns:minmax(0,1fr);row-gap:0}.g>*{grid-column:1/-1!important}.top nav{display:none}.plate img{aspect-ratio:4/5;max-height:85svh}.cap{row-gap:1rem}.cap .tag,.cap .side{padding-top:0}.open:has(.plate ${ART}) .cap{min-height:min(72svh,40rem);row-gap:1.25rem}.head h2{margin-bottom:1.75rem}.bleed.right{margin-inline-start:var(--gut)}.bleed img,.bleed.right img{aspect-ratio:4/5;max-height:85svh}section.pair{height:clamp(16rem,70vw,30rem)}.works li{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"n p" "d d"}.works h3{grid-area:n}.works .price{grid-area:p}.works p{grid-area:d}.end dl{margin-top:2.5rem}}`

function Head({ title }: { title: string }) {
  return (
    <div className="head">
      <h2>{title}</h2>
    </div>
  )
}

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
        <div className="row">
          <div className="w g">
            <Head title="Questions" />
            <div className="qs">
              <FaqDetails faq={c.faq} />
            </div>
          </div>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <figure className="bleed">
        <Pic photo={c.photos.cta} />
      </figure>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="sec">
      <div className="row">
        <div className="w g">
          <Head title={l.title} />
          <ol className="cols">
            <ListItems items={l.items} numbered={x === 'steps'} />
          </ol>
        </div>
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
      <div className="w g top">
        <b>{c.name}</b>
        <nav>
          <NavLinks links={links(c, extras)} />
        </nav>
      </div>
      <header className="open">
        <figure className="plate">
          <Pic photo={c.photos.hero} eager />
        </figure>
        <div className="w g cap">
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <div className="side">
            <p className="sub">{c.subhead}</p>
            <a className="btn" href="#visit">
              {c.cta.label}
            </a>
          </div>
        </div>
      </header>
      <main>
        <section className="sec">
          <div className="w g">
            <p className="lead">{c.about}</p>
          </div>
        </section>
        <figure className="bleed right">
          <Pic photo={c.photos.about} />
        </figure>
        <section className="sec" id="offer">
          <div className="row">
            <div className="w g">
              <Head title={c.offerTitle} />
              <ul className="works">
                {offerItems(c).map((it) => (
                  <li key={it.name}>
                    <h3>{it.name}</h3>
                    {it.detail ? <p>{it.detail}</p> : <span />}
                    {it.price ? <span className="price">{it.price}</span> : <span />}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section className="pair">
          <figure>
            <Pic photo={c.photos.d1} />
          </figure>
          <figure>
            <Pic photo={c.photos.d2} />
          </figure>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
        <div className="row">
          <div className="w g">
            <div className="say2">
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
                <FactRows facts={f} />
              </dl>
            )}
          </div>
        </div>
        <div className="row">
          <div className="w foot">
            <span>{c.name}</span>
            <span>{c.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export const ink: Template = {
  id: 'ink',
  label: 'Ink',
  text: 'A near-black gallery catalogue where the photos are the work, running edge to edge across the screen, with small, exact white type on a strict grid, hairlines opening each section and the offer listed like works in an exhibition: spare, confident and art-led, for tattoo studios, photographers, galleries, bands and designers.',
  dark: true,
  css: CSS,
  Page,
}
