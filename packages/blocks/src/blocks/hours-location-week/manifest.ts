import { defineBlock } from '../../manifest/contract.ts'

export default defineBlock({
  type: 'hours-location/week',
  version: '1.0.0',
  sectionType: 'hours-location',
  variants: {
    strip: {
      label: 'The week as seven days',
      describe:
        'Seven day columns, Monday to Sunday, each with its hours beneath and closed days muted, then the address, phone and directions in labelled columns. For hours that change from day to day.',
      uses: ['headline', 'facts', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'regular',
        emphasis: 'type',
        arrangement: 'columns',
      },
    },
    statement: {
      label: 'Opening hours set large',
      describe:
        'The open days and times set large in display type as the whole design, closed days in one small line, the address and contacts small beneath. For editorial, confident sites where visiting is the point.',
      uses: ['headline', 'facts', 'primaryCta'],
      signature: {
        media: 'none',
        align: 'start',
        density: 'airy',
        emphasis: 'type',
        arrangement: 'stack',
      },
    },
  },
  behaviors: [],
  license: { spdx: 'Apache-2.0', source: 'in-house' },
})
