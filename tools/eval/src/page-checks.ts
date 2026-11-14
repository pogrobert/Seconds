// Checks run inside a rendered page (pass to page.evaluate): page wider than the window, elements
// sticking out, and text that something else is painted over. Problems are listed, not hidden.
// Used by the Wall and the M0 run; axe runs separately.
export const pageProblems = () => {
  const vw = document.documentElement.clientWidth
  const found: string[] = []
  if (document.documentElement.scrollWidth > vw + 1)
    found.push(`page is ${document.documentElement.scrollWidth}px wide`)
  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    const r = el.getBoundingClientRect()
    if (r.width <= 1 && r.height <= 1) continue
    if (r.right > vw + 1 || r.left < -1) {
      const block = el.closest('[data-block-type]')
      found.push(
        `${block?.getAttribute('data-block-type')}#${block?.getAttribute('data-variant')}: <${el.tagName.toLowerCase()}> sticks out`,
      )
    }
  }
  // Text that something else is painted over, such as a photo drawn on top of the words laid on it.
  for (const el of Array.from(
    document.querySelectorAll(
      '[data-slot="headline"], [data-slot^="primaryCta"], [data-slot="subhead"]',
    ),
  )) {
    el.scrollIntoView({ block: 'center' })
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 12))
    if (top && !el.contains(top) && !top.contains(el)) {
      const block = el.closest('[data-block-type]')
      found.push(
        `${block?.getAttribute('data-block-type')}#${block?.getAttribute('data-variant')}: ${el.getAttribute('data-slot')} is covered by <${top.tagName.toLowerCase()}>`,
      )
    }
  }
  window.scrollTo(0, 0)
  return [...new Set(found)].slice(0, 8)
}
