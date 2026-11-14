import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'price-list/menu',
  version: '1.0.0',
  sectionType: 'price-list',
  variants: {
    list: {
      label: 'Price list',
      describe:
        'One column of items under group headings, each name with its price at the end of the line and description, duration and tags below. For menus and service lists with descriptions.',
      uses: ['source', 'headline', 'subhead', 'note', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'list',
      },
    },
    table: {
      label: 'Price table',
      describe:
        'A table of names and prices, one price column per level such as Stylist, Senior, Director; on phones each item lists its levels underneath. For comparing prices across levels. Shows names and durations, not descriptions.',
      uses: ['source', 'headline', 'subhead', 'note', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'compact',
        emphasis: 'type',
        arrangement: 'table',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
