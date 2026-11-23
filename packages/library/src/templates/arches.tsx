// Arches: soft and classic. Every photo stands in a round-topped arch with a fine outline arch
// set just behind it, like a window and its shadow line; the offer and the closing sit in wide
// arched panels, like doorways. The colours are pale and deep shades of the business's own
// colour (a coral gives blush, a green gives sage), never a stock cream. Words are centred and
// calm. With no photos the arches stay as outlines: a slim arch over the headline and over each
// item, and the panels carry the page. For florists, wedding services, beauty salons, bridal
// shops and stationers.

import { Fragment } from 'react'
import {
  type Extra,
  FactRows,
  FaqDetails,
  facts,
  hasVisit,
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
const REAL = 'img:not([data-art]):not([src^="data:image/svg"])'

const CSS = `${RESET}
:root{--acc:color-mix(in oklab,var(--band) 90%,#000);--on-acc:var(--band-foreground);--pale:color-mix(in oklab,var(--band) 9%,#fff);--blush:color-mix(in oklab,var(--band) 19%,#fff);--ink:color-mix(in oklab,var(--band) 45%,#141414);--quiet:color-mix(in oklab,var(--ink) 70%,var(--pale));--line:color-mix(in oklab,var(--band) 32%,#fff);--top:100vmax 100vmax 0 0;--w:70rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4.5rem,9vw,8rem);--rise:clamp(5rem,16vw,13rem)}
body{background:var(--pale);color:var(--ink);font-size:1.0625rem;line-height:1.7}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.t{max-width:calc(38rem + 2 * var(--gut));margin-inline:auto;padding-inline:var(--gut);text-align:center}
.top{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1.5rem;padding-block:1.6rem}
.top b{grid-column:2;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.35rem;line-height:1.2;text-align:center}
.top nav{grid-column:3;justify-self:end;display:flex;gap:1.5rem;font-size:.95rem}.top nav a{text-decoration:none;color:var(--quiet)}.top nav a:hover{color:var(--ink)}
.arch{position:relative;isolation:isolate}
.arch img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:var(--top)}
.arch::before{content:"";position:absolute;inset:-.9rem .9rem .9rem -.9rem;border:1px solid var(--acc);border-radius:var(--top);z-index:-1}
.key{display:none;width:2.6rem;height:3.6rem;margin:0 auto 1.75rem;border:1px solid var(--acc);border-bottom:0;border-radius:var(--top)}
.open{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2.5rem,7vw,7rem);align-items:center;padding-block:clamp(2rem,5vw,4rem) var(--sec)}
.open .copy{text-align:center}
.open .tag{color:var(--acc);margin-bottom:1rem}
.open h1{font-size:clamp(2.4rem,4.8vw,4.3rem);line-height:1.08;margin-bottom:1.25rem}
.open .sub{color:var(--quiet);font-size:clamp(1.05rem,1.4vw,1.2rem);max-width:36ch;margin:0 auto 2.25rem}
.open .arch{max-width:30rem;width:100%;justify-self:center}
.open:has(.arch ${ART}){grid-template-columns:minmax(0,1fr);padding-block:clamp(3.5rem,8vw,7rem) var(--sec)}
.open:has(.arch ${ART}) .arch{display:none}
.open:has(.arch ${ART}) .key{display:block}
.open:has(.arch ${ART}) h1{font-size:clamp(2.6rem,6vw,5rem);max-width:18ch;margin-inline:auto}
.btn{display:inline-block;padding:.95rem 1.8rem;background:var(--acc);color:var(--on-acc);border-radius:var(--button-radius);text-decoration:none;font-weight:600}
.sec{padding-block:var(--sec)}
.about{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,6fr);gap:clamp(2.5rem,7vw,7rem);align-items:center}
.about .arch{max-width:24rem;width:100%;justify-self:center}
.about:has(${ART}){grid-template-columns:minmax(0,1fr)}.about .arch:has(${ART}){display:none}
.lead{font-family:var(--font-heading);font-size:clamp(1.35rem,2.3vw,1.85rem);line-height:1.5;letter-spacing:var(--heading-tracking);max-width:34ch;margin-inline:auto;text-align:center}
h2{font-size:clamp(1.9rem,3.4vw,2.8rem);line-height:1.12;margin-bottom:clamp(2rem,4vw,3rem);text-align:center}
.panel{max-width:62rem;margin-inline:auto;background:var(--blush);border-radius:50% 50% 0 0/var(--rise) var(--rise) 0 0;padding:calc(var(--rise) * .62) clamp(1.25rem,5vw,4.5rem) clamp(3.5rem,7vw,5.5rem)}
.menu{display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:2.25rem clamp(2rem,5vw,4rem);text-align:center}
.menu h3{font-size:1.3rem;line-height:1.3}
.menu p{color:var(--quiet);margin-top:.25rem;max-width:34ch;margin-inline:auto}
.menu .price{display:block;margin-top:.45rem;color:var(--acc);font-variant-numeric:tabular-nums;font-weight:600}
.arcade{display:grid;gap:clamp(1.5rem,4vw,3.5rem);align-items:start;padding-inline:1rem}
.arcade.pair{grid-template-columns:repeat(2,minmax(0,1fr));max-width:52rem}
.arcade.three{grid-template-columns:repeat(3,minmax(0,1fr))}
.arcade figure:nth-child(2){margin-top:clamp(2rem,6vw,5rem)}
.three figure:nth-child(2){margin-top:0}.three figure:nth-child(odd){margin-top:clamp(2rem,6vw,5rem)}
section .arcade:has(${ART}){max-width:26rem}
section .arcade.pair:has(${ART}) img,section .arcade.three:has(${ART}) img{aspect-ratio:3/4!important}
section .arcade.three:has(${ART}):has(figure:nth-child(2) ${REAL}):has(figure:nth-child(odd) ${REAL}){max-width:52rem}
.say p{font-family:var(--font-heading);font-size:clamp(1.8rem,3.8vw,3.1rem);line-height:1.22;letter-spacing:var(--heading-tracking);max-width:24ch;margin-inline:auto;text-wrap:balance}
.say .key{display:block}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:2.75rem clamp(1.5rem,4vw,3.5rem);text-align:center}
.cols .mk{display:grid;place-items:center;width:2.4rem;height:3.1rem;margin:0 auto 1.1rem;border:1px solid var(--acc);border-bottom:0;border-radius:var(--top);font-family:var(--font-heading);font-size:1.15rem;color:var(--acc);padding-top:.35rem}
.cols h3{font-size:1.3rem;line-height:1.25;margin-bottom:.45rem}.cols p{color:var(--quiet);max-width:32ch;margin-inline:auto}
.faq{text-align:start}
.faq details{border-top:1px solid var(--line);padding-block:1.15rem}.faq details:last-child{border-bottom:1px solid var(--line)}
.faq summary{font-family:var(--font-heading);font-size:1.2rem;display:flex;justify-content:space-between;gap:1rem}
.faq summary::after{content:"+";color:var(--acc);flex:none}.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.6rem}
.end{padding-top:var(--sec)}
.end .panel{background:var(--acc);color:var(--on-acc);text-align:center;max-width:64rem}
.end h2{font-size:clamp(2.1rem,4.4vw,3.6rem);line-height:1.08;margin-bottom:1.1rem}
.end .sub{opacity:.9;font-size:1.12rem;max-width:38ch;margin:0 auto 2.25rem}
.end .btn{background:var(--on-acc);color:var(--acc)}
.end dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.75rem 2.5rem;max-width:40rem;margin-inline:auto;margin-top:clamp(2.75rem,5vw,4rem);padding-top:2.25rem;border-top:1px solid color-mix(in oklab,var(--on-acc) 30%,transparent)}
.end dt{font-size:.9rem;opacity:.78;margin-bottom:.2rem}.end dd{font-family:var(--font-heading);font-size:1.12rem;line-height:1.4;overflow-wrap:break-word}.end dd a{text-decoration:none;border-bottom:1px solid color-mix(in oklab,var(--on-acc) 45%,transparent)}
.foot{text-align:center;padding:2.25rem var(--gut) 2.5rem;color:var(--quiet);font-size:.92rem}
.foot b{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.2rem;color:var(--ink);margin-bottom:.25rem}
@media (max-width:760px){.top{grid-template-columns:1fr}.top b{grid-column:1}.top nav{display:none}.open,.about{grid-template-columns:minmax(0,1fr)}.open .arch{max-width:19rem}.about .arch{max-width:16rem}.arcade.three{grid-template-columns:repeat(2,minmax(0,1fr))}.arcade.three figure:nth-child(3){display:none}.three figure:nth-child(odd),.arcade figure:nth-child(2){margin-top:0}.arcade.pair figure:nth-child(2),.arcade.three figure:nth-child(2){margin-top:2.5rem}.panel{padding-inline:1.25rem}.end dl{grid-template-columns:minmax(0,1fr)}}`

function Arch({ photo, eager }: { photo: TemplateProps['c']['photos']['hero']; eager?: boolean }) {
  return (
    <figure className="arch">
      <Pic photo={photo} eager={eager} />
    </figure>
  )
}

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say">
        <div className="t" style={{ maxWidth: '60rem' }}>
          <span className="key" aria-hidden="true" />
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="t faq">
          <h2>Questions</h2>
          <FaqDetails faq={c.faq} />
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="w arcade three">
          <Arch photo={c.photos.d1} />
          <Arch photo={c.photos.cta} />
          <Arch photo={c.photos.d2} />
        </div>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="sec">
      <div className="w">
        <h2>{l.title}</h2>
        <ol className="cols">
          {l.items.map((it, i) => (
            <li key={it.title}>
              {x === 'steps' && <span className="mk">{i + 1}</span>}
              <h3>{it.title}</h3>
              <p>{it.body}</p>
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
  const reach = reachOf(f)
  const gal = xs.includes('gallery')
  return (
    <>
      <div className="w top">
        <b>{c.name}</b>
        <nav>
          <NavLinks links={links(c, extras)} />
        </nav>
      </div>
      <header className="w open">
        <div className="copy">
          <span className="key" aria-hidden="true" />
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </div>
        <Arch photo={c.photos.hero} eager />
      </header>
      <main>
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="w about">
            <Arch photo={c.photos.about} />
            <p className="lead">{c.about}</p>
          </div>
        </section>
        <section id="offer">
          <div className="w">
            <div className="panel">
              <h2>{c.offerTitle}</h2>
              <ul className="menu">
                {offerItems(c).map((it) => (
                  <li key={it.name}>
                    <h3>{it.name}</h3>
                    {it.detail && <p>{it.detail}</p>}
                    {it.price && <span className="price">{it.price}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        {!gal && (
          <section className="sec">
            <div className="w arcade pair">
              <Arch photo={c.photos.d1} />
              <Arch photo={c.photos.d2} />
            </div>
          </section>
        )}
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
        <div className="w">
          <div className="panel">
            <h2>{c.cta.headline}</h2>
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
          </div>
        </div>
        <div className="foot">
          <b>{c.name}</b>
          {c.tagline}
        </div>
      </footer>
    </>
  )
}

export const arches: Template = {
  id: 'arches',
  label: 'Arches',
  text: "Soft and classic: photos in round-topped arches with a fine outline arch behind each, the offer and the closing in wide arched panels, centred calm words and pale and deep shades of the organisation's own colour: romantic, graceful and gentle, for florists, wedding services, beauty salons, bridal shops and stationers.",
  dark: false,
  css: CSS,
  Page,
}
