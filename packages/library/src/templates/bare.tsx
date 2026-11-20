// Bare: a plain page with only what matters set with care. The name in the business's colour, the
// promise in a few quiet lines, then the offer as the page's real content: names and prices large,
// in one narrow column with nothing but space between them, and one line to get in touch, set as
// large as the offer. Everything else (the introduction, the extras, the closing and its facts)
// follows small and quiet in a margin-labelled colophon. No photos, except a small row of real
// ones when a gallery is asked for. For cafés, bakeries, barbers, sole traders.

import { Fragment } from 'react'
import {
  type Extra,
  facts,
  hasVisit,
  links,
  listOf,
  Pic,
  present,
  RESET,
  type Template,
  type TemplateProps,
} from './shared.tsx'

const CSS = `${RESET}
:root{--acc:var(--band);--paper:color-mix(in oklab,var(--band) 2%,#fdfdfb);--ink:color-mix(in oklab,var(--band) 16%,#161616);--quiet:color-mix(in oklab,var(--ink) 60%,var(--paper));--line:color-mix(in oklab,var(--ink) 13%,var(--paper));--col:42rem;--gut:clamp(1.25rem,5vw,2rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.pg{max-width:var(--col);margin-inline:auto;padding:clamp(2.5rem,9vw,6.5rem) var(--gut) clamp(2rem,5vw,3rem)}
.top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:.75rem 2rem;margin-bottom:clamp(2.75rem,8vw,5rem)}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(2rem,6vw,3.1rem);line-height:1.04;color:var(--acc);text-wrap:balance;overflow-wrap:break-word;min-width:0;max-width:16ch}
.top nav{display:flex;gap:1.25rem;font-size:.92rem;color:var(--quiet)}
.top nav a{text-decoration:none}.top nav a:hover{color:var(--ink);text-decoration:underline;text-underline-offset:.25em}
.open{margin-bottom:clamp(3.5rem,9vw,5.5rem);max-width:34rem}
.open .tag{color:var(--quiet);font-size:.95rem;margin-bottom:.5rem}
.open h1{font-size:clamp(1.3rem,2.6vw,1.6rem);line-height:1.3;margin-bottom:.6rem;max-width:30ch}
.open .sub{color:var(--quiet);margin-bottom:1.25rem}
.btn{display:inline-block;padding:.6rem 1.15rem;border:1px solid currentColor;border-radius:var(--button-radius);text-decoration:none;font-size:.95rem;font-weight:500}
.btn:hover{background:var(--ink);color:var(--paper)}
.offer h2{font-size:.95rem;font-family:var(--font-body);font-weight:500;letter-spacing:0;text-transform:none;color:var(--quiet);margin-bottom:clamp(1.5rem,4vw,2.25rem)}
.grp+.grp{margin-top:clamp(2.25rem,6vw,3.25rem)}
.grp h3.g{font-family:var(--font-body);font-weight:500;letter-spacing:0;text-transform:none;font-size:.95rem;color:var(--quiet);margin-bottom:.75rem}
.menu li{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:clamp(1.25rem,4vw,2.5rem);align-items:baseline;padding-block:clamp(.7rem,1.8vw,1rem)}
.nm,.pr{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.4rem,3.4vw,1.95rem);line-height:1.18}
.nm{text-transform:var(--heading-case);text-wrap:balance;min-width:0}
.pr{font-variant-numeric:tabular-nums lining-nums;white-space:nowrap;text-align:end}
.menu p{grid-column:1;color:var(--quiet);font-size:.97rem;margin-top:.2rem;max-width:44ch}
.reach{margin-block:clamp(3.5rem,9vw,5.5rem) 0;padding-top:clamp(1.5rem,4vw,2rem);border-top:1px solid var(--ink)}
.reach a,.reach span{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.4rem,3.4vw,1.95rem);line-height:1.2;color:var(--acc);text-decoration:none;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}
.reach a:hover{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.2em}
.notes{max-width:var(--col);margin-inline:auto;padding:0 var(--gut);font-size:.95rem;color:var(--quiet);line-height:1.6}
.q{display:grid;grid-template-columns:9rem minmax(0,1fr);gap:.25rem 2rem;padding-block:1.4rem;border-top:1px solid var(--line)}
.q>:first-child:not(h2){grid-column:2}
.q h2{font-family:var(--font-body);font-weight:500;letter-spacing:0;text-transform:none;font-size:.95rem;line-height:1.6;color:var(--ink)}
.q .b{max-width:58ch}
.q h3{font-family:var(--font-body);font-weight:500;letter-spacing:0;text-transform:none;font-size:.95rem;line-height:1.6;color:var(--ink)}
.q li+li,.q .qa+.qa{margin-top:.8rem}
.q .n{font-variant-numeric:tabular-nums;color:var(--ink);margin-inline-end:.4rem}
.q .say{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);color:var(--ink);font-size:1.15rem;line-height:1.45;max-width:40ch}
.q.strip .b{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem}
.q.strip img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:calc(var(--radius) * .5)}
.q dl>div{display:grid;grid-template-columns:5rem minmax(0,1fr);gap:1rem}
.q dl>div+div{margin-top:.3rem}
.q dd{color:var(--ink);overflow-wrap:anywhere}.q .hl{display:block}
.q dd a{text-decoration:none;border-bottom:1px solid var(--line)}
.q dd a:hover{border-color:currentColor}
.q .end{color:var(--ink);margin-bottom:.15rem}
.q .end+p{margin-bottom:1rem}
.foot{display:flex;justify-content:space-between;flex-wrap:wrap;gap:.25rem 1.5rem;padding-block:1.4rem 2.5rem;border-top:1px solid var(--line);font-size:.88rem}
@media (max-width:620px){.q{grid-template-columns:minmax(0,1fr)}.q>:first-child:not(h2){grid-column:1}.top nav{display:none}.q dl>div{grid-template-columns:minmax(0,1fr);gap:0}.q dl>div+div{margin-top:.6rem}}`

type C = TemplateProps['c']

function Extras({ c, x }: { c: C; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="q">
        <p className="b say">{c.statement}</p>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="q" id="questions">
        <h2>Questions</h2>
        <div className="b">
          {c.faq?.map((f) => (
            <div className="qa" key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="q strip">
        <div className="b">
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
    <section className="q">
      <h2>{l.title}</h2>
      <ol className="b">
        {l.items.map((it, i) => (
          <li key={it.title}>
            <h3>
              {x === 'steps' && <span className="n">{i + 1}.</span>}
              {it.title}
            </h3>
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
  const reach = f.find((x) => x.href)
  // The one contact line: the first way to reach them, or else where they are.
  const line = reach ?? f.find((x) => x.label === 'Address')
  const groups = c.prices.filter((g) => g.items.length)
  const named = groups.length > 1 && groups.every((g) => g.group)
  return (
    <>
      <div className="pg">
        <header>
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
          <div className="open">
            <p className="tag">{c.tagline}</p>
            <h1>{c.headline}</h1>
            <p className="sub">{c.subhead}</p>
            <a className="btn" href={reach?.href ?? '#visit'}>
              {c.cta.label}
            </a>
          </div>
        </header>
        {groups.length > 0 && (
          <section className="offer" id="offer">
            <h2>{c.offerTitle}</h2>
            {groups.map((g, gi) => (
              <div className="grp" key={g.group || gi}>
                {named && <h3 className="g">{g.group}</h3>}
                <ul className="menu">
                  {g.items.map((it) => (
                    <li key={it.name}>
                      <span className="nm">{it.name}</span>
                      {it.price ? <span className="pr">{it.price}</span> : <span />}
                      {it.detail && <p>{it.detail}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}
        {line && (
          <p className="reach">
            {line.href ? <a href={line.href}>{line.value}</a> : <span>{line.value}</span>}
          </p>
        )}
      </div>
      <main className="notes">
        <section className="q">
          <p className="b">{c.about}</p>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
        <section className="q" id="visit">
          <div className="b">
            <h2 className="end">{c.cta.headline}</h2>
            <p>{c.cta.subhead}</p>
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
        </section>
      </main>
      <footer className="notes">
        <div className="foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const bare: Template = {
  id: 'bare',
  label: 'Bare',
  text: "A plain page with nothing extra: the name in the business's own colour, a few quiet lines, then the offer set large with prices on the right and only space between them, and one line to get in touch; everything else small and quiet at the foot. Type only, calm and confident, for cafés, bakeries, barbers and sole traders.",
  dark: false,
  css: CSS,
  Page,
}
