// Layer 1 of the design-rules proof (docs/m0/12-design-rules.md): six page compositions. A
// composition decides where things sit (grid, scale, how photos meet the edges, how sections are
// separated); it never sets a font. Each draws the same content: menu, opening, about, three
// reasons, prices, photos, visit, call to action and footer.

import {
  addressBlock,
  btn,
  type Composition,
  type Content,
  contact,
  contactLine,
  esc,
  fit,
  hasVisit,
  headline,
  hoursList,
  img,
  nav,
  priceRows,
  statement,
} from './page.ts'

const reasons = (c: Content) =>
  c.reasons.map((r) => `<li><h3 class="d3">${esc(r.title)}</h3><p>${esc(r.body)}</p></li>`).join('')

const year = 2026
const foot = (c: Content) =>
  `<p class="muted small">© ${year} ${esc(c.name)} · ${esc(c.tagline)}</p>`

/* 1 ---------------------------------------------------------------- monument */

const monument: Composition = {
  key: 'monument',
  label: 'Monument',
  text: 'The business name set enormous across the full width of the page, above a wide photo, with everything else small and aligned to a strict grid. Bold and graphic.',
  css: `
.m-top{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:20px var(--g)}
.m-name{padding:0 var(--g)}
.m-name .name{font-size:min(calc(96cqi / (var(--chars) * var(--adv))),20vw);line-height:0.86;white-space:nowrap;padding-top:0.06em}
@media (max-width:700px){.m-name .name{white-space:normal;font-size:min(calc(94cqi / (var(--long) * var(--adv))),20vw)}}
.m-photo{margin:clamp(14px,2vw,28px) var(--g) 0;aspect-ratio:16/7;overflow:hidden}
@media (max-width:700px){.m-photo{aspect-ratio:4/5}}
.m-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:24px var(--g);padding:clamp(28px,4vw,56px) var(--g) 0}
.m-grid > .cq:first-child{grid-column:1 / span 7}
.m-grid > :last-child{grid-column:9 / -1;display:grid;gap:22px;align-content:start;justify-items:start}
.m-row{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:28px var(--g);margin:var(--sp) var(--g) 0;padding-top:20px;border-top:2px solid var(--ink)}
.m-row > .lab{grid-column:1 / span 3}
.m-row > .body{grid-column:4 / -1;display:grid;gap:clamp(28px,3vw,44px);align-content:start}
.m-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(24px,3vw,48px)}
.m-three li{display:grid;gap:10px;align-content:start}
.m-pair{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g);margin:var(--sp) var(--g) 0;align-items:end}
.m-pair figure:first-child{grid-column:1 / span 8;aspect-ratio:3/2;overflow:hidden}
.m-pair figure:last-child{grid-column:9 / -1;aspect-ratio:4/5;overflow:hidden}
.m-visit{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--g)}
.m-visit > div{display:grid;gap:14px;align-content:start}
.m-cta{display:grid;gap:26px;justify-items:start}
.m-foot{margin-top:var(--sp);padding:0 var(--g) 28px;border-top:2px solid var(--ink)}
.m-foot .name{font-size:min(calc(96cqi / (var(--chars) * var(--adv))),20vw);line-height:0.9;white-space:nowrap;padding-top:0.12em}
.m-foot .row{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px 32px;margin-top:22px;font-size:14px}
@media (max-width:900px){
  .m-grid > .cq:first-child,.m-grid > :last-child,.m-row > .lab,.m-row > .body{grid-column:1 / -1}
  .m-three,.m-visit{grid-template-columns:minmax(0,1fr)}
  .m-pair figure:first-child,.m-pair figure:last-child{grid-column:1 / -1}
}
@media (max-width:700px){.m-foot .name{white-space:normal;font-size:min(calc(94cqi / (var(--long) * var(--adv))),20vw)}}
`,
  html: (c, slot) => `
<!--top--><header class="m-top"><p class="lab">${esc(c.tagline)}</p>${nav(c)}</header><!--/top-->
<main>
<!--hero--><section class="m-hero">
  <div class="m-name cq">${fit('h1', 'name', c.name)}</div>
  <figure class="m-photo has-slot">${img(c.photos.hero, 'cover', true)}${slot}</figure>
  <div class="m-grid">
    <div class="cq">${headline('h2', 'd2', c.headline)}</div>
    <div><p class="lead">${esc(c.subhead)}</p>${btn(c)}${c.proof ? `<p class="lab muted">${esc(c.proof)}</p>` : ''}</div>
  </div>
</section><!--/hero-->
<section class="m-row" id="about"><h2 class="lab">About</h2><div class="body">${statement(c.about)}<ul class="m-three">${reasons(c)}</ul></div></section>
<div class="m-pair"><figure>${img(c.photos.d1, 'cover')}</figure><figure>${img(c.photos.d2, 'cover')}</figure></div>
<section class="m-row" id="prices"><h2 class="lab">${esc(c.offerTitle)}</h2><div class="body">${priceRows(c)}</div></section>
${hasVisit(c) ? `<section class="m-row" id="visit"><h2 class="lab">Visit</h2><div class="body m-visit"><div>${hoursList(c)}</div><div>${addressBlock(c)}${c.visit ? `<p class="muted">${esc(c.visit)}</p>` : ''}${contact(c)}</div></div></section>` : ''}
<section class="m-row"><h2 class="lab">${esc(c.cta.label)}</h2><div class="body m-cta cq">${fit('p', 'd2', c.cta.headline)}<p class="lead">${esc(c.cta.subhead)}</p>${btn(c)}</div></section>
</main>
<footer class="m-foot cq">${fit('p', 'name', c.name, ' aria-hidden="true"')}<div class="row">${foot(c)}<span>${esc(contactLine(c))}</span></div></footer>
`,
}

/* 2 ---------------------------------------------------------------- split */

const split: Composition = {
  key: 'split',
  label: 'Split',
  text: 'The screen split into two halves all the way down: words on one side, a full-height photo on the other, swapping sides as you scroll. Balanced and modern.',
  css: `
.s-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);min-height:100svh}
.s-hero .text{display:flex;flex-direction:column;justify-content:space-between;gap:48px;padding:24px var(--g) clamp(28px,4vw,56px)}
.s-hero .bar{display:flex;justify-content:space-between;align-items:center;gap:20px}
.s-hero .name{font-size:clamp(20px,1.7vw,26px);line-height:1.1}
.s-hero .copy{display:grid;gap:26px;justify-items:start}
.s-hero .copy .lead{max-width:30em}
.s-hero figure{position:relative;min-height:320px}
.s-hero figure img{position:absolute;inset:0}
.s-half{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.s-half > figure{position:relative;min-height:clamp(380px,46vw,720px)}
.s-half > figure img{position:absolute;inset:0}
.s-half > .text{padding:var(--sp) var(--g);display:grid;gap:clamp(24px,3vw,40px);align-content:center}
.s-half.flip > figure{order:2}
.s-tint{background:var(--tint)}
.s-brand{background:var(--band);color:var(--on-band)}
.s-brand .btn,.b-brand .btn{background:var(--on-band);color:var(--band)}
.s-brand .hours div{border-color:color-mix(in oklab,var(--on-band) 30%,transparent)}
.s-brand a{color:inherit}
.s-reasons{display:grid;gap:26px}
.s-reasons li{display:grid;gap:6px;padding-top:18px;border-top:1px solid var(--line)}
.s-prices{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:var(--g);padding:var(--sp) var(--g)}
.s-prices > .head{display:grid;gap:20px;align-content:start;position:sticky;top:24px;align-self:start}
.s-pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.s-pair figure{aspect-ratio:1/1;overflow:hidden}
.s-foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px 32px;padding:28px var(--g);font-size:14px;border-top:1px solid var(--line)}
@media (max-width:860px){
  .s-hero,.s-half,.s-prices{grid-template-columns:minmax(0,1fr)}
  .s-hero{min-height:0}
  .s-hero figure{order:-1;aspect-ratio:4/5;min-height:0}
  .s-hero .text{gap:36px}
  .s-hero .bar{order:-2}
  .s-half > figure{min-height:0;aspect-ratio:4/3}
  .s-half.flip > figure{order:0}
  .s-prices > .head{position:static}
}
@media (max-width:860px){.s-hero{display:flex;flex-direction:column}.s-hero .text{display:contents}.s-hero .bar{padding:18px var(--g)}.s-hero .copy{padding:32px var(--g) 48px}}
`,
  html: (c, slot) => `
<main>
<!--hero--><section class="s-hero">
  <div class="text">
    <header class="bar"><p class="name">${esc(c.name)}</p>${nav(c)}</header>
    <div class="copy cq">${headline('h1', 'd1', c.headline)}<p class="lead">${esc(c.subhead)}</p>${btn(c)}</div>
    ${c.proof ? `<p class="lab muted">${esc(c.proof)}</p>` : '<span></span>'}
  </div>
  <figure class="has-slot">${img(c.photos.hero, 'cover', true)}${slot}</figure>
</section><!--/hero-->
<section class="s-half" id="about"><figure>${img(c.photos.about, 'cover')}</figure><div class="text cq"><h2 class="lab">About</h2>${statement(c.about)}</div></section>
<section class="s-half flip s-tint"><figure>${img(c.photos.d1, 'cover')}</figure><div class="text cq">${fit('h2', 'd2', c.reasonsTitle)}<ul class="s-reasons">${reasons(c)}</ul></div></section>
<section class="s-prices" id="prices"><div class="head cq">${fit('h2', 'd2', c.offerTitle)}<p class="muted">${esc(c.subhead)}</p>${btn(c)}</div><div>${priceRows(c)}</div></section>
${hasVisit(c) ? `<section class="s-half s-brand" id="visit"><figure>${img(c.photos.cta, 'cover')}</figure><div class="text cq">${fit('h2', 'd2', 'Visit')}${hoursList(c)}${addressBlock(c)}${c.visit ? `<p>${esc(c.visit)}</p>` : ''}${contact(c)}</div></section>` : ''}
<section class="s-half flip"><figure>${img(c.photos.d2, 'cover')}</figure><div class="text cq">${fit('h2', 'd2', c.cta.headline)}<p class="lead">${esc(c.cta.subhead)}</p><p>${btn(c)}</p></div></section>
</main>
<footer class="s-foot">${foot(c)}<span>${esc(contactLine(c))}</span></footer>
`,
}

/* 3 ---------------------------------------------------------------- column */

const column: Composition = {
  key: 'column',
  label: 'Editorial column',
  text: 'Like a magazine article: one narrow column of text with small labels in the margin, and photos that break out to the edge of the page. Calm, considered and literate.',
  css: `
.e-top{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:22px var(--g);border-bottom:1px solid var(--line)}
.e-top .name{font-size:clamp(20px,1.8vw,26px);line-height:1.1}
.e-sec{display:grid;grid-template-columns:[margin] minmax(0,15rem) [text] minmax(0,38rem) [rest] minmax(0,1fr);column-gap:var(--g);row-gap:clamp(22px,2.6vw,34px);padding:var(--sp) var(--g) 0}
.e-sec > *{grid-column:text}
.e-sec > .lab.side{grid-column:margin;grid-row:1;padding-top:0.5em}
.e-sec > .wide{grid-column:text / -1}
.e-sec > .bleed{grid-column:text / -1;margin-right:calc(var(--g) * -1)}
.e-hero .d1{grid-column:text / -1;max-width:13em}
.e-hero > .act{display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px}
.e-sec figure{overflow:hidden}
.e-hero figure{aspect-ratio:16/9;margin-top:clamp(16px,3vw,40px)}
.e-sec .st::first-letter{color:var(--accent)}
.e-reasons{display:grid;gap:20px}
.e-reasons li{display:block}
.e-reasons h3{display:inline;font-family:var(--f-b);font-size:inherit;font-weight:600;letter-spacing:0;text-transform:none}
.e-reasons h3::after{content:'. '}
.e-reasons p{display:inline}
.e-pair{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:var(--g);align-items:start}
.e-pair figure:first-child{aspect-ratio:4/5}
.e-pair figure:last-child{aspect-ratio:3/4;margin-top:22%}
.e-visit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--g)}
.e-visit > div{display:grid;gap:14px;align-content:start}
.e-cta{padding-bottom:var(--sp)}
.e-cta .act{display:flex;flex-wrap:wrap;gap:16px;align-items:center}
.e-foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px 32px;padding:28px var(--g);border-top:1px solid var(--line);font-size:14px}
@media (max-width:980px){
  .e-sec{grid-template-columns:minmax(0,1fr)}
  .e-sec > *,.e-sec > .lab.side,.e-sec > .wide,.e-sec > .bleed,.e-hero .d1{grid-column:1}
  .e-sec > .lab.side{grid-row:auto;padding-top:0}
  .e-visit{grid-template-columns:minmax(0,1fr)}
}
`,
  html: (c, slot) => `
<!--top--><header class="e-top"><p class="name">${esc(c.name)}</p>${nav(c)}</header><!--/top-->
<main>
<!--hero--><section class="e-sec e-hero cq"><p class="lab side">${esc(c.tagline)}</p>${headline('h1', 'd1', c.headline)}<p class="lead">${esc(c.subhead)}</p><div class="act">${btn(c)}${c.proof ? `<span class="lab muted">${esc(c.proof)}</span>` : ''}</div><figure class="bleed has-slot">${img(c.photos.hero, 'cover', true)}${slot}</figure></section><!--/hero-->
<section class="e-sec" id="about"><h2 class="lab side">About</h2>${statement(c.about)}<ul class="e-reasons">${reasons(c)}</ul></section>
<div class="e-sec"><div class="e-pair wide"><figure>${img(c.photos.about, 'cover')}</figure><figure>${img(c.photos.d1, 'cover')}</figure></div></div>
<section class="e-sec" id="prices"><h2 class="lab side">${esc(c.offerTitle)}</h2>${priceRows(c, true)}</section>
${hasVisit(c) ? `<section class="e-sec" id="visit"><h2 class="lab side">Visit</h2><div class="e-visit"><div>${hoursList(c)}</div><div>${addressBlock(c)}${c.visit ? `<p class="muted">${esc(c.visit)}</p>` : ''}${contact(c)}</div></div></section>` : ''}
<section class="e-sec e-cta cq"><h2 class="lab side">${esc(c.cta.label)}</h2>${fit('p', 'd2', c.cta.headline)}<p class="lead">${esc(c.cta.subhead)}</p><div class="act">${btn(c)}</div></section>
</main>
<footer class="e-foot">${foot(c)}<span>${esc(contactLine(c))}</span></footer>
`,
}

/* 4 ---------------------------------------------------------------- bands */

const bands: Composition = {
  key: 'bands',
  label: 'Bands',
  text: 'Full-width bands one after another: a full-screen photo opening with the headline on it, then alternating bands of colour, text and edge-to-edge photos. Immersive and rich.',
  css: `
.b-hero{position:relative;min-height:max(600px,100svh);display:grid;grid-template-rows:auto 1fr;color:#fff;isolation:isolate;overflow:hidden}
.b-hero > figure{position:absolute;inset:0;z-index:-2}
.b-hero::before{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(to top,rgb(16 13 18 / 0.84) 0%,rgb(16 13 18 / 0.62) 34%,rgb(16 13 18 / 0.12) 62%,rgb(16 13 18 / 0) 80%,rgb(16 13 18 / 0.42) 100%)}
.b-hero .bar{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:22px var(--g)}
.b-hero .name{font-size:clamp(20px,1.8vw,26px);line-height:1.1}
.b-hero .copy{align-self:end;display:grid;gap:24px;justify-items:start;padding:0 var(--g) clamp(36px,5vw,72px);max-width:min(100%,1100px)}
.b-hero .d1 em{color:inherit}
.b-hero .lead{max-width:32em}
.b-hero .btn{background:#fff;color:#19171a}
.b-slot{position:absolute;right:var(--g);bottom:clamp(36px,5vw,72px)}
.b-slot .slot{position:static}
@media (max-width:860px){.b-slot{top:96px;bottom:auto}}
.b-band{padding:var(--sp) var(--g)}
.b-center{display:grid;gap:28px;justify-items:center;text-align:center}
.b-center .st{max-width:30em}
.b-photo{aspect-ratio:21/9;overflow:hidden}
.b-brand{background:var(--band);color:var(--on-band)}
.b-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(28px,4vw,64px);margin-top:clamp(36px,4vw,56px)}
.b-three li{display:grid;gap:10px;align-content:start;padding-top:20px;border-top:1px solid color-mix(in oklab,var(--on-band) 40%,transparent)}
.b-prices{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:var(--g)}
.b-duo{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.b-duo figure{aspect-ratio:4/3;overflow:hidden}
.b-tint{background:var(--tint)}
.b-visit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);gap:var(--g)}
.b-visit > div{display:grid;gap:14px;align-content:start}
.b-foot{background:var(--night);color:var(--on-night);display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px 32px;padding:32px var(--g);font-size:14px}
.b-foot .muted{color:inherit;opacity:0.85}
@media (max-width:860px){
  .b-three,.b-prices,.b-visit{grid-template-columns:minmax(0,1fr)}
  .b-photo{aspect-ratio:4/3}
  .b-duo{grid-template-columns:minmax(0,1fr)}
}
`,
  html: (c, slot) => `
<main>
<!--hero--><section class="b-hero">
  <figure>${img(c.photos.hero, 'cover', true)}</figure>
  <div class="bar"><p class="name">${esc(c.name)}</p>${nav(c)}</div>
  <div class="copy cq">${headline('h1', 'd1', c.headline)}<p class="lead">${esc(c.subhead)}</p>${btn(c)}</div>
  <div class="b-slot">${slot}</div>
</section><!--/hero-->
<section class="b-band b-center cq" id="about"><h2 class="lab muted">About</h2>${statement(c.about)}${c.proof ? `<p class="lab muted">${esc(c.proof)}</p>` : ''}</section>
<figure class="b-photo">${img(c.photos.about, 'cover')}</figure>
<section class="b-band b-brand cq">${fit('h2', 'd2', c.reasonsTitle)}<ul class="b-three">${reasons(c)}</ul></section>
<section class="b-band" id="prices"><div class="b-prices"><div class="cq">${fit('h2', 'd2', c.offerTitle)}</div><div>${priceRows(c)}</div></div></section>
<div class="b-duo"><figure>${img(c.photos.d1, 'cover')}</figure><figure>${img(c.photos.d2, 'cover')}</figure></div>
${hasVisit(c) ? `<section class="b-band b-tint" id="visit"><div class="b-visit"><div class="cq">${fit('h2', 'd2', 'Visit')}</div><div>${hoursList(c)}</div><div>${addressBlock(c)}${c.visit ? `<p class="muted">${esc(c.visit)}</p>` : ''}${contact(c)}</div></div></section>` : ''}
<section class="b-band b-brand b-center cq">${fit('h2', 'd2', c.cta.headline)}<p class="lead">${esc(c.cta.subhead)}</p>${btn(c)}</section>
</main>
<footer class="b-foot">${foot(c)}<span>${esc(contactLine(c))}</span></footer>
`,
}

/* 5 ---------------------------------------------------------------- index */

const index: Composition = {
  key: 'index',
  label: 'Index',
  text: 'Organised like a catalogue or timetable: rows divided by thin lines, small photos with captions, prices and hours as clear tables. Precise, informative and efficient.',
  css: `
.x-top{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:20px;align-items:center;padding:18px var(--g);border-bottom:1px solid var(--ink)}
.x-top .name{grid-column:span 3;font-size:clamp(19px,1.6vw,24px);line-height:1.1}
.x-top > .lab{grid-column:span 4}
.x-top .nav{grid-column:span 5;justify-content:end}
.x-hero{padding:clamp(40px,6vw,96px) var(--g) 0;display:grid;gap:clamp(28px,4vw,56px)}
.x-hero .d1{max-width:15em}
.x-hero .meta{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:20px;align-items:end}
.x-hero .meta .lead{grid-column:1 / span 6}
.x-hero .meta .proof{grid-column:8 / span 3}
.x-hero .meta .btn{grid-column:11 / -1;justify-self:end}
.x-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.x-strip figure{display:grid;gap:10px}
.x-strip .ph{aspect-ratio:4/5;overflow:hidden}
.x-row{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:20px;margin:clamp(64px,7vw,112px) var(--g) 0;padding-top:16px;border-top:1px solid var(--ink)}
.x-row > .head{grid-column:1 / span 5}
.x-row > .body{grid-column:6 / -1;display:grid;gap:28px;align-content:start}
.x-table li{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:20px;padding:14px 0;border-top:1px solid var(--line)}
.x-table li:last-child{border-bottom:1px solid var(--line)}
.x-table h3{font-family:var(--f-b);font-size:inherit;font-weight:600;letter-spacing:0;text-transform:none;line-height:inherit}
.x-visit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px}
.x-visit > div{display:grid;gap:14px;align-content:start}
.x-cta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:24px}
.x-foot{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-top:clamp(64px,7vw,112px);padding:20px var(--g) 32px;border-top:1px solid var(--ink);font-size:14px}
@media (max-width:900px){
  .x-top .name{grid-column:1 / span 6}
  .x-top > .lab{display:none}
  .x-top .nav{grid-column:7 / -1}
  .x-hero .meta .lead,.x-hero .meta .proof,.x-hero .meta .btn{grid-column:1 / -1;justify-self:start}
  .x-row > .head{grid-column:1 / -1}
  .x-row > .body{grid-column:1 / -1}
  .x-visit{grid-template-columns:minmax(0,1fr)}
  .x-foot{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
}
@media (max-width:600px){
  .x-strip{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .x-strip figure:first-child{grid-column:1 / -1}
  .x-strip figure:first-child .ph{aspect-ratio:4/3}
  .x-table li{grid-template-columns:minmax(0,1fr)}
}
`,
  html: (c, slot) => `
<!--top--><header class="x-top"><p class="name">${esc(c.name)}</p><p class="lab">${esc(c.tagline)}</p>${nav(c)}</header><!--/top-->
<main>
<!--hero--><section class="x-hero cq">${headline('h1', 'd1', c.headline)}
  <div class="meta"><p class="lead">${esc(c.subhead)}</p>${c.proof ? `<p class="lab proof">${esc(c.proof)}</p>` : '<span></span>'}${btn(c)}</div>
  <div class="x-strip">
    <figure><div class="ph has-slot">${img(c.photos.hero, 'cover', true)}${slot}</div><figcaption class="lab muted">The salon</figcaption></figure>
    <figure><div class="ph">${img(c.photos.about, 'cover')}</div><figcaption class="lab muted">In the chair</figcaption></figure>
    <figure><div class="ph">${img(c.photos.d1, 'cover')}</div><figcaption class="lab muted">The work</figcaption></figure>
  </div>
</section><!--/hero-->
<section class="x-row" id="about"><h2 class="lab head">About</h2><div class="body">${statement(c.about)}<ul class="x-table">${c.reasons.map((r) => `<li><h3>${esc(r.title)}</h3><p>${esc(r.body)}</p></li>`).join('')}</ul></div></section>
<section class="x-row" id="prices"><h2 class="lab head">${esc(c.offerTitle)}</h2><div class="body">${priceRows(c)}</div></section>
${hasVisit(c) ? `<section class="x-row" id="visit"><h2 class="lab head">Visit</h2><div class="body x-visit"><div>${hoursList(c)}</div><div>${addressBlock(c)}${c.visit ? `<p class="muted">${esc(c.visit)}</p>` : ''}${contact(c)}</div></div></section>` : ''}
<section class="x-row"><h2 class="lab head">${esc(c.cta.label)}</h2><div class="body"><div class="x-cta cq">${fit('p', 'd2', c.cta.headline)}${btn(c)}</div><p class="muted">${esc(c.cta.subhead)}</p></div></section>
</main>
<footer class="x-foot"><p>${esc(c.name)}</p><p class="muted">${esc(c.tagline)}</p><p>${esc(c.phone)}</p><p>${esc(c.email)}</p></footer>
`,
}

/* 6 ---------------------------------------------------------------- framed */

const framed: Composition = {
  key: 'framed',
  label: 'Framed',
  text: 'Symmetrical and centred, like an invitation: centred headings, photos in arched frames, thin ornamental dividers between sections. Graceful, classic and upmarket.',
  css: `
.f-top{display:grid;justify-items:center;gap:14px;padding:26px var(--g) 18px;border-bottom:1px solid var(--line);text-align:center}
.f-top .name{font-size:clamp(24px,2.4vw,34px);line-height:1.1}
.f-wrap{display:grid;justify-items:center;text-align:center;gap:clamp(22px,2.6vw,32px);padding:var(--sp) var(--g) 0}
.f-wrap .d1{max-width:12em}
.f-wrap .lead,.f-wrap .st{max-width:30em}
.f-arch{width:min(100%,500px);aspect-ratio:4/5;border-radius:999px 999px 0 0;overflow:hidden;margin-top:clamp(12px,2vw,28px)}
.f-orn{display:flex;align-items:center;justify-content:center;gap:16px;margin:var(--sp) auto 0;width:min(100% - 2 * var(--g),340px)}
.f-orn::before,.f-orn::after{content:'';flex:1;border-top:1px solid var(--line)}
.f-orn span{width:9px;height:9px;background:var(--accent);transform:rotate(45deg)}
.f-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(28px,4vw,64px);width:min(100%,1100px)}
.f-three li{display:grid;gap:12px;justify-items:center;align-content:start}
.f-three .circ{width:clamp(120px,12vw,168px);aspect-ratio:1;border-radius:50%;overflow:hidden;margin-bottom:8px}
.f-prices{width:min(100%,40rem);text-align:left}
.f-prices .pgroup > .lab{text-align:center;margin-bottom:6px}
.f-arches{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--g);width:min(100%,900px);align-items:end}
.f-arches figure{aspect-ratio:3/4;border-radius:999px 999px 0 0;overflow:hidden}
.f-arches figure:last-child{aspect-ratio:3/3.6}
.f-visit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--g);width:min(100%,46rem);text-align:left}
.f-visit > div{display:grid;gap:14px;align-content:start}
.f-frame{width:min(100%,52rem);padding:clamp(36px,5vw,72px) clamp(20px,4vw,64px);border:1px solid var(--accent);outline:1px solid var(--accent);outline-offset:6px;display:grid;gap:24px;justify-items:center}
.f-foot{display:grid;justify-items:center;gap:8px;text-align:center;margin-top:var(--sp);padding:28px var(--g);border-top:1px solid var(--line);font-size:14px}
@media (max-width:860px){
  .f-three{grid-template-columns:minmax(0,1fr)}
  .f-visit{grid-template-columns:minmax(0,1fr)}
  .f-frame{width:calc(100% - 14px)}
}
`,
  html: (c, slot) => `
<!--top--><header class="f-top"><p class="name">${esc(c.name)}</p>${nav(c)}</header><!--/top-->
<main>
<!--hero--><section class="f-wrap cq">${headline('h1', 'd1', c.headline)}<p class="lead">${esc(c.subhead)}</p>${btn(c)}<figure class="f-arch has-slot">${img(c.photos.hero, 'cover', true)}${slot}</figure>${c.proof ? `<p class="lab muted">${esc(c.proof)}</p>` : ''}</section><!--/hero-->
<div class="f-orn" aria-hidden="true"><span></span></div>
<section class="f-wrap cq" id="about"><h2 class="lab muted">About</h2>${statement(c.about)}
  <ul class="f-three">${c.reasons
    .map((r, i) => {
      const p = [c.photos.about, c.photos.d1, c.photos.d2][i] ?? c.photos.about
      return `<li><div class="circ">${img(p, 'cover')}</div><h3 class="d3">${esc(r.title)}</h3><p>${esc(r.body)}</p></li>`
    })
    .join('')}</ul></section>
<div class="f-orn" aria-hidden="true"><span></span></div>
<section class="f-wrap cq" id="prices">${fit('h2', 'd2', c.offerTitle)}<div class="f-prices">${priceRows(c, true)}</div></section>
<div class="f-wrap"><div class="f-arches"><figure>${img(c.photos.cta, 'cover')}</figure><figure>${img(c.photos.d2, 'cover')}</figure></div></div>
<div class="f-orn" aria-hidden="true"><span></span></div>
${hasVisit(c) ? `<section class="f-wrap cq" id="visit">${fit('h2', 'd2', 'Visit')}<div class="f-visit"><div>${hoursList(c)}</div><div>${addressBlock(c)}${c.visit ? `<p class="muted">${esc(c.visit)}</p>` : ''}${contact(c)}</div></div></section>` : ''}
<section class="f-wrap cq"><div class="f-frame cq">${fit('p', 'd2', c.cta.headline)}<p class="lead">${esc(c.cta.subhead)}</p>${btn(c)}</div></section>
</main>
<footer class="f-foot"><p>${esc(c.name)}</p>${foot(c)}<p>${esc(contactLine(c))}</p></footer>
`,
}

export const COMPOSITIONS: Composition[] = [monument, split, column, bands, index, framed]
