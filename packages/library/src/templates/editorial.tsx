// Editorial: a magazine feature. A masthead with a heavy and a fine rule, then a very large
// headline over a standfirst. The introduction opens with a large initial letter in the
// business's colour, and the owner's statement stands beside it as a pull quote between rules.
// Offer and lists run in columns divided by hairlines, like a printed page. Photos are an extra:
// with none, the page is all type. For law firms, architects, galleries, consultants.

import { Fragment } from 'react'
import {
  type Extra,
  FactRows,
  FaqList,
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

const ART = ':is(img[data-art],img[src^="data:image/svg"])'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:#fdfdfb;--ink:color-mix(in oklab,var(--band) 12%,#111);--hair:color-mix(in oklab,var(--ink) 18%,var(--paper));--quiet:color-mix(in oklab,var(--ink) 66%,var(--paper));--w:74rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4rem,8vw,6.5rem);--col:clamp(1.5rem,3.5vw,3rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.65}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.mast{display:flex;align-items:baseline;justify-content:space-between;gap:1.5rem;padding-block:1.75rem .9rem;border-bottom:3px solid var(--ink);position:relative}
.mast::after{content:"";position:absolute;inset-inline:0;bottom:-8px;border-bottom:1px solid var(--ink)}
.mast b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.35rem,2.4vw,1.85rem);line-height:1.15}
.mast nav{display:flex;gap:1.6rem;font-size:.95rem;flex-shrink:0}.mast nav a{text-decoration:none}.mast nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.hero{padding-block:clamp(3.5rem,8vw,6.5rem) clamp(2.5rem,5vw,4rem)}
.hero .kick{color:var(--acc);font-size:1rem;margin-bottom:1.5rem;font-weight:600}
.hero h1{font-size:clamp(2.8rem,7.2vw,6.5rem);line-height:.98;max-width:16ch}
.hero .stand{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:var(--col);align-items:end;margin-top:clamp(2rem,4vw,3rem);padding-top:1.5rem;border-top:1px solid var(--hair)}
.hero p.sub{font-family:var(--font-heading);font-size:clamp(1.2rem,2vw,1.55rem);line-height:1.4;letter-spacing:var(--heading-tracking);max-width:36ch}
.hero .act{justify-self:end}
.btn{display:inline-block;padding:.9rem 1.5rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:600;text-decoration:none}
.lead img{width:100%;height:auto;aspect-ratio:16/8;object-fit:cover;border-radius:calc(var(--radius) * .3)}
.lead figcaption{font-size:.88rem;color:var(--quiet);margin-top:.6rem}
figure.lead:has(${ART}){display:none}
.sec{padding-block:var(--sec)}
.sec+.sec{border-top:1px solid var(--hair)}
.open{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:var(--col);align-items:start}
.open:not(:has(blockquote)){grid-template-columns:minmax(0,8fr) minmax(0,4fr)}
.intro{font-size:clamp(1.2rem,1.9vw,1.45rem);line-height:1.65;max-width:56ch}
.intro::first-letter{float:inline-start;font-family:var(--font-heading);font-weight:var(--heading-weight);color:var(--acc);font-size:4.6em;line-height:.8;margin-block:.08em 0;margin-inline-end:.09em;text-transform:var(--heading-case)}
blockquote{margin:0;padding-block:1.5rem 1.75rem;border-top:3px solid var(--acc);border-bottom:1px solid var(--acc)}
blockquote p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.5rem,2.6vw,2.2rem);line-height:1.2;text-wrap:balance}
figure.side{margin-top:clamp(3rem,6vw,4.5rem)}
.side img{width:100%;height:auto;aspect-ratio:21/9;object-fit:cover;border-radius:calc(var(--radius) * .3)}
.hd{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:var(--col);align-items:start}
.hd h2{font-size:clamp(1.9rem,3.6vw,3rem);line-height:1.05}
.cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 var(--col)}
.cols>li{padding-block:1.25rem 1.5rem;border-top:1px solid var(--ink)}
.cols h3{font-size:1.3rem;line-height:1.25;margin-bottom:.35rem}
.cols p{color:var(--quiet)}
.cols .pr{font-variant-numeric:tabular-nums;color:var(--acc);font-weight:600;margin-top:.5rem;display:block}
.cols .n{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);color:var(--acc);font-size:2.6rem;line-height:1;margin-bottom:.6rem}
.trio{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
.trio>li{padding-inline:var(--col);border-inline-start:1px solid var(--hair)}
.trio>li:first-child{padding-inline-start:0;border-inline-start:0}
.trio>li:last-child{padding-inline-end:0}
.trio h3{font-size:1.3rem;line-height:1.25;margin-bottom:.5rem}
.trio p{color:var(--quiet)}
.ls{margin-top:clamp(2rem,4vw,3rem);border-top:1px solid var(--ink);padding-top:1.5rem}
.qa{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.75rem var(--col)}
.qa h3{font-size:1.2rem;line-height:1.3;margin-bottom:.4rem}.qa p{color:var(--quiet)}
.pair{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:var(--col);align-items:end}
.pair img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:calc(var(--radius) * .3)}
.pair figure:last-child img{aspect-ratio:4/5}
.end{background:var(--ink);color:var(--paper);--hair:color-mix(in oklab,var(--paper) 22%,var(--ink));--quiet:color-mix(in oklab,var(--paper) 72%,var(--ink))}
.end .top{padding-block:var(--sec) clamp(2.5rem,5vw,4rem);display:grid;grid-template-columns:minmax(0,8fr) minmax(0,4fr);gap:var(--col);align-items:end}
.end h2{font-size:clamp(2.4rem,5.6vw,4.75rem);line-height:1}
.end p.sub{color:var(--quiet);font-size:1.15rem;max-width:36ch;margin-bottom:1.5rem}
.end .btn{background:var(--paper);color:var(--ink)}
.end dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:1.5rem var(--col);border-top:1px solid var(--hair);padding-block:1.5rem var(--sec)}
.end dt{font-size:.88rem;color:var(--quiet);margin-bottom:.25rem}.end dd{font-size:1.05rem;overflow-wrap:break-word}
.end dd a{text-decoration:none;border-bottom:1px solid var(--hair)}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-block:1.5rem;border-top:3px solid var(--paper);font-size:.9rem;color:var(--quiet)}
.foot span:first-child{font-family:var(--font-heading);color:var(--paper)}
@media (max-width:860px){.mast nav{display:none}.hero .stand,.open,.open:not(:has(blockquote)),.hd,.end .top,.trio,.pair{grid-template-columns:minmax(0,1fr)}.hero .act{justify-self:start}.cols,.qa{grid-template-columns:minmax(0,1fr)}.trio>li{padding-inline:0;border-inline-start:0;border-top:1px solid var(--hair);padding-block:1.25rem}.trio>li:first-child{border-top:0}.lead img{aspect-ratio:4/3}.side img{aspect-ratio:4/3}}`

function List({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  const l = listOf(c, x)
  if (!l) return null
  const steps = x === 'steps'
  return (
    <section className="sec">
      <div className="w">
        <div className="hd">
          <h2>{l.title}</h2>
          {steps ? (
            <ol className="cols">
              {l.items.map((it, i) => (
                <li key={it.title}>
                  <span className="n">{i + 1}</span>
                  <h3>{it.title}</h3>
                  <p>{it.body}</p>
                </li>
              ))}
            </ol>
          ) : (
            <span />
          )}
        </div>
        {!steps && (
          <ul className="trio ls">
            <ListItems items={l.items} />
          </ul>
        )}
      </div>
    </section>
  )
}

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement') return null
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="w hd">
          <h2>Questions</h2>
          <div className="qa">
            <FaqList faq={c.faq} />
          </div>
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
  return <List c={c} x={x} />
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = reachOf(f)
  const quote = xs.includes('statement') ? c.statement : undefined
  return (
    <>
      <div className="w">
        <div className="mast">
          <b>{c.name}</b>
          <nav>
            <NavLinks links={links(c, extras)} />
          </nav>
        </div>
      </div>
      <header className="w hero">
        <p className="kick">{c.tagline}</p>
        <h1>{c.headline}</h1>
        <div className="stand">
          <p className="sub">{c.subhead}</p>
          <div className="act">
            <a className="btn" href="#visit">
              {c.cta.label}
            </a>
          </div>
        </div>
      </header>
      <figure className="w lead">
        <Pic photo={c.photos.hero} eager />
      </figure>
      <main>
        <section className="sec">
          <div className="w">
            <div className="open">
              <p className="intro">{c.about}</p>
              {quote && (
                <blockquote>
                  <p>{quote}</p>
                </blockquote>
              )}
            </div>
            <figure className="side bleed">
              <Pic photo={c.photos.about} />
            </figure>
          </div>
        </section>
        <section className="sec" id="offer">
          <div className="w hd">
            <h2>{c.offerTitle}</h2>
            <ul className="cols">
              {offerItems(c).map((it) => (
                <li key={it.name}>
                  <h3>{it.name}</h3>
                  {it.detail && <p>{it.detail}</p>}
                  {it.price && <span className="pr">{it.price}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
        <div className="w">
          <div className="top">
            <h2>{c.cta.headline}</h2>
            <div>
              <p className="sub">{c.cta.subhead}</p>
              {reach && (
                <a className="btn" href={reach.href}>
                  {c.cta.label}
                </a>
              )}
            </div>
          </div>
          {hasVisit(c) && (
            <dl>
              <FactRows facts={f} />
            </dl>
          )}
          <div className="foot">
            <span>{c.name}</span>
            <span>{c.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export const editorial: Template = {
  id: 'editorial',
  label: 'Editorial',
  text: 'A page set like a magazine feature: a masthead between a heavy and a fine rule, a very large headline over a standfirst, an introduction opening with a large initial letter set beside a pull quote between rules, and lists in columns divided by hairlines; considered, articulate and assured, for law firms, architects, galleries and consultants.',
  dark: false,
  css: CSS,
  Page,
}
