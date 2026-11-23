// Units: a specification sheet. Every offer item is a unit drawn like the title block of a
// technical drawing: one ruled box split into cells, the name in the top cell, the detail and the
// price ("Price") in the cells below, all units sharing their rules so the offer reads as one
// sheet rather than a grid of loose cards. The opening is drawn the same way: the headline, the
// photo, the promise and the button in cells of one framed block. Square, ruled, one colour.
// Some photos; without them the opening's text cell takes the full width. For B&Bs (rooms), gyms
// (memberships), salons and clinics (treatments), garages (services).

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
  reachOf,
  type Template,
  type TemplateProps,
} from './shared.tsx'

const ART = ':is(img[data-art],img[src^="data:image/svg"])'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 2%,#fcfcfa);--ink:color-mix(in oklab,var(--band) 18%,#151517);--quiet:color-mix(in oklab,var(--ink) 66%,var(--paper));--rule:color-mix(in oklab,var(--ink) 80%,var(--paper));--line:color-mix(in oklab,var(--ink) 22%,var(--paper));--tint:color-mix(in oklab,var(--band) 9%,var(--paper));--deep:color-mix(in oklab,var(--band) 82%,#000);--w:76rem;--gut:clamp(1rem,3.5vw,2.5rem);--sec:clamp(3.5rem,7vw,6rem);--cell:clamp(1.1rem,2.2vw,1.6rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top .w{display:flex;align-items:center;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.25rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.3rem;line-height:1.25}
.top nav{display:flex;gap:.4rem 1.75rem;flex-wrap:wrap;font-size:.95rem}
.top nav a{text-decoration:none;color:var(--quiet)}.top nav a:hover{color:var(--ink);text-decoration:underline;text-underline-offset:.3em}
.btn{display:inline-block;padding:.85rem 1.4rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:650;text-decoration:none;line-height:1.3}
.btn:hover{background:var(--deep)}
.open{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);border:2px solid var(--rule);margin-top:.5rem}
.open .hl{padding:clamp(1.5rem,4vw,3.5rem) var(--cell);display:flex;flex-direction:column;justify-content:flex-end;gap:1.25rem;min-height:clamp(18rem,40vw,30rem)}
.open .tag{color:var(--quiet)}
.open h1{font-size:clamp(2.4rem,5.4vw,4.6rem);line-height:1.02;max-width:16ch}
.open figure{border-inline-start:1px solid var(--rule);min-height:100%;position:relative}
.open figure img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.open .row{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) auto;border-top:1px solid var(--rule)}
.open .sub{padding:var(--cell);font-size:clamp(1.05rem,1.4vw,1.2rem);max-width:58ch;color:var(--quiet)}
.open .go{padding:var(--cell);border-inline-start:1px solid var(--rule);display:flex;align-items:center;background:var(--tint)}
.open:has(figure ${ART}){grid-template-columns:minmax(0,1fr)}
.open figure:has(${ART}){display:none}
.open:has(figure ${ART}) .hl{min-height:0;padding-top:clamp(3rem,7vw,6rem)}
.open:has(figure ${ART}) h1{font-size:clamp(2.6rem,6.4vw,5.6rem);max-width:18ch}
.sec{padding-top:var(--sec)}
.hd{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;padding-bottom:1rem;border-bottom:2px solid var(--rule)}
.hd h2,.end h2{font-size:clamp(1.8rem,3.2vw,2.6rem);line-height:1.1}
.about{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,22rem);gap:clamp(2rem,5vw,4rem);align-items:start}
.about p{font-family:var(--font-heading);font-size:clamp(1.3rem,2.1vw,1.7rem);line-height:1.45;letter-spacing:var(--heading-tracking);max-width:40ch}
.about img{width:100%;aspect-ratio:4/5;object-fit:cover;border:1px solid var(--rule)}
.about:has(${ART}){grid-template-columns:minmax(0,1fr)}
.about figure:has(${ART}){display:none}
.g{font-size:1.15rem;line-height:1.3;padding:.9rem 0 .7rem;color:var(--deep)}
.grp+.grp{margin-top:2rem}
.units{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr));border-inline-start:1px solid var(--rule)}
.hd+.units,.hd+.grp .units:first-child{border-top:0}
.units{border-top:1px solid var(--rule)}
.u{display:flex;flex-direction:column;border-inline-end:1px solid var(--rule);border-bottom:1px solid var(--rule);background:color-mix(in oklab,var(--paper) 40%,#fff)}
.u h3{padding:var(--cell) var(--cell) 1.75rem;font-size:clamp(1.3rem,1.9vw,1.6rem);line-height:1.15;overflow-wrap:anywhere}
.fl{margin-top:auto;display:grid;grid-template-columns:minmax(0,1fr) auto;border-top:1px solid var(--line)}
.fl .dt{grid-column:1;padding:.9rem var(--cell) 1.1rem;color:var(--quiet);font-size:.97rem;line-height:1.5}
.fl:not(:has(.pr)) .dt{grid-column:1/-1}
.fl:not(:has(.dt)){grid-template-columns:minmax(0,1fr)}
.fl:not(:has(.dt)) .pr{grid-column:1;flex-direction:row;align-items:baseline;justify-content:space-between;gap:1rem;max-width:none;border-inline-start:0}
.fl .pr{grid-column:2;grid-row:1;align-self:stretch;display:flex;flex-direction:column;justify-content:flex-end;padding:.9rem var(--cell) 1.1rem;border-inline-start:1px solid var(--line);background:var(--tint);min-width:7.5rem;max-width:14rem}
.pr dt{font-size:.8rem;color:var(--quiet);line-height:1.3}
.pr dd{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.4rem;line-height:1.15;color:var(--deep);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.cells{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));border-inline-start:1px solid var(--rule)}
.cells li{border-inline-end:1px solid var(--rule);border-bottom:1px solid var(--rule);padding:var(--cell)}
.cells h3{font-size:1.25rem;line-height:1.25;margin-bottom:.5rem}
.cells p{color:var(--quiet)}
.cells .n{display:block;font-family:var(--font-heading);font-size:2.4rem;line-height:1;color:var(--deep);font-variant-numeric:tabular-nums;margin-bottom:1.25rem}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.7rem,3.6vw,2.9rem);line-height:1.2;max-width:28ch;padding-top:1.25rem;border-top:2px solid var(--rule)}
.qa div{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:.4rem 2rem;padding-block:1.2rem;border-bottom:1px solid var(--line)}
.qa h3{font-family:var(--font-body);font-size:1.05rem;font-weight:700;letter-spacing:0;text-transform:none;line-height:1.45}
.qa p{color:var(--quiet);max-width:62ch}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;border:1px solid var(--rule)}
.pair figure+figure{border-inline-start:1px solid var(--rule)}
.pair img{width:100%;aspect-ratio:3/2;object-fit:cover}
.end{margin-top:var(--sec);background:var(--acc);color:var(--on-acc)}
.end .w{padding-block:clamp(3rem,6vw,5rem)}
.end .sub{opacity:.88;margin-top:.9rem;max-width:44ch;font-size:1.1rem}
.end .btn{background:var(--on-acc);color:var(--acc);margin-top:1.75rem}
.end .btn:hover{background:color-mix(in oklab,var(--on-acc) 88%,var(--acc))}
.end dl{margin-top:clamp(2rem,4vw,3rem);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr));border-top:1px solid color-mix(in oklab,var(--on-acc) 45%,transparent);border-inline-start:1px solid color-mix(in oklab,var(--on-acc) 45%,transparent)}
.end dl>div{padding:1.1rem 1.25rem;border-inline-end:1px solid color-mix(in oklab,var(--on-acc) 45%,transparent);border-bottom:1px solid color-mix(in oklab,var(--on-acc) 45%,transparent)}
.end dt{font-size:.85rem;opacity:.8;margin-bottom:.2rem}
.end dd{font-size:1.05rem;overflow-wrap:anywhere}
.end dd a{text-decoration:none;border-bottom:1px solid currentColor}
.foot .w{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.5rem;font-size:.92rem;color:var(--quiet)}
.foot b{color:var(--ink)}
@media (max-width:760px){.top nav{display:none}.open{grid-template-columns:minmax(0,1fr)}.open figure{border-inline-start:0;border-top:1px solid var(--rule);min-height:0;order:2}.open figure img{position:static;aspect-ratio:4/3;height:auto}.open .hl{min-height:0}.open .row{order:3;grid-template-columns:minmax(0,1fr)}.open .go{border-inline-start:0;border-top:1px solid var(--rule)}.about{grid-template-columns:minmax(0,1fr)}.about img{aspect-ratio:3/2}.qa div{grid-template-columns:minmax(0,1fr)}.fl .pr{min-width:6.5rem}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="w sec say">
        <p>{c.statement}</p>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="w sec" id="questions">
        <div className="hd">
          <h2>Questions</h2>
        </div>
        <div className="qa">
          {c.faq?.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="w sec">
        <div className="pair">
          <figure>
            <Pic photo={c.photos.d1} />
          </figure>
          <figure>
            <Pic photo={c.photos.d2} />
          </figure>
        </div>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  const steps = x === 'steps'
  return (
    <section className="w sec" id={x}>
      <div className="hd">
        <h2>{l.title}</h2>
      </div>
      <ol className="cells">
        {l.items.map((it, i) => (
          <li key={it.title}>
            {steps && <span className="n">{i + 1}</span>}
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

type Item = { name: string; detail?: string; price: string }

function Unit({ it }: { it: Item }) {
  return (
    <li className="u">
      <h3>{it.name}</h3>
      {(it.detail || it.price) && (
        <div className="fl">
          {it.detail && <p className="dt">{it.detail}</p>}
          {it.price && (
            <dl className="pr">
              <dt>Price</dt>
              <dd>{it.price}</dd>
            </dl>
          )}
        </div>
      )}
    </li>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = reachOf(f)
  const groups = c.prices.filter((g) => g.items.length)
  const named = groups.filter((g) => g.group).length > 1
  return (
    <>
      <header className="top">
        <div className="w">
          <b>{c.name}</b>
          <nav>
            {links(c, extras).map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main>
        <section className="w">
          <div className="open">
            <div className="hl">
              <p className="tag">{c.tagline}</p>
              <h1>{c.headline}</h1>
            </div>
            <figure>
              <Pic photo={c.photos.hero} eager />
            </figure>
            <div className="row">
              <p className="sub">{c.subhead}</p>
              <div className="go">
                <a className="btn" href="#visit">
                  {c.cta.label}
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="w sec about">
          <p>{c.about}</p>
          <figure>
            <Pic photo={c.photos.about} />
          </figure>
        </section>
        {offerItems(c).length > 0 && (
          <section className="w sec" id="offer">
            <div className="hd">
              <h2>{c.offerTitle}</h2>
            </div>
            {named ? (
              groups.map((g, i) => (
                <div className="grp" key={g.group || i}>
                  {g.group && <h3 className="g">{g.group}</h3>}
                  <ul className="units">
                    {g.items.map((it) => (
                      <Unit key={it.name} it={it} />
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <ul className="units">
                {offerItems(c).map((it) => (
                  <Unit key={it.name} it={it} />
                ))}
              </ul>
            )}
          </section>
        )}
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
        <section className="end" id="visit">
          <div className="w">
            <h2>{c.cta.headline}</h2>
            <p className="sub">{c.cta.subhead}</p>
            <a className="btn" href={reach?.href ?? '#offer'}>
              {c.cta.label}
            </a>
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
        </section>
      </main>
      <footer className="foot">
        <div className="w">
          <b>{c.name}</b>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const units: Template = {
  id: 'units',
  label: 'Units',
  text: 'A ruled specification sheet: each room, class, package or treatment is a unit in a framed box of cells, its name on top and its detail and price in labelled cells below, all sharing their rules like one printed sheet, with an opening framed the same way; square, exact and calm, for B&Bs, gyms, salons, clinics and garages whose offer is a set of distinct packages.',
  dark: false,
  css: CSS,
  Page,
}
