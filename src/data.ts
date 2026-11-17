export interface CastMember {
  id: string;
  name: string;
  heroTitle: string;
  rosterBadge: string;
  accentHex: string;
  avatarSrc: string;
  greeting: string;
  coffeePlaceholder: string;
}

export interface ActivityOption {
  id: string;
  title: string;
  windowLabel: string;
  windowTone: 'adult-friday' | 'family-morning' | 'twinkle-afternoon' | 'cozy-evening';
  summary: string;
  whyFun: string;
}

export interface NaughtyListOption {
  id: string;
  icon: string;
  grinchTitle: string;
  label: string;
}

export const CAST_MEMBERS: CastMember[] = [
  {
    id: 'pedro',
    name: 'Pedro',
    heroTitle: 'The Grand Otter',
    rosterBadge: '#10 · Airbender Puzzler & Soccer Ace',
    accentHex: '#1E5AA8',
    avatarSrc: './assets/avatar-pedro.jpg',
    greeting:
      'Merry Christmas, Grand Otter! Furry otter-hood & mystical Airbender robes engaged for fireside crosswords, Island woodworkers, Messi & Argentina SOCCER cheer, and winning Christmas back from Woody Claus!',
    coffeePlaceholder: 'e.g., Morning roast coffee, yerba mate, holiday biscotti, crunchy snacks...',
  },
  {
    id: 'cathy',
    name: 'Cathy',
    heroTitle: 'GOTY · Grandma of the Year',
    rosterBadge: '#11 · Athena-Librarian Laureate',
    accentHex: '#C9425A',
    avatarSrc: './assets/avatar-cathy.jpg',
    greeting:
      'Merry Christmas, GOTY! By official North Pole decree, your kitchen apron is retired Dec 10–14—Chef Markus is cooking every feast while you read Christmas stories to Barclay (and dodge lovestruck Woody Claus!).',
    coffeePlaceholder: 'e.g., Morning tea or holiday latte, shortbread, bakery pastry...',
  },
  {
    id: 'tommy',
    name: 'Tommy',
    heroTitle: 'The Game Master',
    rosterBadge: '#12 · U14 Coach & Multi-Screen NFL Ace',
    accentHex: '#1B5E3A',
    avatarSrc: './assets/avatar-tommy.jpg',
    greeting:
      'Merry Christmas, Game Master! Sleigh-Bell NFL Command HQ is ready—multi-screen December American football (NFL) streams, holiday tabletop games, classic Christmas cinema, and zero rushing!',
    coffeePlaceholder: 'e.g., Cold brew / espresso, NFL game-day snacks, peppermint bark...',
  },
  {
    id: 'tricia',
    name: 'Tricia',
    heroTitle: 'Captain Breathing-Room',
    rosterBadge: '#5 · Guardian of Silent Nights',
    accentHex: '#257BA0',
    avatarSrc: './assets/avatar-tricia.jpg',
    greeting:
      'Silent-Night Sanctuary active! Unhurried pajama Christmas mornings, twinkling lights, and cozy fireside breathing room.',
    coffeePlaceholder: 'e.g., Holiday oat latte, dark chocolate oranges, mandarins...',
  },
  {
    id: 'markus',
    name: 'Markus',
    heroTitle: 'Holiday Feast Hero',
    rosterBadge: '#1 · Chief Christmas Elf & Chef',
    accentHex: '#2B6E84',
    avatarSrc: './assets/avatar-markus.jpg',
    greeting:
      'Christmas apron tied & sleigh bells ringing! Ready to spoil the whole family with crackling-hearth feasts and top-wished Island magic.',
    coffeePlaceholder: 'e.g., Double espresso & warm cinnamon rolls...',
  },
];

export const VERIFIED_VICTORIA_ACTIVITIES: ActivityOption[] = [
  {
    id: 'stocking_morning',
    title: 'Pajama Secret Stocking Reveal, Warm Cinnamon Rolls & GOTY Storytime',
    windowLabel: 'Sat or Sun Morning · Cozy Fireside',
    windowTone: 'family-morning',
    summary:
      'Slow pajama morning around the Christmas tree unwrapping our 5-Adult Secret Stocking Ring ($35–$50 carry-on treasures) + Chief Elf Barclay’s mini-stocking.',
    whyFun: 'Fresh coffee, warm frosted pastries, GOTY Christmas storybooks, and backyard soccer touches.',
  },
  {
    id: 'butchart_lights',
    title: 'The Magic of Christmas at Butchart Gardens + Rose Carousel',
    windowLabel: 'Sat or Sun 3:30–5:45 PM · Twinkle Walk w/ Barclay',
    windowTone: 'twinkle-afternoon',
    summary:
      '300,000+ twinkling Christmas lights at dusk, Twelve Days of Christmas displays, steaming hot cocoa, and indoor heated Carousel rides for Barclay.',
    whyFun: 'Pure Vancouver Island Christmas wonderland timed gently between nap and 7pm bedtime.',
  },
  {
    id: 'adult_friday_lunch',
    title: 'Festive Oceanview or Inner Harbour Adult Christmas Lunch',
    windowLabel: 'Fri Dec 11 (8am–5pm) · Golden Adult-Only Window!',
    windowTone: 'adult-friday',
    summary:
      'Barclay is at Cridge daycare all day Friday—our golden Christmas gift of an unhurried 5-adult sit-down feast (Oak Bay oceanview or Inner Harbour).',
    whyFun: 'Zero toddler highchair timer—just clinking glasses, holiday cheer, and ocean views.',
  },
  {
    id: 'pampered_home_feasts',
    title: 'Chef Markus’s Candlelit Christmas Home Feasts (Cathy 100% Pampered!)',
    windowLabel: 'Evenings 7:00 PM+ · By the Christmas Tree',
    windowTone: 'cozy-evening',
    summary:
      'West Coast cedar-plank salmon, slow-braised winter comfort dinner, and our marquee Narbaitz Family Christmas Feast while Cathy relaxes by the tree.',
    whyFun: 'Barclay eats at 5:30pm and tucks in at 7pm so the adults dine in warm holiday peace.',
  },
  {
    id: 'gamemaster_football_lounge',
    title: 'Tommy’s Reindeer Games, Multi-Screen Live NFL & Christmas Movie Nights',
    windowLabel: 'Post-7pm Evenings · Slippers & Eggnog HQ',
    windowTone: 'cozy-evening',
    summary:
      'Festive tabletop/dice games hosted by Tommy, live Thu/Sat/Sun December NFL football streams, Pedro’s crosswords & Messi soccer highlights, and a Christmas classic.',
    whyFun: 'Maximum belly laughs in Christmas slippers with zero driving in the dark.',
  },
  {
    id: 'moss_street_ocean_walk',
    title: 'Moss Street Yuletide Market + Dallas Rd Winter Ocean Stroll',
    windowLabel: 'Sat Dec 12 or Sun Dec 13 · 10:00–11:30 AM',
    windowTone: 'family-morning',
    summary:
      'Local Vancouver Island woodworkers, holiday artisans, and hot mulled cider at Fairfield’s festive market, plus a crisp flat seaside walk by the Breakwater.',
    whyFun: 'Tailor-made for master woodworkers, brisk sea air, and easy stroller rolling.',
  },
  {
    id: 'havn_floating_sauna',
    title: 'HAVN Floating Harbour Cedar Sauna & Hot Tub Ship (19+)',
    windowLabel: 'Fri Dec 11 (8am–5pm) · Golden Adult-Only Window!',
    windowTone: 'adult-friday',
    summary:
      'Restored 1943 ship barge in the festive Inner Harbour with aromatic cedar saunas, steaming outdoor mineral tubs, and seaplane views.',
    whyFun: 'Pure Nordic winter warmth during Friday’s child-free daycare window.',
  },
  {
    id: 'gingerbread_showcase',
    title: '18th Annual Giant Gingerbread Showcase & Festival of Trees',
    windowLabel: 'Sat or Sun Morning · Cozy Indoor Wonder',
    windowTone: 'family-morning',
    summary:
      'Towering architectural gingerbread masterpieces ("Where Dreams Come True") right by the Inner Harbour + sparkling decorated Christmas trees.',
    whyFun: 'Warm, cinnamon-scented indoor holiday magic before Barclay’s noon nap.',
  },
  {
    id: 'craigdarroch_castle',
    title: 'Craigdarroch Castle Victorian Christmas Trim & Woodwork Tour',
    windowLabel: 'Fri Dec 11 (10am–4:30pm) · Golden Adult-Only Window!',
    windowTone: 'adult-friday',
    summary:
      '1890 Scottish baronial castle decked inauthentic Victorian holly, wreaths, and museum-grade hand-carved oak woodwork (87 stairs, no strollers—ideal for Friday!).',
    whyFun: 'Old-world Christmas craftsmanship for anyone keen to explore.',
  },
  {
    id: 'hatley_or_horse_trolley',
    title: 'Hatley Castle Holiday Grounds OR Downtown Jingle-Bell Horse Trolley',
    windowLabel: 'Sat or Sun 2:30–4:30 PM · Post-Nap Sleigh Vibes',
    windowTone: 'twinkle-afternoon',
    summary:
      'Storybook Hatley Castle & optional Tally Ho carriage ride, OR Unwrap Downtown’s free horse-drawn Christmas trolley + Bastion Square Yuletide Market.',
    whyFun: 'Classic sleigh-bell afternoon charm before heading home for hot dinner.',
  },
];

export const NAUGHTY_LIST_OPTIONS: NaughtyListOption[] = [
  {
    id: 'early_alarms',
    icon: '⏰',
    grinchTitle: 'The Crack-of-Dawn Rooster Elf',
    label: 'Early alarms or rushed mornings before hot coffee & pastries',
  },
  {
    id: 'hangry_late_meals',
    icon: '🍽️',
    grinchTitle: 'The Rumbling-Belly Grinch',
    label: 'Waiting past 7:00 PM hungry without snacks or a dinner plan',
  },
  {
    id: 'overpacked_schedule',
    icon: '🛋️',
    grinchTitle: 'Runaway Sleigh Whiplash',
    label: 'Over-packed schedule with zero fireside book, nap, or couch time',
  },
  {
    id: 'crowds_lines',
    icon: '🎟️',
    grinchTitle: 'Frostbitten Velvet-Rope Lines',
    label: 'Standing in long tourist queues instead of cozy holiday magic',
  },
  {
    id: 'stairs_cold_rain',
    icon: '🌧️',
    grinchTitle: 'Soggy Mittens & Steep Stairs',
    label: 'Too many stairs or shivering outside in cold December rain',
  },
  {
    id: 'kitchen_dishes_stress',
    icon: '🧽',
    grinchTitle: 'The Midnight Dish-Sink Gremlin',
    label: 'Anyone feeling stuck cooking or scrubbing pots all night',
  },
  {
    id: 'too_much_driving',
    icon: '🚗',
    grinchTitle: 'Gridlock Reindeer Traffic',
    label: 'Too much back-and-forth driving across town in dark traffic',
  },
  {
    id: 'missing_games_puzzles',
    icon: '🏈',
    grinchTitle: 'Fumbled Kickoffs & Unfinished Crosswords',
    label: 'Missing live NFL games, Messi soccer highlights, or morning puzzle time',
  },
];

export const PACE_LABELS: Record<number, string> = {
  1: '1 · Pure Yule Log Mode (Pajamas, Storybooks & Home Feasts)',
  2: '2 · Silent Night Chill + 1 Easy Twinkle Outing a Day',
  3: '3 · Classic Christmas Mix (Fireside Cozy + Island Magic)',
  4: '4 · Full Sleigh-Bell Spirit Whenever the Window Opens!',
};
