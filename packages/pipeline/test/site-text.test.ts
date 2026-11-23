import { describe, expect, it } from 'vitest'
import { cutToSentence } from '../src/site-text.ts'

describe('cutToSentence', () => {
  it('keeps text that ends like a sentence', () => {
    expect(cutToSentence('A bakery in Hackney.', 40)).toBe('A bakery in Hackney.')
  })

  it('cuts a paragraph back to its last full sentence', () => {
    const t = 'We bake every morning. The ovens are on by fi'
    expect(cutToSentence(t, t.length)).toBe('We bake every morning.')
  })

  it('ends a cut one-sentence text at its last clause, not with an ellipsis', () => {
    const t =
      'A local food bank in Birmingham offering food parcels to those in need; you can donate food, money or volunteer your'
    expect(cutToSentence(t, t.length)).toBe(
      'A local food bank in Birmingham offering food parcels to those in need; you can donate food.',
    )
  })

  it('falls back to an ellipsis when no clause break is far enough in', () => {
    const t = 'Plumbers on call across Bristol every night of the week for burst pip'
    expect(cutToSentence(t, t.length)).toBe(
      'Plumbers on call across Bristol every night of the week for burst…',
    )
  })
})
