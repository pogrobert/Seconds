// Glossary: the business as an entry in a good dictionary. The opening sets the name as a very
// large headword, the kind of business in italics after it like a word class, and the headline and
// subhead as its definition. The introduction follows as a usage note, set off by a fine rule and a
// small square. The offer runs in two columns with a hairline between them, each item a run-in
// entry: name in bold, then its detail and price in the same line of text. Steps become numbered
// senses, set in bold numerals like a dictionary. Few photos: the hero as a small plate beside the
// entry and a pair of plates; drawn art is left out and the page stays all type. For cafés,
// bakeries, trades and law.

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
  type Template,
  type TemplateProps,
} from './shared.tsx'

const ART = ':is(img[data-art],img[src^="data:image/svg"])'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 3%,#fbf9f4);--ink:color-mix(in oklab,var(--band) 12%,#17150f);--line:color-mix(in oklab,var(--ink) 20%,var(--paper));--quiet:color-mix(in oklab,var(--ink) 70%,var(--paper));--deep:color-mix(in oklab,var(--band) 84%,#000);--w:68rem;--gut:clamp(1.1rem,4.5vw,3rem);--sec:clamp(3rem,6vw,5rem)}
body{background:var(--paper);color:var(--ink);font-size:1.09rem;line-height:1.62}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.guide{display:flex;align-items:baseline;justify-content:space-between;gap:.75rem 2rem;padding-block:1.3rem .9rem;border-bottom:1px solid var(--ink);font-size:.95rem}
.guide b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.05rem;min-width:0}
.guide nav{display:flex;gap:.4rem 1.6rem;flex-wrap:wrap;justify-content:flex-end}
.guide nav a{text-decoration:none;color:var(--quiet)}.guide nav a:hover{color:var(--ink);text-decoration:underline;text-underline-offset:.3em}
.entry{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,17rem);gap:clamp(2rem,5vw,4.5rem);align-items:start;padding-block:clamp(3rem,8vw,6.5rem) var(--sec)}
.entry:has(.plate ${ART}){grid-template-columns:minmax(0,1fr)}
.entry .plate:has(${ART}){display:none}
.hw{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(3rem,10vw,8.5rem);line-height:.95;overflow-wrap:break-word;color:var(--deep);max-width:12ch;text-wrap:balance}
.hw.long{font-size:clamp(2.4rem,6.4vw,5.5rem);max-width:16ch;line-height:1}
.hw.longer{font-size:clamp(2rem,4.6vw,3.9rem);max-width:22ch;line-height:1.04}
.wc{font-family:var(--font-heading);font-style:italic;font-size:clamp(1.2rem,2.2vw,1.6rem);line-height:1.35;color:var(--quiet);margin-top:clamp(.9rem,2vw,1.4rem);max-width:40ch;padding-bottom:clamp(1.25rem,2.5vw,1.75rem);border-bottom:1px solid var(--line)}
.def{margin-top:clamp(1.25rem,2.5vw,1.75rem)}
.entry h1{font-size:clamp(1.5rem,2.9vw,2.25rem);line-height:1.2;max-width:28ch;margin-bottom:.75rem}
.entry .sub{font-size:clamp(1.12rem,1.6vw,1.28rem);color:var(--quiet);max-width:46ch;margin-bottom:1.75rem}
.btn{display:inline-block;padding:.85rem 1.4rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:600;text-decoration:none}
.btn:hover{background:var(--deep)}
.plate{margin-top:.6rem}
.plate img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:calc(var(--radius) * .3);filter:saturate(.9)}
.note{padding-block:0 var(--sec)}
.note p{display:grid;grid-template-columns:2.25rem minmax(0,1fr);gap:0 .5rem;font-size:clamp(1.15rem,1.8vw,1.35rem);line-height:1.6;max-width:44rem;padding-top:1.25rem;border-top:1px solid var(--line)}
.note p::before{content:"";width:.6rem;height:.6rem;margin-top:.6em;background:var(--acc)}
.sec{padding-block:var(--sec);border-top:1px solid var(--line)}
.sec h2{font-size:clamp(1.7rem,3.2vw,2.5rem);line-height:1.12;max-width:24ch;margin-bottom:clamp(1.5rem,3vw,2.25rem)}
.cols{columns:2;column-gap:clamp(2rem,5vw,4rem);column-rule:1px solid var(--line)}
.cols>*{break-inside:avoid}
.run{font-size:1.1rem;margin-bottom:1.1rem;padding-inline-start:1.5rem;text-indent:-1.5rem}
.run b{font-family:var(--font-heading);font-weight:700;color:var(--ink);font-size:1.06em}
.run .d{color:var(--quiet)}
.run .pr{font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--deep)}
.run i{color:var(--quiet)}
.cols>.run:only-child{column-span:all}
.senses{max-width:46rem}
.senses li{display:grid;grid-template-columns:2.25rem minmax(0,1fr);gap:0 .5rem;margin-bottom:1.1rem;font-size:1.12rem}
.senses .n{font-family:var(--font-heading);font-weight:700;font-size:1.35rem;line-height:1.25;color:var(--deep);font-variant-numeric:lining-nums}
.senses p{color:var(--quiet)}
.senses b{font-family:var(--font-heading);font-weight:700;color:var(--ink);font-size:1.08em}
.cite{padding-block:var(--sec);border-top:1px solid var(--line)}
.cite p{font-family:var(--font-heading);font-style:italic;font-size:clamp(1.45rem,3vw,2.3rem);line-height:1.3;max-width:32ch;margin-inline-start:2.75rem;color:var(--ink)}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(1rem,3vw,2rem);max-width:52rem}
.pair img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:calc(var(--radius) * .3)}
.end{background:color-mix(in oklab,var(--band) 7%,var(--paper));border-top:3px double var(--ink);padding-block:var(--sec)}
.end .in{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2rem,5vw,4.5rem);align-items:start}
.end h2{font-size:clamp(2rem,4.4vw,3.4rem);line-height:1.06;max-width:18ch;margin-bottom:.9rem}
.end .sub{font-size:1.18rem;color:var(--quiet);max-width:38ch;margin-bottom:1.75rem}
.end dl{border-top:1px solid var(--ink)}
.end dl div{padding-block:.8rem;border-bottom:1px solid var(--line)}
.end dt{display:inline;font-family:var(--font-heading);font-style:italic;color:var(--quiet);margin-inline-end:.6rem}
.end dd{display:inline;overflow-wrap:anywhere}
.end dd a{text-decoration:none;border-bottom:1px solid var(--line)}
.foot{border-top:1px solid var(--ink)}
.foot .w{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.4rem;font-size:.92rem;color:var(--quiet)}
.foot b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);color:var(--ink)}
@media (max-width:820px){.entry,.end .in{grid-template-columns:minmax(0,1fr)}.plate{max-width:15rem}.cols{columns:1}}
@media (max-width:560px){.guide nav{display:none}.note p,.senses li{grid-template-columns:1.6rem minmax(0,1fr)}.cite p{margin-inline-start:0}.pair{grid-template-columns:minmax(0,1fr)}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="cite">
        <div className="w">
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="w">
          <h2>Questions</h2>
          <div className="cols">
            {c.faq?.map((f) => (
              <p className="run" key={f.q}>
                <b>{f.q}</b> <span className="d">{f.a}</span>
              </p>
            ))}
          </div>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="w">
          <div className="pair">
            <figure>
              <Pic photo={c.photos.d1} />
            </figure>
            <figure>
              <Pic photo={c.photos.d2} />
            </figure>
          </div>
        </div>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="sec">
      <div className="w">
        <h2>{l.title}</h2>
        {x === 'steps' ? (
          <ol className="senses">
            {l.items.map((it, i) => (
              <li key={it.title}>
                <span className="n">{i + 1}</span>
                <p>
                  <b>{it.title}</b> {it.body}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <div className="cols">
            {l.items.map((it) => (
              <p className="run" key={it.title}>
                <b>{it.title}</b> <span className="d">{it.body}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = f.find((x) => x.href)
  const offer = offerItems(c)
  return (
    <>
      <div className="w guide">
        <b>{c.name}</b>
        <nav>
          {links(c, extras).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <header className="w entry">
        <div>
          <p className={`hw${c.name.length > 40 ? ' longer' : c.name.length > 18 ? ' long' : ''}`}>
            {c.name}
          </p>
          <p className="wc">{c.tagline}</p>
          <div className="def">
            <div>
              <h1>{c.headline}</h1>
              <p className="sub">{c.subhead}</p>
              <a className="btn" href="#visit">
                {c.cta.label}
              </a>
            </div>
          </div>
        </div>
        <figure className="plate">
          <Pic photo={c.photos.hero} eager />
        </figure>
      </header>
      <main>
        <section className="note">
          <div className="w">
            <p>{c.about}</p>
          </div>
        </section>
        {offer.length > 0 && (
          <section className="sec" id="offer">
            <div className="w">
              <h2>{c.offerTitle}</h2>
              <div className="cols">
                {offer.map((it) => (
                  <p className="run" key={it.name}>
                    <b>{it.name}</b>
                    {it.detail && <span className="d"> {it.detail}</span>}
                    {it.price && <span className="pr"> {it.price}</span>}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer id="visit">
        <div className="end">
          <div className="w in">
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
        </div>
        <div className="foot">
          <div className="w">
            <b>{c.name}</b>
            <span>{c.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export const glossary: Template = {
  id: 'glossary',
  label: 'Glossary',
  text: 'The business set as an entry in a good dictionary: its name as a very large headword with the kind of business in italics like a word class and the promise as the definition, the introduction as a usage note, the offer in two ruled columns of run-in entries with prices in the text, and the steps as numbered senses; literate, calm and precise, for cafés, bakeries, trades, solicitors and law firms.',
  dark: false,
  css: CSS,
  Page,
}
