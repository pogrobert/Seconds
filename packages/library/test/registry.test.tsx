import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { blockText, fits, KINDS, REGISTRY } from '../src/registry.ts'
import { full, minimal, rtl } from './fixtures.ts'

// Words that mean a block still carries its source's demo content.
const DEMO =
  /lorem|ipsum|acme|tailark|shadcn|efferd|vercel|nextjs|next\.js|github\.com|example\.com|john doe|jane doe|unsplash|placeholder|tailwind ?ui|\$\d+\/mo|startup|saas|dashboard/i

describe('library registry', () => {
  it('describes every block for Jev (scripts/describe.py)', () => {
    const missing = REGISTRY.filter((e) => blockText(e) === e.id).map((e) => e.id)
    expect(missing).toEqual([])
  })

  it('has unique ids that name their library and kind', () => {
    const ids = REGISTRY.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const e of REGISTRY) {
      expect(KINDS).toContain(e.kind)
      expect(
        e.id.startsWith(
          `${e.source.lib === 'shadcnui-blocks' ? 'shadcnui' : e.source.lib}/${e.kind}-`,
        ),
      ).toBe(true)
    }
  })

  // A block that shows another section's words must say so, or the page would show them twice.
  const marks: Partial<Record<string, string>> = {
    reasons: full.reasons[1]?.body,
    about: full.about.slice(0, 40),
    offer: 'Visitor card',
    contact: 'Dominikánské',
    faq: full.faq?.[0]?.q,
    stats: 'usual wait',
    cta: full.cta.headline,
    statement: full.statement?.slice(0, 40),
    steps: full.steps?.items[1]?.body,
    audience: full.audience?.items[1]?.body,
  }

  for (const e of REGISTRY)
    describe(e.id, () => {
      it('declares the other sections it shows', () => {
        if (e.kind === 'header' || e.kind === 'footer') return
        const html = renderToStaticMarkup(<e.component c={full} />)
        const shown = Object.entries(marks)
          .filter(([k, m]) => k !== e.kind && m && html.includes(m))
          .map(([k]) => k)
        expect(shown.sort()).toEqual([...(e.covers ?? [])].sort())
      })
      const C = e.component
      it('renders full, minimal and right-to-left content', () => {
        for (const c of [full, rtl, minimal]) {
          if (!fits(e, c)) continue
          const html = renderToStaticMarkup(<C c={c} />)
          // A section may step aside when the minimal site lacks its facts (no contact details).
          if (c !== minimal) expect(html.length).toBeGreaterThan(0)
        }
      })
      it('shows the content it is given, and no demo text', () => {
        const html = renderToStaticMarkup(<C c={full} />)
        expect(html).not.toMatch(DEMO)
        expect(html).not.toMatch(/<img(?![^>]*\balt=)/)
        if (e.kind === 'hero') expect(html).toContain('Everything the city centre office')
      })
      it('uses theme tokens, not literal colours', () => {
        const html = renderToStaticMarkup(<C c={full} />)
        const literal = html.match(
          /\b(?:bg|text|border|from|to|via|fill|stroke|ring)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|stone)-\d{2,3}\b|#[0-9a-f]{6}\b/gi,
        )
        expect(literal ?? []).toEqual([])
      })
    })
})
