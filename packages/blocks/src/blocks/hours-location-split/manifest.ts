import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'hours-location/split',
  version: '1.1.0',
  sectionType: 'hours-location',
  variants: {
    'with-text': {
      label: 'Directions beside the hours',
      describe:
        'A headline and a few paragraphs on getting there (parking, buses, step-free access) on one side; hours, address and contacts on the other. For places that are hard to find or reach.',
      uses: ['headline', 'body', 'facts', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'split',
      },
    },
    compact: {
      label: 'Short hours and address',
      describe:
        'A few lines: the open days and times, the address and contacts, and one button such as directions. Leaves out the full table and access notes. For one-page sites or near the footer.',
      uses: ['headline', 'facts', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'compact',
        emphasis: 'type',
        arrangement: 'bar',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
