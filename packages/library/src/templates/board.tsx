// Board: the page is a menu board hung on a wall. The ground is a deep shade of the business's
// colour, the type is pale like chalk, and a thin double frame runs round the whole board. The
// name sits centred at the top like a painted sign; the offer is the point of the page, written
// large in framed panels (one per group the owner gave), names on the left and prices in a light
// tint of the brand colour on the right. Everything else is centred and calm under it. Needs no
// photos: a real one hangs in its own thin frame; drawn art is left out. Square corners. For
// cafés, pubs, food trucks and bakeries.

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

const ART = 'img[data-art],img[src^="data:image/svg"]'

const CSS = `${RESET}
:root{color-scheme:dark;--board:color-mix(in oklab,var(--band) 50%,#0c0c0c);--wall:color-mix(in oklab,var(--band) 30%,#080808);--chalk:color-mix(in oklab,var(--band) 5%,#f3efe7);--dim:color-mix(in oklab,var(--chalk) 72%,var(--board));--hi:color-mix(in oklab,var(--band) 30%,#f6e9cf);--line:color-mix(in oklab,var(--chalk) 32%,var(--board));--frame:color-mix(in oklab,var(--chalk) 60%,var(--board));--w:74rem;--gut:clamp(1.1rem,4vw,3rem);--sec:clamp(3.5rem,7vw,6rem);--edge:clamp(.4rem,1.2vw,.9rem)}
body{background:var(--wall);color:var(--chalk);font-size:1.0625rem;line-height:1.6;padding:var(--edge)}
.fr{background:var(--board);border:2px solid var(--frame);box-shadow:inset 0 0 0 clamp(.3rem,.8vw,.5rem) var(--board),inset 0 0 0 calc(clamp(.3rem,.8vw,.5rem) + 1px) var(--line);min-height:calc(100vh - 2 * var(--edge))}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{text-align:center;padding-block:clamp(2.2rem,5vw,3.5rem) 0}
.top b{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.6rem,3.6vw,2.6rem);line-height:1.1;color:var(--hi);overflow-wrap:break-word}
.top nav{display:flex;justify-content:center;flex-wrap:wrap;gap:.4rem 2rem;margin-top:1.1rem;padding-block:.7rem;border-block:1px solid var(--line);font-size:.95rem;color:var(--dim)}
.top nav a{text-decoration:none}.top nav a:hover{color:var(--chalk);text-decoration:underline;text-underline-offset:.3em}
.hero{text-align:center;padding-block:clamp(3rem,7vw,5.5rem) var(--sec)}
.hero .tag{color:var(--dim);margin-bottom:1.25rem}
.hero h1{font-size:clamp(2.5rem,6.5vw,5.6rem);line-height:1;max-width:16ch;margin-inline:auto;margin-bottom:1.5rem;overflow-wrap:break-word}
.hero .sub{font-size:clamp(1.1rem,1.6vw,1.3rem);color:var(--dim);max-width:42ch;margin-inline:auto;margin-bottom:2.25rem}
.btn{display:inline-block;padding:.95rem 1.8rem;border:2px solid var(--chalk);border-radius:var(--button-radius);color:var(--chalk);font-weight:650;text-decoration:none}
.btn:hover{background:var(--chalk);color:var(--board)}
.pic{border:1px solid var(--line);padding:clamp(.4rem,1vw,.7rem)}
.pic img{width:100%;object-fit:cover}
.hp{max-width:58rem;margin:clamp(3rem,6vw,4.5rem) auto 0}.hp img{aspect-ratio:16/9}
.hp:has(${ART}){display:none}
.sec{padding-block:var(--sec)}
.rule{width:4rem;height:2px;background:var(--line);margin:0 auto}
h2{font-size:clamp(2rem,4.5vw,3.6rem);line-height:1.05;text-align:center;margin-bottom:clamp(2rem,4vw,3rem)}
.about p{font-size:clamp(1.2rem,2vw,1.55rem);line-height:1.5;text-align:center;max-width:44ch;margin:2.5rem auto}
.panels{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(28rem,100%),1fr));gap:clamp(1rem,2.5vw,2rem)}
.panel{border:2px solid var(--line);padding:clamp(1.4rem,3.5vw,2.75rem)}
.panels>.panel:last-child:nth-child(odd){grid-column:1/-1}.panels>.panel:last-child:nth-child(odd) .items{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(24rem,100%),1fr));column-gap:clamp(2rem,5vw,4.5rem)}
.panel h3.g{font-size:clamp(1.3rem,2.2vw,1.7rem);color:var(--hi);text-align:center;padding-bottom:1rem;margin-bottom:.5rem;border-bottom:1px solid var(--line)}
.items li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.25rem 1.5rem;align-items:baseline;padding-block:1.15rem;border-bottom:1px dashed var(--line)}
.items h4{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.45rem,2.6vw,2.1rem);line-height:1.1;margin:0;overflow-wrap:break-word}
.items .price{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.35rem,2.4vw,1.9rem);line-height:1.1;color:var(--hi);font-variant-numeric:tabular-nums;white-space:nowrap}
.items p{grid-column:1/-1;color:var(--dim);max-width:50ch}
.say{text-align:center}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.9rem,4.4vw,3.6rem);line-height:1.12;color:var(--hi);max-width:24ch;margin-inline:auto;padding-block:clamp(2rem,4vw,3rem);border-block:1px solid var(--line)}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:2rem clamp(1.5rem,3vw,3rem);text-align:center}
.cols h3{font-size:1.4rem;line-height:1.2;margin-bottom:.45rem}.cols p{color:var(--dim);max-width:34ch;margin-inline:auto}
.n{display:grid;place-items:center;width:3rem;height:3rem;margin:0 auto 1rem;border:2px solid var(--hi);border-radius:50%;color:var(--hi);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.3rem}
.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(1rem,2.5vw,2rem)}
.pair img{aspect-ratio:4/3;height:100%}
.qa{max-width:52rem;margin-inline:auto}
.qa div{padding-block:1.3rem;border-bottom:1px dashed var(--line)}
.qa h3{font-size:1.3rem;line-height:1.3;margin-bottom:.4rem}.qa p{color:var(--dim);max-width:62ch}
.end{text-align:center;padding-block:var(--sec) 0}
.end h2{font-size:clamp(2.3rem,5.5vw,4.4rem);line-height:1;max-width:16ch;margin-inline:auto;margin-bottom:1.25rem}
.end .sub{color:var(--dim);font-size:1.15rem;max-width:40ch;margin:0 auto 2rem}
.end dl{max-width:44rem;margin:clamp(2.5rem,5vw,3.5rem) auto 0;text-align:start}
.end dl div{display:grid;grid-template-columns:minmax(0,8rem) minmax(0,1fr);gap:1.5rem;padding-block:1rem;border-bottom:1px dashed var(--line)}
.end dl div:first-child{border-top:1px solid var(--line)}
.end dt{color:var(--dim)}.end dd{font-family:var(--font-heading);font-size:1.2rem;overflow-wrap:break-word}.end dd a{text-decoration:none}.end dd a:hover{text-decoration:underline}
.foot{display:flex;justify-content:space-between;gap:.5rem 1.5rem;flex-wrap:wrap;margin-top:var(--sec);padding-block:1.5rem 2rem;border-top:1px solid var(--line);color:var(--dim);font-size:.92rem}
@media (max-width:700px){.pair{grid-template-columns:minmax(0,1fr)}.end dl div{grid-template-columns:minmax(0,1fr);gap:.1rem}.items li{grid-template-columns:minmax(0,1fr)}}`

/** The owner's groups, each a panel; a group with no name keeps the panel without a heading. */
const groups = (c: TemplateProps['c']) => c.prices.filter((g) => g.items.length)

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
          <figure className="pic">
            <Pic photo={c.photos.d2} />
          </figure>
          <figure className="pic">
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
  const gs = groups(c)
  return (
    <div className="fr">
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
        <p className="tag">{c.tagline}</p>
        <h1>{c.headline}</h1>
        <p className="sub">{c.subhead}</p>
        <a className="btn" href="#visit">
          {c.cta.label}
        </a>
        <figure className="pic hp">
          <Pic photo={c.photos.hero} eager />
        </figure>
      </header>
      <main>
        <section className="sec about" style={{ paddingTop: 0 }}>
          <div className="w">
            <div className="rule" />
            <p>{c.about}</p>
            <div className="rule" />
          </div>
        </section>
        <section className="sec" id="offer">
          <div className="w">
            <h2>{c.offerTitle}</h2>
            {gs.length > 0 && (
              <div className="panels">
                {gs.map((g, i) => (
                  <div className="panel" key={i}>
                    {g.group && <h3 className="g">{g.group}</h3>}
                    <ul className="items">
                      {g.items.map((it) => (
                        <li key={it.name}>
                          <h4>{it.name}</h4>
                          {it.price ? <span className="price">{it.price}</span> : <span />}
                          {it.detail && <p>{it.detail}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
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
          <div className="foot">
            <span>{c.name}</span>
            <span>{c.tagline}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const board: Template = {
  id: 'board',
  label: 'Board',
  text: 'A menu board hung on the wall: a deep shade of the organisation’s colour with pale chalk-like type inside a thin double frame, the name centred like a painted sign, and the offer written large in framed panels with prices in a light tint: warm, casual and straight to the point, needing no photos, for cafés, pubs, food trucks, bakeries and takeaways.',
  dark: true,
  css: CSS,
  Page,
}
