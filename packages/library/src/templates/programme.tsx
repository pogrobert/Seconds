// Programme: a printed concert or event programme, opened flat on a dark seat. The page is a
// booklet: the first spread is the cover in the organisation's colour (name, headline, the hero
// photo as the cover picture) facing the first inside page, where the introduction is the
// programme note and the offer is the running order, centred, item under item with a short rule
// between. The inside pages run in two columns either side of the fold (one section alone runs
// across both, its heading over the spread: a lone section left the right page empty); the
// closing spread puts
// the facts on the last inside page and the call on the back cover. With no photos the cover is
// type only. For choirs, orchestras, bands, amateur theatre, societies and festivals.

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
  reachOf,
  type Template,
  type TemplateProps,
} from './shared.tsx'

const isArt = (p: Photo) => p.src.startsWith('data:image/svg')

const CSS = `${RESET}
:root{--cov:var(--band);--on-cov:var(--band-foreground);--seat:color-mix(in oklab,var(--band) 22%,#1b1a19);--on-seat:color-mix(in oklab,var(--band) 6%,#ece9e2);--page:color-mix(in oklab,var(--band) 3%,#fbf8f1);--ink:color-mix(in oklab,var(--band) 22%,#1c1a17);--quiet:color-mix(in oklab,var(--ink) 68%,var(--page));--hair:color-mix(in oklab,var(--band) 28%,#d8d1c3);--acc:color-mix(in oklab,var(--band) 85%,#000);--w:78rem;--gut:clamp(.75rem,3vw,2.5rem);--pad:clamp(1.5rem,4.5vw,4rem)}
body{background:var(--seat);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;justify-content:space-between;align-items:center;gap:1rem 2rem;padding-block:1.25rem;color:var(--on-seat)}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.1rem;line-height:1.25;max-width:34ch}
.top nav{display:flex;gap:.4rem 1.6rem;flex-wrap:wrap;font-size:.97rem}
.top nav a{text-decoration:none;opacity:.85}.top nav a:hover{opacity:1;text-decoration:underline;text-underline-offset:.3em}
.book{box-shadow:0 1.5rem 3rem -1rem rgba(0,0,0,.6),0 0 0 1px rgba(0,0,0,.25)}
.spread{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
.pg{background:var(--page);padding:var(--pad);box-shadow:inset 1.1rem 0 1.1rem -1.1rem rgba(0,0,0,.28);border-inline-start:1px solid var(--hair)}
.cover{background:var(--cov);color:var(--on-cov);padding:clamp(1rem,2.4vw,1.6rem);box-shadow:inset -1.1rem 0 1.1rem -1.1rem rgba(0,0,0,.3)}
.cover .in{display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:clamp(1.5rem,3vw,2.25rem);height:100%;min-height:clamp(30rem,58vw,44rem);text-align:center;padding:clamp(1.5rem,4vw,3rem) clamp(1.25rem,3.5vw,2.75rem);border:1px solid color-mix(in oklab,var(--on-cov) 45%,var(--cov));outline:1px solid color-mix(in oklab,var(--on-cov) 45%,var(--cov));outline-offset:-6px}
.cover .tag{font-size:.98rem;max-width:36ch;opacity:.9}
.cover .nm{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.15rem,1.8vw,1.4rem);line-height:1.25;max-width:26ch;margin-top:.6rem}
.cover .pic{width:min(100%,24rem)}
.cover .pic img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:var(--radius);border:.5rem solid color-mix(in oklab,var(--on-cov) 92%,var(--cov))}
.cover h1{font-size:clamp(2rem,4vw,3.3rem);line-height:1.08;max-width:16ch;overflow-wrap:break-word}
.cover.solo h1{font-size:clamp(2.4rem,5.2vw,4.4rem)}
.cover p.sub{max-width:34ch;font-size:1.08rem;opacity:.92;margin-top:1rem;margin-inline:auto}
.btn{display:inline-block;padding:.8rem 1.6rem;border-radius:var(--button-radius);font-weight:700;text-decoration:none;line-height:1.3;background:var(--acc);color:var(--on-cov)}
.btn:hover{background:var(--ink)}
.cover .btn{background:var(--on-cov);color:var(--cov)}
.cover .btn:hover{background:color-mix(in oklab,var(--on-cov) 85%,var(--cov))}
.rule{display:block;width:3rem;height:0;border-top:2px solid var(--acc);margin:clamp(1.75rem,3.5vw,2.5rem) auto}
.note p{font-size:clamp(1.12rem,1.5vw,1.25rem);line-height:1.65;max-width:42ch;margin-inline:auto}
.note p::first-line{font-weight:600}
h2{font-size:clamp(1.6rem,2.8vw,2.3rem);line-height:1.12;text-align:center;max-width:22ch;margin:0 auto clamp(1.5rem,3vw,2.25rem)}
.order{text-align:center;max-width:34rem;margin-inline:auto}
.order li{padding-block:1.05rem}
.order li+li{border-top:1px solid var(--hair)}
.order h3{font-size:clamp(1.2rem,1.9vw,1.45rem);line-height:1.25}
.order p{font-style:italic;color:var(--quiet);margin-top:.2rem}
.order .pr{display:block;margin-top:.35rem;color:var(--acc);font-weight:600;font-variant-numeric:tabular-nums}
.inside{background:var(--page);padding:var(--pad);columns:2;column-gap:calc(var(--pad) * 2);column-rule:1px solid var(--hair);border-top:1px solid var(--hair)}
.inside>section{break-inside:avoid;padding-block:0 clamp(2rem,4vw,3rem)}
.inside>section:only-child{break-inside:auto;padding-bottom:0}
.inside>section:only-child>h2{column-span:all;margin-bottom:clamp(1.25rem,2.5vw,1.75rem)}
.inside>section.say:only-child,.inside>section.pair:only-child{column-span:all}
.inside>section+section{padding-top:clamp(.5rem,1vw,1rem)}
.inside>section+section::before{content:"";display:block;width:3rem;border-top:2px solid var(--acc);margin:0 auto clamp(1.75rem,3.5vw,2.5rem)}
.inside h2{margin-bottom:1.25rem}
.items li{padding-block:.85rem;text-align:center;break-inside:avoid}
.items h3,.qa h3{font-size:1.2rem;line-height:1.3;margin-bottom:.25rem}
.items p,.qa p{color:var(--quiet);max-width:40ch;margin-inline:auto}
.items .n{display:block;font-family:var(--font-heading);color:var(--acc);font-size:1.6rem;line-height:1;margin-bottom:.4rem;font-variant-numeric:lining-nums}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.45rem,2.4vw,1.95rem);line-height:1.3;text-align:center;max-width:24ch;margin-inline:auto}
.qa div{padding-block:.85rem;text-align:center;break-inside:avoid}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}
.pair img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius)}
.end{border-top:1px solid var(--hair)}
.end .pg dl{max-width:30rem;margin-inline:auto;text-align:center}
.end .pg dl div{padding-block:1rem}
.end .pg dl div+div{border-top:1px solid var(--hair)}
.end dt{color:var(--quiet);font-size:.95rem;margin-bottom:.15rem}.end dd{font-size:1.12rem;overflow-wrap:anywhere}.end dd a{text-underline-offset:.2em}
.end .cover{box-shadow:inset 1.1rem 0 1.1rem -1.1rem rgba(0,0,0,.3);border-inline-start:1px solid rgba(0,0,0,.2)}
.end .cover .in{min-height:clamp(24rem,40vw,32rem);justify-content:center}
.end .cover h2{color:inherit;font-size:clamp(1.9rem,3.6vw,3rem);margin-bottom:0}
.end .cover p.sub{margin-bottom:1.25rem}
.end .cover .nm{margin-top:auto;padding-top:1.5rem;font-size:1rem}
.end .pg:only-child,.end .cover:only-child{grid-column:1/-1}
.end .cover:only-child .in{min-height:clamp(18rem,28vw,24rem)}
.foot{display:flex;justify-content:center;gap:.25rem 2rem;flex-wrap:wrap;text-align:center;padding-block:2rem 2.5rem;color:var(--on-seat);opacity:.8;font-size:.95rem}
@media (max-width:860px){.spread{grid-template-columns:minmax(0,1fr)}.pg{box-shadow:none;border-inline-start:0;border-top:1px solid var(--hair)}.cover,.end .cover{box-shadow:none;border:0}.cover .in{min-height:0}.inside{columns:1;column-rule:none}.end .cover .in{min-height:0}}
@media (max-width:640px){.top nav{display:none}.w{padding-inline:.6rem}.pair{grid-template-columns:minmax(0,1fr)}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="say">
        <p>{c.statement}</p>
      </section>
    )
  if (x === 'faq')
    return (
      <section id="questions">
        <h2>Questions</h2>
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
  const steps = x === 'steps'
  return (
    <section>
      <h2>{l.title}</h2>
      <ol className="items">
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
  const list = offerItems(c)
  const heroPic = !isArt(c.photos.hero)
  return (
    <>
      <div className="w top">
        <b>{c.name}</b>
        <nav>
          {links(c, extras).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="w">
        <div className="book">
          <main>
            <div className="spread">
              <header className={heroPic ? 'cover' : 'cover solo'}>
                <div className="in">
                  <div>
                    <p className="tag">{c.tagline}</p>
                    <p className="nm">{c.name}</p>
                  </div>
                  {heroPic && (
                    <figure className="pic">
                      <Pic photo={c.photos.hero} eager />
                    </figure>
                  )}
                  <div>
                    <h1>{c.headline}</h1>
                    <p className="sub">{c.subhead}</p>
                  </div>
                  <a className="btn" href="#visit">
                    {c.cta.label}
                  </a>
                </div>
              </header>
              <div className="pg">
                <section className="note">
                  <p>{c.about}</p>
                </section>
                {list.length > 0 && (
                  <section id="offer">
                    <span className="rule" aria-hidden="true" />
                    <h2>{c.offerTitle}</h2>
                    <ul className="order">
                      {list.map((it) => (
                        <li key={it.name}>
                          <h3>{it.name}</h3>
                          {it.detail && <p>{it.detail}</p>}
                          {it.price && <span className="pr">{it.price}</span>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </div>
            {xs.length > 0 && (
              <div className="inside">
                {xs.map((x) => (
                  <Fragment key={x}>
                    <Extras c={c} x={x} />
                  </Fragment>
                ))}
              </div>
            )}
          </main>
          <footer id="visit" className="spread end">
            {hasVisit(c) && (
              <div className="pg">
                <dl>
                  {f.map((x) => (
                    <div key={x.label}>
                      <dt>{x.label}</dt>
                      <dd>{x.href ? <a href={x.href}>{x.value}</a> : x.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            <div className="cover">
              <div className="in">
                <h2>{c.cta.headline}</h2>
                <p className="sub">{c.cta.subhead}</p>
                {reach && (
                  <a className="btn" href={reach.href}>
                    {c.cta.label}
                  </a>
                )}
                <p className="nm">{c.name}</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <div className="w foot">
        <span>{c.name}</span>
        <span>{c.tagline}</span>
      </div>
    </>
  )
}

export const programme: Template = {
  id: 'programme',
  label: 'Programme',
  text: "A printed concert or event programme opened flat on a dark seat: a cover in the organisation's colour with its name, headline and one picture, facing an inside page with the welcome as the programme note and the offer as a centred running order, then inside pages in two columns either side of the fold and a back cover with the call; cultured, warm and a little ceremonial, for choirs, orchestras, bands, amateur theatre and drama groups, music and arts societies and festivals.",
  dark: false,
  css: CSS,
  Page,
}
