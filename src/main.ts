import './style.css';
import {
  BARCLAY_MASCOT,
  CAST_MEMBERS,
  VIBE_OPTIONS,
  FRIDAY_ADULT_OPTIONS,
  WEEKEND_OUTING_OPTIONS,
  NAUGHTY_LIST_OPTIONS,
  PACE_LABELS,
  type ActivityOption,
} from './data';
import {
  sanitizeInputText,
  checkCooldownAllowed,
  postBallotToSheetWebhook,
  formatEmojiBallotReceipt,
  type VictoriaBallotPayload,
} from './utils/formSubmission';

const STORAGE_KEY = 'xmas_victoria_2026_dispatch_v4';
const LEGACY_STORAGE_KEY = 'xmas_victoria_2026_dispatch_v3';
const SVG_NS = 'http://www.w3.org/2000/svg';

interface AppState {
  voterId: string;
  vibeChoiceId: string;
  fridayOrderedIds: string[];
  weekendOrderedIds: string[];
  vetoedIds: string[];
  customVetoNote: string;
  paceScore: number;
  morningCoffeeAndTreats: string;
  christmasFeastOrGameWish: string;
  travelFlightOrFerryInfo: string;
  symphonyCandlelightInterest: boolean;
  honeypot: string;
}

function normalizeOrder(saved: unknown, defaults: string[]): string[] {
  const valid = Array.isArray(saved)
    ? saved.filter((id): id is string => typeof id === 'string' && defaults.includes(id))
    : [];
  for (const id of defaults) {
    if (!valid.includes(id)) valid.push(id);
  }
  return valid;
}

function loadInitialState(): AppState {
  const defaultFriday = FRIDAY_ADULT_OPTIONS.map((a) => a.id);
  const defaultWeekend = WEEKEND_OUTING_OPTIONS.map((a) => a.id);
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      const validVibe = VIBE_OPTIONS.some((v) => v.id === parsed.vibeChoiceId)
        ? (parsed.vibeChoiceId as string)
        : '';
      return {
        voterId: typeof parsed.voterId === 'string' ? parsed.voterId : '',
        vibeChoiceId: validVibe,
        fridayOrderedIds: normalizeOrder(parsed.fridayOrderedIds, defaultFriday),
        weekendOrderedIds: normalizeOrder(parsed.weekendOrderedIds, defaultWeekend),
        vetoedIds: Array.isArray(parsed.vetoedIds)
          ? parsed.vetoedIds.filter((x): x is string => typeof x === 'string')
          : [],
        customVetoNote: typeof parsed.customVetoNote === 'string' ? parsed.customVetoNote : '',
        paceScore:
          typeof parsed.paceScore === 'number' && PACE_LABELS[parsed.paceScore]
            ? parsed.paceScore
            : 3,
        morningCoffeeAndTreats:
          typeof parsed.morningCoffeeAndTreats === 'string' ? parsed.morningCoffeeAndTreats : '',
        christmasFeastOrGameWish:
          typeof parsed.christmasFeastOrGameWish === 'string'
            ? parsed.christmasFeastOrGameWish
            : '',
        travelFlightOrFerryInfo:
          typeof parsed.travelFlightOrFerryInfo === 'string' ? parsed.travelFlightOrFerryInfo : '',
        symphonyCandlelightInterest: Boolean(parsed.symphonyCandlelightInterest),
        honeypot: '',
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return {
    voterId: '',
    vibeChoiceId: '',
    fridayOrderedIds: defaultFriday,
    weekendOrderedIds: defaultWeekend,
    vetoedIds: [],
    customVetoNote: '',
    paceScore: 3,
    morningCoffeeAndTreats: '',
    christmasFeastOrGameWish: '',
    travelFlightOrFerryInfo: '',
    symphonyCandlelightInterest: false,
    honeypot: '',
  };
}

function saveDraft(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createMycelialGarlandSvg(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'twinkle-garland');
  svg.setAttribute('viewBox', '0 0 800 34');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  const rootVine = document.createElementNS(SVG_NS, 'path');
  rootVine.setAttribute(
    'd',
    'M0,14 Q50,24 100,12 T200,14 T300,12 T400,14 T500,12 T600,14 T700,12 T800,14'
  );
  rootVine.setAttribute('fill', 'none');
  rootVine.setAttribute('stroke', '#8b5e34');
  rootVine.setAttribute('stroke-width', '3');
  svg.appendChild(rootVine);

  const palette = ['#f5a623', '#6ee7b7', '#fbbf24', '#f87171'];
  const xs = [45, 115, 185, 255, 325, 395, 465, 535, 605, 675, 745];
  xs.forEach((x, idx) => {
    const leaf = document.createElementNS(SVG_NS, 'ellipse');
    leaf.setAttribute('cx', String(x - 6));
    leaf.setAttribute('cy', '12');
    leaf.setAttribute('rx', '5');
    leaf.setAttribute('ry', '2.6');
    leaf.setAttribute('fill', '#4ade80');
    svg.appendChild(leaf);

    const ember = document.createElementNS(SVG_NS, 'circle');
    ember.setAttribute('cx', String(x));
    ember.setAttribute('cy', '19');
    ember.setAttribute('r', '5.5');
    ember.setAttribute('fill', palette[idx % palette.length]);
    ember.setAttribute('class', idx % 2 === 0 ? 'twinkle-bulb-a' : 'twinkle-bulb-b');
    svg.appendChild(ember);
  });

  return svg;
}

function mountApp(): void {
  const root = document.getElementById('app');
  if (!root) return;

  const state = loadInitialState();
  let activeDragListKey: string | null = null;
  let activeDragItemId: string | null = null;
  let lastReceiptText = '';
  let lastDeliveryNote = '';

  const shell = el('main', 'page-shell');

  // 1. Woody Claws Carved Western Red Cedar Header (Compact -> Opens Straight to Step 1!)
  const hero = el('header', 'hero-card');
  hero.appendChild(el('div', 'cedar-bark-trim'));
  hero.appendChild(createMycelialGarlandSvg());

  const heroImg = el('img', 'hero-banner-img');
  heroImg.src = './assets/woody-claws-hero.jpg';
  heroImg.alt =
    'Bronze-Age comic illustration of Malahat driftwood giant Woody Claws with a glowing golden ember in his wooden chest carving cedar survey scrolls beside a lily pad, crimson rose, and golden dandelion';

  const heroCopy = el('div', 'hero-copy');
  heroCopy.appendChild(
    el(
      'span',
      'postmark-stamp',
      '🪵🌿 Official Tree-Mail from Woody Claws · Thu Dec 10 – Mon Dec 14, 2026 · Victoria, BC'
    )
  );
  heroCopy.appendChild(el('h1', 'hero-title', 'WE WOOD LOVE YOUR INPUT!'));
  heroCopy.appendChild(
    el(
      'p',
      'hero-subtitle',
      'Your input is needed — don’t LEAF Woody Claws hanging! Now that the talking trees revealed Cathy (GOTY!), Pedro & Tom are coming West Dec 10–14, take 60 seconds to LOG your wishes & SPRUCE up the Coast:'
    )
  );

  const heroActions = el('div', 'hero-comic-bar');
  const comicLink = el(
    'a',
    'comic-pdf-pill',
    '📖 Read 10-Page Issue #1 Comic: "Love at First Slide" (PDF)'
  );
  comicLink.href = './assets/woody-claws-issue-1.pdf';
  comicLink.target = '_blank';
  comicLink.rel = 'noopener noreferrer';

  const deliveryLegend = el(
    'span',
    'botanical-legend',
    '🪷 Lily Pad · 🌹 Prize Rose · 🌼 Sideline Dandelion'
  );
  heroActions.append(comicLink, deliveryLegend);
  heroCopy.appendChild(heroActions);

  hero.append(heroImg, heroCopy);
  shell.appendChild(hero);

  // 2. Step 1 of 6: Civilian Family Check-In (Directly below Header!)
  const castSec = el('section', 'section-card');
  castSec.id = 'step-hero-picker';
  castSec.appendChild(el('span', 'section-step', '🪵 Step 1 of 6 · Who’s Opening Their Wooden Scroll?'));
  castSec.appendChild(el('h2', 'section-title', 'Tap Your Portrait to Begin'));
  castSec.appendChild(
    el(
      'p',
      'section-lead',
      'Tap your portrait below so Woody Claws, Markus & Tricia know whose Victoria votes & pantry favorites we’re carving into cedar:'
    )
  );
  const castGrid = el('div', 'cast-grid');
  const greetingBanner = el('div', 'cast-greeting');
  const coffeeInput = el('input', 'text-input');

  function renderCastPicker(): void {
    castGrid.replaceChildren();
    for (const member of CAST_MEMBERS) {
      const btn = el(
        'button',
        state.voterId === member.id ? 'cast-btn is-selected' : 'cast-btn'
      );
      btn.id = `cast-btn-${member.id}`;
      btn.type = 'button';
      btn.setAttribute('aria-pressed', state.voterId === member.id ? 'true' : 'false');
      const img = el('img', 'cast-avatar');
      img.src = member.avatarSrc;
      img.alt = `${member.name} — ${member.heroTitle}`;
      const nameEl = el('span', 'cast-name', member.name);
      const heroEl = el('span', 'cast-hero', member.heroTitle);
      const badgeEl = el('span', 'cast-delivery-tag', member.deliveryBadge);
      btn.append(img, nameEl, heroEl, badgeEl);
      btn.addEventListener('click', () => {
        state.voterId = member.id;
        coffeeInput.placeholder = member.coffeePlaceholder;
        saveDraft(state);
        renderCastPicker();
      });
      castGrid.appendChild(btn);
    }
    const active = CAST_MEMBERS.find((c) => c.id === state.voterId);
    if (active) {
      greetingBanner.hidden = false;
      greetingBanner.textContent = `${active.deliveryBadge} · ${active.name}: ${active.greeting}`;
      coffeeInput.placeholder = active.coffeePlaceholder;
    } else {
      greetingBanner.hidden = true;
    }
  }
  renderCastPicker();

  const mascotBox = el('div', 'mascot-callout');
  const mascotImg = el('img', 'mascot-avatar');
  mascotImg.src = BARCLAY_MASCOT.avatarSrc;
  mascotImg.alt = `${BARCLAY_MASCOT.name} portrait`;
  const mascotCopy = el('div', 'mascot-copy');
  mascotCopy.append(
    el(
      'strong',
      undefined,
      `🧡🍼 Plus Non-Voting Mascot: ${BARCLAY_MASCOT.name} (${BARCLAY_MASCOT.rosterBadge})`
    ),
    el('span', undefined, BARCLAY_MASCOT.blurb)
  );
  mascotBox.append(mascotImg, mascotCopy);

  castSec.append(castGrid, greetingBanner, mascotBox);
  shell.appendChild(castSec);

  // 3. Step 2 of 6: Option A — Victoria Getaway vs. Recreating Christmas
  const vibeSec = el('section', 'section-card');
  vibeSec.id = 'step-vibe-check';
  vibeSec.appendChild(
    el('span', 'section-step section-step-nice', '🎯 Step 2 of 6 · The Big Vibe Check')
  );
  vibeSec.appendChild(
    el('h2', 'section-title', 'Victoria Getaway vs. Recreating Christmas (Protecting Ottawa Dec 25!)')
  );
  vibeSec.appendChild(
    el(
      'p',
      'section-lead',
      'Since Markus, Tricia & Barclay head to the Kootenays over Dec 25 while Pedro, Cathy & Tommy are home in Ottawa for actual Christmas Eve & Christmas Day, we don’t want to accidentally step on your Ottawa Christmas morning! Which vibe feels best for Dec 10–14 in Victoria?'
    )
  );

  const vibeBannerFrame = el('div', 'vibe-banner-frame');
  const vibeBannerImg = el('img', 'vibe-banner-img');
  vibeBannerImg.src = './assets/victoria-civilian-vibe.jpg';
  vibeBannerImg.alt =
    'Warm comic living room scene in Victoria: Pedro relaxing by the fire with crosswords and a soccer ball, Cathy reading a storybook with toddler Barclay, Tommy rolling tabletop dice by the football game, and Markus and Tricia serving dinner from the kitchen';
  vibeBannerFrame.append(
    vibeBannerImg,
    el(
      'div',
      'vibe-banner-caption',
      '🏡 Inside Victoria HQ: Markus on feasts (Cathy’s apron stays 100% retired!), Cathy on Barclay & storybook duty, Tricia bringing the hype, and zero pressure until we pick our vibe together!'
    )
  );
  vibeSec.appendChild(vibeBannerFrame);

  const vibeGrid = el('div', 'vibe-grid');
  function renderVibeOptions(): void {
    vibeGrid.replaceChildren();
    for (const opt of VIBE_OPTIONS) {
      const selected = state.vibeChoiceId === opt.id;
      const card = el('button', selected ? 'vibe-card is-selected' : 'vibe-card');
      card.id = `vibe-btn-${opt.id}`;
      card.type = 'button';
      card.setAttribute('aria-pressed', selected ? 'true' : 'false');

      const medal = el('span', 'vibe-icon-medal', opt.icon);
      medal.setAttribute('aria-hidden', 'true');

      const body = el('span', 'vibe-card-body');
      body.appendChild(el('span', 'vibe-badge', opt.badge));
      body.appendChild(el('span', 'vibe-title', opt.title));
      body.appendChild(el('span', 'vibe-desc', opt.description));
      body.appendChild(
        el(
          'span',
          'vibe-select-pill',
          selected ? '✅ Carved into My Cedar Scroll' : '◯ Tap to Vote for This Vibe'
        )
      );

      card.append(medal, body);
      card.addEventListener('click', () => {
        state.vibeChoiceId = opt.id;
        saveDraft(state);
        renderVibeOptions();
      });
      vibeGrid.appendChild(card);
    }
  }
  renderVibeOptions();
  vibeSec.appendChild(vibeGrid);
  shell.appendChild(vibeSec);

  // Reusable Rank List Builder for Step 3 & Step 4
  function buildRankSection(config: {
    listKey: string;
    sectionId: string;
    stepBadge: string;
    title: string;
    lead: string;
    options: ActivityOption[];
    highlightTopCount: number;
    getOrder: () => string[];
    setOrder: (next: string[]) => void;
  }): HTMLElement {
    const sec = el('section', 'section-card');
    sec.id = config.sectionId;
    sec.appendChild(el('span', 'section-step section-step-nice', config.stepBadge));
    sec.appendChild(el('h2', 'section-title', config.title));
    sec.appendChild(el('p', 'section-lead', config.lead));

    const listEl = el('div', 'rank-list');
    const byId = new Map<string, ActivityOption>(config.options.map((a) => [a.id, a]));

    function moveItem(fromIdx: number, toIdx: number): void {
      const current = config.getOrder();
      if (toIdx < 0 || toIdx >= current.length || fromIdx === toIdx) return;
      const next = [...current];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      config.setOrder(next);
      saveDraft(state);
      renderList();
    }

    function renderList(): void {
      listEl.replaceChildren();
      const ordered = config.getOrder();
      ordered.forEach((id, index) => {
        const item = byId.get(id);
        if (!item) return;

        const isHighlighted = index < config.highlightTopCount;
        const card = el('div', isHighlighted ? 'rank-card is-top-three' : 'rank-card');
        card.id = `${config.listKey}-item-${item.id}`;
        card.draggable = true;
        card.dataset.activityId = item.id;

        card.addEventListener('dragstart', (ev) => {
          activeDragListKey = config.listKey;
          activeDragItemId = item.id;
          card.classList.add('is-dragging');
          if (ev.dataTransfer) {
            ev.dataTransfer.effectAllowed = 'move';
            ev.dataTransfer.setData('text/plain', `${config.listKey}:${item.id}`);
          }
        });

        card.addEventListener('dragend', () => {
          activeDragListKey = null;
          activeDragItemId = null;
          card.classList.remove('is-dragging');
        });

        card.addEventListener('dragover', (ev) => {
          if (activeDragListKey && activeDragListKey !== config.listKey) return;
          ev.preventDefault();
          card.classList.add('is-drop-target');
        });

        card.addEventListener('dragleave', () => {
          card.classList.remove('is-drop-target');
        });

        card.addEventListener('drop', (ev) => {
          ev.preventDefault();
          card.classList.remove('is-drop-target');
          let sourceId = '';
          if (activeDragListKey === config.listKey && activeDragItemId) {
            sourceId = activeDragItemId;
          } else {
            const rawTransfer = ev.dataTransfer?.getData('text/plain') || '';
            const prefix = `${config.listKey}:`;
            if (rawTransfer.startsWith(prefix)) {
              sourceId = rawTransfer.slice(prefix.length);
            }
          }
          const fromIdx = config.getOrder().indexOf(sourceId);
          if (fromIdx !== -1 && fromIdx !== index) {
            moveItem(fromIdx, index);
          }
        });

        const numBadge = el('div', 'rank-number');
        numBadge.appendChild(
          el('span', undefined, isHighlighted ? `🌟 #${index + 1}` : `#${index + 1}`)
        );
        numBadge.appendChild(
          el('span', 'rank-number-sub', isHighlighted ? 'Top Pick' : 'Rank')
        );

        const body = el('div', 'rank-body');
        const winBadge = el('span', `badge-window tone-${item.windowTone}`, item.windowLabel);
        const titleEl = el('h3', 'rank-title', item.title);
        const summaryEl = el('p', 'rank-summary', item.summary);
        body.append(winBadge, titleEl, summaryEl);

        const controls = el('div', 'rank-controls');
        const upBtn = el('button', 'ctrl-btn', '▲ Up');
        upBtn.id = `move-up-${config.listKey}-${item.id}`;
        upBtn.type = 'button';
        upBtn.disabled = index === 0;
        upBtn.setAttribute('aria-label', `Move ${item.title} higher`);
        upBtn.addEventListener('click', () => moveItem(index, index - 1));

        const downBtn = el('button', 'ctrl-btn', '▼ Down');
        downBtn.id = `move-down-${config.listKey}-${item.id}`;
        downBtn.type = 'button';
        downBtn.disabled = index === ordered.length - 1;
        downBtn.setAttribute('aria-label', `Move ${item.title} lower`);
        downBtn.addEventListener('click', () => moveItem(index, index + 1));

        controls.append(upBtn, downBtn);
        if (index > 0) {
          const topBtn = el('button', 'ctrl-btn ctrl-btn-top', '🌟 #1 Pick');
          topBtn.id = `jump-top-${config.listKey}-${item.id}`;
          topBtn.type = 'button';
          topBtn.setAttribute('aria-label', `Make ${item.title} #1 pick`);
          topBtn.addEventListener('click', () => moveItem(index, 0));
          controls.appendChild(topBtn);
        }

        card.append(numBadge, body, controls);
        listEl.appendChild(card);
      });
    }

    renderList();
    sec.appendChild(listEl);
    return sec;
  }

  // 4. Step 3 of 6: Friday Dec 11 Golden Adult-Only Window (8am–5pm)
  const fridaySec = buildRankSection({
    listKey: 'friday',
    sectionId: 'step-friday-adult',
    stepBadge: '🥂 Step 3 of 6 · Fri Dec 11 Adult-Only Window (8am–5pm)',
    title: 'Rank Your Friday Child-Free Adult Favorites (#1 → #4)',
    lead: 'Friday is our secret weapon: Barclay is at Cridge daycare from 8:00 AM – 5:00 PM, giving all 5 adults a rare child-free window! Drag or tap ▲ / ▼ to rank these 4 contenders:',
    options: FRIDAY_ADULT_OPTIONS,
    highlightTopCount: 2,
    getOrder: () => state.fridayOrderedIds,
    setOrder: (next) => {
      state.fridayOrderedIds = next;
    },
  });
  shell.appendChild(fridaySec);

  // 5. Step 4 of 6: Sat Dec 12 & Sun Dec 13 Outings
  const weekendSec = buildRankSection({
    listKey: 'weekend',
    sectionId: 'step-weekend-outings',
    stepBadge: '✨ Step 4 of 6 · Sat Dec 12 & Sun Dec 13 Outings',
    title: 'Rank Weekend Outings Around Barclay’s Nap (#1 Top Pick → #5 Skip)',
    lead: 'Markus has cozy home feasts covered in the evenings (Cathy’s apron is BANNED so she stays fresh for toddler & ice-cream duty!). Rank these 5 verified outings around Barclay’s 12–2pm nap & ~7pm bedtime:',
    options: WEEKEND_OUTING_OPTIONS,
    highlightTopCount: 3,
    getOrder: () => state.weekendOrderedIds,
    setOrder: (next) => {
      state.weekendOrderedIds = next;
    },
  });
  shell.appendChild(weekendSec);

  // 6. Step 5 of 6: Woody Claws' Cedar Woodchipper (Buzzkill Mulcher!)
  const naughtySec = el('section', 'section-card section-card-naughty');
  naughtySec.id = 'step-buzzkills';
  naughtySec.appendChild(
    el('span', 'section-step section-step-mulch', '🪵🌿 Step 5 of 6 · Woody Claws’ Cedar Woodchipper')
  );
  naughtySec.appendChild(
    el('h2', 'section-title', 'What Trip Buzzkills Should Woody Claws Mulch Into Woodchips?')
  );
  naughtySec.appendChild(
    el(
      'p',
      'section-lead',
      'Woody Claws wants the West Coast in tip-top shape for GOTY’s arrival! Tap any energy-drainers below and Woody will shred them into fragrant cedar mulch for Cathy’s rose garden:'
    )
  );

  const visualFrame = el('div', 'naughty-visual-frame');
  const naughtyBannerImg = el('img', 'naughty-banner-img');
  naughtyBannerImg.src = './assets/woody-claws-mulch.jpg';
  naughtyBannerImg.alt =
    'Bronze-Age comic illustration of driftwood giant Woody Claws happily feeding a ringing alarm clock, soapy dishes, raincloud, and queue ropes into a rustic log woodchipper that shoots out golden cedar rose mulch';
  const visualCaption = el('div', 'naughty-visual-caption');
  visualCaption.append(
    el(
      'span',
      undefined,
      '🪵 Tap any buzzkill card below to toss it into Woody Claws’ hollow-log woodchipper!'
    ),
    el('span', 'naughty-example-flow', '⏰ Early Alarms + 🧽 Dish Duty ➔ 🪵🌹 Rose Mulch!')
  );
  visualFrame.append(naughtyBannerImg, visualCaption);
  naughtySec.appendChild(visualFrame);

  const naughtyGrid = el('div', 'naughty-grid');
  const scrollStage = el('div', 'naughty-scroll-stage');
  const naughtyById = new Map(NAUGHTY_LIST_OPTIONS.map((opt) => [opt.id, opt]));

  const customNaughtyGroup = el('div', 'field-group');
  const customNaughtyLabel = el(
    'label',
    'field-label',
    '🌿 Any Other Trip Buzzkill for Woody Claws to Mulch? (Optional):'
  );
  customNaughtyLabel.htmlFor = 'custom-naughty-input';
  const customNaughtyInput = el('input', 'text-input');
  customNaughtyInput.id = 'custom-naughty-input';
  customNaughtyInput.type = 'text';
  customNaughtyInput.maxLength = 220;
  customNaughtyInput.placeholder =
    'e.g., Waiting in restaurant lines, cold wet shoes, skipping afternoon coffee...';
  customNaughtyInput.value = state.customVetoNote;

  function toggleNaughtyId(id: string): void {
    if (state.vetoedIds.includes(id)) {
      state.vetoedIds = state.vetoedIds.filter((x) => x !== id);
    } else {
      state.vetoedIds = [...state.vetoedIds, id];
    }
    saveDraft(state);
    renderNaughtySection();
  }

  function renderNaughtyScrollPreview(): void {
    scrollStage.replaceChildren();
    const topRoller = el('div', 'scroll-roller');
    const parchment = el('div', 'scroll-parchment');
    const bottomRoller = el('div', 'scroll-roller');

    const trimmedCustom = state.customVetoNote.trim();
    const totalMulchCount = state.vetoedIds.length + (trimmedCustom ? 1 : 0);

    const header = el('div', 'scroll-header');
    const headingWrap = el('div', 'scroll-heading-wrap');
    headingWrap.appendChild(el('div', 'wax-seal-medal', '🪵'));
    const titleBox = el('div');
    titleBox.appendChild(
      el('h3', 'scroll-title', 'Woody Claws’ Official Mulched-Buzzkills Scroll')
    );
    titleBox.appendChild(
      el(
        'p',
        'scroll-subtitle',
        totalMulchCount === 0
          ? 'Woodchipper idling — tap any buzzkill above if something bugs you!'
          : 'Shredded into fragrant cedar mulch & outlawed from Dec 10–14!'
      )
    );
    headingWrap.appendChild(titleBox);

    const mulchCounter = el('div', 'coal-sack-counter mulch-sack-counter');
    const chipsRow = el('span', 'coal-lumps-row');
    const visualDots = Math.min(Math.max(totalMulchCount, 1), 6);
    for (let i = 0; i < visualDots; i++) {
      chipsRow.appendChild(el('span', 'woodchip-dot'));
    }
    const mulchLabel = el(
      'span',
      undefined,
      totalMulchCount === 1
        ? '1 Bag of Cedar Rose Mulch!'
        : `${totalMulchCount} Bags of Cedar Rose Mulch!`
    );
    mulchCounter.append(chipsRow, mulchLabel);
    header.append(headingWrap, mulchCounter);
    parchment.appendChild(header);

    const entriesList = el('ul', 'scroll-entries');
    if (totalMulchCount === 0) {
      const emptyLi = el('li', 'scroll-empty-example');
      emptyLi.append(
        el('strong', undefined, 'Example: '),
        el(
          'span',
          undefined,
          '⏰ "Early Alarms" or 🧽 "Dish-Pit Duty" ➔ 🪵 Tap any card above to mulch it!'
        )
      );
      entriesList.appendChild(emptyLi);
    } else {
      for (const id of state.vetoedIds) {
        const opt = naughtyById.get(id);
        if (!opt) continue;
        const li = el('li', 'scroll-entry-item');
        const textWrap = el('span', 'scroll-entry-text');
        textWrap.append(
          el('span', undefined, `${opt.icon}🪵`),
          el('span', undefined, `${opt.grinchTitle} — ${opt.label}`)
        );
        const pardonBtn = el('button', 'scroll-pardon-btn', '✕ Undo');
        pardonBtn.id = `pardon-btn-${opt.id}`;
        pardonBtn.type = 'button';
        pardonBtn.addEventListener('click', () => toggleNaughtyId(opt.id));
        li.append(textWrap, pardonBtn);
        entriesList.appendChild(li);
      }
      if (trimmedCustom) {
        const customLi = el('li', 'scroll-entry-item');
        const customTextWrap = el('span', 'scroll-entry-text');
        customTextWrap.append(
          el('span', undefined, '🌿🪵'),
          el('span', undefined, `Write-In Buzzkill: ${trimmedCustom}`)
        );
        const clearCustomBtn = el('button', 'scroll-pardon-btn', '✕ Clear');
        clearCustomBtn.id = 'pardon-custom-btn';
        clearCustomBtn.type = 'button';
        clearCustomBtn.addEventListener('click', () => {
          state.customVetoNote = '';
          customNaughtyInput.value = '';
          saveDraft(state);
          renderNaughtyScrollPreview();
        });
        customLi.append(customTextWrap, clearCustomBtn);
        entriesList.appendChild(customLi);
      }
    }

    parchment.appendChild(entriesList);
    scrollStage.append(topRoller, parchment, bottomRoller);
  }

  function renderNaughtySection(): void {
    naughtyGrid.replaceChildren();
    for (const opt of NAUGHTY_LIST_OPTIONS) {
      const active = state.vetoedIds.includes(opt.id);
      const card = el('button', active ? 'naughty-card is-naughty' : 'naughty-card');
      card.id = `naughty-btn-${opt.id}`;
      card.type = 'button';
      card.setAttribute('aria-pressed', active ? 'true' : 'false');

      const iconMedal = el('span', 'naughty-icon-medal', active ? '🪵' : opt.icon);
      iconMedal.setAttribute('aria-hidden', 'true');

      const content = el('span', 'naughty-card-content');
      content.appendChild(el('span', 'naughty-grinch-title', opt.grinchTitle));
      content.appendChild(el('span', 'naughty-desc', opt.label));

      const stampRow = el('span', 'naughty-stamp-row');
      stampRow.appendChild(
        el(
          'span',
          'naughty-stamp',
          active ? '🪵 Mulched! (+1 Rose Mulch)' : '🌿 Tap to Mulch'
        )
      );
      content.appendChild(stampRow);

      card.append(iconMedal, content);
      card.addEventListener('click', () => toggleNaughtyId(opt.id));
      naughtyGrid.appendChild(card);
    }
    renderNaughtyScrollPreview();
  }

  customNaughtyInput.addEventListener('input', () => {
    state.customVetoNote = customNaughtyInput.value;
    saveDraft(state);
    renderNaughtyScrollPreview();
  });

  renderNaughtySection();
  customNaughtyGroup.append(customNaughtyLabel, customNaughtyInput);
  naughtySec.append(naughtyGrid, customNaughtyGroup, scrollStage);
  shell.appendChild(naughtySec);

  // 7. Step 6 of 6: Pace, Pantry, Wishes & Travel Info
  const kitchenSec = el('section', 'section-card');
  kitchenSec.id = 'step-pantry-travel';
  kitchenSec.appendChild(
    el('span', 'section-step section-step-nice', '☕✈️ Step 6 of 6 · Pace, Pantry, Wishes & Flights')
  );
  kitchenSec.appendChild(
    el('h2', 'section-title', 'Trip Pace, Morning Mug, Cravings & Arrival/Departure Info')
  );
  kitchenSec.appendChild(
    el(
      'p',
      'section-lead',
      'So Woody Claws, Markus & Tricia have your favorite coffee, snacks, and dinner cravings stocked before Thursday, Dec 10!'
    )
  );

  const paceGroup = el('div', 'field-group');
  paceGroup.appendChild(el('span', 'field-label', '🕯️ Ideal Trip Pace (1–4):'));
  const paceGrid = el('div', 'pace-grid');
  function renderPace(): void {
    paceGrid.replaceChildren();
    for (const score of [1, 2, 3, 4]) {
      const btn = el(
        'button',
        state.paceScore === score ? 'pace-btn is-active' : 'pace-btn',
        PACE_LABELS[score]
      );
      btn.id = `pace-btn-${score}`;
      btn.type = 'button';
      btn.setAttribute('aria-pressed', state.paceScore === score ? 'true' : 'false');
      btn.addEventListener('click', () => {
        state.paceScore = score;
        saveDraft(state);
        renderPace();
      });
      paceGrid.appendChild(btn);
    }
  }
  renderPace();
  paceGroup.appendChild(paceGrid);

  const coffeeGroup = el('div', 'field-group');
  const coffeeLabel = el(
    'label',
    'field-label',
    '☕🍪 Morning Mug & Must-Stock Pantry Favorites:'
  );
  coffeeLabel.htmlFor = 'coffee-input';
  coffeeInput.id = 'coffee-input';
  coffeeInput.type = 'text';
  coffeeInput.maxLength = 180;
  if (!coffeeInput.placeholder) {
    coffeeInput.placeholder =
      'e.g., Dark roast coffee, herbal tea, warm croissants, mandarins, shortbread...';
  }
  coffeeInput.value = state.morningCoffeeAndTreats;
  coffeeInput.addEventListener('input', () => {
    state.morningCoffeeAndTreats = coffeeInput.value;
    saveDraft(state);
  });
  coffeeGroup.append(coffeeLabel, coffeeInput);

  const wishGroup = el('div', 'field-group');
  const wishLabel = el(
    'label',
    'field-label',
    '🥧🎬🎲 #1 Dinner Craving, Movie Pick, or Tommy Game-Night Wish:'
  );
  wishLabel.htmlFor = 'wish-input';
  const wishInput = el('input', 'text-input');
  wishInput.id = 'wish-input';
  wishInput.type = 'text';
  wishInput.maxLength = 180;
  wishInput.placeholder =
    'e.g., West Coast salmon, braised short ribs, Muppet Christmas Carol, cornhole rematch...';
  wishInput.value = state.christmasFeastOrGameWish;
  wishInput.addEventListener('input', () => {
    state.christmasFeastOrGameWish = wishInput.value;
    saveDraft(state);
  });
  wishGroup.append(wishLabel, wishInput);

  const travelGroup = el('div', 'field-group');
  const travelLabel = el(
    'label',
    'field-label',
    '✈️⛴️ Optional: Thu Dec 10 Arrival & Mon Dec 14 Departure Flight/Ferry Info:'
  );
  travelLabel.htmlFor = 'travel-input';
  const travelInput = el('input', 'text-input');
  travelInput.id = 'travel-input';
  travelInput.type = 'text';
  travelInput.maxLength = 180;
  travelInput.placeholder =
    'e.g., Arriving YYJ Thu 4:15pm (Porter/Air Canada), departing Mon noon — or "Still booking!"';
  travelInput.value = state.travelFlightOrFerryInfo;
  travelInput.addEventListener('input', () => {
    state.travelFlightOrFerryInfo = travelInput.value;
    saveDraft(state);
  });
  travelGroup.append(travelLabel, travelInput);

  const symphonyRow = el('label', 'checkbox-row');
  const symphonyCheck = el('input');
  symphonyCheck.id = 'symphony-candlelight-checkbox';
  symphonyCheck.type = 'checkbox';
  symphonyCheck.checked = state.symphonyCandlelightInterest;
  symphonyCheck.addEventListener('change', () => {
    state.symphonyCandlelightInterest = symphonyCheck.checked;
    saveDraft(state);
  });
  const symphonyText = el(
    'span',
    undefined,
    '🕯️🎻 Optional Bonus: Curious about Victoria Symphony’s "Messiah by Candlelight" at Christ Church Cathedral (Fri Dec 11 or Sat Dec 12 @ 7:30pm, or Sun 2:30pm)!'
  );
  symphonyRow.append(symphonyCheck, symphonyText);

  // Anti-bot honeypot field
  const hpWrap = el('div', 'hp-trap');
  hpWrap.setAttribute('aria-hidden', 'true');
  const hpInput = el('input');
  hpInput.id = 'hp-website-input';
  hpInput.type = 'text';
  hpInput.name = 'website_honeypot';
  hpInput.tabIndex = -1;
  hpInput.maxLength = 60;
  hpInput.autocomplete = 'off';
  hpInput.addEventListener('input', () => {
    state.honeypot = hpInput.value;
  });
  hpWrap.appendChild(hpInput);

  kitchenSec.append(paceGroup, coffeeGroup, wishGroup, travelGroup, symphonyRow, hpWrap);
  shell.appendChild(kitchenSec);

  // 8. Submit & 1-Tap Tree-Mail Summary Section
  const submitSec = el('section', 'section-card');
  const validationBox = el('div', 'validation-banner');
  validationBox.hidden = true;

  const submitBtn = el(
    'button',
    'submit-btn',
    '🪵🌿 LOG My Victoria Wishes & Send Back via Tree-Mail!'
  );
  submitBtn.id = 'seal-scroll-btn';
  submitBtn.type = 'button';

  const receiptContainer = el('div');

  function renderReceipt(): void {
    receiptContainer.replaceChildren();
    if (!lastReceiptText) return;

    const box = el('div', 'receipt-card');
    box.appendChild(
      el(
        'h3',
        'receipt-title',
        '🎉 Cedar Scroll Carved! Send 1-Tap Tree-Mail Summary to Family Chat:'
      )
    );
    box.appendChild(el('p', 'section-lead', lastDeliveryNote));

    const pre = el('pre', 'receipt-pre', lastReceiptText);
    const actions = el('div', 'receipt-actions');

    const shareBtn = el(
      'button',
      'action-btn action-btn-primary',
      '📲 Send Tree-Mail Summary to Family Chat (1 Tap)'
    );
    shareBtn.id = 'share-family-chat-btn';
    shareBtn.type = 'button';
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Woody Claws Victoria Dec 10–14 Wishes',
            text: lastReceiptText,
          });
          return;
        } catch {
          // User cancelled or share unavailable; fall back to clipboard
        }
      }
      await navigator.clipboard.writeText(lastReceiptText);
      shareBtn.textContent = '✅ Copied! Paste in Family Chat';
    });

    const copyBtn = el('button', 'action-btn action-btn-secondary', '📋 Copy Summary');
    copyBtn.id = 'copy-scroll-btn';
    copyBtn.type = 'button';
    copyBtn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(lastReceiptText);
      copyBtn.textContent = '✅ Summary Copied!';
      window.setTimeout(() => {
        copyBtn.textContent = '📋 Copy Summary';
      }, 2800);
    });

    actions.append(shareBtn, copyBtn);
    box.append(pre, actions);
    receiptContainer.appendChild(box);
  }

  const fridayById = new Map(FRIDAY_ADULT_OPTIONS.map((a) => [a.id, a]));
  const weekendById = new Map(WEEKEND_OUTING_OPTIONS.map((a) => [a.id, a]));

  submitBtn.addEventListener('click', async () => {
    if (state.honeypot.trim() !== '') return;

    const voter = CAST_MEMBERS.find((c) => c.id === state.voterId);
    if (!voter) {
      validationBox.hidden = false;
      validationBox.textContent =
        '🪵 Quick Step 1 check: Tap your portrait (Pedro, Cathy, Tommy, Tricia, or Markus) right at the top first!';
      castSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const vibeChoice = VIBE_OPTIONS.find((v) => v.id === state.vibeChoiceId);
    if (!vibeChoice) {
      validationBox.hidden = false;
      validationBox.textContent =
        '🎯 Quick Step 2 check: Pick which Victoria vs. Ottawa holiday vibe feels best (Option 1, Option 2, or Option 3)!';
      vibeSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!checkCooldownAllowed()) {
      return;
    }

    validationBox.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = '🪵 Carving Your Cedar Scroll...';

    const naughtyLabelMap = new Map(
      NAUGHTY_LIST_OPTIONS.map((p) => [p.id, `${p.grinchTitle} (${p.label})`])
    );
    const payload: VictoriaBallotPayload = {
      schemaVersion: 'v4',
      submittedAtIso: new Date().toISOString(),
      voterId: voter.id,
      voterName: voter.name,
      heroTitle: voter.heroTitle,
      vibeChoiceId: vibeChoice.id,
      vibeChoiceLabel: vibeChoice.shortLabel,
      rankedFridayAdult: state.fridayOrderedIds.map((id, idx) => {
        const act = fridayById.get(id)!;
        return {
          rank: idx + 1,
          id: act.id,
          title: act.title,
          windowLabel: act.windowLabel,
        };
      }),
      rankedWeekendOutings: state.weekendOrderedIds.map((id, idx) => {
        const act = weekendById.get(id)!;
        return {
          rank: idx + 1,
          id: act.id,
          title: act.title,
          windowLabel: act.windowLabel,
        };
      }),
      vetoedPetPeeves: state.vetoedIds
        .map((id) => naughtyLabelMap.get(id) || '')
        .filter(Boolean),
      customVetoNote: sanitizeInputText(state.customVetoNote, 220),
      paceScore: state.paceScore,
      paceLabel: PACE_LABELS[state.paceScore] || PACE_LABELS[3],
      morningCoffeeAndTreats: sanitizeInputText(state.morningCoffeeAndTreats, 180),
      christmasFeastOrGameWish: sanitizeInputText(state.christmasFeastOrGameWish, 180),
      travelFlightOrFerryInfo: sanitizeInputText(state.travelFlightOrFerryInfo, 180),
      symphonyCandlelightInterest: state.symphonyCandlelightInterest,
    };

    const result = await postBallotToSheetWebhook(payload);
    lastReceiptText = formatEmojiBallotReceipt(payload);
    lastDeliveryNote = result.note;

    submitBtn.disabled = false;
    submitBtn.textContent = '🪵✨ Update My Carved Wooden Survey';
    renderReceipt();
    receiptContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  submitSec.append(validationBox, submitBtn, receiptContainer);
  shell.appendChild(submitSec);

  root.replaceChildren(shell);
}

mountApp();
