// Classic: calm, symmetrical and quietly formal, like the letterhead of a good practice. One centre
// axis runs through the page: the name sits on it in a balanced masthead, the opening is centred
// with wide margins, and the sections that pair two things (the introduction and its photo, the
// services, the questions and answers, the facts) are set as a spread: two columns mirrored about
// a fine centre rule, the left one set flush to the rule, the right one away from it. No
// ornament, no cards; colour only in the rules, the button and the closing band. Some photos; with
// drawn art they go and the spreads close up around the centre. For solicitors, accountants and
// private clinics.

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

const ART = ':is(img[data-art],img[src^="data:image/svg"])'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--paper:color-mix(in oklab,var(--band) 2%,#fcfcfb);--tint:color-mix(in oklab,var(--band) 5%,#f6f6f4);--hair:color-mix(in oklab,var(--band) 22%,#d8d8d4);--ink:color-mix(in oklab,var(--band) 20%,#18181b);--quiet:color-mix(in oklab,var(--ink) 66%,var(--paper));--deep:color-mix(in oklab,var(--band) 85%,#000);--w:68rem;--gut:clamp(1.25rem,5vw,4rem);--sec:clamp(4rem,9vw,7.5rem);--gap:clamp(2rem,5vw,4.5rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.65}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.c{text-align:center}
.mast{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:1rem 2rem;padding-block:1.75rem;border-bottom:1px solid var(--hair)}
.mast .tag{font-size:.92rem;color:var(--quiet);max-width:26ch}
.mast b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.3rem,2.2vw,1.65rem);line-height:1.2;text-align:center;max-width:22ch;text-wrap:balance}
.mast nav{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:.4rem 1.75rem;font-size:.95rem}
.mast nav a{text-decoration:none}.mast nav a:hover{text-decoration:underline;text-underline-offset:.3em}
.hero{padding-block:var(--sec)}
.hero .tag{color:var(--quiet);margin-bottom:1.5rem}
.hero h1{font-size:clamp(2.4rem,5.2vw,4.4rem);line-height:1.08;max-width:19ch;margin:0 auto 1.5rem}
.hero .sub{font-size:clamp(1.12rem,1.6vw,1.3rem);color:var(--quiet);max-width:44ch;margin:0 auto 2.5rem}
.btn{display:inline-block;padding:.9rem 2rem;border-radius:var(--button-radius);background:var(--acc);color:var(--on-acc);font-weight:600;text-decoration:none;letter-spacing:.01em}
.btn:hover{background:var(--deep)}
.bleed{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut);margin-bottom:var(--sec)}
.bleed img{width:100%;aspect-ratio:12/5;object-fit:cover;border-radius:var(--radius)}
.sec{padding-block:var(--sec)}
.sec+.sec{border-top:1px solid var(--hair)}
.tint{background:var(--tint)}
.sec.tint,.sec.tint+.sec{border-top:0}
h2.t{font-size:clamp(1.9rem,3.6vw,2.9rem);line-height:1.12;max-width:22ch;margin:0 auto clamp(2.5rem,5vw,3.75rem);text-align:center}
.mark{display:block;width:2.5rem;height:2px;background:var(--acc);margin:0 auto 1.75rem}
.spread{position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:var(--gap);max-width:60rem;margin-inline:auto}
.spread::before{content:"";position:absolute;left:50%;top:0;bottom:0;border-left:1px solid var(--hair)}
.spread>:nth-child(odd){text-align:end}
.intro{align-items:center}
.intro img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius);max-width:24rem;margin-inline-start:auto}
.intro p{font-family:var(--font-heading);letter-spacing:var(--heading-tracking);font-size:clamp(1.25rem,2vw,1.55rem);line-height:1.5;max-width:30ch;text-align:start}
.intro:has(${ART}){display:block}.intro:has(${ART})::before{display:none}.intro figure:has(${ART}){display:none}
.intro:has(${ART}) p{max-width:36ch;margin-inline:auto;text-align:center}
.svc{row-gap:0}
.svc li{padding-block:1.4rem;border-top:1px solid var(--hair)}
.svc li:nth-child(1),.svc li:nth-child(2){border-top:0;padding-top:0}
.svc li:last-child:nth-child(odd){grid-column:1/-1;text-align:center;position:relative;background:var(--paper);max-width:28rem;justify-self:center;width:100%}
.svc li:only-child{border-top:0}
.tint .svc li:last-child:nth-child(odd){background:var(--tint)}
.svc h3{font-size:1.3rem;line-height:1.3}
.svc p{color:var(--quiet);margin-top:.25rem}
.svc .pr{display:block;margin-top:.5rem;color:var(--deep);font-variant-numeric:tabular-nums lining-nums;font-weight:600}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:2.5rem var(--gap);max-width:60rem;margin-inline:auto}
.cols li{text-align:center}
.cols li::before{content:"";display:block;width:2rem;height:2px;background:var(--hair);margin:0 auto 1.25rem}
.cols .n{display:block;font-family:var(--font-heading);font-size:2.2rem;line-height:1;color:var(--deep);margin-bottom:.9rem;font-variant-numeric:lining-nums}
.cols.num li::before{display:none}
.cols h3{font-size:1.25rem;line-height:1.3;margin-bottom:.4rem}
.cols p{color:var(--quiet);max-width:30ch;margin-inline:auto}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.7rem,3.4vw,2.7rem);line-height:1.25;max-width:28ch;margin-inline:auto}
.qa{row-gap:0}
.qa h3{font-size:1.2rem;line-height:1.35;padding-block:1.25rem;border-top:1px solid var(--hair)}
.qa p{color:var(--quiet);padding-block:1.25rem;border-top:1px solid var(--hair);max-width:40ch}
.qa h3:first-child,.qa p:nth-child(2){border-top:0;padding-top:0}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--gap);max-width:60rem;margin-inline:auto}
.pair img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius)}
.end{background:var(--acc);color:var(--on-acc);--paper:var(--acc);--hair:color-mix(in oklab,var(--on-acc) 32%,var(--acc));--quiet:color-mix(in oklab,var(--on-acc) 80%,var(--acc))}
.end .in{padding-block:var(--sec) clamp(3rem,6vw,4.5rem)}
.end .mark{background:var(--on-acc)}
.end h2{font-size:clamp(2.1rem,4.4vw,3.5rem);line-height:1.1;max-width:20ch;margin:0 auto 1rem}
.end .sub{color:var(--quiet);max-width:42ch;margin:0 auto 2.25rem;font-size:1.15rem}
.end .btn{background:var(--on-acc);color:var(--acc)}
.facts{margin-top:clamp(3rem,6vw,4.5rem);row-gap:0;max-width:44rem}
.facts dt,.facts dd{padding-block:.85rem;border-top:1px solid var(--hair)}
.facts dt{color:var(--quiet)}
.facts dd{overflow-wrap:anywhere;text-align:start}
.facts dt:first-child,.facts dd:nth-child(2){border-top:0}
.facts dd a{text-decoration:none}
.facts .ln{display:block}
.foot{border-top:1px solid var(--hair);padding-block:1.5rem;display:flex;flex-direction:column;align-items:center;gap:.15rem;font-size:.9rem;color:var(--quiet);text-align:center}
.foot span:first-child{font-family:var(--font-heading);color:var(--on-acc);font-size:1rem}
@media (max-width:820px){.mast{grid-template-columns:minmax(0,1fr)}.mast nav{display:none}.mast .tag{order:2;margin-inline:auto;text-align:center}.mast b{margin-inline:auto}
.spread{grid-template-columns:minmax(0,1fr)}.spread::before{display:none}.spread>:nth-child(odd){text-align:start}
.intro{gap:2rem;justify-items:center}.intro img{margin-inline:auto}.intro p{text-align:center;margin-inline:auto}
.svc li,.svc li:nth-child(2){border-top:1px solid var(--hair);padding-top:1.4rem}.svc li:first-child{border-top:0;padding-top:0}.spread.svc>li{text-align:center}
.qa h3{padding-bottom:.4rem}.qa p{border-top:0;padding-top:0}.qa p:nth-child(2){padding-top:0}.spread.qa>*{text-align:center;margin-inline:auto}
.facts{text-align:center}.facts dt,.facts dd,.facts>:nth-child(odd){text-align:center}.facts dt{padding-bottom:0}.facts dd{border-top:0;padding-top:.15rem}.facts dt:first-child{padding-top:0}
.pair{grid-template-columns:minmax(0,1fr)}.pair figure{max-width:22rem;margin-inline:auto;width:100%}.bleed img{aspect-ratio:3/2}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="sec say c tint">
        <div className="w">
          <span className="mark" aria-hidden="true" />
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="sec" id="questions">
        <div className="w">
          <h2 className="t">Questions</h2>
          <div className="spread qa">
            {c.faq?.map((f) => (
              <Fragment key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </Fragment>
            ))}
          </div>
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="sec">
        <div className="w pair">
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
  const steps = x === 'steps'
  return (
    <section className="sec">
      <div className="w">
        <h2 className="t">{l.title}</h2>
        <ol className={steps ? 'cols num' : 'cols'}>
          {l.items.map((it, i) => (
            <li key={it.title}>
              {steps && <span className="n">{i + 1}</span>}
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
  const offer = offerItems(c)
  return (
    <>
      <header className="w mast">
        <p className="tag">{c.tagline}</p>
        <b>{c.name}</b>
        <nav>
          {links(c, extras).map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
      </header>
      <div className="w hero c">
        <h1>{c.headline}</h1>
        <p className="sub">{c.subhead}</p>
        <a className="btn" href="#visit">
          {c.cta.label}
        </a>
      </div>
      <figure className="bleed">
        <Pic photo={c.photos.hero} eager />
      </figure>
      <main>
        <section className="sec tint">
          <div className="w spread intro">
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
            <p>{c.about}</p>
          </div>
        </section>
        {offer.length > 0 && (
          <section className="sec" id="offer">
            <div className="w">
              <h2 className="t">{c.offerTitle}</h2>
              <ul className="spread svc">
                {offer.map((it) => (
                  <li key={it.name}>
                    <h3>{it.name}</h3>
                    {it.detail && <p>{it.detail}</p>}
                    {it.price && <span className="pr">{it.price}</span>}
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
      </main>
      <footer className="end c" id="visit">
        <div className="w in">
          <span className="mark" aria-hidden="true" />
          <h2>{c.cta.headline}</h2>
          <p className="sub">{c.cta.subhead}</p>
          {reach && (
            <a className="btn" href={reach.href}>
              {c.cta.label}
            </a>
          )}
          {hasVisit(c) && (
            <dl className="spread facts">
              {f.map((x) => (
                <Fragment key={x.label}>
                  <dt>{x.label}</dt>
                  <dd>
                    {x.label === 'Hours' ? (
                      c.hours.map((h) => (
                        <span className="ln" key={h.days}>
                          {[h.days, h.time].filter(Boolean).join(' ')}
                        </span>
                      ))
                    ) : x.href ? (
                      <a href={x.href}>{x.value}</a>
                    ) : (
                      x.value
                    )}
                  </dd>
                </Fragment>
              ))}
            </dl>
          )}
        </div>
        <div className="foot">
          <span>{c.name}</span>
          <span>{c.tagline}</span>
        </div>
      </footer>
    </>
  )
}

export const classic: Template = {
  id: 'classic',
  label: 'Classic',
  text: 'Calm, symmetrical and quietly formal like a good letterhead: the name centred in a balanced masthead, a centred opening with wide margins, and the introduction, services, questions and contact details set as spreads mirrored about one fine centre rule; no ornament, colour only in the rules, the button and the closing band, for solicitors, accountants, private clinics and other professional practices.',
  dark: false,
  css: CSS,
  Page,
}
