import { describe, expect, it } from 'vitest'
import { contrast, FAMILY_IDS, theme } from '../src/themes/index.ts'

// Every family must give readable text for any brand colour (WCAG 2.2 AA: 4.5:1 for text).
const BRANDS = [
  '#8a3b2e',
  '#5b4a7a',
  '#1f6f78',
  '#c2410c',
  '#1d4ed8',
  '#ffff00',
  '#000000',
  '#ffffff',
  '#00a6f4',
  '#ff6a00',
  '#7a9a01',
]

describe('style families', () => {
  for (const id of FAMILY_IDS)
    for (const brand of BRANDS)
      it(`${id} with ${brand}: every text pair reaches AA on every surface`, () => {
        const problems: string[] = []
        for (const [s, r] of Object.entries(theme(id, brand).palette)) {
          const check = (name: string, a: string, b: string, min: number) => {
            const c = contrast(a, b)
            if (c < min) problems.push(`${s}: ${name} ${a} on ${b} is ${c.toFixed(2)}:1`)
          }
          check('text', r.fg, r.bg, 4.5)
          check('muted text', r.fgMuted, r.bg, 4.5)
          check('link / accent', r.accent, r.bg, 4.5)
          check('button text', r.accentFg, r.accent, 4.5)
        }
        expect(problems).toEqual([])
      })
})
