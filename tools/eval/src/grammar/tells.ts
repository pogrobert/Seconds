// The tell linter (docs/research/2026-11-16-fine-to-ten.md, section 5.3): checks a rendered page for
// the habits that make sites look generated, unless a rule chose the habit on purpose. Run inside
// the page with page.evaluate(tells, allowed). Self-contained: no imports, no closures.
// Sources: Anthropic's frontend-design skill (anthropics/skills, Apache-2.0), Vercel's Web Interface
// Guidelines (MIT), and design write-ups on AI defaults; each check names its tell.

export const TELLS = [
  'one-word emphasis',
  'eyebrow labels',
  'decorative numbering',
  'default typeface',
  'gradient text',
  'everything centred',
] as const

export const tells = (allowed: string[]): string[] => {
  const found: string[] = []
  const flag = (tell: string, detail: string) => {
    if (!allowed.includes(tell)) found.push(`${tell}: ${detail}`)
  }
  const headings = Array.from(document.querySelectorAll('h1, h2'))

  // A headline with one word set apart in italics or colour.
  for (const h of headings) {
    const marked = h.querySelectorAll('em, i, strong, b, span')
    for (const m of Array.from(marked))
      if ((m.textContent ?? '').trim().split(/\s+/).length === 1) {
        flag('one-word emphasis', (h.textContent ?? '').trim().slice(0, 40))
        break
      }
  }

  // Small spaced capitals sitting right above a heading ("eyebrows"). One is a choice; a habit is a tell.
  let eyebrows = 0
  const small = Array.from(document.querySelectorAll('body *')).filter((el) => {
    if (el.children.length > 0 || !(el.textContent ?? '').trim()) return false
    const cs = getComputedStyle(el)
    return (
      cs.textTransform === 'uppercase' &&
      Number.parseFloat(cs.fontSize) < 15 &&
      Number.parseFloat(cs.letterSpacing || '0') > 0.5
    )
  })
  for (const h of headings) {
    const hr = h.getBoundingClientRect()
    if (hr.width < 2) continue
    const above = small.some((el) => {
      const r = el.getBoundingClientRect()
      const gap = hr.top - r.bottom
      return gap >= -2 && gap < 48 && r.right > hr.left && r.left < hr.right
    })
    if (above) eyebrows++
  }
  if (eyebrows >= 2)
    flag('eyebrow labels', `${eyebrows} headings have a small capitals label above`)

  // 01, 02, (03)… on things that are not a sequence.
  const numbered = Array.from(document.querySelectorAll('body *')).filter(
    (el) =>
      el.children.length === 0 &&
      /^\(?0[1-9]\)?\.?$/.test((el.textContent ?? '').trim()) &&
      !el.closest('ol'),
  )
  if (numbered.length >= 2) flag('decorative numbering', `${numbered.length} labels like "01"`)

  // A default face as the only voice.
  const DEFAULTS = [
    'inter',
    'roboto',
    'arial',
    'helvetica',
    'system-ui',
    'open sans',
    '-apple-system',
  ]
  const first = (el: Element | null) =>
    el
      ? (getComputedStyle(el).fontFamily.split(',')[0] ?? '')
          .replace(/["']/g, '')
          .trim()
          .toLowerCase()
      : ''
  const faces = new Set([first(document.body), first(document.querySelector('h1'))])
  if ([...faces].every((f) => DEFAULTS.includes(f))) flag('default typeface', [...faces].join(', '))

  // Text filled with a gradient.
  for (const el of Array.from(document.querySelectorAll('body *'))) {
    const cs = getComputedStyle(el) as CSSStyleDeclaration & { webkitBackgroundClip?: string }
    if (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text') {
      flag('gradient text', el.tagName.toLowerCase())
      break
    }
  }

  // Every paragraph centred.
  const paras = Array.from(document.querySelectorAll('main p')).filter(
    (p) => (p.textContent ?? '').trim().length >= 40,
  )
  const centred = paras.filter((p) => getComputedStyle(p).textAlign === 'center').length
  if (paras.length >= 4 && centred / paras.length > 0.6)
    flag('everything centred', `${centred} of ${paras.length} paragraphs`)

  return found
}
