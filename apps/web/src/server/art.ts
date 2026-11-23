// Drawn-art choices, shared by the server (make-site.ts) and the server function's checks
// (build.ts, which is also loaded in the browser, so this file imports nothing).

/**
 * Surfaces styles that can stand in for a photo, and colour strengths. Jev chooses among all of
 * them, and the colour too.
 */
export const ART_STYLES = [
  'underpaint',
  'sfumato',
  'fluted',
  'aquatint',
  'strata',
  'marbling',
  'glass',
  'papercut',
  'patches',
  'prism',
  'moire',
  'halftone',
] as const
export type ArtStyle = (typeof ART_STYLES)[number]
export const ART_STRENGTHS = { grey: 0.05, muted: 0.16, gentle: 0.32, clear: 0.55 } as const
export type ArtStrength = keyof typeof ART_STRENGTHS
