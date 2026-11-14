import type { BlockProps } from '../../kit/index.tsx'
import { Feature } from './feature.tsx'
import { Lettered } from './lettered.tsx'
import { Pair } from './pair.tsx'
import { Sky } from './sky.tsx'

// Full-screen openings for the direction families (docs/m0/09-directions.md), one per direction:
// sky (Landscape), pair (Wordmark), lettered (Signature) and feature (Atelier). Each fills the
// screen from the top, so the menu bar (header/over) can sit on it.
export default function HeroStage(p: BlockProps<'hero'>) {
  if (p.variant === 'pair') return <Pair {...p} />
  if (p.variant === 'lettered') return <Lettered {...p} />
  if (p.variant === 'feature') return <Feature {...p} />
  return <Sky {...p} />
}
