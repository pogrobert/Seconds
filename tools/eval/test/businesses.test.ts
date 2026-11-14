import { Business, Collection } from '@repo/spec'
import { describe, expect, it } from 'vitest'
import { KINDS, SAMPLES } from '../src/businesses.ts'

describe('sample businesses', () => {
  for (const kind of KINDS) {
    it(`${kind}: facts and collections are valid`, () => {
      const s = SAMPLES[kind]
      const b = Business.safeParse(s.business)
      expect(b.success, JSON.stringify(b.error?.issues.slice(0, 3))).toBe(true)
      for (const c of s.collections) {
        const r = Collection.safeParse(c)
        expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
      }
    })
  }
})
