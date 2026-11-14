// The directions as library blocks, for every kind of business (docs/m0/10-directions-library.md).
// Each of the four directions draws each of the five sample businesses with their own photos and
// stand-in words, using only its fixed set of blocks (DIRECTIONS in packages/pipeline). Every site
// is checked in Chromium at 1440 and 390 px: overflow, elements sticking out, covered text and axe
// WCAG 2.2 AA, plus whether each block can hold the content it was given.
// Output: tools/eval/out/directions-wall/<direction>-<kind>.html, screenshots, problems.json.
// Run: pnpm --filter @repo/eval directions-wall      or   ONLY=landscape pnpm --filter …
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { DIRECTION_IDS, directionPlan, KINDS } from '@repo/pipeline'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'
import { SAMPLES } from '../src/businesses.ts'
import { pageProblems } from '../src/page-checks.ts'
import { renderSample } from '../src/render-sample.ts'
import { contentFor, eligibleFor, photoOrder } from '../src/site-content.ts'

const out = new URL('../out/directions-wall/', import.meta.url)
mkdirSync(out, { recursive: true })
const photos = new URL('../photos/', import.meta.url)
if (existsSync(photos)) cpSync(photos, new URL('photos/', out), { recursive: true })
const only = process.env.ONLY?.split(',')
const dirs = DIRECTION_IDS.filter((d) => !only || only.includes(d))

it(`renders ${dirs.length} directions for ${KINDS.length} kinds of business`, async () => {
  const sites: { file: string; direction: string; kind: string; ineligible: string[] }[] = []
  for (const direction of dirs)
    for (const kind of KINDS) {
      const sample = SAMPLES[kind]
      const plan = directionPlan(kind, direction)
      const order = photoOrder(1)
      const ok = eligibleFor(sample, order)
      const ineligible = [...plan.before, ...plan.sections, ...plan.after]
        .filter((s) => !ok(s))
        .map((s) => `${s.type}#${s.variant}`)
      const r = await renderSample(kind, {
        plan,
        photoBase: 'photos/',
        content: contentFor(sample, order),
      })
      expect(r.problems, `${direction} ${kind}`).toEqual([])
      const file = `${direction}-${kind}.html`
      writeFileSync(new URL(file, out), r.html)
      sites.push({ file, direction, kind, ineligible })
    }

  const browser = await chromium.launch()
  const problems: Record<string, string[]> = {}
  for (const s of sites) {
    const found = s.ineligible.map((x) => `cannot hold its content: ${x}`)
    for (const width of [1440, 390]) {
      const ctx = await browser.newContext({ viewport: { width, height: width > 500 ? 900 : 844 } })
      const page = await ctx.newPage()
      await page.goto(new URL(s.file, out).href, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      found.push(...(await page.evaluate(pageProblems)).map((x) => `${width}px: ${x}`))
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      for (const v of axe.violations)
        found.push(
          `${width}px: axe ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ') ?? ''}`,
        )
      const tag = width > 500 ? 'desktop' : 'phone'
      const base = s.file.replace('.html', '')
      await page.screenshot({ path: new URL(`${base}-${tag}-top.png`, out).pathname })
      await page.screenshot({
        path: new URL(`${base}-${tag}-full.png`, out).pathname,
        fullPage: true,
      })
      await ctx.close()
    }
    if (found.length) problems[s.file] = found
  }
  await browser.close()
  writeFileSync(new URL('problems.json', out), JSON.stringify(problems, null, 2))
  writeFileSync(new URL('sites.json', out), JSON.stringify(sites, null, 2))
}, 1_200_000)
