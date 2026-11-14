import type { BlockManifest } from '@repo/blocks/manifest'
import type { SectionPlan, SitePlan } from './assemble.ts'
import {
  type Brief,
  type Compiled,
  compileQuestions,
  type Decided,
  decisionState,
  type Look,
  type Photo,
  QUESTIONS_VERSION,
  resolveSite,
} from './choose.ts'
import type { Answer, DecisionCall, DecisionPort } from './decide.ts'
import { DEFAULT_PLANS } from './defaults.ts'
import type { Copy, TextCall, TextPort } from './text.ts'

// generate(): the one entry point (docs/technical/03, D1). Pure apart from the two ports: the same
// code runs in tests with stand-ins, in the evaluation harness and, later, in the Worker.
// The words and the decisions are asked for at the same moment; neither waits for the other.
// The variant pick needs both, because a variant must hold the words that were written.

export type GenerateInput = {
  brief: Brief
  photos: Photo[]
  /** Facts the words may mention, as plain text. */
  facts: string
}

export type GenerateDeps = {
  decide: DecisionPort
  text: TextPort
  manifests: readonly BlockManifest[]
  /** Can this variant show the site's content, given these words and this look? */
  eligible: (copy: Copy, look: Look) => (s: SectionPlan) => boolean
}

export type GenerationRecord = {
  briefId: string
  questionsVersion: number
  decision: { adapter: string; model: string; calls: DecisionCall[]; answers: Answer[] }
  text: { adapter: string; model: string; calls: TextCall[]; problems: string[] }
  questions: Compiled[]
  decided: Decided[]
  /** Wall-clock times in milliseconds, measured in this process. */
  ms: { decide: number; text: number; total: number }
  costUsd: { decide: number; text: number }
}

export type GenEvent =
  | { type: 'questions'; count: number }
  | { type: 'decided'; ms: number }
  | { type: 'written'; ms: number; problems: string[] }
  | { type: 'site'; plan: SitePlan; look: Look; copy: Copy; record: GenerationRecord }
  | { type: 'failed'; reason: string; record: GenerationRecord }

const sum = (xs: (number | undefined)[]) => xs.reduce<number>((a, x) => a + (x ?? 0), 0)

export async function* generate(
  input: GenerateInput,
  deps: GenerateDeps,
  signal?: AbortSignal,
): AsyncGenerator<GenEvent> {
  const t0 = performance.now()
  const kind = input.brief.kind
  const compiled = compileQuestions(kind, input.photos, deps.manifests)
  yield { type: 'questions', count: compiled.length }
  const needSteps = DEFAULT_PLANS[kind].sections.some((s) => s.type === 'cards/steps')

  const timed = async <T>(p: Promise<T>) => {
    const s = performance.now()
    const v = await p
    return { v, ms: Math.round(performance.now() - s) }
  }
  const [d, t] = await Promise.all([
    timed(
      deps.decide.decide(
        decisionState(input.brief),
        compiled.map((c) => c.question),
        signal,
      ),
    ),
    timed(deps.text.write({ brief: input.brief, facts: input.facts, needSteps }, signal)),
  ])
  yield { type: 'decided', ms: d.ms }
  yield { type: 'written', ms: t.ms, problems: t.v.problems }

  const record = (decided: Decided[]): GenerationRecord => ({
    briefId: input.brief.id,
    questionsVersion: QUESTIONS_VERSION,
    decision: {
      adapter: deps.decide.id,
      model: deps.decide.model,
      calls: d.v.calls,
      answers: [...d.v.answers.values()],
    },
    text: {
      adapter: deps.text.id,
      model: deps.text.model,
      calls: t.v.calls,
      problems: t.v.problems,
    },
    questions: compiled,
    decided,
    ms: { decide: d.ms, text: t.ms, total: Math.round(performance.now() - t0) },
    costUsd: {
      decide: sum(d.v.calls.map((c) => c.costUsd)),
      text: sum(t.v.calls.map((c) => c.costUsd)),
    },
  })

  const copy = t.v.copy
  if (!copy) {
    yield { type: 'failed', reason: `text: ${t.v.problems.join('; ')}`, record: record([]) }
    return
  }
  // The look (which photo leads) does not change what fits, so a first pass with the default photo
  // is enough to test eligibility.
  const { plan, look, decided } = resolveSite(
    kind,
    compiled,
    d.v.answers,
    deps.manifests,
    deps.eligible(copy, { leadPhoto: 1 }),
  )
  yield { type: 'site', plan, look, copy, record: record(decided) }
}

/** Runs generate() to the end and returns the site, or throws with the reason. */
export async function generateSite(input: GenerateInput, deps: GenerateDeps, signal?: AbortSignal) {
  for await (const e of generate(input, deps, signal)) {
    if (e.type === 'site') return e
    if (e.type === 'failed') throw Object.assign(new Error(e.reason), { record: e.record })
  }
  throw new Error('generate() ended without a site')
}
