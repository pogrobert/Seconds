// A page of Surfaces styles that could stand in for a photo when none fits (docs/m0/17-photos.md),
// for Robert to pick from. Each style is drawn for three businesses at photo shape (3:2) and as a
// square, in the same quiet colours the build uses; a second section shows colour strengths.
//   node tools/eval/src/art-styles.ts  →  tools/eval/out/art-styles.html

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generate, toSvg } from '@pogrobert/surfaces'

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'out')
const STYLES = [
  'underpaint',
  'sfumato',
  'fluted',
  'aquatint',
  'strata',
  'marbling',
  'glass',
  'papercut',
  'patches',
  'prism',
  'moire',
  'halftone',
] as const
const BUSINESSES = [
  { name: 'Lake Sauna', seed: 'build-lake-sauna' },
  { name: 'Leeds Family Dental', seed: 'build-leeds-dental' },
  { name: 'Mull Heather Honey', seed: 'build-mull-honey' },
]

/** The build's colour rule (make-site.ts, artColour), with the saturation as a choice. */
function colour(seed: string, saturation: number, lightness = 0.46) {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const hue = h % 360
  const f = (n: number) => {
    const k = (n + hue / 30) % 12
    const c =
      lightness -
      saturation * Math.min(lightness, 1 - lightness) * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

const draw = (style: string, seed: string, color: string, w: number, h: number) =>
  `data:image/svg+xml;base64,${Buffer.from(
    toSvg(
      generate({ style: style as 'underpaint', seed, color, width: w, height: h, mood: 'calm' }),
    ),
  ).toString('base64')}`

let n = 0
const styleRows = STYLES.map((style) => {
  const tiles = BUSINESSES.map(
    (b) =>
      `<figure><img src="${draw(style, `${b.seed}-place`, colour(b.seed, 0.16), 900, 600)}" alt=""><img class="sq" src="${draw(style, `${b.seed}-detail`, colour(b.seed, 0.16), 600, 600)}" alt=""><figcaption>${b.name}</figcaption></figure>`,
  ).join('')
  return `<section><h2><span>${++n}</span> ${style}</h2><div class="row">${tiles}</div></section>`
}).join('')

const STRENGTHS = [
  { label: 'A · almost grey', s: 0.05 },
  { label: 'B · muted (now)', s: 0.16 },
  { label: 'C · gentle colour', s: 0.32 },
  { label: 'D · clear colour', s: 0.55 },
]
const colourRows = STRENGTHS.map(
  (x) =>
    `<section><h2>${x.label}</h2><div class="row">${BUSINESSES.map(
      (b) =>
        `<figure><img src="${draw('underpaint', `${b.seed}-place`, colour(b.seed, x.s), 900, 600)}" alt=""><figcaption>${b.name} · ${colour(b.seed, x.s)}</figcaption></figure>`,
    ).join('')}</div></section>`,
).join('')

const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Art styles</title>
<style>
body{margin:0;padding:28px max(16px,4vw);background:#fff;color:#111;font:14px/1.45 system-ui,sans-serif}
h1{font-size:22px;margin:0 0 4px}p.lead{color:#666;margin:0 0 24px;max-width:70ch}
h2{font-size:15px;margin:0 0 8px;display:flex;gap:8px;align-items:center}h2 span{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#111;color:#fff;font-size:12px}
section{padding:16px 0;border-top:1px solid #eee}
.row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
figure{margin:0;display:grid;grid-template-columns:3fr 2fr;gap:6px;align-items:start}
figure img{width:100%;border-radius:8px;display:block;aspect-ratio:3/2;object-fit:cover}
figure img.sq{aspect-ratio:1}
figcaption{grid-column:1/-1;color:#666;font-size:12px}
.colours figure{grid-template-columns:1fr}
@media (max-width:800px){.row{grid-template-columns:1fr}}
</style>
<h1>Art for photo spaces no photo fits</h1>
<p class="lead">Drawn by Surfaces from each business's seed: no AI, the same picture every time. Shown at photo shape and as a square, in the build's muted colour. Pick a style by number, then a colour strength by letter.</p>
${styleRows}
<h1 style="margin-top:32px">Colour strength</h1>
<p class="lead">The same style (underpaint) for the same three businesses, from almost grey to clear colour.</p>
<div class="colours">${colourRows}</div>
</html>`
mkdirSync(out, { recursive: true })
writeFileSync(join(out, 'art-styles.html'), html)
console.log(
  `${STYLES.length} styles, ${STRENGTHS.length} strengths → tools/eval/out/art-styles.html (${Math.round(html.length / 1024)} KB)`,
)
