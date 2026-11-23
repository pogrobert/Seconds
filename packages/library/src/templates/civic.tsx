// Civic: plain, public and structured, like a good council or library website. A solid bar in the
// organisation's colour carries its name; below, big readable type on white, and the offer set
// out as a directory: each service an underlined link in a three-column grid, its detail under
// it. Contact facts sit in a ruled table. Photos are optional: the hero shows only a real photo,
// and drawn art is left out. For councils, charities, schools, libraries.

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
img{height:auto}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:#fff;--grey:color-mix(in oklab,var(--band) 5%,#f3f3f1);--line:color-mix(in oklab,var(--band) 12%,#cfcfcc);--ink:color-mix(in oklab,var(--band) 12%,#0b0c0c);--quiet:color-mix(in oklab,var(--ink) 78%,#fff);--link:color-mix(in oklab,var(--band) 88%,#000);--w:66rem;--gut:clamp(1rem,4vw,2rem);--sec:clamp(3rem,6vw,4.5rem)}
body{background:var(--paper);color:var(--ink);font-size:1.1875rem;line-height:1.5}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.bar{background:var(--acc);color:var(--on-acc);border-bottom:.6rem solid color-mix(in oklab,var(--band) 55%,#fff)}
.bar .w{display:flex;align-items:center;justify-content:space-between;gap:1rem 2rem;flex-wrap:wrap;padding-block:1.1rem}
.bar b{font-family:var(--font-heading);font-weight:700;font-size:1.3rem;line-height:1.25;letter-spacing:var(--heading-tracking);max-width:32ch}
.bar nav{display:flex;gap:.5rem 1.5rem;flex-wrap:wrap;font-size:1rem;font-weight:600}
.bar nav a{text-underline-offset:.25em}.bar nav a:hover{text-decoration-thickness:3px}
.hero{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:clamp(2rem,5vw,4rem);padding-block:clamp(2.5rem,6vw,4.5rem);align-items:center}
.hero.solo{grid-template-columns:minmax(0,1fr)}
.hero .tag{font-size:1.05rem;color:var(--quiet);margin-bottom:.9rem;font-weight:600}
.hero h1{font-size:clamp(2.3rem,5vw,3.6rem);line-height:1.08;margin-bottom:1.25rem;max-width:22ch}
.hero p.sub{font-size:clamp(1.2rem,1.8vw,1.4rem);max-width:40ch;margin-bottom:2rem}
.hero img{width:100%;aspect-ratio:4/3;object-fit:cover}
.btn{display:inline-block;padding:.85rem 1.4rem;background:var(--acc);color:var(--on-acc);font-weight:700;font-size:1.15rem;line-height:1.3;text-decoration:none;border-radius:var(--button-radius);box-shadow:0 3px 0 color-mix(in oklab,var(--band) 60%,#000)}
.btn:hover{background:color-mix(in oklab,var(--band) 85%,#000)}
.btn:active{transform:translateY(2px);box-shadow:0 1px 0 color-mix(in oklab,var(--band) 60%,#000)}
.intro{border-top:1px solid var(--line);padding-block:var(--sec)}
.intro p{font-size:clamp(1.25rem,2vw,1.5rem);line-height:1.5;max-width:42ch;border-inline-start:.6rem solid var(--acc);padding-inline-start:clamp(1rem,2.5vw,1.75rem)}
.sec{padding-block:var(--sec)}
.grey{background:var(--grey)}
.sec h2{font-size:clamp(1.85rem,3.4vw,2.6rem);line-height:1.15;margin-bottom:clamp(1.5rem,3vw,2.25rem);max-width:28ch}
.dir{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 clamp(1.5rem,3vw,2.5rem)}
.dir li{border-top:1px solid var(--line);padding-block:1.25rem 1.6rem}
.dir a{display:block;text-decoration:none;color:inherit}
.dir h3{font-family:var(--font-body);font-size:1.2rem;font-weight:700;line-height:1.3;letter-spacing:0;text-transform:none;color:var(--link);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em;margin-bottom:.4rem}
.dir a:hover h3{text-decoration-thickness:3px}
.dir p{font-size:1.05rem;color:var(--quiet)}
.dir .price{display:block;margin-top:.35rem;font-weight:700;font-variant-numeric:tabular-nums;color:var(--ink)}
.list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.75rem clamp(1.5rem,4vw,3.5rem);max-width:58rem}
.list h3{font-size:1.3rem;line-height:1.3;margin-bottom:.35rem}
.list p{color:var(--quiet)}
.steps{display:grid;gap:0;max-width:46rem;counter-reset:s}
.steps li{display:grid;grid-template-columns:3rem minmax(0,1fr);gap:1.25rem;padding-block:1.25rem;border-top:1px solid var(--line)}
.steps li:last-child{border-bottom:1px solid var(--line)}
.steps .n{display:grid;place-items:center;width:3rem;height:3rem;border-radius:50%;background:var(--acc);color:var(--on-acc);font-weight:700;font-size:1.25rem;font-variant-numeric:tabular-nums}
.steps h3{font-size:1.3rem;line-height:1.3;margin-block:.45rem .3rem}
.steps p{color:var(--quiet)}
.inset p{font-size:clamp(1.35rem,2.4vw,1.75rem);line-height:1.4;max-width:40ch;border-inline-start:.6rem solid color-mix(in oklab,var(--band) 45%,#fff);padding:.25rem 0 .25rem clamp(1rem,2.5vw,1.75rem)}
.faq{max-width:46rem;border-bottom:1px solid var(--line)}
.faq details{border-top:1px solid var(--line)}
.faq summary{display:flex;gap:1rem;align-items:baseline;padding-block:1.1rem;font-weight:700;font-size:1.2rem;color:var(--link)}
.faq summary::before{content:"+";display:inline-grid;place-items:center;flex:none;width:1.6rem;height:1.6rem;border:2px solid currentColor;border-radius:50%;font-size:1.1rem;line-height:1;transform:translateY(.2rem)}
.faq details[open] summary::before{content:"−"}
.faq summary:hover{text-decoration:underline;text-underline-offset:.2em}
.faq p{padding:0 0 1.25rem 2.6rem;max-width:60ch}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(1rem,2vw,1.5rem)}
.pair img{width:100%;aspect-ratio:3/2;object-fit:cover}
.end{background:var(--grey);border-top:1px solid var(--line);padding-block:var(--sec)}
.end .cols{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:clamp(2rem,5vw,4rem);align-items:start}
.end h2{font-size:clamp(1.85rem,3.4vw,2.6rem);line-height:1.15;margin-bottom:1rem}
.end p.sub{font-size:1.25rem;margin-bottom:1.75rem;max-width:36ch}
.end dl{background:var(--paper);border:1px solid var(--line);border-top:.4rem solid var(--acc)}
.end dl div{display:grid;grid-template-columns:7rem minmax(0,1fr);gap:1rem;padding:1rem 1.25rem;border-top:1px solid var(--line)}
.end dl div:first-child{border-top:0}
.end dt{font-weight:700}
.end dd{overflow-wrap:anywhere}
.end dd a{color:var(--link);text-underline-offset:.2em}
.foot{border-top:.4rem solid var(--acc);background:var(--paper)}
.foot .w{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.75rem;font-size:1rem;color:var(--quiet)}
.foot b{color:var(--ink)}
@media (max-width:900px){.dir{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){body{font-size:1.125rem}.hero,.end .cols,.list,.dir{grid-template-columns:minmax(0,1fr)}.hero figure{order:-1}.bar nav{display:none}.end dl div{grid-template-columns:minmax(0,1fr);gap:.15rem}.pair{grid-template-columns:minmax(0,1fr)}}
/* Questions beside their heading on wide screens: a heading over a narrow list left the right half empty (Robert, 2026-11-23). */
@media (min-width:861px){#questions>.w{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);column-gap:clamp(2rem,5vw,5rem);align-items:start}#questions>.w>h2,#questions>.w>.head{margin:0}#questions .faq{max-width:none}}
@media (min-width:861px){.sec.grey>.w{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);column-gap:clamp(2rem,5vw,5rem);align-items:start}.sec.grey>.w>h2{margin:0}.steps{max-width:none}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec inset">
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
          <div className="faq">
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
  return (
    <section className={x === 'steps' ? 'sec grey' : 'sec'}>
      <div className="w">
        <h2>{l.title}</h2>
        <ol className={x === 'steps' ? 'steps' : 'list'}>
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
      </div>
    </section>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const photo = !isArt(c.photos.hero)
  const call = f.find((x) => x.href)
  return (
    <>
      <div className="bar">
        <div className="w">
          <b>{c.name}</b>
          <nav>
            {links(c, extras).map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
      <header className={photo ? 'w hero' : 'w hero solo'}>
        <div>
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </div>
        {photo && (
          <figure>
            <Pic photo={c.photos.hero} eager />
          </figure>
        )}
      </header>
      <main>
        <section className="intro">
          <div className="w">
            <p>{c.about}</p>
          </div>
        </section>
        {offerItems(c).length > 0 && (
          <section className="sec grey" id="offer">
            <div className="w">
              <h2>{c.offerTitle}</h2>
              <ul className="dir">
                {offerItems(c).map((it) => (
                  <li key={it.name}>
                    <a href="#visit">
                      <h3>{it.name}</h3>
                      {it.detail && <p>{it.detail}</p>}
                      {it.price && <span className="price">{it.price}</span>}
                    </a>
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
        <div className="end">
          <div className="w cols">
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
            <span>{c.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export const civic: Template = {
  id: 'civic',
  label: 'Civic',
  text: "A solid bar in the organisation's colour with its name, big plain readable type on white, and its services laid out as a directory of clear underlined links with contact details in a ruled table: public, trustworthy and accessible, for councils, charities, schools, libraries and community services.",
  dark: false,
  css: CSS,
  Page,
}
