// Directory: dense and organised, like a well-kept reference book. Below a thin bar, the page is
// three panes: a contents list on the left that follows the reader down the page, the services
// in the middle as a ruled price table, each group under a heading that stays in view while its
// rows scroll, and on the right a card with the hours, address and phone that also stays in view.
// Small, calm type, hairlines and one colour; a long price list reads easily. Needs no photos: a
// real hero photo shows as a wide strip, drawn art is left out. For garages, clinics and salons
// with many services and long price lists.

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
  reachOf,
  type Template,
  type TemplateProps,
} from './shared.tsx'

const ART = ':is(img[data-art],img[src^="data:image/svg"])'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:#fff;--soft:color-mix(in oklab,var(--band) 5%,#f7f7f5);--line:color-mix(in oklab,var(--band) 12%,#e3e3e0);--ink:color-mix(in oklab,var(--band) 16%,#141416);--quiet:color-mix(in oklab,var(--ink) 66%,#fff);--deep:color-mix(in oklab,var(--band) 85%,#000);--w:82rem;--gut:clamp(1rem,3vw,2.5rem);--sec:clamp(2.5rem,5vw,3.75rem)}
body{background:var(--paper);color:var(--ink);font-size:1rem;line-height:1.55;border-top:6px solid var(--acc)}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{border-bottom:1px solid var(--line)}
.top .w{display:flex;align-items:baseline;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.1rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.3rem;line-height:1.25}
.top .tag{color:var(--quiet);font-size:.95rem;margin-inline-start:1rem}
.top nav{display:flex;gap:.4rem 1.5rem;flex-wrap:wrap;font-size:.95rem;font-weight:600}
.top nav a{text-decoration:none}.top nav a:hover{color:var(--deep);text-decoration:underline;text-underline-offset:.3em}
.panes{display:grid;grid-template-columns:12.5rem minmax(0,1fr) 19rem;gap:clamp(2rem,3.5vw,3.5rem);align-items:start;padding-top:clamp(2rem,4vw,3rem)}
.idx{position:sticky;top:1.5rem;border-inline-start:2px solid var(--line);font-size:.93rem}
.idx a{display:block;padding:.45rem 0 .45rem 1rem;margin-inline-start:-2px;border-inline-start:2px solid transparent;text-decoration:none;color:var(--quiet);line-height:1.35}
.idx a:hover{color:var(--ink);border-color:var(--acc)}
.idx a.on{color:var(--ink);font-weight:700;border-color:var(--acc)}
.idx a.sub{padding-inline-start:1.9rem;font-size:.9rem}
main{min-width:0}
.open{padding-bottom:var(--sec);border-bottom:1px solid var(--line)}
.open h1{font-size:clamp(2.1rem,3.8vw,3.3rem);line-height:1.08;max-width:22ch;margin-bottom:1rem}
.open .sub{font-size:1.15rem;color:var(--quiet);max-width:52ch;margin-bottom:1.5rem}
.btn{display:inline-block;padding:.75rem 1.3rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:700;text-decoration:none;line-height:1.3}
.btn:hover{background:var(--deep)}
.open figure{margin-top:2rem}
.open img{width:100%;aspect-ratio:5/2;object-fit:cover;border-radius:var(--radius)}
.open figure:has(${ART}){display:none}
.sec{padding-block:var(--sec);border-bottom:1px solid var(--line)}
.sec:last-child{border-bottom:0}
.about p{font-size:1.15rem;line-height:1.6;max-width:62ch}
h2.t{font-size:clamp(1.6rem,2.6vw,2.1rem);line-height:1.15;margin-bottom:1.25rem}
.grp+.grp{margin-top:2.25rem}
.grp h3.g{position:sticky;top:0;z-index:1;background:var(--paper);font-size:1.15rem;line-height:1.3;color:var(--deep);padding-block:.6rem;border-bottom:2px solid var(--acc)}
.rows li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.15rem 1.5rem;padding-block:.75rem;border-bottom:1px solid var(--line)}
.rows li{padding-inline:.6rem}
.rows li:nth-child(even){background:color-mix(in oklab,var(--soft) 65%,#fff)}
.rows .nm{font-weight:650;line-height:1.35}
.rows .dt{grid-column:1;color:var(--quiet);font-size:.92rem;line-height:1.45}
.rows .pr{grid-column:2;grid-row:1;font-variant-numeric:tabular-nums;font-weight:650;white-space:nowrap;text-align:end}
.defs li{display:grid;grid-template-columns:minmax(0,15rem) minmax(0,1fr);gap:.25rem 2rem;padding-block:1rem;border-top:1px solid var(--line)}
.defs li:last-child{border-bottom:1px solid var(--line)}
.defs h3{font-family:var(--font-body);font-size:1.02rem;font-weight:700;letter-spacing:0;text-transform:none;line-height:1.4}
.defs p{color:var(--quiet)}
.defs.num li{grid-template-columns:2.25rem minmax(0,15rem) minmax(0,1fr)}
.defs .n{display:grid;place-items:center;width:1.9rem;height:1.9rem;border-radius:50%;border:2px solid var(--acc);color:var(--deep);font-weight:700;font-size:.92rem;font-variant-numeric:tabular-nums}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.4rem,2.4vw,1.9rem);line-height:1.3;max-width:34ch;padding-inline-start:1.25rem;border-inline-start:3px solid var(--acc)}
.qa div{padding-block:1rem;border-top:1px solid var(--line)}
.qa div:last-child{border-bottom:1px solid var(--line)}
.qa h3{font-family:var(--font-body);font-size:1.02rem;font-weight:700;letter-spacing:0;text-transform:none;line-height:1.4;margin-bottom:.25rem}
.qa p{color:var(--quiet);max-width:62ch}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
.pair img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:var(--radius)}
.card{position:sticky;top:1.5rem;background:var(--soft);border:1px solid var(--line);border-top:5px solid var(--acc);border-radius:var(--radius);padding:1.4rem 1.4rem 1.5rem}
.card h2{font-size:1.4rem;line-height:1.2;margin-bottom:.5rem}
.card .sub{color:var(--quiet);font-size:.95rem;margin-bottom:1.1rem}
.card .btn{display:block;text-align:center}
.card dl{margin-top:1.25rem;font-size:.93rem}
.card dl>div{padding-block:.75rem;border-top:1px solid var(--line)}
.card dt{font-weight:700;margin-bottom:.15rem}
.card dd{overflow-wrap:anywhere;color:var(--ink)}
.card dd a{color:var(--deep);text-underline-offset:.2em}
.hrs{display:grid;grid-template-columns:auto auto;justify-content:space-between;gap:.15rem 1rem}
.hrs span:nth-child(even){text-align:end;font-variant-numeric:tabular-nums;white-space:nowrap}
.foot{margin-top:clamp(2.5rem,5vw,4rem);border-top:1px solid var(--line);background:var(--soft)}
.foot .w{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.4rem;font-size:.9rem;color:var(--quiet)}
.foot b{color:var(--ink);font-weight:700}
@media (max-width:1100px){.panes{grid-template-columns:minmax(0,1fr) 18rem}.idx{display:none}}
@media (max-width:760px){.panes{grid-template-columns:minmax(0,1fr)}.card{position:static}.top nav{display:none}.top .tag{display:block;margin:0}.defs li,.defs.num li{grid-template-columns:minmax(0,1fr)}.defs.num li{grid-template-columns:2.25rem minmax(0,1fr)}.defs.num p{grid-column:2}.rows li{padding-inline:.4rem}.open img{aspect-ratio:3/2}}`

const slug = (s: string, i: number) =>
  `g${i}-${s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 24)}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say">
        <p>{c.statement}</p>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <h2 className="t">Questions</h2>
        <div className="qa">
          {c.faq?.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="pair">
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
    <section className="sec" id={x}>
      <h2 className="t">{l.title}</h2>
      <ol className={steps ? 'defs num' : 'defs'}>
        {l.items.map((it, i) => (
          <li key={it.title}>
            {steps && <span className="n">{i + 1}</span>}
            <h3>{it.title}</h3>
            <p>{it.body}</p>
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
  const groups = c.prices.filter((g) => g.items.length)
  const named = groups.filter((g) => g.group).length > 1
  const listed = xs.flatMap((x) => {
    const l = listOf(c, x)
    return l
      ? [{ href: `#${x}`, label: l.title }]
      : x === 'faq'
        ? [{ href: '#questions', label: 'Questions' }]
        : []
  })
  return (
    <>
      <header className="top">
        <div className="w">
          <div>
            <b>{c.name}</b>
            <span className="tag">{c.tagline}</span>
          </div>
          <nav>
            {links(c, extras).map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <div className="w panes">
        <nav className="idx" aria-label={c.name}>
          {offerItems(c).length > 0 && (
            <a className="on" href="#offer">
              {c.offerTitle}
            </a>
          )}
          {named &&
            groups.map((g, i) =>
              g.group ? (
                <a key={g.group} className="sub" href={`#${slug(g.group, i)}`}>
                  {g.group}
                </a>
              ) : null,
            )}
          {listed.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <a href="#visit">{c.cta.headline}</a>
        </nav>
        <main>
          <section className="open">
            <h1>{c.headline}</h1>
            <p className="sub">{c.subhead}</p>
            <a className="btn" href={reach?.href ?? '#visit'}>
              {c.cta.label}
            </a>
            <figure>
              <Pic photo={c.photos.hero} eager />
            </figure>
          </section>
          <section className="sec about">
            <p>{c.about}</p>
          </section>
          {offerItems(c).length > 0 && (
            <section className="sec" id="offer">
              <h2 className="t">{c.offerTitle}</h2>
              {groups.map((g, i) => (
                <div className="grp" key={g.group || i} id={g.group ? slug(g.group, i) : undefined}>
                  {g.group && <h3 className="g">{g.group}</h3>}
                  <ul className="rows">
                    {g.items.map((it) => (
                      <li key={it.name}>
                        <span className="nm">{it.name}</span>
                        {it.price && <span className="pr">{it.price}</span>}
                        {it.detail && <span className="dt">{it.detail}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}
          {xs.map((x) => (
            <Fragment key={x}>
              <Extras c={c} x={x} />
            </Fragment>
          ))}
        </main>
        <aside className="card" id="visit">
          <h2>{c.cta.headline}</h2>
          <p className="sub">{c.cta.subhead}</p>
          {reach && (
            <a className="btn" href={reach.href}>
              {c.cta.label}
            </a>
          )}
          {hasVisit(c) && (
            <dl>
              {c.hours.length > 0 && (
                <div>
                  <dt>Hours</dt>
                  <dd className="hrs">
                    {c.hours.map((h) => (
                      <Fragment key={h.days}>
                        <span>{h.days}</span>
                        <span>{h.time}</span>
                      </Fragment>
                    ))}
                  </dd>
                </div>
              )}
              {f
                .filter((x) => x.label !== 'Hours')
                .map((x) => (
                  <div key={x.label}>
                    <dt>{x.label}</dt>
                    <dd>{x.href ? <a href={x.href}>{x.value}</a> : x.value}</dd>
                  </div>
                ))}
            </dl>
          )}
        </aside>
      </div>
      <footer className="foot">
        <div className="w">
          <b>{c.name}</b>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const directory: Template = {
  id: 'directory',
  label: 'Directory',
  text: 'Dense and organised like a well-kept reference book: three panes, a contents list on the left, the services in the middle as a ruled price table grouped under headings, and a card with the hours, address and phone on the right that stays in view; small calm type and hairlines, no photos needed, for garages, clinics, salons and practices with many services and long price lists.',
  dark: false,
  css: CSS,
  Page,
}
