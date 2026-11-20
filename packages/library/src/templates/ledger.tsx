// Ledger: the page reads as a printed price list or account book. One sheet of warm paper, ruled
// across, with a double margin line in the business's colour running the whole height: section
// names sit left of the line, their content right of it. Prices sit on dotted leaders, right
// aligned in tabular figures; the facts are a small table. Type only: the hero photo appears
// small in the margin when it is a real photo and is left out otherwise. For barbers, cafés,
// accountants, repair shops.

import { Fragment, type ReactNode } from 'react'
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
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 3%,#fbfaf5);--rule:color-mix(in oklab,var(--band) 16%,#d6d3ca);--ink:color-mix(in oklab,var(--band) 22%,#151515);--quiet:color-mix(in oklab,var(--ink) 64%,var(--paper));--w:70rem;--gut:clamp(1.25rem,4vw,3rem);--lab:minmax(0,15rem);--pad:clamp(2.25rem,4.5vw,3.75rem);--cell:clamp(1.25rem,3vw,2.5rem)}
body{background:var(--paper);color:var(--ink);font-size:1rem;line-height:1.55}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.mast{display:flex;align-items:baseline;justify-content:space-between;gap:1.5rem;padding-block:1.6rem 1.1rem;border-bottom:4px double var(--ink)}
.mast b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.2rem,2vw,1.5rem);line-height:1.2}
.mast nav{display:flex;gap:1.5rem;font-size:.95rem;flex-shrink:0}.mast nav a{text-decoration:none}.mast nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.row{display:grid;grid-template-columns:var(--lab) minmax(0,1fr);border-bottom:1px solid var(--rule)}
.row>.lab{padding-block:var(--pad);padding-inline-end:var(--cell);border-inline-end:5px double var(--acc)}
.row>.cnt{padding-block:var(--pad);padding-inline-start:var(--cell);min-width:0}
.lab h2{font-size:1.15rem;line-height:1.3}
.lab .tag{font-size:.95rem;color:var(--quiet);line-height:1.45}
.lab figure{margin-top:0}
.lab img{width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;border-radius:calc(var(--radius) * .4);filter:saturate(.85)}
.hero .cnt{padding-block:clamp(3rem,7vw,5.5rem)}
.hero h1{font-size:clamp(2.4rem,5.4vw,4.5rem);line-height:1.03;max-width:18ch;margin-bottom:1.4rem}
.hero p.sub{font-size:clamp(1.08rem,1.5vw,1.25rem);color:var(--quiet);max-width:46ch;margin-bottom:2rem}
.btn{display:inline-block;padding:.85rem 1.5rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:600;text-decoration:none}
.tbl{margin-top:clamp(2.5rem,5vw,3.5rem);border-top:1px solid var(--ink);border-bottom:1px solid var(--ink);max-width:40rem}
.tbl>div{display:grid;grid-template-columns:minmax(0,7.5rem) minmax(0,1fr);gap:.25rem 1.5rem;padding-block:.7rem}
.tbl>div+div{border-top:1px solid var(--rule)}
.tbl dt{font-size:.9rem;color:var(--quiet)}
.tbl dd{font-variant-numeric:tabular-nums;overflow-wrap:break-word}
.tbl dd a{text-decoration:none}
.intro{font-family:var(--font-heading);font-size:clamp(1.3rem,2.1vw,1.7rem);line-height:1.4;letter-spacing:var(--heading-tracking);max-width:38ch}
.grp+.grp{margin-top:2.5rem}
.grp h3{font-size:1rem;line-height:1.3;color:var(--acc);padding-bottom:.6rem;border-bottom:1px solid var(--ink)}
.list li{padding-block:.95rem;border-bottom:1px solid var(--rule)}
.list li:first-child{border-top:1px solid var(--ink)}
.grp .list li:first-child{border-top:0}
.ln{display:flex;align-items:baseline;gap:.75rem}
.ln .nm{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:1.15rem;line-height:1.3;min-width:0}
.ln .dots{flex:1 1 2rem;border-bottom:2px dotted color-mix(in oklab,var(--ink) 40%,var(--paper));transform:translateY(-.3em);min-width:1.5rem}
.ln .pr{font-variant-numeric:tabular-nums lining-nums;font-family:var(--font-heading);font-size:1.15rem;white-space:nowrap}
.list p.dt{color:var(--quiet);font-size:.95rem;margin-top:.2rem;max-width:56ch}
.ent li{display:grid;grid-template-columns:minmax(0,15rem) minmax(0,1fr);gap:.4rem var(--cell);padding-block:1.1rem;border-bottom:1px solid var(--rule)}
.ent li:first-child{border-top:1px solid var(--ink)}
.ent.num li{grid-template-columns:2.5rem minmax(0,13rem) minmax(0,1fr)}
.ent .n{font-family:var(--font-heading);font-variant-numeric:tabular-nums;color:var(--acc);font-size:1.15rem;line-height:1.3}
.ent h3{font-size:1.1rem;line-height:1.3}
.ent p{color:var(--quiet);max-width:52ch}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.6rem,3.2vw,2.5rem);line-height:1.2;max-width:28ch;text-wrap:balance}
.qa>div{padding-block:1.1rem;border-bottom:1px solid var(--rule)}
.qa>div:first-child{border-top:1px solid var(--ink)}
.qa h3{font-size:1.1rem;line-height:1.35;margin-bottom:.35rem}.qa p{color:var(--quiet);max-width:60ch}
.strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(.75rem,1.5vw,1.25rem)}
.strip img{width:100%;height:auto;aspect-ratio:1;object-fit:cover;border-radius:calc(var(--radius) * .4)}
section:has(.strip):not(:has(img:not([data-art]):not([src^="data:image/svg"]))){display:none}
.lab:has(figure img[data-art]) figure,.lab:has(figure img[src^="data:image/svg"]) figure{display:none}
.end{background:var(--acc);color:var(--on-acc);--rule:color-mix(in oklab,var(--on-acc) 28%,var(--acc));--quiet:color-mix(in oklab,var(--on-acc) 78%,var(--acc))}
.end .mast{border-bottom-color:var(--on-acc);border-top:0}
.end .row{border-bottom:0}
.end .row>.lab{border-inline-end-color:var(--on-acc)}
.end h2.big{font-size:clamp(2rem,4.4vw,3.5rem);line-height:1.05;margin-bottom:1rem;max-width:20ch}
.end p.sub{max-width:44ch;font-size:1.1rem;color:var(--quiet);margin-bottom:1.75rem}
.end .btn{background:var(--on-acc);color:var(--acc)}
.end .tbl{border-color:var(--on-acc)}
.end .tbl dt{color:var(--quiet)}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-block:1.4rem 1.8rem;border-top:4px double var(--on-acc);font-size:.9rem}
.foot span:last-child{color:var(--quiet)}
@media (max-width:760px){.mast nav{display:none}.row{grid-template-columns:minmax(0,1fr);border-inline-start:5px double var(--acc);padding-inline-start:1.1rem}.end .row{border-inline-start-color:var(--on-acc)}.row>.lab{border-inline-end:0;padding-block:2rem 0;padding-inline-end:0}.row>.cnt{padding-inline-start:0;padding-block:1.1rem 2.25rem}.hero>.lab{padding-top:1.75rem}.lab figure{max-width:9rem}.row>.lab:empty,.row>.lab:has(figure img[data-art]),.row>.lab:has(figure img[src^="data:image/svg"]){display:none}.say>.cnt,.row:has(.strip)>.cnt{padding-top:2.25rem}.ent li,.ent.num li{grid-template-columns:minmax(0,1fr)}.ent.num li{grid-template-columns:2rem minmax(0,1fr)}.ent.num li p{grid-column:2}.strip{grid-template-columns:repeat(2,minmax(0,1fr))}.tbl>div{grid-template-columns:minmax(0,1fr)}}`

function Row(p: { lab?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section className={`row${p.className ? ` ${p.className}` : ''}`} id={p.id}>
      <div className="lab">{p.lab}</div>
      <div className="cnt">{p.children}</div>
    </section>
  )
}

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <Row className="say">
        <p>{c.statement}</p>
      </Row>
    )
  if (x === 'faq')
    return (
      <Row lab={<h2>Questions</h2>} id="questions">
        <div className="qa">
          {c.faq?.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </Row>
    )
  if (x === 'gallery')
    return (
      <section className="row">
        <div className="lab" />
        <div className="cnt">
          <div className="strip">
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
        </div>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  const steps = x === 'steps'
  return (
    <Row lab={<h2>{l.title}</h2>}>
      <ol className={`ent${steps ? ' num' : ''}`}>
        {l.items.map((it, i) => (
          <li key={it.title}>
            {steps && <span className="n">{i + 1}.</span>}
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </li>
        ))}
      </ol>
    </Row>
  )
}

function Facts({ c }: { c: TemplateProps['c'] }) {
  const f = facts(c)
  if (!f.length) return null
  return (
    <dl className="tbl">
      {f.map((x) => (
        <div key={x.label}>
          <dt>{x.label}</dt>
          <dd>{x.href ? <a href={x.href}>{x.value}</a> : x.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const reach = facts(c).find((x) => x.href)
  const groups = c.prices.filter((g) => g.items.length)
  const named = groups.length > 1 && groups.every((g) => g.group)
  return (
    <>
      <div className="w">
        <div className="mast">
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
      <main className="w">
        <Row className="hero" lab={<p className="tag">{c.tagline}</p>}>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
          <Facts c={c} />
        </Row>
        <Row
          lab={
            <figure>
              <Pic photo={c.photos.hero} eager />
            </figure>
          }
        >
          <p className="intro">{c.about}</p>
        </Row>
        <Row lab={<h2>{c.offerTitle}</h2>} id="offer">
          {groups.map((g, gi) => (
            <div className={named ? 'grp' : undefined} key={g.group || gi}>
              {named && <h3>{g.group}</h3>}
              <ul className="list">
                {g.items.map((it) => (
                  <li key={it.name}>
                    <div className="ln">
                      <span className="nm">{it.name}</span>
                      {it.price && (
                        <>
                          <span className="dots" aria-hidden="true" />
                          <span className="pr">{it.price}</span>
                        </>
                      )}
                    </div>
                    {it.detail && <p className="dt">{it.detail}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Row>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
        <div className="w">
          <div className="row">
            <div className="lab" />
            <div className="cnt">
              <h2 className="big">{c.cta.headline}</h2>
              <p className="sub">{c.cta.subhead}</p>
              {reach && (
                <a className="btn" href={reach.href}>
                  {c.cta.label}
                </a>
              )}
              {hasVisit(c) && <Facts c={c} />}
            </div>
          </div>
          <div className="foot">
            <span>{c.name}</span>
            <span>{c.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export const ledger: Template = {
  id: 'ledger',
  label: 'Ledger',
  text: 'A page set like a printed price list or account book: warm paper ruled across, a double margin line in the business colour, names on dotted leaders with prices lined up on the right, and the hours and address as a small table; type only, exact and trustworthy, for barbers, cafés, accountants and repair shops.',
  dark: false,
  css: CSS,
  Page,
}
