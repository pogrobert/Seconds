// Noticeboard: a community board. Under a plain paper sign with the name, the page is a felt board
// in the organisation's colour inside a wooden frame, and every section is a sheet of paper
// pinned to it: the welcome as the largest notice, the introduction on lined paper, each item of
// the offer on its own small card, the closing as a notice with the opening times. Sheets lean a
// little, never enough to slow reading, and stand straight on a phone. Photos are pinned up as
// prints; with none the board holds paper only. For churches, mosques, village halls, community
// centres and residents' associations.

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
const Pin = () => <span className="pin" aria-hidden="true" />

const CSS = `${RESET}
:root{--felt:var(--band);--on-felt:var(--band-foreground);--wood:color-mix(in oklab,var(--band) 22%,#5b4630);--paper:#fffefb;--sign:color-mix(in oklab,var(--band) 4%,#f6f3ec);--cream:color-mix(in oklab,var(--band) 3%,#fbf6e6);--pale:color-mix(in oklab,var(--band) 9%,#fff);--ink:color-mix(in oklab,var(--band) 20%,#17140f);--quiet:color-mix(in oklab,var(--ink) 72%,#fff);--rule:color-mix(in oklab,var(--band) 22%,#ddd8cc);--pinc:color-mix(in oklab,var(--band) 62%,#000);--w:76rem;--gut:clamp(1rem,3.5vw,2.5rem);--gap:clamp(2.5rem,5vw,4.5rem);--lift:0 1px 1px rgba(0,0,0,.18),0 .6rem 1.2rem -.6rem rgba(0,0,0,.45)}
body{background:var(--sign);color:var(--ink);font-size:1.125rem;line-height:1.6}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.sign .w{display:flex;justify-content:space-between;align-items:center;gap:1rem 2.5rem;flex-wrap:wrap;padding-block:clamp(1.25rem,3vw,2rem)}
.sign b{display:block;font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:clamp(1.45rem,2.6vw,2rem);line-height:1.15;max-width:28ch}
.sign small{display:block;font-size:1rem;color:var(--quiet);margin-top:.3rem;max-width:52ch}
.sign nav{display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;font-weight:600;font-size:1rem}
.sign nav a{text-underline-offset:.3em;text-decoration-thickness:1px}.sign nav a:hover{text-decoration-thickness:3px}
.board{margin-inline:clamp(.4rem,1.6vw,1.5rem);border:clamp(.55rem,1.4vw,.95rem) solid var(--wood);border-radius:calc(var(--radius) * .5);background-color:var(--felt);background-image:radial-gradient(color-mix(in oklab,var(--on-felt) 9%,transparent) 1px,transparent 1.6px),radial-gradient(color-mix(in oklab,#000 12%,transparent) 1px,transparent 1.6px);background-size:7px 7px,9px 9px;background-position:0 0,3px 4px;box-shadow:inset 0 0 0 1px color-mix(in oklab,#000 25%,transparent),inset 0 .4rem .8rem -.3rem rgba(0,0,0,.35);overflow:clip;padding-block:var(--gap)}
.board main{display:grid;gap:var(--gap);margin-top:var(--gap)}
.note{position:relative;background:var(--paper);color:var(--ink);padding:clamp(1.5rem,3.5vw,2.75rem);box-shadow:var(--lift)}
.pin{position:absolute;top:-.45rem;left:50%;width:1.05rem;height:1.05rem;margin-left:-.525rem;border-radius:50%;background:var(--pinc);box-shadow:inset -.14rem -.16rem 0 rgba(0,0,0,.3),inset .13rem .12rem 0 rgba(255,255,255,.35),0 .2rem .25rem rgba(0,0,0,.4);z-index:1}
.l{transform:rotate(-.6deg)}.r{transform:rotate(.5deg)}
.open{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:var(--gap);align-items:start}
.open.solo{grid-template-columns:minmax(0,1fr)}
.open.solo .main{max-width:50rem}
.main .tag{color:var(--quiet);font-weight:600;margin-bottom:1rem;padding-bottom:1rem;border-bottom:2px solid var(--felt);max-width:44ch}
.main h1{font-size:clamp(2.2rem,4.6vw,3.7rem);line-height:1.08;margin-bottom:1.25rem;max-width:18ch;overflow-wrap:break-word}
.main p.sub{font-size:clamp(1.15rem,1.6vw,1.3rem);max-width:42ch;margin-bottom:2rem}
.btn{display:inline-block;padding:.85rem 1.6rem;border-radius:var(--button-radius);background:var(--felt);color:var(--on-felt);font-weight:700;text-decoration:none;font-size:1.08rem;line-height:1.3}
.btn:hover{background:color-mix(in oklab,var(--felt) 82%,#000)}
.print{position:relative;background:var(--paper);padding:clamp(.5rem,1vw,.75rem) clamp(.5rem,1vw,.75rem) clamp(1.25rem,2.5vw,2rem);box-shadow:var(--lift);transform:rotate(1.4deg)}
.print img{width:100%;aspect-ratio:4/3;object-fit:cover}
.print.tall img{aspect-ratio:4/5}
.open .print{margin-top:clamp(1rem,3vw,2.5rem)}
.about{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:var(--gap);align-items:center}
.about.solo{grid-template-columns:minmax(0,1fr)}
.about .print{transform:rotate(-1.6deg);max-width:24rem;justify-self:center;width:100%}
.lined{background:var(--cream);border-inline-start:3px double color-mix(in oklab,var(--felt) 45%,#fff)}
.lined p{font-size:clamp(1.2rem,1.9vw,1.45rem);line-height:1.6em;max-width:44ch;background-image:linear-gradient(to bottom,transparent calc(100% - 1.5px),var(--rule) calc(100% - 1.5px));background-size:100% 1.6em;background-repeat:repeat-y}
.about.solo .note{max-width:52rem}
.title{display:inline-block;position:relative;justify-self:start;background:var(--paper);padding:.9rem clamp(1.25rem,3vw,2rem);box-shadow:var(--lift);transform:rotate(-.8deg);max-width:100%}
h2{font-size:clamp(1.7rem,3.2vw,2.5rem);line-height:1.12;max-width:24ch}
.note>h2{margin-bottom:clamp(1.25rem,3vw,2rem)}
.offer{display:grid;gap:clamp(1.75rem,3vw,2.5rem)}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,15.5rem),1fr));gap:clamp(1.75rem,3vw,2.5rem) clamp(1.25rem,2.5vw,2rem);align-items:start}
.cards li{position:relative;background:var(--paper);padding:1.6rem 1.35rem 1.35rem;box-shadow:var(--lift);display:flex;flex-direction:column;gap:.4rem}
.cards li:nth-child(3n+2){background:var(--pale);transform:rotate(.7deg)}
.cards li:nth-child(3n+1){transform:rotate(-.5deg)}
.cards li:nth-child(3n){background:var(--cream);transform:rotate(.3deg)}
.cards h3{font-size:1.28rem;line-height:1.25}
.cards p{color:var(--quiet);font-size:1.02rem;line-height:1.5}
.cards .pr{margin-top:.5rem;padding-top:.6rem;border-top:1px solid var(--rule);font-weight:700;font-variant-numeric:tabular-nums}
.say{max-width:52rem;justify-self:center;text-align:center;padding-block:clamp(2.5rem,6vw,4rem)}
.say p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.6rem,3.4vw,2.6rem);line-height:1.25;max-width:26ch;margin-inline:auto}
.list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 clamp(2rem,4vw,3.5rem)}
.list li{padding-block:1.1rem;border-top:1px solid var(--rule)}
.list h3,.steps h3,.qa h3{font-size:1.25rem;line-height:1.3;margin-bottom:.3rem}
.list p,.steps p,.qa p{color:var(--quiet)}
.steps li{display:grid;grid-template-columns:3.25rem minmax(0,1fr);gap:1rem;padding-block:1.1rem;border-top:1px solid var(--rule)}
.steps .n{font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:2.1rem;line-height:1;color:var(--felt);font-variant-numeric:tabular-nums}
.half{max-width:52rem}
.wide{max-width:62rem}
.half.r{justify-self:end;width:100%}
.qa div{padding-block:1.1rem;border-top:1px solid var(--rule)}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--gap);max-width:62rem;justify-self:center;width:100%;padding-inline:clamp(0rem,3vw,2rem)}
.pair figure:nth-child(2){transform:rotate(-1.2deg);margin-top:1.5rem}
.visit{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:var(--gap);align-items:center;margin-top:var(--gap)}
.visit.solo{grid-template-columns:minmax(0,1fr)}
.visit.solo .note{max-width:54rem}
.visit h2{font-size:clamp(2rem,4vw,3.1rem);margin-bottom:.9rem}
.visit p.sub{font-size:1.18rem;max-width:40ch;margin-bottom:1.75rem}
.visit dl{margin-top:2rem;border-top:2px solid var(--felt)}
.visit dl div{display:grid;grid-template-columns:6rem minmax(0,1fr);gap:1rem;padding-block:.9rem;border-bottom:1px solid var(--rule)}
.visit dt{font-weight:700}.visit dd{overflow-wrap:anywhere}.visit dd a{text-underline-offset:.2em}
.visit .print{max-width:24rem;justify-self:center;width:100%}
.foot .w{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.6rem;font-size:1rem;color:var(--quiet)}
.foot b{color:var(--ink);font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking)}
@media (max-width:860px){.open,.about,.visit,.list{grid-template-columns:minmax(0,1fr)}.open .print,.about .print,.visit .print{max-width:22rem;justify-self:center;margin-top:0}}
@media (max-width:640px){body{font-size:1.0625rem}.sign nav{display:none}.l,.r,.title,.cards li:nth-child(n){transform:none}.pair{grid-template-columns:minmax(0,1fr)}.pair figure:nth-child(2){margin-top:0}.visit dl div{grid-template-columns:minmax(0,1fr);gap:.1rem}.steps li{grid-template-columns:2.5rem minmax(0,1fr)}}`

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="note say r">
        <Pin />
        <p>{c.statement}</p>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="note half l" id="questions">
        <Pin />
        <h2>Questions</h2>
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
      <section className="pair">
        <figure className="print">
          <Pin />
          <Pic photo={c.photos.d1} />
        </figure>
        <figure className="print">
          <Pin />
          <Pic photo={c.photos.d2} />
        </figure>
      </section>
    )
  const l = listOf(c, x)
  if (!l) return null
  const steps = x === 'steps'
  return (
    <section className={steps ? 'note half r' : 'note wide l'}>
      <Pin />
      <h2>{l.title}</h2>
      <ol className={steps ? 'steps' : 'list'}>
        {l.items.map((it, i) => (
          <li key={it.title}>
            {steps && <span className="n">{i + 1}</span>}
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
  const reach = f.find((x) => x.href)
  const list = offerItems(c)
  const heroPic = !isArt(c.photos.hero)
  const aboutPic = !isArt(c.photos.about)
  const ctaPic = !isArt(c.photos.cta)
  return (
    <>
      <div className="sign">
        <div className="w">
          <div>
            <b>{c.name}</b>
            <small>{c.tagline}</small>
          </div>
          <nav>
            {links(c, extras).map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
      <div className="board">
        <div className="w">
          <header className={heroPic ? 'open' : 'open solo'}>
            <div className="note main l">
              <Pin />
              <p className="tag">{c.tagline}</p>
              <h1>{c.headline}</h1>
              <p className="sub">{c.subhead}</p>
              <a className="btn" href="#visit">
                {c.cta.label}
              </a>
            </div>
            {heroPic && (
              <figure className="print">
                <Pin />
                <Pic photo={c.photos.hero} eager />
              </figure>
            )}
          </header>
          <main>
            <section className={aboutPic ? 'about' : 'about solo'}>
              <div className="note lined r">
                <Pin />
                <p>{c.about}</p>
              </div>
              {aboutPic && (
                <figure className="print tall">
                  <Pin />
                  <Pic photo={c.photos.about} />
                </figure>
              )}
            </section>
            {list.length > 0 && (
              <section className="offer" id="offer">
                <div className="title">
                  <Pin />
                  <h2>{c.offerTitle}</h2>
                </div>
                <ul className="cards">
                  {list.map((it) => (
                    <li key={it.name}>
                      <Pin />
                      <h3>{it.name}</h3>
                      {it.detail && <p>{it.detail}</p>}
                      {it.price && <span className="pr">{it.price}</span>}
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
          <footer id="visit" className={ctaPic ? 'visit' : 'visit solo'}>
            <div className="note l">
              <Pin />
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
            {ctaPic && (
              <figure className="print tall">
                <Pin />
                <Pic photo={c.photos.cta} />
              </figure>
            )}
          </footer>
        </div>
      </div>
      <div className="foot">
        <div className="w">
          <b>{c.name}</b>
          <span>{c.tagline}</span>
        </div>
      </div>
    </>
  )
}

export const noticeboard: Template = {
  id: 'noticeboard',
  label: 'Noticeboard',
  text: "A community noticeboard: a felt board in the organisation's colour inside a wooden frame, every section a sheet of paper pinned to it, the welcome as the largest notice, the introduction on lined paper, each service, group or event on its own small pinned card and photos pinned up as prints; plain, friendly, dignified and very easy to read, for churches, mosques, synagogues, temples, parishes, village halls, community centres and residents' groups.",
  dark: false,
  css: CSS,
  Page,
}
