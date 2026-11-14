// Renders the code-default site for each kind of business (M0 arm B) to tools/eval/out/samples/.
// Run: pnpm --filter @repo/eval samples. Vitest is only the runner here, because it compiles TSX.
import { mkdirSync, writeFileSync } from 'node:fs'
import { generate, toSvg } from '@pogrobert/surfaces'
import { siteCss } from '@repo/blocks/build'
import { components } from '@repo/blocks/components'
import { manifests } from '@repo/blocks/manifest'
import { assemble, DEFAULT_PLANS } from '@repo/pipeline'
import { renderDocument } from '@repo/render'
import { validateSite } from '@repo/spec'
import { expect, it } from 'vitest'
import { KINDS, SAMPLES } from '../src/businesses.ts'
import { sampleAssets, standInContent } from '../src/stand-in.ts'

const out = new URL('../out/samples/', import.meta.url)
mkdirSync(out, { recursive: true })

for (const kind of KINDS) {
  it(`renders the ${kind} default site`, async () => {
    const s = SAMPLES[kind]
    const plan = DEFAULT_PLANS[kind]
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
    const v = validateSite(spec)
    expect(v.ok ? [] : v.problems).toEqual([])
    const types = [...plan.before, ...plan.sections, ...plan.after].map((x) => x.type)
    const css = await siteCss(types)
    const r = renderDocument(spec, Object.keys(spec.structure.pages)[0] as `p_${string}`, {
      css,
      library: { manifests, components },
      button: 'solid',
      imageUrl: (asset, o) => {
        const w = 1200
        const h = Math.round(w / (o.aspect ?? 1.5))
        const seed = asset.source.type === 'generated' ? asset.source.seed : asset.id
        const svg = toSvg(generate({ style: 'riso', seed, color: s.palette, width: w, height: h }))
        return {
          src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
          width: w,
          height: h,
        }
      },
    })
    writeFileSync(new URL(`${kind}.html`, out), r.html)
    writeFileSync(new URL(`${kind}.spec.json`, out), JSON.stringify(spec, null, 2))
    expect(r.notes).toEqual([])
  })
}
