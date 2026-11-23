// Hub: the first screen is a front door. On a soft ground of the business's colour stand the name,
// set large, the promise, and a short stack of big rounded buttons: one to get in touch, one to
// each part of the page (the offer, questions when there are any, how to visit), each carrying a
// line of its own content. Below, the page continues as one column of white panels on the same
// ground, one panel per part, the closing in the business's colour. A real hero photo sits above
// the name in a circle; drawn art is left out. For cafés, florists, barbers.

import { Fragment } from 'react'
import {
  type Extra,
  FaqDetails,
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

const ART = 'img[data-art],img[src^="data:image/svg"]'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--ground:color-mix(in oklab,var(--band) 11%,#f6f5f1);--card:#fff;--ink:color-mix(in oklab,var(--band) 22%,#151515);--quiet:color-mix(in oklab,var(--ink) 63%,#fff);--line:color-mix(in oklab,var(--band) 15%,#e6e4de);--edge:color-mix(in oklab,var(--band) 26%,#fff);--col:44rem;--gut:clamp(1rem,4vw,2rem);--pad:clamp(1.5rem,5vw,3rem);--r:calc(var(--radius) * 1.6)}
body{background:var(--ground);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.door{min-height:min(100svh,62rem);display:grid;place-items:center;padding:clamp(2.5rem,7vw,5rem) var(--gut)}
.door>div{width:min(100%,33rem);text-align:center}
.av{margin-bottom:clamp(1.25rem,3vw,1.75rem)}
.av img{width:clamp(6.5rem,15vw,8.5rem);height:auto;aspect-ratio:1;object-fit:cover;border-radius:50%;margin-inline:auto;box-shadow:0 0 0 5px var(--card)}
.av:has(${ART}){display:none}
.name{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(2.3rem,6.5vw,3.9rem);line-height:1.02;text-wrap:balance;overflow-wrap:break-word;margin-bottom:.9rem}
.tag{color:var(--quiet);margin-bottom:clamp(1.5rem,4vw,2.25rem)}
.door h1{font-size:clamp(1.3rem,2.4vw,1.6rem);line-height:1.3;margin-inline:auto;max-width:26ch;margin-bottom:.6rem}
.door .sub{color:var(--quiet);max-width:36ch;margin-inline:auto}
.doors{display:grid;gap:.75rem;margin-top:clamp(1.75rem,4.5vw,2.5rem)}
.doors a{display:grid;gap:.2rem;justify-items:center;padding:1.2rem 1.5rem;border-radius:var(--button-radius);background:var(--card);border:1.5px solid var(--edge);text-decoration:none;transition:border-color .15s,transform .15s}
.doors a:hover{border-color:var(--acc)}
.doors a:active{transform:scale(.99)}
.doors b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.2rem,2.4vw,1.45rem);line-height:1.25;text-wrap:balance}
.doors small{font-size:.93rem;color:var(--quiet);line-height:1.4;max-width:34ch;text-wrap:balance;overflow-wrap:anywhere}
.doors a.main{background:var(--acc);border-color:var(--acc);color:var(--on-acc)}
.doors a.main small{color:color-mix(in oklab,var(--on-acc) 82%,var(--acc))}
.doors a.main:hover{filter:brightness(1.08)}
main,.end,.foot{max-width:var(--col);margin-inline:auto;padding-inline:var(--gut)}
main{display:grid;gap:clamp(.75rem,2vw,1rem)}
.pn{background:var(--card);border-radius:var(--r);padding:var(--pad);overflow:hidden}
.pn h2{font-size:clamp(1.6rem,4vw,2.15rem);line-height:1.12;margin-bottom:clamp(1.25rem,3vw,1.75rem)}
.about{padding:0}
.about figure img{width:100%;aspect-ratio:16/9;object-fit:cover}
.about figure:has(${ART}){display:none}
.about p{padding:var(--pad);font-size:clamp(1.15rem,2.2vw,1.35rem);line-height:1.55}
.menu li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.15rem 1.5rem;align-items:baseline;padding-block:1rem;border-top:1px solid var(--line)}
.menu li:first-child{border-top:0;padding-top:0}
.menu li:last-child{padding-bottom:0}
.menu h3{font-size:1.18rem;line-height:1.3}
.menu .pr{font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
.menu p{grid-column:1/-1;color:var(--quiet);font-size:.98rem;max-width:52ch}
.say{background:var(--acc);color:var(--on-acc)}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.5rem,4vw,2.2rem);line-height:1.22;text-wrap:balance}
.list li+li{margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid var(--line)}
.list h3{font-size:1.15rem;line-height:1.3;margin-bottom:.25rem}
.list p{color:var(--quiet)}
.steps li{display:grid;grid-template-columns:2.4rem minmax(0,1fr);gap:.75rem}
.steps .n{display:grid;place-items:center;width:2.2rem;height:2.2rem;border-radius:50%;background:var(--acc);color:var(--on-acc);font-weight:700;font-size:.95rem;font-variant-numeric:tabular-nums}
.faq details{border-top:1px solid var(--line);padding-block:1rem}
.faq details:first-of-type{border-top:0;padding-top:0}
.faq details:last-child{padding-bottom:0}
.faq summary{display:flex;justify-content:space-between;gap:1rem;font-weight:600;font-size:1.08rem}
.faq summary::after{content:"+";color:var(--quiet);font-weight:400}
.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.5rem;max-width:58ch}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(.75rem,2vw,1rem)}
.pair img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--r)}
.end{margin-top:clamp(.75rem,2vw,1rem)}
.end>div{background:var(--acc);color:var(--on-acc);border-radius:var(--r);padding:var(--pad);text-align:center;--l:color-mix(in oklab,var(--on-acc) 30%,var(--acc))}
.end h2{font-size:clamp(1.9rem,5vw,2.75rem);line-height:1.08;margin-bottom:.75rem}
.end .sub{color:color-mix(in oklab,var(--on-acc) 82%,var(--acc));max-width:38ch;margin-inline:auto;margin-bottom:1.5rem}
.btn{display:inline-block;padding:1rem 1.7rem;border-radius:var(--button-radius);background:var(--on-acc);color:var(--acc);font-weight:600;text-decoration:none}
.end dl{display:grid;gap:0;margin-top:1.75rem;text-align:start}
.end dl div{display:grid;grid-template-columns:6rem minmax(0,1fr);gap:1rem;padding-block:.85rem;border-top:1px solid var(--l)}
.end dt{color:color-mix(in oklab,var(--on-acc) 78%,var(--acc))}
.end dd{overflow-wrap:anywhere}.end .hl{display:block}
.end dd a{text-decoration:none;border-bottom:1px solid currentColor}
.foot{display:flex;justify-content:center;flex-wrap:wrap;gap:.25rem 1.5rem;padding-block:1.75rem 2.5rem;font-size:.9rem;color:var(--quiet);text-align:center}
@media (max-width:520px){.end dl div{grid-template-columns:minmax(0,1fr);gap:.1rem}.door{min-height:0}}`

type C = TemplateProps['c']

/** One line of the page's own content under each button, so a visitor knows what is behind it. */
function hint(c: C, href: string): string {
  if (href === '#offer')
    return offerItems(c)
      .slice(0, 3)
      .map((it) => it.name)
      .join(', ')
  if (href === '#visit') return c.address.join(', ') || c.cta.headline
  return ''
}

function Extras({ c, x }: { c: C; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="pn say">
        <p>{c.statement}</p>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="pn faq" id="questions">
        <h2>Questions</h2>
        <FaqDetails faq={c.faq} />
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="pair">
        <figure>
          <Pic photo={c.photos.d1} />
        </figure>
        <figure>
          <Pic photo={c.photos.d2} />
        </figure>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="pn">
      <h2>{l.title}</h2>
      <ol className={x === 'steps' ? 'list steps' : 'list'}>
        {l.items.map((it, i) => (
          <li key={it.title}>
            {x === 'steps' && <span className="n">{i + 1}</span>}
            <div>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </div>
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
  const ls = links(c, extras)
  return (
    <>
      <header className="door">
        <div>
          <figure className="av">
            <Pic photo={c.photos.hero} eager />
          </figure>
          <p className="name">{c.name}</p>
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <nav className="doors">
            {reach && (
              <a className="main" href={reach.href}>
                <b>{c.cta.label}</b>
                <small>{reach.value}</small>
              </a>
            )}
            {ls.map((l) => {
              const h = hint(c, l.href)
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className={!reach && l.href === '#visit' ? 'main' : undefined}
                >
                  <b>{l.label}</b>
                  {h && <small>{h}</small>}
                </a>
              )
            })}
          </nav>
        </div>
      </header>
      <main>
        <section className="pn about">
          <figure>
            <Pic photo={c.photos.about} />
          </figure>
          <p>{c.about}</p>
        </section>
        {offer.length > 0 && (
          <section className="pn" id="offer">
            <h2>{c.offerTitle}</h2>
            <ul className="menu">
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
      <footer>
        <div className="end" id="visit">
          <div>
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
                    <dd>
                      {x.label === 'Hours' ? (
                        c.hours.map((h) => (
                          <span className="hl" key={`${h.days}${h.time}`}>
                            {[h.days, h.time].filter(Boolean).join(' ')}
                          </span>
                        ))
                      ) : x.href ? (
                        <a href={x.href}>{x.value}</a>
                      ) : (
                        x.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
        <div className="foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const hub: Template = {
  id: 'hub',
  label: 'Hub',
  text: "Opens like a front door: on a soft ground of the business's own colour, the name set large over a short stack of big rounded buttons, one to get in touch and one to each part of the page, each with a line of what is behind it; below, the page follows as one column of white panels: friendly, simple and quick to use on a phone, for cafés, florists, barbers and small shops.",
  dark: false,
  css: CSS,
  Page,
}
