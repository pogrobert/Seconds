// Outdoors: open-air and energetic. The page is a run of full-width photo bands on a light ground.
// Each band's photo melts at its foot into a solid field of the business's colour, and the type is
// set big across that seam: the headline on the opening photo, the offer's title on the
// introduction photo, the statement on a detail photo, the closing on its own photo, which runs
// on into the contact details and the footer. Between the bands the page is light and calm: the
// introduction as large type, the offer as ruled rows in two columns, points under thick rules of
// the colour, and the gallery as photos edge to edge. Boldness is spent on the bands alone.
// Without photos every band is the solid colour, the same type on it, and the page still reads as
// bands. For surf schools, climbing and outdoor centres, cabins and glamping, adventure trips and
// bike tours.

import { Fragment, type ReactNode } from 'react'
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

const ART = ':is(img[data-art],img[src^="data:image/svg"])'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:color-mix(in oklab,var(--band) 5%,#fff);--paper:color-mix(in oklab,var(--band) 4%,#fff);--soft:color-mix(in oklab,var(--band) 9%,#fff);--ink:color-mix(in oklab,var(--band) 22%,#141414);--quiet:color-mix(in oklab,var(--ink) 68%,var(--paper));--line:color-mix(in oklab,var(--band) 20%,#e4e4e0);--on-line:color-mix(in oklab,var(--on-acc) 30%,var(--acc));--w:80rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4rem,8vw,7rem);--melt:clamp(9rem,16vw,14rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6;overflow-x:clip}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;align-items:center;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.2rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.35rem;line-height:1.2;overflow-wrap:anywhere}
.top nav{display:flex;flex-wrap:wrap;gap:.4rem 1.75rem;font-size:.97rem;font-weight:600}.top nav a{text-decoration:none}.top nav a:hover{color:var(--acc);text-decoration:underline;text-underline-offset:.3em}
.btn{display:inline-block;padding:1rem 1.8rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:700;font-size:1.05rem;line-height:1.25;text-decoration:none}
.btn:hover{background:color-mix(in oklab,var(--acc) 85%,#000)}
.band .btn{background:var(--on-acc);color:var(--acc)}.band .btn:hover{background:color-mix(in oklab,var(--on-acc) 86%,var(--acc))}
.band{position:relative;isolation:isolate;background:var(--acc);color:var(--on-acc);padding-top:var(--sky)}
.band>figure{position:absolute;inset:0;z-index:-1}
.band>figure img{width:100%;height:100%;object-fit:cover}
.melt{background:linear-gradient(to bottom,transparent 0,color-mix(in oklab,var(--acc) 38%,transparent) calc(var(--melt) * .3),color-mix(in oklab,var(--acc) 80%,transparent) calc(var(--melt) * .6),var(--acc) var(--melt));padding-top:calc(var(--melt) * .62)}
.solid{background:var(--acc);box-shadow:0 -2px 0 var(--acc)}
.melt .w>*{text-shadow:0 1px 1.5rem color-mix(in oklab,var(--acc) 70%,transparent)}
.band:has(>figure ${ART}){padding-top:0}
.band>figure:has(${ART}){display:none}
.band:has(>figure ${ART}) .melt{background:none;padding-top:clamp(3.5rem,7vw,6rem)}
.hero{--sky:clamp(13rem,34vw,28rem)}
.hero .tag{font-weight:600;font-size:1.05rem;max-width:44ch;margin-bottom:1rem}
.hero h1{font-size:clamp(3rem,8.6vw,8rem);line-height:.92;max-width:15ch;overflow-wrap:break-word}
.base{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:1.5rem clamp(2rem,5vw,5rem);align-items:end;padding-block:clamp(1.75rem,3.5vw,2.75rem) clamp(3rem,6vw,5rem)}
.base .sub{font-size:clamp(1.12rem,1.6vw,1.35rem);max-width:40ch}
.base .btn{justify-self:end}
.sec{padding-block:var(--sec)}
.lead{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.5rem,2.7vw,2.3rem);line-height:1.3;max-width:34ch}
.chap{--sky:clamp(11rem,26vw,22rem)}
.chap h2,.end h2{font-size:clamp(2.5rem,6vw,5.4rem);line-height:.95;max-width:16ch;overflow-wrap:break-word;padding-bottom:clamp(2rem,4vw,3.25rem)}
.chap+.sec{padding-top:calc(var(--sec) * .6)}
.offer{columns:2 24rem;column-gap:clamp(2.5rem,6vw,6rem)}
.offer>div{break-inside:avoid;margin-bottom:clamp(1.5rem,3vw,2.5rem)}
.offer>div:last-child{margin-bottom:0}
.grp{font-size:clamp(1.3rem,2vw,1.6rem);line-height:1.2;color:var(--acc);padding-bottom:.75rem}
.rows li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.3rem 1.5rem;padding-block:1.15rem;border-top:1px solid var(--line);break-inside:avoid}
.rows li:last-child{border-bottom:1px solid var(--line)}
.rows h3{font-size:clamp(1.2rem,1.7vw,1.4rem);line-height:1.2;overflow-wrap:anywhere}
.rows .pr{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.15rem,1.6vw,1.35rem);line-height:1.2;color:var(--acc);font-variant-numeric:tabular-nums;text-align:end;max-width:12rem;overflow-wrap:anywhere}
.rows p{grid-column:1/-1;color:var(--quiet);max-width:52ch}
h2{font-size:clamp(2rem,4vw,3.3rem);line-height:1.02;max-width:20ch;overflow-wrap:break-word;margin-bottom:clamp(2rem,4vw,3rem)}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:2.5rem clamp(1.5rem,3vw,3rem)}
.cols li{border-top:.4rem solid var(--acc);padding-top:1.25rem}
.cols h3{font-size:clamp(1.3rem,1.9vw,1.55rem);line-height:1.15;margin-bottom:.55rem}
.cols p{color:var(--quiet);max-width:42ch}
.n{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(2.8rem,4.5vw,3.8rem);line-height:.9;color:var(--acc);margin-bottom:.9rem;font-variant-numeric:lining-nums}
.say{--sky:clamp(12rem,28vw,24rem)}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(2rem,4.4vw,3.9rem);line-height:1.05;max-width:22ch;overflow-wrap:break-word;padding-bottom:clamp(3rem,6vw,5rem)}
.band h2{margin-bottom:0}
.strip{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr)}
.strip img{width:100%;aspect-ratio:4/3;object-fit:cover}
.strip:has(${ART}) img,.strip:has(figure:only-child) img{aspect-ratio:21/9}
.qa{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:1rem clamp(2rem,5vw,5rem);align-items:start}
.qa h2{margin-bottom:0}
.qa div div{padding-block:1.3rem;border-top:1px solid var(--line)}
.qa div div:last-child{border-bottom:1px solid var(--line)}
.qa h3{font-size:clamp(1.2rem,1.7vw,1.4rem);line-height:1.25;margin-bottom:.45rem}
.qa p{color:var(--quiet);max-width:62ch}
.end{--sky:clamp(13rem,30vw,26rem)}
.end .melt h2{padding-bottom:1.5rem}
.end .sub{font-size:clamp(1.12rem,1.6vw,1.3rem);max-width:40ch;margin-bottom:2rem}
.end .act{padding-bottom:clamp(3rem,6vw,5rem)}
.end dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr));gap:1.5rem 2.5rem;padding-bottom:clamp(3rem,6vw,5rem)}
.end dl>div{border-top:2px solid var(--on-line);padding-top:.85rem}
.end dt{font-size:.92rem;font-weight:600;opacity:.82;margin-bottom:.2rem}
.end dd{font-size:1.1rem;overflow-wrap:anywhere}
.end dd a{text-decoration:none;border-bottom:1px solid currentColor}
.foot{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.6rem;border-top:1px solid var(--on-line);font-size:.92rem}
.foot span{opacity:.85}
@media (max-width:820px){.hero{--sky:17rem}.chap,.say,.end{--sky:12rem}.top nav{display:none}.base{grid-template-columns:minmax(0,1fr)}.base .btn{justify-self:start}.qa{grid-template-columns:minmax(0,1fr)}.qa h2{margin-bottom:1rem}.offer{columns:1}}`

function Band({
  className,
  photo,
  id,
  eager,
  children,
}: {
  className: string
  photo: TemplateProps['c']['photos']['hero']
  id?: string
  eager?: boolean
  children: ReactNode
}) {
  return (
    <section className={`band ${className}`} id={id}>
      <figure>
        <Pic photo={photo} eager={eager} />
      </figure>
      {children}
    </section>
  )
}

function Extras({ c, x, d1Free }: { c: TemplateProps['c']; x: Extra; d1Free: boolean }) {
  if (x === 'statement')
    return (
      <Band className="say" photo={c.photos.d1}>
        <div className="melt">
          <div className="w">
            <p>{c.statement}</p>
          </div>
        </div>
      </Band>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="w qa">
          <h2>Questions</h2>
          <div>
            <FaqList faq={c.faq} />
          </div>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="strip">
        {d1Free && (
          <figure>
            <Pic photo={c.photos.d1} />
          </figure>
        )}
        <figure>
          <Pic photo={c.photos.d2} />
        </figure>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="sec">
      <div className="w">
        <h2>{l.title}</h2>
        <ol className="cols">
          <ListItems items={l.items} numbered={x === 'steps'} />
        </ol>
      </div>
    </section>
  )
}

type Item = { name: string; detail?: string; price?: string }

function Rows({ list }: { list: Item[] }) {
  return (
    <ul className="rows">
      {list.map((it) => (
        <li key={it.name}>
          <h3>{it.name}</h3>
          {it.price ? <span className="pr">{it.price}</span> : <span />}
          {it.detail && <p>{it.detail}</p>}
        </li>
      ))}
    </ul>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = reachOf(f)
  const all = offerItems(c)
  const groups = c.prices.filter((g) => g.items.length)
  const named = groups.filter((g) => g.group).length > 1
  // The detail photo carries the statement when there is one; otherwise it joins the gallery.
  const d1Free = !xs.includes('statement')
  return (
    <>
      <div className="w top">
        <b>{c.name}</b>
        <nav>
          <NavLinks links={links(c, extras)} />
        </nav>
      </div>
      <main>
        <Band className="hero" photo={c.photos.hero} eager>
          <div className="melt">
            <div className="w">
              <p className="tag">{c.tagline}</p>
              <h1>{c.headline}</h1>
            </div>
          </div>
          <div className="solid">
            <div className="w base">
              <p className="sub">{c.subhead}</p>
              <a className="btn" href="#visit">
                {c.cta.label}
              </a>
            </div>
          </div>
        </Band>
        <section className="sec">
          <div className="w">
            <p className="lead">{c.about}</p>
          </div>
        </section>
        {all.length > 0 && (
          <>
            <Band className="chap" photo={c.photos.about} id="offer">
              <div className="melt">
                <div className="w">
                  <h2>{c.offerTitle}</h2>
                </div>
              </div>
            </Band>
            <section className="sec">
              <div className="w offer">
                {named ? (
                  groups.map((g, i) => (
                    <div key={g.group || i}>
                      {g.group && <h3 className="grp">{g.group}</h3>}
                      <Rows list={g.items} />
                    </div>
                  ))
                ) : (
                  <Rows list={all} />
                )}
              </div>
            </section>
          </>
        )}
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} d1Free={d1Free} />
          </Fragment>
        ))}
      </main>
      <footer className="band end" id="visit">
        <figure>
          <Pic photo={c.photos.cta} />
        </figure>
        <div className="melt">
          <div className="w">
            <h2>{c.cta.headline}</h2>
          </div>
        </div>
        <div className="solid">
          <div className="w">
            <div className="act">
              <p className="sub">{c.cta.subhead}</p>
              {reach && (
                <a className="btn" href={reach.href}>
                  {c.cta.label}
                </a>
              )}
            </div>
            {hasVisit(c) && (
              <dl>
                <FactRows facts={f} />
              </dl>
            )}
            <div className="foot">
              <b>{c.name}</b>
              <span>{c.tagline}</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export const outdoors: Template = {
  id: 'outdoors',
  label: 'Outdoors',
  text: "Open-air and energetic: full-width photo bands that melt into the organisation's own colour, with big bold type set across the seam, and light, airy sections between them for the offer and the details; for surf schools, climbing and outdoor activity centres, cabins and glamping, adventure trips, bike tours and other outdoor businesses.",
  dark: false,
  css: CSS,
  Page,
}
