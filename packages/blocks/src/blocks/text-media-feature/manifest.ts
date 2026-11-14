import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'text-media/feature',
  version: '1.0.0',
  sectionType: 'text-media',
  variants: {
    overlap: {
      label: 'Text panel cut into a photo',
      describe:
        'A large photo with the text on a solid panel that cuts into its lower corner. For an introduction or story led by one strong, wide photo of the place or the work.',
      uses: ['eyebrow', 'headline', 'body', 'primaryCta', 'secondaryCta', 'media'],
      requires: ['media'],
      caps: { body: 900 },
      signature: {
        media: 'image',
        align: 'start',
        density: 'regular',
        emphasis: 'image',
        arrangement: 'overlay',
      },
    },
    quote: {
      label: 'Opening line set large',
      describe:
        'The first sentence of the story set large as a statement, the rest in a calm column beside a small heading. For a story that opens with one strong line, with no photo.',
      uses: ['eyebrow', 'headline', 'body', 'primaryCta', 'secondaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'stack',
      },
    },
    columns: {
      label: 'Headline, wide photo, two columns',
      describe:
        'A large headline, one wide photo across the page, then the text in two newspaper columns. For a longer story or history told like a magazine feature, with one good landscape photo.',
      uses: ['eyebrow', 'headline', 'body', 'primaryCta', 'secondaryCta', 'media'],
      requires: ['media'],
      signature: {
        media: 'image',
        align: 'start',
        density: 'airy',
        emphasis: 'balanced',
        arrangement: 'columns',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
