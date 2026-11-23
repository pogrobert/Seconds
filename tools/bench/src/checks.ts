// Checks code can judge (docs/m0/18-bench.md). Taste is left to blind ratings.

/**
 * Runs inside the page (page.evaluate), so it must not use anything from outside itself.
 * Returns plain sentences.
 */
export const pageChecks = async () => {
  const found: string[] = []
  // Photos set to load late would count as missing: load them all first (at most 8 s).
  for (const img of Array.from(document.images)) img.loading = 'eager'
  await Promise.race([
    Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => {}))),
    new Promise((r) => setTimeout(r, 8000)),
  ])
  const vw = document.documentElement.clientWidth
  if (document.documentElement.scrollWidth > vw + 1)
    found.push(`page scrolls sideways (${document.documentElement.scrollWidth}px wide)`)
  for (const img of Array.from(document.images))
    if (!img.complete || img.naturalWidth === 0) found.push(`photo did not load: ${img.alt}`)
  if (/__IMG_/.test(document.documentElement.innerHTML)) found.push('a photo token was left in')
  for (const s of Array.from(document.querySelectorAll('main > *, body > section'))) {
    // A section a template hides on purpose (no photo left for it) is not an empty one.
    if (getComputedStyle(s).display === 'none') continue
    const r = s.getBoundingClientRect()
    if (r.height < 48) found.push(`section ${s.id || s.tagName.toLowerCase()} is nearly empty`)
  }
  // Words a block cut off, or a field that never got its text.
  const text = document.body.innerText
  if (/(\w)…(\s|$)/.test(text)) found.push('text ends in "…" (cut off)')
  if (/\b(undefined|null|NaN)\b|\{\w+\}/.test(text)) found.push('a raw value is shown')
  const h1 = document.querySelectorAll('h1').length
  if (h1 !== 1) found.push(`${h1} main headings`)
  // Visible text past the window's edge, unless a scroll strip or clipped box holds it on purpose.
  const held = (el: Element) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p)
      if (o.overflowX !== 'visible' || o.overflow === 'hidden') return true
    }
    return false
  }
  for (const el of Array.from(document.querySelectorAll('h1,h2,h3,p,a,li'))) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || (el as HTMLElement).offsetParent === null) continue
    if (el.closest('details:not([open])')) continue
    if (r.right > vw + 2 && !held(el)) {
      found.push(
        `<${el.tagName.toLowerCase()}> "${(el.textContent ?? '').trim().slice(0, 30)}" runs off the edge`,
      )
      break
    }
  }
  return [...new Set(found)].slice(0, 10)
}

const norm = (s: string) => s.toLowerCase().replace(/[\s.()-]/g, '')

/**
 * Facts on the page that the brief never gave: numbers, prices, emails, years, and claims such
 * as awards or reviews. Flags, not proof: a flagged number can be harmless ("24 hours").
 */
export function factProblems(brief: string, page: string): string[] {
  const b = norm(brief)
  const out = new Set<string>()
  for (const m of page.matchAll(
    /[£€$]\s?\d[\d,.]*|\d[\d ]{5,}\d|\b(?:19|20)\d\d\b|[\w.+-]+@[\w-]+\.[\w.]+/g,
  )) {
    const v = m[0].trim().replace(/[.,]+$/, '')
    if (v === String(new Date().getFullYear()) && /©\s*\d{4}/.test(page)) continue
    if (!b.includes(norm(v))) out.add(`"${v}" is not in the brief`)
  }
  const CLAIMS =
    /\b(award[- ]winning|awards?|rated|five[- ]stars?|certified|accredited|since \d{4}|\d+\+? years|years of experience|online (?:form|booking)|book online|guarantee[ds]?|free (?:parking|wifi|consultation|quote))\b/gi
  // Compare stems: the owner's "guarantee" covers the page's "guaranteed".
  for (const m of page.matchAll(CLAIMS))
    if (!b.includes(norm(m[0]).replace(/(ed|d|s)$/, '')))
      out.add(`claim "${m[0]}" is not in the brief`)
  return [...out].slice(0, 12)
}
