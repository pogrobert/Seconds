// Timetable: the offer is the opening, set like a printed timetable pinned up at the door. Under
// a short headline sits one ruled sheet: a bar in the business's colour with the offer's title,
// the owner's opening hours as the sheet's columns when they gave them, then every class, session
// or lesson as a row, its price in a tinted column down the left where a timetable keeps its
// times. Nothing is invented: no days or times beyond the owner's hours. The introduction, the
// photos and the rest follow below. Few photos; without them it is all type and rules. For yoga,
// gyms, swimming, dance and tutoring.

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
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:#fff;--ink:color-mix(in oklab,var(--band) 16%,#141416);--quiet:color-mix(in oklab,var(--ink) 64%,#fff);--rule:var(--ink);--line:color-mix(in oklab,var(--ink) 16%,#fff);--tint:color-mix(in oklab,var(--band) 8%,#fff);--tint2:color-mix(in oklab,var(--band) 14%,#fff);--deep:color-mix(in oklab,var(--band) 82%,#000);--w:74rem;--gut:clamp(1rem,3.5vw,2.5rem);--sec:clamp(3.5rem,7vw,6rem);--tc:clamp(6.5rem,13vw,10.5rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top .w{display:flex;align-items:center;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.2rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.3rem;line-height:1.25}
.top nav{display:flex;gap:.4rem 1.6rem;flex-wrap:wrap;font-size:.95rem}
.top nav a{text-decoration:none;color:var(--quiet)}.top nav a:hover{color:var(--ink);text-decoration:underline;text-underline-offset:.3em}
.btn{display:inline-block;padding:.85rem 1.4rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:650;text-decoration:none;line-height:1.3}
.btn:hover{background:var(--deep)}
.open{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:1.25rem clamp(2rem,5vw,4.5rem);align-items:end;padding-block:clamp(2rem,5vw,3.75rem) clamp(1.75rem,3vw,2.5rem)}
.open .tag{color:var(--quiet);margin-bottom:.9rem}
.open h1{font-size:clamp(2.3rem,4.8vw,4.1rem);line-height:1.04}
.open .sub{color:var(--quiet);font-size:clamp(1.05rem,1.4vw,1.2rem);max-width:42ch;margin-bottom:1.4rem}
.sheet{border-top:4px solid var(--rule);border-bottom:4px solid var(--rule)}
.cap{background:var(--acc);color:var(--on-acc);padding:.9rem clamp(.9rem,2vw,1.4rem)}
.cap h2{font-size:clamp(1.35rem,2.4vw,1.9rem);line-height:1.15}
.hrs{display:grid;grid-template-columns:var(--tc) minmax(0,1fr);border-bottom:2px solid var(--rule)}
.hrs dt{padding:.85rem clamp(.9rem,2vw,1.4rem);font-weight:700;background:var(--tint2);border-inline-end:1px solid var(--line)}
.hrs dd{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,9.5rem),1fr))}
.hrs dd div{padding:.85rem clamp(.9rem,2vw,1.4rem);border-inline-end:1px solid var(--line);line-height:1.35}
.hrs dd div:last-child{border-inline-end:0}
.hrs strong{display:block;font-weight:700}
.hrs span{color:var(--quiet);font-variant-numeric:tabular-nums}
.gr{display:grid;grid-template-columns:var(--tc) minmax(0,1fr);border-bottom:1px solid var(--rule)}
.gr h3{grid-column:2;padding:1.1rem clamp(.9rem,2vw,1.4rem) .5rem;font-size:1.05rem;line-height:1.3;color:var(--deep)}
.gr::before{content:"";background:var(--tint)}
.row{display:grid;grid-template-columns:var(--tc) minmax(0,1fr);border-bottom:1px solid var(--line)}
.row:last-child{border-bottom:0}
.row .pr{background:var(--tint);padding:1.25rem clamp(.9rem,2vw,1.4rem);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.05rem,1.7vw,1.35rem);line-height:1.25;font-variant-numeric:tabular-nums;color:var(--deep);border-inline-end:2px solid var(--acc);overflow-wrap:anywhere}
.row .what{padding:1.2rem clamp(.9rem,2vw,1.4rem);display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:.25rem 2rem;align-items:baseline}
.row h4{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.15rem,1.7vw,1.4rem);line-height:1.25;margin:0;text-wrap:balance}
.row p{color:var(--quiet);font-size:.98rem;line-height:1.5}
.row .what:not(:has(p)){grid-template-columns:minmax(0,1fr)}
.bare .row,.bare .gr{grid-template-columns:minmax(0,1fr)}.bare .row .pr,.bare .gr::before{display:none}.bare .gr h3{grid-column:1}
.sec{padding-top:var(--sec)}
.about{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:clamp(2rem,5vw,4.5rem);align-items:center}
.about p{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.3rem,2.1vw,1.7rem);line-height:1.45;max-width:36ch}
.about img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:var(--radius)}
.about:has(${ART}){grid-template-columns:minmax(0,1fr)}
.about:has(${ART}) p{max-width:48ch}
.about figure:has(${ART}){display:none}
.hd{font-size:clamp(1.8rem,3vw,2.5rem);line-height:1.1;padding-bottom:1rem;margin-bottom:.25rem;border-bottom:4px solid var(--rule)}
.lst li{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:.3rem 2rem;padding-block:1.15rem;border-bottom:1px solid var(--line)}
.lst h3{font-size:1.2rem;line-height:1.3}
.lst p{color:var(--quiet);max-width:60ch}
.lst.num li{grid-template-columns:var(--tc) minmax(0,2fr) minmax(0,3fr);gap:.3rem 1.5rem}
.lst .n{font-family:var(--font-heading);font-size:1.6rem;line-height:1.1;color:var(--deep);font-variant-numeric:tabular-nums}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.7rem,3.4vw,2.7rem);line-height:1.2;max-width:30ch}
.qa div{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:.3rem 2rem;padding-block:1.15rem;border-bottom:1px solid var(--line)}
.qa h3{font-family:var(--font-body);font-size:1.05rem;font-weight:700;letter-spacing:0;text-transform:none;line-height:1.45}
.qa p{color:var(--quiet);max-width:60ch}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
.pair img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:var(--radius)}
.end{margin-top:var(--sec);border-top:4px solid var(--rule)}
.end .w{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2rem clamp(2rem,5vw,4.5rem);padding-block:clamp(2.5rem,5vw,4rem)}
.end h2{font-size:clamp(1.9rem,3.4vw,2.8rem);line-height:1.08;margin-bottom:1rem}
.end .sub{color:var(--quiet);max-width:40ch;margin-bottom:1.75rem;font-size:1.1rem}
.end dl>div{display:grid;grid-template-columns:7rem minmax(0,1fr);gap:1rem;padding-block:.9rem;border-bottom:1px solid var(--line)}
.end dl>div:first-child{border-top:1px solid var(--line)}
.end dt{font-weight:700}
.end dd{overflow-wrap:anywhere}
.end dd a{color:var(--deep);text-underline-offset:.2em}
.foot{background:var(--acc);color:var(--on-acc)}
.foot .w{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.25rem;font-size:.92rem}
@media (max-width:760px){.top nav{display:none}.open{grid-template-columns:minmax(0,1fr);align-items:start}.hrs{grid-template-columns:minmax(0,1fr)}.hrs dt{border-inline-end:0;border-bottom:1px solid var(--line)}.hrs dd{grid-template-columns:repeat(2,minmax(0,1fr))}.hrs dd div:nth-child(2n){border-inline-end:0}.hrs dd div{border-bottom:1px solid var(--line)}:root{--tc:6.25rem}.row .what{grid-template-columns:minmax(0,1fr)}.row .pr{font-size:1rem}.about{grid-template-columns:minmax(0,1fr)}.lst li,.qa div{grid-template-columns:minmax(0,1fr)}.lst.num li{grid-template-columns:2.75rem minmax(0,1fr)}.lst.num p{grid-column:2}.end .w{grid-template-columns:minmax(0,1fr)}.end dl>div{grid-template-columns:minmax(0,1fr);gap:.1rem}}`

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
        <h2 className="hd">Questions</h2>
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
      <h2 className="hd">{l.title}</h2>
      <ol className={steps ? 'lst num' : 'lst'}>
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

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = reachOf(f)
  const groups = c.prices.filter((g) => g.items.length)
  const named = groups.filter((g) => g.group).length > 1
  const hrs = c.hours.filter((h) => h.days || h.time)
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
        <section className="w open">
          <div>
            <p className="tag">{c.tagline}</p>
            <h1>{c.headline}</h1>
          </div>
          <div>
            <p className="sub">{c.subhead}</p>
            <a className="btn" href={reach?.href ?? '#visit'}>
              {c.cta.label}
            </a>
          </div>
        </section>
        {(offerItems(c).length > 0 || hrs.length > 0) && (
          <section className="w" id="offer">
            <div className={offerItems(c).some((it) => it.price) ? 'sheet' : 'sheet bare'}>
              <div className="cap">
                <h2>{c.offerTitle}</h2>
              </div>
              {hrs.length > 0 && (
                <dl className="hrs">
                  <dt>Hours</dt>
                  <dd>
                    {hrs.map((h) => (
                      <div key={`${h.days}${h.time}`}>
                        {h.days && <strong>{h.days}</strong>}
                        {h.time && <span>{h.time}</span>}
                      </div>
                    ))}
                  </dd>
                </dl>
              )}
              {groups.map((g, gi) => (
                <Fragment key={g.group || gi}>
                  {named && g.group && (
                    <div className="gr">
                      <h3>{g.group}</h3>
                    </div>
                  )}
                  {g.items.map((it) => (
                    <div className="row" key={it.name}>
                      <div className="pr">{it.price}</div>
                      <div className="what">
                        <h4>{it.name}</h4>
                        {it.detail && <p>{it.detail}</p>}
                      </div>
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </section>
        )}
        <section className="w sec about">
          <p>{c.about}</p>
          <figure>
            <Pic photo={c.photos.hero} eager />
          </figure>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
        <section className="end" id="visit">
          <div className="w">
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
        </section>
      </main>
      <footer className="foot">
        <div className="w">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const timetable: Template = {
  id: 'timetable',
  label: 'Timetable',
  text: 'Opens with the offer set like a printed timetable pinned by the door: a ruled sheet under a bar in the brand colour, the opening hours across its top, every class, session or lesson as a row with its price in a tinted column where the times would be; clear, practical and all type, for yoga studios, gyms, swimming pools, dance schools and tutors.',
  dark: false,
  css: CSS,
  Page,
}
