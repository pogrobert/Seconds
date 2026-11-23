// Sidebar: the offer as a spine. A solid column in the business's colour holds the left edge of
// the screen and stays in place while the page scrolls: the name at the top and below it every
// offer item by name, each a link to its entry. On the right the page runs at an easy reading
// width: the opening, the introduction, then every item again with its detail and price, so a
// long menu or treatment list is one glance on the left and the full story on the right. An item
// jumped to is marked. With twenty or more items the spine scrolls on its own. On a phone the
// spine becomes a coloured band with the item names in a row that slides sideways. Some photos.
// For restaurants, salons and clinics with a long list.

import { Fragment } from 'react'
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

const ART = ':is(img[data-art],img[src^="data:image/svg"])'
const ON = 'color-mix(in oklab,var(--band-foreground) 22%,transparent)'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 3%,#fbfaf7);--ink:color-mix(in oklab,var(--band) 18%,#18181a);--quiet:color-mix(in oklab,var(--ink) 64%,var(--paper));--line:color-mix(in oklab,var(--ink) 15%,var(--paper));--tint:color-mix(in oklab,var(--band) 9%,var(--paper));--deep:color-mix(in oklab,var(--band) 82%,#000);--pad:clamp(1.25rem,4vw,4.5rem);--sec:clamp(3.5rem,8vh,6rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.65}
.frame{display:grid;grid-template-columns:clamp(16rem,26vw,23rem) minmax(0,1fr)}
.rail{background:var(--acc);color:var(--on-acc)}
.spine{position:sticky;top:0;height:100vh;height:100svh;overflow-y:auto;padding:2rem clamp(1.25rem,2.4vw,2.25rem);display:flex;flex-direction:column;gap:2rem;scrollbar-width:thin}
.spine b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.4rem,2vw,1.8rem);line-height:1.1;display:block}
.spine .t{display:block;font-size:.95rem;opacity:.8;margin-bottom:.6rem}
.idx a{display:block;text-decoration:none;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.05rem,1.35vw,1.25rem);line-height:1.25;padding-block:.55rem;border-top:1px solid ${ON}}
.idx li:last-child a{border-bottom:1px solid ${ON}}
.idx a:hover{padding-inline-start:.4rem;transition:padding .15s}
.idx .g{font-size:.85rem;opacity:.75;padding-block:1.1rem .4rem}
.idx .g:first-child{padding-top:0}
.idx.many a{font-size:1rem;padding-block:.4rem}
.idx.few a{font-size:clamp(1.25rem,1.8vw,1.6rem);padding-block:.8rem}
.spine nav.go{margin-top:auto;display:flex;flex-wrap:wrap;gap:.35rem 1.25rem;font-size:.92rem}
.spine nav.go a{opacity:.85;text-underline-offset:.25em}.spine nav.go a:hover{opacity:1}
.page{min-width:0;padding-inline:var(--pad)}
.col{max-width:44rem}
.open{padding-block:clamp(3.5rem,14vh,9rem) var(--sec)}
.open .tag{color:var(--quiet);margin-bottom:1.25rem}
.open h1{font-size:clamp(2.5rem,5vw,4.6rem);line-height:1.03;margin-bottom:1.5rem}
.open .sub{font-size:clamp(1.1rem,1.5vw,1.25rem);color:var(--quiet);max-width:40ch;margin-bottom:2rem}
.btn{display:inline-block;padding:.9rem 1.5rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:650;text-decoration:none;line-height:1.3}
.btn:hover{background:var(--deep)}
.open figure{margin-top:clamp(2.5rem,6vh,4rem);max-width:56rem}
.open img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:var(--radius)}
.open figure:has(${ART}){display:none}
.sec{padding-block:var(--sec);border-top:1px solid var(--line)}
.about p{font-family:var(--font-heading);font-size:clamp(1.3rem,2vw,1.65rem);line-height:1.45;letter-spacing:var(--heading-tracking)}
.about figure{margin-top:2.5rem}
.about img{width:min(100%,26rem);aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius)}
.about figure:has(${ART}){display:none}
h2.h{font-size:clamp(1.8rem,3vw,2.6rem);line-height:1.1;margin-bottom:2rem}
.gh{font-size:1.2rem;line-height:1.3;color:var(--deep);margin:2.75rem 0 .25rem}
.gh:first-of-type{margin-top:0}
.ent{scroll-margin-top:1.5rem;padding:1.4rem 0;border-bottom:1px solid var(--line);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.35rem 2rem;align-items:baseline}
.ent h3{font-size:clamp(1.3rem,1.9vw,1.6rem);line-height:1.2}
.ent .pr{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.25rem;font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--deep)}
.ent p{grid-column:1/-1;color:var(--quiet);max-width:60ch}
.ent:target{background:var(--tint);box-shadow:-1rem 0 0 var(--tint),1rem 0 0 var(--tint);border-bottom-color:var(--acc)}
.list li{padding-block:1.25rem;border-bottom:1px solid var(--line);display:grid;grid-template-columns:minmax(0,1fr);gap:.3rem}
.list li:first-child{border-top:1px solid var(--line)}
.list h3{font-size:1.25rem;line-height:1.3}
.list p{color:var(--quiet)}
.list.num li{grid-template-columns:2.75rem minmax(0,1fr)}
.list .n{grid-row:span 2;font-family:var(--font-heading);font-size:1.6rem;line-height:1.1;color:var(--deep);font-variant-numeric:tabular-nums}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.7rem,3.2vw,2.6rem);line-height:1.22}
.faq details{border-bottom:1px solid var(--line);padding-block:1.1rem}
.faq details:first-of-type{border-top:1px solid var(--line)}
.faq summary{font-weight:650;display:flex;justify-content:space-between;gap:1rem}
.faq summary::after{content:"+";color:var(--deep);font-size:1.3rem;line-height:1.1}
.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.5rem}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;max-width:56rem}
.pair img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius)}
.visit{border-top:4px solid var(--acc)}
.visit h2{font-size:clamp(1.9rem,3.4vw,2.9rem);line-height:1.08;margin-bottom:1rem}
.visit .sub{color:var(--quiet);max-width:40ch;margin-bottom:2rem;font-size:1.1rem}
.visit dl{margin-top:2.5rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr));gap:1.5rem 2rem}
.visit dt{font-size:.88rem;color:var(--quiet);margin-bottom:.15rem}
.visit dd{overflow-wrap:anywhere}
.visit dd a{color:var(--deep);text-underline-offset:.2em}
.foot{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.75rem 2.5rem;border-top:1px solid var(--line);font-size:.92rem;color:var(--quiet)}
@media (max-width:860px){.frame{grid-template-columns:minmax(0,1fr)}.spine{position:static;height:auto;overflow:visible;padding:1.25rem var(--pad) 1rem;gap:1rem}.spine nav.go{display:none}.idx{display:flex;gap:.5rem;overflow-x:auto;margin-inline:calc(-1 * var(--pad));padding:0 var(--pad) .4rem;scrollbar-width:none}.idx li{flex:none}.idx .g{display:none}.idx a,.idx.many a,.idx.few a,.idx li:last-child a{font-size:.95rem;padding:.45rem .85rem;border:1px solid color-mix(in oklab,var(--band-foreground) 40%,transparent);border-radius:var(--button-radius);white-space:nowrap}.open{padding-top:2.5rem}.ent{grid-template-columns:minmax(0,1fr) auto;gap:.3rem 1rem}.ent .pr{font-size:1.1rem}.ent:target{box-shadow:none}}`

const anchor = (i: number) => `item-${i + 1}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say col">
        <p>{c.statement}</p>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec faq col" id="questions">
        <h2 className="h">Questions</h2>
        <FaqDetails faq={c.faq} />
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
    <section className="sec col" id={x}>
      <h2 className="h">{l.title}</h2>
      <ol className={steps ? 'list num' : 'list'}>
        <ListItems items={l.items} numbered={steps} />
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
  const all = offerItems(c)
  // Each item keeps one index across groups, so the spine and the entries share anchors.
  let k = 0
  const numbered = groups.map((g) => ({
    group: g.group,
    items: g.items.map((it) => ({ ...it, i: k++ })),
  }))
  return (
    <div className="frame">
      <div className="rail">
        <header className="spine">
          <div>
            <b>{c.name}</b>
          </div>
          {all.length > 0 && (
            <nav aria-label={c.offerTitle}>
              <ul className={all.length > 12 ? 'idx many' : all.length < 7 ? 'idx few' : 'idx'}>
                {numbered.map((g) => (
                  <Fragment key={`${g.group}-${g.items[0]?.i}`}>
                    {named && g.group && <li className="g">{g.group}</li>}
                    {g.items.map((it) => (
                      <li key={it.i}>
                        <a href={`#${anchor(it.i)}`}>{it.name}</a>
                      </li>
                    ))}
                  </Fragment>
                ))}
              </ul>
            </nav>
          )}
          <nav className="go">
            <NavLinks links={links(c, extras)} />
          </nav>
        </header>
      </div>
      <div className="page">
        <main>
          <section className="open">
            <p className="tag">{c.tagline}</p>
            <h1 className="col">{c.headline}</h1>
            <p className="sub">{c.subhead}</p>
            <a className="btn" href={all.length ? '#offer' : '#visit'}>
              {c.cta.label}
            </a>
            <figure>
              <Pic photo={c.photos.hero} eager />
            </figure>
          </section>
          <section className="sec about col">
            <p>{c.about}</p>
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
          </section>
          {all.length > 0 && (
            <section className="sec col" id="offer">
              <h2 className="h">{c.offerTitle}</h2>
              {numbered.map((g) => (
                <Fragment key={`${g.group}-${g.items[0]?.i}`}>
                  {named && g.group && <h3 className="gh">{g.group}</h3>}
                  {g.items.map((it) => (
                    <article className="ent" id={anchor(it.i)} key={it.i}>
                      <h3>{it.name}</h3>
                      {it.price && <span className="pr">{it.price}</span>}
                      {it.detail && <p>{it.detail}</p>}
                    </article>
                  ))}
                </Fragment>
              ))}
            </section>
          )}
          {xs.map((x) => (
            <Fragment key={x}>
              <Extras c={c} x={x} />
            </Fragment>
          ))}
          <section className="sec visit" id="visit">
            <h2 className="col">{c.cta.headline}</h2>
            <p className="sub">{c.cta.subhead}</p>
            {reach && (
              <a className="btn" href={reach.href}>
                {c.cta.label}
              </a>
            )}
            {hasVisit(c) && (
              <dl>
                <FactRows facts={f} />
              </dl>
            )}
          </section>
        </main>
        <footer className="foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </footer>
      </div>
    </div>
  )
}

export const sidebar: Template = {
  id: 'sidebar',
  label: 'Sidebar',
  text: 'A solid column in the brand colour holds the left edge and stays in place, listing every dish, treatment or service by name as a link, while the page runs on the right at an easy reading width with each item again in full, its detail and price; a long list reads at a glance, and on a phone the names slide sideways in a coloured band; for restaurants, salons and clinics with many items.',
  dark: false,
  css: CSS,
  Page,
}
