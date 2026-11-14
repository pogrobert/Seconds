import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'cards/list',
  version: '1.0.0',
  sectionType: 'cards',
  variants: {
    compact: {
      label: 'Compact list',
      describe:
        'A dense ruled list, title beside its text on wide screens, under group headings when items have groups. For 10 to 30 items such as policies, conditions treated or what is included.',
      uses: ['eyebrow', 'headline', 'subhead', 'items', 'primaryCta', 'note'],
      caps: { items: { parts: { body: 240 } } },
      signature: {
        media: 'none',
        align: 'start',
        density: 'compact',
        emphasis: 'type',
        arrangement: 'list',
      },
    },
    'two-column': {
      label: 'Compact list in two columns',
      describe:
        'The same dense ruled list split into two columns on wide screens, for many items with short texts, such as treatments offered or areas of work.',
      uses: ['eyebrow', 'headline', 'subhead', 'items', 'primaryCta', 'note'],
      caps: { items: { parts: { body: 160 } } },
      signature: {
        media: 'none',
        align: 'start',
        density: 'compact',
        emphasis: 'type',
        arrangement: 'list',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
