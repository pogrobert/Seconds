// Person: a page about one person, like a well-kept personal homepage or CV. Light paper, and the
// name set very large across the top: the one bold thing. Everything else is small and quiet on
// one CV grid: a narrow margin column on the left holds each section's heading, small and in the
// person's colour, and the contact labels at the close; the words run in the column beside it.
// The work or roles are a clean, unruled list of names with prices on the right. A small portrait
// sits under the role beside the headline; with no photos it goes and the page is all type.
// For portfolios, freelancers, writers, coaches, CVs and pages about famous people or characters.

import { Fragment } from 'react'
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

const ART = 'img[data-art],img[src^="data:image/svg"]'

const CSS = `${RESET}
:root{--paper:color-mix(in oklab,var(--band) 3%,#fbfaf7);--ink:color-mix(in oklab,var(--band) 16%,#161616);--quiet:color-mix(in oklab,var(--ink) 64%,var(--paper));--acc:color-mix(in oklab,var(--band) 86%,#000);--line:color-mix(in oklab,var(--ink) 13%,var(--paper));--w:72rem;--gut:clamp(1.25rem,4vw,3rem);--sec:clamp(3.25rem,6.5vw,5.5rem);--gap:clamp(1rem,2.5vw,2.5rem)}
body{background:var(--paper);color:var(--ink);font-size:1.0625rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.g{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gap)}
.lab{grid-column:1/span 3;min-width:0}
.txt{grid-column:4/span 7;min-width:0}
.wide{grid-column:4/-1;min-width:0}
.nav{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:.35rem 1.75rem;padding-block:1.5rem;font-size:.95rem}
.nav a{text-decoration:none;color:var(--quiet)}.nav a:hover{color:var(--ink);text-decoration:underline;text-underline-offset:.3em}
.nm{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:calc(var(--heading-tracking) - .02em);text-transform:var(--heading-case);line-height:.92;overflow-wrap:break-word;hyphens:auto;text-wrap:balance;padding-block:clamp(2.5rem,8vw,6.5rem) clamp(2.25rem,4.5vw,3.75rem)}
.nm.xl{font-size:clamp(3.4rem,12vw,10.5rem)}
.nm.l{font-size:clamp(2.6rem,8vw,7rem)}
.nm.m{font-size:clamp(2.1rem,5vw,4.5rem);line-height:1}
.open{padding-bottom:var(--sec);row-gap:2rem;align-items:start}
.tag{color:var(--quiet);line-height:1.45;max-width:24ch}
.pt{margin-top:1.5rem}
.pt img{width:100%;max-width:15rem;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius)}
.pt:has(${ART}){display:none}
h1{font-size:clamp(1.75rem,3vw,2.6rem);line-height:1.15;max-width:24ch;margin-bottom:1.25rem}
.sub{font-size:1.15rem;color:var(--quiet);max-width:42ch;margin-bottom:2rem}
.btn{display:inline-block;padding:.8rem 1.4rem;border-radius:var(--button-radius);background:var(--band);color:var(--band-foreground);font-weight:600;text-decoration:none;line-height:1.3}
.btn:hover{filter:brightness(1.08)}
.sec{padding-block:var(--sec);background:linear-gradient(var(--line),var(--line)) top center/calc(100% - 2 * var(--gut)) 1px no-repeat}
.pics{padding-bottom:var(--sec)}
.lab h2{font-size:1.1rem;line-height:1.35;color:var(--acc);padding-top:.2rem}
.about{font-size:clamp(1.2rem,1.7vw,1.4rem);line-height:1.6}
.pair,.gal{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--gap);align-items:start}
.pair img,.gal img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:var(--radius)}
.gal{grid-column:1/-1}
.work>li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.2rem 2rem;align-items:baseline}
.work>li+li{margin-top:1.75rem}
.work h3{font-size:clamp(1.25rem,1.9vw,1.55rem);line-height:1.25;overflow-wrap:break-word}
.work .pr{color:var(--quiet);white-space:nowrap}
.work p{grid-column:1/-1;color:var(--quiet);max-width:58ch}
.ls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.75rem var(--gap)}
.ls.c3{grid-template-columns:repeat(3,minmax(0,1fr))}.ls.c1{grid-template-columns:minmax(0,1fr)}
.ls h3,.qa h3{font-size:1.15rem;line-height:1.35;margin-bottom:.3rem}
.ls p,.qa p{color:var(--quiet)}
.steps>li{display:grid;grid-template-columns:2.25rem minmax(0,1fr);align-items:baseline}
.steps>li+li{margin-top:1.5rem}
.steps .n{grid-row:span 2;font-family:var(--font-heading);color:var(--acc);font-variant-numeric:tabular-nums;font-size:1.15rem}
.steps h3{font-size:1.15rem;line-height:1.35;margin-bottom:.3rem}.steps p{grid-column:2;color:var(--quiet)}
.say{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.45rem,2.6vw,2.1rem);line-height:1.3;max-width:30ch}
.qa>div+div{margin-top:1.75rem}
.qa p{max-width:60ch}
.end h2{font-size:clamp(1.9rem,3.6vw,3rem);line-height:1.1;margin-bottom:1rem;max-width:20ch}
.end .sub{margin-bottom:1.75rem}
.end .sec{padding-bottom:clamp(2.5rem,5vw,4rem)}
.facts{padding-bottom:var(--sec)}
.facts>div{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gap);padding-block:1rem;border-top:1px solid var(--line)}
.facts dt{grid-column:1/span 3;color:var(--acc)}
.facts dd{grid-column:4/span 7;font-size:1.1rem;overflow-wrap:anywhere}
.facts dd a{text-decoration:none;border-bottom:1px solid var(--line)}.facts dd a:hover{border-color:currentColor}
.foot{display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem 1.5rem;padding-block:2rem 2.5rem;border-top:1px solid var(--line);color:var(--quiet);font-size:.9rem}
@media (max-width:860px){.txt{grid-column:4/-1}.ls,.ls.c3{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.nm.xl{font-size:min(15vw,4.75rem)}.g{grid-template-columns:minmax(0,1fr)}.g>*{grid-column:1/-1!important}.lab h2{margin-bottom:1.25rem;padding-top:0}.open{row-gap:1.5rem}.pt{margin-top:1.25rem}.pt img{max-width:11rem}.nav{justify-content:flex-start}.facts>div{grid-template-columns:5.5rem minmax(0,1fr);column-gap:1rem}.facts dt,.facts dd{grid-column:auto}.pair,.gal{gap:.75rem}}`

/** The name's size: very large when short, stepped down so a long name or word still fits. */
function nameSize(name: string) {
  const longest = Math.max(...name.split(/\s+/).map((w) => w.length))
  if (name.length > 30 || longest > 14) return 'm'
  if (name.length > 16 || longest > 9) return 'l'
  return 'xl'
}

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="w g sec">
        <p className="txt say">{c.statement}</p>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="w g sec" id="questions">
        <div className="lab">
          <h2>Questions</h2>
        </div>
        <div className="txt qa">
          <FaqList faq={c.faq} />
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="w g sec">
        <div className="gal">
          <figure>
            <Pic photo={c.photos.d2} />
          </figure>
          <figure>
            <Pic photo={c.photos.cta} />
          </figure>
        </div>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  const steps = x === 'steps'
  return (
    <section className="w g sec">
      <div className="lab">
        <h2>{l.title}</h2>
      </div>
      <ol
        className={
          steps
            ? 'txt steps'
            : `wide ls c${l.items.length === 3 ? 3 : l.items.length === 1 ? 1 : 2}`
        }
      >
        <ListItems items={l.items} numbered={steps} />
      </ol>
    </section>
  )
}

function Page({ c, extras }: TemplateProps) {
  const xs = present(c, extras)
  const f = facts(c)
  const reach = reachOf(f)
  const offer = offerItems(c)
  return (
    <>
      <header className="w">
        <nav className="nav">
          <NavLinks links={links(c, extras)} />
        </nav>
        <p className={`nm ${nameSize(c.name)}`}>{c.name}</p>
        <div className="g open">
          <div className="lab">
            <p className="tag">{c.tagline}</p>
            <figure className="pt">
              <Pic photo={c.photos.hero} eager />
            </figure>
          </div>
          <div className="txt">
            <h1>{c.headline}</h1>
            <p className="sub">{c.subhead}</p>
            <a className="btn" href="#visit">
              {c.cta.label}
            </a>
          </div>
        </div>
      </header>
      <main>
        <section className="w g sec">
          <p className="txt about">{c.about}</p>
        </section>
        <section className="w g pics">
          <div className="wide pair">
            <figure>
              <Pic photo={c.photos.about} />
            </figure>
            <figure>
              <Pic photo={c.photos.d1} />
            </figure>
          </div>
        </section>
        {offer.length > 0 && (
          <section className="w g sec" id="offer">
            <div className="lab">
              <h2>{c.offerTitle}</h2>
            </div>
            <ul className="txt work">
              {offer.map((it) => (
                <li key={it.name}>
                  <h3>{it.name}</h3>
                  {it.price ? <span className="pr">{it.price}</span> : <span />}
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
      <footer className="end" id="visit">
        <div className="w g sec">
          <div className="txt">
            <h2>{c.cta.headline}</h2>
            <p className="sub">{c.cta.subhead}</p>
            {reach && (
              <a className="btn" href={reach.href}>
                {c.cta.label}
              </a>
            )}
          </div>
        </div>
        {hasVisit(c) && (
          <dl className="w facts">
            <FactRows facts={f} />
          </dl>
        )}
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

export const person: Template = {
  id: 'person',
  label: 'Person',
  text: "A quiet personal homepage on light paper: the person's name set very large across the top, their role and a small portrait beside the headline, then their work, roles or services as a clean list, every heading small in their own colour in a margin on the left like a well-kept CV: personal, calm and understated, for portfolios, freelance developers and designers, writers, coaches, CVs and pages about famous people or characters.",
  dark: false,
  css: CSS,
  Page,
}
