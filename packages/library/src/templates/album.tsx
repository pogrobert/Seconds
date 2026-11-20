// Album: photos first. A short, centred welcome over a mosaic of three photos, then the page
// turns like an album: one centred block of words, one wide pair of photos, and so on. Text is
// set narrow and soft; the photos carry the feeling. For B&Bs, guesthouses, venues, florists,
// galleries and makers.

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

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 6%,#fcfbf8);--soft:color-mix(in oklab,var(--band) 11%,#fbfaf6);--ink:color-mix(in oklab,var(--band) 25%,#1b1b1b);--quiet:color-mix(in oklab,var(--ink) 64%,var(--paper));--line:color-mix(in oklab,var(--band) 20%,#f1efea);--w:72rem;--txt:38rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4.5rem,9vw,8rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.7}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.t{max-width:calc(var(--txt) + 2 * var(--gut));margin-inline:auto;padding-inline:var(--gut);text-align:center}
.top{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding-block:1.5rem}
.top b{grid-column:2;font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.4rem;letter-spacing:var(--heading-tracking)}
.top nav{grid-column:3;justify-self:end;display:flex;gap:1.5rem;font-size:.95rem}.top nav a{text-decoration:none;color:var(--quiet)}.top nav a:hover{color:var(--ink)}
.hello{padding-block:clamp(2.5rem,6vw,5rem) clamp(2.5rem,5vw,4rem)}
.hello .tag{color:var(--acc);margin-bottom:1rem}
.hello h1{font-size:clamp(2.5rem,5.6vw,4.75rem);line-height:1.05;margin-bottom:1.25rem}
.hello p.sub{color:var(--quiet);font-size:1.2rem;margin-inline:auto;max-width:36ch}
.mosaic{display:grid;grid-template-columns:3fr 2fr;grid-template-rows:1fr 1fr;gap:clamp(.6rem,1.2vw,1rem);height:min(78svh,44rem)}
.mosaic figure:first-child{grid-row:span 2}
.mosaic img,.wide img{width:100%;height:100%;object-fit:cover;border-radius:var(--radius)}
.sec{padding-block:var(--sec)}
.lead{font-family:var(--font-heading);font-size:clamp(1.35rem,2.2vw,1.75rem);line-height:1.5;letter-spacing:var(--heading-tracking)}
h2{font-size:clamp(1.8rem,3.2vw,2.6rem);line-height:1.12;margin-bottom:2rem}
.items{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:2rem 3rem;text-align:left;max-width:52rem;margin-inline:auto}
.items li{border-top:1px solid var(--line);padding-top:1rem}
.items h3{font-size:1.25rem;display:flex;justify-content:space-between;gap:1rem;align-items:baseline}
.items .price{font-variant-numeric:tabular-nums;color:var(--acc);font-size:1.1rem}
.items p{color:var(--quiet);margin-top:.3rem}
.wide{display:grid;grid-template-columns:1fr 1fr;gap:clamp(.6rem,1.2vw,1rem)}
.wide img{aspect-ratio:4/3;height:auto}
.soft{background:var(--soft)}
.list li{padding-block:1.25rem}.list li+li{border-top:1px solid var(--line)}
.list h3{font-size:1.25rem;margin-bottom:.25rem}.list p{color:var(--quiet)}
.n{display:block;color:var(--acc);font-family:var(--font-heading);font-size:1.2rem}
.say p{font-family:var(--font-heading);font-size:clamp(1.75rem,3.6vw,2.9rem);line-height:1.25;letter-spacing:var(--heading-tracking)}
.faq{text-align:left}.faq details{border-top:1px solid var(--line);padding-block:1.1rem}.faq details:last-child{border-bottom:1px solid var(--line)}
.faq summary{font-family:var(--font-heading);font-size:1.15rem;display:flex;justify-content:space-between;gap:1rem}.faq summary::after{content:"+";color:var(--acc)}.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.5rem}
.end h2{margin-bottom:1rem}
.end p.sub{color:var(--quiet);margin-bottom:2rem}
.btn{display:inline-block;padding:.95rem 1.7rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);text-decoration:none;font-weight:600}
.end dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:1.75rem;margin-top:3rem;padding-top:2.25rem;border-top:1px solid var(--line)}
.end dt{color:var(--acc);font-size:.92rem}.end dd a{text-decoration:none}
.foot{text-align:center;padding-block:2rem;color:var(--quiet);font-size:.9rem;border-top:1px solid var(--line)}
@media (max-width:760px){.top{grid-template-columns:1fr}.top b{grid-column:1;justify-self:center}.top nav{display:none}.mosaic{grid-template-columns:1fr 1fr;height:auto}.mosaic figure:first-child{grid-column:1/-1;grid-row:auto}.mosaic img{aspect-ratio:4/3;height:auto}}
.mosaic:has(img[data-art]),.mosaic:has(img[src^="data:image/svg"]){height:auto;grid-template-columns:none;grid-template-rows:none;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr)}.mosaic:has(img[data-art]) figure,.mosaic:has(img[src^="data:image/svg"]) figure{grid-row:auto}.mosaic:has(img[data-art]) img,.mosaic:has(img[src^="data:image/svg"]) img{aspect-ratio:3/2;height:auto}.mosaic figure:has(img[data-art]),.mosaic figure:has(img[src^="data:image/svg"]){display:none}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say soft">
        <div className="t" style={{ maxWidth: '58rem' }}>
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="t faq">
          <h2 style={{ textAlign: 'center' }}>Questions</h2>
          {c.faq?.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    )
  // Album is photo-led already: its gallery is the pair of photos every page has.
  if (x === 'gallery') return null
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="sec">
      <div className="t">
        <h2>{l.title}</h2>
        <ol className="list">
          {l.items.map((it, i) => (
            <li key={it.title}>
              {x === 'steps' && <span className="n">{i + 1}</span>}
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
      <header>
        <div className="t hello">
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
        </div>
        <div className="w mosaic">
          <figure>
            <Pic photo={c.photos.hero} eager />
          </figure>
          <figure>
            <Pic photo={c.photos.about} />
          </figure>
          <figure>
            <Pic photo={c.photos.d1} />
          </figure>
        </div>
      </header>
      <main>
        <section className="sec">
          <div className="t">
            <p className="lead">{c.about}</p>
          </div>
        </section>
        <section className="sec soft" id="offer">
          <div className="w" style={{ textAlign: 'center' }}>
            <h2>{c.offerTitle}</h2>
            <ul className="items">
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
        <section className="sec">
          <div className="w wide pair">
            <figure>
              <Pic photo={c.photos.d2} />
            </figure>
            <figure>
              <Pic photo={c.photos.cta} />
            </figure>
          </div>
        </section>
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
      </main>
      <footer id="visit">
        <div className="t sec end">
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
        <div className="foot">
          {c.name} · {c.tagline}
        </div>
      </footer>
    </>
  )
}

export const album: Template = {
  id: 'album',
  label: 'Album',
  text: 'Photos first, like turning an album: a short centred welcome over a mosaic of three photos, then soft centred words between wide pairs of photos, the offer in light columns: warm, gentle and inviting, for B&Bs, guesthouses, venues, florists, galleries and makers.',
  dark: false,
  css: CSS,
  Page,
}
