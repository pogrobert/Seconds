import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'header/classic',
  version: '1.0.0',
  sectionType: 'header',
  variants: {
    inline: {
      label: 'Logo with menu in one row',
      describe:
        'Logo at the start, the menu links and one button at the end, on one row on wide screens. The safe choice for most small businesses.',
      uses: ['nav', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'bar',
      },
    },
    stacked: {
      label: 'Centred logo above the menu',
      describe:
        'Logo centred on its own line, with the menu and button centred below it. For restaurants, boutiques and studios with a strong name or a wide logo.',
      uses: ['nav', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'center',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'bar',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
