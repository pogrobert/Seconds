import { describe, expect, it } from 'vitest'
import { plans, renderSite } from '../src/page.tsx'
import { full, minimal } from './fixtures.ts'

const theme = { css: '', fontsHref: '', dark: false }

describe('plans', () => {
  it('opens each plan with a different hero and renders whole pages', () => {
    const ps = plans('brno', 5, full)
    expect(new Set(ps.map((p) => p.hero)).size).toBe(Math.min(5, ps.length))
    for (const p of ps) {
      expect(p.footer).toBeTruthy()
      const html = renderSite(full, p, theme, { css: '' })
      expect(html).toContain(full.headline)
    }
  })
  it('leaves out sections the content cannot fill', () => {
    for (const p of plans('tailor', 5, minimal)) {
      expect(p.contact).toBeUndefined()
      expect(p.faq ?? p.stats ?? p.testimonials ?? p.team).toBeUndefined()
      renderSite(minimal, p, theme, { css: '' })
    }
  })
  it('draws a page with no photo at all when asked', () => {
    for (const p of plans('no photos', 5, full, { photos: false })) {
      expect(p.hero).toBeTruthy()
      expect(p.gallery).toBeUndefined()
      expect(renderSite(full, p, theme, { css: '' })).not.toContain('<img')
    }
  })
  it('is the same for the same seed', () => {
    expect(plans('x', 3, full)).toEqual(plans('x', 3, full))
  })
})
