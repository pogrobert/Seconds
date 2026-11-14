import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'hours-location/panel',
  version: '1.0.0',
  sectionType: 'hours-location',
  variants: {
    single: {
      label: 'Hours beside the address',
      describe:
        'The opening hours table on one side, the address, parking note, phone and map link on the other. For a business with one shop, salon or clinic.',
      uses: ['headline', 'facts', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'balanced',
        arrangement: 'split',
      },
    },
    locations: {
      label: 'A card per location',
      describe:
        'One card per location with its name, hours, address, note and contacts, two across on wide screens. For a business with two or more branches.',
      uses: ['headline', 'facts', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'balanced',
        arrangement: 'grid',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
