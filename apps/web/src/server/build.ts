import { SAMPLES, type SampleBusiness } from '@repo/eval/businesses'
import {
  ATMOSPHERIC,
  design,
  OPEN,
  type Pick,
  pickDesigns,
  type RuleCache,
  readBrief,
  weigh,
} from '@repo/eval/grammar/choose'
import { contentOf, renderPage } from '@repo/eval/grammar/page'
import ruleProfiles from '@repo/eval/grammar/rule-profiles.json'
import photoManifest from '@repo/eval/photos/manifest.json'
import {
  type Brief,
  type Copy,
  type DecisionPort,
  fixedText,
  KIND_LABEL,
  KINDS,
  type Kind,
  openRouterText,
  randomDecisions,
  type TextPort,
  typesafeDecisions,
} from '@repo/pipeline'
import { createServerFn } from '@tanstack/react-start'
import { getEnv } from './env'

// The build page's one server call: the owner's words in, four finished looks out.
// 1. In parallel, the decision model names the kind of business and reads the words: five scales
//    and a direct pick in every layer of design rules (docs/m0/13 and 14).
// 2. The text model writes the words, with the kind's facts (stand-ins: the sample business).
// 3. Code draws four designs from the rules: three in the atmospheric direction Robert's reference
//    picks pointed to, and Jev's own pick across every rule. Switching looks needs no new call.
// Without keys, stand-ins answer (random choices, the sample's own words), and the reply says so.

export type BuiltSite = { id: string; label: string; rules: string; html: string }
export type BuildResult = {
  name: string
  kind: Kind
  kindLabel: string
  suggested: string
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

async function decideKind(port: DecisionPort, words: string) {
  const res = await port.decide({ brief: words }, [
    {
      kind: 'choice',
      id: 'kind',
      prompt: 'Which kind of business does the brief in `brief` describe?',
      options: KINDS.map((k) => ({ key: k, text: `A ${KIND_LABEL[k]}.` })),
    },
  ])
  const a = res.answers.get('kind')
  const top = a?.kind === 'choice' ? a.top : ''
  const kind = (KINDS as readonly string[]).includes(top) ? (top as Kind) : 'salon'
  return { kind, costUsd: res.calls.reduce((n, c) => n + (c.costUsd ?? 0), 0) }
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

/** The rules a design is made of, in one readable line. */
function describe(p: Pick) {
  const d = design(p)
  return {
    rules: `${d.composition.label} layout · ${d.type.label} type · ${d.colour.label} colour · ${d.hero.label} opening · ${d.photo?.label ?? 'Natural'} photos · ${d.detail.label === 'None' ? 'no detail' : `${d.detail.label.toLowerCase()} detail`}`,
  }
}

const seedOf = (s: string) => {
  let h = 0
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0
  return `build-${h}`
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

    // 1. Kind and reading, in parallel.
    const td = performance.now()
    const [k, reading] = await Promise.all([
      decideKind(decidePort, words),
      readBrief(decidePort, { business: 'local business', name: '', place: '', words }),
    ])
    const decideMs = Math.round(performance.now() - td)

    // 2. The words.
    const sample = SAMPLES[k.kind]
    const brief: Brief = {
      id: 'build',
      kind: k.kind,
      name: '',
      place: sample.business.locations?.[0]?.address?.locality ?? '',
      words,
      color: sample.palette,
    }
    const tt = performance.now()
    const written = await textPort.write({
      brief,
      facts: factsOf(sample),
      needSteps: false,
      askName: true,
    })
    const textMs = Math.round(performance.now() - tt)
    const copy: Copy = written.copy ?? { ...SAMPLES[k.kind].standIn }
    const name = copy.name?.trim() || sample.business.name

    // 3. Four designs from the rules.
    const tr = performance.now()
    type Shot = { file: string; alt: string; width: number; height: number }
    const photos = (photoManifest as Record<string, Record<string, Shot>>)[k.kind] ?? {}
    const content = contentOf(sample, photos, '/photos/', { name, brand: sample.palette, copy })
    const cache = ruleProfiles as RuleCache
    const seed = seedOf(words)
    const atmos = pickDesigns(
      weigh(reading.profile, reading.direct, cache, content, ATMOSPHERIC),
      seed,
      3,
    )
    const open = pickDesigns(weigh(reading.profile, reading.direct, cache, content, OPEN), seed, 1)
    const sites: BuiltSite[] = [
      ...atmos.map((p, i) => ({ id: `a${i + 1}`, p })),
      ...open.map((p) => ({ id: 'open', p })),
    ].map(({ id, p }) => {
      const dsc = describe(p)
      return {
        id,
        label: id === 'open' ? "Jev's pick" : `Look ${id.slice(1)}`,
        rules: dsc.rules,
        html: renderPage(content, design(p)),
      }
    })
    const renderMs = Math.round(performance.now() - tr)
    return {
      name,
      kind: k.kind,
      kindLabel: KIND_NAME[k.kind],
      suggested: sites[0]?.id ?? 'a1',
      sites,
      ms: {
        decide: decideMs,
        text: textMs,
        render: renderMs,
        total: Math.round(performance.now() - t0),
      },
      costUsd:
        k.costUsd +
        reading.calls.reduce((n, c) => n + (c.costUsd ?? 0), 0) +
        written.calls.reduce((n, c) => n + (c.costUsd ?? 0), 0),
      models: {
        decide: `${decidePort.id} ${decidePort.model}`,
        text: `${textPort.id} ${textPort.model}`,
      },
      problems: written.problems,
    }
  })
