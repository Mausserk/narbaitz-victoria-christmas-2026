import './style.css';
import {
  CAST_MEMBERS,
  VERIFIED_VICTORIA_ACTIVITIES,
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

const STORAGE_KEY = 'xmas_victoria_2026_ballot_draft_v1';
const SVG_NS = 'http://www.w3.org/2000/svg';

interface AppState {
  voterId: string;
  orderedIds: string[];
  vetoedIds: string[];
  customVetoNote: string;
  paceScore: number;
  morningCoffeeAndTreats: string;
  christmasFeastOrGameWish: string;
  symphonyCandlelightInterest: boolean;
  honeypot: string;
}

function loadInitialState(): AppState {
  const defaultOrder = VERIFIED_VICTORIA_ACTIVITIES.map((a) => a.id);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      const validOrder = Array.isArray(parsed.orderedIds)
        ? parsed.orderedIds.filter((id) => defaultOrder.includes(id))
        : [];
      for (const id of defaultOrder) {
        if (!validOrder.includes(id)) validOrder.push(id);
      }
      return {
        voterId: typeof parsed.voterId === 'string' ? parsed.voterId : '',
        orderedIds: validOrder,
        vetoedIds: Array.isArray(parsed.vetoedIds) ? parsed.vetoedIds : [],
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
        symphonyCandlelightInterest: Boolean(parsed.symphonyCandlelightInterest),
        honeypot: '',
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return {
    voterId: '',
    orderedIds: defaultOrder,
    vetoedIds: [],
    customVetoNote: '',
    paceScore: 3,
    morningCoffeeAndTreats: '',
    christmasFeastOrGameWish: '',
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

function createTwinkleGarlandSvg(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'twinkle-garland');
  svg.setAttribute('viewBox', '0 0 800 34');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  const wire = document.createElementNS(SVG_NS, 'path');
  wire.setAttribute(
    'd',
    'M0,8 Q50,22 100,9 T200,10 T300,10 T400,10 T500,10 T600,10 T700,10 T800,8'
  );
  wire.setAttribute('fill', 'none');
  wire.setAttribute('stroke', '#2d5c48');
  wire.setAttribute('stroke-width', '2.2');
  svg.appendChild(wire);

  const palette = ['#ff5a5f', '#ffd166', '#4ade80', '#7dd3fc'];
  const xs = [45, 115, 185, 255, 325, 395, 465, 535, 605, 675, 745];
  xs.forEach((x, idx) => {
    const cap = document.createElementNS(SVG_NS, 'rect');
    cap.setAttribute('x', String(x - 3));
    cap.setAttribute('y', '10');
    cap.setAttribute('width', '6');
    cap.setAttribute('height', '4');
    cap.setAttribute('rx', '1');
    cap.setAttribute('fill', '#cbd5e1');
    svg.appendChild(cap);

    const bulb = document.createElementNS(SVG_NS, 'ellipse');
    bulb.setAttribute('cx', String(x));
    bulb.setAttribute('cy', '20');
    bulb.setAttribute('rx', '5.5');
    bulb.setAttribute('ry', '7.5');
    bulb.setAttribute('fill', palette[idx % palette.length]);
    bulb.setAttribute('class', idx % 2 === 0 ? 'twinkle-bulb-a' : 'twinkle-bulb-b');
    svg.appendChild(bulb);
  });

  return svg;
}

function mountApp(): void {
  const root = document.getElementById('app');
  if (!root) return;

  const state = loadInitialState();
  let draggedActivityId: string | null = null;
  let lastReceiptText = '';
  let lastDeliveryNote = '';

  const shell = el('main', 'page-shell');

  // 1. Festive Hero Header
  const hero = el('header', 'hero-card');
  hero.appendChild(el('div', 'candy-cane-trim'));
  hero.appendChild(createTwinkleGarlandSvg());

  const heroImg = el('img', 'hero-banner-img');
  heroImg.src = './assets/hero-harbour.jpg';
  heroImg.alt =
    'Illustrated Narbaitz & Selkirk Christmas Hero Squad arriving at Victoria Inner Harbour while Woody Claus peeks from the snowy pines';

  const heroCopy = el('div', 'hero-copy');
  heroCopy.appendChild(
    el('span', 'postmark-stamp', '🎄 North Pole Dispatch · Thu Dec 10 – Mon Dec 14, 2026 · Victoria, BC')
  );
  heroCopy.appendChild(
    el('h1', 'hero-title', 'Narbaitz Family Christmas · Official Nice & Naughty Wish Scroll!')
  );
  heroCopy.appendChild(
    el(
      'p',
      'hero-subtitle',
      'Three magical Christmas days together (Fri Dec 11, Sat Dec 12 & Sun Dec 13)! Unfurl your holiday scroll below to stack Santa’s Nice List, banish holiday buzzkills to the Naughty List, and help rescue Christmas cheer from Woody Claus!'
    )
  );
  hero.append(heroImg, heroCopy);
  shell.appendChild(hero);

  // 2. West Coast Yuletide Lore: Woody Claus & The Silver Sizzler Slide!
  const villainSec = el('section', 'section-card');
  villainSec.appendChild(
    el('span', 'section-step', '🎅🎄 West Coast Yuletide Bulletin · Save Christmas!')
  );
  villainSec.appendChild(
    el('h2', 'section-title', 'Code Red Nose: Woody Claus Stole All the Christmas Cheer!')
  );
  villainSec.appendChild(
    el(
      'p',
      'section-lead',
      'Urgent North Pole & Vancouver Island alert: a 9-foot carved cedar Sasquatch in a Santa hat & white beard has swiped every twinkling ounce of West Coast Christmas cheer!'
    )
  );
  const villainGrid = el('div', 'stocking-grid');
  const villainImg = el('img', 'stocking-img');
  villainImg.src = './assets/woody-claus-heist.jpg';
  villainImg.alt =
    'Woody Claus winking with floating red hearts beside the Silver Sizzler Slide as Grand Otter Pedro, GOTY Cathy, and the Hero Squad arrive';
  const villainList = el('ul', 'rule-list');
  const villainBeats: Array<[string, string]> = [
    [
      '💘 1. The Silver Sizzler Crush',
      'Woody Claus fell head-over-wooden-heels in love with GOTY Cathy the day he spotted her sizzling majestically down the Malahat Silver Sizzler Slide!',
    ],
    [
      '🌲 2. His Lovestruck Evergreen Plot',
      'He figures if he hides all the Island’s Christmas cheer in his burlap sack, Cathy will have to trek into his mossy forest cabin and fall in love with him!',
    ],
    [
      '🦦 3. Operation Rescue Christmas',
      'Grand Otter Pedro, GOTY Cathy, Game Master Tommy, Tricia, Markus & Chief Elf Barclay are officially on the sleigh—fill out your Nice & Naughty Lists below to power up the Christmas Rescue!',
    ],
  ];
  for (const [vHeading, vDetail] of villainBeats) {
    const li = el('li', 'rule-item');
    li.append(el('strong', undefined, vHeading), el('span', undefined, vDetail));
    villainList.appendChild(li);
  }
  villainGrid.append(villainImg, villainList);
  villainSec.appendChild(villainGrid);
  shell.appendChild(villainSec);

  // 3. Secret Christmas Stocking Ring Card
  const stockingSec = el('section', 'section-card');
  stockingSec.appendChild(
    el('span', 'section-step section-step-nice', '🧦🎁 Fireside Tradition · Mantel Stocking Rules')
  );
  stockingSec.appendChild(el('h2', 'section-title', 'Our 5-Adult Secret Christmas Stocking Ring'));
  stockingSec.appendChild(
    el(
      'p',
      'section-lead',
      'Instead of suitcase-busting mountains of wrapping paper, every adult plays Secret Santa for ONE special mantel stocking!'
    )
  );
  const stockingGrid = el('div', 'stocking-grid');
  const stockingImg = el('img', 'stocking-img');
  stockingImg.src = './assets/stocking-ring.jpg';
  stockingImg.alt =
    'Five adult Christmas stockings plus Chief Elf Barclay’s mini-stocking hanging on the cozy Victoria fireplace mantel';
  const ruleList = el('ul', 'rule-list');
  const rules: Array<[string, string]> = [
    [
      '🎅 1. One Top-Secret Stocking Assignment',
      'Pedro, Cathy, Tommy, Tricia & Markus each draw 1 adult in a closed 5-person Christmas ring (watch your private text from Markus for who you drew!).',
    ],
    [
      '🧳 2. $35–$50 Sleigh-Friendly Carry-On Rule',
      'Keep treats compact, cozy, funny, or delicious so flying and ferrying into Victoria feels light as a snowflake.',
    ],
    [
      '🧝 3. Chief Elf Barclay’s Bonus Mini-Stocking',
      'Barclay’s tiny Christmas stocking hangs right beside ours—100% optional if anyone spots a cute board book, sticker, or toddler treat!',
    ],
  ];
  for (const [heading, detail] of rules) {
    const li = el('li', 'rule-item');
    li.append(el('strong', undefined, heading), el('span', undefined, detail));
    ruleList.appendChild(li);
  }
  stockingGrid.append(stockingImg, ruleList);
  stockingSec.appendChild(stockingGrid);
  shell.appendChild(stockingSec);

  // 4. Chapter 1: Sign the Christmas Scroll (Character Picker)
  const castSec = el('section', 'section-card');
  castSec.id = 'chapter-hero-picker';
  castSec.appendChild(el('span', 'section-step', '✨ Chapter 1 of 4 · Sign the Christmas Scroll'));
  castSec.appendChild(
    el('h2', 'section-title', 'Which Christmas Hero Is Unfurling This Scroll?')
  );
  castSec.appendChild(
    el(
      'p',
      'section-lead',
      'Tap your custom Holiday Hero portrait so Santa’s Victoria workshop knows whose Christmas wishes we’re granting:'
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
      btn.append(img, nameEl, heroEl);
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
      greetingBanner.textContent = `🎄 ${active.name} (${active.rosterBadge}): ${active.greeting}`;
      coffeeInput.placeholder = active.coffeePlaceholder;
    } else {
      greetingBanner.hidden = true;
    }
  }
  renderCastPicker();
  castSec.append(castGrid, greetingBanner);
  shell.appendChild(castSec);

  // 5. Chapter 2: Santa's Official Nice List (Drag-to-Rank)
  const rankSec = el('section', 'section-card');
  rankSec.id = 'chapter-nice-list';
  rankSec.appendChild(
    el('span', 'section-step section-step-nice', '🌟🎁 Chapter 2 of 4 · Santa’s Official Nice List')
  );
  rankSec.appendChild(
    el('h2', 'section-title', 'Stack Your Nice List Wishes (#1 Dream Christmas Magic → #10)')
  );
  rankSec.appendChild(
    el(
      'p',
      'section-lead',
      'Drag (or tap ▲ / ▼) to crown your favorite Victoria Christmas moments at #1–#4 on the Nice List! (Elf Note: Friday Dec 11 from 8am–5pm is our golden Barclay-at-daycare window for lingering adult lunches or 19+ spots; Sat & Sun jingle gently around his noon nap & ~7pm bedtime!)'
    )
  );

  const legend = el('div', 'window-legend');
  const legendItems: Array<[string, string]> = [
    ['tone-adult-friday', '🎄 Fri 8am–5pm Golden Adult Window (Barclay @ Daycare)'],
    ['tone-family-morning', '☕ Sat/Sun Christmas Morning (With Barclay)'],
    ['tone-twinkle-afternoon', '✨ Sat/Sun Post-Nap Twinkle Lights'],
    ['tone-cozy-evening', '🕯️ Post-7pm Fireside Adult Evening'],
  ];
  for (const [cls, text] of legendItems) {
    legend.appendChild(el('span', `badge-window ${cls}`, text));
  }
  rankSec.appendChild(legend);

  const rankList = el('div', 'rank-list');
  const activityById = new Map<string, ActivityOption>(
    VERIFIED_VICTORIA_ACTIVITIES.map((a) => [a.id, a])
  );

  function moveItem(fromIdx: number, toIdx: number): void {
    if (toIdx < 0 || toIdx >= state.orderedIds.length || fromIdx === toIdx) return;
    const next = [...state.orderedIds];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    state.orderedIds = next;
    saveDraft(state);
    renderRankList();
  }

  function renderRankList(): void {
    rankList.replaceChildren();
    state.orderedIds.forEach((id, index) => {
      const item = activityById.get(id);
      if (!item) return;

      const isTopThree = index < 3;
      const card = el('div', isTopThree ? 'rank-card is-top-three' : 'rank-card');
      card.id = `nice-item-${item.id}`;
      card.draggable = true;
      card.dataset.activityId = item.id;

      card.addEventListener('dragstart', (ev) => {
        draggedActivityId = item.id;
        card.classList.add('is-dragging');
        if (ev.dataTransfer) {
          ev.dataTransfer.effectAllowed = 'move';
          ev.dataTransfer.setData('text/plain', item.id);
        }
      });

      card.addEventListener('dragend', () => {
        draggedActivityId = null;
        card.classList.remove('is-dragging');
      });

      card.addEventListener('dragover', (ev) => {
        ev.preventDefault();
        card.classList.add('is-drop-target');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('is-drop-target');
      });

      card.addEventListener('drop', (ev) => {
        ev.preventDefault();
        card.classList.remove('is-drop-target');
        const sourceId = draggedActivityId || ev.dataTransfer?.getData('text/plain') || '';
        const fromIdx = state.orderedIds.indexOf(sourceId);
        if (fromIdx !== -1 && fromIdx !== index) {
          moveItem(fromIdx, index);
        }
      });

      const numBadge = el('div', 'rank-number');
      numBadge.appendChild(
        el('span', undefined, isTopThree ? `🌟 #${index + 1}` : `#${index + 1}`)
      );
      numBadge.appendChild(
        el('span', 'rank-number-sub', isTopThree ? 'Nice Top' : 'Wish')
      );

      const body = el('div', 'rank-body');
      const winBadge = el('span', `badge-window tone-${item.windowTone}`, item.windowLabel);
      const title = el('h3', 'rank-title', item.title);
      const summary = el('p', 'rank-summary', item.summary);
      body.append(winBadge, title, summary);

      const controls = el('div', 'rank-controls');
      const upBtn = el('button', 'ctrl-btn', '▲ Up');
      upBtn.id = `move-up-${item.id}`;
      upBtn.type = 'button';
      upBtn.disabled = index === 0;
      upBtn.setAttribute('aria-label', `Move ${item.title} higher on the Nice List`);
      upBtn.addEventListener('click', () => moveItem(index, index - 1));

      const downBtn = el('button', 'ctrl-btn', '▼ Down');
      downBtn.id = `move-down-${item.id}`;
      downBtn.type = 'button';
      downBtn.disabled = index === state.orderedIds.length - 1;
      downBtn.setAttribute('aria-label', `Move ${item.title} lower on the Nice List`);
      downBtn.addEventListener('click', () => moveItem(index, index + 1));

      controls.append(upBtn, downBtn);
      if (index > 0) {
        const topBtn = el('button', 'ctrl-btn ctrl-btn-top', '🌟 #1 Wish');
        topBtn.id = `jump-top-${item.id}`;
        topBtn.type = 'button';
        topBtn.setAttribute('aria-label', `Crown ${item.title} #1 on the Nice List`);
        topBtn.addEventListener('click', () => moveItem(index, 0));
        controls.appendChild(topBtn);
      }

      card.append(numBadge, body, controls);
      rankList.appendChild(card);
    });
  }

  renderRankList();
  rankSec.appendChild(rankList);
  shell.appendChild(rankSec);

  // 6. Chapter 3: Santa's Official Naughty List & Lump-of-Coal Chute!
  const naughtySec = el('section', 'section-card section-card-naughty');
  naughtySec.id = 'chapter-naughty-list';
  naughtySec.appendChild(
    el('span', 'section-step section-step-coal', '🪨📜 Chapter 3 of 4 · Santa’s Official Naughty List')
  );
  naughtySec.appendChild(
    el('h2', 'section-title', 'Put Any Holiday Buzzkills Straight onto the Naughty List!')
  );
  naughtySec.appendChild(
    el(
      'p',
      'section-lead',
      'Every Christmas gathering sparkles brightest when we banish the Grinchy stuff ahead of time! Like Pedro, Cathy & Markus tossing early alarms and dirty dishes into the coal sack below, tap anything YOU want stamped onto the Naughty List (we’ll ship the coal straight to Woody Claus!):'
    )
  );

  // Visual Example Banner: Pedro, Cathy & Markus putting buzzkills onto the Naughty List & Coal Sack
  const visualFrame = el('div', 'naughty-visual-frame');
  const naughtyBannerImg = el('img', 'naughty-banner-img');
  naughtyBannerImg.src = './assets/naughty-list-scroll.jpg';
  naughtyBannerImg.alt =
    'Comic illustration of Grand Otter Pedro using candy-cane tongs to drop an early alarm clock and raincloud into a coal sack, GOTY Cathy stamping a crimson wax seal on the Naughty List scroll, and Chef Markus tossing dirty dishes and crowd ropes into the coal sack';
  const visualCaption = el('div', 'naughty-visual-caption');
  visualCaption.append(
    el(
      'span',
      undefined,
      '🎨 How the Naughty List Works: Tap any holiday Grinch below to wax-seal it onto the scroll & drop a lump of coal in Woody Claus’s sack!'
    ),
    el('span', 'naughty-example-flow', '⏰ Early Alarms + 🧽 Dish Piles ➔ 🪨 Naughty List!')
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
    '🪶 Write In Any Extra Holiday Grinch to Put on the Naughty List (Optional):'
  );
  customNaughtyLabel.htmlFor = 'custom-naughty-input';
  const customNaughtyInput = el('input', 'text-input');
  customNaughtyInput.id = 'custom-naughty-input';
  customNaughtyInput.type = 'text';
  customNaughtyInput.maxLength = 220;
  customNaughtyInput.placeholder =
    'e.g., Waiting in ferry/restaurant lines, cold soggy socks, skipping afternoon cocoa...';
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
    const totalCoalCount = state.vetoedIds.length + (trimmedCustom ? 1 : 0);

    const header = el('div', 'scroll-header');
    const headingWrap = el('div', 'scroll-heading-wrap');
    headingWrap.appendChild(el('div', 'wax-seal-medal', '📜'));
    const titleBox = el('div');
    titleBox.appendChild(el('h3', 'scroll-title', 'Official Victoria Naughty List Scroll'));
    titleBox.appendChild(
      el(
        'p',
        'scroll-subtitle',
        totalCoalCount === 0
          ? 'Unfurled & waiting for your wax seal!'
          : 'Officially banished from our Dec 10–14 Christmas gathering!'
      )
    );
    headingWrap.appendChild(titleBox);

    const coalCounter = el('div', 'coal-sack-counter');
    const lumpsRow = el('span', 'coal-lumps-row');
    const visualDots = Math.min(Math.max(totalCoalCount, 1), 6);
    for (let i = 0; i < visualDots; i++) {
      lumpsRow.appendChild(el('span', 'coal-lump-dot'));
    }
    const coalLabel = el(
      'span',
      undefined,
      totalCoalCount === 1
        ? '1 Lump of Coal for Woody Claus!'
        : `${totalCoalCount} Lumps of Coal for Woody Claus!`
    );
    coalCounter.append(lumpsRow, coalLabel);
    header.append(headingWrap, coalCounter);
    parchment.appendChild(header);

    const entriesList = el('ul', 'scroll-entries');
    if (totalCoalCount === 0) {
      const emptyLi = el('li', 'scroll-empty-example');
      emptyLi.append(
        el('strong', undefined, 'Visual Example on Scroll: '),
        el(
          'span',
          undefined,
          '⏰ "The Crack-of-Dawn Rooster Elf (Early alarms before coffee)" ➔ 🪨 Stamped onto the Naughty List! Tap any card above to toss holiday Grinches onto this scroll.'
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
          el('span', undefined, `${opt.icon}🪨`),
          el('span', undefined, `${opt.grinchTitle} — ${opt.label}`)
        );
        const pardonBtn = el('button', 'scroll-pardon-btn', '✕ Take Off List');
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
          el('span', undefined, '🪶🪨'),
          el('span', undefined, `Write-In Naughty List Item: ${trimmedCustom}`)
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

      const iconMedal = el('span', 'naughty-icon-medal', active ? '🪨' : opt.icon);
      iconMedal.setAttribute('aria-hidden', 'true');

      const content = el('span', 'naughty-card-content');
      content.appendChild(el('span', 'naughty-grinch-title', opt.grinchTitle));
      content.appendChild(el('span', 'naughty-desc', opt.label));

      const stampRow = el('span', 'naughty-stamp-row');
      stampRow.appendChild(
        el(
          'span',
          'naughty-stamp',
          active ? '🪨 On Naughty List! (+1 Coal)' : '📜 Put on Naughty List'
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

  // 7. Chapter 4: Mrs. Claus's Pantry, Sleigh-Bell Pace & Christmas Wishes
  const kitchenSec = el('section', 'section-card');
  kitchenSec.id = 'chapter-pantry-wishes';
  kitchenSec.appendChild(
    el('span', 'section-step section-step-nice', '☕🥧 Chapter 4 of 4 · Mrs. Claus’s Pantry & Wishes')
  );
  kitchenSec.appendChild(
    el('h2', 'section-title', 'Sleigh-Bell Pace, Christmas Morning Mug & Holiday Wishes')
  );
  kitchenSec.appendChild(
    el(
      'p',
      'section-lead',
      'So your favorite steaming morning drinks, bakery treats, and holiday classics are waiting under the garland when you walk in Thursday, Dec 10!'
    )
  );

  const paceGroup = el('div', 'field-group');
  paceGroup.appendChild(el('span', 'field-label', '🕯️ Ideal Christmas Gathering Pace:'));
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
    '☕🍪 Christmas Morning Mug & Stocked Pantry Favorites:'
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
    '🥧🎬🎲 #1 Christmas Feast Dish, Classic Holiday Movie, Carol, or Game Night Wish:'
  );
  wishLabel.htmlFor = 'wish-input';
  const wishInput = el('input', 'text-input');
  wishInput.id = 'wish-input';
  wishInput.type = 'text';
  wishInput.maxLength = 180;
  wishInput.placeholder =
    'e.g., Favorite Christmas dish, Muppet Christmas Carol / Elf, Tommy’s new holiday game...';
  wishInput.value = state.christmasFeastOrGameWish;
  wishInput.addEventListener('input', () => {
    state.christmasFeastOrGameWish = wishInput.value;
    saveDraft(state);
  });
  wishGroup.append(wishLabel, wishInput);

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
    '🕯️🎻 Candlelight Carols Bonus: Tell me more about Victoria Symphony’s "Messiah by Candlelight" at Christ Church Cathedral (Fri Dec 11 or Sat Dec 12 @ 7:30pm, or Sun 2:30pm)!'
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

  kitchenSec.append(paceGroup, coffeeGroup, wishGroup, symphonyRow, hpWrap);
  shell.appendChild(kitchenSec);

  // 8. Seal Christmas Scroll & Share Section
  const submitSec = el('section', 'section-card');
  const validationBox = el('div', 'validation-banner');
  validationBox.hidden = true;

  const submitBtn = el(
    'button',
    'submit-btn',
    '🎄📜 Seal My Christmas Wish Scroll & Pack the Coal!'
  );
  submitBtn.id = 'seal-scroll-btn';
  submitBtn.type = 'button';

  const receiptContainer = el('div');

  function renderReceipt(): void {
    receiptContainer.replaceChildren();
    if (!lastReceiptText) return;

    const box = el('div', 'receipt-card');
    box.appendChild(
      el('h3', 'receipt-title', '🎅✨ Christmas Scroll Sealed! Send 1-Tap Copy to Family Chat:')
    );
    box.appendChild(el('p', 'section-lead', lastDeliveryNote));

    const pre = el('pre', 'receipt-pre', lastReceiptText);
    const actions = el('div', 'receipt-actions');

    const shareBtn = el(
      'button',
      'action-btn action-btn-primary',
      '📲 Send Scroll to Family Chat (1 Tap)'
    );
    shareBtn.id = 'share-family-chat-btn';
    shareBtn.type = 'button';
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Victoria Christmas Wish Scroll',
            text: lastReceiptText,
          });
          return;
        } catch {
          // User cancelled or share unavailable; fall back to clipboard
        }
      }
      await navigator.clipboard.writeText(lastReceiptText);
      shareBtn.textContent = '✅ Scroll Copied! Paste in Family Chat';
    });

    const copyBtn = el('button', 'action-btn action-btn-secondary', '📋 Copy Christmas Scroll');
    copyBtn.id = 'copy-scroll-btn';
    copyBtn.type = 'button';
    copyBtn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(lastReceiptText);
      copyBtn.textContent = '✅ Copied with North Pole Cheer!';
      window.setTimeout(() => {
        copyBtn.textContent = '📋 Copy Christmas Scroll';
      }, 2800);
    });

    actions.append(shareBtn, copyBtn);
    box.append(pre, actions);
    receiptContainer.appendChild(box);
  }

  submitBtn.addEventListener('click', async () => {
    if (state.honeypot.trim() !== '') return;

    const voter = CAST_MEMBERS.find((c) => c.id === state.voterId);
    if (!voter) {
      validationBox.hidden = false;
      validationBox.textContent =
        '🎅 Quick Christmas step first: Tap your Holiday Hero portrait at Chapter 1 (Pedro, Cathy, Tommy, Tricia, or Markus) to sign the scroll!';
      castSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!checkCooldownAllowed()) {
      return;
    }

    validationBox.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = '✨ Wax-Sealing Your Christmas Scroll...';

    const naughtyLabelMap = new Map(
      NAUGHTY_LIST_OPTIONS.map((p) => [p.id, `${p.grinchTitle} (${p.label})`])
    );
    const payload: VictoriaBallotPayload = {
      submittedAtIso: new Date().toISOString(),
      voterId: voter.id,
      voterName: voter.name,
      heroTitle: voter.heroTitle,
      rankedActivities: state.orderedIds.map((id, idx) => {
        const act = activityById.get(id)!;
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
      symphonyCandlelightInterest: state.symphonyCandlelightInterest,
    };

    const result = await postBallotToSheetWebhook(payload);
    lastReceiptText = formatEmojiBallotReceipt(payload);
    lastDeliveryNote = result.note;

    submitBtn.disabled = false;
    submitBtn.textContent = '🎄✨ Re-Seal My Updated Christmas Wish Scroll';
    renderReceipt();
    receiptContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  submitSec.append(validationBox, submitBtn, receiptContainer);
  shell.appendChild(submitSec);

  root.replaceChildren(shell);
}

mountApp();
