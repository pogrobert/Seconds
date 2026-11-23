// Heritage: traditional and established. The whole page sits inside a fine double frame on warm
// paper, everything centred on one axis. The name is set large at the top over a ruled line of
// links; sections are divided by one recurring ornament, a hairline broken by a small diamond,
// drawn in CSS. Photos hang in thin frames with a margin like old prints; steps carry Roman
// numerals. With no photos the page is type and ornament only. For pubs, hotels, funeral
// directors and old family firms.

import { Fragment } from 'react'
import {
  type Extra,
  FactRows,
  FaqList,
  facts,
  hasVisit,
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
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 4%,#faf6ee);--ink:color-mix(in oklab,var(--band) 28%,#1a1714);--hair:color-mix(in oklab,var(--band) 30%,#d9d1c2);--quiet:color-mix(in oklab,var(--ink) 66%,var(--paper));--w:66rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(3.5rem,7vw,6rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.65;padding:clamp(.5rem,1.5vw,1.1rem)}
.frame{border:1px solid var(--acc);box-shadow:inset 0 0 0 5px var(--paper),inset 0 0 0 6px var(--acc);padding:6px}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.c{text-align:center}
.orn{position:relative;display:block;width:min(15rem,60%);height:11px;margin:0 auto}
.orn::before{content:"";position:absolute;inset-inline:0;top:5px;border-top:1px solid var(--acc)}
.orn::after{content:"";position:absolute;left:50%;top:1px;width:9px;height:9px;transform:translateX(-50%) rotate(45deg);background:var(--paper);border:1px solid var(--acc);box-shadow:0 0 0 5px var(--paper)}
.head{padding-block:clamp(2.25rem,5vw,3.5rem) 0}
.head .tag{color:var(--acc);font-size:1rem;margin-bottom:.9rem}
.head b{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.9rem,4.4vw,3.4rem);line-height:1.08;text-wrap:balance;max-width:24ch;margin-inline:auto}
.head nav{display:flex;justify-content:center;flex-wrap:wrap;gap:.4rem 2.25rem;margin-top:1.75rem;padding-block:.8rem;border-top:1px solid var(--hair);border-bottom:1px solid var(--hair);font-size:.98rem}
.head nav a{text-decoration:none}.head nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.hero{padding-block:clamp(3rem,7vw,5.5rem) var(--sec)}
.hero h1{font-size:clamp(2.3rem,5.2vw,4.25rem);line-height:1.08;max-width:20ch;margin:2rem auto 1.5rem}
.hero p.sub{font-size:clamp(1.1rem,1.6vw,1.3rem);color:var(--quiet);max-width:44ch;margin:0 auto 2.25rem}
.btn{display:inline-block;padding:.85rem 1.75rem;border-radius:var(--button-radius);border:1px solid var(--acc);background:var(--acc);color:var(--on-acc);font-weight:600;text-decoration:none;box-shadow:inset 0 0 0 3px var(--acc),inset 0 0 0 4px color-mix(in oklab,var(--on-acc) 55%,var(--acc))}
.plate{padding:clamp(.4rem,1vw,.7rem);border:1px solid var(--hair);background:color-mix(in oklab,var(--paper) 70%,#fff)}
.plate img{width:100%;height:auto;object-fit:cover;border-radius:calc(var(--radius) * .25)}
.lead{max-width:56rem;margin-inline:auto;margin-top:var(--sec)}
.lead img{aspect-ratio:3/2}
.hero:has(.lead ${ART}) .lead{display:none}
.sec{padding-block:var(--sec)}
.sec>.w>.orn:first-child{margin-bottom:var(--sec)}
.about p{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.3rem,2.2vw,1.75rem);line-height:1.5;max-width:38ch;margin-inline:auto}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(1rem,3vw,2.5rem);max-width:56rem;margin-inline:auto}
.pair img{aspect-ratio:4/5}
h2.t{font-size:clamp(1.9rem,3.6vw,2.9rem);line-height:1.1;margin-bottom:clamp(2rem,4vw,3rem)}
.menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:0;max-width:52rem;margin-inline:auto}
.menu li{padding:1.3rem clamp(1rem,3vw,2.25rem);border-top:1px solid var(--hair)}
.menu li:nth-child(odd){border-inline-end:1px solid var(--hair)}
.menu li:only-child{grid-column:1/-1;border-inline-end:0}
.menu h3{font-size:1.3rem;line-height:1.3}
.menu p{color:var(--quiet);font-style:italic;font-size:.98rem;margin-top:.2rem}
.menu .pr{display:block;margin-top:.45rem;color:var(--acc);font-variant-numeric:tabular-nums lining-nums;font-family:var(--font-heading);font-size:1.15rem}
.trio{display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:2.5rem clamp(1.5rem,4vw,3.5rem);max-width:60rem;margin-inline:auto}
.trio li::before{content:"";display:block;width:7px;height:7px;margin:0 auto 1.1rem;transform:rotate(45deg);border:1px solid var(--acc)}
.trio.num li::before{display:none}
.trio .n{display:block;font-family:var(--font-heading);color:var(--acc);font-size:1.6rem;line-height:1;margin-bottom:.8rem;letter-spacing:.06em}
.trio h3{font-size:1.25rem;line-height:1.3;margin-bottom:.45rem}
.trio p{color:var(--quiet);max-width:32ch;margin-inline:auto}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.7rem,3.6vw,2.8rem);line-height:1.25;max-width:26ch;margin:clamp(2rem,4vw,3rem) auto;text-wrap:balance}
.qa{max-width:42rem;margin-inline:auto}
.qa div{padding-block:1.25rem;border-top:1px solid var(--hair)}
.qa div:last-child{border-bottom:1px solid var(--hair)}
.qa h3{font-size:1.2rem;line-height:1.35;margin-bottom:.35rem}.qa p{color:var(--quiet)}
.end{background:var(--acc);color:var(--on-acc);--paper:var(--acc);--hair:color-mix(in oklab,var(--on-acc) 35%,var(--acc));--quiet:color-mix(in oklab,var(--on-acc) 80%,var(--acc))}
.end .in{margin:6px;border:1px solid var(--hair);padding-block:var(--sec) 0}
.end .orn::before{border-color:var(--on-acc)}.end .orn::after{border-color:var(--on-acc)}
.end h2{font-size:clamp(2.1rem,4.6vw,3.6rem);line-height:1.08;max-width:20ch;margin:2rem auto 1rem}
.end p.sub{color:var(--quiet);max-width:40ch;margin:0 auto 2rem;font-size:1.12rem}
.end .btn{background:var(--on-acc);color:var(--acc);border-color:var(--on-acc);box-shadow:inset 0 0 0 3px var(--on-acc),inset 0 0 0 4px color-mix(in oklab,var(--acc) 55%,var(--on-acc))}
.end dl{display:flex;flex-wrap:wrap;justify-content:center;gap:1.75rem 0;margin:clamp(2.5rem,5vw,3.5rem) auto 0;max-width:60rem}
.end dl>div{flex:1 1 auto;min-width:10rem;max-width:20rem;padding-inline:1.5rem}
.end dl>div+div{border-inline-start:1px solid var(--hair)}
.end dt{font-size:.88rem;color:var(--quiet);margin-bottom:.3rem}.end dd{overflow-wrap:break-word}
.end dd a{text-decoration:none}
.foot{margin-top:var(--sec);padding-block:1.5rem;border-top:1px solid var(--hair);font-size:.9rem;color:var(--quiet);display:flex;flex-direction:column;gap:.2rem;align-items:center}
.foot span:first-child{font-family:var(--font-heading);color:var(--on-acc);font-size:1rem}
@media (max-width:760px){.head nav{display:none}.menu{grid-template-columns:minmax(0,1fr)}.menu li:nth-child(odd){border-inline-end:0}.pair{grid-template-columns:minmax(0,1fr)}.pair figure{max-width:22rem;margin-inline:auto;width:100%}.end dl{display:grid;grid-template-columns:minmax(0,1fr);gap:1.25rem}.end dl>div{max-width:none}.end dl>div+div{border-inline-start:0;border-top:1px solid var(--hair);padding-top:1.25rem}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say c">
        <div className="w">
          <span className="orn" aria-hidden="true" />
          <p>{c.statement}</p>
          <span className="orn" aria-hidden="true" />
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec c" id="questions">
        <div className="w">
          <h2 className="t">Questions</h2>
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
          <figure className="plate">
            <Pic photo={c.photos.d2} />
          </figure>
          <figure className="plate">
            <Pic photo={c.photos.cta} />
          </figure>
        </div>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  const steps = x === 'steps'
  return (
    <section className="sec c">
      <div className="w">
        <h2 className="t">{l.title}</h2>
        <ol className={`trio${steps ? ' num' : ''}`}>
          {l.items.map((it, i) => (
            <li key={it.title}>
              {steps && <span className="n">{ROMAN[i] ?? i + 1}</span>}
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
  return (
    <div className="frame">
      <div className="w head c">
        <p className="tag">{c.tagline}</p>
        <b>{c.name}</b>
        <nav>
          <NavLinks links={links(c, extras)} />
        </nav>
      </div>
      <header className="w hero c">
        <h1>{c.headline}</h1>
        <p className="sub">{c.subhead}</p>
        <a className="btn" href="#visit">
          {c.cta.label}
        </a>
        <figure className="plate lead">
          <Pic photo={c.photos.hero} eager />
        </figure>
      </header>
      <main>
        <section className="sec about c">
          <div className="w">
            <span className="orn" aria-hidden="true" />
            <p>{c.about}</p>
          </div>
        </section>
        <section className="sec">
          <div className="w pair">
            <figure className="plate">
              <Pic photo={c.photos.about} />
            </figure>
            <figure className="plate">
              <Pic photo={c.photos.d1} />
            </figure>
          </div>
        </section>
        <section className="sec c" id="offer">
          <div className="w">
            <span className="orn" aria-hidden="true" />
            <h2 className="t">{c.offerTitle}</h2>
            <ul className="menu">
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
      <footer className="end c" id="visit">
        <div className="in">
          <div className="w">
            <span className="orn" aria-hidden="true" />
            <h2>{c.cta.headline}</h2>
            <p className="sub">{c.cta.subhead}</p>
            {reach && (
              <a className="btn" href={reach.href}>
                {c.cta.label}
              </a>
            )}
            {hasVisit(c) && (
              <dl>
                <FactRows facts={f} />
              </dl>
            )}
          </div>
          <div className="foot">
            <span>{c.name}</span>
            <span>{c.tagline}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const heritage: Template = {
  id: 'heritage',
  label: 'Heritage',
  text: 'A traditional page inside a fine double frame on warm paper: everything centred, the name set large over a ruled line of links, sections divided by a hairline broken by a small diamond, photos in thin frames like old prints and steps in Roman numerals; established, courteous and dependable, for pubs, hotels, funeral directors and old family firms.',
  dark: false,
  css: CSS,
  Page,
}
