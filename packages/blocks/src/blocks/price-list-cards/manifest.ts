import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'price-list/cards',
  version: '1.0.0',
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
        'A few highlighted items as cards with their photo, name and price. For signature dishes or headline treatments that have good photos; items without a photo show as plain cards.',
      uses: ['source', 'headline', 'subhead', 'note', 'primaryCta'],
      // Item photos come from the collection, not from a media field, so the contract only allows
      // media 'none' here (see the block log, "wanted").
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
