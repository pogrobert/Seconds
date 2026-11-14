// Measures each font pairing's display face: the average width of one character, in em, with the
// pairing's own tracking and capitals. The kit's FitLine uses it to make a wordmark fill its width
// without JavaScript. Run: pnpm --filter @repo/eval advance
// Prints, per pairing, the mean and the widest ratio over a set of business names. The value to put
// in themes/index.ts (`advance`) is the widest, so the line stays inside its box.
import { writeFileSync } from 'node:fs'
import { FAMILIES, FAMILY_IDS, theme } from '@repo/blocks/themes'
import { chromium } from 'playwright'
import { it } from 'vitest'

const NAMES = [
  'Marrow & Vine',
  'Studio Hale',
  'Bright Smile Dental',
  'Northside Plumbing',
  'Flow Yoga',
  'Café Lumen',
  'The Mill Kitchen',
  'Wax & Wane',
  'Morning Glory Bakery',
  'MW Roofing',
  'Willow & Moss Hair',
  'Iron Temple Gym',
]

it('measures display face widths', async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const rows: string[] = []
  for (const id of FAMILY_IDS)
    for (const type of Object.keys(FAMILIES[id].pairings)) {
      const t = theme(id, '#5b4a7a', { axes: { type } })
      const html = `<!doctype html><html><head><link rel="stylesheet" href="${t.fontsHref}"><style>${t.css}
        span { font-family: var(--type-display-family); font-weight: var(--type-display-weight);
        letter-spacing: var(--type-display-tracking); text-transform: var(--type-display-case);
        font-size: 100px; white-space: nowrap; display: inline-block }</style></head>
        <body data-site>${NAMES.map((n) => `<div><span>${n.replace('&', '&amp;')}</span></div>`).join('')}</body></html>`
      await page.setContent(html, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      const widths = await page.$$eval('span', (els) =>
        els.map((e) => e.getBoundingClientRect().width),
      )
      const ratios = widths.map((w, i) => w / 100 / [...(NAMES[i] as string)].length)
      const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length
      const max = Math.max(...ratios)
      rows.push(`${id}/${type}: mean ${mean.toFixed(3)} widest ${max.toFixed(3)}`)
    }
  await browser.close()
  writeFileSync(new URL('../out/advance.txt', import.meta.url), `${rows.join('\n')}\n`)
}, 120_000)
