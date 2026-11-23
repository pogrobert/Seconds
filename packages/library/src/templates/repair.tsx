// Repair ticket: the page reads as the job ticket a repair counter hands over. The opening is a
// paper ticket with a tear-off stub joined by a dashed perforation, the two halves bitten by
// round notches where they meet; the stub carries the hero photo, or the name on the business's
// colour when there is none. Below it the job sheet: the introduction written on ruled note lines
// with a coloured margin, the offer as the ticket's line items each with an empty tick box, steps
// as the job's progress along a track. The close is a second ticket, coloured, whose stub keeps
// the button and the facts. Square corners. Photos optional. For phone and computer repair,
// tailors and alterations, shoe repair, watch repair and bike shops.

import { Fragment, type ReactNode } from 'react'
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
/** A bite out of two corners: the halves of a ticket meet at round notches. */
const bite = (a: string, b: string, sa: string, sb: string) =>
  `radial-gradient(circle at ${a},#0000 var(--n),#000 calc(var(--n) + .5px)) ${sa} no-repeat,radial-gradient(circle at ${b},#0000 var(--n),#000 calc(var(--n) + .5px)) ${sb} no-repeat`
const M_END = bite('100% 0', '100% 100%', 'top/100% 51%', 'bottom/100% 51%')
const M_START = bite('0 0', '0 100%', 'top/100% 51%', 'bottom/100% 51%')
const M_BOTTOM = bite('0 100%', '100% 100%', 'left/51% 100%', 'right/51% 100%')
const M_TOP = bite('0 0', '100% 0', 'left/51% 100%', 'right/51% 100%')
const RTL = ':is([dir=rtl] *,:dir(rtl))'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--desk:color-mix(in oklab,var(--band) 9%,#e8e4da);--paper:color-mix(in oklab,var(--band) 2%,#fffdf8);--ink:color-mix(in oklab,var(--band) 22%,#161616);--quiet:color-mix(in oklab,var(--ink) 68%,var(--paper));--rule:color-mix(in oklab,var(--ink) 78%,var(--paper));--line:color-mix(in oklab,var(--ink) 20%,var(--paper));--tint:color-mix(in oklab,var(--band) 8%,var(--paper));--deep:color-mix(in oklab,var(--band) 78%,#000);--note:color-mix(in oklab,var(--band) 18%,color-mix(in oklab,var(--ink) 12%,var(--paper)));--margin:color-mix(in oklab,var(--band) 55%,var(--paper));--w:74rem;--gut:clamp(1rem,3.5vw,2.5rem);--pad:clamp(1.25rem,3.6vw,3rem);--sec:clamp(3rem,6vw,5rem);--n:.85rem;--lh:2.5rem}
body{background:var(--desk);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top .w{display:flex;align-items:center;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.3rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.3rem;line-height:1.25;overflow-wrap:anywhere}
.top nav{display:flex;gap:.4rem 1.75rem;flex-wrap:wrap;font-size:.95rem}
.top nav a{text-decoration:none}.top nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.btn{display:inline-block;padding:.9rem 1.5rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:650;text-decoration:none;line-height:1.3;border:2px solid var(--acc)}
.btn:hover{background:var(--deep);border-color:var(--deep)}
.tkw{filter:drop-shadow(0 0 .6px color-mix(in oklab,var(--ink) 70%,transparent)) drop-shadow(0 .5rem .9rem color-mix(in oklab,var(--ink) 10%,transparent))}
.tk{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,19rem)}
.tm{background:var(--paper);mask:${M_END};-webkit-mask:${M_END};border-inline-end:2px dashed var(--line);display:flex;flex-direction:column}
.ts{position:relative;background:var(--acc);color:var(--on-acc);mask:${M_START};-webkit-mask:${M_START};display:flex;flex-direction:column;min-height:100%}
${RTL}.tm,${RTL}>.tm{mask:${M_START};-webkit-mask:${M_START}}
${RTL}.ts,${RTL}>.ts{mask:${M_END};-webkit-mask:${M_END}}
.ts::before{content:"";position:absolute;z-index:1;top:1.25rem;inset-inline-start:50%;width:1.1rem;height:1.1rem;margin-inline-start:-.55rem;border-radius:50%;background:var(--desk);box-shadow:inset 0 1px 2px color-mix(in oklab,var(--ink) 40%,transparent)}
.fld{padding:1rem var(--pad)}
.fld+.fld{border-top:1px solid var(--line)}
.open .tm .tag{color:var(--quiet);padding-top:1.4rem;padding-bottom:.8rem}
.open .hl{padding-block:clamp(1.75rem,4.5vw,3.5rem)}
.open h1{font-size:clamp(2.4rem,5.6vw,4.8rem);line-height:1.02;max-width:15ch;overflow-wrap:break-word}
.open .act{display:flex;align-items:center;justify-content:space-between;gap:1.25rem 2rem;flex-wrap:wrap;padding-block:1.4rem 1.6rem;margin-top:auto}
.open .sub{font-size:clamp(1.05rem,1.4vw,1.2rem);max-width:46ch}
.open .ts figure{flex:1;position:relative;min-height:16rem}
.open .ts figure img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.open .ts figure:has(${ART}){display:none}
.ts .sn{display:block;padding:1.1rem 1.4rem 1.3rem;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.25rem;line-height:1.2;overflow-wrap:anywhere}
.open .ts:has(${ART}){justify-content:flex-end}
.open .ts:has(${ART}) .sn{font-size:clamp(1.8rem,3vw,2.6rem);line-height:1.05;padding:4rem 1.6rem 1.6rem}
.sheet{margin-top:clamp(2rem,4vw,3rem);background:var(--paper);box-shadow:0 0 0 1px color-mix(in oklab,var(--ink) 18%,transparent);padding:0 var(--pad) var(--sec)}
.sec{padding-top:var(--sec)}
.hd{display:flex;align-items:baseline;gap:1rem;padding-top:.9rem;border-top:2px solid var(--rule);margin-bottom:clamp(1.25rem,2.5vw,2rem)}
.hd h2{font-size:clamp(1.7rem,3vw,2.4rem);line-height:1.1;max-width:30ch;overflow-wrap:break-word}
.about{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,20rem);gap:clamp(2rem,5vw,4rem);align-items:start}
.notes{border-inline-start:2px solid var(--margin);padding-inline-start:clamp(1rem,2.5vw,1.75rem);background:repeating-linear-gradient(to bottom,transparent 0 calc(var(--lh) - 2px),var(--note) calc(var(--lh) - 2px) var(--lh))}
.notes p{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.2rem,1.9vw,1.45rem);line-height:var(--lh);max-width:44ch}
.about figure{background:#fff;padding:.55rem;box-shadow:0 0 0 1px var(--line);rotate:1.2deg}
.about img{width:100%;aspect-ratio:4/5;object-fit:cover}
.about:has(${ART}){grid-template-columns:minmax(0,1fr)}
.about figure:has(${ART}){display:none}
.g{font-size:1.15rem;line-height:1.3;color:var(--deep);padding:1.25rem 0 .5rem}
.lines{border-bottom:1px solid var(--line)}
.lines li{display:grid;grid-template-columns:1.15rem minmax(0,1fr) auto;gap:.3rem 1.1rem;align-items:baseline;padding-block:1.05rem;border-top:1px solid var(--line)}
.lines li::before{content:"";width:1.15rem;height:1.15rem;border:2px solid var(--rule);align-self:start;margin-top:.3rem;background:var(--paper)}
.lines h3{font-size:clamp(1.2rem,1.8vw,1.45rem);line-height:1.25;overflow-wrap:anywhere}
.lines p{grid-column:2;color:var(--quiet);max-width:60ch}
.lines .pr{grid-column:3;grid-row:1;font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.15rem,1.7vw,1.4rem);line-height:1.25;color:var(--deep);font-variant-numeric:tabular-nums;text-align:end;max-width:12rem;overflow-wrap:anywhere}
.flds{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr));gap:0 clamp(1.5rem,3vw,2.5rem)}
.flds li{border-top:1px solid var(--line);padding-block:1rem 1.4rem}
.flds h3{font-size:1.25rem;line-height:1.25;margin-bottom:.4rem}
.flds p{color:var(--quiet);max-width:46ch}
.track{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:1.5rem}
.track li{position:relative;padding-top:3.6rem}
.track li::before{content:"";position:absolute;top:1.25rem;inset-inline:0 -1.5rem;height:2px;background:var(--rule)}
.track li:last-child::before{inset-inline-end:0}
.track .n{position:absolute;top:0;inset-inline-start:0;display:grid;place-items:center;width:2.6rem;height:2.6rem;border-radius:50%;background:var(--acc);color:var(--on-acc);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.15rem;font-variant-numeric:lining-nums tabular-nums;box-shadow:0 0 0 .4rem var(--paper)}
.track h3{font-size:1.2rem;line-height:1.25;margin-bottom:.4rem}
.track p{color:var(--quiet);max-width:40ch}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.6rem,3.4vw,2.7rem);line-height:1.2;max-width:28ch;padding-block:clamp(1.5rem,3vw,2.25rem);border-block:3px double var(--rule)}
.qa div{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:.4rem 2rem;padding-block:1.15rem;border-top:1px solid var(--line)}
.qa div:last-child{border-bottom:1px solid var(--line)}
.qa h3{font-family:var(--font-body);font-size:1.05rem;font-weight:700;letter-spacing:0;text-transform:none;line-height:1.45}
.qa p{color:var(--quiet);max-width:62ch}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(1rem,2.5vw,2rem)}
.pair figure{background:#fff;padding:.5rem;box-shadow:0 0 0 1px var(--line)}
.pair img{width:100%;aspect-ratio:3/2;object-fit:cover}
.end{margin-top:clamp(2rem,4vw,3rem)}
.end .tm{background:var(--acc);color:var(--on-acc);border-inline-end-color:color-mix(in oklab,var(--on-acc) 45%,var(--acc));padding:clamp(2rem,5vw,3.75rem) var(--pad);justify-content:center}
.end h2{font-size:clamp(2rem,4.4vw,3.6rem);line-height:1.05;max-width:18ch;overflow-wrap:break-word}
.end .sub{margin-top:1rem;max-width:44ch;font-size:1.1rem;opacity:.9}
.end .ts{background:var(--paper);color:var(--ink);padding:3.25rem 1.5rem 1.6rem;justify-content:flex-start;gap:1.25rem}
.end .ts::before{top:1.1rem}
.end dl>div{border-top:1px solid var(--line);padding-block:.7rem}
.end dt{font-size:.82rem;color:var(--quiet)}
.end dd{font-size:1rem;line-height:1.45;overflow-wrap:anywhere}
.end dd a{text-decoration:none;border-bottom:1px solid currentColor}
.foot .w{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.75rem 2rem;font-size:.92rem;color:var(--quiet)}
.foot b{color:var(--ink)}
@media (max-width:760px){.top nav{display:none}.tk{grid-template-columns:minmax(0,1fr)}.tm,${RTL}.tm{mask:${M_BOTTOM};-webkit-mask:${M_BOTTOM};border-inline-end:0;border-bottom:2px dashed var(--line)}.end .tm{border-bottom-color:color-mix(in oklab,var(--on-acc) 45%,var(--acc))}.ts,${RTL}.ts{mask:${M_TOP};-webkit-mask:${M_TOP};min-height:0}.open .ts figure{min-height:0}.open .ts figure img{position:static;aspect-ratio:3/2;height:auto}.open .ts:has(${ART}) .sn{padding:2.75rem 1.4rem 1.4rem}.about{grid-template-columns:minmax(0,1fr)}.about figure{max-width:22rem}.qa div{grid-template-columns:minmax(0,1fr)}.track{grid-auto-flow:row;grid-auto-columns:auto;gap:0}.track li{padding:0 0 1.75rem 3.75rem;min-height:3.4rem}.track li::before{top:0;bottom:0;inset-inline:1.25rem auto;width:2px;height:auto}.track li:last-child::before{display:none}${RTL}.track li,.track li:dir(rtl){padding:0 3.75rem 1.75rem 0}.lines li{grid-template-columns:1.15rem minmax(0,1fr)}.lines .pr{grid-column:2;grid-row:auto;text-align:start}.pair{grid-template-columns:minmax(0,1fr)}}`

function Head({ children }: { children: ReactNode }) {
  return (
    <div className="hd">
      <h2>{children}</h2>
    </div>
  )
}

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say">
        <p>{c.statement}</p>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <Head>Questions</Head>
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
  if (x === 'steps')
    return (
      <section className="sec" id={x}>
        <Head>{l.title}</Head>
        <ol className="track">
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
    <section className="sec" id={x}>
      <Head>{l.title}</Head>
      <ul className="flds">
        {l.items.map((it) => (
          <li key={it.title}>
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

type Item = { name: string; detail?: string; price: string }

function Lines({ list }: { list: Item[] }) {
  return (
    <ul className="lines">
      {list.map((it) => (
        <li key={it.name}>
          <h3>{it.name}</h3>
          {it.price && <span className="pr">{it.price}</span>}
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
  const groups = c.prices.filter((g) => g.items.length)
  const named = groups.filter((g) => g.group).length > 1
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
        <section className="w open">
          <div className="tkw">
            <div className="tk">
              <div className="tm">
                <div className="fld tag">
                  <p>{c.tagline}</p>
                </div>
                <div className="fld hl">
                  <h1>{c.headline}</h1>
                </div>
                <div className="fld act">
                  <p className="sub">{c.subhead}</p>
                  <a className="btn" href="#visit">
                    {c.cta.label}
                  </a>
                </div>
              </div>
              <div className="ts">
                <figure>
                  <Pic photo={c.photos.hero} eager />
                </figure>
                <span className="sn">{c.name}</span>
              </div>
            </div>
          </div>
        </section>
        <div className="w">
          <div className="sheet">
            <section className="sec about">
              <div className="notes">
                <p>{c.about}</p>
              </div>
              <figure>
                <Pic photo={c.photos.about} />
              </figure>
            </section>
            {offerItems(c).length > 0 && (
              <section className="sec" id="offer">
                <Head>{c.offerTitle}</Head>
                {named ? (
                  groups.map((g, i) => (
                    <div key={g.group || i}>
                      {g.group && <h3 className="g">{g.group}</h3>}
                      <Lines list={g.items} />
                    </div>
                  ))
                ) : (
                  <Lines list={offerItems(c)} />
                )}
              </section>
            )}
            {xs.map((x) => (
              <Fragment key={x}>
                <Extras c={c} x={x} />
              </Fragment>
            ))}
          </div>
        </div>
        <section className="w end" id="visit">
          <div className="tkw">
            <div className="tk">
              <div className="tm">
                <h2>{c.cta.headline}</h2>
                <p className="sub">{c.cta.subhead}</p>
              </div>
              <div className="ts">
                <a className="btn" href={reach?.href ?? '#offer'}>
                  {c.cta.label}
                </a>
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

export const repair: Template = {
  id: 'repair',
  label: 'Repair ticket',
  text: 'A repair job ticket: the opening is a paper ticket with a tear-off stub along a dashed perforation, the introduction is written on ruled note lines, the offer is a list of jobs with tick boxes and prices, and the steps run as the progress of a job; practical, tidy and trustworthy, for phone and computer repair shops, tailors and alterations, shoe and watch repair, bike shops and other fix-it counters.',
  dark: false,
  css: CSS,
  Page,
}
