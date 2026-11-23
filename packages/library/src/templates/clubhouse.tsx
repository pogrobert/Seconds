// Clubhouse: a sports or social club. No made-up crest (Robert, 2026-11-23: no fake decorations;
// a club has its own). The opening is striped like a kit shirt in two shades
// of the club's colour. One recurring detail, the hoop: two bars of the colour with a gap, like
// the bands on a sock, under every heading. The offer is a fixture list, each row ending in a
// scoreboard box with its price; steps, how to join, are numbered in small shields. With no
// photos the opening is type only. For football, cricket, running and rowing clubs.

import { Fragment } from 'react'
import type { Photo } from '../ui.tsx'
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

const isArt = (p: Photo) => p.src.startsWith('data:image/svg')

const CSS = `${RESET}
:root{--kit:var(--band);--on-kit:var(--band-foreground);--dk:color-mix(in oklab,var(--band) 78%,#000);--paper:color-mix(in oklab,var(--band) 4%,#f7f7f3);--tint:color-mix(in oklab,var(--band) 9%,#f1f1ec);--ink:color-mix(in oklab,var(--band) 22%,#111);--quiet:color-mix(in oklab,var(--ink) 70%,var(--paper));--line:color-mix(in oklab,var(--band) 18%,#d6d6cf);--w:74rem;--gut:clamp(1.15rem,4vw,2.5rem);--sec:clamp(3.5rem,7vw,6rem);--stripe:clamp(2.5rem,5vw,4.5rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.55}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.kit{background:var(--kit);color:var(--on-kit)}
.crest{--s:3.1rem;position:relative;display:inline-grid;place-items:center;flex:none;width:var(--s);height:calc(var(--s) * 1.18);background:repeating-linear-gradient(90deg,var(--kit) 0 calc(var(--s) / 5),var(--dk) calc(var(--s) / 5) calc(var(--s) * 2 / 5));border-radius:calc(var(--s) * .08) calc(var(--s) * .08) 50% 50% / calc(var(--s) * .08) calc(var(--s) * .08) 62% 62%;box-shadow:0 0 0 calc(var(--s) * .05) var(--on-kit),0 0 0 calc(var(--s) * .1) var(--kit)}
.crest span{display:grid;place-items:center;min-width:72%;height:42%;margin-top:-12%;padding-inline:.1em;background:var(--on-kit);color:var(--kit);font-family:var(--font-heading);font-weight:800;font-size:calc(var(--s) * .3);line-height:1;letter-spacing:.02em}
.crest[data-n="1"] span{font-size:calc(var(--s) * .34);min-width:46%}
.top{display:flex;align-items:center;justify-content:space-between;gap:1rem 2rem;padding-block:1rem}
.top .id{display:flex;align-items:center;gap:1rem;min-width:0}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.2rem;line-height:1.2;max-width:30ch}
.top nav{display:flex;gap:.4rem 1.6rem;flex-wrap:wrap;justify-content:flex-end;font-weight:600;font-size:.98rem}
.top nav a{text-decoration:none;padding-block:.2rem;border-bottom:2px solid transparent}.top nav a:hover{border-color:currentColor}
.hoop{display:block;height:.8rem;border-block:.28rem solid var(--kit);width:5.5rem}
.kit .hoop{border-color:var(--on-kit)}
.band{height:.9rem;background:var(--on-kit);border-block:.3rem solid var(--dk)}
.hero{background:repeating-linear-gradient(90deg,var(--kit) 0 var(--stripe),var(--dk) var(--stripe) calc(var(--stripe) * 2))}
.hero .w{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(2rem,5vw,4.5rem);align-items:center;padding-block:clamp(3rem,7vw,5.5rem)}
.hero .tag{font-weight:600;margin-bottom:1rem;max-width:44ch}
.hero h1{font-size:clamp(2.4rem,5.6vw,4.6rem);line-height:1.02;max-width:17ch;margin-bottom:1.25rem;overflow-wrap:break-word}
.hero p.sub{font-size:clamp(1.12rem,1.6vw,1.3rem);max-width:42ch;margin-bottom:2rem}
.hero.has-pic .w{padding-bottom:clamp(7rem,14vw,11rem)}
.lead{margin-top:clamp(-9rem,-12vw,-5rem)}
.lead img{width:100%;aspect-ratio:21/9;object-fit:cover;border-radius:var(--radius);border-bottom:.6rem solid var(--kit)}
.btn{display:inline-block;padding:.9rem 1.6rem;border-radius:var(--button-radius);font-weight:700;text-decoration:none;font-size:1.05rem;line-height:1.3;background:var(--kit);color:var(--on-kit);border:2px solid var(--kit)}
.btn:hover{background:var(--dk);border-color:var(--dk)}
.kit .btn,.hero .btn{background:var(--on-kit);color:var(--kit);border-color:var(--on-kit)}
.kit .btn:hover,.hero .btn:hover{background:transparent;color:var(--on-kit)}
.sec{padding-block:var(--sec)}
h2{font-size:clamp(1.9rem,3.8vw,3rem);line-height:1.05;max-width:20ch}
.head{display:grid;gap:1rem;margin-bottom:clamp(2rem,4vw,3rem)}
.about .w{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(2rem,5vw,4.5rem);align-items:center}
.about .w.solo{grid-template-columns:minmax(0,1fr)}
.about p{font-size:clamp(1.25rem,2.1vw,1.6rem);line-height:1.45;max-width:40ch}
.about .hoop{margin-bottom:1.5rem}
.about img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius)}
.offer{background:var(--tint);border-block:1px solid var(--line)}
.offer .w{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(2rem,5vw,4.5rem);align-items:start}
.offer .head{position:sticky;top:1.5rem}
.fix{border-top:3px solid var(--ink)}
.fix li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.3rem 1.5rem;align-items:center;padding:1.15rem 0 1.15rem 1.25rem;border-bottom:1px solid var(--line);border-inline-start:.45rem solid var(--kit)}
.fix li:nth-child(even){border-inline-start-color:var(--dk)}
.fix h3{font-size:clamp(1.2rem,1.9vw,1.5rem);line-height:1.2}
.fix p{color:var(--quiet);margin-top:.2rem;max-width:52ch}
.score{display:inline-grid;place-items:center;min-width:6.5rem;min-height:3.1rem;padding:.4rem .9rem;background:var(--ink);color:var(--paper);font-family:var(--font-heading);font-weight:700;font-size:1.15rem;font-variant-numeric:tabular-nums;line-height:1.15;text-align:center;border-radius:calc(var(--radius) * .4);box-shadow:inset 0 -.3rem 0 var(--kit)}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:2.25rem clamp(1.5rem,3vw,3rem)}
.cols h3{font-size:1.35rem;line-height:1.2;margin-block:1rem .45rem}
.cols p{color:var(--quiet)}
.sec:not(.join) .cols li{border-top:3px solid var(--ink)}
.kit .cols p{color:color-mix(in oklab,var(--on-kit) 82%,var(--kit))}
.join .cols{counter-reset:none}
.join li{display:grid;grid-template-columns:auto minmax(0,1fr);gap:1.1rem;align-items:start}
.join h3{margin-top:.3rem}
.join .crest{--s:3.3rem}
.join .crest span{font-size:1.35rem;min-width:52%;height:46%}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.9rem,4.4vw,3.6rem);line-height:1.12;max-width:24ch;margin-top:1.5rem}
.qa{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 clamp(2rem,5vw,4rem);border-top:3px solid var(--ink)}
.qa div{padding-block:1.25rem;border-bottom:1px solid var(--line)}
.qa h3{font-size:1.2rem;line-height:1.3;margin-bottom:.35rem}.qa p{color:var(--quiet)}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(.75rem,2vw,1.25rem)}
.pair img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:var(--radius);border-bottom:.45rem solid var(--kit)}
.end .w{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2rem,5vw,4.5rem);align-items:start;padding-block:var(--sec)}
.end h2{font-size:clamp(2.1rem,4.6vw,3.6rem);margin-block:1.25rem 1rem}
.end p.sub{font-size:1.2rem;max-width:36ch;margin-bottom:2rem;color:color-mix(in oklab,var(--on-kit) 85%,var(--kit))}
.end dl{display:grid;gap:0;border-top:3px solid var(--on-kit)}
.end dl div{display:grid;grid-template-columns:6.5rem minmax(0,1fr);gap:1rem;padding-block:1rem;border-bottom:1px solid color-mix(in oklab,var(--on-kit) 35%,var(--kit))}
.end dt{font-weight:700}.end dd{overflow-wrap:anywhere}.end dd a{text-underline-offset:.2em}
.foot{background:var(--dk);color:var(--on-kit)}
.foot .w{display:flex;align-items:center;gap:1rem 1.25rem;flex-wrap:wrap;padding-block:1.4rem;font-size:.95rem}
.foot .crest{--s:2.2rem;background:var(--kit)}
.foot b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking)}
.foot span.t{opacity:.85;margin-inline-start:auto}
@media (max-width:900px){.offer .w,.about .w,.end .w{grid-template-columns:minmax(0,1fr)}.offer .head{position:static}.qa{grid-template-columns:minmax(0,1fr)}.about figure{max-width:28rem}}
@media (max-width:720px){.top nav{display:none}.hero .w{grid-template-columns:minmax(0,1fr);gap:1.75rem}.crest.big{--s:6.5rem}.lead img{aspect-ratio:4/3}.pair{grid-template-columns:minmax(0,1fr)}.fix li{grid-template-columns:minmax(0,1fr);padding-inline-start:1rem}.score{justify-self:start;min-height:2.6rem;min-width:5.5rem;margin-top:.5rem}.foot span.t{margin-inline-start:0;flex-basis:100%}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say kit">
        <div className="w">
          <span className="hoop" aria-hidden="true" />
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
            <span className="hoop" aria-hidden="true" />
          </div>
          <div className="qa">
            {c.faq?.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
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
  const l = listOf(c, x)
  if (!l) return null
  const steps = x === 'steps'
  return (
    <section className={steps ? 'sec join kit' : 'sec'}>
      <div className="w">
        <div className="head">
          <h2>{l.title}</h2>
          <span className="hoop" aria-hidden="true" />
        </div>
        <ol className="cols">
          {l.items.map((it, i) => (
            <li key={it.title}>
              {steps && (
                <span className="crest" aria-hidden="true">
                  <span>{i + 1}</span>
                </span>
              )}
              <div>
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </div>
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
  const heroPic = !isArt(c.photos.hero)
  const aboutPic = !isArt(c.photos.about)
  const list = offerItems(c)
  return (
    <>
      <div className="kit">
        <div className="w top">
          <span className="id">
            <b>{c.name}</b>
          </span>
          <nav>
            {links(c, extras).map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
      <div className="band" aria-hidden="true" />
      <header className={heroPic ? 'hero kit has-pic' : 'hero kit'}>
        <div className="w">
          <div>
            <p className="tag">{c.tagline}</p>
            <h1>{c.headline}</h1>
            <p className="sub">{c.subhead}</p>
            <a className="btn" href="#visit">
              {c.cta.label}
            </a>
          </div>
        </div>
      </header>
      {heroPic && (
        <figure className="w lead">
          <Pic photo={c.photos.hero} eager />
        </figure>
      )}
      <main>
        <section className="sec about">
          <div className={aboutPic ? 'w' : 'w solo'}>
            <div>
              <span className="hoop" aria-hidden="true" />
              <p>{c.about}</p>
            </div>
            {aboutPic && (
              <figure>
                <Pic photo={c.photos.about} />
              </figure>
            )}
          </div>
        </section>
        {list.length > 0 && (
          <section className="sec offer" id="offer">
            <div className="w">
              <div className="head">
                <h2>{c.offerTitle}</h2>
                <span className="hoop" aria-hidden="true" />
              </div>
              <ul className="fix">
                {list.map((it) => (
                  <li key={it.name}>
                    <div>
                      <h3>{it.name}</h3>
                      {it.detail && <p>{it.detail}</p>}
                    </div>
                    {it.price && <span className="score">{it.price}</span>}
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
      <footer id="visit">
        <div className="band" aria-hidden="true" />
        <div className="kit end">
          <div className="w">
            <div>
              <span className="hoop" aria-hidden="true" />
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
            <span className="t">{c.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export const clubhouse: Template = {
  id: 'clubhouse',
  label: 'Clubhouse',
  text: "A club page in kit colours: an opening striped like a team shirt in two shades of the club's colour, bars like the hoops on a sock under every heading, sessions and memberships as a fixture list with each price in a scoreboard box and joining as numbered shields: proud, sporty and welcoming, for football, rugby, cricket, hockey, running, cycling, rowing and other sports and social clubs.",
  dark: false,
  css: CSS,
  Page,
}
