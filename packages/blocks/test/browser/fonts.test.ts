import { fixtures, M0_SECTIONS, type M0Section } from '@repo/spec/fixtures'
import { type Browser, chromium } from 'playwright'
import { type ComponentType, createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { BlockProps } from '../../src/kit/index.tsx'
import type { BlockManifest } from '../../src/manifest/contract.ts'
import { DIRECTION_FAMILIES, familyAxes, M0_FAMILIES, theme } from '../../src/themes/index.ts'
import { contentAtCaps, testCtx } from '../helpers.ts'
import { artUri, dirs, measure, page, stylesheet } from './shared.ts'

// Character limits hold in every font pairing (docs/technical/README.md, decision 4: "Tests prove
// those limits for every font pairing"). Each variant is filled to its caps and drawn in every M0
// family's every pairing, with the real web fonts, at 360 and 1280 px. Fails on text wider than its
// box, clipped text or anything sticking out of the window. Colour and accessibility are the main
// gate's job. Needs the network for the fonts (Google Fonts, for now; published sites will self-host).

const PAIRINGS = [...M0_FAMILIES, ...DIRECTION_FAMILIES].flatMap((family) =>
  familyAxes(family).type.map((type) => ({ family, type })),
)

type Item = { name: string; html: string }
const items: Item[] = []
for (const dir of dirs) {
  const m = (await import(`../../src/blocks/${dir}/manifest.ts`)).default as BlockManifest
  const C = (await import(`../../src/blocks/${dir}/component.tsx`)).default as ComponentType<
    BlockProps<never>
  >
  if (!(M0_SECTIONS as readonly string[]).includes(m.sectionType)) continue
  const section = m.sectionType as M0Section
  for (const variant of Object.keys(m.variants)) {
    const capped = contentAtCaps(
      m,
      variant,
      fixtures[section].longest.content as Record<string, unknown>,
      fixtures[section].typical.content as Record<string, unknown>,
    )
    if (!capped) continue
    const ctx = {
      ...testCtx(section, m.type, variant, fixtures[section].longest.context, false),
      image: (img: { asset: string }, o: { aspect?: number }) => ({
        src: artUri(img.asset, o.aspect ?? 1),
        width: 1200,
        height: Math.round(1200 / (o.aspect ?? 1)),
      }),
    }
    items.push({
      name: `${dir}#${variant}`,
      html: renderToStaticMarkup(createElement(C, { content: capped as never, variant, ctx })),
    })
  }
}

let browser: Browser
beforeAll(async () => {
  browser = await chromium.launch()
})
afterAll(async () => browser?.close())

describe('longest text in every font pairing', () => {
  for (const pr of PAIRINGS)
    it(`${pr.family} / ${pr.type}`, async () => {
      const t = theme(pr.family, '#5b4a7a', { axes: { type: pr.type } })
      const css = await stylesheet(t.css)
      const head = `<link rel="stylesheet" href="${t.fontsHref}">`
      const context = await browser.newContext()
      const p = await context.newPage()
      const problems: string[] = []
      try {
        for (const item of items)
          for (const width of [360, 1280]) {
            await p.setViewportSize({ width, height: 900 })
            await p.setContent(page(item.html, css, false, head), { waitUntil: 'networkidle' })
            await p.evaluate(() => document.fonts.ready)
            const loaded = await p.evaluate(() =>
              [...document.fonts].some((f) => f.status === 'loaded'),
            )
            if (!loaded) problems.push(`${item.name}: web fonts did not load`)
            problems.push(
              ...(await p.evaluate(measure)).map((x) => `${item.name} ${width}px: ${x}`),
            )
          }
      } finally {
        await context.close()
      }
      expect(problems).toEqual([])
    }, 600_000)
})
