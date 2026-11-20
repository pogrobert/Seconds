// Workshop: the page reads as a maker's drawing. The ground is drafting paper with a faint grid,
// every section heading is set inside a dimension line that measures the full width of the page,
// and the opening carries a title block (the boxed corner of a technical drawing) with the name
// and the facts. The offer is a parts list in a ruled table; steps get the circled callouts of a
// plan. Square corners throughout. The close turns into a blueprint: the business's colour with
// the grid in light lines. Needs no photos: real ones are pinned up as prints, slightly askew,
// and drawn art is left out. For joiners, builders, bike repair, makers and workshops.

import { Fragment, type ReactNode } from 'react'
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
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 5%,#f5f3ec);--ink:color-mix(in oklab,var(--band) 30%,#141414);--quiet:color-mix(in oklab,var(--ink) 68%,var(--paper));--fine:color-mix(in oklab,var(--band) 13%,var(--paper));--major:color-mix(in oklab,var(--band) 26%,var(--paper));--rule:color-mix(in oklab,var(--ink) 30%,var(--paper));--w:78rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4rem,8vw,7rem);--cell:24px}
body{background-color:var(--paper);background-image:linear-gradient(var(--major) 1px,transparent 1px),linear-gradient(90deg,var(--major) 1px,transparent 1px),linear-gradient(var(--fine) 1px,transparent 1px),linear-gradient(90deg,var(--fine) 1px,transparent 1px);background-size:calc(var(--cell) * 5) calc(var(--cell) * 5),calc(var(--cell) * 5) calc(var(--cell) * 5),var(--cell) var(--cell),var(--cell) var(--cell);background-position:-1px -1px;color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:1.4rem;background:linear-gradient(var(--ink),var(--ink)) bottom center/calc(100% - 2 * var(--gut)) 2px no-repeat}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:1.2rem;line-height:1.25;min-width:0}
.top nav{display:flex;gap:1.75rem;font-size:.95rem;flex-shrink:0}.top nav a{text-decoration:none}.top nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,21rem);gap:clamp(2.5rem,6vw,6rem);align-items:end;padding-block:clamp(3.5rem,8vw,7rem) var(--sec)}
.hero .tag{color:var(--quiet);margin-bottom:1.25rem;max-width:44ch}
.hero h1{font-size:clamp(2.6rem,6vw,5.4rem);line-height:1;margin-bottom:1.6rem;max-width:16ch;overflow-wrap:break-word}
.hero p.sub{font-size:clamp(1.1rem,1.5vw,1.3rem);max-width:40ch;margin-bottom:2.25rem}
.btn{display:inline-block;padding:.95rem 1.6rem;background:var(--acc);color:var(--on-acc);font-weight:650;text-decoration:none;border:2px solid var(--acc)}
.btn:hover{background:transparent;color:var(--acc)}
.side{display:grid;gap:2rem;justify-items:end}
.tb{width:100%;border:2px solid var(--ink);background:var(--paper)}
.tb>div{padding:.7rem .9rem}
.tb>div+div{border-top:1px solid var(--ink)}
.tb .ds{font-size:.95rem;color:var(--quiet);line-height:1.4}
.tb .nm{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:1.3rem;line-height:1.2;overflow-wrap:break-word}
.tb dt{font-size:.8rem;color:var(--quiet)}.tb dd{font-size:.98rem;line-height:1.4;overflow-wrap:break-word}.tb dd a{text-decoration:none}
.tb .two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);padding:0}.tb .two>dl{padding:.7rem .9rem;min-width:0}.tb .two>dl+dl{border-inline-start:1px solid var(--ink)}
.print{background:#fff;padding:.6rem .6rem 1.6rem;box-shadow:0 1px 2px color-mix(in oklab,var(--ink) 25%,transparent);position:relative;max-width:100%}
.print::before{content:"";position:absolute;top:-.7rem;inset-inline-start:50%;width:4.5rem;height:1.4rem;margin-inline-start:-2.25rem;background:color-mix(in oklab,var(--band) 14%,#efe9d8);opacity:.85;transform:rotate(-3deg)}
.print img{width:100%;aspect-ratio:4/3;object-fit:cover}
.side .print{width:88%;transform:rotate(2deg)}
.side figure:has(${ART}){display:none}
.dim{display:flex;align-items:center;gap:1.1rem;margin-bottom:clamp(2.25rem,4.5vw,3.5rem);color:var(--acc)}
.dim::before,.dim::after{content:"";flex:1 1 2rem;min-width:1.5rem;height:1.1rem;background:linear-gradient(currentColor,currentColor) center/100% 1.5px no-repeat}
.dim::before{border-inline-start:1.5px solid currentColor}.dim::after{border-inline-end:1.5px solid currentColor}
.dim h2{flex:0 1 auto;color:var(--ink);font-size:clamp(1.6rem,3vw,2.5rem);line-height:1.1;text-align:center;max-width:28ch;overflow-wrap:break-word}
.sec{padding-bottom:var(--sec)}
.intro{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(2rem,5vw,5rem);border-top:1px solid var(--ink);padding-top:1.5rem}
.intro p{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.35rem,2.2vw,1.85rem);line-height:1.35;max-width:34ch;grid-column:2}
.prints{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(1.5rem,4vw,3.5rem);align-items:start;padding-inline:clamp(0rem,3vw,2rem)}
.prints figure:nth-child(1){transform:rotate(-1.6deg)}.prints figure:nth-child(2){transform:rotate(1.2deg);margin-top:2.5rem}.prints figure:nth-child(3){transform:rotate(-.8deg);margin-top:1rem}
.prints:has(figure:nth-child(2):last-child){grid-template-columns:minmax(0,5fr) minmax(0,4fr);max-width:56rem;margin-inline:auto}
.parts{border:2px solid var(--ink);background:var(--paper)}
.parts .grp{display:block;padding:.6rem 1rem;border-top:2px solid var(--ink);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.05rem;background:color-mix(in oklab,var(--band) 8%,var(--paper))}
.parts .grp:first-child{border-top:0}
.parts li{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr) 9rem}
.parts.nd li{grid-template-columns:minmax(0,1fr) 9rem}.parts.np li{grid-template-columns:minmax(0,2fr) minmax(0,3fr)}.parts.nd.np li{grid-template-columns:minmax(0,1fr)}
.parts li+li,.parts .grp+li{border-top:1px solid var(--rule)}
.parts li>*{padding:1rem}
.parts li>*+*{border-inline-start:1px solid var(--rule)}
.parts h3{font-size:1.2rem;line-height:1.3}
.parts p{color:var(--quiet)}
.parts .pr{font-variant-numeric:tabular-nums;text-align:end;white-space:nowrap;font-family:var(--font-heading);font-size:1.15rem}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:2rem 0}
.cols li{padding-inline:1.5rem;border-inline-start:1.5px solid var(--ink)}
.cols h3{font-size:1.3rem;line-height:1.25;margin-bottom:.5rem}
.cols p{color:var(--quiet);max-width:38ch}
.n{display:grid;place-items:center;width:3rem;height:3rem;border:1.5px solid var(--acc);border-radius:50%;color:var(--acc);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.25rem;font-variant-numeric:lining-nums;margin-bottom:1.1rem;background:var(--paper)}
.say{border-block:1.5px dashed var(--acc);padding-block:clamp(2.5rem,5vw,4rem)}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.8rem,3.8vw,3.2rem);line-height:1.15;max-width:26ch;margin-inline:auto;text-align:center;text-wrap:balance}
.qa{max-width:52rem;margin-inline:auto}
.qa details{border-top:1px solid var(--ink);padding-block:1.15rem}.qa details:last-child{border-bottom:1px solid var(--ink)}
.qa summary{font-family:var(--font-heading);font-size:1.2rem;line-height:1.3;display:flex;justify-content:space-between;gap:1.5rem}
.qa summary::after{content:"+";color:var(--acc);font-size:1.4rem;line-height:1}.qa details[open] summary::after{content:"\\2212"}
.qa p{color:var(--quiet);padding-top:.6rem;max-width:60ch}
.end{--paper:var(--acc);--ink:var(--on-acc);--quiet:color-mix(in oklab,var(--on-acc) 78%,var(--acc));--fine:color-mix(in oklab,var(--on-acc) 10%,var(--acc));--major:color-mix(in oklab,var(--on-acc) 20%,var(--acc));--rule:color-mix(in oklab,var(--on-acc) 35%,var(--acc));background-color:var(--acc);background-image:linear-gradient(var(--major) 1px,transparent 1px),linear-gradient(90deg,var(--major) 1px,transparent 1px),linear-gradient(var(--fine) 1px,transparent 1px),linear-gradient(90deg,var(--fine) 1px,transparent 1px);background-size:calc(var(--cell) * 5) calc(var(--cell) * 5),calc(var(--cell) * 5) calc(var(--cell) * 5),var(--cell) var(--cell),var(--cell) var(--cell);color:var(--ink)}
.end .dim{color:var(--ink)}
.end .in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,24rem);gap:clamp(2.5rem,6vw,6rem);align-items:start;padding-block:var(--sec)}
.end h2.big{font-size:clamp(2.4rem,5.4vw,4.75rem);line-height:1.02;margin-bottom:1.4rem;max-width:16ch}
.end p.sub{font-size:1.2rem;max-width:38ch;margin-bottom:2rem;color:var(--quiet)}
.end .btn{background:var(--on-acc);color:var(--acc);border-color:var(--on-acc)}
.end .btn:hover{background:transparent;color:var(--on-acc)}
.end .tb{background:var(--acc)}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-block:1.4rem 1.8rem;background:linear-gradient(var(--ink),var(--ink)) top center/calc(100% - 2 * var(--gut)) 2px no-repeat;font-size:.92rem}
.foot span:last-child{color:var(--quiet)}
@media (max-width:860px){.top nav{display:none}.hero,.intro,.end .in{grid-template-columns:minmax(0,1fr)}.side{justify-items:start}.side .print{width:min(19rem,88%)}.intro p{grid-column:1}.prints{grid-template-columns:repeat(2,minmax(0,1fr))}.prints figure:nth-child(3){grid-column:1/-1;width:70%;justify-self:center}.prints figure:nth-child(2){margin-top:1.5rem}.parts li{grid-template-columns:minmax(0,1fr) 7.5rem}.parts li>p{grid-column:1/-1;grid-row:2;border-inline-start:0!important;border-top:1px dashed var(--rule);padding-top:.7rem}.parts li>.pr{border-inline-start:1px solid var(--rule)}.parts.nd li{grid-template-columns:minmax(0,1fr) 7.5rem}.parts.np li{grid-template-columns:minmax(0,1fr)}.dim{gap:.6rem}.dim::before,.dim::after{flex-basis:1rem;min-width:.75rem}}`

/** The boxed corner of a drawing: the name, then the facts two to a row. */
function TitleBlock({ c, name }: { c: TemplateProps['c']; name?: boolean }) {
  const f = facts(c)
  const rows: (typeof f)[] = []
  for (let i = 0; i < f.length; i += 2) rows.push(f.slice(i, i + 2))
  const cell = (x: (typeof f)[number]) => (
    <dl key={x.label}>
      <dt>{x.label}</dt>
      <dd>{x.href ? <a href={x.href}>{x.value}</a> : x.value}</dd>
    </dl>
  )
  return (
    <div className="tb">
      {name && (
        <div>
          <div className="nm">{c.name}</div>
        </div>
      )}
      {name && c.tagline && (
        <div>
          <div className="ds">{c.tagline}</div>
        </div>
      )}
      {rows.map((r) =>
        r.length === 2 && r.every((x) => x.value.length < 18) ? (
          <div className="two" key={r[0]?.label}>
            {r.map(cell)}
          </div>
        ) : (
          r.map((x) => <div key={x.label}>{cell(x)}</div>)
        ),
      )}
    </div>
  )
}

function Dim({ children }: { children: ReactNode }) {
  return (
    <div className="dim">
      <h2>{children}</h2>
    </div>
  )
}

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="w sec">
        <div className="say">
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="w sec" id="questions">
        <Dim>Questions</Dim>
        <div className="qa">
          {c.faq?.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="w sec">
        <div className="prints three">
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
    <section className="w sec">
      <Dim>{l.title}</Dim>
      <ol className="cols">
        {l.items.map((it, i) => (
          <li key={it.title}>
            {x === 'steps' && <span className="n">{i + 1}</span>}
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
  const reach = facts(c).find((x) => x.href)
  const offer = offerItems(c)
  // Group rows only when the owner named more than one group.
  const groups = c.prices.filter((g) => g.items.length)
  const grouped = groups.filter((g) => g.group).length > 1
  // A column nobody filled is left out rather than drawn empty.
  const nd = !offer.some((it) => it.detail)
  const np = !offer.some((it) => it.price)
  const row = (it: (typeof offer)[number]) => (
    <li key={it.name}>
      <h3>{it.name}</h3>
      {!nd && <p>{it.detail}</p>}
      {!np && <span className="pr">{it.price}</span>}
    </li>
  )
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
        <div>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </div>
        <div className="side">
          <figure className="print">
            <Pic photo={c.photos.hero} eager />
          </figure>
          <TitleBlock c={c} name />
        </div>
      </header>
      <main>
        <section className="w sec">
          <div className="intro">
            <p>{c.about}</p>
          </div>
        </section>
        <section className="w sec">
          <div className="prints pair">
            <figure className="print">
              <Pic photo={c.photos.about} />
            </figure>
            <figure className="print">
              <Pic photo={c.photos.d1} />
            </figure>
          </div>
        </section>
        {offer.length > 0 && (
          <section className="w sec" id="offer">
            <Dim>{c.offerTitle}</Dim>
            <ul className={`parts${nd ? ' nd' : ''}${np ? ' np' : ''}`}>
              {grouped
                ? groups.map((g) => (
                    <Fragment key={g.group}>
                      {g.group && <li className="grp">{g.group}</li>}
                      {g.items.map(row)}
                    </Fragment>
                  ))
                : offer.map(row)}
            </ul>
          </section>
        )}
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
        <div className="w in">
          <div>
            <h2 className="big">{c.cta.headline}</h2>
            <p className="sub">{c.cta.subhead}</p>
            {reach && (
              <a className="btn" href={reach.href}>
                {c.cta.label}
              </a>
            )}
          </div>
          {hasVisit(c) && <TitleBlock c={c} />}
        </div>
        <div className="w foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const workshop: Template = {
  id: 'workshop',
  label: 'Workshop',
  text: "Drawn like a maker's plan: drafting paper with a faint grid, each heading measured out by a dimension line across the page, a title block with the name and facts, the offer as a ruled parts list and real photos pinned up as prints, closing on a blueprint in the organisation's own colour: practical, exact and hands-on, for joiners, builders, bike repair, metalworkers and makers.",
  dark: false,
  css: CSS,
  Page,
}
