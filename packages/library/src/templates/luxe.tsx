// Quiet luxe: light, airy and unhurried, like the page of a jeweller or a small hotel. A near-white
// page with a great deal of space, large fine headings and small, lightly spaced text. The boldness
// is spent once, at the opening: the promise set very large, the subhead and button stepped off to
// the right, and one photo running from edge to edge. After that the page is calm: a tall portrait
// beside the introduction, the offer as an open two-column list, one offset photo, a staggered
// pair. The recurring detail is a fine thread in the business's colour that runs in from the edge
// of the window to each heading; otherwise the colour appears only in the buttons and step
// numbers. With no photos the type and the threads carry the page. For jewellers, boutique hotels,
// perfumers, wineries, bridal shops and other high-end services.

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
:root{--acc:color-mix(in oklab,var(--band) 88%,#000);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 2%,#fdfcfa);--tint:color-mix(in oklab,var(--band) 6%,#f9f7f3);--ink:color-mix(in oklab,var(--band) 14%,#1b1a19);--quiet:color-mix(in oklab,var(--ink) 64%,var(--paper));--line:color-mix(in oklab,var(--band) 14%,#e4e1db);--w:72rem;--gut:clamp(1.25rem,5vw,4rem);--sec:clamp(5.5rem,12vw,11rem);--gap:clamp(1rem,2.5vw,2.5rem)}
body{background:var(--paper);color:var(--ink);font-size:1.03rem;line-height:1.75}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.g{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gap)}
.clip{overflow-x:clip}
.th{position:relative}
.th::before{content:"";position:absolute;inset-inline-end:calc(100% + clamp(1rem,2vw,1.75rem));top:.62em;width:100vw;border-top:1px solid var(--acc)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:clamp(1.5rem,3vw,2.25rem)}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.2rem;line-height:1.25;min-width:0}
.top nav{display:flex;gap:2.25rem;font-size:.9rem;letter-spacing:.03em;flex-shrink:0}
.top nav a{text-decoration:none;color:var(--quiet)}.top nav a:hover{color:var(--ink);text-decoration:underline;text-underline-offset:.4em;text-decoration-thickness:1px}
.open{padding-top:clamp(3.5rem,9vw,8rem)}
.open .tag{grid-column:1/span 6;color:var(--quiet);font-size:.95rem;letter-spacing:.03em;line-height:1.5}
.open .tag::before{top:.75em}
.open h1{grid-column:1/span 11;font-size:clamp(2.6rem,6.4vw,6rem);line-height:1.04;margin-top:clamp(1.5rem,3vw,2.5rem);overflow-wrap:break-word}
.open .aside{grid-column:8/span 5;margin-top:clamp(2.5rem,5vw,4.5rem)}
.open .sub{color:var(--quiet);font-size:clamp(1.05rem,1.3vw,1.2rem);line-height:1.65;max-width:36ch;margin-bottom:2.25rem}
.hero{margin-top:clamp(4rem,9vw,8rem)}
.hero img{width:100%;aspect-ratio:12/5;max-height:84vh;object-fit:cover}
.open:has(${ART}){padding-bottom:clamp(1rem,3vw,2.5rem)}
.open:has(${ART}) h1{font-size:clamp(2.8rem,7.2vw,6.75rem)}
.btn{display:inline-block;padding:1rem 2.1rem;border:1px solid var(--acc);border-radius:var(--button-radius);color:var(--acc);font-size:.92rem;letter-spacing:.05em;line-height:1.3;text-decoration:none;transition:background-color .35s,color .35s}
.btn:hover{background:var(--acc);color:var(--on-acc)}
.btn.fill{background:var(--acc);color:var(--on-acc)}.btn.fill:hover{background:var(--ink);border-color:var(--ink)}
.sec{padding-block:var(--sec)}
.sec+.sec{padding-top:0}
.about{align-items:end}
.about .pic{grid-column:1/span 5}
.about .pic img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:calc(var(--radius) * .35)}
.about .lead{grid-column:7/span 6;padding-bottom:clamp(0rem,4vw,3rem)}
.lead{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.3rem,2vw,1.75rem);line-height:1.55;max-width:32ch}
.about:has(${ART}) .pic{display:none}
.about:has(${ART}) .lead{grid-column:1/span 9;font-size:clamp(1.45rem,2.6vw,2.2rem);max-width:36ch}
h2{font-size:clamp(2rem,3.8vw,3.25rem);line-height:1.1;grid-column:1/span 8;margin-bottom:clamp(2.5rem,6vw,5rem)}
.menu{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(2rem,7vw,7rem)}
.menu li{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:baseline;gap:.3rem 1.5rem;padding-block:clamp(1.5rem,2.6vw,2.1rem);border-top:1px solid var(--line)}
.menu h3{font-size:clamp(1.2rem,1.6vw,1.4rem);line-height:1.3}
.menu .price{font-family:var(--font-heading);font-size:1.1rem;font-variant-numeric:tabular-nums;white-space:nowrap}
.menu p{grid-column:1/-1;color:var(--quiet);font-size:.97rem;max-width:44ch}
.solo figure{grid-column:5/-1}
.solo img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:calc(var(--radius) * .35)}
.say p{grid-column:3/span 9;font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.85rem,3.6vw,3.2rem);line-height:1.22;text-wrap:balance}
.rows{grid-column:1/-1}
.rows>li,.rows>div{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:.75rem var(--gap);padding-block:clamp(1.6rem,3vw,2.4rem);border-top:1px solid var(--line)}
.rows>li:last-child,.rows>div:last-child{border-bottom:1px solid var(--line)}
.rows>li:has(.n){grid-template-columns:3rem minmax(0,5fr) minmax(0,7fr)}
.rows h3{font-size:clamp(1.2rem,1.7vw,1.45rem);line-height:1.3}
.rows p{color:var(--quiet);max-width:52ch}
.rows .n{font-family:var(--font-heading);font-size:1.2rem;line-height:1.35;color:var(--acc);font-variant-numeric:tabular-nums}
.gal{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gap);align-items:start}
.gal figure:first-child{grid-column:1/span 7}
.gal figure:last-child{grid-column:9/span 4;margin-top:clamp(5rem,14vw,12rem)}
.gal figure:first-child img{aspect-ratio:4/3}
.gal figure:last-child img{aspect-ratio:3/4}
.gal img{width:100%;object-fit:cover;border-radius:calc(var(--radius) * .35)}
.end{background:var(--tint)}
.end .g{padding-block:var(--sec)}
.end .say2{grid-column:1/span 7}
.end h2{font-size:clamp(2.2rem,4.6vw,4rem);line-height:1.06;margin-bottom:1.5rem}
.end .sub{color:var(--quiet);font-size:1.1rem;max-width:40ch;margin-bottom:2.5rem}
.end dl{grid-column:9/span 4;align-self:end}
.end dl>div{padding-block:1rem;border-top:1px solid var(--line)}
.end dt{font-size:.85rem;letter-spacing:.04em;color:var(--quiet)}
.end dd{font-size:1.02rem;line-height:1.5;overflow-wrap:anywhere}
.end dd a{text-decoration:none;border-bottom:1px solid var(--line)}.end dd a:hover{border-bottom-color:var(--acc)}
.foot{display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem 2rem;padding-block:2rem;border-top:1px solid var(--line);font-size:.85rem;letter-spacing:.03em;color:var(--quiet)}
@media (max-width:860px){.g,.gal{grid-template-columns:minmax(0,1fr)}.g>*,.gal>*{grid-column:1/-1!important}.top nav{display:none}.th::before{position:static;display:block;width:calc(var(--gut) + 2.5rem);margin-inline-start:calc(-1 * var(--gut));margin-bottom:1.25rem}.open .aside{margin-top:2rem}.hero{margin-top:3.5rem}.hero img{aspect-ratio:4/5;max-height:none}.about .pic{max-width:24rem;margin-bottom:3rem}.about .lead{padding-bottom:0}.menu{grid-template-columns:minmax(0,1fr)}.menu li:last-child{border-bottom:1px solid var(--line)}.rows>li,.rows>div,.rows>li:has(.n){grid-template-columns:minmax(0,1fr)}.gal{grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:1rem}.gal figure:first-child{grid-column:1/-1!important}.gal figure:last-child{grid-column:2!important;margin-top:1rem}.solo figure{grid-column:1/-1}.end dl{margin-top:3rem}}`

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
        <div className="w g">
          <h2 className="th">Questions</h2>
          <div className="rows">
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
        <h2 className="th">{l.title}</h2>
        <ol className="rows">
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
      <header className="open clip">
        <div className="w g">
          <p className="tag th">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <div className="aside">
            <p className="sub">{c.subhead}</p>
            <a className="btn" href="#visit">
              {c.cta.label}
            </a>
          </div>
        </div>
        <figure className="bleed hero">
          <Pic photo={c.photos.hero} eager />
        </figure>
      </header>
      <main className="clip">
        <section className="sec">
          <div className="w g about">
            <figure className="pic">
              <Pic photo={c.photos.about} />
            </figure>
            <p className="lead">{c.about}</p>
          </div>
        </section>
        <section className="sec" id="offer">
          <div className="w g">
            <h2 className="th">{c.offerTitle}</h2>
            <ul className="menu">
              {offerItems(c).map((it) => (
                <li key={it.name}>
                  <h3>{it.name}</h3>
                  {it.price ? <span className="price">{it.price}</span> : <span />}
                  {it.detail && <p>{it.detail}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="sec strip solo">
          <div className="w g">
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
      <footer className="end clip" id="visit">
        <div className="w g">
          <div className="say2">
            <h2 className="th">{c.cta.headline}</h2>
            <p className="sub">{c.cta.subhead}</p>
            {reach?.href ? (
              <a className="btn fill" href={reach.href}>
                {c.cta.label}
              </a>
            ) : null}
          </div>
          {hasVisit(c) && (
            <dl>
              <FactRows facts={f} />
            </dl>
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

export const luxe: Template = {
  id: 'luxe',
  label: 'Quiet luxe',
  text: "Light, airy and unhurried: a near-white page with a great deal of space, large fine headings and small lightly spaced text, the promise set very large over one photo running edge to edge, a few large photos placed off-centre, the offer as an open list and a fine thread of the organisation's colour running in from the edge to each heading; refined, calm and discreet, for jewellers, boutique hotels, perfumers, wineries, bridal shops and other high-end services.",
  dark: false,
  css: CSS,
  Page,
}
