import { defineBlock } from '../../manifest/contract.ts'

// Short reasons, each with a drawing in a coloured disc, for the Signature direction (docs/m0/09).
export default defineBlock({
  type: 'cards/marks',
  version: '1.0.0',
  sectionType: 'cards',
  variants: {
    row: {
      label: 'Reasons under drawings',
      describe:
        'A big heading, then two to four short reasons side by side, each under a small drawing from the trade in a coloured disc. Friendly and graphic, with no photos.',
      uses: ['headline', 'items'],
      caps: { items: { max: 4, parts: { title: 48, body: 200 } } },
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'grid',
      },
    },
    stack: {
      label: 'Reasons beside drawings',
      describe:
        'The heading at the start, and up to six reasons in a column, each with a small drawing in a coloured disc beside it. For longer reasons or services.',
      uses: ['headline', 'items'],
      caps: { items: { max: 6, parts: { title: 60, body: 260 } } },
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'list',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
