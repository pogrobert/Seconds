import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { motionFor } from '../src/motion.ts'
import { renderSite } from '../src/page.tsx'
import { REGISTRY } from '../src/registry.ts'
import { full } from './fixtures.ts'

const KNOWN = ['reveal', 'marquee', 'marquee-y', 'gradient-text', 'grid', 'scroll-header', 'rotate']
const theme = { css: '', fontsHref: '', dark: false }

describe('motion', () => {
  const moving = REGISTRY.filter((e) =>
    /\sdata-m="/.test(renderToStaticMarkup(<e.component c={full} />)),
  )

  it('marks the blocks whose originals animated', () => {
    expect(moving.map((e) => e.id).sort()).toEqual(
      [
        'efferd/footer-2',
        'efferd/footer-5',
        'efferd/gallery-1',
        'efferd/testimonials-1',
        'efferd/testimonials-2',
        'shadcnui/hero-03',
        'shadcnui/hero-07',
        'shadcnui/testimonials-04',
        'tailark/hero-veil-four',
        'tailark/testimonials-dusk-two',
      ].sort(),
    )
  })

  it('uses only markers the script knows', () => {
    for (const e of moving) {
      const html = renderToStaticMarkup(<e.component c={full} />)
      for (const m of html.matchAll(/\sdata-m="([^"]+)"/g)) expect(KNOWN).toContain(m[1])
    }
  })

  it('adds the script only to pages with a moving block', () => {
    expect(motionFor('<p>still</p>')).toEqual({ head: '', end: '' })
    const still = renderSite(
      full,
      { hero: 'core/hero-plate', footer: 'core/footer-simple' },
      theme,
      {
        css: '',
      },
    )
    expect(still).not.toContain('<script')
    const moves = renderSite(full, { hero: 'shadcnui/hero-07', footer: 'efferd/footer-2' }, theme, {
      css: '',
    })
    expect(moves).toContain('window.__m=1')
    expect(moves).toContain('prefers-reduced-motion')
  })
})
