// Salon hang: the page is a gallery wall. Photos hang in dark frames with pale mounts, at different
// sizes and heights, like a crowded salon hang; the words are set like the gallery's own: the
// headline as the room's title on the wall, the offer as a row of small wall labels (name, a line
// of detail, the price), and the facts as one larger label by the door. The wall is a soft tint of
// the business's colour. With no photos the frames come down and the page is a calm, type-led
// wall of titles and labels, with no empty frames. For tattoo studios, artists, photographers,
// framers and galleries.

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
const REAL = 'img:not([data-art]):not([src^="data:image/svg"])'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--wall:color-mix(in oklab,var(--band) 13%,#e9e6e1);--deep:color-mix(in oklab,var(--band) 20%,#dcd8d1);--ink:color-mix(in oklab,var(--band) 30%,#191817);--quiet:color-mix(in oklab,var(--ink) 68%,var(--wall));--line:color-mix(in oklab,var(--ink) 18%,var(--wall));--frame:color-mix(in oklab,var(--band) 25%,#1d1b19);--mount:color-mix(in oklab,var(--band) 3%,#fbfaf7);--label:#fdfcfa;--w:76rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4.5rem,9vw,8rem)}
body{background:var(--wall);color:var(--ink);font-size:1.0625rem;line-height:1.65}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;justify-content:space-between;align-items:baseline;gap:1.5rem;padding-block:1.6rem;border-bottom:1px solid var(--line)}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.25rem;line-height:1.2}
.top nav{display:flex;gap:1.75rem;font-size:.95rem}.top nav a{text-decoration:none;color:var(--quiet)}.top nav a:hover{color:var(--ink)}
.fr{background:var(--mount);border:clamp(.45rem,.8vw,.7rem) solid var(--frame);padding:clamp(.8rem,1.8vw,1.6rem);box-shadow:0 2px 3px rgb(0 0 0/.12),0 18px 30px -18px rgb(0 0 0/.4)}
.fr img{width:100%;object-fit:cover}
.open{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(2rem,5vw,5rem);align-items:center;padding-block:clamp(3rem,7vw,6rem) var(--sec)}
.open .tag{color:var(--quiet);margin-bottom:1.1rem}
.open h1{font-size:clamp(2.3rem,4.6vw,4.2rem);line-height:1.05;margin-bottom:1.25rem}
.open .sub{color:var(--quiet);font-size:clamp(1.05rem,1.4vw,1.2rem);max-width:36ch;margin-bottom:2rem}
.btn{display:inline-block;padding:.9rem 1.6rem;background:var(--acc);color:var(--on-acc);border-radius:var(--button-radius);text-decoration:none;font-weight:600}
.hang{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:center;gap:clamp(1rem,2.4vw,2.25rem)}
.open .hang figure:nth-child(1){width:58%}.open .hang figure:nth-child(1) img{aspect-ratio:4/5}
.open .hang figure:nth-child(2){width:34%;margin-top:clamp(3rem,9vw,8rem)}.open .hang figure:nth-child(2) img{aspect-ratio:1}
.open:not(:has(.hang ${REAL})){grid-template-columns:minmax(0,1fr);padding-block:clamp(4rem,10vw,9rem) var(--sec)}
.open:not(:has(.hang ${REAL})) .hang{display:none}
.open:not(:has(.hang ${REAL})) h1{font-size:clamp(2.6rem,6.4vw,5.6rem);max-width:17ch}
.open:not(:has(.hang ${REAL})) .sub{font-size:clamp(1.15rem,1.8vw,1.4rem);max-width:42ch}
.hang figure:has(${ART}){display:none}
.hang:has(> figure > ${ART}) figure{width:min(100%,24rem)!important;flex:none;margin-top:0!important}
.sec{padding-block:var(--sec)}
.about{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,4fr);gap:clamp(2rem,6vw,6rem);align-items:start}
.about .fr{margin-top:clamp(0rem,4vw,4rem);rotate:.6deg}.about .fr img{aspect-ratio:3/4}
.about:not(:has(${REAL})){grid-template-columns:minmax(0,1fr)}.about figure:has(${ART}){display:none}
.lead{font-family:var(--font-heading);font-size:clamp(1.4rem,2.4vw,2rem);line-height:1.42;letter-spacing:var(--heading-tracking);max-width:32ch}
h2{font-size:clamp(1.8rem,3.2vw,2.6rem);line-height:1.12;margin-bottom:clamp(1.75rem,3.5vw,2.75rem)}
.labels{display:flex;flex-wrap:wrap;gap:clamp(1rem,2vw,1.5rem);align-items:flex-start}
.labels li{background:var(--label);flex:0 1 16rem;padding:1.1rem 1.25rem 1.2rem;font-size:.95rem;line-height:1.5;box-shadow:0 1px 2px rgb(0 0 0/.08)}
.labels li:nth-child(3n+2){margin-top:clamp(0rem,2.5vw,2.25rem)}.labels li:nth-child(3n){margin-top:clamp(0rem,1vw,.9rem)}
.labels h3{font-family:var(--font-heading);font-size:1.15rem;line-height:1.3;margin-bottom:.3rem}
.labels p{color:var(--quiet)}
.labels .price{display:block;margin-top:.7rem;font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink)}
section.wall{padding-block:0 var(--sec)}
.wall .hang figure:nth-child(1){width:30%;margin-top:clamp(2rem,6vw,5rem)}.wall .hang figure:nth-child(1) img{aspect-ratio:3/4}
.wall .hang figure:nth-child(2){width:46%}.wall .hang figure:nth-child(2) img{aspect-ratio:4/3}
section.wall:not(:has(${REAL})){display:none}
.say p{font-family:var(--font-heading);font-size:clamp(1.8rem,3.8vw,3.2rem);line-height:1.2;letter-spacing:var(--heading-tracking);max-width:24ch;text-wrap:balance}
.say{border-block:1px solid var(--line)}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:2.25rem clamp(1.5rem,3vw,3rem)}
.cols li{border-top:1px solid var(--ink);padding-top:1rem}
.cols h3{font-size:1.25rem;line-height:1.25;margin-bottom:.4rem}.cols p{color:var(--quiet)}
.no{display:block;font-size:.95rem;font-weight:600;margin-bottom:.5rem}
.faq{max-width:50rem}
.faq details{border-top:1px solid var(--line);padding-block:1.15rem}.faq details:last-child{border-bottom:1px solid var(--line)}
.faq summary{font-family:var(--font-heading);font-size:1.2rem;display:flex;justify-content:space-between;gap:1rem}
.faq summary::after{content:"+";flex:none}.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.6rem;max-width:60ch}
.end{background:var(--deep)}
.end .cl{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2rem,6vw,6rem);align-items:start;padding-block:var(--sec)}
.end h2{font-size:clamp(2rem,4vw,3.4rem);line-height:1.06;margin-bottom:1.1rem}
.end .sub{color:var(--quiet);font-size:1.1rem;max-width:38ch;margin-bottom:2rem}
.card{background:var(--label);padding:clamp(1.5rem,3vw,2.25rem);box-shadow:0 1px 2px rgb(0 0 0/.08)}
.card b{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.3rem;line-height:1.25;margin-bottom:1.1rem;padding-bottom:1rem;border-bottom:1px solid var(--line)}
.card dl{display:grid;gap:1rem}
.card dt{font-size:.88rem;color:var(--quiet)}
.card dd{overflow-wrap:anywhere}.card dd a{text-decoration:none;border-bottom:1px solid var(--line)}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-block:1.6rem;font-size:.9rem;color:var(--quiet);border-top:1px solid var(--line)}
@media (max-width:760px){.top nav{display:none}.open,.about,.end .cl{grid-template-columns:minmax(0,1fr)}.open .hang figure:nth-child(1){width:62%}.open .hang figure:nth-child(2){width:32%;margin-top:4rem}.wall .hang figure:nth-child(1){width:40%;margin-top:3rem}.wall .hang figure:nth-child(2){width:54%}.fr{padding:.55rem;border-width:.35rem}.about .fr{max-width:18rem;margin-top:0}.labels li{flex:1 1 100%;margin-top:0!important}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say">
        <div className="w">
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="w">
          <div className="faq">
            <h2>Questions</h2>
            {c.faq?.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  // The page is a hang already: its gallery is the second wall every page has.
  if (x === 'gallery') return null
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="sec">
      <div className="w">
        <h2>{l.title}</h2>
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
        <div className="hang">
          <figure className="fr">
            <Pic photo={c.photos.hero} eager />
          </figure>
          <figure className="fr">
            <Pic photo={c.photos.d1} />
          </figure>
        </div>
      </header>
      <main>
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="w about">
            <p className="lead">{c.about}</p>
            <figure className="fr">
              <Pic photo={c.photos.about} />
            </figure>
          </div>
        </section>
        <section className="sec" id="offer" style={{ paddingTop: 0 }}>
          <div className="w">
            <h2>{c.offerTitle}</h2>
            <ul className="labels">
              {offerItems(c).map((it) => (
                <li key={it.name}>
                  <h3>{it.name}</h3>
                  {it.detail && <p>{it.detail}</p>}
                  {it.price && <span className="price">{it.price}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="wall">
          <div className="w hang">
            <figure className="fr">
              <Pic photo={c.photos.d2} />
            </figure>
            <figure className="fr">
              <Pic photo={c.photos.cta} />
            </figure>
          </div>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
        <div className="w cl">
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
            <div className="card">
              <b>{c.name}</b>
              <dl>
                {f.map((x) => (
                  <div key={x.label}>
                    <dt>{x.label}</dt>
                    <dd>{x.href ? <a href={x.href}>{x.value}</a> : x.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
        <div className="w foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const hang: Template = {
  id: 'hang',
  label: 'Salon hang',
  text: "A gallery wall in a soft tint of the organisation's colour: photos hung in dark frames with pale mounts at different sizes and heights, the headline as the room's title, the offer as small wall labels and the facts as one larger label: curated, artful and personal, for tattoo studios, artists, photographers, framers and galleries.",
  dark: false,
  css: CSS,
  Page,
}
