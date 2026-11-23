// The five sample kinds of business (CLAUDE.md, "M0 business kinds"). The build page asks for the
// nearest one only when a site's words could not be written, to show that sample instead.

export const KINDS = ['restaurant', 'salon', 'clinic', 'trades', 'fitness'] as const
export type Kind = (typeof KINDS)[number]

export const KIND_LABEL: Record<Kind, string> = {
  restaurant: 'restaurant or café',
  salon: 'hair and beauty salon',
  clinic: 'dental or medical clinic',
  trades: 'local tradesperson (plumber, electrician, roofer)',
  fitness: 'fitness, pilates or yoga studio',
}
