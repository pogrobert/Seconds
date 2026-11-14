import type { Business, CollectionValue } from '@repo/spec'

// Five invented businesses, one per kind (CLAUDE.md, M0 kinds). Used to render sample sites and as
// the facts behind M0's test briefs. Names, numbers and addresses are made up; domains use .example.
// The copy here is a hand-written stand-in for the text model, so layouts can be judged before the
// pipeline exists. It is marked `standIn` so it is never mistaken for generated text.

export const KINDS = ['restaurant', 'salon', 'clinic', 'trades', 'fitness'] as const
export type Kind = (typeof KINDS)[number]

const lid = (n: number) => `l_${String(n).padStart(10, '0')}` as const
const iid = (n: number) => `i_${String(n).padStart(10, '0')}` as const
const cid = (n: number) => `c_${String(n).padStart(10, '0')}` as const
const money = (pounds: number, currency = 'GBP') => ({ amount: Math.round(pounds * 100), currency })
const week = (days: number[], opens: string, closes: string) =>
  days.map((day) => ({ day, opens, closes }))

export type SampleBusiness = {
  kind: Kind
  business: Business
  collections: CollectionValue[]
  /** Stand-in copy until the text model writes it. */
  standIn: {
    tagline: string
    headline: string
    subhead: string
    about: string
    /** How to find the place: shown beside the hours. */
    visit: string
    reasons: { title: string; body: string }[]
    steps?: { title: string; body: string }[]
    cta: { headline: string; subhead: string; label: string }
  }
  palette: string
}

export const SAMPLES: Record<Kind, SampleBusiness> = {
  restaurant: {
    kind: 'restaurant',
    palette: '#8a3b2e',
    business: {
      name: 'Marrow & Vine',
      timeZone: 'Europe/London',
      phone: '+441615550188',
      email: 'table@marrowvine.example',
      bookingUrl: 'https://book.marrowvine.example/',
      locations: [
        {
          id: lid(1),
          name: 'Ancoats',
          address: {
            lines: ['22 Blossom Street'],
            locality: 'Manchester',
            postalCode: 'M4 6AJ',
            country: 'GB',
          },
          geo: { lat: 53.4851, lng: -2.2259 },
          phone: '+441615550188',
          hours: [
            ...week([3, 4], '17:00', '22:00'),
            ...week([5, 6], '12:00', '14:30'),
            ...week([5, 6], '17:00', '23:00'),
            ...week([7], '12:00', '17:00'),
          ],
          note: 'Step-free entrance. Dogs welcome at the bar.',
        },
      ],
      social: [{ network: 'instagram', url: 'https://instagram.com/marrowvine.example' }],
      proof: { text: 'Good Food Guide 2026' },
    },
    collections: [
      {
        id: cid(1),
        kind: 'menu-item',
        name: 'Menu',
        items: [
          {
            id: iid(1),
            group: 'Small plates',
            name: 'Bone marrow, parsley, sourdough',
            price: { type: 'fixed', money: money(9) },
          },
          {
            id: iid(2),
            group: 'Small plates',
            name: 'Burrata, blood orange, fennel',
            tags: ['V'],
            price: { type: 'fixed', money: money(11) },
          },
          {
            id: iid(3),
            group: 'Small plates',
            name: 'Crispy pig cheek, apple ketchup',
            price: { type: 'fixed', money: money(10) },
          },
          {
            id: iid(4),
            group: 'Large plates',
            name: 'Hake, mussels, cider butter',
            price: { type: 'fixed', money: money(24) },
          },
          {
            id: iid(5),
            group: 'Large plates',
            name: 'Aged beef rump, dripping chips',
            price: { type: 'fixed', money: money(29) },
          },
          {
            id: iid(6),
            group: 'Large plates',
            name: 'Celeriac, hazelnut, brown butter',
            tags: ['V', 'GF'],
            price: { type: 'fixed', money: money(19) },
          },
          {
            id: iid(7),
            group: 'Puddings',
            name: 'Treacle tart, clotted cream',
            tags: ['V'],
            price: { type: 'fixed', money: money(8) },
          },
          {
            id: iid(8),
            group: 'Puddings',
            name: 'Cheese, oatcakes, chutney',
            price: { type: 'fixed', money: money(12) },
          },
        ],
      },
    ],
    standIn: {
      tagline: 'Restaurant and bar in Ancoats',
      headline: 'Whole-animal cooking, whole-season menus',
      subhead:
        'Small plates, a short wine list and a dining room that stays open late on weekends.',
      about:
        'We opened in 2019 in an old mill office on Blossom Street. The menu changes every week with what our farmers and fishers bring in, and nothing goes to waste.',
      visit:
        "Five minutes' walk from Piccadilly station, on the corner of Blossom Street and Henry Street.",
      reasons: [
        { title: 'Whole-animal cooking', body: 'One farm, one animal at a time, every part used.' },
        {
          title: 'A short wine list',
          body: 'Thirty bottles, all from small growers, most by the glass.',
        },
        { title: 'Walk-ins welcome', body: 'We keep the bar for people who just turn up.' },
      ],
      cta: {
        headline: 'Book a table',
        subhead: 'Tables for up to eight; larger groups by email.',
        label: 'Book now',
      },
    },
  },
  salon: {
    kind: 'salon',
    palette: '#5b4a7a',
    business: {
      name: 'Northside Hair',
      timeZone: 'Europe/London',
      phone: '+441315550123',
      email: 'hello@northside.example',
      bookingUrl: 'https://book.northside.example/',
      locations: [
        {
          id: lid(1),
          name: 'Leith',
          address: {
            lines: ['14 Constitution Street'],
            locality: 'Edinburgh',
            postalCode: 'EH6 7BT',
            country: 'GB',
          },
          geo: { lat: 55.9741, lng: -3.1704 },
          hours: [
            ...week([2, 3, 5], '09:30', '18:00'),
            ...week([4], '10:00', '20:00'),
            ...week([6], '09:00', '16:00'),
          ],
          note: 'Paid parking on Constitution Place.',
        },
      ],
      social: [{ network: 'instagram', url: 'https://instagram.com/northside.example' }],
      proof: { text: '4.9 ★ · 640 Google reviews' },
    },
    collections: [
      {
        id: cid(1),
        kind: 'service',
        name: 'Prices',
        columns: [
          { id: 'stylist', label: 'Stylist' },
          { id: 'senior', label: 'Senior' },
          { id: 'director', label: 'Director' },
        ],
        items: [
          {
            id: iid(1),
            group: 'Cutting',
            name: 'Restyle cut and finish',
            duration: 60,
            price: {
              type: 'columns',
              byColumn: {
                stylist: { type: 'fixed', money: money(52) },
                senior: { type: 'fixed', money: money(62) },
                director: { type: 'fixed', money: money(78) },
              },
            },
          },
          {
            id: iid(2),
            group: 'Cutting',
            name: 'Wash, cut and blow-dry',
            duration: 45,
            price: {
              type: 'columns',
              byColumn: {
                stylist: { type: 'fixed', money: money(45) },
                senior: { type: 'fixed', money: money(55) },
                director: { type: 'fixed', money: money(68) },
              },
            },
          },
          {
            id: iid(3),
            group: 'Cutting',
            name: 'Fringe trim',
            price: { type: 'fixed', money: money(10) },
          },
          {
            id: iid(4),
            group: 'Colour',
            name: 'Full head balayage',
            duration: 210,
            description: 'Includes toner and Olaplex. Skin test 48 hours before.',
            price: { type: 'from', money: money(165) },
          },
          {
            id: iid(5),
            group: 'Colour',
            name: 'Root tint',
            duration: 90,
            price: {
              type: 'columns',
              byColumn: {
                stylist: { type: 'fixed', money: money(58) },
                senior: { type: 'fixed', money: money(66) },
                director: { type: 'fixed', money: money(74) },
              },
            },
          },
          { id: iid(6), group: 'Colour', name: 'Colour correction', price: { type: 'on-request' } },
        ],
      },
    ],
    standIn: {
      tagline: 'Hair salon in Leith',
      headline: 'Colour that grows out beautifully',
      subhead: 'Lived-in colour and precise cuts from a small team that listens first.',
      about:
        'Northside opened in 2009 with two chairs and one promise: no rushing. Every colour appointment starts with a proper consultation, and you leave knowing how to look after it.',
      visit:
        'On Constitution Street, two doors down from the Port of Leith; the 16 and 22 buses stop outside.',
      reasons: [
        { title: 'Unhurried', body: 'Every colour appointment starts with a free consultation.' },
        { title: 'Kind products', body: 'Vegan colour and refills for everything we sell.' },
        {
          title: 'Honest advice',
          body: 'We tell you what will suit your hair, not what costs most.',
        },
      ],
      cta: {
        headline: 'Ready for a change?',
        subhead: 'Book a free consultation and we will plan it together.',
        label: 'Book a consultation',
      },
    },
  },
  clinic: {
    kind: 'clinic',
    palette: '#1f6f78',
    business: {
      name: 'Harbourside Dental',
      timeZone: 'Europe/Dublin',
      phone: '+35315550142',
      email: 'reception@harbourside.example',
      bookingUrl: 'https://book.harbourside.example/',
      locations: [
        {
          id: lid(1),
          name: 'Dún Laoghaire',
          address: {
            lines: ['3 Marine Road'],
            locality: 'Dún Laoghaire',
            region: 'Co. Dublin',
            postalCode: 'A96 X2F4',
            country: 'IE',
          },
          geo: { lat: 53.2944, lng: -6.1339 },
          hours: [...week([1, 2, 3, 5], '08:30', '17:30'), ...week([4], '08:30', '19:30')],
          note: 'Ground floor, wheelchair accessible. Pay-and-display parking opposite.',
        },
      ],
      licences: [{ label: 'Dental Council reg.', number: '7741' }],
    },
    collections: [
      {
        id: cid(1),
        kind: 'service',
        name: 'Fees',
        items: [
          {
            id: iid(1),
            group: 'General',
            name: 'Examination and X-rays',
            price: { type: 'fixed', money: money(65, 'EUR') },
          },
          {
            id: iid(2),
            group: 'General',
            name: 'Hygienist visit',
            duration: 40,
            price: { type: 'fixed', money: money(80, 'EUR') },
          },
          {
            id: iid(3),
            group: 'General',
            name: 'White filling',
            price: { type: 'from', money: money(110, 'EUR') },
          },
          {
            id: iid(4),
            group: 'Cosmetic',
            name: 'Teeth whitening, home kit',
            price: { type: 'fixed', money: money(295, 'EUR') },
          },
          {
            id: iid(5),
            group: 'Cosmetic',
            name: 'Clear aligners',
            price: { type: 'range', min: money(2400, 'EUR'), max: money(4200, 'EUR') },
          },
          {
            id: iid(6),
            group: 'Urgent care',
            name: 'Emergency appointment',
            price: { type: 'fixed', money: money(90, 'EUR') },
          },
        ],
      },
    ],
    standIn: {
      tagline: 'Family dentist in Dún Laoghaire',
      headline: 'Calm, careful dentistry for the whole family',
      subhead: 'New patients welcome. Same-day appointments for dental pain.',
      about:
        'Dr Aoife Brennan opened Harbourside in 2014. We are a small team of two dentists and two hygienists, and we take the time to explain every option before we start.',
      visit:
        'On Marine Road, opposite the ferry terminal; the DART station is a three-minute walk.',
      reasons: [
        { title: 'Nervous patients', body: 'Longer appointments and a stop signal you control.' },
        { title: 'Clear fees', body: 'Every fee is on this site, and we quote before treatment.' },
        { title: 'Late Thursdays', body: 'Open until 7.30pm for people who work office hours.' },
      ],
      cta: {
        headline: 'Book a check-up',
        subhead: 'Online booking takes two minutes.',
        label: 'Book online',
      },
    },
  },
  trades: {
    kind: 'trades',
    palette: '#c2410c',
    business: {
      name: 'Harbour Electrical',
      timeZone: 'Europe/London',
      phone: '+441175550190',
      email: 'jobs@harbourelectrical.example',
      locations: [
        {
          id: lid(1),
          name: 'Bristol',
          address: {
            lines: ['Unit 7, Feeder Road'],
            locality: 'Bristol',
            postalCode: 'BS2 0SB',
            country: 'GB',
          },
          hours: [...week([1, 2, 3, 4, 5], '08:00', '17:30'), ...week([6], '09:00', '13:00')],
        },
      ],
      serviceAreas: ['Bristol', 'Bath', 'Keynsham', 'Portishead', 'Clevedon', 'Thornbury'].map(
        (name, i) => ({ id: iid(50 + i), name }),
      ),
      licences: [
        { label: 'NICEIC', number: '608812' },
        { label: 'Part P', number: 'Registered' },
      ],
      proof: { text: '4.9 ★ · 312 reviews on Checkatrade' },
    },
    collections: [],
    standIn: {
      tagline: 'Electricians in Bristol and Bath',
      headline: 'Electrical work done right, the first time',
      subhead:
        'Rewires, EV chargers, fault finding and safety certificates. Fixed quotes, no surprises.',
      about:
        'Harbour Electrical is a family firm of six electricians, running since 2003. Every job is done by our own team, never subcontracted, and every job is certified.',
      visit: 'Our yard is on Feeder Road, but we come to you anywhere in Bristol and Bath.',
      reasons: [
        { title: 'Rewires', body: 'Full and partial rewires, with as little mess as possible.' },
        { title: 'EV chargers', body: 'Approved installer for home charge points.' },
        {
          title: 'Fault finding',
          body: 'Same-day call-outs for tripping switches and dead sockets.',
        },
        { title: 'Safety certificates', body: 'EICRs for landlords and home buyers.' },
      ],
      steps: [
        { title: 'Tell us the job', body: 'Call or send a few photos.' },
        { title: 'Get a fixed quote', body: 'Within one working day, in writing.' },
        { title: 'We do the work', body: 'On the day we agreed, and we tidy up.' },
        { title: 'You get the certificate', body: 'Emailed the same week.' },
      ],
      cta: {
        headline: 'Need an electrician?',
        subhead: 'Call us or send a few photos for a fixed quote.',
        label: 'Get a quote',
      },
    },
  },
  fitness: {
    kind: 'fitness',
    palette: '#1d4ed8',
    business: {
      name: 'Tidewater Pilates',
      timeZone: 'Europe/London',
      phone: '+442075550177',
      email: 'studio@tidewater.example',
      bookingUrl: 'https://book.tidewater.example/',
      locations: [
        {
          id: lid(1),
          name: 'Deptford',
          address: {
            lines: ['41 Creek Road'],
            locality: 'London',
            postalCode: 'SE8 3BU',
            country: 'GB',
          },
          geo: { lat: 51.4813, lng: -0.0238 },
          hours: [...week([1, 2, 3, 4, 5], '06:30', '21:00'), ...week([6, 7], '08:00', '14:00')],
          note: 'Showers and lockers. Mats and grip socks provided.',
        },
      ],
      social: [{ network: 'instagram', url: 'https://instagram.com/tidewater.example' }],
    },
    collections: [
      {
        id: cid(1),
        kind: 'service',
        name: 'Classes and passes',
        items: [
          {
            id: iid(1),
            group: 'Try us',
            name: 'Intro offer: 3 classes in 14 days',
            price: { type: 'fixed', money: money(39) },
          },
          {
            id: iid(2),
            group: 'Class packs',
            name: '5 classes, valid 2 months',
            price: { type: 'fixed', money: money(105) },
          },
          {
            id: iid(3),
            group: 'Class packs',
            name: '10 classes, valid 3 months',
            price: { type: 'fixed', money: money(190) },
          },
          {
            id: iid(4),
            group: 'Memberships',
            name: 'Unlimited',
            price: { type: 'per', money: money(159), unit: 'month' },
          },
          {
            id: iid(5),
            group: 'Memberships',
            name: '8 classes a month',
            price: { type: 'per', money: money(119), unit: 'month' },
          },
          {
            id: iid(6),
            group: 'Private',
            name: 'Private session, 55 minutes',
            price: { type: 'fixed', money: money(75) },
          },
        ],
      },
    ],
    standIn: {
      tagline: 'Reformer Pilates in Deptford',
      headline: 'Stronger, steadier, in small classes',
      subhead: 'Reformer classes of six people at most, taught by physio-trained instructors.',
      about:
        'Tidewater opened beside Deptford Creek in 2021. Classes are small on purpose: six reformers, one instructor who knows your name and adjusts every exercise to your body.',
      visit: 'Beside Deptford Creek, five minutes from Deptford Bridge DLR; bike racks outside.',
      reasons: [
        { title: 'Six people at most', body: 'Every class is small enough for real corrections.' },
        { title: 'Physio-trained', body: 'All instructors trained in clinical Pilates.' },
        {
          title: 'All levels',
          body: 'Beginners welcome in every class, with options for each move.',
        },
      ],
      cta: {
        headline: 'Try three classes for £39',
        subhead: 'For new clients, valid for 14 days.',
        label: 'Start the intro offer',
      },
    },
  },
}
