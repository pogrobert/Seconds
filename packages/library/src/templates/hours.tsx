// Hours first: the page opens with the facts a visitor came for. The opening hours are set large
// on a sign in the business's colour, like the painted board on a shop door, with the phone,
// address and email beside it in an outlined panel; the headline follows. The rest of the page
// reads the same way as the sign: a name on the left, a value on the right, on a fine rule.
// With no facts, the opening falls back to a very large headline. For cafés, trades, clinics,
// councils.

import { Fragment } from 'react'
import {
  type Extra,
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

const ART = 'img[data-art],img[src^="data:image/svg"]'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 3%,#fcfcfa);--ink:color-mix(in oklab,var(--band) 20%,#141414);--quiet:color-mix(in oklab,var(--ink) 62%,var(--paper));--line:color-mix(in oklab,var(--band) 16%,#dcdad4);--w:76rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(3.5rem,7vw,6rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.55}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:1.3rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.15rem,1.8vw,1.4rem);line-height:1.2}
.top nav{display:flex;gap:1.6rem;font-size:.97rem;flex-shrink:0}.top nav a{text-decoration:none}.top nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.door{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(.75rem,1.6vw,1.25rem);padding-top:clamp(.5rem,2vw,1.5rem)}
.door.one{grid-template-columns:minmax(0,1fr)}
.sign{background:var(--acc);color:var(--on-acc);border-radius:var(--radius);padding:clamp(1.5rem,4vw,3.25rem);--rl:color-mix(in oklab,var(--on-acc) 32%,var(--acc))}
.lab{font-size:.95rem;margin-bottom:clamp(.75rem,2vw,1.25rem)}
.sign .lab{color:color-mix(in oklab,var(--on-acc) 82%,var(--acc))}
.hrs>div{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:.15rem 2rem;padding-block:clamp(.6rem,1.4vw,.95rem);border-top:1px solid var(--rl)}
.hrs>div:last-child{border-bottom:1px solid var(--rl)}
.hrs dt{font-size:clamp(1.02rem,1.5vw,1.2rem);min-width:0}
.hrs dd{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.65rem,3.7vw,3.1rem);line-height:1.08;font-variant-numeric:lining-nums;margin-inline-start:auto;text-align:end}
.sign .call{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(2rem,6vw,4.5rem);line-height:1.05;text-decoration:none;overflow-wrap:anywhere;display:block}
.side{border:2px solid var(--acc);border-radius:var(--radius);padding:clamp(1.5rem,3.5vw,2.75rem);display:grid;align-content:start;gap:clamp(1.25rem,2.6vw,2rem)}
.side dd{overflow-wrap:anywhere}
.side .lab{margin-bottom:.3rem;color:var(--quiet)}
.side dd a{text-decoration:none}
.side .big dd{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.6rem,3vw,2.5rem);line-height:1.1;font-variant-numeric:tabular-nums}
.side .mid dd{font-size:clamp(1.12rem,1.6vw,1.3rem);line-height:1.4}
.side .big dd a{border-bottom:3px solid var(--acc)}
.lead{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(2rem,5vw,4.5rem);align-items:end;padding-block:clamp(2.5rem,6vw,4.5rem) var(--sec)}
.lead .tag{color:var(--quiet);margin-bottom:.8rem}
.lead h1{font-size:clamp(2.1rem,4.6vw,3.75rem);line-height:1.04;max-width:20ch;margin-bottom:1.1rem}
.lead .sub{font-size:clamp(1.08rem,1.5vw,1.25rem);color:var(--quiet);max-width:44ch;margin-bottom:1.75rem}
.lead figure img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius)}
.lead:has(figure :is(${ART})){grid-template-columns:minmax(0,1fr)}
.lead figure:has(${ART}){display:none}
.plain .lead{padding-top:clamp(3.5rem,10vw,8rem)}
.plain .lead h1{font-size:clamp(2.8rem,8vw,6.75rem);line-height:.98;max-width:15ch;margin-bottom:1.5rem}
.plain .lead .sub{font-size:clamp(1.15rem,1.8vw,1.4rem)}
.btn{display:inline-block;padding:.95rem 1.6rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:600;text-decoration:none;line-height:1.3}
.btn:hover{filter:brightness(1.08)}
.sec{padding-block:var(--sec);border-top:1px solid var(--line)}
.sec h2{font-size:clamp(1.85rem,3.6vw,2.9rem);line-height:1.06;max-width:22ch;margin-bottom:clamp(1.75rem,3.5vw,2.75rem)}
.rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(2rem,5vw,4.5rem)}
.rows li{padding-block:1.05rem;border-top:1px solid var(--line)}
.ln{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:.2rem 1.5rem}
.ln h3{font-size:clamp(1.15rem,1.7vw,1.35rem);line-height:1.25;min-width:0}
.ln .pr{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.15rem,1.7vw,1.35rem);font-variant-numeric:tabular-nums lining-nums;white-space:nowrap;margin-inline-start:auto}
.rows p{color:var(--quiet);margin-top:.25rem;max-width:52ch}
.about{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2rem,5vw,4.5rem);align-items:center}
.about p{font-size:clamp(1.2rem,2vw,1.55rem);line-height:1.5;max-width:40ch}
.about img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius)}
.about:has(figure :is(${ART})){grid-template-columns:minmax(0,1fr)}
.about figure:has(${ART}){display:none}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.7rem,3.6vw,2.9rem);line-height:1.15;max-width:28ch}
.list{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:1.75rem clamp(2rem,4vw,3.5rem)}
.list li{border-top:1px solid var(--line);padding-top:1.05rem}
.list h3{font-size:1.2rem;line-height:1.3;margin-bottom:.4rem}
.list p{color:var(--quiet)}
.list .n{display:block;font-family:var(--font-heading);font-size:2.2rem;line-height:1;margin-bottom:.6rem;color:var(--acc);font-variant-numeric:tabular-nums}
.qa>div{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:.4rem clamp(2rem,5vw,4.5rem);padding-block:1.15rem;border-top:1px solid var(--line)}
.qa h3{font-size:1.2rem;line-height:1.3}.qa p{color:var(--quiet);max-width:58ch}
.three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(.75rem,1.5vw,1.25rem)}
.three img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius)}
.end{background:var(--ink);color:#fff;--line:color-mix(in oklab,#fff 20%,var(--ink));--quiet:color-mix(in oklab,#fff 72%,var(--ink))}
.end .in{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:clamp(2rem,5vw,4.5rem);padding-block:var(--sec)}
.end h2{font-size:clamp(2.1rem,4.6vw,3.75rem);line-height:1.04;margin-bottom:1rem;max-width:18ch}
.end .sub{color:var(--quiet);max-width:40ch;margin-bottom:1.75rem;font-size:1.12rem}
.end dl>div{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.2rem 2rem;padding-block:.85rem;border-top:1px solid var(--line)}
.end dl>div:last-child{border-bottom:1px solid var(--line)}
.end dt{color:var(--quiet)}
.end dd{text-align:end;margin-inline-start:auto;overflow-wrap:anywhere;min-width:0}
.end .hl{display:block}
.end dd a{text-decoration:none;border-bottom:1px solid currentColor}
.end .btn{background:#fff;color:var(--ink)}
.foot{display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem 1.5rem;padding-block:1.5rem 1.9rem;border-top:1px solid var(--line);font-size:.9rem;color:var(--quiet)}
@media (max-width:860px){.top nav{display:none}.door,.lead,.about,.end .in,.qa>div{grid-template-columns:minmax(0,1fr)}.rows{grid-template-columns:minmax(0,1fr)}.lead{align-items:start}.three{grid-template-columns:repeat(2,minmax(0,1fr))}.three figure:first-child{grid-column:1/-1}.three figure:first-child img{aspect-ratio:3/2}}`

type Fact = ReturnType<typeof facts>[number]

function Value({ x }: { x: Fact }) {
  return x.href ? <a href={x.href}>{x.value}</a> : x.value
}

/** The opening: the hours on the sign, the other facts beside it. */
function Door({ c }: { c: TemplateProps['c'] }) {
  const f = facts(c).filter((x) => x.label !== 'Hours')
  const rows = c.hours.filter((h) => h.days || h.time)
  // The sign carries the hours; without hours it carries the first way to get in touch.
  const onSign = rows.length ? null : (reachOf(f) ?? f[0])
  // Beside the sign, the quickest way to get in touch leads, set large; then the rest.
  const lead = f.find((x) => x.href && x.label !== 'Address' && x !== onSign)
  const rest = [...(lead ? [lead] : []), ...f.filter((x) => x !== onSign && x !== lead)]
  return (
    <div className={`w door${rest.length ? '' : ' one'}`}>
      <div className="sign">
        {onSign ? (
          <>
            <p className="lab">{onSign.label}</p>
            {onSign.href ? (
              <a className="call" href={onSign.href}>
                {onSign.value}
              </a>
            ) : (
              <p className="call">{onSign.value}</p>
            )}
          </>
        ) : (
          <>
            <p className="lab">Hours</p>
            <dl className="hrs">
              {rows.map((h) => (
                <div key={`${h.days}${h.time}`}>
                  <dt>{h.days}</dt>
                  <dd>{h.time}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
      {rest.length > 0 && (
        <dl className="side">
          {rest.map((x, i) => (
            <div key={x.label} className={x === lead && i === 0 ? 'big' : 'mid'}>
              <dt className="lab">{x.label}</dt>
              <dd>
                <Value x={x} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
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
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="w">
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
        <div className="w three">
          <figure>
            <Pic photo={c.photos.d1} />
          </figure>
          <figure>
            <Pic photo={c.photos.d2} />
          </figure>
          <figure>
            <Pic photo={c.photos.cta} />
          </figure>
        </div>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="sec">
      <div className="w">
        <h2>{l.title}</h2>
        <ol className="list">
          <ListItems items={l.items} numbered={x === 'steps'} />
        </ol>
      </div>
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
      <header className={f.length ? 'open' : 'open plain'}>
        <div className="w top">
          <b>{c.name}</b>
          <nav>
            <NavLinks links={links(c, extras)} />
          </nav>
        </div>
        {f.length > 0 && <Door c={c} />}
        <div className="w lead">
          <div>
            <p className="tag">{c.tagline}</p>
            <h1>{c.headline}</h1>
            <p className="sub">{c.subhead}</p>
            <a className="btn" href={reach?.href ?? '#visit'}>
              {c.cta.label}
            </a>
          </div>
          <figure>
            <Pic photo={c.photos.hero} eager />
          </figure>
        </div>
      </header>
      <main>
        <section className="sec">
          <div className="w about">
            <p>{c.about}</p>
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
          </div>
        </section>
        {offer.length > 0 && (
          <section className="sec" id="offer">
            <div className="w">
              <h2>{c.offerTitle}</h2>
              <ul className="rows">
                {offer.map((it) => (
                  <li key={it.name}>
                    <div className="ln">
                      <h3>{it.name}</h3>
                      {it.price && <span className="pr">{it.price}</span>}
                    </div>
                    {it.detail && <p>{it.detail}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
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
                  <dd>
                    {x.label === 'Hours' ? (
                      c.hours.map((h) => (
                        <span className="hl" key={`${h.days}${h.time}`}>
                          {[h.days, h.time].filter(Boolean).join(' ')}
                        </span>
                      ))
                    ) : (
                      <Value x={x} />
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="w">
          <div className="foot">
            <span>{c.name}</span>
            <span>{c.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export const hours: Template = {
  id: 'hours',
  label: 'Hours first',
  text: "Opens with the facts a visitor came for: the opening hours set large on a sign in the business's own colour, like the board on a shop door, the phone, address and email beside it, then the headline; below, every list reads like the sign, a name on the left and its value on the right: practical, honest and easy to use, for cafés, trades, clinics and councils.",
  dark: false,
  css: CSS,
  Page,
}
