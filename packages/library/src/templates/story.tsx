// Story: the page is a journey. One thick track in the business's colour runs down the left of the
// page like a line on a transit map, from a filled stop at the opening to a large stop in the
// closing. Every section is a stop: a ringed station on the track with the heading beside it.
// When the page has steps they sit on the track itself, as filled numbered stops, so the process is
// the route. The closing is a band of the business's colour where the track arrives. Some photos:
// the hero, the introduction and a pair; with drawn art they are left out and the track carries
// the page. For removals, wedding services, trades with a process.

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

const ART = ':is(img[data-art],img[src^="data:image/svg"])'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 3%,#fdfcfa);--tint:color-mix(in oklab,var(--band) 7%,#fbfaf7);--line:color-mix(in oklab,var(--band) 16%,#e4e2dd);--ink:color-mix(in oklab,var(--band) 22%,#16161a);--quiet:color-mix(in oklab,var(--ink) 68%,var(--paper));--deep:color-mix(in oklab,var(--band) 86%,#000);--w:74rem;--gut:clamp(1rem,4vw,3rem);--rail:clamp(2.5rem,7vw,6rem);--track:4px;--sec:clamp(3.5rem,7vw,6rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.bar{display:flex;align-items:center;justify-content:space-between;gap:1rem 2rem;padding-block:1.4rem}
.bar b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.3rem;line-height:1.2}
.bar nav{display:flex;gap:.5rem 1.75rem;flex-wrap:wrap;font-size:.98rem}
.bar nav a{text-decoration:none}.bar nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.route{position:relative}
.route::before{content:"";position:absolute;inset-inline-start:calc(var(--gut) + var(--rail) / 2 - var(--track) / 2);top:clamp(2.5rem,6vw,4.5rem);bottom:0;width:var(--track);background:var(--acc);border-radius:var(--track) var(--track) 0 0;z-index:1}
.stop{display:grid;grid-template-columns:var(--rail) minmax(0,1fr);position:relative}
.stop>.c{grid-column:2;min-width:0}
.st{position:absolute;inset-inline-start:calc(var(--rail) / 2);top:var(--at,calc(var(--sec) + .55rem));width:1.5rem;height:1.5rem;margin-inline-start:-.75rem;border-radius:50%;background:var(--paper);border:var(--track) solid var(--acc);z-index:2}
.tint .st{background:var(--tint)}
.st.go{width:1.75rem;height:1.75rem;margin-inline-start:-.875rem;background:var(--acc)}
.sec{padding-top:var(--sec)}
main{padding-bottom:var(--sec)}
.tint{background:var(--tint);box-shadow:0 0 0 100vmax var(--tint);clip-path:inset(0 -100vmax);padding-bottom:var(--sec);margin-top:var(--sec)}
.hero{padding-top:clamp(2.5rem,6vw,4.5rem)}
.hero .st{--at:calc(clamp(2.5rem,6vw,4.5rem) - .4rem)}
.hero .tag{color:var(--deep);font-weight:600;margin-bottom:1rem}
.hero h1{font-size:clamp(2.5rem,6vw,5.2rem);line-height:1.02;max-width:17ch;margin-bottom:1.5rem}
.hero .sub{font-size:clamp(1.15rem,1.7vw,1.35rem);color:var(--quiet);max-width:42ch;margin-bottom:2rem}
.btn{display:inline-block;padding:.95rem 1.6rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:700;text-decoration:none}
.btn:hover{background:var(--deep)}
.lead{margin-top:clamp(2.5rem,5vw,4rem)}
.lead img{width:100%;aspect-ratio:2/1;object-fit:cover;border-radius:var(--radius)}
.lead:has(${ART}){display:none}
h2.t{font-size:clamp(1.8rem,3.4vw,2.7rem);line-height:1.1;max-width:24ch;margin-bottom:clamp(1.5rem,3vw,2.25rem)}
.intro .c{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2rem,5vw,4rem);align-items:start}
.intro p{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.3rem,2.2vw,1.7rem);line-height:1.45;max-width:34ch}
.intro img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius)}
.intro .c:has(${ART}){grid-template-columns:minmax(0,1fr)}
.intro figure:has(${ART}){display:none}
.offer{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(2rem,4vw,3.5rem)}
.offer li{display:flex;justify-content:space-between;align-items:baseline;gap:1.25rem;padding-block:1rem;border-top:1px solid var(--line)}
.offer li:only-child{grid-column:1/-1;max-width:34rem}
.offer li>div{min-width:0}
.offer h3{font-size:1.2rem;line-height:1.3}
.offer p{color:var(--quiet);font-size:.98rem;margin-top:.2rem}
.offer .pr{font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--deep)}
.list{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1.75rem clamp(1.5rem,4vw,3rem)}
.list li{border-top:2px solid var(--acc);padding-top:1rem}
.list h3{font-size:1.2rem;line-height:1.3;margin-bottom:.35rem}
.list p{color:var(--quiet)}
.steps li{position:relative;padding-block:0 clamp(2rem,4vw,3rem);max-width:40rem}
.steps li:last-child{padding-bottom:0}
.steps .n{position:absolute;inset-inline-start:calc(var(--rail) / -2);top:-.3rem;width:2.75rem;height:2.75rem;margin-inline-start:-1.375rem;display:grid;place-items:center;border-radius:50%;background:var(--acc);color:var(--on-acc);font-family:var(--font-heading);font-weight:700;font-size:1.2rem;font-variant-numeric:tabular-nums;box-shadow:0 0 0 5px var(--tint);z-index:2}
.steps h3{font-size:clamp(1.3rem,2vw,1.6rem);line-height:1.25;margin-bottom:.35rem}
.steps p{color:var(--quiet);font-size:1.1rem}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.7rem,3.6vw,2.9rem);line-height:1.2;max-width:26ch;color:var(--deep)}
.say .st{background:var(--acc)}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(.75rem,2vw,1.5rem)}
.pair img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius)}
.qa{max-width:46rem}
.qa div{padding-block:1.1rem;border-top:1px solid var(--line)}
.qa div:last-child{border-bottom:1px solid var(--line)}
.qa h3{font-size:1.2rem;line-height:1.35;margin-bottom:.3rem}.qa p{color:var(--quiet)}
.end{background:var(--acc);color:var(--on-acc);--paper:var(--acc);--line:color-mix(in oklab,var(--on-acc) 28%,var(--acc));--quiet:color-mix(in oklab,var(--on-acc) 80%,var(--acc))}
.end .route::before{background:var(--on-acc);top:0;bottom:auto;height:calc(var(--sec) + .6rem);border-radius:0}
.end .stop{padding-block:var(--sec)}
.end .st{--at:calc(var(--sec) - .1rem);width:2.5rem;height:2.5rem;margin-inline-start:-1.25rem;background:var(--on-acc);border:0;box-shadow:0 0 0 6px var(--acc),0 0 0 8px var(--on-acc)}
.end h2{font-size:clamp(2.2rem,5vw,4rem);line-height:1.04;max-width:18ch;margin-bottom:1rem}
.end .sub{font-size:1.2rem;color:var(--quiet);max-width:40ch;margin-bottom:2rem}
.end .btn{background:var(--on-acc);color:var(--acc)}
.end dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:1.5rem clamp(1.5rem,3vw,2.5rem);margin-top:clamp(2.5rem,5vw,3.5rem)}
.end dl div{border-top:1px solid var(--line);padding-top:.9rem}
.end dt{font-size:.9rem;color:var(--quiet);margin-bottom:.2rem}
.end dd{overflow-wrap:anywhere}.end dd a{text-decoration:none}
.foot{border-top:1px solid var(--line)}
.foot .w{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.5rem;font-size:.92rem;color:var(--quiet)}
@media (max-width:860px){.bar nav{display:none}.intro .c,.offer{grid-template-columns:minmax(0,1fr)}.lead img{aspect-ratio:4/3}.intro figure{max-width:26rem}}
@media (max-width:560px){:root{--rail:2.75rem;--track:3px}.st{width:1.15rem;height:1.15rem;margin-inline-start:-.575rem}.st.go{width:1.35rem;height:1.35rem;margin-inline-start:-.675rem}.steps .n{width:2.1rem;height:2.1rem;margin-inline-start:-1.05rem;font-size:1rem}.end .st{width:1.4rem;height:1.4rem;margin-inline-start:-.7rem;box-shadow:0 0 0 4px var(--acc),0 0 0 6px var(--on-acc)}.pair{grid-template-columns:minmax(0,1fr)}.offer li{gap:1rem}}`

function Stop(p: { children: ReactNode; className?: string; id?: string; go?: boolean }) {
  return (
    <section className={`stop sec${p.className ? ` ${p.className}` : ''}`} id={p.id}>
      <span className={p.go ? 'st go' : 'st'} aria-hidden="true" />
      <div className="c">{p.children}</div>
    </section>
  )
}

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <Stop className="say">
        <p>{c.statement}</p>
      </Stop>
    )
  if (x === 'faq')
    return (
      <Stop id="questions">
        <h2 className="t">Questions</h2>
        <div className="qa">
          {c.faq?.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </Stop>
    )
  if (x === 'gallery')
    return (
      <section className="stop sec">
        <div className="c pair">
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
  if (x === 'steps')
    return (
      <Stop className="tint">
        <h2 className="t">{l.title}</h2>
        <ol className="steps">
          {l.items.map((it, i) => (
            <li key={it.title}>
              <span className="n">{i + 1}</span>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </li>
          ))}
        </ol>
      </Stop>
    )
  return (
    <Stop>
      <h2 className="t">{l.title}</h2>
      <ul className="list">
        {l.items.map((it) => (
          <li key={it.title}>
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </li>
        ))}
      </ul>
    </Stop>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = f.find((x) => x.href)
  const offer = offerItems(c)
  return (
    <>
      <div className="w bar">
        <b>{c.name}</b>
        <nav>
          {links(c, extras).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="w route">
        <header className="stop hero">
          <span className="st go" aria-hidden="true" />
          <div className="c">
            <p className="tag">{c.tagline}</p>
            <h1>{c.headline}</h1>
            <p className="sub">{c.subhead}</p>
            <a className="btn" href="#visit">
              {c.cta.label}
            </a>
            <figure className="lead">
              <Pic photo={c.photos.hero} eager />
            </figure>
          </div>
        </header>
        <main>
          <Stop className="intro">
            <p>{c.about}</p>
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
          </Stop>
          {offer.length > 0 && (
            <Stop id="offer">
              <h2 className="t">{c.offerTitle}</h2>
              <ul className="offer">
                {offer.map((it) => (
                  <li key={it.name}>
                    <div>
                      <h3>{it.name}</h3>
                      {it.detail && <p>{it.detail}</p>}
                    </div>
                    {it.price && <span className="pr">{it.price}</span>}
                  </li>
                ))}
              </ul>
            </Stop>
          )}
          {xs.map((x) => (
            <Fragment key={x}>
              <Extras c={c} x={x} />
            </Fragment>
          ))}
        </main>
      </div>
      <footer className="end" id="visit">
        <div className="w route">
          <div className="stop">
            <span className="st" aria-hidden="true" />
            <div className="c">
              <h2>{c.cta.headline}</h2>
              <p className="sub">{c.cta.subhead}</p>
              {reach && (
                <a className="btn" href={reach.href}>
                  {c.cta.label}
                </a>
              )}
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
          </div>
        </div>
        <div className="foot">
          <div className="w">
            <span>{c.name}</span>
            <span>{c.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export const story: Template = {
  id: 'story',
  label: 'Story',
  text: "A page that reads as a journey: one thick track in the business's colour runs down the left like a line on a transit map, every section a ringed stop beside it, the steps of the job as filled numbered stops on the track, and the closing a coloured band where the track arrives; clear, reassuring and step by step, for removals, wedding services and trades with a process.",
  dark: false,
  css: CSS,
  Page,
}
