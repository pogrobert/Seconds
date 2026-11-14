import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'footer/simple',
  version: '1.0.1',
  sectionType: 'footer',
  variants: {
    centered: {
      label: 'Centred details',
      describe:
        'The business name, a short line, its details and the legal line, centred in one narrow column with no links. For one-page sites or businesses with few details.',
      uses: ['body', 'facts', 'note'],
      signature: {
        media: 'none',
        align: 'center',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'stack',
      },
    },
    inline: {
      label: 'Name and links with details opposite',
      describe:
        'A low bar: the business name and a row of main page links at the start, the details and legal line at the end. Shows top-level links only. For small sites wanting a quiet footer.',
      uses: ['nav', 'facts', 'note'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'compact',
        emphasis: 'type',
        arrangement: 'bar',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
