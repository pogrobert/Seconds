// The "Try" row on the first screen (launch, 2026-11-23): short names that rotate a few at a
// time; picking one fills the message box with a detailed prompt the visitor can read and edit
// before sending. Detailed prompts make the best sites (docs/m0/27-editing.md, detailed-prompt
// round). The businesses are made up; every fact in a prompt reaches the page, so none names a
// real business or a real living person. Some are for fun (2026-11-24, Robert: "a side project
// after all, not a B2B startup"): famous fictional places and characters, written from what the
// writer knows of them, and made-up absurd ones whose jokes are in the prompt. They alternate
// with the serious ones; one sits second, so the first set shows it even on a phone.

export type Example = { title: string; prompt: string }

export const EXAMPLES: Example[] = [
  {
    title: 'Ramen bar',
    prompt:
      'A small ramen bar in Glasgow called Tonkotsu Lab. Open Wednesday to Sunday, 5pm to 10pm, walk-ins only. Tonkotsu £13, shoyu £12, vegan miso £12, gyoza £6. Broth simmers for 18 hours. Twelve seats at the counter.',
  },
  {
    title: 'Van der Linde gang',
    prompt: 'A website for Dutch van der Linde and his gang, from Red Dead Redemption 2.',
  },
  {
    title: 'Dog groomer',
    prompt:
      'A mobile dog grooming van in Leeds called Suds & Scissors. We come to your house so your dog never has to travel. Small dogs £35, medium £45, large £60. Bath, brush, trim and nails. Monday to Saturday, book by phone on 0113 496 0721.',
  },
  {
    title: 'Lumon Industries',
    prompt:
      'Lumon Industries, from Severance. Now hiring for Macrodata Refinement. Your outie will never know. Waffle parties for top performers.',
  },
  {
    title: 'Physio clinic',
    prompt:
      'Physio clinic in Leith, Edinburgh, for runners and people recovering from surgery. Three physios. First assessment £65 (60 minutes), follow-ups £50 (45 minutes). Open Mon–Fri 7am–8pm, Saturday 9am–1pm. Call 0131 496 0142.',
  },
  {
    title: 'Krusty Krab',
    prompt: 'The Krusty Krab, home of the Krabby Patty, in Bikini Bottom.',
  },
  {
    title: 'Electrician',
    prompt:
      'Electrician, one-man band, covering Swansea and Gower. NICEIC registered, 20 years in the trade. Rewires, consumer unit upgrades, EV charger installs and landlord certificates (EICR from £150). Free quotes, no callouts after 9pm.',
  },
  {
    title: 'Better Call Saul',
    prompt:
      'Saul Goodman & Associates, attorney at law in Albuquerque, from Better Call Saul. Slip and fall? Wrongly accused? Better call Saul!',
  },
  {
    title: 'Wine bar',
    prompt:
      'Family-run wine bar in Porto, by the river, called Adega da Tia. Small plates and natural wines by the glass from €5. Open Wednesday to Sunday, 6pm to midnight. Live fado on Thursdays at 9pm. My aunt opened it in 1987.',
  },
  {
    title: 'Jurassic Park',
    prompt:
      'Jurassic Park on Isla Nublar: real dinosaurs, brought back to life, opening to visitors soon. What could possibly go wrong?',
  },
  {
    title: 'Coding club',
    prompt:
      'A Saturday morning coding club for kids aged 8–14 at a community centre in Bristol, 10am–12pm in term time. Free, but places must be booked, 20 children at most. Scratch, Python and little robots with micro:bits. Run by volunteers.',
  },
  {
    title: 'Fletcher',
    prompt:
      'Portfolio page for Terence Fletcher, the studio band conductor at Shaffer Conservatory, from Whiplash. Not quite my tempo.',
  },
  {
    title: 'Hair colour',
    prompt:
      'A calm, upmarket hair colour studio in Leith. Unhurried appointments and honest advice. Colour consultations are free, full colour from £95, balayage from £140. Tuesday to Saturday, late nights on Thursday.',
  },
  {
    title: 'Dunder Mifflin',
    prompt:
      'Dunder Mifflin Paper Company, the Scranton branch from The Office. Regional manager: Michael Scott. We sell paper.',
  },
  {
    title: 'Bakery',
    prompt:
      'Artisan sourdough bakery in Hackney, open Thursday to Sunday only, 8am until we sell out. Country loaf £5.50, seeded rye £6, cardamom buns £3.50. Everything is baked overnight in a wood-fired oven.',
  },
  {
    title: 'Los Pollos Hermanos',
    prompt:
      'Los Pollos Hermanos, the fried chicken restaurant in Albuquerque from Breaking Bad. Owner: Gustavo Fring. Ingredients of the finest quality.',
  },
  {
    title: 'Wedding photos',
    prompt:
      'Wedding and portrait photographer based in Kraków, shooting across Poland and in Italy. Weddings from 7,500 PLN, portraits from 600 PLN. Galleries delivered within six weeks. I speak Polish, English and Italian.',
  },
  {
    title: 'Gandalf',
    prompt:
      'A website for Gandalf the Grey, a wizard for hire: fireworks, quests and unexpected parties. Always arrives precisely when he means to.',
  },
  {
    title: 'Plumber',
    prompt:
      'Family-run plumbing company in Bristol with 24/7 emergency callouts. Burst pipes, leaks, boiler repairs and bathroom fitting. Fixed prices quoted before we start. Phone 0117 496 0123.',
  },
  {
    title: 'AFC Richmond',
    prompt:
      'AFC Richmond, the football club from Ted Lasso. Manager: Ted Lasso, from Kansas. Believe.',
  },
  {
    title: 'Pottery classes',
    prompt:
      'A pottery studio in Kyoto offering two-hour beginner wheel classes for ¥6,000, clay and firing included. Small groups of six. Classes in Japanese and English, Tuesday to Sunday, 10am and 2pm.',
  },
  {
    title: 'Haunted B&B',
    prompt:
      'A haunted B&B in York with a resident ghost called Gerald. Rooms from £85, full English included. Gerald does not do Tuesdays. Séance night every Friday.',
  },
  {
    title: 'Climbing gym',
    prompt:
      'A bouldering gym in Sheffield with 200 problems reset every week. Day pass £12, monthly membership £48, shoe hire £4. Beginner sessions on Monday and Wednesday evenings. Café upstairs. Open 7am to 10pm every day.',
  },
  {
    title: 'Retired stormtrooper',
    prompt:
      'A retired stormtrooper now teaching archery in Swindon. Thirty years in the Imperial army and has never once hit a target. Lessons £20 an hour. Helmet optional.',
  },
  {
    title: 'Town council',
    prompt:
      'Website for a small town council in North Yorkshire. Bin collection days, council meetings on the first Tuesday of each month at 7pm in the town hall, allotments, planning notices, and how to contact the town clerk.',
  },
  {
    title: 'My dog Biscuit',
    prompt:
      'A personal website for Biscuit, a very good boy (golden retriever, aged 4). Likes: tennis balls, the postman, cheese. Dislikes: baths. Available for belly rubs daily.',
  },
  {
    title: 'Florist',
    prompt:
      'A florist in Copenhagen with seasonal bouquets from 350 DKK and single stems by the counter. Same-day delivery across the city if you order before noon. Open Monday to Saturday, 9am to 6pm.',
  },
  {
    title: 'Scoops Ahoy',
    prompt:
      'Scoops Ahoy, the ice cream parlour at Starcourt Mall in Hawkins, Indiana, 1985, from Stranger Things. Ahoy, ladies!',
  },
  {
    title: 'Barber',
    prompt:
      'A barber in Leeds called Sharp & Co. Haircuts £18, skin fades £20, beard trims £10, hot towel shave £22. Walk-ins welcome, open Monday to Saturday 9am–6pm, late until 8pm on Thursdays.',
  },
  {
    title: 'Time travel tours',
    prompt:
      'Time travel day trips from London: 1066, ancient Rome and the first moon landing. £299 per trip, packed lunch included. Please do not step on any butterflies.',
  },
  {
    title: 'Jazz trio',
    prompt:
      'A jazz trio — piano, double bass and drums — available for weddings, private parties and corporate events across the south of England. Two 45-minute sets from £1,200. We play standards, swing and bossa nova.',
  },
  {
    title: 'Monsters, Inc.',
    prompt: 'Monsters, Inc., the scream factory in Monstropolis. We scare because we care.',
  },
  {
    title: 'Hostel',
    prompt:
      'A hostel in Lisbon near the old town with a rooftop bar. Dorm beds from €22, private rooms from €60. Free walking tour every morning at 10, shared kitchen, lockers in every room. Reception open 24 hours.',
  },
  {
    title: 'Moon estate agent',
    prompt:
      'An estate agent selling homes on the Moon. Two-bed crater with Earth views from £2m, oxygen included for the first year. Viewings every second Thursday, weather permitting.',
  },
  {
    title: 'Driving school',
    prompt:
      'A driving school in Leeds with five instructors, manual and automatic cars. Lessons £38 an hour, block of ten for £350. Intensive courses before your test. Pick-up from home, college or work.',
  },
  {
    title: 'Volcano lair',
    prompt:
      'Volcano lair to let on a private island. Four bedrooms, a shark tank, a monorail and a big red button (please do not press it). £40,000 a week. Cats welcome, especially white ones.',
  },
  {
    title: 'Food bank',
    prompt:
      'A local food bank in Birmingham. Open Tuesday and Thursday, 10am to 2pm. We need tins, pasta, rice and nappies. Anyone can donate at the door; parcels need a referral from a GP, school or advice centre.',
  },
  {
    title: 'Pawnee Parks',
    prompt:
      'The Pawnee Parks and Recreation Department, Indiana, from Parks and Recreation. Deputy director: Leslie Knope. Treat yo self.',
  },
  {
    title: 'Tattoo studio',
    prompt:
      'A tattoo studio in Brooklyn specialising in fine-line and single-needle work. Two artists, appointments only, closed Mondays. Minimum $150. Deposits secure your booking. Walk-in flash days once a month.',
  },
  {
    title: 'Double R Diner',
    prompt: 'The Double R Diner in Twin Peaks: damn fine coffee and cherry pie, from Twin Peaks.',
  },
  {
    title: 'Yoga studio',
    prompt:
      'A yoga studio in Ubud, Bali, with an open-air shala above the rice fields. Drop-in classes 150k IDR, ten-class pass 1.2m IDR. Vinyasa at 7am, yin at 5pm, every day. Mats and props provided.',
  },
  {
    title: 'Grand Budapest',
    prompt:
      'The Grand Budapest Hotel, high in the mountains of the Republic of Zubrowka. Concierge: Monsieur Gustave H.',
  },
  {
    title: 'Coworking',
    prompt:
      'A coworking space in Lisbon with a rooftop terrace and fast fibre. Day pass €20, monthly hot desk €220, fixed desk €290. Meeting room bookable by the hour. Open 8am to 8pm on weekdays.',
  },
  {
    title: 'Vandelay Industries',
    prompt:
      'Vandelay Industries, importer and exporter, from Seinfeld. Latex goods a speciality. Ask for Art Vandelay.',
  },
  {
    title: 'Vet practice',
    prompt:
      'A vet practice in Galway for dogs, cats and small animals. Vaccinations, neutering, dental care and emergency appointments the same day. Open Monday to Friday 8:30–6:30, Saturday mornings. Two vets and three nurses.',
  },
  {
    title: 'Record shop',
    prompt:
      'A vinyl record shop and listening bar in Lisbon called Rotação. New and second-hand records, mostly jazz, soul and Brazilian. Drinks at the bar while you listen. Open until 2am on Fridays and Saturdays.',
  },
]
