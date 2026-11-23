// Split: the screen in two halves. On wide screens a column of photos runs the whole height of the
// page on the left while the words run on the right, so the place is always in view; the offer is a price
// list set like a printed card. On a phone the photo comes first, then the words. For
// restaurants, cafés, barbers and salons whose prices and hours matter.

import { Fragment } from 'react'
import {
  type Extra,
  FactRows,
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

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 3%,#fbfaf8);--ink:color-mix(in oklab,var(--band) 20%,#171717);--quiet:color-mix(in oklab,var(--ink) 62%,var(--paper));--line:color-mix(in oklab,var(--ink) 14%,var(--paper));--pad:clamp(1.5rem,4.5vw,4.5rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.65}
.split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);min-height:100svh}
.still{position:relative;display:flex;flex-direction:column;gap:3px;background:var(--ink)}
.still figure{flex:1 1 0;min-height:70svh;position:relative}
.still img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.still figure:has(img[data-art]):not(:first-child),.still figure:has(img[src^="data:image/svg"]):not(:first-child){display:none}
.still b{position:absolute;left:var(--pad);top:1.6rem;color:#fff;font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.3rem;letter-spacing:var(--heading-tracking);text-shadow:0 1px 12px rgb(0 0 0 / .45)}
.flow{padding-inline:var(--pad);max-width:44rem}
.flow nav{display:flex;gap:1.5rem;justify-content:flex-end;padding-block:1.6rem;font-size:.95rem}.flow nav a{text-decoration:none;color:var(--quiet)}.flow nav a:hover{color:var(--ink)}
.open{padding-block:clamp(4rem,12vh,9rem) clamp(3rem,8vh,6rem)}
.open .tag{color:var(--acc);margin-bottom:1.25rem}
.open h1{font-size:clamp(2.6rem,4.6vw,4.5rem);line-height:1.04;margin-bottom:1.5rem}
.open p.sub{font-size:1.2rem;color:var(--quiet);margin-bottom:2.25rem;max-width:34ch}
.btn{display:inline-block;padding:.95rem 1.6rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:600;text-decoration:none}
.blk{padding-block:clamp(3rem,7vh,5rem);border-top:1px solid var(--line)}
.blk h2{font-size:clamp(1.7rem,2.6vw,2.3rem);line-height:1.12;margin-bottom:1.75rem}
.lead{font-family:var(--font-heading);font-size:clamp(1.3rem,1.9vw,1.6rem);line-height:1.5;letter-spacing:var(--heading-tracking)}
.card{border:1px solid var(--line);border-radius:var(--radius);padding:clamp(1.25rem,3vw,2.25rem);background:color-mix(in oklab,var(--paper) 60%,#fff)}
.card li{padding-block:1rem}.card li+li{border-top:1px dashed var(--line)}
.card .row{display:flex;justify-content:space-between;gap:1.5rem;align-items:baseline}
.card h3{font-size:1.2rem;line-height:1.3}
.card .price{font-family:var(--font-heading);font-variant-numeric:tabular-nums;color:var(--acc);font-size:1.15rem;white-space:nowrap}
.card p{color:var(--quiet);font-size:.98rem;margin-top:.25rem}
.inset img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:var(--radius)}
.list li{padding-block:1.1rem;border-top:1px solid var(--line);display:grid;grid-template-columns:2.25rem 1fr;gap:.25rem 1rem}
.list li:last-child{border-bottom:1px solid var(--line)}
.list .n{font-family:var(--font-heading);color:var(--acc);font-size:1.2rem;grid-row:span 2}
.list .n:empty{display:none}.list li:has(.n:empty){grid-template-columns:1fr}
.list h3{font-size:1.15rem}.list p{color:var(--quiet)}
.say p{font-family:var(--font-heading);font-size:clamp(1.6rem,2.8vw,2.4rem);line-height:1.25;letter-spacing:var(--heading-tracking)}
.faq details{border-top:1px solid var(--line);padding-block:1.1rem}.faq details:last-child{border-bottom:1px solid var(--line)}
.faq summary{font-weight:600;display:flex;justify-content:space-between;gap:1rem}.faq summary::after{content:"+";color:var(--acc)}.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.5rem}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.pair img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:var(--radius)}
.visit{background:var(--acc);color:var(--on-acc);margin-inline:calc(-1 * var(--pad));padding:clamp(3rem,7vh,5rem) var(--pad)}
.visit h2{font-size:clamp(1.9rem,3vw,2.75rem);line-height:1.08;margin-bottom:1rem}
.visit p.sub{opacity:.85;margin-bottom:2rem;max-width:36ch}
.visit dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:1.5rem}
.visit dt{font-size:.9rem;opacity:.75}.visit dd{font-size:1.1rem}.visit dd a{text-decoration:none;border-bottom:1px solid currentColor}
.visit .btn{background:var(--on-acc);color:var(--acc);margin-bottom:2rem}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-block:1.75rem;font-size:.9rem;color:var(--quiet)}
@media (max-width:900px){.split{grid-template-columns:1fr}.still figure{min-height:60svh}.still figure:not(:first-child){display:none}.flow{max-width:none}.flow nav{display:none}.open{padding-top:3rem}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="blk say">
        <p>{c.statement}</p>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="blk faq" id="questions">
        <h2>Questions</h2>
        <FaqDetails faq={c.faq} />
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="blk pair">
        <figure>
          <Pic photo={c.photos.d2} />
        </figure>
        <figure>
          <Pic photo={c.photos.cta} />
        </figure>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="blk">
      <h2>{l.title}</h2>
      <ol className="list">
        {l.items.map((it, i) => (
          <li key={it.title}>
            <span className="n">{x === 'steps' ? i + 1 : ''}</span>
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = reachOf(f)
  return (
    <div className="split">
      <aside className="still">
        <figure>
          <Pic photo={c.photos.hero} eager />
        </figure>
        <figure>
          <Pic photo={c.photos.about} />
        </figure>
        <figure>
          <Pic photo={c.photos.d1} />
        </figure>
        <b>{c.name}</b>
      </aside>
      <div className="flow">
        <nav>
          <NavLinks links={links(c, extras)} />
        </nav>
        <header className="open">
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </header>
        <main>
          <section className="blk">
            <p className="lead">{c.about}</p>
          </section>
          <section className="blk" id="offer">
            <h2>{c.offerTitle}</h2>
            <ul className="card">
              {offerItems(c).map((it) => (
                <li key={it.name}>
                  <div className="row">
                    <h3>{it.name}</h3>
                    {it.price && <span className="price">{it.price}</span>}
                  </div>
                  {it.detail && <p>{it.detail}</p>}
                </li>
              ))}
            </ul>
          </section>
          {xs.map((x) => (
            <Fragment key={x}>
              <Extras c={c} x={x} />
            </Fragment>
          ))}
        </main>
        <footer>
          <section className="visit" id="visit">
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
          </section>
          <div className="foot">
            <span>{c.name}</span>
            <span>{c.tagline}</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export const split: Template = {
  id: 'split',
  label: 'Split',
  text: 'The screen in two halves: photos of the place run down the whole left side while the words run on the right, the offer set as a printed price card, a coloured block with the hours and address at the end: inviting and practical, for restaurants, cafés, barbers and salons whose prices and hours matter.',
  dark: false,
  css: CSS,
  Page,
}
