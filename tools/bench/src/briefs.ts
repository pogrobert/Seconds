// The fixed brief set (docs/m0/18-bench.md). Never edit a brief in place: results are compared
// across runs by id, so a changed brief gets a new id. Tags say what each one tests.

export type Brief = {
  id: string
  words: string
  /** What it tests: its kind, and the hard parts (town, language, short, detailed…). */
  tags: string[]
}

export const BRIEFS: Brief[] = [
  // The five M0 kinds, short and detailed.
  { id: 'cafe-short', words: 'A café in Leith', tags: ['cafe', 'short', 'town'] },
  {
    id: 'restaurant-full',
    words:
      'Osteria Nonna, a family Italian restaurant in Bath. Handmade pasta, wood-fired oven, Sunday lunch. Open Tue–Sun 12–10. 14 Walcot Street, BA1 5BG. Book on 01225 555 012. Mains £14–£22.',
    tags: ['restaurant', 'detailed', 'prices', 'town'],
  },
  {
    id: 'salon-short',
    words: 'hair salon, curly hair specialist, Manchester',
    tags: ['salon', 'short', 'town'],
  },
  {
    id: 'barber-full',
    words:
      'Old-school barber in Shoreditch called Fade & Co. Skin fades £25, beard trim £15, hot towel shave £30. Walk-ins welcome, open 9–7 every day except Monday.',
    tags: ['salon', 'detailed', 'prices', 'town'],
  },
  {
    id: 'dentist',
    words: 'A small dental clinic in Leeds, family dentistry and implants, open weekdays 8 to 6',
    tags: ['clinic', 'town'],
  },
  {
    id: 'physio',
    words: 'Sports physiotherapy clinic for runners and cyclists in Cambridge',
    tags: ['clinic', 'town'],
  },
  {
    id: 'plumber',
    words: 'An emergency plumber in Bristol, boilers and leaks, 24 hours',
    tags: ['trades', 'town'],
  },
  { id: 'electrician-short', words: 'electrician', tags: ['trades', 'short'] },
  {
    id: 'roofer',
    words: 'Roofing company in Cork, slate and flat roofs, free quotes, call 021 555 0199',
    tags: ['trades', 'town', 'contact'],
  },
  {
    id: 'yoga',
    words: 'A calm yoga studio in Brighton with small morning classes and a sauna',
    tags: ['fitness', 'town'],
  },
  {
    id: 'boxing-gym',
    words: 'Boxing gym in Glasgow for beginners and fighters, gritty, no frills',
    tags: ['fitness', 'town', 'tone'],
  },

  // Places and civic bodies (real towns, small and large).
  {
    id: 'zamosc-council',
    words: 'Zamość city council website',
    tags: ['civic', 'town', 'landmark'],
  },
  {
    id: 'brno-council',
    words: 'city council website for Brno',
    tags: ['civic', 'town', 'landmark'],
  },
  {
    id: 'small-parish',
    words: 'Parish council for Much Wenlock, Shropshire',
    tags: ['civic', 'small-town'],
  },
  {
    id: 'museum',
    words: 'A small museum of printing in Antwerp with workshops for schools',
    tags: ['culture', 'town'],
  },
  {
    id: 'library',
    words: 'Community library in Hebden Bridge, run by volunteers',
    tags: ['civic', 'small-town'],
  },

  // Any business: kinds the samples never covered.
  {
    id: 'tattoo',
    words: 'A tattoo studio in Glasgow, fine line and blackwork, by appointment',
    tags: ['studio', 'town'],
  },
  {
    id: 'vineyard',
    words: 'Family vineyard near Mikulov in Moravia, tastings on Saturdays, Pálava and Riesling',
    tags: ['food', 'small-town', 'landmark'],
  },
  {
    id: 'law-firm',
    words: 'Employment law firm in Birmingham for workers, not companies',
    tags: ['firm', 'town', 'tone'],
  },
  {
    id: 'architect',
    words: 'Two-person architecture practice in Copenhagen, timber houses',
    tags: ['firm', 'town'],
  },
  {
    id: 'charity',
    words: 'Dog rescue charity in Kent, rehoming and fostering, donations welcome',
    tags: ['charity'],
  },
  { id: 'vet', words: 'Vet practice for cats only, Edinburgh', tags: ['clinic', 'town'] },
  {
    id: 'florist',
    words: 'Florist in Lisbon, wild seasonal bouquets and wedding flowers',
    tags: ['shop', 'town'],
  },
  {
    id: 'bike-shop',
    words: 'Bike repair shop in Utrecht, quick fixes while you wait',
    tags: ['shop', 'town'],
  },
  {
    id: 'bakery',
    words:
      'A family bakery in Lisbon, sourdough and pastéis de nata, open from 7am, Rua da Rosa 45',
    tags: ['food', 'town', 'contact'],
  },
  {
    id: 'piano-teacher',
    words: 'Piano lessons for adults, online and in Oxford',
    tags: ['person', 'town'],
  },
  {
    id: 'b-and-b',
    words: 'B&B in a farmhouse on the Isle of Skye, three rooms, breakfast with eggs from our hens',
    tags: ['stay', 'small-town', 'landmark'],
  },

  // Other languages (sites should come out in English for now; the words are the test).
  {
    id: 'czech-cafe',
    words: 'Kavárna v Olomouci, výběrová káva a domácí dorty',
    tags: ['cafe', 'czech', 'town'],
  },
  {
    id: 'polish-mechanic',
    words: 'Warsztat samochodowy w Krakowie, naprawy i przeglądy',
    tags: ['trades', 'polish', 'town'],
  },
  {
    id: 'german-bakery',
    words: 'Kleine Bäckerei in Freiburg, Sauerteigbrot und Brezeln',
    tags: ['food', 'german', 'town'],
  },
]
