import { describe, expect, it } from 'vitest'
import { tidy } from '../src/text.ts'

describe('tidy', () => {
  it('turns HTML entities a model wrote into the characters they stand for', () => {
    // "York B&amp;B" showed as it was on a page (2026-11-24): the page escapes text itself.
    expect(tidy('York B&amp;B')).toBe('York B&B')
    expect(tidy({ a: ['Fish &amp; chips', 'it&#39;s'] })).toEqual({ a: ['Fish & chips', "it's"] })
  })

  it('leaves plain text and unknown entities alone', () => {
    expect(tidy('B&B, 5 < 6')).toBe('B&B, 5 < 6')
    expect(tidy('&copy; 2026')).toBe('&copy; 2026')
  })

  it('still replaces the characters some fonts lack', () => {
    expect(tidy('co‑op now')).toBe('co-op now')
  })
})
