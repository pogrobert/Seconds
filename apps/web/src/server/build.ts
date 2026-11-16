import { components } from '@repo/blocks/components'
import { manifests } from '@repo/blocks/manifest'
import { resolveStyle, theme } from '@repo/blocks/themes'
import { SAMPLES, type SampleBusiness } from '@repo/eval/businesses'
import type { Manifest } from '@repo/eval/photos'
import photoManifest from '@repo/eval/photos/manifest.json'
import { contentFor, photoOrder } from '@repo/eval/site-content'
import { sampleAssets } from '@repo/eval/stand-in'
import {
  assemble,
  type Brief,
  type Copy,
  type DecisionPort,
  DIRECTION_IDS,
  DIRECTIONS,
  type Direction,
  directionPlan,
  fixedText,
  KIND_LABEL,
  KINDS,
  type Kind,
  openRouterText,
  randomDecisions,
  type TextPort,
  typesafeDecisions,
} from '@repo/pipeline'
import { renderDocument } from '@repo/render'
import type { PageId } from '@repo/spec'
import { createServerFn } from '@tanstack/react-start'
import blocksCss from '../generated/blocks.css?raw'
import { getEnv } from './env'

// The build page's one server call: the owner's words in, the site in every direction out.
// 1. The decision model picks the kind of business and the direction that suits the words.
// 2. The text model writes the words, with the kind's facts (stand-ins: the sample business).
// 3. Code draws the site in each direction, so switching looks needs no new call.
// Without keys, stand-ins answer (random choices, the sample's own words), and the reply says so.

export type BuiltSite = { id: Direction['id']; label: string; html: string }
export type BuildResult = {
  name: string
  kind: Kind
  kindLabel: string
  suggested: Direction['id']
  sites: BuiltSite[]
  ms: { decide: number; text: number; render: number; total: number }
  costUsd: number
  models: { decide: string; text: string }
  problems: string[]
}

/** How the chat names each kind of business. */
const KIND_NAME: Record<Kind, string> = {
  restaurant: 'restaurant',
  salon: 'hair and beauty salon',
  clinic: 'dental or medical clinic',
  trades: 'trades business',
  fitness: 'fitness studio',
}

const DIRECTION_TEXT: Record<Direction['id'], string> = {
  landscape:
    'A full-screen photo of the place with the name thin and spaced in its sky. Calm, crafted, upmarket; for beautiful places and work.',
  wordmark:
    'Two close-up photos side by side with the name huge and thin across both, then a quiet page set like a printed menu. Refined and editorial; for food, hair, materials.',
  signature:
    'No photos: the name in heavy condensed letters with drawings from the trade standing in for letters, on a warm light page. Friendly, bold, characterful.',
  atelier: 'A bright interior photo with a large light serif headline low on it.',
}

async function decide(port: DecisionPort, words: string) {
  const res = await port.decide({ brief: words }, [
    {
      kind: 'choice',
      id: 'kind',
      prompt: 'Which kind of business does the brief in `brief` describe?',
      options: KINDS.map((k) => ({ key: k, text: `A ${KIND_LABEL[k]}.` })),
    },
    {
      kind: 'choice',
      id: 'direction',
      prompt: "Given the brief in `brief`, which look suits this business's website best?",
      options: DIRECTION_IDS.map((d) => ({ key: d, text: DIRECTION_TEXT[d] })),
    },
  ])
  const pick = (id: string) => {
    const a = res.answers.get(id)
    return a?.kind === 'choice' ? a.top : undefined
  }
  const kind = (KINDS as readonly string[]).includes(pick('kind') ?? '')
    ? (pick('kind') as Kind)
    : 'salon'
  const dir = pick('direction')
  const suggested = (DIRECTION_IDS as readonly string[]).includes(dir ?? '')
    ? (dir as Direction['id'])
    : 'landscape'
  const costUsd = res.calls.reduce((n, c) => n + (c.costUsd ?? 0), 0)
  return { kind, suggested, costUsd }
}

/** Facts the words may mention, from the business record (here, the sample's). */
function factsOf(s: SampleBusiness): string {
  const loc = s.business.locations?.[0]
  const items = s.collections.flatMap((c) =>
    c.items.map((i) => ('name' in i ? String(i.name) : '')),
  )
  return [
    loc?.address ? `Address: ${[...loc.address.lines, loc.address.locality].join(', ')}.` : '',
    loc?.note ? `Access and parking: ${loc.note}` : '',
    `What they offer: ${items.filter(Boolean).join('; ')}.`,
  ]
    .filter(Boolean)
    .join('\n')
}

function render(s: SampleBusiness, kind: Kind, id: Direction['id']): string {
  const plan = directionPlan(kind, id)
  const spec = assemble(
    plan,
    {
      business: s.business,
      collections: s.collections,
      assets: sampleAssets(s, photoManifest as Manifest),
      color: s.palette,
      locale: 'en-GB',
      dir: 'ltr',
    },
    contentFor(s, photoOrder(1)),
    { seed: `${kind}-${s.business.name}`, release: 'local' },
  )
  const st = resolveStyle(spec.style)
  const t = theme(st.id, s.palette, { axes: st.axes, mode: st.mode })
  return renderDocument(spec, Object.keys(spec.structure.pages)[0] as PageId, {
    css: blocksCss + t.css,
    head: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${t.fontsHref}">`,
    library: { manifests, components },
    button: t.button,
    imageUrl: (asset) => ({
      src: asset.source.type === 'stock' ? `/photos/${asset.source.key}` : '',
      width: asset.width ?? 1600,
      height: asset.height ?? 1067,
    }),
  }).html
}

export const buildSite = createServerFn({ method: 'POST' })
  .validator((d: { messages: string[] }) => {
    const messages = (Array.isArray(d?.messages) ? d.messages : []).map(String).filter(Boolean)
    if (!messages.length) throw new Error('Describe the business first.')
    return { messages: messages.slice(-12).map((m) => m.slice(0, 1500)) }
  })
  .handler(async ({ data }): Promise<BuildResult> => {
    const t0 = performance.now()
    const env = getEnv()
    const words = data.messages.join('\n')
    const decidePort = env.TYPESAFE_API_KEY
      ? typesafeDecisions({ apiKey: env.TYPESAFE_API_KEY })
      : randomDecisions(words)
    const textPort: TextPort = env.OPENROUTER_API_KEY
      ? openRouterText({ apiKey: env.OPENROUTER_API_KEY })
      : fixedText(() => ({ ...SAMPLES.salon.standIn }))

    const td = performance.now()
    const d = await decide(decidePort, words)
    const decideMs = Math.round(performance.now() - td)

    const sample = SAMPLES[d.kind]
    const brief: Brief = {
      id: 'build',
      kind: d.kind,
      name: '',
      place: sample.business.locations?.[0]?.address?.locality ?? '',
      words,
      color: sample.palette,
    }
    const tt = performance.now()
    const written = await textPort.write({
      brief,
      facts: factsOf(sample),
      needSteps: d.kind === 'trades',
      askName: true,
    })
    const textMs = Math.round(performance.now() - tt)
    const copy: Copy =
      written.copy ?? (env.OPENROUTER_API_KEY ? sample.standIn : { ...SAMPLES[d.kind].standIn })
    const name = copy.name?.trim() || sample.business.name
    const s: SampleBusiness = { ...sample, business: { ...sample.business, name }, standIn: copy }

    const tr = performance.now()
    const sites = DIRECTION_IDS.map((id) => ({
      id,
      label: DIRECTIONS[id].label,
      html: render(s, d.kind, id),
    }))
    const renderMs = Math.round(performance.now() - tr)
    return {
      name,
      kind: d.kind,
      kindLabel: KIND_NAME[d.kind],
      suggested: d.suggested,
      sites,
      ms: {
        decide: decideMs,
        text: textMs,
        render: renderMs,
        total: Math.round(performance.now() - t0),
      },
      costUsd: d.costUsd + written.calls.reduce((n, c) => n + (c.costUsd ?? 0), 0),
      models: {
        decide: `${decidePort.id} ${decidePort.model}`,
        text: `${textPort.id} ${textPort.model}`,
      },
      problems: written.problems,
    }
  })
