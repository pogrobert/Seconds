// Listing: the page reads like a property listing. The opening is a large feature panel, the hero
// photo with the headline on a plate of the business's colour at its foot, and beside it a
// column of key facts in ruled strips. The offer is a set of listings: wide rows, the name and its
// detail on the left and the price on a strip of the colour at the right, the strips stacking
// into one continuous column. Points and steps are ruled key-fact strips; photos are shown big,
// like a listing's own pictures; the close pairs a photo panel with a colour panel. Square,
// calm, precise. Without photos the panels become the colour and the page still reads whole.
// For estate and letting agents, holiday cottages and lets, venues and rooms for hire,
// wedding venues and serviced offices.

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
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 2%,#fbfbfa);--ink:color-mix(in oklab,var(--band) 20%,#17181a);--quiet:color-mix(in oklab,var(--ink) 66%,var(--paper));--line:color-mix(in oklab,var(--ink) 16%,var(--paper));--rule:color-mix(in oklab,var(--ink) 70%,var(--paper));--tint:color-mix(in oklab,var(--band) 7%,var(--paper));--deep:color-mix(in oklab,var(--band) 80%,#000);--on-line:color-mix(in oklab,var(--on-acc) 30%,var(--acc));--w:82rem;--gut:clamp(1rem,3.5vw,2.5rem);--sec:clamp(3.5rem,7vw,6rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top .w{display:flex;align-items:center;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.2rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.3rem;line-height:1.25;overflow-wrap:anywhere}
.top nav{display:flex;gap:.4rem 1.75rem;flex-wrap:wrap;font-size:.95rem}
.top nav a{text-decoration:none;color:var(--quiet)}.top nav a:hover{color:var(--ink);text-decoration:underline;text-underline-offset:.3em}
.btn{display:inline-block;padding:.9rem 1.5rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:650;text-decoration:none;line-height:1.3;text-align:center}
.btn:hover{background:var(--deep)}
.feat{display:grid;grid-template-columns:minmax(0,8fr) minmax(0,4fr);border-top:1px solid var(--line)}
.panel{position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:clamp(28rem,48vw,42rem);background:var(--acc);color:var(--on-acc)}
.panel figure{position:absolute;inset:0}
.panel img{width:100%;height:100%;object-fit:cover}
.panel figure:has(${ART}){display:none}
.plate{position:relative;background:var(--acc);padding:clamp(1.4rem,3vw,2.5rem);max-width:min(100%,46rem)}
.plate .tag{opacity:.88;margin-bottom:.9rem;max-width:48ch}
.plate h1{font-size:clamp(2.1rem,4vw,3.6rem);line-height:1.04;max-width:16ch;overflow-wrap:break-word}
.panel:has(${ART}) .plate{max-width:none;padding-top:clamp(4rem,10vw,8rem)}
.panel:has(${ART}) h1{font-size:clamp(2.6rem,6vw,5.6rem);max-width:15ch}
.side{background:var(--tint);padding:clamp(1.4rem,3vw,2.5rem);display:flex;flex-direction:column;gap:1.5rem}
.side .sub{font-size:clamp(1.05rem,1.35vw,1.2rem);line-height:1.55}
.side .btn{align-self:flex-start}
.kf>div{display:grid;grid-template-columns:5.5rem minmax(0,1fr);gap:1rem;padding-block:.8rem;border-top:1px solid var(--rule)}
.kf>div:last-child{border-bottom:1px solid var(--rule)}
.kf dt{font-size:.85rem;color:var(--quiet);padding-top:.15rem}
.kf dd{line-height:1.45;overflow-wrap:anywhere}
.kf dd a{text-decoration:none;border-bottom:1px solid currentColor}
.side .kf{margin-top:auto}
.sec{padding-top:var(--sec)}
.hd{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;margin-bottom:clamp(1.5rem,3vw,2.25rem)}
.hd h2,.end h2{font-size:clamp(1.9rem,3.6vw,3rem);line-height:1.08;max-width:22ch;overflow-wrap:break-word}
.about{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(2rem,5vw,4.5rem);align-items:center}
.about p{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.3rem,2.1vw,1.75rem);line-height:1.42;max-width:36ch}
.about img{width:100%;aspect-ratio:3/2;object-fit:cover}
.about:has(${ART}){grid-template-columns:minmax(0,1fr)}
.about figure:has(${ART}){display:none}
.about:has(${ART}) p{font-size:clamp(1.45rem,2.6vw,2.1rem);max-width:40ch}
.g{font-family:var(--font-body);font-weight:700;letter-spacing:0;text-transform:none;font-size:1rem;color:var(--deep);padding:1.6rem 0 .6rem;border-bottom:2px solid var(--rule)}
.hd+div>.g{padding-top:0}
.ls{display:grid;gap:.4rem;padding-top:.4rem}
.ls li{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,4fr) minmax(9rem,3fr);background:var(--tint)}
.ls.np li{grid-template-columns:minmax(0,5fr) minmax(0,7fr)}
.ls li>*{padding:clamp(1.1rem,2vw,1.6rem)}
.ls h3{font-size:clamp(1.3rem,2.1vw,1.75rem);line-height:1.15;overflow-wrap:anywhere}
.ls p{color:var(--quiet);border-inline-start:1px solid var(--line)}
.ls .pr{grid-column:3;background:var(--acc);color:var(--on-acc);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.3rem,2.1vw,1.75rem);line-height:1.15;font-variant-numeric:tabular-nums;text-align:end;overflow-wrap:anywhere}
.ls li:not(:has(p)) h3{grid-column:1/3}
.ls.np li:not(:has(p)) h3{grid-column:1/-1}
.ls li:not(:has(.pr))::after{content:"";background:var(--acc);grid-column:3}
.ls.np li::after{display:none}
.kfs>div{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:.4rem 2rem;padding-block:1.2rem;border-top:1px solid var(--rule)}
.kfs>div:last-child{border-bottom:1px solid var(--rule)}
.kfs h3{font-size:clamp(1.2rem,1.7vw,1.4rem);line-height:1.25}
.kfs p{color:var(--quiet);max-width:58ch}
.steps{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:.4rem}
.steps li{background:var(--tint);padding:clamp(1.2rem,2vw,1.6rem)}
.steps .n{display:grid;place-items:center;width:2.75rem;height:2.75rem;background:var(--acc);color:var(--on-acc);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.3rem;font-variant-numeric:lining-nums tabular-nums;margin-bottom:1.5rem}
.steps h3{font-size:1.25rem;line-height:1.25;margin-bottom:.4rem}
.steps p{color:var(--quiet)}
.say{background:var(--tint);margin-top:var(--sec);border-inline-start:.5rem solid var(--acc)}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.7rem,3.6vw,3rem);line-height:1.18;max-width:28ch;padding:clamp(2rem,5vw,4rem) clamp(1.4rem,4vw,3.5rem)}
.qa div{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:.4rem 2rem;padding-block:1.2rem;border-top:1px solid var(--line)}
.qa div:last-child{border-bottom:1px solid var(--line)}
.qa h3{font-family:var(--font-body);font-size:1.05rem;font-weight:700;letter-spacing:0;text-transform:none;line-height:1.45}
.qa p{color:var(--quiet);max-width:62ch}
.pair{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:.4rem}
.pair img{width:100%;height:100%;aspect-ratio:4/3;object-fit:cover}
.end{margin-top:var(--sec)}
.end .in{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr)}
.end figure{position:relative;min-height:24rem}
.end figure img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.end figure:has(${ART}){display:none}
.end .cp{background:var(--acc);color:var(--on-acc);padding:clamp(2rem,4.5vw,3.75rem);display:flex;flex-direction:column;gap:1.1rem}
.end .sub{opacity:.9;max-width:44ch;font-size:1.1rem}
.end .btn{align-self:flex-start;background:var(--on-acc);color:var(--acc);margin-top:.5rem}
.end .btn:hover{background:color-mix(in oklab,var(--on-acc) 88%,var(--acc))}
.end .kf{margin-top:1rem}
.end .kf>div{border-color:var(--on-line)}
.end .kf dt{color:inherit;opacity:.8}
.end .in:has(figure ${ART}){grid-template-columns:minmax(0,1fr)}
.end .in:has(figure ${ART}) .kf{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:0 2rem}
.end .in:has(figure ${ART}) .kf>div{grid-template-columns:minmax(0,1fr);gap:.2rem;border-bottom:1px solid var(--on-line)}
.foot .w{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.6rem;font-size:.92rem;color:var(--quiet)}
.foot b{color:var(--ink)}
@media (max-width:820px){.top nav{display:none}.feat,.about,.end .in{grid-template-columns:minmax(0,1fr)}.feat{margin-inline:calc(var(--gut) * -1);border-top:0}.panel{min-height:0}.panel figure{position:static}.panel img{aspect-ratio:4/3;height:auto}.panel:has(${ART}) .plate{padding-top:3rem}.about figure{order:-1}.ls li,.ls.np li{grid-template-columns:minmax(0,1fr)}.ls li>*{grid-column:1!important}.ls p{border-inline-start:0;padding-top:0}.ls .pr{text-align:start;padding-block:.7rem}.ls li:not(:has(.pr))::after{display:none}.ls li:not(:has(p)) h3{grid-column:1}.kfs>div,.qa div{grid-template-columns:minmax(0,1fr)}.steps{grid-auto-flow:row}.pair{grid-template-columns:minmax(0,1fr)}.end .in{margin-inline:calc(var(--gut) * -1)}.end figure{min-height:0}.end figure img{position:static;aspect-ratio:4/3;height:auto}}`

type Fact = ReturnType<typeof facts>[number]

function Facts({ list }: { list: Fact[] }) {
  return (
    <dl className="kf">
      {list.map((x) => (
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
      <section className="w">
        <div className="say">
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="w sec" id="questions">
        <div className="hd">
          <h2>Questions</h2>
        </div>
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
      <section className="w sec">
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
  if (x === 'steps')
    return (
      <section className="w sec" id={x}>
        <div className="hd">
          <h2>{l.title}</h2>
        </div>
        <ol className="steps">
          {l.items.map((it, i) => (
            <li key={it.title}>
              <span className="n">{i + 1}</span>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </li>
          ))}
        </ol>
      </section>
    )
  return (
    <section className="w sec" id={x}>
      <div className="hd">
        <h2>{l.title}</h2>
      </div>
      <div className="kfs">
        {l.items.map((it) => (
          <div key={it.title}>
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

type Item = { name: string; detail?: string; price: string }

function Listings({ list, priced }: { list: Item[]; priced: boolean }) {
  return (
    <ul className={priced ? 'ls' : 'ls np'}>
      {list.map((it) => (
        <li key={it.name}>
          <h3>{it.name}</h3>
          {it.detail && <p>{it.detail}</p>}
          {it.price && <span className="pr">{it.price}</span>}
        </li>
      ))}
    </ul>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = reachOf(f)
  const key = f.filter((x) => x.label === 'Address' || x.label === 'Hours')
  const groups = c.prices.filter((g) => g.items.length)
  const named = groups.filter((g) => g.group).length > 1
  const priced = offerItems(c).some((it) => it.price)
  return (
    <>
      <header className="top">
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
      </header>
      <main>
        <section className="w">
          <div className="feat">
            <div className="panel">
              <figure>
                <Pic photo={c.photos.hero} eager />
              </figure>
              <div className="plate">
                <p className="tag">{c.tagline}</p>
                <h1>{c.headline}</h1>
              </div>
            </div>
            <div className="side">
              <p className="sub">{c.subhead}</p>
              <a className="btn" href="#visit">
                {c.cta.label}
              </a>
              {key.length > 0 && <Facts list={key} />}
            </div>
          </div>
        </section>
        <section className="w sec about">
          <p>{c.about}</p>
          <figure>
            <Pic photo={c.photos.about} />
          </figure>
        </section>
        {offerItems(c).length > 0 && (
          <section className="w sec" id="offer">
            <div className="hd">
              <h2>{c.offerTitle}</h2>
            </div>
            {named ? (
              groups.map((g, i) => (
                <div key={g.group || i}>
                  {g.group && <h3 className="g">{g.group}</h3>}
                  <Listings list={g.items} priced={priced} />
                </div>
              ))
            ) : (
              <Listings list={offerItems(c)} priced={priced} />
            )}
          </section>
        )}
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
        <section className="w end" id="visit">
          <div className="in">
            <figure>
              <Pic photo={c.photos.cta} />
            </figure>
            <div className="cp">
              <h2>{c.cta.headline}</h2>
              <p className="sub">{c.cta.subhead}</p>
              <a className="btn" href={reach?.href ?? '#offer'}>
                {c.cta.label}
              </a>
              {hasVisit(c) && <Facts list={f} />}
            </div>
          </div>
        </section>
      </main>
      <footer className="foot">
        <div className="w">
          <b>{c.name}</b>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const listing: Template = {
  id: 'listing',
  label: 'Listing',
  text: 'A property listing: a large feature photo with the headline on a plate of the brand colour, key facts in ruled strips beside it, and the offer as listings, each a wide row with its price on a strip of the colour; calm, precise and premium, for estate agents, letting agents, holiday cottages and lets, venues and rooms for hire, wedding venues and serviced offices.',
  dark: false,
  css: CSS,
  Page,
}
