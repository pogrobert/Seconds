import type {
  BlockId,
  Business,
  CollectionValue,
  ContentOf,
  FormRef,
  ImageRef,
  LinkTarget,
  SectionTypeName,
} from '@repo/spec'
import type { Surface } from '../manifest/contract.ts'

// The kit: the only building pieces a block may use besides plain HTML elements and token classes.
// Primitives make the markup choices that themes depend on, once, for every block.

/** Everything a block gets besides its content. Built by the renderer. */
export type RenderCtx = {
  id: BlockId
  section: SectionTypeName
  type: string
  variant: string
  surface: Surface
  /** The first block on a page gets h1; every other block starts at h2. */
  headingLevel: 1 | 2
  /** The theme's button style, read once by ButtonLink. */
  button: 'solid' | 'outline' | 'text'
  href: (to: LinkTarget) => string
  image: (
    img: ImageRef,
    o: { sizes: string; aspect?: number },
  ) => { src: string; srcSet?: string; width: number; height: number }
  business: Business
  collection: (id: string) => CollectionValue | undefined
  /** BCP 47 locale for prices, times and day names, for example "en-GB". */
  locale: string
  dir: 'ltr' | 'rtl'
  /** Where a form posts. Forms are a platform capability; the block only draws them. */
  formAction: (form: FormRef) => string
}

export type BlockProps<S extends SectionTypeName> = {
  content: ContentOf<S>
  variant: string
  ctx: RenderCtx
}

/** Joins class names. Every part must be a literal string so the class check can read it. */
export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(' ')
