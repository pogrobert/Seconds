// Score profiles for the design-rules proof, round 2 (docs/m0/13-design-rules-2.md). Jev reads an
// owner's brief and places it on five scales (Score questions, docs.typesafe.ai/primitives/score).
// Every rule in the library is placed on the same scales once, offline, from its own description,
// and cached. Code then matches brief to rules by distance, per layer. Taste stays in the rules;
// Jev only reads the brief (CLAUDE.md, "Taste lives in the library").

import type { ChoiceQuestion, DecisionPort, Dist, ScoreQuestion } from '@repo/pipeline'

export const DIMENSIONS = [
  {
    id: 'energy',
    levels: [
      'very calm, hushed and understated',
      'calm and relaxed',
      'balanced, neither quiet nor loud',
      'lively and energetic',
      'very loud, bold and attention-grabbing',
    ],
  },
  {
    id: 'price',
    levels: [
      'cheap and cheerful, budget, everyday',
      'affordable and good value',
      'mid-range',
      'premium and upmarket',
      'exclusive and luxurious',
    ],
  },
  {
    id: 'warmth',
    levels: [
      'cool, precise and clinical',
      'clean and professional',
      'neutral',
      'warm and friendly',
      'very warm, soft, homely and nurturing',
    ],
  },
  {
    id: 'era',
    levels: [
      'old-fashioned, traditional, heritage',
      'classic and timeless',
      'neither old nor new',
      'modern',
      'cutting-edge, fashion-forward, trendy',
    ],
  },
  {
    id: 'texture',
    levels: [
      'delicate, graceful and refined',
      'polished and elegant',
      'plain and straightforward',
      'sturdy and hard-wearing',
      'rugged, raw and tough',
    ],
  },
] as const

export type Profile = Record<(typeof DIMENSIONS)[number]['id'], number>

const questions = (prompt: (dim: string) => string): ScoreQuestion[] =>
  DIMENSIONS.map((d) => ({ kind: 'score', id: d.id, prompt: prompt(d.id), levels: [...d.levels] }))

const ASK: Record<string, string> = {
  energy: 'How quiet or loud',
  price: 'How affordable or exclusive',
  warmth: 'How cool or warm',
  era: 'How traditional or contemporary',
  texture: 'How refined or rugged',
}

/** Turns score answers into a profile on 0–1 scales. Missing answers sit in the middle. */
function read(answers: Map<string, { kind: string; score?: number }>): Profile {
  const p = {} as Profile
  for (const d of DIMENSIONS) {
    const a = answers.get(d.id)
    p[d.id] = a?.kind === 'score' && a.score !== undefined ? a.score / (d.levels.length - 1) : 0.5
  }
  return p
}

/**
 * Where an owner's brief sits on the five scales, plus Jev's direct pick in every layer (round 1's
 * question), in one request: all questions run in parallel, so the picks add no waiting. The
 * profile generalises across rules; the direct pick keeps specific matches ("like a barber sign").
 */
export async function briefProfile(
  decide: DecisionPort,
  brief: { business: string; name: string; place: string; words: string },
  layers: { id: string; name: string; rules: { key: string; text: string }[] }[] = [],
) {
  const picks: ChoiceQuestion[] = layers.map((l) => ({
    kind: 'choice',
    id: `pick:${l.id}`,
    prompt: `Which ${l.name} would make the best website for this business, given the owner's description?`,
    options: l.rules.map((r) => ({ key: r.key, text: r.text })),
  }))
  const r = await decide.decide(
    { business: brief.business, name: brief.name, place: brief.place, owner_words: brief.words },
    [
      ...questions(
        (id) =>
          `${ASK[id]} should this business come across to its customers, judging by the owner's own words?`,
      ),
      ...picks,
    ],
  )
  const direct: Record<string, Dist> = {}
  for (const l of layers) {
    const a = r.answers.get(`pick:${l.id}`)
    if (a?.kind === 'choice' && a.dist) direct[l.id] = a.dist
  }
  return { profile: read(r.answers), direct, calls: r.calls }
}

/** Where one library rule sits on the five scales, judged from its description alone. */
export async function ruleProfile(decide: DecisionPort, layer: string, text: string) {
  const r = await decide.decide(
    { design_choice: text, part_of_the_website: layer },
    questions(
      (id) =>
        `${ASK[id]} would a small business website feel if it used this design choice for its ${layer}?`,
    ),
  )
  return { profile: read(r.answers), calls: r.calls }
}

/** How well a rule fits a brief, 0–1: a Gaussian of their distance on the five scales. */
export function fit(brief: Profile, rule: Profile, sigma = 0.3): number {
  let d2 = 0
  for (const d of DIMENSIONS) d2 += (brief[d.id] - rule[d.id]) ** 2
  return Math.exp(-d2 / DIMENSIONS.length / (sigma * sigma))
}
