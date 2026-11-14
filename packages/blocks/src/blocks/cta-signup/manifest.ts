import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'cta/signup',
  version: '1.0.0',
  sectionType: 'cta',
  variants: {
    inline: {
      label: 'Sign-up beside the text',
      describe:
        'Headline and supporting line on one side, the email sign-up form on the other on wide screens. For a newsletter or offers list placed between other sections.',
      uses: ['headline', 'subhead', 'form'],
      requires: ['form'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'split',
      },
    },
    stacked: {
      label: 'Centred sign-up',
      describe:
        'Headline, supporting line and the email sign-up form in one centred column. For a quiet newsletter ask near the end of a page.',
      uses: ['headline', 'subhead', 'form'],
      requires: ['form'],
      signature: {
        media: 'none',
        align: 'center',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'stack',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
