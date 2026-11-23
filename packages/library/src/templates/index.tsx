// The whole-page templates (docs/m0/24-templates.md) and the one function that draws a site with
// one. Unlike renderSite, a template brings all of its own CSS: no block library stylesheet.

import { renderToStaticMarkup } from 'react-dom/server'
import type { Theme } from '../theme.ts'
import type { SiteContent } from '../ui.tsx'
import { album } from './album.tsx'
import { answers } from './answers.tsx'
import { arcade } from './arcade.tsx'
import { arches } from './arches.tsx'
import { atelier } from './atelier.tsx'
import { bare } from './bare.tsx'
import { board } from './board.tsx'
import { card } from './card.tsx'
import { care } from './care.tsx'
import { cinema } from './cinema.tsx'
import { civic } from './civic.tsx'
import { classic } from './classic.tsx'
import { clinic } from './clinic.tsx'
import { clubhouse } from './clubhouse.tsx'
import { directory } from './directory.tsx'
import { editorial } from './editorial.tsx'
import { field } from './field.tsx'
import { glossary } from './glossary.tsx'
import { hang } from './hang.tsx'
import { heritage } from './heritage.tsx'
import { hours } from './hours.tsx'
import { hub } from './hub.tsx'
import { label } from './label.tsx'
import { ledger } from './ledger.tsx'
import { listing } from './listing.tsx'
import { lowlight } from './lowlight.tsx'
import { market } from './market.tsx'
import { noticeboard } from './noticeboard.tsx'
import { numbered } from './numbered.tsx'
import { panels } from './panels.tsx'
import { postcard } from './postcard.tsx'
import { poster } from './poster.tsx'
import { programme } from './programme.tsx'
import { repair } from './repair.tsx'
import { type Extra, spacingVariants, type Template, type Variant } from './shared.tsx'
import { shopfront } from './shopfront.tsx'
import { sidebar } from './sidebar.tsx'
import { signal } from './signal.tsx'
import { spines } from './spines.tsx'
import { split } from './split.tsx'
import { story } from './story.tsx'
import { ticker } from './ticker.tsx'
import { tickets } from './tickets.tsx'
import { tiles } from './tiles.tsx'
import { timetable } from './timetable.tsx'
import { bigType } from './type.tsx'
import { units } from './units.tsx'
import { workshop } from './workshop.tsx'

export type { Extra, Template, Variant } from './shared.tsx'
// Drafts (docs/m0/25-template-plan.md) are drawn by the gate and the wall only; LIVE are offered.
export const TEMPLATES: Template[] = [
  field,
  signal,
  lowlight,
  split,
  poster,
  album,
  ledger,
  civic,
  clinic,
  tiles,
  editorial,
  market,
  postcard,
  card,
  heritage,
  panels,
  cinema,
  arches,
  workshop,
  story,
  directory,
  bigType,
  hang,
  classic,
  hours,
  numbered,
  glossary,
  answers,
  units,
  hub,
  bare,
  ticker,
  sidebar,
  board,
  timetable,
  label,
  clubhouse,
  noticeboard,
  programme,
  shopfront,
  tickets,
  spines,
  repair,
  arcade,
  listing,
  care,
  atelier,
]
export const LIVE = TEMPLATES.filter((t) => !t.draft)

/** A template's variants: its own, then the shared spacing ones. */
export function variantsOf(id: string): Variant[] {
  const tpl = TEMPLATES.find((x) => x.id === id)
  return tpl ? [...(tpl.variants ?? []), ...spacingVariants(tpl.css)] : []
}

export function renderTemplate(
  c: SiteContent,
  id: string,
  t: Theme,
  extras: Extra[],
  variant?: string,
): string {
  const tpl = TEMPLATES.find((x) => x.id === id) ?? field
  const v = variant ? (variantsOf(tpl.id).find((x) => x.id === variant)?.css ?? '') : ''
  const body = renderToStaticMarkup(<tpl.Page c={c} extras={extras} />)
  const esc = (s: string) => s.replace(/[&<>"]/g, (x) => `&#${x.charCodeAt(0)};`)
  return `<!doctype html><html lang="en"${tpl.dark ? ' class="dark"' : ''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(c.name)}: ${esc(c.tagline)}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${t.fontsHref}"><style>${t.css}${tpl.css}${v}</style></head><body data-template="${tpl.id}">${body}</body></html>`
}
