// Low light: an evening page. A full-bleed photo opens it with the promise set low on the left;
// then the page alternates between one narrow centred column of words and photos that run edge to
// edge. The offer reads like a menu card, names and prices joined by a dotted leader. One dark
// ground tinted by the business's colour, used throughout. For tattoo studios, bars, evening
// restaurants, barbers, venues.

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

const CSS = `${RESET}
:root{color-scheme:dark;--night:color-mix(in oklab,var(--band) 16%,#121212);--deep:color-mix(in oklab,var(--band) 22%,#0c0c0c);--ink:color-mix(in oklab,var(--band) 6%,#f1ece4);--quiet:color-mix(in oklab,var(--ink) 62%,var(--night));--acc:color-mix(in oklab,var(--band) 45%,#f4efe8);--line:color-mix(in oklab,var(--ink) 16%,var(--night));--col:36rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(5rem,10vw,9rem)}
body{background:var(--night);color:var(--ink);font-size:1.0625rem;line-height:1.7}
.col{max-width:calc(var(--col) + 2 * var(--gut));margin-inline:auto;padding-inline:var(--gut)}
.top{position:absolute;inset:0 0 auto;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:1.5rem;padding:1.5rem var(--gut)}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.3rem;letter-spacing:var(--heading-tracking)}
.top nav{display:flex;gap:1.75rem;font-size:.95rem}.top nav a{text-decoration:none;opacity:.85}.top nav a:hover{opacity:1}
.hero{position:relative;min-height:min(100svh,58rem);display:flex;align-items:flex-end;isolation:isolate}
.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;filter:saturate(.8) brightness(.8)}
.hero::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(to top,var(--night) 4%,color-mix(in oklab,var(--night) 55%,transparent) 45%,color-mix(in oklab,var(--night) 30%,transparent))}
.hero .copy{padding:0 var(--gut) clamp(3.5rem,8vw,6.5rem);max-width:56rem}
.hero .tag{color:var(--acc);margin-bottom:1.25rem}
.hero h1{font-size:clamp(2.8rem,7vw,6.25rem);line-height:1;margin-bottom:1.5rem}
.hero p.sub{font-size:clamp(1.1rem,1.6vw,1.3rem);color:color-mix(in oklab,var(--ink) 85%,var(--night));max-width:36ch;margin-bottom:2.25rem}
.btn{display:inline-block;padding:.95rem 1.7rem;border:1px solid var(--ink);border-radius:var(--button-radius);text-decoration:none;font-weight:600;letter-spacing:.01em}
.btn:hover{background:var(--ink);color:var(--night)}
.sec{padding-block:var(--sec)}
.lead{font-family:var(--font-heading);font-size:clamp(1.4rem,2.3vw,1.85rem);line-height:1.45;letter-spacing:var(--heading-tracking);text-align:center}
.bleed img{width:100%;aspect-ratio:16/7;object-fit:cover;filter:saturate(.85)}
h2{font-size:clamp(1.9rem,3.6vw,2.9rem);line-height:1.1;text-align:center;margin-bottom:clamp(2.5rem,5vw,3.5rem)}
.menu li{padding-block:1.1rem}
.menu .row{display:flex;align-items:baseline;gap:.75rem;font-family:var(--font-heading);font-size:1.3rem;line-height:1.3}
.menu .row::after{content:"";order:2;flex:1;border-bottom:1px dotted var(--quiet);transform:translateY(-.3em);min-width:2rem}
.menu .row .price{order:3;font-variant-numeric:tabular-nums;color:var(--acc)}
.menu p{color:var(--quiet);margin-top:.35rem;max-width:44ch}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:3px}
.pair img{width:100%;aspect-ratio:1;object-fit:cover;filter:saturate(.85)}
.list li{padding-block:1.6rem;border-top:1px solid var(--line);text-align:center}.list li:last-child{border-bottom:1px solid var(--line)}
.list h3{font-size:1.4rem;margin-bottom:.4rem}.list p{color:var(--quiet)}
.n{display:block;color:var(--acc);font-family:var(--font-heading);font-size:1.1rem;margin-bottom:.4rem}
.say{background:var(--deep)}
.say p{font-family:var(--font-heading);font-size:clamp(1.9rem,4vw,3.3rem);line-height:1.2;text-align:center;letter-spacing:var(--heading-tracking);max-width:24ch;margin-inline:auto;text-wrap:balance}
.faq details{border-top:1px solid var(--line);padding-block:1.25rem}.faq details:last-child{border-bottom:1px solid var(--line)}
.faq summary{font-family:var(--font-heading);font-size:1.2rem;display:flex;justify-content:space-between;gap:1rem}
.faq summary::after{content:"+";color:var(--acc)}.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.6rem}
.gal{display:grid;grid-template-columns:2fr 1fr 1fr;gap:3px}
.gal img{width:100%;height:100%;aspect-ratio:3/4;object-fit:cover;filter:saturate(.85)}
.end{background:var(--deep);text-align:center}
.end h2{margin-bottom:1.25rem}
.end p.sub{color:var(--quiet);margin-bottom:2.25rem}
.end dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:2rem;margin-top:clamp(3rem,6vw,4.5rem);padding-top:2.5rem;border-top:1px solid var(--line)}
.end dt{color:var(--acc);font-size:.92rem;margin-bottom:.3rem}.end dd a{text-decoration:none}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding:1.75rem var(--gut);font-size:.9rem;color:var(--quiet);border-top:1px solid var(--line)}
@media (max-width:760px){.top nav{display:none}.bleed img{aspect-ratio:4/3}.gal{grid-template-columns:1fr 1fr}.gal figure:first-child{grid-column:1/-1}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say">
        <div className="col" style={{ maxWidth: '64rem' }}>
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="col faq">
          <h2>Questions</h2>
          <FaqDetails faq={c.faq} />
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="gal">
        <figure>
          <Pic photo={c.photos.d2} />
        </figure>
        <figure>
          <Pic photo={c.photos.cta} />
        </figure>
        <figure>
          <Pic photo={c.photos.about} />
        </figure>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="sec">
      <div className="col">
        <h2>{l.title}</h2>
        <ol className="list">
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
      <header className="hero">
        <div className="top">
          <b>{c.name}</b>
          <nav>
            <NavLinks links={links(c, extras)} />
          </nav>
        </div>
        <Pic photo={c.photos.hero} eager />
        <div className="copy">
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </div>
      </header>
      <main>
        <section className="sec">
          <div className="col">
            <p className="lead">{c.about}</p>
          </div>
        </section>
        <figure className="bleed">
          <Pic photo={c.photos.about} />
        </figure>
        <section className="sec" id="offer">
          <div className="col">
            <h2>{c.offerTitle}</h2>
            <ul className="menu">
              {offerItems(c).map((it) => (
                <li key={it.name}>
                  <div className="row">
                    <span>{it.name}</span>
                    {it.price && <span className="price">{it.price}</span>}
                  </div>
                  {it.detail && <p>{it.detail}</p>}
                </li>
              ))}
            </ul>
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
        {xs
          .filter((x) => x !== 'gallery')
          .map((x) => (
            <Fragment key={x}>
              <Extras c={c} x={x} />
            </Fragment>
          ))}
      </main>
      <footer className="end" id="visit">
        <div className="sec col" style={{ maxWidth: '56rem' }}>
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
        </div>
        <div className="foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const lowlight: Template = {
  id: 'lowlight',
  label: 'Low light',
  text: "A dark evening page tinted with the organisation's colour: a full-screen photo with the promise set low, narrow centred words between photos that run edge to edge, the offer like a menu card with dotted leaders to the prices: intimate, atmospheric and after-dark, for tattoo studios, bars, evening restaurants, barbers and venues.",
  dark: true,
  css: CSS,
  Page,
}
