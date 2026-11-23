// Care: warm, quiet and spacious, set in large print for older readers. A cream page like a lived-in
// room: the promise beside one photo in a thick pale mount, as a framed picture on a sideboard,
// with a block of the organisation's colour resting behind it. Body text is 20px with a long line
// height, every link and button is a large tap target, and the phone number is set as large as a
// heading at the close so it can be read from across a room. Sections sit on two warm grounds,
// cream and linen, with no rules or boxes; the colour is used fully only once, at the close.
// For care homes, counsellors, midwives, hospices and therapists.

import { Fragment } from 'react'
import type { Photo } from '../ui.tsx'
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

const isArt = (p: Photo) => p.src.startsWith('data:image/svg')

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 3%,#fbf7f0);--linen:color-mix(in oklab,var(--band) 9%,#f5ede1);--mount:color-mix(in oklab,var(--band) 2%,#fffdf9);--line:color-mix(in oklab,var(--band) 18%,#e6dccd);--ink:color-mix(in oklab,var(--band) 16%,#1b1916);--quiet:color-mix(in oklab,var(--ink) 82%,var(--paper));--deep:color-mix(in oklab,var(--band) 88%,#000);--w:74rem;--read:44rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(4.5rem,9vw,8rem)}
body{background:var(--paper);color:var(--ink);font-size:1.25rem;line-height:1.7}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{display:flex;align-items:center;justify-content:space-between;gap:1rem 2rem;flex-wrap:wrap;padding-block:1.5rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:1.5rem;line-height:1.25}
.top nav{display:flex;flex-wrap:wrap;gap:.25rem;align-items:center}
.top nav a{display:inline-flex;align-items:center;min-height:3rem;padding:.5rem 1rem;font-size:1.125rem;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.3em;text-decoration-color:var(--line);border-radius:var(--button-radius)}
.top nav a:hover{background:var(--linen);text-decoration-color:currentColor}
.hero{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:clamp(2.5rem,6vw,6rem);align-items:center;padding-block:clamp(2.5rem,6vw,5rem) var(--sec)}
.tag{font-size:1.25rem;color:var(--quiet);margin-bottom:1.25rem}
.hero h1{font-size:clamp(2.6rem,5.2vw,4.4rem);line-height:1.1;margin-bottom:1.5rem}
.hero p.sub{font-size:clamp(1.3rem,1.8vw,1.5rem);line-height:1.6;max-width:32ch;margin-bottom:2.5rem}
.acts{display:flex;flex-wrap:wrap;gap:1rem;align-items:center}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:3.75rem;padding:.9rem 1.9rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-size:1.2rem;font-weight:600;line-height:1.3;text-decoration:none}
.btn:hover{filter:brightness(1.08)}
.btn.soft{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 2px var(--line)}
.btn.soft:hover{background:var(--linen)}
.frame{background:var(--mount);padding:clamp(.75rem,1.6vw,1.25rem);border:1px solid var(--line);border-radius:var(--radius);box-shadow:clamp(1rem,2.4vw,1.75rem) clamp(1rem,2.4vw,1.75rem) 0 var(--acc)}
.frame img{width:100%;object-fit:cover;border-radius:calc(var(--radius) * .5)}
.hero .frame{margin-inline-end:clamp(1rem,2.4vw,1.75rem);margin-bottom:clamp(1rem,2.4vw,1.75rem)}
.hero .frame img{aspect-ratio:4/5}
.sec{padding-block:var(--sec)}
.linen{background:var(--linen)}
.read{max-width:var(--read)}
.about{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,7fr);gap:clamp(2.5rem,6vw,6rem);align-items:center}
.about.solo{grid-template-columns:minmax(0,1fr)}
.about .frame{box-shadow:none}
.about .frame img{aspect-ratio:1/1}
.about p{font-family:var(--font-heading);font-size:clamp(1.5rem,2.4vw,2rem);line-height:1.5;letter-spacing:var(--heading-tracking);max-width:34ch}
h2{font-size:clamp(2rem,3.6vw,2.9rem);line-height:1.15;margin-bottom:clamp(2rem,4vw,3rem);max-width:24ch}
.list{max-width:52rem}
.list li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.4rem 2rem;align-items:baseline;padding-block:1.6rem;border-top:1px solid var(--line)}
.list li:last-child{border-bottom:1px solid var(--line)}
.list h3{font-size:clamp(1.35rem,2vw,1.6rem);line-height:1.3}
.list .price{font-family:var(--font-heading);font-size:1.4rem;font-variant-numeric:tabular-nums;white-space:nowrap}
.list p{grid-column:1/-1;color:var(--quiet);max-width:46ch}
.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(1.5rem,4vw,3.5rem);align-items:start}
.pair figure:last-child{margin-top:clamp(2rem,6vw,5rem)}
.pair img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:calc(var(--radius) * .5)}
.pair .frame{box-shadow:none}
.say p{font-family:var(--font-heading);font-size:clamp(1.9rem,3.8vw,3rem);line-height:1.3;letter-spacing:var(--heading-tracking);max-width:28ch;text-wrap:balance}
.cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(2.5rem,5vw,4rem) clamp(2rem,6vw,6rem);max-width:60rem}
.cols h3{font-size:clamp(1.4rem,2vw,1.65rem);line-height:1.3;margin-bottom:.6rem}
.cols p{color:var(--quiet)}
.n{display:grid;place-items:center;width:3.25rem;height:3.25rem;border-radius:50%;background:var(--acc);color:var(--on-acc);font-family:var(--font-heading);font-size:1.4rem;line-height:1;margin-bottom:1.25rem;font-variant-numeric:tabular-nums}
.faq{max-width:50rem}
.faq details{border-top:1px solid var(--line)}
.faq details:last-child{border-bottom:1px solid var(--line)}
.faq summary{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1.5rem;align-items:center;min-height:4.5rem;padding-block:1.25rem;font-family:var(--font-heading);font-size:clamp(1.3rem,2vw,1.5rem);line-height:1.35}
.faq summary::after{content:"+";display:grid;place-items:center;width:2.75rem;height:2.75rem;border-radius:50%;box-shadow:inset 0 0 0 2px var(--line);font-family:var(--font-body);font-size:1.6rem;line-height:1}
.faq details[open] summary::after{content:"−"}
.faq details p{color:var(--quiet);padding-bottom:1.6rem;max-width:58ch}
.end{background:var(--acc);color:var(--on-acc)}
.end .in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(2.5rem,6vw,6rem);align-items:start;padding-block:var(--sec)}
.end .in.solo{grid-template-columns:minmax(0,1fr)}
.end h2{margin-bottom:1.25rem}
.end p.sub{font-size:1.3rem;max-width:34ch;margin-bottom:2.5rem;opacity:.95}
.end .btn{background:var(--on-acc);color:var(--acc)}
.tel{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(2rem,4.4vw,3.4rem);line-height:1.15;text-decoration:none;overflow-wrap:anywhere;margin-bottom:2rem}
.tel:hover{text-decoration:underline;text-underline-offset:.15em;text-decoration-thickness:2px}
.end dl{display:grid;gap:1.5rem}
.end dt{font-size:1.05rem;opacity:.85}
.end dd{font-size:1.3rem;line-height:1.5;overflow-wrap:anywhere}
.end dd a{text-underline-offset:.25em}
.foot{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:2rem 2.5rem;font-size:1.05rem;border-top:1px solid color-mix(in oklab,var(--on-acc) 30%,transparent)}
@media (max-width:860px){.hero,.about,.end .in{grid-template-columns:minmax(0,1fr)}.about .frame{max-width:22rem}.hero .frame img{aspect-ratio:4/3}.cols{grid-template-columns:minmax(0,1fr)}.top nav a:not(:last-child){display:none}.top nav a:last-child{box-shadow:inset 0 0 0 2px var(--line);text-decoration:none}}
@media (max-width:480px){body{font-size:1.1875rem}.pair{grid-template-columns:minmax(0,1fr)}.pair figure:last-child{margin-top:0}.btn{width:100%}.list li{grid-template-columns:minmax(0,1fr)}}
/* Questions beside their heading on wide screens: a heading over a narrow list left the right half empty. */
@media (min-width:861px){#questions>.w{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);column-gap:clamp(2rem,5vw,5rem);align-items:start}#questions>.w>h2,#questions>.w>.head{margin:0}#questions .faq{max-width:none}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec linen say">
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
          <div className="faq">
            <FaqDetails faq={c.faq} />
          </div>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="w pair">
          <figure className="frame">
            <Pic photo={c.photos.d2} />
          </figure>
          <figure className="frame">
            <Pic photo={c.photos.cta} />
          </figure>
        </div>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className={x === 'steps' ? 'sec linen' : 'sec'}>
      <div className="w">
        <h2>{l.title}</h2>
        <ol className="cols">
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
  const call = reachOf(f)
  const rest = f.filter((x) => x.label !== 'Phone')
  const aboutPhoto = !isArt(c.photos.about)
  const offer = offerItems(c)
  return (
    <>
      <div className="w top">
        <b>{c.name}</b>
        <nav>
          <NavLinks links={links(c, extras)} />
        </nav>
      </div>
      <header className="w hero">
        <div>
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <div className="acts">
            <a className="btn" href="#visit">
              {c.cta.label}
            </a>
            {phone && (
              <a className="btn soft" href={phone.href}>
                {phone.value}
              </a>
            )}
          </div>
        </div>
        <figure className="frame">
          <Pic photo={c.photos.hero} eager />
        </figure>
      </header>
      <main>
        <section className="sec linen">
          <div className={aboutPhoto ? 'w about' : 'w about solo'}>
            {aboutPhoto && (
              <figure className="frame">
                <Pic photo={c.photos.about} />
              </figure>
            )}
            <p>{c.about}</p>
          </div>
        </section>
        {offer.length > 0 && (
          <section className="sec" id="offer">
            <div className="w">
              <h2>{c.offerTitle}</h2>
              <ul className="list">
                {offer.map((it) => (
                  <li key={it.name}>
                    <h3>{it.name}</h3>
                    {it.price ? <span className="price">{it.price}</span> : <span />}
                    {it.detail && <p>{it.detail}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
        {!xs.includes('gallery') && (
          <section className="sec linen">
            <div className="w pair">
              <figure className="frame">
                <Pic photo={c.photos.d1} />
              </figure>
              <figure className="frame">
                <Pic photo={c.photos.d2} />
              </figure>
            </div>
          </section>
        )}
      </main>
      <footer className="end" id="visit">
        <div className={hasVisit(c) ? 'w in' : 'w in solo'}>
          <div>
            <h2>{c.cta.headline}</h2>
            <p className="sub">{c.cta.subhead}</p>
            {call && (
              <a className="btn" href={call.href}>
                {c.cta.label}
              </a>
            )}
          </div>
          {hasVisit(c) && (
            <div>
              {phone && (
                <a className="tel" href={phone.href}>
                  {phone.value}
                </a>
              )}
              {rest.length > 0 && (
                <dl>
                  <FactRows facts={rest} />
                </dl>
              )}
            </div>
          )}
        </div>
        <div className="w">
          <div className="foot">
            <span>{c.name}</span>
            <span>{c.tagline}</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export const care: Template = {
  id: 'care',
  label: 'Care',
  text: 'Warm, quiet and homely, set in large print for older readers: a cream page like a lived-in room, the promise beside one photo in a thick pale mount like a framed picture on a sideboard, big easy buttons, generous space and the phone number set large at the close; gentle and reassuring rather than clinical, for care homes, counsellors, midwives, hospices, therapists and other caring services.',
  dark: false,
  css: CSS,
  Page,
}
