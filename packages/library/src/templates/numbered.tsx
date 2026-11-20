// Numbered: the page is a contents. Every section with a heading carries a two-digit number, from
// 00 at the opening to the closing, and the same numbers run the menu and a full contents list
// beside the headline, so the page reads like a well-made manual. Each section opens on a heavy
// rule with its number in the business's colour hanging in a left column; offer items wear small
// label tags with their group. Steps take sub-numbers of their section (04.1, 04.2). Photos are
// optional: the hero runs as a wide strip and the introduction has one beside it; with drawn art
// both are left out and the numbers carry the page. For any business.

import { Fragment, type ReactNode } from 'react'
import {
  type Extra,
  facts,
  hasVisit,
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
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 2%,#fbfbf9);--ink:color-mix(in oklab,var(--band) 14%,#141414);--line:color-mix(in oklab,var(--ink) 16%,var(--paper));--quiet:color-mix(in oklab,var(--ink) 68%,var(--paper));--num:color-mix(in oklab,var(--band) 82%,#000);--tag:color-mix(in oklab,var(--band) 9%,var(--paper));--w:76rem;--gut:clamp(1rem,4vw,3rem);--idx:clamp(4.5rem,9vw,8rem);--sec:clamp(3.5rem,7vw,6rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.n{font-variant-numeric:tabular-nums lining-nums;font-feature-settings:"tnum","lnum"}
.top{display:flex;align-items:baseline;justify-content:space-between;gap:1rem 2.5rem;padding-block:1.4rem;border-bottom:1px solid var(--line)}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.2rem;line-height:1.2;min-width:0}
.top nav{display:flex;gap:.5rem 1.75rem;flex-wrap:wrap;justify-content:flex-end;font-size:.95rem}
.top nav a{text-decoration:none;display:inline-flex;gap:.45rem;align-items:baseline}
.top nav a .n{color:var(--num);font-size:.82rem;font-weight:600}
.top nav a:hover span:last-child{text-decoration:underline;text-underline-offset:.3em}
.sec{padding-block:var(--sec)}
.row{display:grid;grid-template-columns:var(--idx) minmax(0,1fr);position:relative;padding-top:clamp(1rem,2vw,1.5rem)}
.row::before{content:"";position:absolute;top:0;inset-inline:var(--gut);height:3px;background:var(--ink)}
.row>.no{font-family:var(--font-heading);font-weight:var(--heading-weight);color:var(--num);font-size:clamp(1.5rem,2.6vw,2.2rem);line-height:1.1}
.row>.c{min-width:0}
.row h2{font-size:clamp(1.8rem,3.6vw,3rem);line-height:1.08;max-width:22ch;margin-bottom:clamp(1.75rem,3.5vw,2.75rem)}
.open{padding-block:clamp(2.5rem,6vw,4.5rem) calc(var(--sec) * .5)}
.open .c{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:clamp(2rem,5vw,4.5rem);align-items:start}
.open .tag{color:var(--quiet);margin-bottom:1.1rem;font-size:1rem}
.open h1{font-size:clamp(2.6rem,6.4vw,5.6rem);line-height:1;max-width:15ch;margin-bottom:1.5rem}
.open .sub{font-size:clamp(1.15rem,1.7vw,1.35rem);color:var(--quiet);max-width:40ch;margin-bottom:2rem}
.btn{display:inline-block;padding:.9rem 1.5rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:600;text-decoration:none}
.btn:hover{background:color-mix(in oklab,var(--band) 82%,#000)}
.toc{border-top:1px solid var(--ink);font-size:1.05rem;margin-top:.4rem}
.toc li{border-bottom:1px solid var(--line)}
.toc a{display:grid;grid-template-columns:2.5rem minmax(0,1fr);gap:.75rem;padding-block:.7rem;text-decoration:none;line-height:1.35}
.toc a .n{color:var(--num);font-weight:600}
.toc a:hover span:last-child{text-decoration:underline;text-underline-offset:.25em}
figure.bleed{margin-top:clamp(2.5rem,5vw,4rem)}
figure.bleed img{width:100%;aspect-ratio:21/9;object-fit:cover;border-radius:calc(var(--radius) * .4)}
.intro{margin-inline-start:var(--idx);display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:clamp(2rem,5vw,4.5rem);align-items:start;margin-top:clamp(2.5rem,5vw,4rem)}
.intro p{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.3rem,2.2vw,1.75rem);line-height:1.4;max-width:34ch}
.intro img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:calc(var(--radius) * .4)}
.intro:has(${ART}){grid-template-columns:minmax(0,1fr)}
.intro figure:has(${ART}){display:none}
.offer{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(2rem,4vw,3.5rem)}
.offer li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.3rem 1.25rem;align-items:baseline;padding-block:1rem 1.15rem;border-top:1px solid var(--line)}
.offer li:only-child{grid-column:1/-1;max-width:36rem}
.offer h3{font-family:var(--font-body);font-weight:600;letter-spacing:0;text-transform:none;font-size:1.12rem;line-height:1.35}
.offer .pr{font-weight:600;white-space:nowrap}
.offer .d{grid-column:1/-1;color:var(--quiet);font-size:.98rem}
.lab{grid-column:1/-1;justify-self:start;display:inline-block;font-size:.78rem;line-height:1.3;font-weight:600;padding:.18rem .5rem;border:1px solid color-mix(in oklab,var(--num) 45%,var(--paper));background:var(--tag);color:var(--num);border-radius:calc(var(--radius) * .3);margin-bottom:.15rem}
.list{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1.75rem clamp(1.5rem,3vw,2.75rem)}
.list li{border-top:1px solid var(--line);padding-top:1rem}
.list h3{font-size:1.2rem;line-height:1.3;margin-bottom:.35rem}
.list p{color:var(--quiet)}
.steps li{display:grid;grid-template-columns:4rem minmax(0,1fr);gap:1rem;padding-block:1.1rem 1.3rem;border-top:1px solid var(--line);max-width:48rem}
.steps .n{color:var(--num);font-weight:600;font-size:1.05rem;line-height:1.6}
.steps h3{font-size:1.25rem;line-height:1.3;margin-bottom:.3rem}
.steps p{color:var(--quiet)}
.qa div{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:.5rem clamp(1.5rem,4vw,3.5rem);padding-block:1.1rem 1.3rem;border-top:1px solid var(--line)}
.qa h3{font-family:var(--font-body);font-weight:600;letter-spacing:0;text-transform:none;font-size:1.12rem;line-height:1.4}
.qa p{color:var(--quiet);max-width:56ch}
.say{display:grid;grid-template-columns:var(--idx) minmax(0,1fr)}
.say p{grid-column:2;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.6rem,3.4vw,2.7rem);line-height:1.18;max-width:28ch;padding-inline-start:clamp(1rem,2.5vw,1.75rem);border-inline-start:3px solid var(--acc)}
.gal{display:grid;grid-template-columns:var(--idx) minmax(0,1fr) minmax(0,1fr);gap:clamp(.75rem,2vw,1.5rem)}
.gal figure:first-child{grid-column:2}
.gal img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:calc(var(--radius) * .4)}
.end{background:var(--acc);color:var(--on-acc);--ink:var(--on-acc);--num:var(--on-acc);--line:color-mix(in oklab,var(--on-acc) 28%,var(--acc));--quiet:color-mix(in oklab,var(--on-acc) 80%,var(--acc))}
.end .row::before{background:var(--on-acc)}
.end h2{font-size:clamp(2.2rem,5vw,4.2rem);line-height:1.02;max-width:18ch;margin-bottom:1rem}
.end .sub{font-size:1.2rem;color:var(--quiet);max-width:40ch;margin-bottom:2rem}
.end .btn{background:var(--on-acc);color:var(--acc)}
.end dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:1.5rem clamp(1.5rem,3vw,2.5rem);margin-top:clamp(2.5rem,5vw,3.5rem)}
.end dl div{border-top:1px solid var(--line);padding-top:.85rem}
.end dt{font-size:.88rem;color:var(--quiet);margin-bottom:.2rem}
.end dd{overflow-wrap:break-word;min-width:0}.end dd a{text-decoration:none;border-bottom:1px solid var(--line)}
.foot{border-top:1px solid var(--line)}
.foot .w{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.5rem;font-size:.92rem;color:var(--quiet)}
@media (max-width:900px){.open .c,.intro,.offer{grid-template-columns:minmax(0,1fr)}.intro figure{max-width:24rem}.toc{max-width:30rem}}
@media (max-width:640px){:root{--idx:0px}.top nav{display:none}.row{grid-template-columns:minmax(0,1fr)}.row>.no{font-size:1.25rem;margin-bottom:.5rem}.say p{padding-inline-start:1rem}.gal{grid-template-columns:minmax(0,1fr)}.gal figure:first-child{grid-column:auto}figure.bleed img{aspect-ratio:3/2}.qa div{grid-template-columns:minmax(0,1fr)}.steps li{grid-template-columns:3rem minmax(0,1fr);gap:.75rem}}`

const pad = (n: number) => String(n).padStart(2, '0')

type Entry = { id: string; no: string; title: string; x?: Extra }

/** The numbered sections, in page order: each one with a heading of its own from the content. */
function contents(c: TemplateProps['c'], xs: Extra[]): Entry[] {
  const out: Omit<Entry, 'no'>[] = []
  if (offerItems(c).length) out.push({ id: 'offer', title: c.offerTitle })
  for (const x of xs) {
    if (x === 'faq') out.push({ id: 'questions', title: 'Questions', x })
    else {
      const l = listOf(c, x)
      if (l) out.push({ id: `s-${x}`, title: l.title, x })
    }
  }
  out.push({ id: 'visit', title: c.cta.headline })
  return out.map((e, i) => ({ ...e, no: pad(i + 1) }))
}

function Row(p: { e: Entry; children: ReactNode; className?: string }) {
  return (
    <section className={`sec${p.className ? ` ${p.className}` : ''}`} id={p.e.id}>
      <div className="w row">
        <span className="no n" aria-hidden="true">
          {p.e.no}
        </span>
        <div className="c">
          <h2>{p.e.title}</h2>
          {p.children}
        </div>
      </div>
    </section>
  )
}

function Extras({ c, x, e }: { c: TemplateProps['c']; x: Extra; e?: Entry }) {
  if (x === 'statement')
    return (
      <section className="sec">
        <div className="w say">
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="w gal">
          <figure>
            <Pic photo={c.photos.d1} />
          </figure>
          <figure>
            <Pic photo={c.photos.d2} />
          </figure>
        </div>
      </section>
    )
  if (!e) return null
  if (x === 'faq')
    return (
      <Row e={e}>
        <div className="qa">
          {c.faq?.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </Row>
    )
  const l = listOf(c, x)
  if (!l) return null
  if (x === 'steps')
    return (
      <Row e={e}>
        <ol className="steps">
          {l.items.map((it, i) => (
            <li key={it.title}>
              <span className="n">
                {e.no}.{i + 1}
              </span>
              <div>
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Row>
    )
  return (
    <Row e={e}>
      <ul className="list">
        {l.items.map((it) => (
          <li key={it.title}>
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </li>
        ))}
      </ul>
    </Row>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const toc = contents(c, xs)
  const f = facts(c)
  const reach = f.find((x) => x.href)
  const groups = c.prices.filter((g) => g.items.length).length
  const offer = toc.find((e) => e.id === 'offer')
  const visit = toc[toc.length - 1]
  // The menu: the offer, the questions and the visit, each with its section's number.
  const menu = toc.filter((e) => e.id === 'offer' || e.id === 'questions' || e.id === 'visit')
  return (
    <>
      <div className="w top">
        <b>{c.name}</b>
        <nav>
          {menu.map((e) => (
            <a key={e.id} href={`#${e.id}`}>
              <span className="n">{e.no}</span>
              <span>{e.id === 'visit' ? (hasVisit(c) ? 'Visit' : c.cta.label) : e.title}</span>
            </a>
          ))}
        </nav>
      </div>
      <header className="open">
        <div className="w row">
          <span className="no n" aria-hidden="true">
            00
          </span>
          <div className="c">
            <div>
              <p className="tag">{c.tagline}</p>
              <h1>{c.headline}</h1>
              <p className="sub">{c.subhead}</p>
              <a className="btn" href="#visit">
                {c.cta.label}
              </a>
            </div>
            <ol className="toc">
              {toc.map((e) => (
                <li key={e.id}>
                  <a href={`#${e.id}`}>
                    <span className="n">{e.no}</span>
                    <span>{e.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="w">
          <figure className="bleed">
            <Pic photo={c.photos.hero} eager />
          </figure>
          <div className="intro">
            <p>{c.about}</p>
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
          </div>
        </div>
      </header>
      <main>
        {offer && (
          <Row e={offer}>
            <ul className="offer">
              {c.prices.flatMap((g) =>
                g.items.map((it) => (
                  <li key={`${g.group}${it.name}`}>
                    {groups > 1 && g.group && <span className="lab">{g.group}</span>}
                    <h3>{it.name}</h3>
                    {it.price ? <span className="pr n">{it.price}</span> : <span />}
                    {it.detail && <p className="d">{it.detail}</p>}
                  </li>
                )),
              )}
            </ul>
          </Row>
        )}
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} e={toc.find((e) => e.x === x)} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
        <div className="sec">
          <div className="w row">
            <span className="no n" aria-hidden="true">
              {visit?.no}
            </span>
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

export const numbered: Template = {
  id: 'numbered',
  label: 'Numbered',
  text: "A page set out like a well-made manual: every section numbered from 00, the same numbers running the menu and a contents list beside the headline, each section opening on a heavy rule with its number in the business's colour, offer items with small label tags and steps sub-numbered; orderly, clear and confident, for any business, from studios and clinics to trades and shops.",
  dark: false,
  css: CSS,
  Page,
}
