import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'footer/wordmark',
  version: '1.0.0',
  sectionType: 'footer',
  variants: {
    wordmark: {
      label: 'Giant name along the bottom',
      describe:
        'A calm ledger of link columns and details, then the business name set huge along the bottom edge as a wordmark. For confident brands with a short name; long names are set smaller.',
      uses: ['nav', 'body', 'facts', 'note'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'grid',
      },
    },
    signup: {
      label: 'Giant name over a sign-up',
      describe:
        'The business name set huge as a masthead, then an email sign-up with its invitation beside the links and details. For businesses that send news or offers and want a bold close.',
      uses: ['nav', 'body', 'facts', 'form', 'note'],
      requires: ['form'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'split',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
