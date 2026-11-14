import type { Business } from '../business.ts'
import type { CollectionValue } from '../collections.ts'
import type { ContentOf, SectionTypeName } from '../section-types.ts'
import type { ImageRef, RichText } from '../values.ts'

// Test content, written once per section type (CLAUDE.md, block contract).
// Every block of a section type is rendered and checked against every case here:
//   shortest  only the required fields, as short as allowed
//   typical   what a real small business would write
//   longest   every field filled, every text at its character limit
//   rtl       right-to-left text (Arabic)
// The business and its collections are invented. Asset ids point at generated art.

export const CASES = ['shortest', 'typical', 'longest', 'rtl'] as const
export type CaseName = (typeof CASES)[number]

export type Context = { business: Business; collections: Record<string, CollectionValue> }
export type Fixture<S extends SectionTypeName> = { content: ContentOf<S>; context: Context }
export type Fixtures<S extends SectionTypeName> = Record<CaseName, Fixture<S>>

/** An id with the right prefix: id('i', 3) → "i_0000000003". */
export const id = <P extends string>(prefix: P, n: number) =>
  `${prefix}_${String(n).padStart(10, '0')}` as `${P}_${string}`

/** Text of exactly `max` characters, built from whole words of `seed` where possible. */
export function atLimit(max: number, seed: string): string {
  const words = seed.split(/\s+/)
  let out = ''
  for (let i = 0; out.length < max; i++) out += (out ? ' ' : '') + words[i % words.length]
  out = out.slice(0, max).trimEnd()
  while (out.length < max) out += '.'
  return out
}

const para = (text: string): RichText => [{ style: 'p', spans: [{ text }] }]
const img = (n: number, alt: string, focal = { x: 0.5, y: 0.5 }): ImageRef => ({
  asset: id('a', n),
  alt,
  focal,
})
const page = (n: number) => ({ type: 'page' as const, page: id('p', n) })
const booking = { type: 'contact' as const, channel: 'booking' as const }

const LOREM =
  'Lived-in colour and precise cuts from a small team in Leith who listen first and take their time'
const AR = 'تلوين طبيعي وقصات دقيقة من فريق صغير يستمع إليك أولاً ويأخذ وقته في كل موعد'

export const business: Business = {
  name: 'Northside Hair',
  timeZone: 'Europe/London',
  phone: '+441315550123',
  email: 'hello@northside.example',
  bookingUrl: 'https://book.northside.example/',
  locations: [
    {
      id: id('l', 1),
      name: 'Leith',
      address: {
        lines: ['14 Constitution Street'],
        locality: 'Edinburgh',
        postalCode: 'EH6 7BT',
        country: 'GB',
      },
      geo: { lat: 55.9741, lng: -3.1704 },
      phone: '+441315550123',
      hours: [
        { day: 2, opens: '09:30', closes: '18:00' },
        { day: 3, opens: '09:30', closes: '18:00' },
        { day: 4, opens: '10:00', closes: '20:00' },
        { day: 5, opens: '09:30', closes: '18:00' },
        { day: 6, opens: '09:00', closes: '16:00' },
      ],
      note: 'Step-free entrance. Paid parking on Constitution Place.',
    },
  ],
  social: [{ network: 'instagram', url: 'https://instagram.com/northside.example' }],
  proof: { text: '4.9 ★ · 640 Google reviews', source: 'https://maps.example/northside' },
}

const businessLongest: Business = {
  ...business,
  name: atLimit(80, 'Northside Hair and Beauty Studio'),
  locations: [
    ...business.locations,
    {
      id: id('l', 2),
      name: atLimit(60, 'Stockbridge studio by the Water of Leith'),
      address: {
        lines: [
          atLimit(80, 'Unit 4 The Old Coach House 112 Raeburn Place'),
          atLimit(80, 'Rear courtyard'),
        ],
        locality: atLimit(60, 'Edinburgh'),
        postalCode: 'EH4 1HH',
        country: 'GB',
      },
      hours: [1, 2, 3, 4, 5, 6, 7].flatMap((day) => [
        { day, opens: '08:00', closes: '12:30' },
        { day, opens: '13:30', closes: '21:00' },
      ]),
      note: atLimit(
        160,
        'Two steps at the entrance; ask us and we will bring a ramp. Bus 24 and 29 stop outside.',
      ),
    },
  ],
}

const businessRtl: Business = {
  ...business,
  name: 'صالون نورث سايد',
  locations: [
    {
      ...(business.locations[0] as Business['locations'][number]),
      name: 'ليث',
      note: 'مدخل بدون درج. موقف سيارات مدفوع قريب.',
    },
  ],
}

const services = (n: 'shortest' | 'typical' | 'longest' | 'rtl'): CollectionValue => {
  const gbp = (pounds: number) => ({ amount: pounds * 100, currency: 'GBP' })
  const base: CollectionValue = {
    id: id('c', 1),
    kind: 'service',
    name: 'Prices',
    columns: [
      { id: 'stylist', label: 'Stylist' },
      { id: 'senior', label: 'Senior' },
      { id: 'director', label: 'Director' },
    ],
    items: [
      {
        id: id('i', 101),
        name: 'Restyle cut and finish',
        duration: 60,
        group: 'Cutting',
        image: img(21, 'A short textured bob'),
        price: {
          type: 'columns',
          byColumn: {
            stylist: { type: 'fixed', money: gbp(52) },
            senior: { type: 'fixed', money: gbp(62) },
            director: { type: 'fixed', money: gbp(78) },
          },
        },
      },
      {
        id: id('i', 102),
        name: 'Blow-dry',
        duration: 45,
        group: 'Cutting',
        price: {
          type: 'columns',
          byColumn: {
            stylist: { type: 'fixed', money: gbp(28) },
            senior: { type: 'fixed', money: gbp(32) },
            director: { type: 'fixed', money: gbp(38) },
          },
        },
      },
      {
        id: id('i', 103),
        name: 'Fringe trim',
        group: 'Cutting',
        price: { type: 'fixed', money: gbp(10) },
      },
      {
        id: id('i', 104),
        name: 'Full head balayage',
        description: 'Includes toner, Olaplex and a cut. Skin test 48 hours before.',
        image: img(20, 'Soft copper balayage'),
        duration: 210,
        group: 'Colour',
        price: { type: 'from', money: gbp(165) },
      },
      {
        id: id('i', 105),
        name: 'Colour correction',
        group: 'Colour',
        price: { type: 'on-request' },
      },
    ],
  }
  if (n === 'shortest')
    return { ...base, columns: undefined, items: [{ id: id('i', 1), name: 'Cut' }] }
  if (n === 'rtl')
    return {
      ...base,
      columns: undefined,
      items: [
        { id: id('i', 1), name: 'قص وتصفيف', price: { type: 'fixed', money: gbp(52) } },
        { id: id('i', 2), name: 'تجفيف بالسشوار', price: { type: 'from', money: gbp(28) } },
      ],
    }
  if (n === 'longest')
    return {
      ...base,
      columns: [
        { id: 'stylist', label: atLimit(24, 'Graduate stylist') },
        { id: 'senior', label: atLimit(24, 'Senior stylist') },
        { id: 'director', label: atLimit(24, 'Salon director') },
        { id: 'curly', label: atLimit(24, 'Curly specialist') },
      ],
      items: Array.from({ length: 24 }, (_, i) => ({
        id: id('i', 200 + i),
        name: atLimit(80, 'Restyle cut and finish with consultation and a styling lesson'),
        description: atLimit(
          400,
          'Includes a full consultation, wash, cut, blow-dry and advice on products for your hair type.',
        ),
        duration: 240,
        tags: ['Popular', atLimit(24, 'Includes Olaplex treatment')],
        group: atLimit(
          60,
          i < 12 ? 'Cutting and styling for all lengths' : 'Colour, toning and correction',
        ),
        price: {
          type: 'columns' as const,
          byColumn: {
            stylist: { type: 'range' as const, min: gbp(1000), max: gbp(9999) },
            senior: { type: 'fixed' as const, money: gbp(9999) },
            director: { type: 'fixed' as const, money: gbp(9999) },
            curly: { type: 'on-request' as const },
          },
        },
      })),
    }
  return base
}

const ctx = (c: 'shortest' | 'typical' | 'longest' | 'rtl'): Context => ({
  business: c === 'longest' ? businessLongest : c === 'rtl' ? businessRtl : business,
  collections: { [id('c', 1)]: services(c) },
})

const nav = (labels: string[], children = 0, childLabel = 'Item') =>
  labels.map((label, i) => ({
    id: id('i', 10 + i),
    label,
    to: page(i + 1),
    ...(children
      ? {
          children: Array.from({ length: children }, (_, j) => ({
            id: id('i', 100 + i * 10 + j),
            label: childLabel,
            to: page(20 + j),
          })),
        }
      : {}),
  }))

export const fixtures: { [S in M0Section]: Fixtures<S> } = {
  header: {
    shortest: { content: { nav: nav(['Home']) }, context: ctx('shortest') },
    typical: {
      content: {
        nav: nav(['Prices', 'Team', 'Gallery', 'Visit']),
        primaryCta: { label: 'Book', to: booking },
        facts: ['phone', 'address'],
      },
      context: ctx('typical'),
    },
    longest: {
      content: {
        nav: nav(
          Array.from({ length: 6 }, () => atLimit(24, 'Treatments and services')),
          8,
          atLimit(24, 'Colour correction service'),
        ),
        primaryCta: { label: atLimit(24, 'Book an appointment now'), to: booking },
        facts: ['phone', 'email', 'address', 'social'],
      },
      context: ctx('longest'),
    },
    rtl: {
      content: {
        nav: nav(['الأسعار', 'الفريق', 'المعرض', 'زورونا']),
        primaryCta: { label: 'احجز', to: booking },
        facts: ['phone', 'address'],
      },
      context: ctx('rtl'),
    },
  },
  footer: {
    shortest: { content: {}, context: ctx('shortest') },
    typical: {
      content: {
        nav: nav(['Salon', 'Help'], 3, 'Prices'),
        facts: ['address', 'hours', 'phone', 'social'],
        note: '© 2026 Northside Hair Ltd',
      },
      context: ctx('typical'),
    },
    longest: {
      content: {
        nav: nav(
          Array.from({ length: 6 }, () => atLimit(32, 'Treatments and services we offer')),
          10,
          atLimit(32, 'Colour correction and toning'),
        ),
        body: para(atLimit(240, LOREM)),
        facts: ['hours', 'address', 'map', 'phone', 'email', 'social', 'locations', 'licence'],
        form: { form: id('f', 1), kind: 'newsletter' },
        note: atLimit(
          200,
          'Northside Hair Ltd is registered in Scotland, company number SC123456.',
        ),
      },
      context: ctx('longest'),
    },
    rtl: {
      content: { facts: ['address', 'hours'], note: '© ٢٠٢٦ صالون نورث سايد' },
      context: ctx('rtl'),
    },
  },
  hero: {
    shortest: { content: { headline: 'Hi' }, context: ctx('shortest') },
    typical: {
      content: {
        eyebrow: 'Hair salon in Leith',
        headline: 'Colour that grows out beautifully',
        subhead: 'Lived-in colour and precise cuts from a small team that listens first.',
        primaryCta: { label: 'Book a consultation', to: booking },
        secondaryCta: { label: 'See prices', to: page(2) },
        media: img(1, 'A stylist finishing a soft copper balayage', { x: 0.6, y: 0.35 }),
        proof: {
          text: '4.9 ★ · 640 Google reviews',
          link: { type: 'url', url: 'https://maps.example/northside' },
        },
      },
      context: ctx('typical'),
    },
    longest: {
      content: {
        eyebrow: atLimit(32, 'Independent hair salon in Leith'),
        headline: atLimit(
          70,
          'Colour that grows out beautifully and cuts that last between visits',
        ),
        subhead: atLimit(180, LOREM),
        primaryCta: { label: atLimit(24, 'Book a consultation now'), to: booking },
        secondaryCta: { label: atLimit(24, 'See all of our prices'), to: page(2) },
        gallery: [
          img(1, 'Salon chairs by the window'),
          img(2, 'Balayage close-up'),
          img(3, 'The team'),
        ].map((image, i) => ({ id: id('i', i + 1), image })),
        proof: { text: atLimit(60, '4.9 ★ from 640 reviews on Google and 120 on Treatwell') },
      },
      context: ctx('longest'),
    },
    rtl: {
      content: {
        headline: 'لون يكبر معك بشكل جميل',
        subhead: AR,
        primaryCta: { label: 'احجز استشارة', to: booking },
        gallery: [img(1, 'مصففة شعر'), img(2, 'صبغة نحاسية'), img(3, 'الفريق')].map((image, i) => ({
          id: id('i', i + 1),
          image,
        })),
      },
      context: ctx('rtl'),
    },
  },
  'text-media': {
    shortest: { content: { body: para('Hi.') }, context: ctx('shortest') },
    typical: {
      content: {
        eyebrow: 'Our story',
        headline: 'A small salon that takes its time',
        body: [
          {
            style: 'p',
            spans: [
              { text: 'Northside opened in 2009 with two chairs and a promise: ' },
              { text: 'no rushing', marks: ['strong'] },
              { text: '. Every appointment starts with a proper consultation.' },
            ],
          },
          {
            style: 'p',
            spans: [{ text: 'Today there are twelve of us, and the promise has not changed.' }],
          },
        ],
        media: img(4, 'The salon floor in afternoon light', { x: 0.4, y: 0.5 }),
        primaryCta: { label: 'Meet the team', to: page(3) },
      },
      context: ctx('typical'),
    },
    longest: {
      content: {
        eyebrow: atLimit(32, 'Our story since two thousand and nine'),
        headline: atLimit(70, 'A small salon that takes its time with every single appointment'),
        body: [
          { style: 'p', spans: [{ text: atLimit(700, LOREM) }] },
          {
            style: 'bullet',
            spans: [{ text: atLimit(200, 'Free consultation before every colour') }],
          },
          { style: 'bullet', spans: [{ text: atLimit(200, 'Skin tests done in the salon') }] },
          { style: 'p', spans: [{ text: atLimit(400, LOREM) }] },
        ],
        gallery: [
          img(4, 'Salon floor'),
          img(5, 'Products'),
          img(6, 'Window seat'),
          img(7, 'Team'),
        ].map((image, i) => ({ id: id('i', i + 1), image })),
        primaryCta: { label: atLimit(24, 'Meet the whole team now'), to: page(3) },
        secondaryCta: { label: atLimit(24, 'Read about our products'), to: page(4) },
      },
      context: ctx('longest'),
    },
    rtl: {
      content: {
        headline: 'قصتنا',
        body: para(AR),
        gallery: [
          { id: id('i', 1), image: img(4, 'الصالون'), caption: 'كرسي بجانب النافذة' },
          { id: id('i', 2), image: img(5, 'المنتجات'), caption: 'منتجات نباتية' },
        ],
      },
      context: ctx('rtl'),
    },
  },
  cards: {
    shortest: {
      content: {
        items: [
          { id: id('i', 1), title: 'Cut' },
          { id: id('i', 2), title: 'Colour' },
        ],
      },
      context: ctx('shortest'),
    },
    typical: {
      content: {
        headline: 'Why clients stay',
        items: [
          {
            id: id('i', 1),
            icon: 'clock',
            title: 'Unhurried',
            body: para('Every colour appointment starts with a free consultation.'),
          },
          {
            id: id('i', 2),
            icon: 'leaf',
            title: 'Kind products',
            body: para('Vegan colour and refills for everything we sell.'),
          },
          {
            id: id('i', 3),
            icon: 'heart',
            title: 'Honest advice',
            body: para('We tell you what will suit your hair, not what costs most.'),
          },
        ],
      },
      context: ctx('typical'),
    },
    longest: {
      content: {
        eyebrow: atLimit(32, 'Why our clients keep coming back'),
        headline: atLimit(
          70,
          'Six reasons people have trusted us with their hair for sixteen years',
        ),
        subhead: atLimit(220, LOREM),
        items: Array.from({ length: 30 }, (_, i) => ({
          id: id('i', i + 1),
          eyebrow: atLimit(32, 'Included with every appointment'),
          icon: 'star',
          title: atLimit(60, 'Unhurried appointments with a proper consultation'),
          body: para(atLimit(320, LOREM)),
          media: img(10 + i, 'Detail photo'),
          link: { label: atLimit(24, 'Read more about this one'), to: page(5) },
        })),
        primaryCta: { label: atLimit(24, 'See all of our services'), to: page(2) },
        note: atLimit(
          240,
          'Consultations are free for new clients; returning clients may be asked for a deposit.',
        ),
      },
      context: ctx('longest'),
    },
    rtl: {
      content: {
        headline: 'لماذا يبقى عملاؤنا',
        items: [
          { id: id('i', 1), title: 'بدون استعجال', body: para('كل موعد يبدأ باستشارة مجانية.') },
          {
            id: id('i', 2),
            title: 'منتجات لطيفة',
            body: para('صبغات نباتية وعبوات قابلة لإعادة التعبئة.'),
          },
        ],
      },
      context: ctx('rtl'),
    },
  },
  cta: {
    shortest: { content: { headline: 'Hi' }, context: ctx('shortest') },
    typical: {
      content: {
        headline: 'Ready for a change?',
        subhead: 'Book a free consultation and we will plan it together.',
        primaryCta: { label: 'Book now', to: booking },
        secondaryCta: { label: 'Call the salon', to: { type: 'contact', channel: 'phone' } },
        form: { form: id('f', 1), kind: 'newsletter' },
      },
      context: ctx('typical'),
    },
    longest: {
      content: {
        headline: atLimit(70, 'Ready for a change? Book a free consultation and we will plan it'),
        subhead: atLimit(200, LOREM),
        primaryCta: { label: atLimit(24, 'Book a consultation now'), to: booking },
        secondaryCta: {
          label: atLimit(24, 'Call the salon directly'),
          to: { type: 'contact', channel: 'phone' },
        },
        media: img(8, 'Salon door'),
        form: { form: id('f', 1), kind: 'newsletter' },
      },
      context: ctx('longest'),
    },
    rtl: {
      content: {
        headline: 'مستعدة للتغيير؟',
        primaryCta: { label: 'احجزي الآن', to: booking },
        form: { form: id('f', 1), kind: 'newsletter' },
      },
      context: ctx('rtl'),
    },
  },
  'price-list': {
    shortest: { content: { source: { collection: id('c', 1) } }, context: ctx('shortest') },
    typical: {
      content: {
        headline: 'Prices',
        subhead: 'Prices depend on the experience of your stylist.',
        source: { collection: id('c', 1), groupBy: 'group' },
        note: 'A £20 deposit is taken for colour appointments.',
        primaryCta: { label: 'Book online', to: booking },
      },
      context: ctx('typical'),
    },
    longest: {
      content: {
        headline: atLimit(70, 'Prices for cutting, styling, colour and treatments at every level'),
        subhead: atLimit(220, LOREM),
        source: { collection: id('c', 1), groupBy: 'group' },
        note: atLimit(
          300,
          'A deposit is taken for colour appointments and refunded at your visit. Prices may change.',
        ),
        primaryCta: { label: atLimit(24, 'Book your appointment now'), to: booking },
      },
      context: ctx('longest'),
    },
    rtl: {
      content: { headline: 'الأسعار', source: { collection: id('c', 1) } },
      context: ctx('rtl'),
    },
  },
  'hours-location': {
    shortest: { content: { facts: ['hours'] }, context: ctx('shortest') },
    typical: {
      content: {
        headline: 'Visit us',
        facts: ['hours', 'address', 'map', 'phone'],
        primaryCta: { label: 'Get directions', to: { type: 'contact', channel: 'directions' } },
      },
      context: ctx('typical'),
    },
    longest: {
      content: {
        headline: atLimit(
          70,
          'Visit us in Leith or Stockbridge, open six days and late on Thursdays',
        ),
        body: para(atLimit(600, LOREM)),
        facts: ['hours', 'address', 'map', 'phone', 'email', 'locations'],
        primaryCta: {
          label: atLimit(24, 'Get directions to the salon'),
          to: { type: 'contact', channel: 'directions' },
        },
      },
      context: ctx('longest'),
    },
    rtl: { content: { headline: 'زورونا', facts: ['hours', 'address'] }, context: ctx('rtl') },
  },
}

/** The section types M0 builds blocks for (decision 0001, "Proposed for M0"). */
export const M0_SECTIONS = [
  'header',
  'footer',
  'hero',
  'text-media',
  'cards',
  'cta',
  'price-list',
  'hours-location',
] as const
export type M0Section = (typeof M0_SECTIONS)[number]
