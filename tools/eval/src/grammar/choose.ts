// Choosing designs from the rules (docs/m0/13 and 14): shared by the proof tasks and the build page.
// Jev reads a brief once (five Score scales plus a direct pick per layer, one request); every rule's
// own profile is cached in rule-profiles.json. A rule's weight is the average of its profile fit and
// Jev's direct probability. A direction narrows each layer to the rules that make up a look.

import type { DecisionPort, Dist } from '@repo/pipeline'
import { rng } from '@repo/pipeline'
import { COLOUR_RULES } from './colour-rules.ts'
import { COMPOSITIONS } from './compositions.ts'
import { DETAIL_RULES, HERO_RULES, PHOTO_RULES } from './layers.ts'
import type { Content, Design } from './page.ts'
import { briefProfile, fit, type Profile } from './profiles.ts'
import { TYPE_RULES } from './type-rules.ts'

/** Every layer, with the name Jev reads for it. */
export const LAYERS = {
  composition: { name: 'page layout', rules: COMPOSITIONS },
  type: { name: 'typography', rules: TYPE_RULES },
  colour: { name: 'colours', rules: COLOUR_RULES },
  hero: { name: 'opening screen', rules: HERO_RULES },
  detail: { name: 'signature detail', rules: DETAIL_RULES },
  photo: { name: 'photography', rules: PHOTO_RULES },
} as const
export type LayerId = keyof typeof LAYERS
export type Pick = Record<LayerId, string>
export type RuleCache = Record<string, { text: string; profile: Profile }>
export type Direction = { id: string; label: string; only: Partial<Record<LayerId, string[]>> }

/**
 * Atmospheric (round 3): the look of every site the author loved (docs/research/
 * 2026-11-16-reference-library.md): one low-key photo, a deep or near-black page, very little on
 * the first screen, restrained type, no decoration for its own sake.
 */
export const ATMOSPHERIC: Direction = {
  id: 'atmospheric',
  label: 'Atmospheric',
  only: {
    photo: ['lowkey', 'portrait'],
    colour: ['deep', 'night'],
    hero: ['quiet', 'photo'],
    detail: ['none', 'monogram'],
    composition: ['column', 'split', 'bands', 'framed', 'monument'],
    type: ['couture', 'gallery', 'inscription', 'grotesk', 'heritage', 'condensed'],
  },
}
/** No narrowing: Jev's reading of the brief across every rule. */
export const OPEN: Direction = { id: 'open', label: 'Open', only: {} }

/** Jev's reading of a brief: one request, ten questions in parallel. */
export async function readBrief(
  decide: DecisionPort,
  brief: { business: string; name: string; place: string; words: string },
) {
  return briefProfile(
    decide,
    brief,
    Object.entries(LAYERS).map(([id, l]) => ({
      id,
      name: l.name,
      rules: (l.rules as readonly { key: string; text: string }[]).map((r) => ({
        key: r.key,
        text: r.text,
      })),
    })),
  )
}

export type Weights = Record<
  LayerId,
  { key: string; fit: number; profile: number; direct: number }[]
>

/**
 * Weight of every allowed rule in every layer: the average of its profile fit and Jev's direct
 * probability, each renormalised over the rules this business and direction allow.
 */
export function weigh(
  profile: Profile,
  direct: Record<string, Dist>,
  cache: RuleCache,
  c: Content,
  dir: Direction = OPEN,
): Weights {
  const out = {} as Weights
  for (const [layer, l] of Object.entries(LAYERS) as [LayerId, (typeof LAYERS)[LayerId]][]) {
    const only = dir.only[layer]
    const opts = (l.rules as readonly { key: string }[])
      .filter((r) => !only || only.includes(r.key))
      .filter((r) => {
        if (layer === 'colour') return (r as (typeof COLOUR_RULES)[number]).fits(c.brand)
        if (layer === 'detail') return (r as (typeof DETAIL_RULES)[number]).fits(c)
        if (layer === 'photo') return !(r as (typeof PHOTO_RULES)[number]).lowkey || !!c.lowkey
        return true
      })
      .map((r) => {
        const p = cache[`${layer}/${r.key}`]?.profile
        return { key: r.key, profile: p ? fit(profile, p) : 0, direct: direct[layer]?.[r.key] ?? 0 }
      })
    const ps = opts.reduce((s, o) => s + o.profile, 0) || 1
    const ds = opts.reduce((s, o) => s + o.direct, 0) || 1
    out[layer] = opts
      .map((o) => ({ ...o, fit: (o.profile / ps + o.direct / ds) / 2 }))
      .sort((a, b) => b.fit - a.fit)
  }
  return out
}

/**
 * n designs: the best rule in every layer first, then designs drawn in proportion to weight, each
 * with a different layout and, where any other fits, a different opening, so the first screens
 * an owner compares differ.
 */
export function pickDesigns(w: Weights, seed: string, n = 3): Pick[] {
  const rand = rng(seed)
  const draw = (opts: { key: string; fit: number }[]) => {
    const ws = opts.map((o) => o.fit ** 2)
    let r = rand() * ws.reduce((a, b) => a + b, 0)
    for (const [i, o] of opts.entries()) {
      r -= ws[i] ?? 0
      if (r <= 0) return o.key
    }
    return opts[0]?.key ?? ''
  }
  const best = Object.fromEntries(Object.entries(w).map(([k, v]) => [k, v[0]?.key ?? ''])) as Pick
  const opening = (p: Pick) =>
    `${p.hero === 'native' ? `native:${p.composition}` : p.hero}/${p.photo === 'portrait' ? 'portrait' : 'place'}`
  const picks: Pick[] = [best]
  for (let tries = 0; picks.length < n && tries < 600; tries++) {
    const p = Object.fromEntries(Object.entries(w).map(([k, v]) => [k, draw(v)])) as Pick
    if (picks.some((q) => q.composition === p.composition)) continue
    if (tries < 500 && picks.some((q) => opening(q) === opening(p))) continue
    picks.push(p)
  }
  return picks
}

/** The rules a pick names. */
export function design(p: Pick): Design {
  const get = <T extends { key: string }>(list: readonly T[], key: string) => {
    const r = list.find((x) => x.key === key)
    if (!r) throw new Error(`no rule ${key}`)
    return r
  }
  return {
    composition: get(COMPOSITIONS, p.composition),
    type: get(TYPE_RULES, p.type),
    colour: get(COLOUR_RULES, p.colour),
    hero: get(HERO_RULES, p.hero),
    detail: get(DETAIL_RULES, p.detail),
    photo: get(PHOTO_RULES, p.photo),
  }
}

/** Rules whose cached profile is missing or out of date (their description changed). */
export const staleRules = (cache: RuleCache) =>
  Object.entries(LAYERS).flatMap(([layer, l]) =>
    (l.rules as readonly { key: string; text: string }[])
      .filter((r) => cache[`${layer}/${r.key}`]?.text !== r.text)
      .map((r) => ({ layer, key: r.key, text: r.text, name: l.name })),
  )
