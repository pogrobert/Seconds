import { describe, expect, it } from 'vitest'
import {
  checkStyle,
  contrast,
  FAMILY_IDS,
  familyAxes,
  photoFilter,
  theme,
} from '../src/themes/index.ts'

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
  for (const id of FAMILY_IDS) {
    const { palette } = familyAxes(id)
    const choices = [
      ...palette.map((p) => ({ name: p, axes: { palette: p }, mode: 'light' as const })),
      { name: 'dark', axes: {}, mode: 'dark' as const },
    ]
    for (const ch of choices)
      it(`${id} (${ch.name}): every text pair reaches AA on every surface, for every brand colour`, () => {
        const problems: string[] = []
        for (const brand of BRANDS)
          for (const [s, r] of Object.entries(theme(id, brand, ch).palette)) {
            const check = (name: string, a: string, b: string, min: number) => {
              const c = contrast(a, b)
              if (c < min) problems.push(`${brand} ${s}: ${name} ${a} on ${b} is ${c.toFixed(2)}:1`)
            }
            check('text', r.fg, r.bg, 4.5)
            check('muted text', r.fgMuted, r.bg, 4.5)
            check('link / accent', r.accent, r.bg, 4.5)
            check('button text', r.accentFg, r.accent, 4.5)
          }
        expect(problems).toEqual([])
      })
  }
})

describe('style settings', () => {
  it('every combination of settings builds a theme', () => {
    for (const id of FAMILY_IDS) {
      const lists = familyAxes(id)
      for (const type of lists.type)
        for (const palette of lists.palette)
          for (const corners of lists.corners)
            for (const density of lists.density)
              for (const frame of lists.frame) {
                const t = theme(id, '#5b4a7a', { axes: { type, palette, corners, density, frame } })
                expect(t.css).toContain('--type-display-family')
                expect(t.fontsHref).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?family=/)
              }
    }
  })
  it('rejects unknown families, settings and values', () => {
    expect(checkStyle({ family: 'quiet@1', axes: { type: 'instrument' } })).toEqual([])
    expect(checkStyle({ family: 'nope@1', axes: {} })).toHaveLength(1)
    expect(checkStyle({ family: 'quiet@2', axes: {} })).toHaveLength(1)
    expect(checkStyle({ family: 'quiet@1', axes: { type: 'oswald' } })).toHaveLength(1)
    expect(checkStyle({ family: 'poster@1', axes: { glow: 'on' } })).toHaveLength(1)
  })
  it('photo treatments: none by default, grey for mono, the brand hue for tint', () => {
    expect(theme('quiet', '#5b4a7a').css).not.toContain('filter')
    expect(theme('quiet', '#5b4a7a', { axes: { photo: 'mono' } }).css).toContain('grayscale(1)')
    for (const id of FAMILY_IDS)
      expect(theme(id, '#5b4a7a', { axes: { photo: 'tint' } }).css).toMatch(/hue-rotate\(\d+deg\)/)
    // A colourless brand gives a warm sepia instead of an arbitrary hue.
    expect(photoFilter('tint', '#111111')).toContain('sepia(0.55)')
    expect(photoFilter('tint', '#5b4a7a')).toContain('hue-rotate(223deg)')
  })
  it('inset framing adds panel rules; bleed adds none', () => {
    expect(theme('soft', '#5b4a7a', { axes: { frame: 'inset' } }).css).toContain('border-radius')
    expect(theme('soft', '#5b4a7a').css).not.toContain('border-radius')
  })
})
