// Spines: the offer stands on a shelf like books or record sleeves. Each group the owner gave is a
// shelf; each item is a spine with its name set sideways, the spines in varied widths, heights and
// tints of the business's colour, a pair of fine bands near each end, and the last one leaning on
// its neighbour. The spines are a picture only: under each shelf the same items are read again
// in a plain list, each with a small swatch of its spine's tint, the detail and the price. On a
// phone the spines lie flat as a stack. The same wooden shelf edge runs under the opening and
// under every photo. Square corners on warm paper. For bookshops, record shops, libraries and
// collectors.

import { type CSSProperties, Fragment } from 'react'
import {
  type Extra,
  facts,
  hasVisit,
  links,
  listOf,
  Pic,
  present,
  RESET,
  reachOf,
  type Template,
  type TemplateProps,
} from './shared.tsx'

const ART = 'img[data-art],img[src^="data:image/svg"]'

/** Five spine looks, repeated: background and text colour, width and height. */
const TINTS = ['var(--acc)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--s5)']

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 4%,#f6f2ea);--card:color-mix(in oklab,var(--band) 2%,#fcfaf5);--ink:color-mix(in oklab,var(--band) 28%,#1b1916);--quiet:color-mix(in oklab,var(--ink) 70%,var(--paper));--line:color-mix(in oklab,var(--band) 20%,#ded6c8);--wood:color-mix(in oklab,var(--band) 40%,#4a3523);--plank:clamp(.7rem,1.2vw,.95rem);--back:color-mix(in oklab,var(--band) 9%,#e9e1d2);--s2:color-mix(in oklab,var(--band) 68%,#000);--s3:color-mix(in oklab,var(--band) 20%,#f1eadc);--s4:color-mix(in oklab,var(--band) 42%,#efe6d4);--s5:color-mix(in oklab,var(--ink) 88%,var(--band));--w:72rem;--gut:clamp(1.1rem,4vw,3rem);--sec:clamp(4rem,8vw,6.5rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding-block:1.5rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.25rem,2.2vw,1.6rem);line-height:1.15;overflow-wrap:break-word;min-width:0}
.top nav{display:flex;gap:1.6rem;font-size:.95rem;flex:none}
.top nav a{text-decoration:none}.top nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.edge{border-bottom:var(--plank) solid var(--wood)}
.hero{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2rem,5vw,4.5rem);align-items:end;padding-top:clamp(2rem,5vw,4rem)}
.hero .tx{padding-bottom:clamp(2rem,4vw,3.25rem)}
.hero .tag{color:var(--quiet);margin-bottom:1.1rem}
.hero h1{font-size:clamp(2.5rem,5.4vw,4.8rem);line-height:1.02;margin-bottom:1.4rem;overflow-wrap:break-word}
.hero .sub{font-size:clamp(1.08rem,1.5vw,1.25rem);color:var(--quiet);max-width:40ch;margin-bottom:2rem}
.hero img{width:100%;aspect-ratio:4/5;object-fit:cover}
.hero:has(figure ${ART}){grid-template-columns:minmax(0,1fr)}.hero figure:has(${ART}){display:none}
.hero:has(figure ${ART}) h1{max-width:18ch}
.btn{display:inline-block;padding:.95rem 1.7rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:650;text-decoration:none}
.btn:hover{background:var(--s2)}
.sec{padding-block:var(--sec)}
h2{font-size:clamp(1.9rem,3.6vw,3rem);line-height:1.08;margin-bottom:clamp(1.75rem,3vw,2.5rem);max-width:24ch}
.about{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:clamp(2rem,5vw,5rem);align-items:end}
.about p{font-family:var(--font-heading);font-size:clamp(1.3rem,2.2vw,1.8rem);line-height:1.42;letter-spacing:var(--heading-tracking);max-width:36ch;padding-bottom:1rem}
.about img{width:100%;aspect-ratio:4/5;object-fit:cover}
.about:has(${ART}){grid-template-columns:minmax(0,1fr)}.about figure:has(${ART}){display:none}
.grp+.grp{margin-top:clamp(2.5rem,5vw,3.5rem)}
.grp>h3{font-size:clamp(1.3rem,2vw,1.6rem);line-height:1.2;margin-bottom:1.25rem}
.case{background:var(--back);border:var(--plank) solid var(--wood);border-bottom:0;margin-bottom:clamp(2.5rem,5vw,3.5rem)}
.shelf{display:flex;align-items:flex-end;gap:3px;padding-inline:clamp(.75rem,2.5vw,2rem) clamp(2.5rem,6vw,5rem);overflow-x:auto;overflow-y:hidden;padding-top:clamp(1.5rem,3vw,2.5rem)}
.sp.ng{margin-inline-start:clamp(1.25rem,3vw,2.5rem)}
.sp{flex:none;writing-mode:vertical-rl;inline-size:var(--h);min-block-size:var(--b);padding:2.3rem .55rem;position:relative;background:var(--bg);color:var(--fg);font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.05rem,1.4vw,1.25rem);line-height:1.2;text-align:center;overflow-wrap:break-word}
.sp::before,.sp::after{content:"";position:absolute;left:.35rem;right:.35rem;height:.45rem;border-block:1px solid currentColor;opacity:.5}
.sp::before{top:.8rem}.sp::after{bottom:.8rem}
.sp:last-child:not(:first-child){rotate:5deg;transform-origin:0 100%;margin-inline-start:.4rem}
.list{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(20rem,100%),1fr));gap:0 clamp(2rem,5vw,4rem)}
.list li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:.15rem 1rem;align-items:baseline;padding-block:1rem;border-bottom:1px solid var(--line)}
.sw{inline-size:.75rem;block-size:1.1rem;background:var(--bg);translate:0 .15rem}
.list h4{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.2rem;line-height:1.25;margin:0;overflow-wrap:break-word}
.list .pr{font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
.list p{grid-column:2/-1;color:var(--quiet);font-size:.95rem}
.side{margin-top:clamp(3.5rem,7vw,5rem)}
.side img{width:100%;aspect-ratio:21/9;object-fit:cover}
.side:has(${ART}){display:none}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.8rem,4vw,3.3rem);line-height:1.14;max-width:24ch;padding-bottom:clamp(1.75rem,3.5vw,2.5rem);text-wrap:balance}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(14rem,100%),1fr));gap:2.25rem clamp(1.5rem,3vw,2.5rem)}
.cols li{border-top:1px solid var(--line);padding-top:1.2rem}
.cols h3{font-size:1.3rem;line-height:1.25;margin-bottom:.45rem}.cols p{color:var(--quiet)}
.n{display:inline-grid;place-items:center;inline-size:2.2rem;block-size:2.9rem;margin-bottom:.9rem;background:var(--acc);color:var(--on-acc);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.15rem}
.pair{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,4fr);gap:clamp(1rem,2.5vw,2rem);align-items:end}
.pair img{width:100%;aspect-ratio:4/3;object-fit:cover}.pair figure:last-child img{aspect-ratio:4/5}
.qa{max-width:52rem}
.qa details{border-bottom:1px solid var(--line)}.qa details:first-child{border-top:1px solid var(--line)}
.qa summary{display:flex;justify-content:space-between;gap:1.5rem;padding-block:1.15rem;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:1.2rem;line-height:1.3}
.qa summary::after{content:"+";flex:none;font-size:1.3rem;line-height:1}
.qa details[open] summary::after{content:"−"}
.qa p{color:var(--quiet);max-width:62ch;padding-bottom:1.25rem}
.end{background:var(--acc);color:var(--on-acc);border-top:var(--plank) solid var(--wood)}
.end .cl{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2rem,5vw,5rem);padding-block:var(--sec)}
.end h2{font-size:clamp(2.2rem,4.6vw,3.8rem);line-height:1.04;margin-bottom:1.25rem}
.end .sub{font-size:1.15rem;opacity:.92;max-width:38ch;margin-bottom:2rem}
.end .btn{background:var(--on-acc);color:var(--acc)}.end .btn:hover{background:var(--card)}
.end dl{display:grid;align-content:start}
.end dl div{display:grid;grid-template-columns:minmax(0,6.5rem) minmax(0,1fr);gap:1rem;padding-block:.9rem;border-bottom:1px solid color-mix(in oklab,var(--on-acc) 32%,var(--acc))}
.end dl div:first-child{border-top:1px solid color-mix(in oklab,var(--on-acc) 32%,var(--acc))}
.end dt{opacity:.85}.end dd{font-size:1.08rem;overflow-wrap:break-word}.end dd a{text-decoration:none;border-bottom:1px solid currentColor}
.foot{display:flex;justify-content:space-between;gap:.5rem 1.5rem;flex-wrap:wrap;padding-block:1.6rem;font-size:.92rem;border-top:1px solid color-mix(in oklab,var(--on-acc) 32%,var(--acc))}
@media (max-width:760px){.case{border-width:.5rem;border-bottom:0}.sp.ng{margin-inline-start:var(--x);margin-top:.9rem}.top nav{display:none}.hero,.about,.end .cl,.pair{grid-template-columns:minmax(0,1fr)}.hero .tx{padding-bottom:0}.hero img{aspect-ratio:4/3}.about figure{max-width:16rem}.about p{padding-bottom:0}.shelf{flex-direction:column;align-items:stretch;gap:2px;overflow:visible;padding:1.25rem .75rem 0}.sp{writing-mode:horizontal-tb;inline-size:auto;min-block-size:0;block-size:auto;padding:.6rem 1.6rem;margin-inline-start:var(--x);margin-inline-end:var(--y);font-size:.98rem}.sp::before,.sp::after{top:.35rem;bottom:.35rem;height:auto;width:.4rem;right:auto;border-block:0;border-inline:1px solid currentColor}.sp::before{left:.6rem}.sp::after{left:auto;right:.6rem}.sp:last-child:not(:first-child){rotate:none;margin-inline-start:var(--x)}.end dl div{grid-template-columns:minmax(0,1fr);gap:.1rem}}
/* Questions beside their heading on wide screens: a heading over a narrow list left the right half empty. */
@media (min-width:861px){#questions>.w{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);column-gap:clamp(2rem,5vw,5rem);align-items:start}#questions>.w>h2,#questions>.w>.head{margin:0}#questions .qa{max-width:none}}`

/** Spine sizes in turn: height and least width on a wide screen, insets when lying flat. */
const SIZES = [
  { h: '18rem', b: '3.6rem', x: '4%', y: '6%' },
  { h: '21rem', b: '4.4rem', x: '0%', y: '12%' },
  { h: '17rem', b: '3.2rem', x: '8%', y: '0%' },
  { h: '22.5rem', b: '5rem', x: '2%', y: '9%' },
  { h: '19.5rem', b: '3.9rem', x: '6%', y: '3%' },
]
const FG = ['var(--on-acc)', 'var(--on-acc)', 'var(--ink)', 'var(--ink)', 'var(--on-acc)']

/** A spine's look, by its place on the whole page so neighbouring shelves differ. */
const look = (n: number) => {
  const t = n % TINTS.length
  const s = SIZES[(n * 3) % SIZES.length] as (typeof SIZES)[number]
  return {
    '--bg': TINTS[t],
    '--fg': FG[t],
    '--h': s.h,
    '--b': s.b,
    '--x': s.x,
    '--y': s.y,
  } as CSSProperties
}

const groups = (c: TemplateProps['c']) => c.prices.filter((g) => g.items.length)

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say">
        <div className="w">
          <p className="edge">{c.statement}</p>
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
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="w">
          <div className="pair edge">
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
  const reach = reachOf(f)
  const gs = groups(c)
  let n = 0
  const shelves = gs.map((g) => g.items.map((it) => ({ it, s: look(n++) })))
  // One bookcase for the whole offer, a gap between groups, at most nine spines a shelf.
  const books = shelves.flatMap((row, g) =>
    row.map((b, i) => ({ ...b, ng: g > 0 && i === 0, key: `${g}-${i}` })),
  )
  const rows: (typeof books)[] = []
  for (let i = 0; i < books.length; i += 9) rows.push(books.slice(i, i + 9))
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
      <header className="w">
        <div className="hero edge">
          <div className="tx">
            <p className="tag">{c.tagline}</p>
            <h1>{c.headline}</h1>
            <p className="sub">{c.subhead}</p>
            <a className="btn" href="#visit">
              {c.cta.label}
            </a>
          </div>
          <figure>
            <Pic photo={c.photos.hero} eager />
          </figure>
        </div>
      </header>
      <main>
        <section className="sec">
          <div className="w about">
            <p>{c.about}</p>
            <figure className="edge">
              <Pic photo={c.photos.about} />
            </figure>
          </div>
        </section>
        <section className="sec" id="offer" style={{ paddingTop: 0 }}>
          <div className="w">
            <h2>{c.offerTitle}</h2>
            {rows.length > 0 && (
              <div className="case" aria-hidden="true">
                {rows.map((row) => (
                  <div className="shelf edge" key={row[0]?.key}>
                    {row.map(({ it, s, ng, key }) => (
                      <span className={ng ? 'sp ng' : 'sp'} style={s} key={key}>
                        {it.name}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {gs.map((g, i) => {
              const H = g.group ? 'h4' : 'h3'
              const row = shelves[i] ?? []
              return (
                <div className="grp" key={i}>
                  {g.group && <h3>{g.group}</h3>}
                  <ul className="list">
                    {row.map(({ it, s }) => (
                      <li key={it.name} style={s}>
                        <span className="sw" aria-hidden="true" />
                        <H>{it.name}</H>
                        {it.price ? <span className="pr">{it.price}</span> : <span />}
                        {it.detail && <p>{it.detail}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            <figure className="side edge">
              <Pic photo={c.photos.d1} />
            </figure>
          </div>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer className="end" id="visit">
        <div className="w cl">
          <div>
            <h2>{c.cta.headline}</h2>
            <p className="sub">{c.cta.subhead}</p>
            {reach && (
              <a className="btn" href={reach.href}>
                {c.cta.label}
              </a>
            )}
          </div>
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
        <div className="w foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const spines: Template = {
  id: 'spines',
  label: 'Spines',
  text: "A shelf of books or records on warm paper: each item of the offer stands as a spine with its name set sideways, in varied widths, heights and tints of the business's colour on a wooden shelf edge, then read again in a clear list beneath with details and prices, and photos stand on the same shelf; bookish, collected and unhurried, for bookshops, second-hand and record shops, libraries, comic and game shops and collectors.",
  dark: false,
  css: CSS,
  Page,
}
