// Cinema: a night at the pictures. The page is near black, and every photo is shown letterboxed:
// a very wide frame between solid black bars, as on a cinema screen. The headline sits under the
// opening picture like a title. With no photo the screen itself carries the type: a wide title
// card in a deep shade of the business's colour, between the same black bars. The offer reads like
// a programme, the statement like an intertitle, and the page ends like film credits: roles and
// names meeting at the centre line, then the name alone on a last card. For cocktail bars, music
// venues, cinemas and late venues.

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
:root{color-scheme:dark;--ground:color-mix(in oklab,var(--band) 12%,#131313);--black:color-mix(in oklab,var(--band) 5%,#040404);--ink:color-mix(in oklab,var(--band) 5%,#eee8de);--quiet:color-mix(in oklab,var(--ink) 62%,var(--ground));--acc:color-mix(in oklab,var(--band) 42%,#f2e9d8);--line:color-mix(in oklab,var(--ink) 15%,var(--ground));--screen:color-mix(in oklab,var(--band) 50%,#0b0b0b);--w:72rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4.5rem,9vw,8rem);--bar:clamp(2rem,6vw,5.5rem);--wide:2.39/1}
body{background:var(--ground);color:var(--ink);font-size:1.0625rem;line-height:1.65}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.n{max-width:calc(38rem + 2 * var(--gut));margin-inline:auto;padding-inline:var(--gut)}
.c{text-align:center}
.top{background:var(--black);display:flex;justify-content:space-between;align-items:center;gap:1.5rem;padding:1.4rem var(--gut)}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.2rem;line-height:1.2}
.top nav{display:flex;gap:1.75rem;font-size:.95rem}.top nav a{text-decoration:none;color:var(--quiet)}.top nav a:hover{color:var(--ink)}
.open{background:var(--black);display:grid;grid-template-areas:"tag" "screen" "title";text-align:center;padding-bottom:var(--sec)}
.open .tag{grid-area:tag;padding:var(--bar) var(--gut) clamp(1.5rem,3vw,2.25rem);color:var(--quiet);font-size:1rem}
.screen{grid-area:screen}
.screen img,.lb img{width:100%;aspect-ratio:var(--wide);object-fit:cover}
.title{grid-area:title;padding:clamp(2.5rem,5vw,4rem) var(--gut) 0;width:100%;max-width:calc(58rem + 2 * var(--gut));margin-inline:auto}
.title h1{font-size:clamp(2.3rem,5.2vw,4.6rem);line-height:1.04;margin-bottom:1.25rem}
.title .sub{color:var(--quiet);font-size:clamp(1.05rem,1.5vw,1.25rem);max-width:40ch;margin:0 auto 2.25rem}
.open:has(.screen ${ART}){grid-template-areas:"tag" "title"}
.open:has(.screen ${ART}) .screen{display:none}
.open:has(.screen ${ART}) .title{max-width:none;min-height:min(calc(100vw / 2.39),34rem);display:grid;place-content:center;justify-items:center;background:var(--screen);padding:clamp(3rem,6vw,5rem) var(--gut)}
.open:has(.screen ${ART}) .title h1{font-size:clamp(2.5rem,6.4vw,5.6rem);max-width:18ch}
.open:has(.screen ${ART}) .title .sub{color:color-mix(in oklab,var(--ink) 80%,var(--screen))}
.btn{display:inline-block;padding:.95rem 1.8rem;border:1px solid var(--acc);color:var(--acc);border-radius:var(--button-radius);text-decoration:none;font-weight:600}
.btn:hover{background:var(--acc);color:var(--black)}
.sec{padding-block:var(--sec)}
.lead{font-family:var(--font-heading);font-size:clamp(1.35rem,2.3vw,1.85rem);line-height:1.5;letter-spacing:var(--heading-tracking)}
.lb{background:var(--black);padding-block:var(--bar)}
h2{font-size:clamp(1.9rem,3.6vw,2.9rem);line-height:1.1;margin-bottom:clamp(2.25rem,4.5vw,3.5rem)}
.prog{max-width:50rem;margin-inline:auto}
.prog li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.3rem 2rem;align-items:baseline;padding-block:1.3rem;border-top:1px solid var(--line)}
.prog li:last-child{border-bottom:1px solid var(--line)}
.prog h3{font-size:clamp(1.2rem,1.8vw,1.45rem);line-height:1.3}
.prog .price{font-family:var(--font-heading);font-size:1.2rem;color:var(--acc);font-variant-numeric:tabular-nums;white-space:nowrap}
.prog p{grid-column:1/-1;color:var(--quiet);max-width:56ch}
section.strip{background:var(--black);padding:var(--bar) var(--gut);display:grid;grid-template-columns:1fr 1fr;gap:clamp(.75rem,2vw,1.5rem)}
.strip img{width:100%;aspect-ratio:16/9;object-fit:cover}
.say{background:var(--black)}
.say .card{max-width:50rem;margin-inline:auto;padding:clamp(2.5rem,6vw,4.5rem) clamp(1.5rem,5vw,4rem);border:1px solid var(--line);outline:1px solid var(--line);outline-offset:.4rem}
.say p{font-family:var(--font-heading);font-size:clamp(1.7rem,3.6vw,2.9rem);line-height:1.22;letter-spacing:var(--heading-tracking);text-wrap:balance}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:2.5rem clamp(1.5rem,3vw,3rem)}
.cols li{text-align:center}
.cols h3{font-size:1.3rem;line-height:1.25;margin-bottom:.5rem}.cols p{color:var(--quiet);max-width:32ch;margin-inline:auto}
.no{display:block;font-family:var(--font-heading);font-size:2.4rem;line-height:1;color:var(--acc);margin-bottom:.9rem}
.faq details{border-top:1px solid var(--line);padding-block:1.2rem}.faq details:last-child{border-bottom:1px solid var(--line)}
.faq summary{font-family:var(--font-heading);font-size:1.2rem;display:flex;justify-content:space-between;gap:1rem}
.faq summary::after{content:"+";color:var(--acc);flex:none}.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.6rem}
.end{background:var(--black);text-align:center}
.end h2{margin-bottom:1.1rem}
.end .sub{color:var(--quiet);max-width:40ch;margin:0 auto 2.25rem;font-size:1.1rem}
.credits{max-width:46rem;margin:clamp(4rem,8vw,6.5rem) auto 0;display:grid;gap:1.6rem}
.credits div{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2rem;align-items:baseline}
.credits dt{text-align:end;color:var(--quiet);font-size:.95rem}
.credits dd{text-align:start;font-family:var(--font-heading);font-size:1.2rem;line-height:1.35;overflow-wrap:anywhere}
.credits dd a{text-decoration:none}.credits dd a:hover{text-decoration:underline;text-underline-offset:.25em}
.last{padding-block:clamp(6rem,14vw,11rem) clamp(3rem,6vw,4.5rem)}
.last b{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.8rem,4vw,3rem);line-height:1.1;text-wrap:balance;max-width:24ch;margin-inline:auto}
.last span{display:block;margin-top:.9rem;color:var(--quiet);font-size:.95rem}
@media (max-width:760px){.top nav{display:none}:root{--wide:2/1}section.strip{grid-template-columns:1fr}.open:has(.screen ${ART}) .title{min-height:22rem}.credits div{grid-template-columns:minmax(0,1fr);gap:.2rem}.credits dt,.credits dd{text-align:center}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say">
        <div className="w c">
          <div className="card">
            <p>{c.statement}</p>
          </div>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="n faq">
          <h2 className="c">Questions</h2>
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
      <figure className="bleed lb">
        <Pic photo={c.photos.cta} />
      </figure>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="sec">
      <div className="w">
        <h2 className="c">{l.title}</h2>
        <ol className="cols">
          {l.items.map((it, i) => (
            <li key={it.title}>
              {x === 'steps' && <span className="no">{i + 1}</span>}
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = f.find((x) => x.href)
  return (
    <>
      <div className="top">
        <b>{c.name}</b>
        <nav>
          {links(c, extras).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <header className="open">
        <p className="tag">{c.tagline}</p>
        <figure className="screen">
          <Pic photo={c.photos.hero} eager />
        </figure>
        <div className="title">
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </div>
      </header>
      <main>
        <section className="sec">
          <div className="n c">
            <p className="lead">{c.about}</p>
          </div>
        </section>
        <figure className="bleed lb">
          <Pic photo={c.photos.about} />
        </figure>
        <section className="sec" id="offer">
          <div className="w">
            <h2 className="c">{c.offerTitle}</h2>
            <ul className="prog">
              {offerItems(c).map((it) => (
                <li key={it.name}>
                  <h3>{it.name}</h3>
                  {it.price ? <span className="price">{it.price}</span> : <span />}
                  {it.detail && <p>{it.detail}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="strip">
          <figure>
            <Pic photo={c.photos.d1} />
          </figure>
          <figure>
            <Pic photo={c.photos.d2} />
          </figure>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
        <div className="sec n" style={{ paddingBottom: 0 }}>
          <h2>{c.cta.headline}</h2>
          <p className="sub">{c.cta.subhead}</p>
          {reach && (
            <a className="btn" href={reach.href}>
              {c.cta.label}
            </a>
          )}
        </div>
        {hasVisit(c) && (
          <dl className="credits w">
            {f.map((x) => (
              <div key={x.label}>
                <dt>{x.label}</dt>
                <dd>{x.href ? <a href={x.href}>{x.value}</a> : x.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="last w">
          <b>{c.name}</b>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const cinema: Template = {
  id: 'cinema',
  label: 'Cinema',
  text: 'A near-black page where every photo is letterboxed like a cinema screen between solid black bars, the headline set under the opening picture like a title, the offer as a programme and a closing set like film credits, roles and names meeting at the centre: dramatic, nocturnal and cinematic, for cocktail bars, music venues, cinemas, theatres and late-night venues.',
  dark: true,
  css: CSS,
  Page,
}
