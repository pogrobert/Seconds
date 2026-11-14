// Every block manifest in the library. Pure data: the pipeline imports this, never the components.
import heroStandard from '../blocks/hero-standard/manifest.ts'
import type { BlockManifest } from './contract.ts'

export * from './contract.ts'

export const manifests: readonly BlockManifest[] = [heroStandard] as readonly BlockManifest[]
