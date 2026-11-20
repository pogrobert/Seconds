// Label: the page feels printed and handled. The ground is a warm paper with a faint grain drawn in
// CSS (a noise filter as an inline picture). The opening is one large product label with notched
// corners and a fine inner frame, its words centred like the label on a jar; each item of the
// offer is a smaller label of its own, set a fraction off straight, with its price stamped in the
// brand colour in ink that did not take evenly. The close is a label in the brand colour. Photos
// are prints with a paper border, slightly askew; drawn art is left out and the labels take the
// space. For bakeries, coffee roasters, makers and delis.

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
  type Template,
  type TemplateProps,
} from './shared.tsx'

const ART = 'img[data-art],img[src^="data:image/svg"]'

const svg = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`
/** Paper grain: fine dark specks at low strength, tiled. */
const GRAIN = svg(
  '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .2 0 0 0 0 .15 0 0 0 0 .1 0 0 0 -1.6 1.05"/></filter><rect width="220" height="220" filter="url(#n)" opacity=".2"/></svg>',
)
/** Stamp ink: mostly solid, with small gaps where the ink did not take. */
const INK = svg(
  '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -3.2 2.6"/></filter><rect width="140" height="140" filter="url(#n)"/></svg>',
)
/** Notched corners, as on a die-cut label. */
const NOTCH = (r: string) =>
  `radial-gradient(circle at 0 0,#0000 ${r},#000 calc(${r} + .5px)) top left/51% 51% no-repeat,radial-gradient(circle at 100% 0,#0000 ${r},#000 calc(${r} + .5px)) top right/51% 51% no-repeat,radial-gradient(circle at 0 100%,#0000 ${r},#000 calc(${r} + .5px)) bottom left/51% 51% no-repeat,radial-gradient(circle at 100% 100%,#0000 ${r},#000 calc(${r} + .5px)) bottom right/51% 51% no-repeat`

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 6%,#ece4d4);--sheet:color-mix(in oklab,var(--band) 3%,#fbf8f1);--ink:color-mix(in oklab,var(--band) 32%,#1c1915);--quiet:color-mix(in oklab,var(--ink) 70%,var(--sheet));--rule:color-mix(in oklab,var(--ink) 55%,var(--sheet));--w:74rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4rem,8vw,7rem)}
body{background:var(--paper) ${GRAIN};color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:1.4rem 1.2rem;border-bottom:3px double var(--rule)}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:1.25rem;line-height:1.2;min-width:0}
.top nav{display:flex;gap:1.75rem;font-size:.95rem;flex-shrink:0}.top nav a{text-decoration:none}.top nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.lbl{position:relative;background:var(--sheet);mask:${NOTCH('var(--notch)')};-webkit-mask:${NOTCH('var(--notch)')};--notch:14px;padding:calc(var(--notch) + 1.4rem) calc(var(--notch) + 1.2rem);text-align:center}
.lbl::before{content:"";position:absolute;inset:calc(var(--notch) * .8);border:1.5px solid var(--rule);pointer-events:none}
.hero{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:clamp(2rem,5vw,4.5rem);align-items:center;padding-block:clamp(3rem,7vw,5.5rem) var(--sec)}
.hero .lbl{--notch:clamp(18px,2.5vw,28px);padding:calc(var(--notch) + clamp(2rem,4vw,3.5rem)) calc(var(--notch) + clamp(.75rem,2.5vw,2rem));rotate:-.6deg}
.hero .lbl::after{content:"";position:absolute;inset:calc(var(--notch) * .8 + 5px);border:.5px solid var(--rule);pointer-events:none}
.hero .tag{color:var(--quiet);padding-bottom:1rem;margin:0 auto 1.6rem;max-width:34ch;border-bottom:1px solid var(--rule)}
.hero h1{font-size:clamp(2.3rem,4.6vw,4.1rem);line-height:1.02;margin-bottom:1.4rem;overflow-wrap:break-word}
.hero .sub{font-size:clamp(1.05rem,1.5vw,1.25rem);color:var(--quiet);max-width:38ch;margin:0 auto 2rem}
.btn{display:inline-block;padding:.9rem 1.7rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:650;text-decoration:none}
.btn:hover{background:var(--ink);color:var(--sheet)}
.print{background:var(--sheet);padding:clamp(.5rem,1.2vw,.8rem) clamp(.5rem,1.2vw,.8rem) clamp(1.6rem,3vw,2.4rem);box-shadow:0 1px 2px color-mix(in oklab,var(--ink) 18%,transparent);rotate:1.4deg}
.print img{width:100%;object-fit:cover}
.hero .print img{aspect-ratio:4/5}
.hero:has(.print ${ART}){grid-template-columns:minmax(0,1fr);justify-items:center}.hero .print:has(${ART}){display:none}.hero:has(.print ${ART}) .lbl{max-width:46rem;width:100%}
.sec{padding-block:var(--sec)}
h2{display:flex;align-items:center;gap:1.25rem;font-size:clamp(1.9rem,3.8vw,3rem);line-height:1.08;text-align:center;margin-bottom:clamp(2rem,4vw,3rem)}
h2::before,h2::after{content:"";flex:1 1 2rem;min-width:1.5rem;border-top:3px double var(--rule)}
.about{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:clamp(2rem,6vw,5rem);align-items:center}
.about p{font-family:var(--font-heading);font-size:clamp(1.3rem,2.2vw,1.75rem);line-height:1.45;letter-spacing:var(--heading-tracking);max-width:36ch}
.about .print{rotate:-1.8deg}.about .print img{aspect-ratio:1}
.about:has(${ART}){grid-template-columns:minmax(0,1fr);justify-items:center;text-align:center}.about figure:has(${ART}){display:none}
.shelf{display:flex;flex-wrap:wrap;justify-content:center;gap:clamp(1.25rem,2.5vw,2rem)}
.shelf li{flex:1 1 17rem;max-width:min(24rem,100%);display:flex;flex-direction:column;align-items:center;gap:.6rem;rotate:-.5deg}
.shelf li:nth-child(3n+2){rotate:.6deg}.shelf li:nth-child(3n){rotate:-.2deg}
.shelf h3{font-size:clamp(1.3rem,2vw,1.55rem);line-height:1.2;overflow-wrap:break-word;max-width:100%}
.shelf p{color:var(--quiet);font-size:.98rem;max-width:30ch}
.shelf .sp{flex:1}
.stamp{display:inline-block;margin-top:.4rem;padding:.3rem .9rem;border:3px solid var(--acc);border-radius:.35rem;color:var(--acc);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.4rem,2vw,1.7rem);line-height:1.2;font-variant-numeric:tabular-nums;white-space:nowrap;rotate:-5deg;mask:${INK} 0 0/140px 140px;-webkit-mask:${INK} 0 0/140px 140px}
.shelf li:nth-child(even) .stamp{rotate:4deg;mask-position:60px 30px;-webkit-mask-position:60px 30px}
.say .lbl{--notch:20px;padding-block:calc(var(--notch) + clamp(2rem,5vw,3.5rem));rotate:.4deg}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.7rem,3.8vw,3rem);line-height:1.15;max-width:26ch;margin-inline:auto}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:2.5rem clamp(1.5rem,3vw,3rem)}
.cols li{border-top:3px double var(--rule);padding-top:1.1rem}
.cols h3{font-size:1.35rem;line-height:1.2;margin-bottom:.45rem}.cols p{color:var(--quiet)}
.n{display:grid;place-items:center;width:3.1rem;height:3.1rem;margin-bottom:1rem;border:2.5px solid var(--acc);border-radius:50%;color:var(--acc);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.35rem;rotate:-8deg;mask:${INK} 0 0/140px 140px;-webkit-mask:${INK} 0 0/140px 140px}
.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(1.5rem,4vw,3.5rem);align-items:center}
.pair .print img{aspect-ratio:4/3}.pair figure:first-child{rotate:-1.2deg}
.qa{max-width:52rem;margin-inline:auto}
.qa div{padding-block:1.3rem;border-bottom:1px dashed var(--rule)}
.qa h3{font-size:1.3rem;line-height:1.3;margin-bottom:.4rem}.qa p{color:var(--quiet);max-width:62ch}
.end{padding-block:var(--sec) 0}
.end .lbl{--notch:clamp(18px,2.5vw,26px);background:var(--acc);color:var(--on-acc);padding:calc(var(--notch) + clamp(2.5rem,5vw,4rem)) calc(var(--notch) + clamp(1rem,4vw,3.5rem));rotate:-.4deg}
.end .lbl::before{border-color:color-mix(in oklab,var(--on-acc) 55%,var(--acc))}
.end h2{display:block;font-size:clamp(2.2rem,5vw,4rem);line-height:1.02;max-width:16ch;margin-inline:auto;margin-bottom:1.2rem}
.end h2::before,.end h2::after{content:none}
.end .sub{font-size:1.15rem;max-width:40ch;margin:0 auto 2rem;opacity:.92}
.end .btn{background:var(--on-acc);color:var(--acc)}.end .btn:hover{background:transparent;color:var(--on-acc);box-shadow:inset 0 0 0 2px var(--on-acc)}
.end dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(17rem,100%),1fr));gap:1.5rem 2.5rem;max-width:42rem;margin:clamp(2.5rem,5vw,3.5rem) auto 0;padding-top:2rem;border-top:3px double color-mix(in oklab,var(--on-acc) 55%,var(--acc))}
.end dt{font-size:.9rem;opacity:.82;margin-bottom:.2rem}.end dd{font-size:1.1rem;font-weight:600;overflow-wrap:break-word}.end dd a{text-decoration:none}
.foot{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-block:2rem;font-size:.92rem;color:var(--quiet)}
@media (max-width:800px){.top nav{display:none}.hero,.about,.pair{grid-template-columns:minmax(0,1fr)}.hero .print{max-width:22rem;justify-self:center;width:100%}.about .print{max-width:18rem}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say">
        <div className="w">
          <div className="lbl">
            <p>{c.statement}</p>
          </div>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="w">
          <h2>Questions</h2>
          <div className="qa">
            {c.faq?.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="w pair">
          <figure className="print">
            <Pic photo={c.photos.d2} />
          </figure>
          <figure className="print">
            <Pic photo={c.photos.cta} />
          </figure>
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
          {l.items.map((it, n) => (
            <li key={it.title}>
              {x === 'steps' && <span className="n">{n + 1}</span>}
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
  const reach = f.find((x) => x.href)
  const list = offerItems(c)
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
      <header className="w hero">
        <div className="lbl">
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </div>
        <figure className="print">
          <Pic photo={c.photos.hero} eager />
        </figure>
      </header>
      <main>
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="w about">
            <p>{c.about}</p>
            <figure className="print">
              <Pic photo={c.photos.about} />
            </figure>
          </div>
        </section>
        <section className="sec" id="offer">
          <div className="w">
            <h2>{c.offerTitle}</h2>
            {list.length > 0 && (
              <ul className="shelf">
                {list.map((it) => (
                  <li key={it.name} className="lbl">
                    <h3>{it.name}</h3>
                    {it.detail && <p>{it.detail}</p>}
                    <span className="sp" />
                    {it.price && <span className="stamp">{it.price}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer id="visit">
        <div className="w end">
          <div className="lbl">
            <h2>{c.cta.headline}</h2>
            <p className="sub">{c.cta.subhead}</p>
            {reach && (
              <a className="btn" href={reach.href}>
                {c.cta.label}
              </a>
            )}
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
        <div className="w foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const label: Template = {
  id: 'label',
  label: 'Label',
  text: 'Printed and handled, like the labels on a shelf of jars: warm paper with a faint grain, the opening set as one large die-cut label with a fine inner frame, each item of the offer a small label of its own with its price stamped in the organisation’s colour, photos as slightly askew prints: crafted, honest and personal, for bakeries, coffee roasters, makers, delis and small producers.',
  dark: false,
  css: CSS,
  Page,
}
