// The taste board (docs/m0/07-blind-test.md, "what next"): screenshots of real websites with
// excellent design, for Robert to mark. Research material for choosing design directions; the
// pictures stay private and nothing is copied from these sites into the library.
// Input: tools/eval/taste/board-candidates.json ([{id, url, name, kind, style, why, source}]).
// Output: tools/eval/out/board/<id>-top.png (1440×900 first screen), <id>-phone.png (390×844),
// <id>-full.png (whole page, at most 7,000 px tall) and shots.json (what loaded, what failed).
// Run: pnpm --filter @repo/eval board
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { chromium, type Page } from 'playwright'
import { it } from 'vitest'

type Candidate = { id: string; url: string; name: string }
const candidates = JSON.parse(
  readFileSync(new URL('../taste/board-candidates.json', import.meta.url), 'utf8'),
) as Candidate[]
const out = new URL('../out/board/', import.meta.url)
mkdirSync(out, { recursive: true })
const only = process.env.ONLY?.split(',')

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'

/** Hides cookie and consent banners, so the page itself shows. Never clicks "accept". */
async function hideBanners(page: Page) {
  await page.evaluate(() => {
    const words = /cookie|consent|gdpr|privacy|we use|accept all/i
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
      const s = getComputedStyle(el)
      if ((s.position === 'fixed' || s.position === 'sticky') && words.test(el.innerText ?? '')) {
        const r = el.getBoundingClientRect()
        if (r.height < window.innerHeight * 0.9 || /cookie|consent/i.test(el.id + el.className))
          el.style.setProperty('display', 'none', 'important')
      }
    }
    for (const id of [
      'onetrust-banner-sdk',
      'CybotCookiebotDialog',
      'usercentrics-root',
      'cookie-law-info-bar',
    ])
      document.getElementById(id)?.style.setProperty('display', 'none', 'important')
    // Sign-up and newsletter pop-ups: dialogs, and large fixed boxes that ask for an email.
    const ask = /subscribe|newsletter|sign up|your email|join our|community|sign-up/i
    for (const el of Array.from(
      document.querySelectorAll<HTMLElement>('[role="dialog"], [aria-modal="true"], body *'),
    )) {
      const s = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      const dialog = el.matches('[role="dialog"], [aria-modal="true"]')
      const big =
        (s.position === 'fixed' || s.position === 'absolute') &&
        r.width * r.height > 0.08 * innerWidth * innerHeight
      if ((dialog || big) && ask.test(el.innerText ?? '') && r.height < innerHeight * 1.05)
        el.style.setProperty('display', 'none', 'important')
    }
    document.documentElement.style.setProperty('overflow', 'auto', 'important')
    document.body.style.setProperty('overflow', 'auto', 'important')
  })
}

/** Scrolls through the page so lazy images and scroll effects load, then returns to the top. */
async function wake(page: Page) {
  await page.evaluate(async () => {
    const h = Math.min(document.documentElement.scrollHeight, 9000)
    for (let y = 0; y < h; y += 600) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 400))
  })
}

it(`screenshots ${candidates.length} board candidates`, async () => {
  const browser = await chromium.launch(process.env.CHANNEL ? { channel: process.env.CHANNEL } : {})
  const report: Record<string, { ok: boolean; error?: string; title?: string; height?: number }> =
    {}
  for (const c of candidates.filter((x) => !only || only.includes(x.id))) {
    const ctx = await browser.newContext({
      userAgent: UA,
      locale: 'en-GB',
      viewport: { width: 1440, height: 900 },
    })
    const page = await ctx.newPage()
    try {
      await page.goto(c.url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
      await page.waitForLoadState('load', { timeout: 15_000 }).catch(() => {})
      await page.waitForTimeout(6000)
      await page.keyboard.press('Escape').catch(() => {})
      await hideBanners(page)
      // The first screen before any scrolling: some sites control their own scrolling and never
      // return exactly to the top.
      await page.screenshot({ path: new URL(`${c.id}-top.png`, out).pathname })
      await wake(page)
      await hideBanners(page)
      const height = await page.evaluate(() => document.documentElement.scrollHeight)
      await page.screenshot({
        path: new URL(`${c.id}-full.png`, out).pathname,
        fullPage: height <= 7000,
        ...(height > 7000 ? { clip: { x: 0, y: 0, width: 1440, height: 7000 } } : {}),
      })
      await page.setViewportSize({ width: 390, height: 844 })
      await page.waitForTimeout(1200)
      await hideBanners(page)
      await page.screenshot({ path: new URL(`${c.id}-phone.png`, out).pathname })
      report[c.id] = { ok: true, title: await page.title(), height }
    } catch (e) {
      report[c.id] = { ok: false, error: (e as Error).message.split('\n')[0] }
    }
    await ctx.close()
  }
  await browser.close()
  writeFileSync(new URL('shots.json', out), JSON.stringify(report, null, 2))
}, 3_600_000)
