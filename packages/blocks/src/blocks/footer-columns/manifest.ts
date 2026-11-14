import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'footer/columns',
  version: '1.0.0',
  sectionType: 'footer',
  variants: {
    columns: {
      label: 'Link columns beside the details',
      describe:
        'The business name, a short line and its details on one side, with the site links grouped in labelled columns on the other. For sites with several pages worth listing.',
      uses: ['nav', 'body', 'facts', 'note'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'columns',
      },
    },
    signup: {
      label: 'Link columns with a newsletter sign-up',
      describe:
        'A newsletter sign-up across the top, then the business details beside labelled link columns. For businesses that send regular news or offers by email.',
      uses: ['nav', 'body', 'facts', 'form', 'note'],
      requires: ['form'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'columns',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
