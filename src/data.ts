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

export interface PetPeeveOption {
  id: string;
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
      'Furry Otter-hood & mystical Airbender robes engaged! Crosswords, Island woodworkers, Messi & Argentina SOCCER pride, and winning Xmas back from Woody Claus!',
    coffeePlaceholder: 'e.g., Morning roast coffee, yerba mate, crunchy snacks...',
  },
  {
    id: 'cathy',
    name: 'Cathy',
    heroTitle: 'GOTY · Grandma of the Year',
    rosterBadge: '#11 · Athena-Librarian Laureate',
    accentHex: '#C9425A',
    avatarSrc: './assets/avatar-cathy.jpg',
    greeting:
      'Welcome GOTY! Your kitchen apron is officially BANNED Dec 10–14—Markus is cooking while you read to Barclay (and politely turn down lovestruck Woody Claus!).',
    coffeePlaceholder: 'e.g., Morning tea or latte, favorite bakery pastry or treat...',
  },
  {
    id: 'tommy',
    name: 'Tommy',
    heroTitle: 'The Game Master',
    rosterBadge: '#12 · U14 Coach & Multi-Screen NFL Ace',
    accentHex: '#1B5E3A',
    avatarSrc: './assets/avatar-tommy.jpg',
    greeting:
      'Coach & Multi-Screen NFL Command HQ is live! Live American football (NFL) streams, original party games, 2x podcasts, holiday cinema, and zero rushing.',
    coffeePlaceholder: 'e.g., Cold brew / espresso, NFL game-day snacks, sparkling water...',
  },
  {
    id: 'tricia',
    name: 'Tricia',
    heroTitle: 'Captain Breathing-Room',
    rosterBadge: '#5 · Guardian of Calm',
    accentHex: '#257BA0',
    avatarSrc: './assets/avatar-tricia.jpg',
    greeting:
      'Nap-Time Sanctuary protected! Cozy West Coast mornings, twinkling lights, and zero weekday chore stress.',
    coffeePlaceholder: 'e.g., Oat latte, favorite holiday chocolate or fruit...',
  },
  {
    id: 'markus',
    name: 'Markus',
    heroTitle: 'Holiday Feast Hero',
    rosterBadge: '#1 · Feast & Hype Captain',
    accentHex: '#2B6E84',
    avatarSrc: './assets/avatar-markus.jpg',
    greeting:
      'Apron locked & loaded! Ready to spoil everyone with zero-stress feasts and top-voted Island adventures.',
    coffeePlaceholder: 'e.g., Double espresso & cinnamon rolls...',
  },
];

export const VERIFIED_VICTORIA_ACTIVITIES: ActivityOption[] = [
  {
    id: 'stocking_morning',
    title: 'Pajama Secret Stocking Reveal, Cinnamon Rolls & GOTY Storytime',
    windowLabel: 'Sat or Sun Morning · Cozy Home',
    windowTone: 'family-morning',
    summary:
      'Slow pajama morning around the tree revealing our 5-Adult Secret Stocking Ring ($35–$50 carry-on treats) + Barclay’s mini-stocking.',
    whyFun: 'Fresh coffee, warm pastries, GOTY picture books, and backyard soccer touches.',
  },
  {
    id: 'butchart_lights',
    title: 'The Magic of Christmas at Butchart Gardens + Rose Carousel',
    windowLabel: 'Sat or Sun 3:30–5:45 PM · With Barclay',
    windowTone: 'twinkle-afternoon',
    summary:
      '300,000+ twinkling Christmas lights at dusk, Twelve Days of Christmas displays, hot cocoa, and indoor heated Carousel rides for Barclay.',
    whyFun: 'Iconic Vancouver Island holiday magic timed cleanly between nap and 7pm bedtime.',
  },
  {
    id: 'adult_friday_lunch',
    title: 'Lingering Oceanview or Harbour Adult Brunch / Lunch',
    windowLabel: 'Fri Dec 11 (8am–5pm) · Adult-Only Window!',
    windowTone: 'adult-friday',
    summary:
      'Barclay is at Cridge daycare all day Friday—our golden window for an unhurried 5-adult sit-down meal (Oak Bay oceanview or Inner Harbour).',
    whyFun: 'Zero toddler highchair timer—just great food, views, and conversation.',
  },
  {
    id: 'pampered_home_feasts',
    title: 'Chef Markus’s Pampered Home Feasts (Cathy 100% Off Duty!)',
    windowLabel: 'Evenings 7:00 PM+ · Cozy Home',
    windowTone: 'cozy-evening',
    summary:
      'West Coast salmon bake, slow-braised comfort dinner, and our marquee Narbaitz Family Christmas Feast while Cathy relaxes.',
    whyFun: 'Barclay eats at 5:30pm and sleeps at 7pm so adults dine in total peace.',
  },
  {
    id: 'gamemaster_football_lounge',
    title: 'Tommy’s Game Master, Multi-Screen Live NFL & Holiday Movie Nights',
    windowLabel: 'Post-7pm Evenings · Cozy Home',
    windowTone: 'cozy-evening',
    summary:
      'Original tabletop/dice games led by Tommy, live Thu/Sat/Sun American football (NFL) multi-screen streams, Pedro’s crossword/Connections & Messi soccer highlights, and a holiday movie.',
    whyFun: 'Maximum laughs in slippers with zero driving in the dark.',
  },
  {
    id: 'moss_street_ocean_walk',
    title: 'Moss Street Holiday Market + Dallas Rd Oceanfront Stroll',
    windowLabel: 'Sat Dec 12 or Sun Dec 13 · 10:00–11:30 AM',
    windowTone: 'family-morning',
    summary:
      'Local Vancouver Island woodworkers, makers, and cider at Fairfield’s festive market, plus a crisp flat seaside walk by the Breakwater.',
    whyFun: 'Tailor-made for woodworking fans, fresh ocean air, and easy stroller rolling.',
  },
  {
    id: 'havn_floating_sauna',
    title: 'HAVN Floating Harbour Sauna & Hot Tub Boat (19+)',
    windowLabel: 'Fri Dec 11 (8am–5pm) · Adult-Only Window!',
    windowTone: 'adult-friday',
    summary:
      'Restored 1943 ship barge in the Inner Harbour with cedar saunas, outdoor hot mineral tubs, and seaplane views.',
    whyFun: 'Pure Nordic coastal relaxation during Friday’s child-free daycare window.',
  },
  {
    id: 'gingerbread_showcase',
    title: '18th Annual Gingerbread Showcase (Hotel Grand Pacific) & Harbour Walk',
    windowLabel: 'Sat or Sun Morning · With Barclay',
    windowTone: 'family-morning',
    summary:
      'Incredible giant architectural gingerbread sculptures ("Where Dreams Come True") right by the Inner Harbour + optional Festival of Trees.',
    whyFun: 'Warm, indoor, whimsical, and super easy before Barclay’s noon nap.',
  },
  {
    id: 'craigdarroch_castle',
    title: 'Craigdarroch Castle Victorian Christmas Tour (87 Oak Stairs)',
    windowLabel: 'Fri Dec 11 (10am–4:30pm) · Adult-Only Window!',
    windowTone: 'adult-friday',
    summary:
      '1890 historic mansion decked in full Victorian Christmas trim and museum-grade oak woodwork (no strollers, so ideal for Friday!).',
    whyFun: 'Spectacular craftsmanship and holiday history for anyone keen to explore.',
  },
  {
    id: 'hatley_or_horse_trolley',
    title: 'Hatley Castle Holiday Grounds OR Downtown Free Horse-Drawn Trolley',
    windowLabel: 'Sat or Sun 2:30–4:30 PM · Post-Nap',
    windowTone: 'twinkle-afternoon',
    summary:
      'Edwardian Hatley Castle & optional Tally Ho carriage ride, OR Unwrap Downtown’s free horse-drawn trolley + Bastion Square Winter Market.',
    whyFun: 'Storybook afternoon holiday charm before heading home for cozy dinner.',
  },
];

export const PET_PEEVE_OPTIONS: PetPeeveOption[] = [
  { id: 'hangry_late_meals', label: 'Waiting past 7:00 PM hungry with no food plan' },
  { id: 'early_alarms', label: 'Early alarms or rushed mornings before coffee' },
  { id: 'overpacked_schedule', label: 'Over-packed schedule with zero reading / couch downtime' },
  { id: 'crowds_lines', label: 'Crowded tourist traps or standing in long lines' },
  { id: 'stairs_cold_rain', label: 'Too many stairs or standing around in cold rain' },
  { id: 'kitchen_dishes_stress', label: 'Anyone feeling stuck cooking or doing dishes all night' },
  { id: 'too_much_driving', label: 'Too much back-and-forth driving in traffic' },
  { id: 'missing_games_puzzles', label: 'Missing big NFL / soccer games or quiet morning puzzle time' },
];

export const PACE_LABELS: Record<number, string> = {
  1: '1 · Pure Cozy Pajamas, Books & Home Feasts',
  2: '2 · Mostly Chill at Home + 1 Easy Outing a Day',
  3: '3 · Balanced Mix of Cozy Home & Island Highlights',
  4: '4 · Up for Exploring Whenever the Window Opens!',
};
