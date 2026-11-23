// Answers: a page built to answer what people ask. When the business has questions, the opening
// puts them beside the headline as a panel in the business's colour, each one a link straight to
// its answer, and the questions and answers come first, right after the opening: the question
// large on the left, the short answer on the right. Every later section keeps that shape, its
// heading on the left where a question would sit and its content on the right; without questions
// the page reads as plain headings and answers, and no question wording is ever made up. Photos are
// optional: a wide hero strip, one beside the introduction and a pair; drawn art is left out. For
// trades, councils, charities, law firms and B&Bs.

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
  reachOf,
  type Template,
  type TemplateProps,
} from './shared.tsx'

const ART = ':is(img[data-art],img[src^="data:image/svg"])'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:#fff;--soft:color-mix(in oklab,var(--band) 5%,#f7f7f5);--ink:color-mix(in oklab,var(--band) 14%,#121212);--line:color-mix(in oklab,var(--ink) 15%,var(--paper));--quiet:color-mix(in oklab,var(--ink) 70%,var(--paper));--deep:color-mix(in oklab,var(--band) 84%,#000);--w:72rem;--gut:clamp(1rem,4vw,3rem);--sec:clamp(3.25rem,6.5vw,5.5rem);--gap:clamp(1.75rem,5vw,4.5rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0938rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1rem 2rem;padding-block:1.3rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.25rem;line-height:1.2;min-width:0}
.top nav{display:flex;gap:.5rem 1.6rem;flex-wrap:wrap;justify-content:flex-end;font-size:.98rem;font-weight:500}
.top nav a{text-decoration:none}.top nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.open{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:var(--gap);align-items:start;padding-block:clamp(2.5rem,6vw,4.5rem) clamp(2.5rem,5vw,3.5rem)}
.open:not(:has(.ask)){grid-template-columns:minmax(0,1fr)}
.open .tag{color:var(--deep);font-weight:600;margin-bottom:1rem}
.open h1{font-size:clamp(2.5rem,5.8vw,4.8rem);line-height:1.03;max-width:16ch;margin-bottom:1.4rem}
.open .sub{font-size:clamp(1.15rem,1.7vw,1.35rem);color:var(--quiet);max-width:40ch;margin-bottom:2rem}
.btn{display:inline-block;padding:.9rem 1.5rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:600;text-decoration:none}
.btn:hover{background:var(--deep)}
.ask{background:var(--acc);color:var(--on-acc);border-radius:var(--radius);padding:clamp(1.4rem,3vw,2rem);--line:color-mix(in oklab,var(--on-acc) 30%,var(--acc))}
.ask ul{display:grid}
.ask li+li{border-top:1px solid var(--line)}
.ask a{display:block;padding-block:.85rem;text-decoration:none;font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.1rem,1.6vw,1.3rem);line-height:1.3}
.ask li:first-child a{padding-top:0}.ask li:last-child a{padding-bottom:0}
.ask a:hover{text-decoration:underline;text-underline-offset:.25em;text-decoration-thickness:1px}
figure.bleed img{width:100%;aspect-ratio:5/2;object-fit:cover;border-radius:var(--radius)}
.sec{padding-block:var(--sec)}
.qa{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:1rem var(--gap)}
.qa>.q{min-width:0}
.qa>.a{min-width:0}
h2.q,h3.q{font-size:clamp(1.6rem,3vw,2.4rem);line-height:1.12;max-width:20ch}
.sec h2.q{position:sticky;top:1.5rem}
.faq{padding-block:var(--sec)}
.faq h2{font-size:clamp(1.15rem,1.6vw,1.3rem);color:var(--deep);margin-bottom:clamp(1.5rem,3vw,2.25rem)}
.faq article{padding-block:clamp(1.5rem,3.5vw,2.5rem);border-top:2px solid var(--ink);scroll-margin-top:1rem}
.faq article:last-child{border-bottom:1px solid var(--line)}
.faq h3.q{font-size:clamp(1.45rem,2.6vw,2.1rem)}
.faq .a p{font-size:clamp(1.15rem,1.6vw,1.3rem);line-height:1.55;max-width:46ch;padding-top:.15rem}
.soft{background:var(--soft)}
.sec+.sec:not(.soft){border-top:1px solid var(--line)}
.about .w{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:var(--gap);align-items:center}
.about p{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.35rem,2.4vw,1.9rem);line-height:1.4;max-width:34ch}
.about img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius)}
.about .w:has(${ART}){grid-template-columns:minmax(0,1fr)}
.about figure:has(${ART}){display:none}
.items li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.25rem 1.5rem;align-items:baseline;padding-block:1rem;border-top:1px solid var(--line)}
.items li:last-child{border-bottom:1px solid var(--line)}
.items h3{font-family:var(--font-body);font-weight:600;letter-spacing:0;text-transform:none;font-size:1.15rem;line-height:1.35}
.items .d{grid-column:1;color:var(--quiet)}
.items .pr{grid-column:2;grid-row:1;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--deep)}
.steps li{display:grid;grid-template-columns:2.5rem minmax(0,1fr);gap:1rem;padding-block:1rem 1.2rem;border-top:1px solid var(--line)}
.steps li:last-child{border-bottom:1px solid var(--line)}
.steps .n{display:grid;place-items:center;width:2.25rem;height:2.25rem;border-radius:50%;border:2px solid var(--acc);color:var(--deep);font-weight:700;font-variant-numeric:tabular-nums}
.steps h3{font-size:1.2rem;line-height:1.3;margin-block:.3rem .25rem}
.steps p,.list p{color:var(--quiet)}
.list li{padding-block:1rem 1.15rem;border-top:1px solid var(--line)}
.list li:last-child{border-bottom:1px solid var(--line)}
.list h3{font-size:1.2rem;line-height:1.3;margin-bottom:.25rem}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.6rem,3.4vw,2.7rem);line-height:1.2;max-width:28ch;color:var(--deep);border-inline-start:4px solid var(--acc);padding-inline-start:clamp(1rem,2.5vw,1.75rem)}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(.75rem,2vw,1.5rem)}
.pair img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius)}
.end{background:var(--acc);color:var(--on-acc);--line:color-mix(in oklab,var(--on-acc) 28%,var(--acc));--quiet:color-mix(in oklab,var(--on-acc) 80%,var(--acc));padding-block:var(--sec)}
.end h2.q{font-size:clamp(2rem,4.4vw,3.4rem);line-height:1.05;max-width:16ch;position:static}
.end .sub{font-size:1.2rem;color:var(--quiet);max-width:40ch;margin-bottom:1.75rem}
.end .btn{background:var(--on-acc);color:var(--acc)}
.end dl div{display:grid;grid-template-columns:6rem minmax(0,1fr);gap:1rem;padding-block:.85rem;border-top:1px solid var(--line)}
.end dl div:last-child{border-bottom:1px solid var(--line)}
.end dt{color:var(--quiet)}
.end dd{overflow-wrap:break-word;min-width:0}.end dd a{text-decoration:none;border-bottom:1px solid var(--line)}
.end .a>dl{margin-top:2.25rem}
.foot .w{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.5rem;font-size:.92rem;color:var(--quiet)}
@media (max-width:860px){.open,.qa{grid-template-columns:minmax(0,1fr)}.about .w{grid-template-columns:minmax(0,1fr)}.about figure{max-width:30rem}.sec h2.q{position:static}figure.bleed img{aspect-ratio:3/2}}
@media (max-width:560px){.top nav{display:none}.pair{grid-template-columns:minmax(0,1fr)}.end dl div{grid-template-columns:minmax(0,1fr);gap:.1rem}}`

/** A section in the page's one shape: the heading where a question would sit, the answer beside. */
function Qa(p: { title: string; children: ReactNode; id?: string; className?: string }) {
  return (
    <section className={`sec${p.className ? ` ${p.className}` : ''}`} id={p.id}>
      <div className="w qa">
        <h2 className="q">{p.title}</h2>
        <div className="a">{p.children}</div>
      </div>
    </section>
  )
}

function Faq({ c }: { c: TemplateProps['c'] }) {
  return (
    <section className="faq" id="questions">
      <div className="w">
        <h2>Questions</h2>
        {c.faq?.map((f, i) => (
          <article className="qa" key={f.q} id={`q${i + 1}`}>
            <h3 className="q">{f.q}</h3>
            <div className="a">
              <p>{f.a}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say">
        <div className="w">
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="w pair">
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
      <Qa title={l.title} className="soft">
        <ol className="steps">
          {l.items.map((it, i) => (
            <li key={it.title}>
              <span className="n">{i + 1}</span>
              <div>
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Qa>
    )
  return (
    <Qa title={l.title}>
      <ul className="list">
        {l.items.map((it) => (
          <li key={it.title}>
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </li>
        ))}
      </ul>
    </Qa>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const faq = xs.includes('faq') && c.faq?.length ? c.faq : null
  const rest = xs.filter((x) => x !== 'faq')
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
      <header className="w open">
        <div>
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </div>
        {faq && (
          <nav className="ask" aria-label="Questions">
            <ul>
              {faq.map((q, i) => (
                <li key={q.q}>
                  <a href={`#q${i + 1}`}>{q.q}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <div className="w">
        <figure className="bleed">
          <Pic photo={c.photos.hero} eager />
        </figure>
      </div>
      <main>
        {faq && <Faq c={c} />}
        <section className={faq ? 'sec about soft' : 'sec about'}>
          <div className="w">
            <p>{c.about}</p>
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
          </div>
        </section>
        {offer.length > 0 && (
          <Qa title={c.offerTitle} id="offer">
            <ul className="items">
              {offer.map((it) => (
                <li key={it.name}>
                  <h3>{it.name}</h3>
                  {it.price && <span className="pr">{it.price}</span>}
                  {it.detail && <p className="d">{it.detail}</p>}
                </li>
              ))}
            </ul>
          </Qa>
        )}
        {rest.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer id="visit">
        <div className="end">
          <div className="w qa">
            <h2 className="q">{c.cta.headline}</h2>
            <div className="a">
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

export const answers: Template = {
  id: 'answers',
  label: 'Answers',
  text: "A page built to answer what people ask: the questions listed beside the headline on a panel in the business's colour, each a link to its answer, then the questions and short answers first, each question large on the left and its answer on the right, and every later section in the same heading-and-answer shape; straightforward, helpful and reassuring, for trades, councils, charities, law firms and B&Bs.",
  dark: false,
  css: CSS,
  Page,
}
