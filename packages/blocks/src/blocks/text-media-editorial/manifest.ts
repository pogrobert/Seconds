import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'text-media/editorial',
  version: '1.0.0',
  sectionType: 'text-media',
  variants: {
    'heading-aside': {
      label: 'Heading beside the text',
      describe:
        'Eyebrow and headline in a narrow column beside a wider column of text, no image. For a longer story, philosophy or explanation that should read like a magazine page.',
      uses: ['eyebrow', 'headline', 'body', 'primaryCta', 'secondaryCta'],
      requires: ['headline'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'columns',
      },
    },
    gallery: {
      label: 'Text beside a set of photos',
      describe:
        'Text on one side and two to four photos arranged together on the other. For a story told through several good photos of the place, the work or the team.',
      uses: ['eyebrow', 'headline', 'body', 'primaryCta', 'secondaryCta', 'gallery'],
      requires: ['gallery'],
      signature: {
        media: 'gallery',
        align: 'start',
        density: 'regular',
        emphasis: 'image',
        arrangement: 'split',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
