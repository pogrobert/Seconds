// Measures each type system's display width per character in Chromium, for the fitting rule
// (TypeRule.advance): the widest of eight sample names and phrases, set exactly as the system sets
// display type (weight, tracking, case). Run after changing a type system:
//   node src/grammar/measure.ts
import { chromium } from 'playwright'
import { TYPE_RULES } from './type-rules.ts'

const SAMPLES = [
  'Northside Hair',
  'Shore Cuts',
  'The Colour Lab',
  'Constitution',
  'beautifully',
  'Velvet',
  'Fern',
  'Ready for a change?',
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const t of TYPE_RULES) {
  const v = t.vars
  const style = `font-family:${(v['--f-d'] ?? '').replace(/"/g, "'")};font-weight:${v['--w-d']};letter-spacing:${v['--t-d']};text-transform:${v['--c-d']};font-size:100px;white-space:nowrap;display:inline-block`
  await page.setContent(
    `<!doctype html><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${t.fonts}&display=block">${SAMPLES.map((s) => `<span style="${style}">${s}</span><br>`).join('')}`,
  )
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  const widths = await page.$$eval('span', (els) => els.map((e) => e.getBoundingClientRect().width))
  const per = widths.map((w, i) => w / 100 / [...(SAMPLES[i] ?? 'x')].length)
  console.log(
    t.key.padEnd(12),
    'max',
    Math.max(...per).toFixed(3),
    'mean',
    (per.reduce((a, b) => a + b, 0) / per.length).toFixed(3),
  )
}
await browser.close()
