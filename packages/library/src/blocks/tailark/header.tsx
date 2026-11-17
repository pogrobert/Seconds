// Menu bars for pages whose opening has none. Adapted from the hero headers of Tailark Mist one,
// Dusk one and Veil hero five (MIT, see ../../../NOTICE.md); the mobile menus there need client
// state, so here the links simply hide on small screens and the booking button stays.

import type { BlockProps } from '../../ui.tsx'
import { Bar } from './parts.tsx'

/** Name, links in the middle, booking button (Mist, hero one header). */
export const HeaderMistOne = ({ c }: BlockProps) => (
  <div id="top">
    <Bar c={c} look="centre" />
  </div>
)

/** Full width on a bottom rule (Dusk, hero one header). */
export const HeaderDuskOne = ({ c }: BlockProps) => (
  <div id="top">
    <Bar c={c} look="rule" />
  </div>
)

/** A small floating pill (Veil, hero five header). */
export const HeaderVeilFive = ({ c }: BlockProps) => (
  <div id="top">
    <Bar c={c} look="pill" />
  </div>
)
