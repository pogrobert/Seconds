// Every block in the library, with what it is and where it came from (docs/m0/16-block-library.md).
// Each source library has its own folder and index under src/blocks/; this file only joins them.

import type { ComponentType } from 'react'
import { core } from './blocks/core/index.ts'
import { efferd } from './blocks/efferd/index.ts'
import { shadcnui } from './blocks/shadcnui/index.ts'
import { tailark } from './blocks/tailark/index.ts'
import type { BlockProps, SiteContent } from './ui.tsx'

/** The kinds of section a page is made of, in page order. */
export const KINDS = [
  'header',
  'hero',
  'about',
  'statement',
  'offer',
  'steps',
  'reasons',
  'audience',
  'gallery',
  'stats',
  'testimonials',
  'team',
  'faq',
  'contact',
  'cta',
  'footer',
] as const
export type Kind = (typeof KINDS)[number]

export type Entry = {
  /** Unique: "<library>/<kind>-<name>", such as "tailark/hero-mist-two". */
  id: string
  kind: Kind
  source: {
    lib: 'core' | 'tailark' | 'shadcnui-blocks' | 'efferd'
    /** The file it was adapted from, in its repository. */
    file: string
  }
  component: ComponentType<BlockProps>
  /** Optional content it cannot show without; the page skips it when any is missing. */
  needs?: ('faq' | 'stats' | 'testimonials' | 'team' | 'statement' | 'steps' | 'audience')[]
  /** Openings that bring their own menu bar: the page then adds no header. */
  includesHeader?: boolean
  /** Other sections whose content this block already shows; the page leaves those out. */
  covers?: Kind[]
  /** For a block that covers the offer: how many offer items it shows. */
  showsItems?: number
}

/**
 * Blocks that show another section's content as well as their own (found by the registry test,
 * which fails when a block does this without being listed here).
 */
const COVERS: Record<string, Kind[]> = {
  'core/about-band': ['reasons'],
  'tailark/about-mist-one': ['reasons'],
  'tailark/about-mist-features-eight': ['reasons'],
  'tailark/about-veil-three': ['reasons'],
  'tailark/about-dusk-two': ['reasons'],
  'tailark/about-dusk-three': ['reasons'],
  'tailark/about-dusk-four': ['reasons'],
  'tailark/hero-veil-one': ['offer'],
  'tailark/hero-veil-three': ['offer'],
  'tailark/contact-mist-one': ['cta'],
  'shadcnui/contact-02': ['cta'],
}

/** Blocks that cover the offer but show only part of a long list (the bench's 15-dish menu). */
const SHOWS_ITEMS: Record<string, number> = {
  'tailark/hero-veil-one': 6,
  'tailark/hero-veil-three': 8,
}

export const REGISTRY: Entry[] = [...core, ...tailark, ...shadcnui, ...efferd].map((e) => ({
  ...e,
  ...(COVERS[e.id] ? { covers: COVERS[e.id] } : {}),
  ...(SHOWS_ITEMS[e.id] ? { showsItems: SHOWS_ITEMS[e.id] } : {}),
}))

/** Whether a block can be drawn for this content. */
export const fits = (e: Entry, c: SiteContent) =>
  (e.needs ?? []).every((k) => {
    const v = c[k]
    return Array.isArray(v) ? v.length > 0 : typeof v === 'object' && v ? v.items.length > 0 : !!v
  }) && !(e.showsItems && c.prices.flatMap((g) => g.items).length > e.showsItems)
