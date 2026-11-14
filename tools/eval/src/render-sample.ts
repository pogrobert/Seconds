import { generate, toSvg } from '@pogrobert/surfaces'
import { siteCss } from '@repo/blocks/build'
import { components } from '@repo/blocks/components'
import { manifests } from '@repo/blocks/manifest'
import { type FamilyId, theme } from '@repo/blocks/themes'
import { assemble, DEFAULT_PLANS, type SitePlan } from '@repo/pipeline'
import { renderDocument } from '@repo/render'
import { type SiteSpec, validateSite } from '@repo/spec'
import { type Kind, SAMPLES } from './businesses.ts'
import { sampleAssets, standInContent } from './stand-in.ts'

/** Renders one sample business with a plan, in a style family (or the draft placeholder theme). */
export async function renderSample(
  kind: Kind,
  opts: {
    plan?: SitePlan
    family?: FamilyId
    /** URL prefix where the page will find photos/ files, relative to the page. */
    photoBase?: string
  } = {},
): Promise<{ html: string; spec: SiteSpec; problems: string[]; notes: string[] }> {
  const s = SAMPLES[kind]
  const plan = opts.plan ?? DEFAULT_PLANS[kind]
  const spec = assemble(
    plan,
    {
      business: s.business,
      collections: s.collections,
      assets: sampleAssets(s),
      color: s.palette,
      locale: 'en-GB',
      dir: 'ltr',
    },
    (sec) => standInContent(s, sec),
    { seed: kind, release: '2026.11.14' },
  )
  if (opts.family) spec.style = { ...spec.style, family: `${opts.family}@1` }
  const v = validateSite(spec)
  const t = opts.family ? theme(opts.family, s.palette) : undefined
  const types = [...plan.before, ...plan.sections, ...plan.after].map((x) => x.type)
  const css = await siteCss(types, t?.css)
  const art = t?.art ?? 'riso'
  const r = renderDocument(spec, Object.keys(spec.structure.pages)[0] as `p_${string}`, {
    css,
    head: t
      ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${t.fontsHref}">`
      : '',
    library: { manifests, components },
    button: t?.button ?? 'solid',
    imageUrl: (asset, o) => {
      if (asset.source.type === 'stock')
        return {
          src: `${opts.photoBase ?? new URL('../photos/', import.meta.url).href}${asset.source.key}`,
          width: asset.width ?? 1600,
          height: asset.height ?? 1067,
        }
      const w = 1200
      const h = Math.round(w / (o.aspect ?? 1.5))
      const seed = asset.source.type === 'generated' ? asset.source.seed : asset.id
      const svg = toSvg(
        generate({ style: art as 'riso', seed, color: s.palette, width: w, height: h }),
      )
      return {
        src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        width: w,
        height: h,
      }
    },
  })
  return { html: r.html, spec, problems: v.ok ? [] : v.problems, notes: r.notes }
}
