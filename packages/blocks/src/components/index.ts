// Block components by block type. Imported by the renderer only, never by the pipeline.
import type { ComponentType } from 'react'
import HeroStandard from '../blocks/hero-standard/component.tsx'
import type { BlockProps } from '../kit/index.tsx'

export * from '../kit/index.tsx'

// biome-ignore lint/suspicious/noExplicitAny: the map is keyed by block type; each component checks its own section's content
export const components: Record<string, ComponentType<BlockProps<any>>> = {
  'hero/standard': HeroStandard,
}
