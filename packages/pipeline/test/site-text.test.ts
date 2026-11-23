import { describe, expect, it } from 'vitest'
import { cutToSentence, groundContact, type SiteCopy } from '../src/site-text.ts'

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

describe('groundContact', () => {
  const copy = (contact: Partial<SiteCopy['contact']>) =>
    ({
      contact: { place: '', address: '', hours: '', phone: '', email: '', ...contact },
    }) as SiteCopy
  const words =
    'Physio clinic at 12 Leith Walk, Edinburgh EH6 5AA. Call 0131 496 0142 or hello@leithphysio.co.uk.'

  it('keeps what the owner gave, tidied', () => {
    const c = groundContact(
      copy({
        address: '12 Leith Walk, Edinburgh, EH6 5AA',
        phone: '+44 131 496 0142',
        email: 'hello@leithphysio.co.uk',
      }),
      words,
    ).contact
    expect(c.address).toBe('12 Leith Walk, Edinburgh, EH6 5AA')
    expect(c.phone).toBe('+44 131 496 0142')
    expect(c.email).toBe('hello@leithphysio.co.uk')
  })

  it('drops an address, phone or email the owner never gave', () => {
    const c = groundContact(
      copy({
        address: '45 Great Junction Street, Leith',
        phone: '0131 555 0199',
        email: 'info@leith.com',
      }),
      'Physio clinic in Leith, Edinburgh, for runners.',
    ).contact
    expect(c).toMatchObject({ address: '', phone: '', email: '' })
  })

  it('drops a made-up house number on a real street', () => {
    expect(groundContact(copy({ address: '7 Leith Walk' }), words).contact.address).toBe('')
  })

  it('matches across accents', () => {
    expect(
      groundContact(
        copy({ address: 'Rua de São Bento 120, Lisboa' }),
        'Shop at rua de sao bento 120, Lisboa',
      ).contact.address,
    ).toBe('Rua de São Bento 120, Lisboa')
  })
})
