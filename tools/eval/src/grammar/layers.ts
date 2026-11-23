// Round 2 layers of the design-rules proof (docs/m0/13-design-rules-2.md):
// - Hero: how the page opens. "Native" keeps the composition's own opening; "photo" and "colour"
//   replace it, the two strongest openings on award-level local sites (docs/research/
//   2026-11-16-fine-to-ten.md): the real room full-screen with the name, or big type on the
//   brand colour with the photo in a soft organic shape.
// - Signature detail: exactly one human touch per site, built only from the business's own facts.

import { btn, type Content, esc, fit, headline, img, nav } from './page.ts'

export type HeroRule = {
  key: string
  label: string
  text: string
  css: string
  /** null keeps the composition's own opening. */
  html: ((c: Content, slot: string) => string) | null
}

export const HERO_RULES: HeroRule[] = [
  {
    key: 'native',
    label: 'Layout’s own',
    text: 'Opens with the headline and a photo arranged by the page layout itself: balanced and informative',
    css: '',
    html: null,
  },
  {
    key: 'photo',
    label: 'Photo first',
    text: 'Opens with one full-screen photo of the real place and just the business name on it, no slogan: confident, quiet and atmospheric',
    css: `
.h-photo{position:relative;min-height:max(620px,100svh);display:grid;grid-template-rows:auto 1fr;color:#fff;isolation:isolate;overflow:hidden}
.h-photo > figure{position:absolute;inset:0;z-index:-2}
.h-photo::before{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(to top,rgb(14 12 16 / 0.8) 0%,rgb(14 12 16 / 0.5) 30%,rgb(14 12 16 / 0) 58%,rgb(14 12 16 / 0) 78%,rgb(14 12 16 / 0.42) 100%)}
.h-photo .h-bar .lab{color:inherit}
.h-photo .btn{background:#fff;color:#19171a}
.h-photo .copy{align-self:end;padding:0 var(--g) clamp(28px,4vw,56px);display:grid;gap:20px}
.h-photo .name{font-size:min(calc(94cqi / (var(--chars) * var(--adv))),22vw);line-height:0.9;white-space:nowrap}
.h-photo .row{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:16px 32px}
.h-photo .row .lead{max-width:30em}
.h-photo .slot{top:clamp(90px,12vh,140px);bottom:auto;right:var(--g)}
@media (max-width:700px){.h-photo .name{white-space:normal;font-size:min(calc(94cqi / (var(--long) * var(--adv))),20vw)}}
`,
    html: (c, slot) => `
<section class="h-photo">
  <figure>${img(c.photos.hero, 'cover', true)}</figure>
  <div class="h-bar"><p class="lab">${esc(c.tagline)}</p>${nav(c)}</div>
  <div class="copy cq">${fit('h1', 'name', c.name)}<div class="row"><p class="lead">${esc(c.subhead)}</p>${btn(c)}</div></div>
  ${slot}
</section>`,
  },
  {
    key: 'colour',
    label: 'Type on colour',
    text: 'Opens with a big headline set on a solid block of the brand colour, the photo cut into a soft rounded shape beside it: bold, warm and graphic',
    css: `
.h-colour{background:var(--band);color:var(--on-band)}
.h-colour .btn{background:var(--on-band);color:var(--band)}
.h-colour .h-bar .name{font-size:clamp(20px,1.8vw,26px);line-height:1.1}
.h-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:var(--g);align-items:center;padding:clamp(28px,5vw,80px) var(--g) clamp(48px,7vw,112px)}
.h-grid .text{display:grid;gap:26px;justify-items:start}
.h-grid .lead{max-width:30em}
.h-pic{position:relative}
.h-blob{aspect-ratio:4/5;overflow:hidden;border-radius:46% 54% 44% 56% / 56% 44% 56% 44%}
.h-pic .slot{left:-8px;right:auto;bottom:6%}
@media (max-width:860px){.h-grid{grid-template-columns:minmax(0,1fr)}.h-pic{width:min(100%,420px);justify-self:end}}
`,
    html: (c, slot) => `
<section class="h-colour">
  <div class="h-bar"><p class="name">${esc(c.name)}</p>${nav(c)}</div>
  <div class="h-grid">
    <div class="text cq">${headline('h1', 'd1', c.headline)}<p class="lead">${esc(c.subhead)}</p>${btn(c)}</div>
    <div class="h-pic"><figure class="h-blob">${img(c.photos.hero, 'cover', true)}</figure>${slot}</div>
  </div>
</section>`,
  },
]

/* ------------------------------------------------------------------ signature detail */

export type DetailRule = {
  key: string
  label: string
  text: string
  css: string
  /** Which facts it needs; a rule is offered only when the business has them. */
  fits: (c: Content) => boolean
  /** Something placed on the opening photo. */
  slot?: (c: Content) => string
  /** A strip above the page. */
  before?: (c: Content) => string
  /** A section right after the opening. */
  after?: (c: Content) => string
}

const initials = (name: string) =>
  name
    .replace(/^the\s+/i, '')
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

export const DETAIL_RULES: DetailRule[] = [
  {
    key: 'stamp',
    label: 'Stamp',
    text: 'A round, slightly tilted stamp on the main photo with the year the business opened and its neighbourhood: playful, human and local',
    fits: (c) => !!c.facts.founded,
    css: `
.stamp{width:clamp(104px,9vw,136px);aspect-ratio:1;border-radius:50%;background:var(--btn);color:var(--on-btn);transform:rotate(-12deg);display:grid;place-items:center}
.stamp svg{width:100%;height:100%;overflow:visible}
.stamp text{fill:currentColor;font-family:var(--f-l);font-weight:600;font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase}
.stamp .mid{font-family:var(--f-d);font-weight:var(--w-d);font-size:30px;letter-spacing:0;text-transform:none}
`,
    slot: (c) => {
      const ring = `${c.name.length <= 18 ? `${c.name} · ` : ''}Since ${c.facts.founded} · ${c.facts.area} · `
      return `<div class="slot stamp" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="ring" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/></defs><text><textPath href="#ring" textLength="282" lengthAdjust="spacing">${esc(ring.toUpperCase())}</textPath></text><text class="mid" x="60" y="71" text-anchor="middle">${esc(String(c.facts.founded).slice(-2))}’</text></svg></div>`
    },
  },
  {
    key: 'monogram',
    label: 'Monogram',
    text: "A round monogram with the business's initials, like a maker's mark, on the main photo: crafted, classic and personal",
    fits: (c) => initials(c.name).length > 0,
    css: `
.mono{width:clamp(88px,7.5vw,116px);aspect-ratio:1;border-radius:50%;background:var(--btn);color:var(--on-btn);display:grid;place-items:center;box-shadow:inset 0 0 0 4px var(--btn),inset 0 0 0 5px var(--on-btn)}
.mono span{font-family:var(--f-d);font-weight:var(--w-d);font-size:clamp(30px,2.6vw,40px);letter-spacing:0.02em;line-height:1;text-transform:none}
`,
    slot: (c) =>
      `<div class="slot mono" aria-hidden="true"><span>${esc(initials(c.name))}</span></div>`,
  },
  {
    key: 'numbers',
    label: 'Numbers',
    text: 'A row of a few big numbers right after the opening, such as the year it opened and the number of reviews: factual, proud and reassuring',
    fits: (c) => !!(c.facts.founded && c.facts.reviews),
    css: `
.d-numbers{padding:clamp(40px,5vw,72px) var(--g);border-bottom:1px solid var(--line)}
.d-numbers dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px var(--g);margin:0}
.d-numbers div{display:flex;flex-direction:column-reverse;gap:8px}
.d-numbers dd{margin:0;font-family:var(--f-d);font-weight:var(--w-d);letter-spacing:var(--t-d);text-transform:var(--c-d);font-size:var(--d2);line-height:1}
.d-numbers dt{color:var(--muted)}
@media (max-width:700px){.d-numbers dl{grid-template-columns:minmax(0,1fr)}}
`,
    after: (c) => {
      const f = c.facts
      const items = [
        f.founded ? [String(f.founded), `Opened in ${f.area}`] : null,
        f.reviews ? [f.reviews, `Google reviews, ${f.rating ?? ''} ★`.replace(', ★', '')] : null,
        f.late ? [f.late.time, `Late opening on ${f.late.day}`] : null,
      ].filter((x): x is string[] => !!x)
      return `<section class="d-numbers" aria-label="At a glance"><dl>${items.map(([n, l]) => `<div><dt class="lab">${esc(l ?? '')}</dt><dd>${esc(n ?? '')}</dd></div>`).join('')}</dl></section>`
    },
  },
  {
    key: 'strip',
    label: 'Strip',
    text: 'A thin coloured strip across the very top of the page with the opening days, the late night and a booking link: practical, lively and welcoming',
    fits: (c) => !!c.facts.openDays,
    css: `
.d-strip{background:var(--band);color:var(--on-band);font-size:14px;line-height:1.4;padding:9px var(--g);text-align:center}
.d-strip a{color:inherit;font-weight:600}
`,
    before: (c) =>
      `<div class="d-strip"><p>Open ${esc(c.facts.openDays ?? '')}${c.facts.late ? ` · Late ${esc(c.facts.late.day)} till ${esc(c.facts.late.time)}` : ''} · <a href="${c.book}">Book online</a></p></div>`,
  },
]

/* ------------------------------------------------------------------ round 3 */

/**
 * The quiet opening (round 3, docs/m0/14-design-rules-3.md): one atmospheric photo across the
 * whole screen, a single short line set modestly in the middle, one outlined button. Every site
 * the author loved opens like this or close to it (Remedy Place, Heartcore, Humming Puppy, KOL).
 */
export const QUIET_HERO: HeroRule = {
  key: 'quiet',
  label: 'Quiet',
  text: 'Opens with one atmospheric full-screen photo, a single short line of small refined type in the middle and one understated button: calm, premium and confident',
  css: `
.h-quiet{position:relative;min-height:max(620px,100svh);display:grid;grid-template-rows:auto 1fr auto;color:#fff;isolation:isolate;overflow:hidden;text-align:center}
.h-quiet > figure{position:absolute;inset:0;z-index:-2}
.h-quiet::before{content:'';position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse 60% 50% at center,rgb(10 8 10 / 0.58) 0%,rgb(10 8 10 / 0.3) 70%,rgb(10 8 10 / 0.42) 100%),linear-gradient(to bottom,rgb(10 8 10 / 0.4),transparent 20%)}
.h-quiet .h-bar .name{font-size:clamp(17px,1.4vw,21px);letter-spacing:0.08em;text-transform:uppercase;line-height:1.1}
.h-quiet .h-bar .lab{color:inherit}
.h-quiet .center{align-self:center;justify-self:center;display:grid;gap:20px;justify-items:center;padding:0 var(--g);width:min(100%,48rem)}
.h-quiet .line{font-family:var(--f-d);font-weight:var(--w-d);letter-spacing:var(--t-d);text-transform:var(--c-d);font-size:min(clamp(30px,3.6vw,54px),calc(94cqi / (var(--long) * var(--adv))));line-height:1.08;text-wrap:balance}
.h-quiet .sub{font-size:15px;opacity:0.92;max-width:34em}
.h-quiet .btn{background:transparent;color:#fff;box-shadow:inset 0 0 0 1px rgb(255 255 255 / 0.85)}
.h-quiet .btn:hover{background:rgb(255 255 255 / 0.12)}
.h-quiet .nav .btn{box-shadow:inset 0 0 0 1px rgb(255 255 255 / 0.7)}
.h-quiet .foot{padding:0 var(--g) 22px;font-size:13px;opacity:0.85}
.h-quiet .slot{top:clamp(90px,12vh,140px);bottom:auto;right:var(--g)}
`,
  html: (c, slot) => `
<section class="h-quiet">
  <figure>${img(c.photos.hero, 'cover', true)}</figure>
  <div class="h-bar"><p class="name">${esc(c.name)}</p>${nav(c)}</div>
  <div class="center cq">${headline('h1', 'line', c.headline)}<p class="sub">${esc(c.subhead)}</p>${btn(c)}</div>
  <p class="foot">${esc(c.tagline)}</p>
  ${slot}
</section>`,
}
HERO_RULES.push(QUIET_HERO)

/** Restraint is a choice too: no signature detail at all. */
DETAIL_RULES.push({
  key: 'none',
  label: 'None',
  text: 'No decorative extras at all, nothing but the essentials: restrained, quiet and minimal',
  css: '',
  fits: () => true,
})

/* ------------------------------------------------------------------ photo treatment */

export type PhotoRule = {
  key: string
  label: string
  text: string
  /** Use the business's low-key photo set where it has one. */
  lowkey: boolean
  /** Which low-key photo opens the page: the place, or a person. */
  lead?: 'hero' | 'people'
  css: string
}

/**
 * How photos are chosen and graded. "Low-key" swaps in the business's atmospheric set and grades
 * every photo a little darker, warmer and denser, so even a bright stock photo sits in a deep page.
 */
export const PHOTO_RULES: PhotoRule[] = [
  {
    key: 'natural',
    label: 'Natural',
    text: 'Bright, natural, everyday photos shown as they are: open, honest and friendly',
    lowkey: false,
    css: '',
  },
  {
    key: 'lowkey',
    label: 'Low-key',
    text: 'Moody, atmospheric photos with low warm light and deep shadows, slightly darkened and warmed: cinematic, intimate and premium',
    lowkey: true,
    lead: 'hero',
    css: `
img.cover{filter:brightness(0.95) contrast(1.05) saturate(0.95) sepia(0.06)}
`,
  },
  {
    key: 'portrait',
    label: 'Low-key portrait',
    text: 'Opens on a moody, atmospheric portrait of a person in low warm light, the rest of the photos darkened and warmed to match: intimate, personal and editorial',
    lowkey: true,
    lead: 'people',
    css: `
img.cover{filter:brightness(0.95) contrast(1.05) saturate(0.95) sepia(0.06)}
`,
  },
]
