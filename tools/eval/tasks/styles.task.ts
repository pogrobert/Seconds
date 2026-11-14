// Renders every sample business in every style family to tools/eval/out/styles/<family>/<kind>.html,
// then checks each page in Chromium at 360 and 1280 px: page wider than the window, elements
// sticking out, and axe WCAG 2.2 AA (including colour contrast with the real fonts loaded).
// Run: pnpm --filter @repo/eval styles
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { FAMILY_IDS } from '@repo/blocks/themes'
import { type Browser, chromium } from 'playwright'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { KINDS } from '../src/businesses.ts'
import { renderSample } from '../src/render-sample.ts'

// Licensed photos (if fetched) sit beside the pages, so the pages work locally and when published.
const photos = new URL('../photos/', import.meta.url)
if (existsSync(photos))
  cpSync(photos, new URL('../out/styles/photos/', import.meta.url), { recursive: true })

let browser: Browser
beforeAll(async () => {
  browser = await chromium.launch()
})
afterAll(async () => browser?.close())

const overflow = () => {
  const vw = document.documentElement.clientWidth
  const out: string[] = []
  if (document.documentElement.scrollWidth > vw + 1)
    out.push(`page is ${document.documentElement.scrollWidth}px wide`)
  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    const r = el.getBoundingClientRect()
    if (r.width <= 1 && r.height <= 1) continue
    if (r.right > vw + 1 || r.left < -1)
      out.push(
        `<${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 50)}"> sticks out`,
      )
  }
  return out.slice(0, 5)
}

for (const family of FAMILY_IDS) {
  for (const kind of KINDS) {
    it(`${family} / ${kind}`, async () => {
      const r = await renderSample(kind, { family, photoBase: '../photos/' })
      expect(r.problems).toEqual([])
      const dir = new URL(`../out/styles/${family}/`, import.meta.url)
      mkdirSync(dir, { recursive: true })
      writeFileSync(new URL(`${kind}.html`, dir), r.html)
      const context = await browser.newContext()
      const page = await context.newPage()
      const problems: string[] = []
      try {
        for (const width of [360, 1280]) {
          await page.setViewportSize({ width, height: 900 })
          await page.setContent(r.html, { waitUntil: 'networkidle' })
          await page.evaluate(() => document.fonts.ready)
          problems.push(...(await page.evaluate(overflow)).map((x) => `${width}px: ${x}`))
          const axe = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
          for (const v of axe.violations)
            problems.push(
              `${width}px: axe ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ') ?? ''} ${v.nodes[0]?.failureSummary?.split('\n')[1] ?? ''}`,
            )
        }
      } finally {
        await context.close()
      }
      expect(problems).toEqual([])
    })
  }
}
