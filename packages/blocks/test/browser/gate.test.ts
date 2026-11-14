import AxeBuilder from '@axe-core/playwright'
import { contentSchema } from '@repo/spec'
import { CASES, fixtures, M0_SECTIONS, type M0Section } from '@repo/spec/fixtures'
import { type Browser, chromium } from 'playwright'
import { type ComponentType, createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { BlockProps, RenderCtx } from '../../src/kit/index.tsx'
import { type BlockManifest, eligibility } from '../../src/manifest/contract.ts'
import { contentAtCaps, testCtx } from '../helpers.ts'
import { artUri, dirs, measure, page, stylesheet, WIDTHS } from './shared.ts'

// Real-browser checks (CLAUDE.md, Quality checks): every block, variant and test case, plus the
// longest text each variant claims to hold, rendered in Chromium at phone, tablet and desktop widths.
// Fails on: page wider than the screen, elements sticking out, text overflowing or clipped, and
// accessibility violations found by axe-core (WCAG 2.2 A and AA).
// Images are generated art from Surfaces. Fonts are the draft theme's system fonts; fonts.test.ts
// checks the longest text in every font pairing.

let browser: Browser
let css = ''
beforeAll(async () => {
  browser = await chromium.launch()
  css = await stylesheet()
})
afterAll(async () => browser?.close())

for (const dir of dirs) {
  const m = (await import(`../../src/blocks/${dir}/manifest.ts`)).default as BlockManifest
  const C = (await import(`../../src/blocks/${dir}/component.tsx`)).default as ComponentType<
    BlockProps<never>
  >
  if (!(M0_SECTIONS as readonly string[]).includes(m.sectionType)) continue
  const section = m.sectionType as M0Section
  describe(dir, () => {
    for (const variant of Object.keys(m.variants)) {
      const cases: {
        name: string
        content: Record<string, unknown>
        rtl: boolean
        context: (typeof fixtures)[M0Section]['typical']['context']
      }[] = []
      for (const c of CASES) {
        const f = fixtures[section][c]
        if (eligibility(m, variant, f.content as Record<string, unknown>).ok)
          cases.push({
            name: c,
            content: f.content as Record<string, unknown>,
            rtl: c === 'rtl',
            context: f.context,
          })
      }
      const capped = contentAtCaps(
        m,
        variant,
        fixtures[section].longest.content as Record<string, unknown>,
        fixtures[section].typical.content as Record<string, unknown>,
      )
      // The typical content with every picture failing to load: a missing photo must never break the layout.
      {
        const f = fixtures[section].typical
        if (eligibility(m, variant, f.content as Record<string, unknown>).ok)
          cases.push({
            name: 'broken-images',
            content: f.content as Record<string, unknown>,
            rtl: false,
            context: f.context,
          })
      }
      if (capped)
        cases.push({
          name: 'at-caps',
          content: capped,
          rtl: false,
          context: fixtures[section].longest.context,
        })

      for (const tc of cases) {
        it(`#${variant} / ${tc.name}`, async () => {
          if (tc.name === 'at-caps')
            expect(
              contentSchema(section).safeParse(tc.content).success,
              'at-caps content is not valid',
            ).toBe(true)
          const base = testCtx(section, m.type, variant, tc.context, tc.rtl)
          const ctx: RenderCtx = {
            ...base,
            image: (img, o) => ({
              src: tc.name === 'broken-images' ? 'missing.jpg' : artUri(img.asset, o.aspect ?? 1),
              width: 1200,
              height: Math.round(1200 / (o.aspect ?? 1)),
            }),
          }
          const html = renderToStaticMarkup(
            createElement(C, { content: tc.content as never, variant, ctx }),
          )
          const context = await browser.newContext()
          const p = await context.newPage()
          const problems: string[] = []
          try {
            for (const width of WIDTHS) {
              await p.setViewportSize({ width, height: 900 })
              await p.setContent(page(html, css, tc.rtl))
              problems.push(...(await p.evaluate(measure)).map((x) => `${width}px: ${x}`))
              if (width !== 768) {
                const axe = await new AxeBuilder({ page: p })
                  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
                  .disableRules(['page-has-heading-one', 'landmark-one-main', 'region', 'bypass'])
                  .analyze()
                for (const v of axe.violations)
                  problems.push(
                    `${width}px: axe ${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ') ?? ''}`,
                  )
              }
            }
          } finally {
            await context.close()
          }
          expect(problems).toEqual([])
        })
      }
    }
  })
}
