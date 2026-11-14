// Fixed words that blocks show (not content): labels such as "Menu" or "Opening hours".
// One table per language. A block never writes these words itself: it asks for them by key, so a
// site in another language never shows stray English. Missing languages fall back to English.

const en = {
  menu: 'Menu',
  close: 'Close',
  openingHours: 'Opening hours',
  closed: 'Closed',
  openInMaps: 'Open in Maps',
  directions: 'Directions',
  call: 'Call',
  book: 'Book',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  emailAddress: 'Email address',
  signUp: 'Sign up',
  from: 'from',
  priceOnRequest: 'Price on request',
  service: 'Service',
  price: 'Price',
  minutes: 'min',
  hours: 'h',
  per: {
    hour: 'hour',
    session: 'session',
    class: 'class',
    week: 'week',
    month: 'month',
    year: 'year',
    person: 'person',
    item: 'item',
  },
}
export type Strings = typeof en

const ar: Strings = {
  menu: 'القائمة',
  close: 'إغلاق',
  openingHours: 'ساعات العمل',
  closed: 'مغلق',
  openInMaps: 'افتح في الخرائط',
  directions: 'الاتجاهات',
  call: 'اتصل',
  book: 'احجز',
  email: 'البريد الإلكتروني',
  phone: 'الهاتف',
  address: 'العنوان',
  emailAddress: 'البريد الإلكتروني',
  signUp: 'اشترك',
  from: 'من',
  priceOnRequest: 'السعر عند الطلب',
  service: 'الخدمة',
  price: 'السعر',
  minutes: 'د',
  hours: 'س',
  per: {
    hour: 'ساعة',
    session: 'جلسة',
    class: 'حصة',
    week: 'أسبوع',
    month: 'شهر',
    year: 'سنة',
    person: 'شخص',
    item: 'قطعة',
  },
}

const TABLES: Record<string, Strings> = { en, ar }

/** The fixed words for a locale such as "en-GB" or "ar". */
export const strings = (locale: string): Strings => TABLES[locale.split('-')[0] ?? 'en'] ?? en

/** "90" → "1 h 30 min"; "45" → "45 min". */
export function formatDuration(minutes: number, locale: string): string {
  const t = strings(locale)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return [h ? `${h} ${t.hours}` : '', m ? `${m} ${t.minutes}` : ''].filter(Boolean).join(' ')
}
