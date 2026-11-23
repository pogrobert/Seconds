// What to suggest next, above the message box (the chips were the same five
// for every site). Code reads the site as it stands and picks up to three from a small pool, so
// they cost no model call and no time. Two kinds: a change that is sent as it is ("Less text"),
// and a missing fact that starts a message for the owner to finish ("Opening hours: ").

import type { BuildResult } from './server/build'

export type Suggested = { label: string; text: string; send: boolean }

/** Places whose own language is worth offering, by a word in the owner's messages. */
const LANGUAGES: [RegExp, string][] = (
  [
    ['Portuguese', 'portugal|porto|lisbon|lisboa|brazil|brasil|são paulo'],
    ['Spanish', 'spain|españa|madrid|barcelona|seville|valencia|mexico|buenos aires|bogotá'],
    ['French', 'france|paris|lyon|marseille|bordeaux|montréal|quebec'],
    [
      'German',
      'germany|deutschland|berlin|munich|münchen|hamburg|vienna|wien|austria|zurich|zürich',
    ],
    ['Italian', 'italy|italia|rome|roma|milan|milano|florence|firenze|naples|napoli|turin'],
    ['Polish', 'poland|polska|kraków|krakow|warsaw|warszawa|gdańsk|wrocław'],
    ['Dutch', 'netherlands|amsterdam|rotterdam|utrecht|antwerp|ghent'],
    ['Danish', 'denmark|copenhagen|københavn|aarhus'],
    ['Swedish', 'sweden|stockholm|gothenburg|malmö'],
    ['Norwegian', 'norway|oslo|bergen'],
    ['Japanese', 'japan|tokyo|kyoto|osaka'],
    ['Indonesian', 'bali|ubud|indonesia|jakarta'],
    ['Greek', 'greece|athens|thessaloniki'],
    ['Turkish', 'türkiye|istanbul|ankara'],
    ['Armenian', 'armenia|yerevan'],
  ] as const
).map(([lang, words]) => [
  // Letters on both sides, not \b: \b misreads ó and ü as word ends.
  new RegExp(`(?<!\\p{L})(${words})(?!\\p{L})`, 'iu'),
  lang,
])

/** The site's language, judged roughly from its words: English if the common words are. */
const looksEnglish = (text: string) =>
  (text.toLowerCase().match(/\b(the|and|with|for|our|you|your|we)\b/g) ?? []).length >= 3

export function suggestionsFor(
  r: BuildResult,
  { canUndo, said }: { canUndo: boolean; said: string[] },
): Suggested[] {
  const s = r.state
  const out: Suggested[] = []
  const add = (label: string, send = true, text = label) => out.push({ label, text, send })

  if (canUndo) add('Undo that')
  if (s) {
    const c = s.copy
    // One missing fact, the one a visitor most often looks for first.
    if (!c.contact.hours) add('Add opening hours', false, 'Opening hours: ')
    else if (!c.contact.phone && !c.contact.email) add('Add contact details', false, 'Phone: ')
    else if (c.offer.items.length > 0 && c.offer.items.every((x) => !x.price))
      add('Add prices', false, 'Prices: ')

    const pageText = [c.headline, c.subhead, c.about].join(' ')
    // The place named first is where it is based ("in Kraków, shooting across Poland and Italy").
    const where = `${s.words} ${c.contact.place}`
    const place = LANGUAGES.map(([re, lang]) => ({ lang, at: where.search(re) }))
      .filter((x) => x.at >= 0)
      .sort((a, b) => a.at - b.at)[0]
    // Only from English: once it is in another language, "back to English" would just undo it.
    if (place && looksEnglish(pageText)) add(`Write it in ${place.lang}`)

    if (r.photoJob || (s.shown?.length ?? 0) > 0) add('Different photos')
    add(s.brandName ? 'Calmer colours' : 'Add some colour')
    if (!s.extras.includes('faq')) add('Add a FAQ')
    if (c.about.length > 240 || c.faq.length > 4) add('Less text')
    add('Make it feel more premium')
  } else {
    add('Different photos')
    add('Warmer colours')
    add('Less text')
  }

  // Nothing already asked for; three fit the chat column's width.
  const used = new Set(said.map((x) => x.trim().toLowerCase()))
  return out
    .filter((x) => x.text === 'Undo that' || !used.has(x.text.trim().toLowerCase()))
    .slice(0, 3)
}
