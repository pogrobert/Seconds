// The wide set (docs/m0/18-bench.md): about 200 briefs that only the automatic checks look at.
// Each kind of business appears in three of five ways of asking, in a big city, a small town or
// no place. The list is made from the fixed data below, so it is the same on every run.
// Only ever add kinds at the END of KINDS: ids come from the kind and the way of asking, and
// the rotation depends on each kind's position.

import type { Brief } from './briefs.ts'

type Kind = {
  /** Short id. */
  id: string
  /** Area, for results by area. */
  area: string
  /** What it is, as an owner would say it. */
  what: string
  /** A plausible name for the detailed brief. */
  name: string
  /** Two things it offers, with prices, for the detailed brief. */
  offers: [string, string][]
}

const KINDS: Kind[] = [
  // Shops
  {
    id: 'bookshop',
    area: 'shop',
    what: 'independent bookshop',
    name: 'Margins',
    offers: [
      ['signed first editions', 'from £20'],
      ['book club', '£5 a month'],
    ],
  },
  {
    id: 'bike-shop',
    area: 'shop',
    what: 'bicycle shop',
    name: 'Spoke & Chain',
    offers: [
      ['service', '£45'],
      ['puncture repair', '£12'],
    ],
  },
  {
    id: 'deli',
    area: 'shop',
    what: 'Italian deli',
    name: 'Salumeria Rossi',
    offers: [
      ['focaccia', '£4'],
      ['cheese board', '£18'],
    ],
  },
  {
    id: 'record-shop',
    area: 'shop',
    what: 'vinyl record shop',
    name: 'Groove Room',
    offers: [
      ['used LPs', 'from £8'],
      ['turntable setup', '£30'],
    ],
  },
  {
    id: 'hardware',
    area: 'shop',
    what: 'family hardware store',
    name: 'Pike Hardware',
    offers: [
      ['key cutting', '£4'],
      ['paint mixing', 'free'],
    ],
  },
  {
    id: 'toy-shop',
    area: 'shop',
    what: 'wooden toy shop',
    name: 'Little Oak',
    offers: [
      ['wooden train set', '£45'],
      ['gift wrapping', '£2'],
    ],
  },
  {
    id: 'optician',
    area: 'health',
    what: 'optician',
    name: 'Clear Sight Opticians',
    offers: [
      ['eye test', '£25'],
      ['frames', 'from £79'],
    ],
  },
  {
    id: 'pharmacy',
    area: 'health',
    what: 'community pharmacy',
    name: 'Riverside Pharmacy',
    offers: [
      ['flu jab', '£15'],
      ['blood pressure check', 'free'],
    ],
  },
  // Trades and services
  {
    id: 'locksmith',
    area: 'trades',
    what: 'locksmith',
    name: 'KeyFast',
    offers: [
      ['lockout', '£79'],
      ['lock change', 'from £65'],
    ],
  },
  {
    id: 'painter',
    area: 'trades',
    what: 'painter and decorator',
    name: 'True Line Decorating',
    offers: [
      ['room repaint', 'from £250'],
      ['wallpapering', 'from £180'],
    ],
  },
  {
    id: 'gardener',
    area: 'trades',
    what: 'garden maintenance service',
    name: 'Greenhand',
    offers: [
      ['lawn mowing', '£25'],
      ['hedge trimming', 'from £40'],
    ],
  },
  {
    id: 'cleaner',
    area: 'trades',
    what: 'house cleaning company',
    name: 'Sparkle & Co',
    offers: [
      ['weekly clean', '£18 an hour'],
      ['end of tenancy clean', 'from £220'],
    ],
  },
  {
    id: 'carpenter',
    area: 'trades',
    what: 'carpenter making fitted furniture',
    name: 'Grain Joinery',
    offers: [
      ['fitted wardrobe', 'from £1,800'],
      ['shelving', 'from £350'],
    ],
  },
  {
    id: 'mechanic',
    area: 'trades',
    what: 'car repair garage',
    name: 'Bridge Street Motors',
    offers: [
      ['MOT', '£54.85'],
      ['full service', '£199'],
    ],
  },
  {
    id: 'tailor',
    area: 'trades',
    what: 'tailor and alterations',
    name: 'Stitch Lane',
    offers: [
      ['trouser hem', '£12'],
      ['made-to-measure suit', 'from £900'],
    ],
  },
  {
    id: 'cobbler',
    area: 'trades',
    what: 'shoe repairer',
    name: 'Heel & Sole',
    offers: [
      ['resole', '£35'],
      ['heel repair', '£15'],
    ],
  },
  {
    id: 'removals',
    area: 'trades',
    what: 'removals company',
    name: 'Easy Move',
    offers: [
      ['one-bedroom move', 'from £350'],
      ['packing', '£25 an hour'],
    ],
  },
  {
    id: 'it-repair',
    area: 'trades',
    what: 'computer and phone repair shop',
    name: 'FixPoint',
    offers: [
      ['screen replacement', 'from £59'],
      ['virus removal', '£40'],
    ],
  },
  // Health and care
  {
    id: 'gp',
    area: 'health',
    what: 'family doctor practice',
    name: 'Elm Grove Surgery',
    offers: [
      ['appointments', 'free on the NHS'],
      ['travel vaccines', 'from £30'],
    ],
  },
  {
    id: 'osteopath',
    area: 'health',
    what: 'osteopath',
    name: 'Balance Osteopathy',
    offers: [
      ['first visit', '£60'],
      ['follow-up', '£50'],
    ],
  },
  {
    id: 'counsellor',
    area: 'health',
    what: 'counsellor for anxiety and grief',
    name: 'Quiet Room Counselling',
    offers: [
      ['50-minute session', '£55'],
      ['first call', 'free'],
    ],
  },
  {
    id: 'midwife',
    area: 'health',
    what: 'independent midwife',
    name: 'Born at Home',
    offers: [
      ['antenatal visit', '£80'],
      ['home birth package', '£3,500'],
    ],
  },
  {
    id: 'care-home',
    area: 'health',
    what: 'care home for older people',
    name: 'Willow House',
    offers: [
      ['residential care', 'from £1,050 a week'],
      ['respite stays', 'from £160 a night'],
    ],
  },
  {
    id: 'vet',
    area: 'health',
    what: 'veterinary practice',
    name: 'Meadow Vets',
    offers: [
      ['consultation', '£45'],
      ['vaccinations', '£55'],
    ],
  },
  // Food and drink
  {
    id: 'pizzeria',
    area: 'food',
    what: 'pizzeria',
    name: 'Forno 900',
    offers: [
      ['margherita', '£9'],
      ['diavola', '£12'],
    ],
  },
  {
    id: 'ramen',
    area: 'food',
    what: 'ramen bar',
    name: 'Tonkotsu House',
    offers: [
      ['tonkotsu ramen', '£14'],
      ['gyoza', '£6'],
    ],
  },
  {
    id: 'brewery',
    area: 'food',
    what: 'craft brewery and taproom',
    name: 'Hopworks',
    offers: [
      ['tasting flight', '£10'],
      ['brewery tour', '£15'],
    ],
  },
  {
    id: 'food-truck',
    area: 'food',
    what: 'taco food truck',
    name: 'Taco Libre',
    offers: [
      ['three tacos', '£9'],
      ['loaded nachos', '£7'],
    ],
  },
  {
    id: 'tea-room',
    area: 'food',
    what: 'tea room',
    name: 'The Copper Kettle',
    offers: [
      ['cream tea', '£8.50'],
      ['afternoon tea', '£24'],
    ],
  },
  {
    id: 'butcher',
    area: 'food',
    what: 'butcher',
    name: 'Haywood Butchers',
    offers: [
      ['sausages', '£9 a kilo'],
      ['Sunday roast box', '£35'],
    ],
  },
  {
    id: 'cocktail-bar',
    area: 'food',
    what: 'cocktail bar',
    name: 'Velvet',
    offers: [
      ['house negroni', '£11'],
      ['bar snacks', 'from £5'],
    ],
  },
  {
    id: 'caterer',
    area: 'food',
    what: 'wedding caterer',
    name: 'Long Table Catering',
    offers: [
      ['sharing menu', '£55 a head'],
      ['canapés', '£12 a head'],
    ],
  },
  // Civic, faith, education
  {
    id: 'town-council',
    area: 'civic',
    what: 'town council',
    name: 'Town Council',
    offers: [
      ['allotments', '£40 a year'],
      ['hall hire', '£20 an hour'],
    ],
  },
  {
    id: 'church',
    area: 'faith',
    what: 'parish church',
    name: "St Mary's Church",
    offers: [
      ['Sunday service', 'free'],
      ['weddings', 'from £550'],
    ],
  },
  {
    id: 'mosque',
    area: 'faith',
    what: 'mosque and community centre',
    name: 'Al-Noor Centre',
    offers: [
      ['Arabic classes', '£10 a week'],
      ['hall hire', '£30 an hour'],
    ],
  },
  {
    id: 'primary-school',
    area: 'education',
    what: 'primary school',
    name: 'Brookfield Primary',
    offers: [
      ['breakfast club', '£4 a day'],
      ['after-school club', '£12 a day'],
    ],
  },
  {
    id: 'nursery',
    area: 'education',
    what: 'children’s nursery',
    name: 'Acorns Nursery',
    offers: [
      ['full day', '£78'],
      ['half day', '£45'],
    ],
  },
  {
    id: 'driving-school',
    area: 'education',
    what: 'driving instructor',
    name: 'Clear Road Driving',
    offers: [
      ['one-hour lesson', '£38'],
      ['block of ten', '£360'],
    ],
  },
  {
    id: 'language-school',
    area: 'education',
    what: 'language school',
    name: 'Lingua Viva',
    offers: [
      ['group course', '£180 for 10 weeks'],
      ['private lesson', '£40'],
    ],
  },
  {
    id: 'tutor',
    area: 'education',
    what: 'maths tutor',
    name: 'Number Sense Tutoring',
    offers: [
      ['GCSE lesson', '£40'],
      ['A level lesson', '£50'],
    ],
  },
  // Culture, sport, clubs
  {
    id: 'theatre',
    area: 'culture',
    what: 'small theatre',
    name: 'The Lantern Theatre',
    offers: [
      ['tickets', 'from £12'],
      ['youth workshop', '£6'],
    ],
  },
  {
    id: 'gallery',
    area: 'culture',
    what: 'art gallery',
    name: 'Northlight Gallery',
    offers: [
      ['exhibitions', 'free'],
      ['framing', 'from £45'],
    ],
  },
  {
    id: 'choir',
    area: 'club',
    what: 'community choir',
    name: 'Harbour Voices',
    offers: [
      ['weekly rehearsal', '£5'],
      ['first session', 'free'],
    ],
  },
  {
    id: 'football-club',
    area: 'club',
    what: 'amateur football club',
    name: 'Riverside FC',
    offers: [
      ['season membership', '£120'],
      ['junior training', '£3 a week'],
    ],
  },
  {
    id: 'climbing',
    area: 'sport',
    what: 'climbing wall',
    name: 'Crux Climbing',
    offers: [
      ['day pass', '£13'],
      ['intro session', '£25'],
    ],
  },
  {
    id: 'swim-school',
    area: 'sport',
    what: 'swimming lessons for children',
    name: 'Little Fins',
    offers: [
      ['term of lessons', '£96'],
      ['trial lesson', '£10'],
    ],
  },
  {
    id: 'martial-arts',
    area: 'sport',
    what: 'karate club',
    name: 'Kaizen Karate',
    offers: [
      ['monthly membership', '£35'],
      ['trial class', 'free'],
    ],
  },
  {
    id: 'escape-room',
    area: 'leisure',
    what: 'escape room',
    name: 'Locked In',
    offers: [
      ['team of four', '£80'],
      ['team of six', '£108'],
    ],
  },
  // Freelancers and firms
  {
    id: 'photographer',
    area: 'freelance',
    what: 'wedding photographer',
    name: 'Ana Ruiz Photography',
    offers: [
      ['full day', '£1,600'],
      ['engagement shoot', '£300'],
    ],
  },
  {
    id: 'accountant',
    area: 'firm',
    what: 'accountant for small businesses',
    name: 'Ledger & Line',
    offers: [
      ['self-assessment return', '£180'],
      ['monthly bookkeeping', 'from £95'],
    ],
  },
  {
    id: 'web-designer',
    area: 'freelance',
    what: 'web designer',
    name: 'Pixel Thread',
    offers: [
      ['small business site', 'from £1,200'],
      ['care plan', '£30 a month'],
    ],
  },
  {
    id: 'interior',
    area: 'freelance',
    what: 'interior designer',
    name: 'Studio Hale',
    offers: [
      ['room design', 'from £650'],
      ['consultation', '£90'],
    ],
  },
  {
    id: 'estate-agent',
    area: 'firm',
    what: 'estate agent',
    name: 'Keystone Homes',
    offers: [
      ['sales fee', '1.2%'],
      ['lettings', '10% a month'],
    ],
  },
  {
    id: 'solicitor',
    area: 'firm',
    what: 'family law solicitor',
    name: 'Hart Family Law',
    offers: [
      ['first meeting', '£95'],
      ['divorce', 'from £1,200'],
    ],
  },
  // Farms, pets, events, other
  {
    id: 'farm-shop',
    area: 'farm',
    what: 'farm shop',
    name: 'Lower Barn Farm',
    offers: [
      ['veg box', '£18'],
      ['free-range eggs', '£3.20 a dozen'],
    ],
  },
  {
    id: 'dog-groomer',
    area: 'pets',
    what: 'dog groomer',
    name: 'Scruffs',
    offers: [
      ['full groom', 'from £40'],
      ['nail clip', '£8'],
    ],
  },
  {
    id: 'dog-walker',
    area: 'pets',
    what: 'dog walker',
    name: 'Wag Walks',
    offers: [
      ['one-hour walk', '£14'],
      ['puppy visit', '£10'],
    ],
  },
  {
    id: 'wedding-venue',
    area: 'events',
    what: 'barn wedding venue',
    name: 'Hollow Barn',
    offers: [
      ['weekday hire', 'from £3,000'],
      ['Saturday hire', 'from £6,500'],
    ],
  },
  {
    id: 'funeral',
    area: 'sensitive',
    what: 'funeral director',
    name: 'Greene & Daughters',
    offers: [
      ['simple funeral', 'from £2,400'],
      ['direct cremation', '£1,450'],
    ],
  },
  {
    id: 'nightclub',
    area: 'nightlife',
    what: 'nightclub',
    name: 'Basement 45',
    offers: [
      ['entry', '£10'],
      ['booth', 'from £150'],
    ],
  },
]

const BIG = [
  'London',
  'Paris',
  'New York',
  'Berlin',
  'Toronto',
  'Sydney',
  'Madrid',
  'Amsterdam',
  'Dublin',
  'Melbourne',
  'Chicago',
  'Lisbon',
]
const SMALL = [
  'Hay-on-Wye',
  'Hallstatt',
  'Český Krumlov',
  'Ludlow',
  'Tobermory',
  'Kinsale',
  'Bled',
  'Colmar',
  'Sintra',
  'Stowe',
  'Whitby',
  'Giethoorn',
]
const TONES = [
  'warm and friendly',
  'premium and minimal',
  'bold and playful',
  'calm and serious',
  'old-fashioned and trustworthy',
]

type Way = 'word' | 'normal' | 'detailed' | 'messy' | 'tone'
const WAYS: Way[] = ['word', 'normal', 'detailed', 'messy', 'tone']

const cap = (x: string) => `${x[0]?.toUpperCase() ?? ''}${x.slice(1)}`

function brief(k: Kind, i: number, way: Way, n: number): Brief {
  // Places rotate by kind and way, so every kind meets a big city, a small town and no place.
  const placeKind = (i + n) % 3
  const town =
    placeKind === 0
      ? BIG[(i + n) % BIG.length]
      : placeKind === 1
        ? SMALL[(i * 2 + n) % SMALL.length]
        : ''
  const where = town ? ` in ${town}` : ''
  const [o1, o2] = k.offers
  const words = {
    word: k.what,
    normal: `${cap(k.what)}${where}`,
    detailed: `${k.name}, ${/^[aeiou]/i.test(k.what) ? 'an' : 'a'} ${k.what}${where}. ${cap(o1?.[0] ?? '')} ${o1?.[1]}, ${o2?.[0]} ${o2?.[1]}. Open Monday to Saturday 9 to 5. Call 0161 496 0${String(100 + i).slice(-3)}.`,
    messy: `need a website for my ${k.what}${town ? ` its in ${town.toLowerCase()}` : ''} we do ${o1?.[0]} and ${o2?.[0]} pls make it look good`,
    tone: `${k.name}, ${k.what}${where}. Make it feel ${TONES[i % TONES.length]}.`,
  }[way]
  return {
    id: `w-${k.id}-${way}`,
    words,
    tags: [k.area, way, town ? (BIG.includes(town) ? 'city' : 'small-town') : 'no-place', 'wide'],
  }
}

/** Each kind in three of the five ways, rotating so every way is used about equally. */
const generated: Brief[] = KINDS.flatMap((k, i) =>
  [0, 2, 4].map((step, n) => brief(k, i, WAYS[(i + step) % WAYS.length] as Way, n)),
)

/** Hand-written: other languages, which the generator cannot do. */
const LANGUAGES: Brief[] = [
  {
    id: 'w-fr-boulangerie',
    words: 'Boulangerie artisanale à Lyon, pain au levain et viennoiseries',
    tags: ['food', 'french', 'city', 'wide'],
  },
  {
    id: 'w-es-taller',
    words: 'Taller de bicicletas en Sevilla, reparaciones rápidas',
    tags: ['trades', 'spanish', 'city', 'wide'],
  },
  {
    id: 'w-it-agriturismo',
    words: 'Agriturismo in Toscana vicino a Montepulciano, camere e cucina di casa',
    tags: ['stay', 'italian', 'small-town', 'wide'],
  },
  {
    id: 'w-de-zahnarzt',
    words: 'Zahnarztpraxis in Hamburg, Familienzahnmedizin und Prophylaxe',
    tags: ['health', 'german', 'city', 'wide'],
  },
  {
    id: 'w-nl-kapper',
    words: 'Kapsalon in Haarlem, knippen zonder afspraak',
    tags: ['salon', 'dutch', 'city', 'wide'],
  },
  {
    id: 'w-pt-restaurante',
    words: 'Restaurante de peixe na Nazaré, grelhados e caldeirada',
    tags: ['food', 'portuguese', 'small-town', 'wide'],
  },
  {
    id: 'w-pl-przedszkole',
    words: 'Przedszkole w Gdańsku, małe grupy i zajęcia po angielsku',
    tags: ['education', 'polish', 'city', 'wide'],
  },
  {
    id: 'w-cs-obec',
    words: 'Obecní úřad Lednice, webové stránky pro občany',
    tags: ['civic', 'czech', 'small-town', 'wide'],
  },
  {
    id: 'w-sv-cafe',
    words: 'Kafé i Visby med kanelbullar och hembakat bröd',
    tags: ['food', 'swedish', 'small-town', 'wide'],
  },
  {
    id: 'w-tr-berber',
    words: 'İstanbul Kadıköy’de berber, sakal tıraşı ve saç kesimi',
    tags: ['salon', 'turkish', 'city', 'wide'],
  },
  {
    id: 'w-ja-izakaya',
    words: '大阪の居酒屋、焼き鳥と地酒',
    tags: ['food', 'japanese', 'city', 'wide'],
  },
  {
    id: 'w-uk-pekarnia',
    words: 'Пекарня у Львові, хліб на заквасці та кава',
    tags: ['food', 'ukrainian', 'city', 'wide'],
  },
  {
    id: 'w-el-taverna',
    words: 'Ταβέρνα στη Νάξο, φρέσκο ψάρι και σπιτικά φαγητά',
    tags: ['food', 'greek', 'small-town', 'wide'],
  },
  {
    id: 'w-hu-fodrasz',
    words: 'Fodrászat Budapesten, festés és vágás',
    tags: ['salon', 'hungarian', 'city', 'wide'],
  },
  {
    id: 'w-ro-cabinet',
    words: 'Cabinet stomatologic în Cluj-Napoca, implanturi și ortodonție',
    tags: ['health', 'romanian', 'city', 'wide'],
  },
]

export const WIDE: Brief[] = [...generated, ...LANGUAGES]
