export interface CastMember {
  id: 'pedro' | 'cathy' | 'tom';
  name: string;
  avatarSrc: string;
  coffeePlaceholder: string;
}

export interface VibeOption {
  id: 'west_coast_getaway' | 'sweet_spot_hybrid' | 'early_family_christmas';
  tabNum: string;
  tabTitle: string;
  tabSub: string;
  badge: string;
  title: string;
  shortLabel: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  sceneCaption: string;
}

export interface SliderDimension {
  id: 'adventureVsRelax' | 'indoorsVsOutdoors' | 'familiarVsNew';
  title: string;
  leftLabel: string;
  rightLabel: string;
  scaleLabels: Record<number, string>;
}

export interface FridayVibeOption {
  id: string;
  title: string;
  summary: string;
}

export const CAST_MEMBERS: CastMember[] = [
  {
    id: 'pedro',
    name: 'Pedro',
    avatarSrc: './assets/avatar-pedro.jpg',
    coffeePlaceholder: '',
  },
  {
    id: 'cathy',
    name: 'Cathy',
    avatarSrc: './assets/avatar-cathy.jpg',
    coffeePlaceholder: '',
  },
  {
    id: 'tom',
    name: 'Tom',
    avatarSrc: './assets/avatar-tommy.jpg',
    coffeePlaceholder: '',
  },
];

export const VIBE_OPTIONS: VibeOption[] = [
  {
    id: 'west_coast_getaway',
    tabNum: 'Option 1',
    tabTitle: 'Low-Key',
    tabSub: 'Subtle festive',
    badge: 'Option 1 · Low-Key Festive',
    title: 'Loosely Festive West Coast Getaway',
    shortLabel: 'Option 1: Loosely Festive West Coast Getaway (Save Christmas for Ottawa)',
    description:
      'Cozy sweaters, subtle twinkle lights, ocean walks, and great home dinners — saving full Christmas and stockings 100% for Ottawa on Dec 25.',
    imageSrc: './assets/vibe-option-1.jpg',
    imageAlt:
      'Comic scene of the family in cozy winter sweaters relaxing by the fireplace in Victoria with subtle twinkle lights on the mantel and misty ocean outside',
    sceneCaption:
      'Option 1: Cozy sweaters, fireplace & subtle twinkle lights — saving full Christmas for Ottawa.',
  },
  {
    id: 'sweet_spot_hybrid',
    tabNum: 'Option 2',
    tabTitle: 'Sweet Spot',
    tabSub: 'Dinner + book',
    badge: 'Option 2 · The Sweet Spot',
    title: 'Festive Dinner + A Little Holiday Magic',
    shortLabel: 'Option 2: Sweet-Spot Hybrid (Festive Dinner + One Small Treat for Barclay)',
    description:
      'Holiday sweaters, a glowing tree, one special festive dinner, and watching Barclay open a small storybook — while keeping Christmas morning sacred for Ottawa.',
    imageSrc: './assets/vibe-option-2.jpg',
    imageAlt:
      'Comic scene of the family in festive holiday sweaters gathered around a candlelit Victoria holiday dinner with a lit Christmas tree while Barclay opens a storybook',
    sceneCaption:
      'Option 2: Glowing tree, candlelit holiday dinner & watching Barclay open one little storybook.',
  },
  {
    id: 'early_family_christmas',
    tabNum: 'Option 3',
    tabTitle: 'All-Out!',
    tabSub: 'Full Santa',
    badge: 'Option 3 · All-Out Early Christmas',
    title: 'Full Santa Gear & Over-the-Top Christmas',
    shortLabel: 'Option 3: Full Over-the-Top Early Family Christmas',
    description:
      'Lean all the way in while all six of us are together — maximum holiday spirit, stockings, big holiday feast, and pure festive joy.',
    imageSrc: './assets/vibe-option-3.jpg',
    imageAlt:
      'Comic scene of all six family members laughing in full red Santa suits and reindeer antlers while an indoor snow machine blasts fake snow across a massively decorated Victoria living room',
    sceneCaption:
      'Option 3: Full Santa gear, indoor snow machine blasting & maximum over-the-top Christmas vibes!',
  },
];

export const SLIDER_DIMENSIONS: SliderDimension[] = [
  {
    id: 'adventureVsRelax',
    title: 'Relaxation vs. Adventure',
    leftLabel: 'Full Relaxation',
    rightLabel: 'Full Adventure',
    scaleLabels: {
      1: 'Pure relaxation — fireside, slow mornings & zero rush',
      2: 'Mostly relaxing with one easy outing a day',
      3: 'Balanced mix of downtime and exploring',
      4: 'Active days exploring with cozy evenings at home',
      5: 'Full adventure — pack in as much West Coast exploring as we can',
    },
  },
  {
    id: 'indoorsVsOutdoors',
    title: 'Indoors vs. Outdoors',
    leftLabel: 'Cozy Indoors',
    rightLabel: 'Fresh Outdoors',
    scaleLabels: {
      1: 'Mostly cozy indoors — warm spots, cafes, games & home feasts',
      2: 'Mostly indoors with short fresh-air strolls',
      3: 'Even split between cozy indoor spots and outdoor time',
      4: 'Lean outdoors — ocean walks, gardens & Island air',
      5: 'Out in the West Coast fresh air as much as weather allows',
    },
  },
  {
    id: 'familiarVsNew',
    title: 'Familiar Favorites vs. New Experiences',
    leftLabel: 'Familiar Favorites',
    rightLabel: 'Try Something New',
    scaleLabels: {
      1: 'Stick to tried-and-true family favorites',
      2: 'Mostly familiar spots with a couple fresh ideas',
      3: 'Balanced mix of old favorites and new discoveries',
      4: 'Lean toward discovering new places and activities',
      5: 'Surprise us — bring on brand-new West Coast experiences',
    },
  },
];

export const FRIDAY_VIBE_OPTIONS: FridayVibeOption[] = [
  {
    id: 'restaurants',
    title: 'Great Food & Restaurants',
    summary: 'An unhurried adult sit-down lunch, local bakery stops, or a memorable meal out.',
  },
  {
    id: 'fun_activity',
    title: 'Fun Activity or Outing',
    summary: 'Do a memorable West Coast experience, tour, or excursion together.',
  },
  {
    id: 'relax',
    title: 'Relax & Unwind',
    summary: 'Slow morning, coffee shops, easy strolling, and zero clock-watching.',
  },
  {
    id: 'games_hangout',
    title: 'Games, Sports & Hangout',
    summary: 'Cards, puzzles, watching sports, or relaxed quality time together.',
  },
];

export const QUICK_BUZZKILL_CHIPS: string[] = [
  'Early alarms',
  'Long lines & crowds',
  'Over-packed schedule',
  'Too much driving',
  'Cold sideways rain',
  'Dish duty',
];
