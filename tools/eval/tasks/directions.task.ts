// Screenshots and checks for the hand-designed direction pages (docs/m0/09-directions.md).
// Each page in tools/eval/directions/*.html is opened at 1440 and 390 px wide: first screen and
// whole page are saved to tools/eval/out/directions/, and the same checks as the Wall run
// (page overflow, elements sticking out, covered text, axe WCAG 2.2 AA).
// Run: pnpm --filter @repo/eval directions     or    ONLY=landscape pnpm --filter @repo/eval directions
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { chromium } from 'playwright'
import { it } from 'vitest'
import { pageProblems } from '../src/page-checks.ts'

const dir = new URL('../directions/', import.meta.url)
const out = new URL('../out/directions/', import.meta.url)
mkdirSync(out, { recursive: true })
const only = process.env.ONLY?.split(',')
const pages = readdirSync(dir)
  .filter((f) => f.endsWith('.html'))
  .map((f) => f.replace('.html', ''))
  .filter((n) => !only || only.includes(n))

it(`checks ${pages.length} direction pages`, async () => {
  const browser = await chromium.launch()
  const problems: Record<string, string[]> = {}
  for (const name of pages) {
    const found: string[] = []
    for (const width of [1440, 390]) {
      const ctx = await browser.newContext({ viewport: { width, height: width > 500 ? 900 : 844 } })
      const page = await ctx.newPage()
      await page.goto(new URL(`${name}.html`, dir).href, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      found.push(...(await page.evaluate(pageProblems)).map((x) => `${width}px: ${x}`))
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
      for (const v of axe.violations)
        found.push(`${width}px: axe ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ') ?? ''}`)
      const tag = width > 500 ? 'desktop' : 'phone'
      await page.screenshot({ path: new URL(`${name}-${tag}-top.png`, out).pathname })
      await page.screenshot({ path: new URL(`${name}-${tag}-full.png`, out).pathname, fullPage: true })
      await ctx.close()
    }
    problems[name] = found
  }
  await browser.close()
  writeFileSync(new URL('problems.json', out), JSON.stringify(problems, null, 2))
}, 600_000)
