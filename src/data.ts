export interface CastMember {
  id: string;
  name: string;
  heroTitle: string;
  rosterBadge: string;
  deliveryBadge: string;
  accentHex: string;
  avatarSrc: string;
  greeting: string;
  coffeePlaceholder: string;
}

export interface VibeOption {
  id: 'west_coast_getaway' | 'sweet_spot_hybrid' | 'early_family_christmas';
  icon: string;
  badge: string;
  title: string;
  shortLabel: string;
  description: string;
}

export interface ActivityOption {
  id: string;
  title: string;
  windowLabel: string;
  windowTone: 'adult-friday' | 'family-morning' | 'twinkle-afternoon';
  summary: string;
}

export interface NaughtyListOption {
  id: string;
  icon: string;
  grinchTitle: string;
  label: string;
}

export const BARCLAY_MASCOT = {
  name: 'Barclay ("Super El Niño")',
  rosterBadge: 'Beanbag Connoisseur & Toddler Heatwave (~16m)',
  avatarSrc: './assets/avatar-barclay.jpg',
  blurb:
    'Still happily licking orange cornhole beanbags! At Cridge daycare Fri Dec 11 (8am–5pm); naps 12–2pm & tucks in ~7pm Sat/Sun while GOTY Cathy tries to keep up!',
};

export const CAST_MEMBERS: CastMember[] = [
  {
    id: 'pedro',
    name: 'Pedro',
    heroTitle: 'Lake Angler · #10 Messi Fan & Woodworker',
    rosterBadge: 'Ottawa Lake Fisherman & Reformed Talking-Tree Skeptic',
    deliveryBadge: '🪷 Delivered via Lake Lily Pad',
    accentHex: '#1E5AA8',
    avatarSrc: './assets/avatar-pedro.jpg',
    greeting:
      'Special Lily-Pad Tree-Mail for Pedro! Okay, Markus was right—the trees really DO talk to each other! Woody Claws has morning crosswords, Island woodworkers, and #10 Messi & Argentina highlights queued up for your West Coast arrival.',
    coffeePlaceholder: 'e.g., Dark roast coffee, yerba mate, biscotti, crunchy afternoon snacks...',
  },
  {
    id: 'cathy',
    name: 'Cathy',
    heroTitle: 'GOTY · Sizzler Daredevil & Rose Gardener',
    rosterBadge: 'Grandma of the Year & Woody Claws’ #1 Muse',
    deliveryBadge: '🌹 Delivered via Ottawa Prize Rose',
    accentHex: '#C9425A',
    avatarSrc: './assets/avatar-cathy.jpg',
    greeting:
      'Ever since your fearless June Sizzler Slide scream lit an ember in Woody Claws’ driftwood heart, the whole forest has been awaiting GOTY’s return! Your kitchen apron & dish sponge are 100% retired Dec 10–14 while Markus cooks—you’re strictly on Barclay toddler-wrangling, storybooks & ice-cream duty!',
    coffeePlaceholder: 'e.g., Morning tea or oat latte, shortbread, fresh bakery pastry...',
  },
  {
    id: 'tommy',
    name: 'Tommy',
    heroTitle: 'Coach Tom · Sideline & Cornhole Taskmaster',
    rosterBadge: 'U14 Football Coach & Multi-Screen NFL Strategist',
    deliveryBadge: '🌼 Delivered via Sideline Dandelion',
    accentHex: '#1B5E3A',
    avatarSrc: './assets/avatar-tommy.jpg',
    greeting:
      'Sideline Dandelion Audible from B.C.! Multi-screen December NFL streams, tabletop games, cornhole rematches against beanbag-chewing Barclay, and surviving Hurricane Tricia + Super El Niño in the same living room!',
    coffeePlaceholder: 'e.g., Cold brew / espresso, NFL game-day snacks, dark chocolate...',
  },
  {
    id: 'tricia',
    name: 'Tricia',
    heroTitle: 'Hurricane Tricia · Category-5 Family Joy',
    rosterBadge: 'Victoria Host & Bundle of Happy Spills',
    deliveryBadge: '🌲 Relayed via Backyard Cedar',
    accentHex: '#D9483B',
    avatarSrc: './assets/avatar-tricia.jpg',
    greeting:
      'The backyard cedars overheard your Category-5 excitement and tipped off Woody Claws! Ready to have Pedro, Cathy & Tommy under one roof (hide the coasters and brace for joyful spills!).',
    coffeePlaceholder: 'e.g., Oat latte, mandarins, dark chocolate oranges, sparkling water...',
  },
  {
    id: 'markus',
    name: 'Markus',
    heroTitle: 'Victoria Host Chef & Tree-Whisperer',
    rosterBadge: 'Pampering Kitchen Host & Mycelial Vindication',
    deliveryBadge: '🌲 Relayed via Fungal Root-Phone',
    accentHex: '#2B6E84',
    avatarSrc: './assets/avatar-markus.jpg',
    greeting:
      'Officially vindicated on the talking-tree network! Skillets hot, espresso pulling, keeping Cathy 100% out of the dish pit, and teaming up with Woody Claws to get the West Coast in tip-top shape.',
    coffeePlaceholder: 'e.g., Double espresso, warm cinnamon rolls, crisp apples...',
  },
];

export const VIBE_OPTIONS: VibeOption[] = [
  {
    id: 'west_coast_getaway',
    icon: '🌊',
    badge: 'Option 1 · Save Christmas & Stockings 100% for Ottawa',
    title: 'Loosely Festive West Coast Trip (Save Christmas & Stockings 100% for Ottawa!)',
    shortLabel: 'Option 1: Loosely Festive West Coast Trip (Save Xmas & Stockings 100% for Ottawa)',
    description:
      'Twinkle lights, ocean walks, great home dinners & games—zero "Christmas Eve/Day" labels and zero gifts or stockings to pack so Dec 25 back in Ottawa keeps 100% of the Christmas magic.',
  },
  {
    id: 'sweet_spot_hybrid',
    icon: '✨',
    badge: 'Option 2 · Zero Adult Gifts + Festive Dinner & Toddler Magic',
    title: 'Sweet-Spot Hybrid (Save Adult Stockings for Ottawa + Festive Dinner & Toddler Magic)',
    shortLabel: 'Option 2: Sweet-Spot Hybrid (Ottawa Adult Stockings + Festive Dinner & Barclay Treat)',
    description:
      'Keep adult stockings & Christmas Morning sacred for Dec 25 in Ottawa (zero adult gifts to pack!), while enjoying one festive candlelit Victoria dinner + watching Barclay open a tiny board book or toddler treat.',
  },
  {
    id: 'early_family_christmas',
    icon: '🎄',
    badge: 'Option 3 · Celebrate Early Christmas All Together',
    title: 'Full "Early Family Christmas" Together (+ Carry-On Stocking Ring)',
    shortLabel: 'Option 3: Full Early Family Christmas (+ $35–$50 Carry-On Stocking Ring)',
    description:
      'Celebrate an early family Christmas while all 6 of us are together—do a cozy pajama stocking morning ($35–$50 carry-on Secret Stocking Ring, assigned privately once votes are in!) + marquee holiday feast.',
  },
];

export const FRIDAY_ADULT_OPTIONS: ActivityOption[] = [
  {
    id: 'adult_friday_lunch',
    title: '🍽️ Lingering Oceanview or Inner Harbour Adult Sit-Down Lunch',
    windowLabel: 'Fri Dec 11 · Unhurried 5-Adult Table',
    windowTone: 'adult-friday',
    summary:
      'Oak Bay oceanfront or Inner Harbour restaurant—zero highchair timer, clinking glasses & relaxed adult conversation while Barclay is at Cridge daycare.',
  },
  {
    id: 'havn_floating_sauna',
    title: '🧖 HAVN Floating Harbour Cedar Sauna & Hot Tub Ship (19+)',
    windowLabel: 'Fri Dec 11 · Inner Harbour Barge (19+)',
    windowTone: 'adult-friday',
    summary:
      'Restored 1943 ship barge in the Inner Harbour with aromatic cedar saunas, steaming outdoor mineral tubs & harbour seaplane views.',
  },
  {
    id: 'craigdarroch_castle',
    title: '🏰 Craigdarroch Castle Victorian Trim & Woodwork Tour',
    windowLabel: 'Fri Dec 11 · 10:00 AM – 4:30 PM',
    windowTone: 'adult-friday',
    summary:
      '1890 Scottish baronial mansion decked in holiday greenery & hand-carved oak woodwork—87 stairs & no strollers allowed, making Friday ideal!',
  },
  {
    id: 'oak_bay_coffee_stroll',
    title: '☕ Unscripted Oak Bay / Dallas Rd Coffee, Bookshop & Seaside Stroll',
    windowLabel: 'Fri Dec 11 · Zero Reservations',
    windowTone: 'adult-friday',
    summary:
      'Zero reservations or clock-watching—hot drinks, crisp sea air, independent bookshops & an easy seaside cafe stop.',
  },
];

export const WEEKEND_OUTING_OPTIONS: ActivityOption[] = [
  {
    id: 'butchart_lights',
    title: '✨ The Magic of Christmas at Butchart Gardens + Heated Rose Carousel',
    windowLabel: 'Sat or Sun · 3:30–5:45 PM Dusk Twinkle',
    windowTone: 'twinkle-afternoon',
    summary:
      '300,000+ twinkling lights at dusk, Twelve Days of Christmas displays, steaming hot cocoa & indoor heated carousel rides with Barclay.',
  },
  {
    id: 'moss_street_ocean_walk',
    title: '🪵 Moss Street Yuletide Market + Dallas Rd Winter Ocean Walk',
    windowLabel: 'Sat or Sun · 10:00–11:30 AM Morning',
    windowTone: 'family-morning',
    summary:
      'Local Vancouver Island woodworkers & holiday artisans in Fairfield + a crisp flat seaside walk by the Breakwater.',
  },
  {
    id: 'gingerbread_showcase',
    title: '🏠 18th Annual Giant Gingerbread Showcase & Festival of Trees',
    windowLabel: 'Sat or Sun Morning · Warm, Indoor & Stroller-Easy',
    windowTone: 'family-morning',
    summary:
      'Towering architectural gingerbread creations right by the Inner Harbour + sparkling decorated holiday trees before noon nap.',
  },
  {
    id: 'downtown_horse_trolley',
    title: '🐎 Downtown Free Horse-Drawn Trolley + Bastion Square Market (& Sat 1pm Holiday Tubas!)',
    windowLabel: 'Sat or Sun Afternoon · Sleigh-Bell Downtown',
    windowTone: 'twinkle-afternoon',
    summary:
      'Classic sleigh-bell trolley ride + local holiday market (plus Tuba Christmas brass choir in Market Square on Saturday at 1:00 PM!).',
  },
  {
    id: 'hatley_castle_grounds',
    title: '🏰 Hatley Castle Holiday Grounds & Optional Tally Ho Horse Carriage',
    windowLabel: 'Sat or Sun · 2:30–4:30 PM Post-Nap',
    windowTone: 'twinkle-afternoon',
    summary:
      'Storybook oceanfront castle gardens & old-growth evergreens with an optional private horse carriage.',
  },
];

export const NAUGHTY_LIST_OPTIONS: NaughtyListOption[] = [
  {
    id: 'early_alarms',
    icon: '⏰',
    grinchTitle: 'Early Alarms',
    label: 'Rushed mornings or alarms before hot coffee & pastries',
  },
  {
    id: 'hangry_late_meals',
    icon: '🍽️',
    grinchTitle: 'Hangry Late Dinners (Past 7pm)',
    label: 'Waiting past 7:00 PM hungry without snacks or a dinner plan',
  },
  {
    id: 'overpacked_schedule',
    icon: '🛋️',
    grinchTitle: 'Over-Packed Schedule (Zero Couch/Book Time)',
    label: 'Back-to-back outings with zero fireside book, nap, or lounge time',
  },
  {
    id: 'crowds_lines',
    icon: '🎟️',
    grinchTitle: 'Long Lines & Crowds',
    label: 'Standing in long tourist queues instead of easy, cozy spots',
  },
  {
    id: 'stairs_cold_rain',
    icon: '🌧️',
    grinchTitle: 'Cold November/December Rain & Steep Stairs',
    label: 'Too many steep stairs or shivering outside in sideways Island rain',
  },
  {
    id: 'kitchen_dishes_stress',
    icon: '🧽',
    grinchTitle: 'Dish-Pit Duty (Cathy’s Apron Stays Retired!)',
    label: 'Anyone feeling stuck cooking or scrubbing pots (GOTY is on Barclay duty only!)',
  },
  {
    id: 'too_much_driving',
    icon: '🚗',
    grinchTitle: 'Too Much Cross-Town Driving',
    label: 'Too much back-and-forth driving across town in dark winter traffic',
  },
  {
    id: 'missing_games_puzzles',
    icon: '🏈',
    grinchTitle: 'Missing Live NFL, Messi Highlights, or Morning Crosswords',
    label: 'Scheduling over December NFL kickoffs, soccer highlights, or puzzle time',
  },
];

export const PACE_LABELS: Record<number, string> = {
  1: '1 · Pure Couch, Books & Home Feasts',
  2: '2 · Easygoing Lounge + 1 Short Outing a Day',
  3: '3 · Cozy Balance (Home Feasts + Best Island Highlights)',
  4: '4 · Up for Anything Whenever a Window Opens!',
};
