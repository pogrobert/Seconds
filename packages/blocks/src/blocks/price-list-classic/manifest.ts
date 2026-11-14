import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'price-list/classic',
  version: '1.0.0',
  sectionType: 'price-list',
  variants: {
    leaders: {
      label: 'Dotted leaders',
      describe:
        'Each name joined to its price by a dotted line, groups flowing into two columns on wide screens; levels and options get their own dotted lines underneath. For long menus and service lists that should read quickly.',
      uses: ['source', 'headline', 'subhead', 'note', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'compact',
        emphasis: 'type',
        arrangement: 'columns',
      },
    },
    'menu-board': {
      label: 'Printed menu',
      describe:
        'A printed menu: one centred column, group names in spaced small capitals between thin rules, each item centred with its price beneath. For restaurants, cafés and bars with a short menu and a classic or elegant tone.',
      uses: ['source', 'headline', 'subhead', 'note', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'center',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'list',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
