// Signal: practical and direct. The facts come first (a strip with the phone and hours), a very
// large headline beside a panel of what a visitor needs, then one wide photo. Every block on the
// page opens with the same thick rule in the business's colour, on one grid and one width.
// Steps are numbered because they are a sequence. For trades, clinics, councils, firms.

import { Fragment } from 'react'
import {
  type Extra,
  FactRows,
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

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:#fff;--tint:color-mix(in oklab,var(--band) 6%,#fff);--line:color-mix(in oklab,var(--band) 14%,#e9e9e9);--ink:color-mix(in oklab,var(--band) 18%,#151515);--quiet:color-mix(in oklab,var(--ink) 64%,#fff);--w:78rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4rem,8vw,7rem);--rule:4px}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.55}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.strip{background:var(--acc);color:var(--on-acc);font-size:.95rem}
.strip .w{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-block:.7rem}
.strip a{font-weight:700;text-decoration:none}
.bar{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:1.4rem;border-bottom:1px solid var(--line)}
.bar b{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.4rem;letter-spacing:var(--heading-tracking)}
.bar nav{display:flex;gap:1.75rem;align-items:center;font-size:.98rem}.bar nav a{text-decoration:none}.bar nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.hero{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:clamp(2rem,5vw,5rem);padding-block:clamp(3rem,7vw,6rem);align-items:end}
.hero h1{font-size:clamp(2.9rem,7vw,6.25rem);line-height:.98;margin-bottom:1.5rem}
.hero p.sub{font-size:clamp(1.1rem,1.6vw,1.3rem);color:var(--quiet);max-width:38ch;margin-bottom:2rem}
.acts{display:flex;gap:1rem;flex-wrap:wrap;align-items:center}
.btn{display:inline-block;padding:1rem 1.6rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:700;text-decoration:none}
.lnk{font-weight:600;text-decoration:none;border-bottom:2px solid var(--acc);padding-bottom:.15rem}
.panel{border-top:var(--rule) solid var(--acc);padding-top:1.25rem;display:grid;gap:1rem}
.panel dt{font-size:.9rem;color:var(--quiet)}.panel dd{font-size:1.15rem;font-weight:600}
.panel dd a{text-decoration:none}
.panel li{padding-block:.6rem;border-bottom:1px solid var(--line);font-weight:600}
.wide img{width:100%;aspect-ratio:21/9;object-fit:cover;border-radius:var(--radius)}
.sec{padding-block:var(--sec)}
.tint{background:var(--tint)}
.head{display:flex;justify-content:space-between;align-items:end;gap:2rem;margin-bottom:clamp(2rem,4vw,3rem)}
.head h2{font-size:clamp(2rem,4vw,3.25rem);line-height:1.05;max-width:20ch}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:clamp(1.5rem,3vw,2.5rem)}
.tiles li{border-top:var(--rule) solid var(--acc);padding-top:1.25rem}
.tiles h3{font-size:1.3rem;line-height:1.2;margin-bottom:.5rem;display:flex;justify-content:space-between;gap:1rem}
.tiles .price{font-variant-numeric:tabular-nums;white-space:nowrap}
.tiles p{color:var(--quiet)}
.n{display:block;font-family:var(--font-heading);font-size:3rem;line-height:1;margin-bottom:.75rem;color:var(--acc)}
.about{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:clamp(2rem,5vw,5rem);align-items:start}
.about img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius)}
.about .txt{border-top:var(--rule) solid var(--acc);padding-top:1.25rem}
.about p{font-size:clamp(1.15rem,1.6vw,1.3rem);line-height:1.55}
.say{background:var(--acc);color:var(--on-acc)}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.9rem,4vw,3.25rem);line-height:1.12;max-width:26ch;letter-spacing:var(--heading-tracking)}
.qa{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2rem clamp(2rem,5vw,4rem)}
.qa div{border-top:var(--rule) solid var(--acc);padding-top:1.1rem}
.qa h3{font-size:1.2rem;line-height:1.3;margin-bottom:.5rem}.qa p{color:var(--quiet)}
.three{display:grid;grid-template-columns:2fr 1fr;grid-template-rows:auto auto;gap:clamp(.75rem,1.5vw,1.25rem)}
.three img{width:100%;height:100%;object-fit:cover;border-radius:var(--radius);aspect-ratio:4/3}
.three figure:first-child{grid-row:span 2}.three figure:first-child img{aspect-ratio:auto;min-height:100%}
.end{background:var(--ink);color:#fff}
.end .w{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:clamp(2rem,5vw,5rem);padding-block:var(--sec)}
.end h2{font-size:clamp(2.4rem,5.5vw,4.75rem);line-height:1;margin-bottom:1.25rem}
.end p{color:color-mix(in oklab,#fff 75%,var(--ink));max-width:40ch;margin-bottom:2rem;font-size:1.15rem}
.end .big{font-family:var(--font-heading);font-size:clamp(1.8rem,3.5vw,2.75rem);text-decoration:none;display:block;margin-bottom:1rem}
.end dl{border-top:var(--rule) solid var(--acc);padding-top:1.25rem;display:grid;gap:1rem;align-content:start}
.end dt{font-size:.9rem;opacity:.7}.end dd{font-size:1.1rem}
.foot{padding-block:1.75rem;border-top:1px solid color-mix(in oklab,#fff 18%,var(--ink));display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;font-size:.9rem;opacity:.75}
@media (max-width:860px){.hero,.about,.end .w,.qa,.three{grid-template-columns:1fr}.three figure:first-child{grid-row:auto}.bar nav a:not(.btn){display:none}.head{display:block}.wide img{aspect-ratio:4/3}}`

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
    <section className={`sec${x === 'steps' ? ' tint' : ''}`}>
      <div className="w">
        <div className="head">
          <h2>{l.title}</h2>
        </div>
        <ol className="tiles">
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
  const hours = f.find((x) => x.label === 'Hours')
  const reach = reachOf(f)
  return (
    <>
      <div className="strip">
        <div className="w">
          <span>{c.tagline}</span>
          {phone ? (
            <a href={phone.href}>{phone.value}</a>
          ) : hours ? (
            <span>{hours.value}</span>
          ) : null}
        </div>
      </div>
      <div className="w bar">
        <b>{c.name}</b>
        <nav>
          <NavLinks links={links(c, extras)} />
        </nav>
      </div>
      <header className="w hero">
        <div>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <div className="acts">
            <a className="btn" href={reach?.href ?? '#visit'}>
              {c.cta.label}
            </a>
            <a className="lnk" href="#offer">
              {c.offerTitle}
            </a>
          </div>
        </div>
        <aside>
          {f.length ? (
            <dl className="panel">
              <FactRows facts={f} />
            </dl>
          ) : (
            <ul className="panel">
              {offerItems(c)
                .slice(0, 4)
                .map((it) => (
                  <li key={it.name}>{it.name}</li>
                ))}
            </ul>
          )}
        </aside>
      </header>
      <figure className="w wide">
        <Pic photo={c.photos.hero} eager />
      </figure>
      <main>
        <section className="sec" id="offer">
          <div className="w">
            <div className="head">
              <h2>{c.offerTitle}</h2>
            </div>
            <ul className="tiles">
              {offerItems(c).map((it) => (
                <li key={it.name}>
                  <h3>
                    <span>{it.name}</span>
                    {it.price && <span className="price">{it.price}</span>}
                  </h3>
                  {it.detail && <p>{it.detail}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="sec tint">
          <div className="w about">
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
            <div className="txt">
              <p>{c.about}</p>
            </div>
          </div>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
        <div className="w">
          <div>
            <h2>{c.cta.headline}</h2>
            <p>{c.cta.subhead}</p>
            {phone ? (
              <a className="big" href={phone.href}>
                {phone.value}
              </a>
            ) : reach ? (
              <a className="btn" href={reach.href}>
                {c.cta.label}
              </a>
            ) : null}
          </div>
          {hasVisit(c) && (
            <dl>
              <FactRows facts={f} />
            </dl>
          )}
        </div>
        <div className="w foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const signal: Template = {
  id: 'signal',
  label: 'Signal',
  text: 'A white page that puts the practical facts first: phone and hours in a coloured strip, a very large headline beside the details a visitor needs, a wide photo, and every block opened by the same thick coloured rule: clear, direct and dependable, for trades, clinics, councils and firms.',
  dark: false,
  css: CSS,
  Page,
}
