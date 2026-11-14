import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'cards/steps',
  version: '1.0.0',
  sectionType: 'cards',
  variants: {
    numbered: {
      label: 'Numbered steps',
      describe:
        'Items as numbered steps in order, beside the heading on wide screens. For a process: how booking works, what happens at a first visit, how a job runs from quote to finish.',
      uses: ['eyebrow', 'headline', 'subhead', 'items', 'primaryCta', 'note'],
      caps: { items: { max: 12 } },
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'steps',
      },
    },
    rows: {
      label: 'Alternating rows with photos',
      describe:
        'Each item as a wide row, its photo on alternating sides. For three to six longer items, such as main services or stages of a project, that each have a photo.',
      uses: ['eyebrow', 'headline', 'subhead', 'items', 'primaryCta', 'note'],
      caps: { items: { max: 8 } },
      // The photos are a part of each item; the contract counts item images as images.
      signature: {
        media: 'image',
        align: 'start',
        density: 'airy',
        emphasis: 'balanced',
        arrangement: 'rows',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
