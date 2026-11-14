import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'cta/band',
  version: '1.0.0',
  sectionType: 'cta',
  variants: {
    centered: {
      label: 'Centred band',
      describe:
        'Headline, one supporting line and buttons centred, with no image. For a short closing ask such as book, call or get a quote, between other sections.',
      uses: ['headline', 'subhead', 'primaryCta', 'secondaryCta'],
      signature: {
        media: 'none',
        align: 'center',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'stack',
      },
    },
    split: {
      label: 'Band beside a photo',
      describe:
        'Headline, supporting line and buttons on one side and one photo on the other. For an ask that a photo of the place, the work or the team makes warmer.',
      uses: ['headline', 'subhead', 'primaryCta', 'secondaryCta', 'media'],
      requires: ['media'],
      signature: {
        media: 'image',
        align: 'start',
        density: 'regular',
        emphasis: 'balanced',
        arrangement: 'split',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
