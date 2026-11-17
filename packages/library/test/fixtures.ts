// Test content for every block: the longest a section should hold, the least it can have, and
// right-to-left text (CLAUDE.md, block contract).
import type { Photo, SiteContent } from '../src/ui.tsx'

const photo = (alt: string): Photo => ({ src: '__IMG_test__', alt, w: 1200, h: 800 })
const photos = {
  hero: photo('hero'),
  about: photo('about'),
  cta: photo('cta'),
  d1: photo('detail one'),
  d2: photo('detail two'),
}

export const full: SiteContent = {
  name: 'Městský úřad Brno-střed, odbor dopravy a životního prostředí',
  tagline: 'Services for residents of the city centre, open six days a week',
  headline: 'Everything the city centre office does for you, in one place you can visit or call',
  subhead:
    'Permits, parking, waste collection and registry services for residents and businesses, with appointments most days and help in three languages.',
  about:
    'The office serves about ninety thousand residents and the businesses of the historic centre. We handle permits, parking zones, waste collection and the registry, and we try to answer every request within a week. You can come in person, write, or call; most things can also be started online.',
  reasonsTitle: 'Why residents come to us first',
  reasons: [
    {
      title: 'Appointments the same week',
      body: 'Most requests get a slot within five working days.',
    },
    { title: 'Help in three languages', body: 'Czech, English and Ukrainian at every counter.' },
    {
      title: 'One counter for most things',
      body: 'Permits, parking and registry are on one floor.',
    },
  ],
  offerTitle: 'Services and fees',
  prices: [
    {
      group: 'Parking',
      items: [
        { name: 'Resident parking permit, zone A', detail: 'One car, one year', price: '1 200 Kč' },
        { name: 'Visitor card', detail: 'Ten days', price: '300 Kč' },
      ],
    },
    {
      group: 'Registry',
      items: [
        { name: 'Certified copy', price: '30 Kč' },
        {
          name: 'Marriage outside the town hall',
          detail: 'Any approved place in Brno',
          price: '3 000 Kč',
        },
      ],
    },
  ],
  hours: [
    { days: 'Monday and Wednesday', time: '8:00–17:00' },
    { days: 'Tuesday and Thursday', time: '8:00–14:00' },
  ],
  address: ['Dominikánské náměstí 1', '601 67 Brno'],
  phone: '+420 542 171 111',
  email: 'podatelna@brno-stred.example',
  book: '#visit',
  cta: {
    headline: 'Book a visit before you come',
    subhead: 'Choose a counter and a time.',
    label: 'Book a visit',
  },
  photos,
  faq: [
    {
      q: 'Do I need an appointment?',
      a: 'No, but with one you rarely wait more than five minutes.',
    },
    { q: 'Can I pay by card?', a: 'Yes, at every counter.' },
  ],
  stats: [
    { value: '90 000', label: 'residents served' },
    { value: '5 days', label: 'usual wait for a slot' },
    { value: '3', label: 'languages at every counter' },
  ],
  testimonials: [
    { quote: 'Sorted my parking permit in ten minutes.', name: 'Jana K.', role: 'Resident' },
    { quote: 'Clear, quick and kind.', name: 'Petr M.' },
  ],
  team: [
    { name: 'Eva Nováková', role: 'Head of office', photo: photo('Eva') },
    { name: 'Tomáš Dvořák', role: 'Parking and permits' },
  ],
}

/** The least a site can have: no contact details, no optional sections, one item. */
export const minimal: SiteContent = {
  name: 'Ana',
  tagline: 'Tailor',
  headline: 'Alterations',
  subhead: 'By hand.',
  about: 'A small workshop.',
  reasonsTitle: 'Why',
  reasons: [{ title: 'Careful', body: 'Done once.' }],
  offerTitle: 'Work',
  prices: [{ group: '', items: [{ name: 'Hem', price: '£12' }] }],
  hours: [],
  address: [],
  phone: '',
  email: '',
  book: '#',
  cta: { headline: 'Drop in', subhead: 'Any day.', label: 'Visit' },
  photos,
}

/** Right-to-left: Arabic text in every field. */
export const rtl: SiteContent = {
  ...full,
  name: 'مخبز الياسمين',
  tagline: 'خبز طازج كل صباح',
  headline: 'خبز يُخبز أمامك كل صباح منذ عام ١٩٨٠',
  subhead: 'نخبز بالطريقة القديمة، بالحطب والوقت.',
  about: 'مخبز عائلي صغير في وسط المدينة.',
}
