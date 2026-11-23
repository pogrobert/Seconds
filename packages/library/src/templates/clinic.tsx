// Clinic: soft, rounded and reassuring. A white page with generous space; the opening pairs the
// promise and two plain ways in (book, or the phone number itself) with a large rounded photo, and
// a white facts card with the hours sits over its lower corner like an appointment card. Services
// are one soft panel of rows with prices in pills; the close is a rounded panel in the practice's
// colour. Some photos. For dentists, physios, vets, opticians, therapists.

import { Fragment } from 'react'
import type { Photo } from '../ui.tsx'
import {
  type Extra,
  FactRows,
  FaqDetails,
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

const isArt = (p: Photo) => p.src.startsWith('data:image/svg')
const R = 'calc(var(--radius) * 2.5)'

const CSS = `${RESET}
img{height:auto}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:#fff;--mist:color-mix(in oklab,var(--band) 6%,#fff);--soft:color-mix(in oklab,var(--band) 12%,#fff);--line:color-mix(in oklab,var(--band) 14%,#ececec);--ink:color-mix(in oklab,var(--band) 25%,#1a1d21);--quiet:color-mix(in oklab,var(--ink) 66%,#fff);--w:72rem;--gut:clamp(1.25rem,4vw,2.5rem);--sec:clamp(4rem,8vw,6.5rem);--r:${R}}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.65}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:1.5rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.25rem;letter-spacing:var(--heading-tracking);line-height:1.25}
.top nav{display:flex;gap:.5rem;align-items:center;font-size:.95rem}
.top nav a{text-decoration:none;padding:.5rem .9rem;border-radius:var(--button-radius)}
.top nav a:hover{background:var(--mist)}
.top nav a:last-child{background:var(--soft);font-weight:600}
.hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(2rem,6vw,5rem);align-items:center;padding-block:clamp(2rem,5vw,4rem) var(--sec)}
.hero.solo{grid-template-columns:minmax(0,1fr)}
.hero .tag{display:inline-block;background:var(--mist);color:color-mix(in oklab,var(--band) 80%,#000);padding:.4rem .9rem;border-radius:var(--button-radius);font-size:.95rem;font-weight:600;margin-bottom:1.5rem}
.hero h1{font-size:clamp(2.4rem,5vw,4.1rem);line-height:1.08;margin-bottom:1.25rem}
.hero p.sub{font-size:clamp(1.1rem,1.5vw,1.25rem);color:var(--quiet);max-width:38ch;margin-bottom:2rem}
.acts{display:flex;gap:.75rem;flex-wrap:wrap;align-items:center}
.btn{display:inline-block;padding:.95rem 1.6rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:600;text-decoration:none;line-height:1.3}
.btn.ghost{background:var(--mist);color:var(--ink)}
.btn:hover{filter:brightness(1.06)}
.visual{position:relative;padding-bottom:3rem}
.visual img{width:100%;aspect-ratio:5/6;object-fit:cover;border-radius:var(--r)}
.fc{position:absolute;inset-inline-start:-2rem;bottom:0;width:min(20rem,85%);background:var(--paper);border-radius:calc(var(--radius) * 1.5);padding:1.25rem 1.4rem;box-shadow:0 1px 2px rgb(0 0 0 / .06),0 12px 32px -8px color-mix(in oklab,var(--band) 30%,transparent);display:grid;gap:.75rem}
.fc dt{font-size:.85rem;color:var(--quiet)}
.fc dd{font-weight:600;line-height:1.4;overflow-wrap:anywhere}
.fc dd a{text-decoration:none}
.hours li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.1rem 1rem}.hours li+li{margin-top:.2rem}
.hours span:last-child{font-variant-numeric:tabular-nums;white-space:nowrap}
.sec{padding-block:var(--sec)}
.about{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:clamp(2rem,6vw,5rem);align-items:center}
.about.solo{grid-template-columns:minmax(0,1fr);max-width:48rem}
.about img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:50% 50% var(--r) var(--r)}
.about p{font-size:clamp(1.3rem,2vw,1.6rem);line-height:1.5}
.mist{background:var(--mist)}
.head{max-width:40rem;margin-bottom:clamp(2rem,4vw,3rem)}
.head h2,.end h2{font-size:clamp(1.9rem,3.6vw,2.75rem);line-height:1.12}
.menu{background:var(--paper);border-radius:var(--r);padding:clamp(.5rem,2vw,1.5rem) clamp(1.25rem,3vw,2.5rem);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(2rem,5vw,4rem)}
.menu li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.2rem 1rem;align-items:baseline;padding-block:1.25rem;border-top:1px solid var(--line)}
.menu li:nth-child(-n+2){border-top:0}
.menu h3{font-family:var(--font-body);font-size:1.1rem;font-weight:600;letter-spacing:0;text-transform:none;line-height:1.35}
.menu p{grid-column:1/-1;color:var(--quiet);font-size:.98rem}
.pill{background:var(--mist);color:var(--ink);padding:.2rem .75rem;border-radius:var(--button-radius);font-weight:600;font-size:.95rem;font-variant-numeric:tabular-nums;white-space:nowrap}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:clamp(1.5rem,3vw,2.5rem)}
.cols li{border-top:2px solid var(--soft);padding-top:1.25rem}
.cols h3{font-size:1.25rem;line-height:1.3;margin-bottom:.4rem}
.cols p{color:var(--quiet)}
.n{display:grid;place-items:center;width:2.6rem;height:2.6rem;border-radius:50%;background:var(--soft);color:color-mix(in oklab,var(--band) 85%,#000);font-weight:700;margin-bottom:1rem;font-variant-numeric:tabular-nums}
.steps li{border-top:0;padding-top:0}
.say p{font-family:var(--font-heading);font-size:clamp(1.7rem,3.4vw,2.6rem);line-height:1.25;letter-spacing:var(--heading-tracking);text-align:center;max-width:30ch;margin-inline:auto;text-wrap:balance}
.faq{display:grid;gap:.75rem;max-width:48rem}
.faq details{background:var(--mist);border-radius:calc(var(--radius) * 1.5);padding:1.1rem 1.4rem}
.faq summary{display:flex;justify-content:space-between;gap:1rem;font-weight:600;font-size:1.1rem}
.faq summary::after{content:"+";font-size:1.4rem;line-height:1;color:color-mix(in oklab,var(--band) 85%,#000)}
.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.6rem;max-width:62ch}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(1rem,2.5vw,1.75rem)}
.pair img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--r)}
.end{background:var(--acc);color:var(--on-acc);border-radius:var(--r);padding:clamp(2rem,5vw,4rem);display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(2rem,5vw,4rem);align-items:center}
.end.solo{grid-template-columns:minmax(0,1fr)}
.end p.sub{opacity:.9;font-size:1.15rem;margin-block:1rem 2rem;max-width:36ch}
.end .btn{background:var(--on-acc);color:var(--acc)}
.end dl{background:var(--paper);color:var(--ink);border-radius:calc(var(--radius) * 1.5);padding:1.5rem;display:grid;gap:1rem}
.end dt{font-size:.85rem;color:var(--quiet)}
.end dd{font-weight:600;overflow-wrap:anywhere}
.end dd a{text-decoration:none;border-bottom:1px solid var(--line)}
.end{margin-top:clamp(2.5rem,5vw,4rem)}
.foot{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:2rem 2.5rem;font-size:.92rem;color:var(--quiet)}
@media (max-width:860px){.hero,.about,.end{grid-template-columns:minmax(0,1fr)}.top nav a:not(:last-child){display:none}.visual{padding-bottom:0}.fc{position:relative;inset:auto;width:auto;margin:-3rem 1rem 0}.visual img{aspect-ratio:4/3}.about img{max-width:20rem}.menu{grid-template-columns:minmax(0,1fr)}.menu li:nth-child(2){border-top:1px solid var(--line)}}
/* Questions beside their heading on wide screens: a heading over a narrow list left the right half empty. */
@media (min-width:861px){#questions>.w{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);column-gap:clamp(2rem,5vw,5rem);align-items:start}#questions>.w>h2,#questions>.w>.head{margin:0}#questions .faq{max-width:none}}`

function Card({ c }: { c: TemplateProps['c'] }) {
  const f = facts(c)
  if (!f.length) return null
  return (
    <dl className="fc">
      {c.hours.length > 0 && (
        <div>
          <dt>Hours</dt>
          <dd>
            <ul className="hours">
              {c.hours.map((h) => (
                <li key={h.days}>
                  <span>{h.days}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      )}
      {f
        .filter((x) => x.label === 'Phone' || (x.label === 'Address' && !c.hours.length))
        .map((x) => (
          <div key={x.label}>
            <dt>{x.label}</dt>
            <dd>{x.href ? <a href={x.href}>{x.value}</a> : x.value}</dd>
          </div>
        ))}
    </dl>
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
          <div className="head">
            <h2>Questions</h2>
          </div>
          <div className="faq">
            <FaqDetails faq={c.faq} />
          </div>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="w pair">
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
        <div className="head">
          <h2>{l.title}</h2>
        </div>
        <ol className={x === 'steps' ? 'cols steps' : 'cols'}>
          <ListItems items={l.items} numbered={x === 'steps'} />
        </ol>
      </div>
    </section>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const phone = f.find((x) => x.label === 'Phone')
  const call = reachOf(f)
  const aboutPhoto = !isArt(c.photos.about)
  return (
    <>
      <div className="w top">
        <b>{c.name}</b>
        <nav>
          <NavLinks links={links(c, extras)} />
        </nav>
      </div>
      <header className="w hero">
        <div>
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <div className="acts">
            <a className="btn" href="#visit">
              {c.cta.label}
            </a>
            {phone && (
              <a className="btn ghost" href={phone.href}>
                {phone.value}
              </a>
            )}
          </div>
        </div>
        <div className="visual">
          <Pic photo={c.photos.hero} eager />
          <Card c={c} />
        </div>
      </header>
      <main>
        <section className="sec mist">
          <div className={aboutPhoto ? 'w about' : 'w about solo'}>
            {aboutPhoto && (
              <figure>
                <Pic photo={c.photos.about} />
              </figure>
            )}
            <p>{c.about}</p>
          </div>
        </section>
        {offerItems(c).length > 0 && (
          <section className="sec mist" id="offer" style={{ paddingTop: 0 }}>
            <div className="w">
              <div className="head">
                <h2>{c.offerTitle}</h2>
              </div>
              <ul className="menu">
                {offerItems(c).map((it) => (
                  <li key={it.name}>
                    <h3>{it.name}</h3>
                    {it.price ? <span className="pill">{it.price}</span> : <span />}
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
      <footer id="visit" className="w">
        <div className={hasVisit(c) ? 'end' : 'end solo'}>
          <div>
            <h2>{c.cta.headline}</h2>
            <p className="sub">{c.cta.subhead}</p>
            {call && (
              <a className="btn" href={call.href}>
                {c.cta.label}
              </a>
            )}
          </div>
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
      </footer>
    </>
  )
}

export const clinic: Template = {
  id: 'clinic',
  label: 'Clinic',
  text: 'Soft, rounded and reassuring: lots of white, the promise beside a large rounded photo with a card of opening hours over its corner, a clear button to book and the phone number beside it, services in one gentle panel with prices: calm and caring, for dentists, physios, vets, opticians and therapists.',
  dark: false,
  css: CSS,
  Page,
}
