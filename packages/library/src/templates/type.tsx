// Type: no photos at all. Two colours on pale paper, the business's own colour and a near-black
// ink, and two sizes that matter: enormous and small. The headline and every section heading are
// set huge in the colour, running the full width; everything else steps in to one indent line a
// third of the way across and stays small and quiet, so the scale contrast carries the page. The
// call to action is the one place the paper turns to colour, at the close. For tutors, music
// teachers, consultants, writers and coaches who sell what they know.

import { Fragment } from 'react'
import {
  type Extra,
  facts,
  hasVisit,
  links,
  listOf,
  offerItems,
  present,
  RESET,
  reachOf,
  type Template,
  type TemplateProps,
} from './shared.tsx'

const CSS = `${RESET}
:root{--col:var(--band);--on-col:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 4%,#fcfbf8);--ink:color-mix(in oklab,var(--band) 18%,#131313);--quiet:color-mix(in oklab,var(--ink) 64%,var(--paper));--line:color-mix(in oklab,var(--band) 18%,var(--paper));--w:90rem;--gut:clamp(1.25rem,4vw,3.5rem);--sec:clamp(5rem,11vw,10rem);--in:33.333%}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;align-items:baseline;justify-content:space-between;gap:1.5rem;padding-block:1.6rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:1.1rem;line-height:1.3;min-width:0}
.top nav{display:flex;gap:1.75rem;font-size:.95rem;flex-shrink:0}.top nav a{text-decoration:none;color:var(--quiet)}.top nav a:hover{color:var(--ink)}
.in{margin-inline-start:var(--in)}
.hero{padding-block:clamp(4rem,10vw,9rem) var(--sec)}
.hero .tag{color:var(--quiet);margin-bottom:clamp(1.5rem,3vw,2.5rem);max-width:44ch}
.hero h1{font-size:clamp(3.2rem,10.4vw,12.5rem);line-height:.9;letter-spacing:calc(var(--heading-tracking) - .02em);color:var(--col);overflow-wrap:break-word;margin-bottom:clamp(3rem,6vw,5.5rem)}
.hero p.sub{font-size:clamp(1.2rem,1.7vw,1.45rem);line-height:1.45;max-width:30ch;margin-bottom:2rem}
.go{display:inline-block;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.35rem,2vw,1.7rem);line-height:1.2;color:var(--col);text-decoration:underline;text-decoration-thickness:.12em;text-underline-offset:.22em;padding-block:.35rem}
.go:hover{text-decoration-thickness:.2em}
.sec{padding-bottom:var(--sec)}
.intro{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.6rem,3.3vw,3rem);line-height:1.22;max-width:30ch;text-wrap:pretty}
h2{font-size:clamp(2.8rem,8.4vw,9.5rem);line-height:.92;letter-spacing:calc(var(--heading-tracking) - .015em);color:var(--col);max-width:14ch;overflow-wrap:break-word;margin-bottom:clamp(2.5rem,5vw,4.5rem)}
.list li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.35rem 2rem;align-items:baseline;padding-block:1.1rem;border-top:1px solid var(--line)}
.list li:last-child{border-bottom:1px solid var(--line)}
.list h3{font-size:clamp(1.5rem,3vw,2.6rem);line-height:1.1}
.list .pr{font-variant-numeric:tabular-nums;font-size:1.05rem;white-space:nowrap;color:var(--quiet)}
.list p{grid-column:1/-1;color:var(--quiet);max-width:52ch}
.say{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(2.2rem,5.6vw,5.5rem);line-height:1.04;max-width:21ch;text-wrap:balance}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:2.5rem clamp(2rem,4vw,3.5rem)}
.cols h3{font-size:clamp(1.3rem,1.8vw,1.6rem);line-height:1.2;margin-bottom:.5rem}
.cols p{color:var(--quiet);max-width:38ch}
.n{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(4.5rem,9vw,8.5rem);line-height:.85;color:var(--col);margin-bottom:1rem;font-variant-numeric:lining-nums}
.qa>div{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:.5rem clamp(2rem,4vw,4rem);padding-block:1.4rem;border-top:1px solid var(--line)}
.qa>div:last-child{border-bottom:1px solid var(--line)}
.qa h3{font-size:clamp(1.3rem,2vw,1.75rem);line-height:1.2}.qa p{color:var(--quiet);max-width:48ch}
.end{background:var(--col);color:var(--on-col);--quiet:color-mix(in oklab,var(--on-col) 76%,var(--col));--line:color-mix(in oklab,var(--on-col) 28%,var(--col))}
.end .sec{padding-top:var(--sec)}
.end h2{color:inherit;font-size:clamp(3rem,10vw,11.5rem);max-width:13ch}
.end p.sub{font-size:clamp(1.2rem,1.7vw,1.45rem);line-height:1.45;max-width:32ch;margin-bottom:1.75rem}
.end .go{color:inherit}
.end dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:1.75rem 2.5rem;margin-top:clamp(3rem,6vw,5rem);padding-top:1.75rem;border-top:1px solid var(--line)}
.end dt{font-size:.9rem;color:var(--quiet);margin-bottom:.25rem}.end dd{font-size:1.1rem;overflow-wrap:break-word}.end dd a{text-decoration:none}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-block:1.5rem 2rem;background:linear-gradient(var(--line),var(--line)) top center/calc(100% - 2 * var(--gut)) 1px no-repeat;font-size:.92rem;color:var(--quiet)}
@media (max-width:860px){.top nav{display:none}.in{margin-inline-start:0}.qa>div{grid-template-columns:minmax(0,1fr)}.list li{grid-template-columns:minmax(0,1fr)}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="w sec">
        <p className="say">{c.statement}</p>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="w sec" id="questions">
        <h2>Questions</h2>
        <div className="in qa">
          {c.faq?.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    )
  // No photos at all: the gallery has no place in this page.
  if (x === 'gallery') return null
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="w sec">
      <h2>{l.title}</h2>
      <ol className="in cols">
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
  const f = facts(c)
  const reach = reachOf(f)
  const offer = offerItems(c)
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
        <p className="tag in">{c.tagline}</p>
        <h1>{c.headline}</h1>
        <div className="in">
          <p className="sub">{c.subhead}</p>
          <a className="go" href="#visit">
            {c.cta.label}
          </a>
        </div>
      </header>
      <main>
        <section className="w sec">
          <p className="intro in">{c.about}</p>
        </section>
        {offer.length > 0 && (
          <section className="w sec" id="offer">
            <h2>{c.offerTitle}</h2>
            <ul className="in list">
              {offer.map((it) => (
                <li key={it.name}>
                  <h3>{it.name}</h3>
                  {it.price ? <span className="pr">{it.price}</span> : <span />}
                  {it.detail && <p>{it.detail}</p>}
                </li>
              ))}
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
        <div className="w sec">
          <h2>{c.cta.headline}</h2>
          <div className="in">
            <p className="sub">{c.cta.subhead}</p>
            {reach && (
              <a className="go" href={reach.href}>
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
        <div className="w foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const bigType: Template = {
  id: 'type',
  label: 'Type',
  text: "No photos at all: the promise and every heading set enormous in the organisation's own colour on pale paper, everything else small and quiet on one indent line, the colour filling the page only at the close: articulate, confident and personal, for tutors, music teachers, consultants, writers and coaches.",
  dark: false,
  css: CSS,
  Page,
}
