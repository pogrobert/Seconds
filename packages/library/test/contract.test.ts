// The template contract's rules that code can check (src/templates/README.md). Taste is checked
// by the gate and by review, not here.
import { describe, expect, it } from 'vitest'
import { TEMPLATES } from '../src/index.ts'
import { RESET } from '../src/templates/shared.tsx'

describe('every template keeps the contract', () => {
  it('has a unique id and label', () => {
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length)
    expect(new Set(TEMPLATES.map((t) => t.label)).size).toBe(TEMPLATES.length)
  })
  for (const t of TEMPLATES)
    describe(t.id, () => {
      it('describes itself for the decision model: one sentence ending with who it suits', () => {
        expect(t.text).toMatch(/\bfor\b[^.]*\.$/)
        expect(t.text.length).toBeGreaterThan(80)
        expect(t.text).not.toMatch(/Describe the look and feel here/)
      })
      it('starts its CSS from the shared reset', () => {
        expect(t.css.startsWith(RESET)).toBe(true)
      })
      it('says when it is dark', () => {
        expect(t.css.includes('color-scheme:dark')).toBe(t.dark)
      })
      it('takes its fonts from the theme', () => {
        const own = [...t.css.matchAll(/font-family:([^;}]+)/g)]
          .map((m) => m[1]?.trim() ?? '')
          .filter((f) => !f.startsWith('var(') && f !== 'inherit')
        expect(own).toEqual([])
      })
    })
})
