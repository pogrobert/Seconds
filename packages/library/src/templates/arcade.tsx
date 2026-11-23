// Arcade: energetic leisure. The page is cut into bold angled panels: the opening on the
// business's colour with a slanted lower edge, the offer on near-black with both edges slanted,
// the close climbing back in on the colour. Photos are cut as parallelograms, buttons and prices
// sit on sheared blocks, a statement runs across the page on a tilted band, and steps are big
// numbers on sheared tabs. Two grounds plus the colour, big type, plenty of contrast; fun without
// being childish. Photos optional: without them the opening's type takes the whole width. For
// escape rooms, climbing walls, bowling alleys, trampoline parks, go-karting, laser tag and
// other activity venues.

import { Fragment, type ReactNode } from 'react'
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

const ART = ':is(img[data-art],img[src^="data:image/svg"])'

const CSS = `${RESET}
:root{--acc:var(--band);--on-acc:var(--band-foreground);--ink:color-mix(in oklab,var(--band) 18%,#0d0d10);--on-ink:color-mix(in oklab,var(--band) 4%,#fbfaf6);--paper:color-mix(in oklab,var(--band) 4%,#fbfaf6);--text:color-mix(in oklab,var(--band) 20%,#121214);--quiet:color-mix(in oklab,var(--text) 68%,var(--paper));--hot:color-mix(in oklab,var(--band) 45%,#fff);--ink-line:color-mix(in oklab,var(--on-ink) 16%,var(--ink));--w:80rem;--gut:clamp(1.1rem,4vw,3rem);--sec:clamp(4rem,8vw,7rem);--tilt:clamp(2rem,5vw,4.5rem);--shear:-11deg}
body{background:var(--paper);color:var(--text);font-size:1.0625rem;line-height:1.55;overflow-x:clip}
.w{max-width:var(--w);margin-inline:auto;padding-inline:var(--gut)}
.top{background:var(--ink);color:var(--on-ink)}
.top .w{display:flex;justify-content:space-between;align-items:center;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.1rem}
.top b{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);text-transform:var(--heading-case);font-size:1.35rem;line-height:1.2;overflow-wrap:anywhere}
.top nav{display:flex;gap:.4rem 1.75rem;flex-wrap:wrap;font-weight:600;font-size:.95rem}.top nav a{text-decoration:none}.top nav a:hover{color:var(--hot)}
.btn{position:relative;z-index:0;display:inline-block;padding:1rem 1.9rem;font-weight:750;font-size:1.05rem;line-height:1.25;text-decoration:none;color:var(--paper)}
.btn::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--ink);transform:skewX(var(--shear));border-radius:var(--button-radius);transition:transform .15s}
.btn:hover::before{transform:skewX(var(--shear)) scale(1.05)}
.hero .btn,.end .btn{color:var(--acc)}.hero .btn::before,.end .btn::before{background:var(--on-acc)}
.hero{background:var(--acc);color:var(--on-acc);clip-path:polygon(0 0,100% 0,100% calc(100% - var(--tilt)),0 100%);padding-bottom:var(--tilt)}
.hero .w{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(2rem,5vw,4rem);align-items:center;padding-block:clamp(3rem,7vw,6rem) clamp(2.5rem,5vw,4rem)}
.hero .tag{font-weight:650;font-size:1.05rem;margin-bottom:1.25rem;max-width:44ch}
.hero h1{font-size:clamp(3rem,8.2vw,7.4rem);line-height:.9;letter-spacing:calc(var(--heading-tracking) - .015em);max-width:12ch;overflow-wrap:break-word;margin-bottom:clamp(1.5rem,3vw,2.25rem)}
.hero .sub{font-size:clamp(1.1rem,1.6vw,1.35rem);max-width:38ch;margin-bottom:2.25rem}
.hero figure{align-self:stretch;min-height:22rem;position:relative;clip-path:polygon(16% 0,100% 0,84% 100%,0 100%)}
.hero figure img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero .w:has(figure ${ART}){grid-template-columns:minmax(0,1fr)}
.hero figure:has(${ART}){display:none}
.hero .w:has(figure ${ART}) h1{font-size:clamp(3.2rem,10.5vw,9.5rem);max-width:13ch}
.sec{padding-block:var(--sec)}
h2{font-size:clamp(2.2rem,5.2vw,4.4rem);line-height:.95;max-width:16ch;overflow-wrap:break-word;margin-bottom:clamp(2rem,4vw,3rem)}
.about{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(2rem,5vw,5rem);align-items:center}
.about p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(1.45rem,2.6vw,2.15rem);line-height:1.25;max-width:30ch}
.about figure{clip-path:polygon(0 0,100% 0,100% 88%,0 100%)}
.about img{width:100%;aspect-ratio:4/5;object-fit:cover}
.about:has(${ART}){grid-template-columns:minmax(0,1fr)}
.about:has(${ART}) p{font-size:clamp(1.6rem,3.3vw,2.7rem);max-width:30ch}
.about figure:has(${ART}){display:none}
.ink{background:var(--ink);color:var(--on-ink)}
.cut{clip-path:polygon(0 var(--tilt),100% 0,100% calc(100% - var(--tilt)),0 100%);padding-block:calc(var(--sec) + var(--tilt))}
.g{font-size:clamp(1.3rem,2vw,1.6rem);line-height:1.2;color:var(--hot);margin:clamp(2rem,4vw,3rem) 0 .5rem}
h2+div>.g{margin-top:0}
.bars li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.35rem 2rem;align-items:center;padding-block:clamp(1.1rem,2vw,1.5rem);border-top:2px solid var(--ink-line)}
.bars li:last-child{border-bottom:2px solid var(--ink-line)}
.bars h3{font-size:clamp(1.45rem,2.8vw,2.3rem);line-height:1.05;overflow-wrap:anywhere}
.bars p{grid-column:1;color:color-mix(in oklab,var(--on-ink) 72%,var(--ink));max-width:58ch}
.bars .pr{grid-column:2;grid-row:1/span 2;position:relative;z-index:0;padding:.55rem 1.2rem;margin-inline-end:.5rem;color:var(--ink);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:clamp(1.2rem,2vw,1.6rem);line-height:1.15;font-variant-numeric:tabular-nums;max-width:13rem;text-align:center;overflow-wrap:anywhere}
.bars .pr::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--on-ink);transform:skewX(var(--shear))}
.bars li:not(:has(p)) .pr{grid-row:1}
.tiltband{margin-block:calc(var(--sec) * .6);background:var(--acc);color:var(--on-acc);transform:skewY(-2.5deg)}
.tiltband .w{transform:skewY(2.5deg);padding-block:clamp(3rem,6vw,5rem)}
.tiltband p{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);font-size:clamp(2rem,4.8vw,4rem);line-height:1.02;max-width:20ch;overflow-wrap:break-word}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:2.5rem clamp(1.5rem,3vw,3rem)}
.cols li::before{content:"";display:block;width:3.25rem;height:.7rem;background:var(--acc);transform:skewX(var(--shear));margin:0 0 1.1rem .2rem}
.cols h3{font-size:clamp(1.35rem,2vw,1.65rem);line-height:1.1;margin-bottom:.5rem}
.cols p{color:var(--quiet);max-width:40ch}
.steps .n{position:relative;z-index:0;display:inline-grid;place-items:center;min-width:4.2rem;height:4.2rem;padding-inline:.9rem;margin:0 0 1.25rem .4rem;color:var(--on-acc);font-family:var(--font-heading);font-weight:var(--heading-weight);font-size:2.2rem;line-height:1;font-variant-numeric:lining-nums tabular-nums}
.steps .n::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--acc);transform:skewX(var(--shear))}
.steps li::before{display:none}
.qa div{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:.4rem 2.5rem;padding-block:1.3rem;border-top:3px solid var(--text)}
.qa div:last-child{border-bottom:3px solid var(--text)}
.qa h3{font-size:clamp(1.2rem,1.8vw,1.45rem);line-height:1.2}
.qa p{color:var(--quiet);max-width:60ch}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0}
.pair figure:first-child{clip-path:polygon(0 0,100% 0,90% 100%,0 100%);margin-inline-end:-1.75rem}
.pair figure+figure{clip-path:polygon(10% 0,100% 0,100% 100%,0 100%);margin-inline-start:-1.75rem}
.pair img{width:100%;aspect-ratio:3/2;object-fit:cover}
.pair:has(${ART}) figure{clip-path:none;margin-inline:0!important}
.end{background:var(--acc);color:var(--on-acc);clip-path:polygon(0 var(--tilt),100% 0,100% 100%,0 100%);margin-top:calc(var(--sec) * .5);padding-block:calc(var(--sec) + var(--tilt)) var(--sec)}
.end .w{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(2rem,5vw,4rem);align-items:start}
.end h2{font-size:clamp(2.6rem,6.4vw,5.6rem);line-height:.92;max-width:13ch;margin-bottom:1.25rem}
.end .sub{font-size:1.2rem;max-width:38ch;margin-bottom:2.25rem}
.end figure{clip-path:polygon(14% 0,100% 0,86% 100%,0 100%)}
.end figure img{width:100%;aspect-ratio:4/3;object-fit:cover}
.end figure:has(${ART}){display:none}
.end dl{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr));gap:1.5rem 2.5rem;margin-top:clamp(1.5rem,3vw,2.5rem)}
.end dl>div{border-top:3px solid currentColor;padding-top:.8rem}
.end dt{font-weight:700;font-size:.92rem;margin-bottom:.2rem}
.end dd{font-size:1.1rem;overflow-wrap:anywhere}
.end dd a{text-decoration:none;border-bottom:2px solid currentColor}
.end .w:has(figure ${ART}) dl{grid-column:auto}
.end .w:has(figure ${ART}){grid-template-columns:minmax(0,1fr)}
.foot{background:var(--ink);color:var(--on-ink)}
.foot .w{display:flex;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;padding-block:1.6rem;font-size:.92rem}
.foot span{color:color-mix(in oklab,var(--on-ink) 70%,var(--ink))}
@media (max-width:820px){.top nav{display:none}.hero .w,.about,.end .w{grid-template-columns:minmax(0,1fr)}.hero figure{min-height:0;order:-1;margin-inline:calc(var(--gut) * -1);clip-path:polygon(0 0,100% 0,100% 82%,0 100%)}.hero figure img{position:static;aspect-ratio:4/3;height:auto}.about figure{max-width:24rem}.qa div{grid-template-columns:minmax(0,1fr)}.bars li{grid-template-columns:minmax(0,1fr)}.bars .pr{grid-column:1;grid-row:auto;justify-self:start;margin-top:.4rem}.bars p{grid-column:1}.bars li:not(:has(p)) .pr{grid-row:auto}.hero .w{padding-top:0}.end figure{max-width:26rem}}`

function Title({ children }: { children: ReactNode }) {
  return <h2>{children}</h2>
}

function Extras({ c, x }: { c: TemplateProps['c']; x: Extra }) {
  if (x === 'statement')
    return (
      <section className="tiltband">
        <div className="w">
          <p>{c.statement}</p>
        </div>
      </section>
    )
  if (x === 'faq')
    return (
      <section className="w sec" id="questions">
        <Title>Questions</Title>
        <div className="qa">
          <FaqList faq={c.faq} />
        </div>
      </section>
    )
  if (x === 'gallery')
    return (
      <section className="w sec">
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
  const steps = x === 'steps'
  return (
    <section className={`w sec${steps ? ' steps' : ''}`} id={x}>
      <Title>{l.title}</Title>
      <ol className="cols">
        <ListItems items={l.items} numbered={steps} />
      </ol>
    </section>
  )
}

type Item = { name: string; detail?: string; price: string }

function Bars({ list }: { list: Item[] }) {
  return (
    <ul className="bars">
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
            <NavLinks links={links(c, extras)} />
          </nav>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="w">
            <div>
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
        </section>
        <section className="w sec about">
          <p>{c.about}</p>
          <figure>
            <Pic photo={c.photos.about} />
          </figure>
        </section>
        {offerItems(c).length > 0 && (
          <section className="ink cut" id="offer">
            <div className="w">
              <Title>{c.offerTitle}</Title>
              {named ? (
                groups.map((g, i) => (
                  <div key={g.group || i}>
                    {g.group && <h3 className="g">{g.group}</h3>}
                    <Bars list={g.items} />
                  </div>
                ))
              ) : (
                <Bars list={offerItems(c)} />
              )}
            </div>
          </section>
        )}
        {xs.map((x) => (
          <Fragment key={x}>
            <Extras c={c} x={x} />
          </Fragment>
        ))}
        <section className="end" id="visit">
          <div className="w">
            <div>
              <h2>{c.cta.headline}</h2>
              <p className="sub">{c.cta.subhead}</p>
              <a className="btn" href={reach?.href ?? '#offer'}>
                {c.cta.label}
              </a>
            </div>
            <figure>
              <Pic photo={c.photos.cta} />
            </figure>
            {hasVisit(c) && (
              <dl>
                <FactRows facts={f} />
              </dl>
            )}
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

export const arcade: Template = {
  id: 'arcade',
  label: 'Arcade',
  text: 'Energetic and bold: the page is cut into angled panels of the brand colour and near-black, photos are sliced as parallelograms, prices and buttons sit on slanted tabs, and a statement runs across a tilted band; loud, fun and full of contrast but never childish, for escape rooms, climbing and bouldering walls, bowling alleys, trampoline parks, go-karting, laser tag, axe throwing and other activity and leisure venues.',
  dark: false,
  css: CSS,
  Page,
}
