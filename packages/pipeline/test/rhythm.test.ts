import { describe, expect, it } from 'vitest'
import { DEFAULT_PLANS, KINDS } from '../src/defaults.ts'
import { applyRhythm, RHYTHM_NAMES } from '../src/rhythm.ts'

describe('page rhythm', () => {
  for (const kind of KINDS)
    for (const rhythm of RHYTHM_NAMES)
      it(`${kind} / ${rhythm}: the hero sits on the ground and no two neighbours share a colour block`, () => {
        const plan = applyRhythm(DEFAULT_PLANS[kind], rhythm)
        const s = plan.sections.map((x) => x.surface)
        expect(s[0]).toBe('base')
        for (let i = 1; i < s.length; i++)
          if (s[i] !== 'base' && !(rhythm === 'dark-end' && s[i] === 'inverse'))
            expect(s[i]).not.toBe(s[i - 1])
        expect([...plan.before, ...plan.sections, ...plan.after].every((x) => x.surface)).toBe(true)
      })
  it('rhythms differ from each other on the same page', () => {
    const looks = RHYTHM_NAMES.map((r) =>
      applyRhythm(DEFAULT_PLANS.salon, r)
        .sections.map((x) => x.surface)
        .join(','),
    )
    expect(new Set(looks).size).toBe(RHYTHM_NAMES.length)
  })
})
