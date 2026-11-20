// Card: the whole business on one card. The page is a ground of the owner's colour; on it sits a
// single white card, narrow like a letter, holding everything in one column: the name set as a
// letterhead, the promise, what they do with prices, and the contact details at the foot like the
// back of a business card. Sections inside are parted by fine rules, never boxes. Needs no photos:
// a real hero photo heads the card, drawn art is left out. For dog walkers, cleaners, tutors and
// other sole traders with little to say.

import { Fragment } from 'react'
import type { Photo } from '../ui.tsx'
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

const isArt = (p: Photo) => p.src.startsWith('data:image/svg')

const CSS = `${RESET}
img{height:auto}
:root{--g:var(--band);--on-g:var(--band-foreground);--card:#fff;--line:color-mix(in oklab,var(--band) 16%,#e8e6e1);--ink:color-mix(in oklab,var(--band) 22%,#17181a);--quiet:color-mix(in oklab,var(--ink) 64%,#fff);--tint:color-mix(in oklab,var(--band) 7%,#fff);--pad:clamp(1.5rem,5vw,3.5rem)}
body{background:var(--g);color:var(--ink);font-size:1.0625rem;line-height:1.6;padding:clamp(.75rem,4vw,4rem) clamp(.6rem,3vw,2rem)}
.card{max-width:42rem;margin-inline:auto;background:var(--card);border-radius:calc(var(--radius) * 1.5);box-shadow:0 30px 60px -30px rgb(0 0 0 / .45);overflow:hidden}
.in{padding-inline:var(--pad)}
.lh{display:flex;justify-content:space-between;align-items:baseline;gap:.5rem 1.5rem;flex-wrap:wrap;padding-block:1.75rem 1.5rem;border-bottom:1px solid var(--line)}
.lh b{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:1.15rem;letter-spacing:var(--heading-tracking);line-height:1.3}
.lh nav{display:flex;gap:.25rem 1.25rem;flex-wrap:wrap;font-size:.92rem;color:var(--quiet)}
.lh nav a{text-decoration:none}.lh nav a:hover{color:var(--ink);text-decoration:underline;text-underline-offset:.25em}
.ph img{width:100%;aspect-ratio:16/9;object-fit:cover}
.open{padding-block:clamp(2.5rem,7vw,4rem) clamp(2rem,5vw,3rem)}
.open .tag{color:var(--quiet);margin-bottom:1rem}
.open h1{font-size:clamp(2.1rem,6vw,3.1rem);line-height:1.08;margin-bottom:1.1rem}
.open p.sub{font-size:1.2rem;color:var(--quiet);margin-bottom:1.75rem;max-width:34ch}
.btn{display:inline-block;padding:.85rem 1.5rem;border-radius:var(--button-radius);background:var(--g);color:var(--on-g);font-weight:600;text-decoration:none;line-height:1.3}
.btn:hover{filter:brightness(1.08)}
.blk{padding-block:clamp(2rem,5vw,2.75rem);border-top:1px solid var(--line)}
.blk h2{font-size:1.45rem;line-height:1.2;margin-bottom:1.25rem}
.about p{font-size:1.15rem;line-height:1.65}
.price li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.15rem 1.25rem;align-items:baseline;padding-block:.85rem;border-bottom:1px dashed var(--line)}
.price li:first-child{padding-top:0}
.price li:last-child{border-bottom:0;padding-bottom:0}
.price h3{font-family:var(--font-body);font-size:1.08rem;font-weight:600;letter-spacing:0;text-transform:none;line-height:1.35}
.price .p{font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap}
.price p{grid-column:1/-1;color:var(--quiet);font-size:.97rem}
.list li+li{margin-top:1.1rem}
.list h3{font-size:1.1rem;line-height:1.35;margin-bottom:.15rem}
.list p{color:var(--quiet)}
.steps li{display:grid;grid-template-columns:2rem minmax(0,1fr);gap:.9rem}
.steps .n{font-family:var(--font-heading);font-size:1.35rem;line-height:1.3;color:color-mix(in oklab,var(--band) 85%,#000);font-variant-numeric:tabular-nums}
.say p{font-family:var(--font-heading);font-size:clamp(1.4rem,3.4vw,1.8rem);line-height:1.35;letter-spacing:var(--heading-tracking)}
.faq details{padding-block:.9rem;border-bottom:1px dashed var(--line)}
.faq details:first-of-type{padding-top:0}
.faq details:last-child{border-bottom:0;padding-bottom:0}
.faq summary{display:flex;justify-content:space-between;gap:1rem;font-weight:600}
.faq summary::after{content:"+";color:var(--quiet)}
.faq details[open] summary::after{content:"−"}
.faq p{color:var(--quiet);padding-top:.4rem}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}
.pair img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:calc(var(--radius) * .75)}
.back{background:var(--tint);padding-block:clamp(2rem,5vw,3rem);border-top:1px solid var(--line)}
.back h2{font-size:clamp(1.6rem,4.5vw,2.1rem);line-height:1.15;margin-bottom:.6rem}
.back p.sub{color:var(--quiet);margin-bottom:1.5rem}
.back dl{display:grid;gap:0;margin-top:1.75rem;border-top:1px solid var(--line)}
.back dl div{display:grid;grid-template-columns:5.5rem minmax(0,1fr);gap:1rem;padding-block:.8rem;border-bottom:1px solid var(--line)}
.back dt{color:var(--quiet);font-size:.95rem}
.back dd{font-weight:600;overflow-wrap:anywhere}
.back dd a{text-decoration:none;border-bottom:1px solid currentColor}
.foot{max-width:42rem;margin:1.25rem auto 0;display:flex;justify-content:space-between;gap:.25rem 1.5rem;flex-wrap:wrap;color:var(--on-g);opacity:.85;font-size:.9rem;padding-inline:.25rem}
@media (max-width:520px){.lh nav{display:none}.back dl div{grid-template-columns:minmax(0,1fr);gap:0}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="in blk say">
        <p>{c.statement}</p>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="in blk faq" id="questions">
        <h2>Questions</h2>
        {c.faq?.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="in blk pair">
        <figure>
          <Pic photo={c.photos.d1} />
        </figure>
        <figure>
          <Pic photo={c.photos.d2} />
        </figure>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  return (
    <section className="in blk">
      <h2>{l.title}</h2>
      <ol className={x === 'steps' ? 'list steps' : 'list'}>
        {l.items.map((it, i) => (
          <li key={it.title}>
            {x === 'steps' && <span className="n">{i + 1}</span>}
            <div>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const call = f.find((x) => x.href)
  return (
    <>
      <div className="card">
        <div className="in lh">
          <b>{c.name}</b>
          <nav>
            {links(c, extras).map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        {!isArt(c.photos.hero) && (
          <figure className="ph">
            <Pic photo={c.photos.hero} eager />
          </figure>
        )}
        <header className="in open">
          <p className="tag">{c.tagline}</p>
          <h1>{c.headline}</h1>
          <p className="sub">{c.subhead}</p>
          <a className="btn" href="#visit">
            {c.cta.label}
          </a>
        </header>
        <main>
          <section className="in blk about">
            <p>{c.about}</p>
          </section>
          {offerItems(c).length > 0 && (
            <section className="in blk" id="offer">
              <h2>{c.offerTitle}</h2>
              <ul className="price">
                {offerItems(c).map((it) => (
                  <li key={it.name}>
                    <h3>{it.name}</h3>
                    {it.price ? <span className="p">{it.price}</span> : <span />}
                    {it.detail && <p>{it.detail}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {xs.map((x) => (
            <Fragment key={x}>
              <Extras c={c} x={x} />
            </Fragment>
          ))}
        </main>
        <footer className="in back" id="visit">
          <h2>{c.cta.headline}</h2>
          <p className="sub">{c.cta.subhead}</p>
          {call && (
            <a className="btn" href={call.href}>
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
        </footer>
      </div>
      <div className="foot">
        <span>{c.name}</span>
        <span>{c.tagline}</span>
      </div>
    </>
  )
}

export const card: Template = {
  id: 'card',
  label: 'Card',
  text: "One white card, narrow like a letter, on a ground of the owner's colour, holding the whole business in a single column: name, promise, a short price list and contact details at the foot like a business card: simple, personal and tidy, for dog walkers, cleaners, tutors, childminders and other sole traders.",
  dark: false,
  css: CSS,
  Page,
}
