import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'price-list/cards',
  version: '1.1.0',
  sectionType: 'price-list',
  variants: {
    groups: {
      label: 'Price groups as cards',
      describe:
        'Each group of the price list in its own card, side by side on wide screens. For lists with several short groups, such as cutting, colour and treatments, or starters, mains and desserts.',
      uses: ['source', 'headline', 'subhead', 'note', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'grid',
      },
    },
    featured: {
      label: 'Featured items',
      describe:
        'Items with a photo first, as large photo cards; every other item follows as a tidy two-column list of names and prices. For signature dishes or headline treatments with good photos, followed by the rest.',
      uses: ['source', 'headline', 'subhead', 'note', 'primaryCta'],
      signature: {
        media: 'image',
        align: 'start',
        density: 'airy',
        emphasis: 'balanced',
        arrangement: 'grid',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
