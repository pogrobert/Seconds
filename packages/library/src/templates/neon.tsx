// Neon night: a club flyer after dark. The ground is near black with a trace of the business's
// colour, and that colour is used one way only: as neon. Its tube is a pale core with a glow of
// the colour around it, so even a calm or near-black brand colour reads as a lit sign. The
// headline is the sign, set large and lit; the same tube runs as a line under the opening, frames
// the opening photo and the buttons, and outlines the step numbers. Everything else is plain pale
// type. The offer is a line-up, as on a gig flyer: each name set large and centred, its price lit
// beneath. Photos are optional: without them the lit headline takes the whole opening. For clubs,
// bars, DJs, comedy nights, arcades and late venues.

import { Fragment } from 'react'
import {
  type Extra,
  FactRows,
  FaqDetails,
  facts,
  hasVisit,
  links,
  listOf,
  NavLinks,
  Pic,
  present,
  RESET,
  reachOf,
  type Template,
  type TemplateProps,
} from './shared.tsx'

const ART = ':is(img[data-art],img[src^="data:image/svg"])'

const CSS = `${RESET}
:root{color-scheme:dark;--night:color-mix(in oklab,var(--band) 9%,#08080a);--lift:color-mix(in oklab,var(--band) 14%,#101012);--ink:color-mix(in oklab,var(--band) 4%,#f3f1ee);--quiet:color-mix(in oklab,var(--ink) 64%,var(--night));--line:color-mix(in oklab,var(--ink) 13%,var(--night));--tube:color-mix(in oklab,var(--band) 26%,#fff);--halo:color-mix(in oklab,var(--band) 80%,#fff);--haze:color-mix(in oklab,var(--band) 75%,transparent);--lit:0 0 .02em var(--tube),0 0 .09em var(--halo),0 0 .24em var(--halo),0 0 .65em var(--haze);--glow:0 0 3px var(--halo),0 0 12px var(--halo),0 0 30px var(--haze);--w:76rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(3.75rem,7vw,6.25rem)}
body{background:var(--night);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.sec{padding-block:var(--sec)}
.top{display:flex;justify-content:space-between;align-items:center;gap:1.5rem;padding-block:1.5rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.2rem;line-height:1.15;min-width:0;overflow-wrap:anywhere}
.top nav{display:flex;gap:1.75rem;font-size:.95rem;flex:none}.top nav a{text-decoration:none;color:var(--quiet)}.top nav a:hover{color:var(--ink)}
.tube{height:3px;border-radius:3px;background:var(--tube);box-shadow:var(--glow)}
.hero{display:grid;grid-template-columns:minmax(0,8fr) minmax(0,4fr);gap:clamp(2.5rem,6vw,6rem);align-items:center;padding-block:clamp(3rem,7vw,6rem) clamp(4rem,8vw,7rem)}
.hero .tag{color:var(--quiet);font-size:1.05rem;margin-bottom:1.5rem}
.hero h1{font-size:clamp(2.7rem,6.6vw,6.4rem);line-height:.95;color:var(--tube);text-shadow:var(--lit);overflow-wrap:break-word;margin-bottom:1.75rem}
.hero .sub{font-size:clamp(1.1rem,1.5vw,1.3rem);color:color-mix(in oklab,var(--ink) 84%,var(--night));max-width:38ch;margin-bottom:2.5rem}
.btn{display:inline-block;padding:.95rem 1.9rem;border:2px solid var(--tube);border-radius:var(--button-radius);color:var(--ink);font-weight:600;text-decoration:none;box-shadow:var(--glow),inset 0 0 10px var(--haze)}
.btn:hover{background:color-mix(in oklab,var(--band) 30%,transparent)}
.shot{position:relative;margin:1rem}
.shot::before{content:"";position:absolute;inset:-1rem;border:2px solid var(--tube);border-radius:calc(var(--radius) + 1rem);box-shadow:var(--glow),inset 0 0 12px var(--haze);pointer-events:none}
.shot img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius)}
.hero:has(.shot ${ART}){grid-template-columns:minmax(0,1fr);padding-block:clamp(4rem,10vw,8.5rem)}
.hero:has(.shot ${ART}) .shot{display:none}
.hero:has(.shot ${ART}) .copy{text-align:center}
.hero:has(.shot ${ART}) h1{font-size:clamp(2.8rem,8vw,7.5rem);max-width:15ch;margin-inline:auto}
.hero:has(.shot ${ART}) .sub{margin-inline:auto}
.about{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(2rem,5vw,5rem);align-items:center}
.about img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius)}
.about p{font-size:clamp(1.25rem,2.1vw,1.6rem);line-height:1.5;max-width:36ch}
.about:has(${ART}){grid-template-columns:minmax(0,1fr)}.about:has(${ART}) figure{display:none}
.about:has(${ART}) p{max-width:40ch;margin-inline:auto;text-align:center}
h2{font-size:clamp(2rem,4.4vw,3.6rem);line-height:1.02;margin-bottom:clamp(2.25rem,4.5vw,3.5rem);overflow-wrap:break-word}
.c{text-align:center}
.lineup{max-width:58rem;margin-inline:auto;text-align:center}
.lineup .g{display:flex;align-items:center;gap:1.25rem;margin-block:clamp(2.5rem,5vw,3.5rem) 1.25rem;color:var(--quiet);font-size:1rem;font-weight:500}
.lineup .g:first-child{margin-top:0}
.lineup .g::before,.lineup .g::after{content:"";flex:1;height:2px;border-radius:2px;background:var(--tube);box-shadow:var(--glow);opacity:.75}
.lineup li{padding-block:clamp(1rem,2vw,1.4rem)}
.lineup h3{font-size:clamp(1.65rem,4.2vw,3.2rem);line-height:1.02;overflow-wrap:break-word}
.lineup .meta{display:flex;justify-content:center;align-items:baseline;flex-wrap:wrap;gap:.25rem 1.25rem;margin-top:.55rem}
.lineup .price{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.15rem,1.8vw,1.4rem);color:var(--tube);font-variant-numeric:tabular-nums;white-space:nowrap}
.lineup p{color:var(--quiet)}
section.pair{padding-bottom:var(--sec);display:grid;grid-template-columns:1fr 1fr;gap:clamp(.75rem,2vw,1.5rem);max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.pair img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--radius)}
figure.bleed{max-width:var(--w);margin-inline:auto;padding:0 var(--gut) var(--sec)}
figure.bleed img{width:100%;aspect-ratio:2/1;object-fit:cover;border-radius:var(--radius)}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.9rem,4.6vw,3.8rem);line-height:1.08;max-width:22ch;margin-inline:auto;text-align:center;text-wrap:balance;overflow-wrap:break-word}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(15rem,100%),1fr));gap:2.5rem clamp(1.5rem,4vw,3.5rem)}
.cols li{border-top:1px solid var(--line);padding-top:1.4rem}
.cols h3{font-size:clamp(1.35rem,2vw,1.6rem);line-height:1.15;margin-bottom:.5rem;overflow-wrap:break-word}
.cols p{color:var(--quiet);max-width:40ch}
.steps li{border-top:0;padding-top:0}
.no{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(3.5rem,7vw,5.5rem);line-height:1;color:transparent;-webkit-text-stroke:2px var(--tube);filter:drop-shadow(0 0 3px var(--halo)) drop-shadow(0 0 12px var(--haze));margin-bottom:1rem}
.faq{max-width:52rem;margin-inline:auto}
.faq details{border-top:1px solid var(--line);padding-block:1.3rem}.faq details:last-child{border-bottom:1px solid var(--line)}
.faq summary{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:1.3rem;line-height:1.3;display:flex;justify-content:space-between;gap:1.5rem}
.faq summary::after{content:"+";color:var(--tube);flex:none}.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.6rem;max-width:62ch}
.end{text-align:center}
.end h2{font-size:clamp(2.4rem,6vw,5rem);line-height:1;max-width:16ch;margin-inline:auto;margin-bottom:1.25rem}
.end .sub{color:var(--quiet);font-size:1.15rem;max-width:42ch;margin:0 auto 2.5rem}
.end dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(13rem,100%),1fr));margin-top:clamp(3.5rem,7vw,5.5rem);border-block:1px solid var(--line);text-align:start}
.end dl div{padding:1.5rem clamp(1rem,2vw,1.75rem);border-inline-start:1px solid var(--line)}
.end dl div:first-child{border-inline-start:0}
.end dt{color:var(--tube);font-size:.92rem;margin-bottom:.35rem}
.end dd{overflow-wrap:anywhere}.end dd a{text-decoration:none}.end dd a:hover{text-decoration:underline;text-underline-offset:.25em}
.foot{display:flex;justify-content:space-between;gap:.5rem 1.5rem;flex-wrap:wrap;padding-block:2rem;color:var(--quiet);font-size:.92rem}
@media (max-width:760px){.top nav{display:none}.hero,.about{grid-template-columns:minmax(0,1fr)}.shot img{aspect-ratio:4/3}.about:has(${ART}) p{text-align:start}.end dl div{border-inline-start:0;border-top:1px solid var(--line);padding-inline:0}.end dl div:first-child{border-top:0}}`

/** The owner's groups, each a part of the line-up; a group with no name has no heading. */
const groups = (c: TemplateProps['c']) => c.prices.filter((g) => g.items.length)

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
          <h2 className="c">Questions</h2>
          <div className="faq">
            <FaqDetails faq={c.faq} />
          </div>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <figure className="bleed">
        <Pic photo={c.photos.cta} />
      </figure>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="sec">
      <div className="w">
        <h2>{l.title}</h2>
        <ol className={x === 'steps' ? 'cols steps' : 'cols'}>
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
  const reach = reachOf(f)
  const gs = groups(c)
  return (
    <>
      <div className="w top">
        <b>{c.name}</b>
        <nav>
          <NavLinks links={links(c, extras)} />
        </nav>
      </div>
      <header className="w hero">
        <div className="copy">
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </div>
        <figure className="shot">
          <Pic photo={c.photos.hero} eager />
        </figure>
      </header>
      <div className="w">
        <div className="tube" />
      </div>
      <main>
        <section className="sec">
          <div className="w about">
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
            <p>{c.about}</p>
          </div>
        </section>
        <section className="sec" id="offer" style={{ paddingTop: 0 }}>
          <div className="w">
            <h2 className="c">{c.offerTitle}</h2>
            <div className="lineup">
              {gs.map((g, i) => (
                <Fragment key={i}>
                  {g.group && <p className="g">{g.group}</p>}
                  <ul>
                    {g.items.map((it) => (
                      <li key={it.name}>
                        <h3>{it.name}</h3>
                        {(it.price || it.detail) && (
                          <div className="meta">
                            {it.price && <span className="price">{it.price}</span>}
                            {it.detail && <p>{it.detail}</p>}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </Fragment>
              ))}
            </div>
          </div>
        </section>
        <section className="pair">
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
      <footer id="visit" className="w end">
        <div className="tube" />
        <div className="sec" style={{ paddingBottom: 0 }}>
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
            <FactRows facts={f} />
          </dl>
        )}
        <div className="foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const neon: Template = {
  id: 'neon',
  label: 'Neon night',
  text: "A near-black flyer for a night out, lit by one neon colour: the organisation's colour glowing like a sign, the headline lit large beside a photo in a glowing tube frame, the offer as a gig line-up of big centred names with lit prices and steps as outlined neon numbers: loud, electric and after-dark, for clubs, bars, DJs, comedy nights, karaoke, arcades and late-night venues.",
  dark: true,
  draft: true,
  css: CSS,
  Page,
}
