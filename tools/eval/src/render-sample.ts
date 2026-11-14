import { generate, toSvg } from '@pogrobert/surfaces'
import { siteCss } from '@repo/blocks/build'
import { components } from '@repo/blocks/components'
import { manifests } from '@repo/blocks/manifest'
import { type FamilyId, resolveStyle, theme } from '@repo/blocks/themes'
import { assemble, type ContentFor, DEFAULT_PLANS, type SitePlan } from '@repo/pipeline'
import { renderDocument } from '@repo/render'
import { type SiteSpec, validateSite } from '@repo/spec'
import { type Kind, SAMPLES, type SampleBusiness } from './businesses.ts'
import { sampleAssets, standInContent } from './stand-in.ts'

/**
 * Renders one sample business with a plan, in the plan's style family and settings (`family`
 * overrides the family; `draft` uses the draft placeholder theme).
 */
export async function renderSample(
  kind: Kind,
  opts: {
    plan?: SitePlan
    family?: FamilyId
    draft?: boolean
    /** Section content; the stand-in content when absent. */
    content?: ContentFor
    /** URL prefix where the page will find photos/ files, relative to the page. */
    photoBase?: string
    /** The brand colour; the sample business's own when absent. */
    brand?: string
    /** Another business of the same kind (a brief's name and words); the sample when absent. */
    sample?: SampleBusiness
  } = {},
): Promise<{ html: string; spec: SiteSpec; problems: string[]; notes: string[] }> {
  const s = opts.sample ?? SAMPLES[kind]
  const plan = opts.plan ?? DEFAULT_PLANS[kind]
  const brand = opts.brand ?? s.palette
  const spec = assemble(
    plan,
    {
      business: s.business,
      collections: s.collections,
      assets: sampleAssets(s),
      color: brand,
      locale: 'en-GB',
      dir: 'ltr',
    },
    opts.content ?? ((sec) => standInContent(s, sec)),
    { seed: opts.sample ? `${kind}-${s.business.name}` : kind, release: '2026.11.14' },
  )
  if (opts.family) spec.style = { ...spec.style, family: `${opts.family}@1` }
  const v = validateSite(spec)
  const st = resolveStyle(spec.style)
  const t = opts.draft ? undefined : theme(st.id, brand, { axes: st.axes, mode: st.mode })
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
      const svg = toSvg(generate({ style: art as 'riso', seed, color: brand, width: w, height: h }))
      return {
        src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        width: w,
        height: h,
      }
    },
  })
  return { html: r.html, spec, problems: v.ok ? [] : v.problems, notes: r.notes }
}
