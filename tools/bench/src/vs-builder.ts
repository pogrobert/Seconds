// Full-page screenshots of Builder's version 1 for the comparison with Lovable and v0
// (docs/m0/21-vs-lovable-v0.md), at the same size as the Chrome captures of the other two: a
// 1908px-wide window drawn at 1568px, with the right 16px cut (vs_stitch.py does the same).
//   node src/vs-builder.ts runs/<run> [vs2]   →  vs/<brief>/builder.png (or vs2/…)

import { mkdirSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { chromium } from 'playwright'

const run = resolve(process.argv[2] ?? '')
const outRoot = process.argv[3] ?? 'vs'
const WIDTH = 1908
const SCALE = 1568 / WIDTH
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: WIDTH, height: 950 },
  deviceScaleFactor: SCALE,
  // Moving blocks shown in their finished state, as the others are after scrolling through.
  reducedMotion: 'reduce',
})
for (const id of readdirSync(run, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const file = join(run, id.name, 'b1.html')
  await page.goto(`file://${file}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  const out = join(outRoot, id.name)
  mkdirSync(out, { recursive: true })
  await page.screenshot({
    path: join(out, 'builder.png'),
    fullPage: true,
    clip: { x: 0, y: 0, width: WIDTH - 16 / SCALE, height },
  })
  console.log(id.name, height)
}
await browser.close()
