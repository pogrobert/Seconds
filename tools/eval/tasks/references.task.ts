// The reference library (docs/research/2026-11-16-fine-to-ten.md): real local-business sites from
// agency portfolios and award galleries (references/sites.json), captured for internal study only.
// We learn patterns from them; nothing from them ships, and no layout is copied.
// For each site, once, at 1440 and 390 px: a first-screen and a full-page screenshot, plus measured
// facts: fonts and sizes per role, colours by area, the first screen's composition and the order of
// sections. Consent banners and pop-ups are hidden on screen; nothing is accepted or declined.
// Output: tools/eval/out/references/ (shots, git-ignored) and references/measured.json (committed).
// Run: pnpm --filter @repo/eval references       (ONLY=name1,name2 to redo some)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { type Browser, chromium } from 'playwright'
import { it } from 'vitest'

type Site = {
  name: string
  kind: number
  city: string
  url: string
  agency: string | null
  note: string
  verified: boolean
}

const sites = (
  JSON.parse(readFileSync(new URL('../references/sites.json', import.meta.url), 'utf8')) as Site[]
).filter((s) => s.verified)
const only = process.env.ONLY?.split(',')
const out = new URL('../out/references/', import.meta.url)
mkdirSync(new URL('shots/', out), { recursive: true })
export const slugOf = (s: Site) =>
  s.name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Measured inside the page: type per role, colours by painted area, first screen, section bands. */
const measure = () => {
  const vw = innerWidth
  const vh = innerHeight
  const style = (el: Element | null) => {
    if (!el) return null
    const cs = getComputedStyle(el)
    return {
      family: cs.fontFamily.split(',')[0]?.replace(/["']/g, '').trim(),
      size: Number.parseFloat(cs.fontSize),
      weight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      tracking: cs.letterSpacing,
      transform: cs.textTransform,
      italic: cs.fontStyle === 'italic',
      color: cs.color,
      text: (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80),
    }
  }
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none'
  }
  // The largest text in the first screen: the real "headline", whatever its tag.
  const texts = Array.from(document.querySelectorAll('body *')).filter(
    (el) =>
      Array.from(el.childNodes).some(
        (n) => n.nodeType === 3 && (n.textContent ?? '').trim().length > 1,
      ) && visible(el),
  )
  const inFirst = texts.filter((el) => el.getBoundingClientRect().top < vh)
  const biggest = [...inFirst].sort(
    (a, b) =>
      Number.parseFloat(getComputedStyle(b).fontSize) -
      Number.parseFloat(getComputedStyle(a).fontSize),
  )[0]
  const para = texts.find((el) => el.tagName === 'P' && (el.textContent ?? '').trim().length > 60)
  const button = Array.from(document.querySelectorAll('a, button')).find((el) => {
    const cs = getComputedStyle(el)
    return (
      visible(el) &&
      el.getBoundingClientRect().top < vh &&
      cs.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
      (el.textContent ?? '').trim().length > 1
    )
  })
  // Families in use, weighted by how much text each sets.
  const families: Record<string, number> = {}
  for (const el of texts) {
    const f = getComputedStyle(el).fontFamily.split(',')[0]?.replace(/["']/g, '').trim() ?? ''
    families[f] = (families[f] ?? 0) + (el.textContent ?? '').trim().length
  }
  // Background colours by painted area, sampled on a grid down the whole page.
  const areas: Record<string, number> = {}
  const H = document.documentElement.scrollHeight
  for (let y = 0; y < Math.min(H, 12000); y += 60) {
    window.scrollTo(0, Math.max(0, y - vh / 2))
    for (let x = 30; x < vw; x += 120) {
      let el = document.elementFromPoint(x, y - window.scrollY) as Element | null
      let bg = 'rgba(0, 0, 0, 0)'
      let img = false
      while (el) {
        const cs = getComputedStyle(el)
        if (
          el.tagName === 'IMG' ||
          el.tagName === 'VIDEO' ||
          el.tagName === 'CANVAS' ||
          cs.backgroundImage.includes('url(')
        ) {
          img = true
          break
        }
        if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && !cs.backgroundColor.endsWith(', 0)')) {
          bg = cs.backgroundColor
          break
        }
        el = el.parentElement
      }
      const k = img
        ? 'image'
        : bg === 'rgba(0, 0, 0, 0)'
          ? getComputedStyle(document.body).backgroundColor
          : bg
      areas[k] = (areas[k] ?? 0) + 1
    }
  }
  window.scrollTo(0, 0)
  // The first screen: how much is photo, where the biggest text sits.
  let photo = 0
  let cells = 0
  for (let y = 20; y < vh; y += 40)
    for (let x = 20; x < vw; x += 40) {
      cells++
      let el = document.elementFromPoint(x, y) as Element | null
      while (el) {
        const cs = getComputedStyle(el)
        if (
          el.tagName === 'IMG' ||
          el.tagName === 'VIDEO' ||
          el.tagName === 'CANVAS' ||
          cs.backgroundImage.includes('url(')
        ) {
          photo++
          break
        }
        el = el.parentElement
      }
    }
  const br = biggest?.getBoundingClientRect()
  return {
    title: document.title,
    height: H,
    headline: style(biggest ?? null),
    headlineBox: br
      ? { x: br.left / vw, y: br.top / vh, w: br.width / vw, h: br.height / vh }
      : null,
    body: style(para ?? null),
    button: button
      ? {
          ...style(button),
          bg: getComputedStyle(button).backgroundColor,
          radius: getComputedStyle(button).borderRadius,
        }
      : null,
    families: Object.entries(families)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    pageBg: getComputedStyle(document.body).backgroundColor,
    areas: Object.entries(areas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8),
    firstScreenPhoto: cells ? photo / cells : 0,
    headings: Array.from(document.querySelectorAll('h1, h2'))
      .filter(visible)
      .slice(0, 12)
      .map((h) => (h.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 60)),
  }
}

async function capture(browser: Browser, s: Site) {
  const slug = slugOf(s)
  const result: Record<string, unknown> = { ...s, slug }
  for (const width of [1440, 390]) {
    const tag = width > 500 ? 'desktop' : 'phone'
    const ctx = await browser.newContext({
      viewport: { width, height: width > 500 ? 900 : 844 },
      deviceScaleFactor: 1,
      userAgent:
        width > 500
          ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'
          : 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      locale: 'en-GB',
    })
    const page = await ctx.newPage()
    try {
      await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 45_000 })
      await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {})
      // Consent and pop-up layers the selectors missed: fixed or sticky layers about cookies or
      // privacy, and full-screen dimming backdrops. Hidden, never clicked.
      const unblock = () =>
        page
          .evaluate(() => {
            const vw = innerWidth
            const vh = innerHeight
            const docH = document.documentElement.scrollHeight
            const main = document.querySelector('main, h1')
            // Dialogs and modals (promotions, country or studio choosers), with their fixed wrappers.
            for (const d of Array.from(
              document.querySelectorAll(
                'dialog[open], [role="dialog"], [aria-modal="true"], [role="alertdialog"]',
              ),
            ) as HTMLElement[]) {
              if (main && d.contains(main)) continue
              let top: HTMLElement = d
              for (let p = d.parentElement; p && p !== document.body; p = p.parentElement)
                if (getComputedStyle(p).position === 'fixed' && !(main && p.contains(main))) top = p
              top.style.setProperty('display', 'none', 'important')
            }
            for (const el of Array.from(document.querySelectorAll('body *')) as HTMLElement[]) {
              // Named consent or pop-up widgets, unless the element wraps the page itself.
              const named =
                /cookie|consent|onetrust|cookiebot|usercentrics|cmplz|klaviyo|attentive|newsletter-popup/i.test(
                  `${el.id} ${typeof el.className === 'string' ? el.className : ''}`,
                )
              if (
                named &&
                !(main && el.contains(main)) &&
                el.getBoundingClientRect().height < docH * 0.6
              ) {
                el.style.setProperty('display', 'none', 'important')
                continue
              }
              const cs = getComputedStyle(el)
              if (cs.position !== 'fixed' && cs.position !== 'sticky') continue
              const r = el.getBoundingClientRect()
              const text = (el.textContent ?? '').toLowerCase()
              const consent =
                /cookie|consent|gdpr|we value your privacy/.test(text) &&
                text.length < 2000 &&
                !(main && el.contains(main))
              const backdrop =
                r.width >= vw * 0.9 &&
                r.height >= vh * 0.9 &&
                text.trim().length < 40 &&
                /rgba\(.*, 0\.\d+\)/.test(cs.backgroundColor)
              // Marketing pop-ups: a fixed box over the page offering a discount or a sign-up.
              const promo =
                cs.position === 'fixed' &&
                r.height > 120 &&
                /% off|\d+% |offer|subscribe|sign up|newsletter|unlock|discount|first (order|purchase|booking)|choose (your )?location|holiday part/.test(
                  text,
                ) &&
                text.length < 1500 &&
                !(main && el.contains(main))
              if (consent || backdrop || promo) el.style.setProperty('display', 'none', 'important')
            }
            if (getComputedStyle(document.documentElement).overflowY === 'hidden')
              document.documentElement.style.setProperty('overflow', 'auto', 'important')
            // Only undo a scroll lock: `auto` here would make the body its own scroll box.
            if (getComputedStyle(document.body).overflowY === 'hidden')
              document.body.style.setProperty('overflow', 'visible', 'important')
          })
          .catch(() => {})
      await unblock()
      await page.waitForTimeout(300)
      await unblock()
      await page.evaluate(() => document.fonts.ready).catch(() => {})
      await page.waitForTimeout(1500)
      await page.screenshot({
        path: new URL(`shots/${slug}-${tag}-top.jpg`, out).pathname,
        quality: 70,
      })
      // Some sites build their content late; others scroll inside one container (smooth-scroll
      // libraries), so the page itself is one screen tall. Wait, then let such a container grow
      // to its full height so the full-page screenshot and the measures see the whole page.
      await page.waitForTimeout(2500)
      await page
        .evaluate(() => {
          const vh = innerHeight
          if (document.documentElement.scrollHeight > vh * 1.3) return
          const inner = (Array.from(document.querySelectorAll('body *')) as HTMLElement[])
            .filter(
              (e) =>
                e.scrollHeight > vh * 1.5 &&
                /auto|scroll|hidden/.test(getComputedStyle(e).overflowY) &&
                e.clientHeight >= vh * 0.6,
            )
            .sort((a, b) => b.scrollHeight - a.scrollHeight)[0]
          if (!inner) return
          for (let el: HTMLElement | null = inner; el; el = el.parentElement)
            for (const [k, v] of [
              ['height', 'auto'],
              ['max-height', 'none'],
              ['overflow', 'visible'],
              ['position', getComputedStyle(el).position === 'fixed' ? 'relative' : ''],
            ] as const)
              if (v) el.style.setProperty(k, v, 'important')
        })
        .catch(() => {})
      // Scroll through for lazy content, then a full page (capped at 14,000 px tall).
      await page.evaluate(async () => {
        const H = Math.min(document.documentElement.scrollHeight, 14_000)
        for (let y = 0; y < H; y += 700) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 120))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(800)
      const h = await page.evaluate(() => Math.min(document.documentElement.scrollHeight, 14_000))
      await page.screenshot({
        path: new URL(`shots/${slug}-${tag}-full.jpg`, out).pathname,
        quality: 55,
        clip: { x: 0, y: 0, width, height: h },
        fullPage: true,
      })
      result[tag] = await page.evaluate(measure)
    } catch (e) {
      result[`${tag}Error`] = e instanceof Error ? e.message.split('\n')[0] : String(e)
    } finally {
      await ctx.close()
    }
  }
  return result
}

it('captures the reference library', async () => {
  const browser = await chromium.launch()
  const todo = sites.filter((s) => !only || only.includes(s.name))
  const done: Record<string, unknown>[] = []
  const queue = [...todo]
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let s = queue.shift(); s; s = queue.shift()) {
        const t0 = performance.now()
        done.push({ ...(await capture(browser, s)), ms: Math.round(performance.now() - t0) })
      }
    }),
  )
  await browser.close()
  const file = new URL('../references/measured.json', import.meta.url)
  let prev: Record<string, unknown>[] = []
  try {
    prev = JSON.parse(readFileSync(file, 'utf8'))
  } catch {}
  const merged = [...prev.filter((p) => !done.some((d) => d.name === p.name)), ...done].sort(
    (a, b) => Number(a.kind) - Number(b.kind) || String(a.name).localeCompare(String(b.name)),
  )
  writeFileSync(file, `${JSON.stringify(merged, null, 2)}\n`)
}, 3_600_000)
