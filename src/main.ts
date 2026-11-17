import './style.css';
import {
  CAST_MEMBERS,
  VERIFIED_VICTORIA_ACTIVITIES,
  PET_PEEVE_OPTIONS,
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

function mountApp(): void {
  const root = document.getElementById('app');
  if (!root) return;

  const state = loadInitialState();
  let draggedActivityId: string | null = null;
  let lastReceiptText = '';
  let lastDeliveryNote = '';

  const shell = el('main', 'page-shell');

  // 1. Hero Header
  const hero = el('header', 'hero-card');
  const heroImg = el('img', 'hero-banner-img');
  heroImg.src = './assets/hero-harbour.jpg';
  heroImg.alt =
    'Illustrated Narbaitz & Selkirk holiday hero squad arriving at Victoria Inner Harbour';
  const heroCopy = el('div', 'hero-copy');
  heroCopy.appendChild(el('span', 'eyebrow-pill', 'Thu Dec 10 – Mon Dec 14, 2026 · Victoria, BC'));
  heroCopy.appendChild(
    el('h1', 'hero-title', 'Narbaitz Victoria Christmas · 60-Second Holiday Ballot!')
  );
  heroCopy.appendChild(
    el(
      'p',
      'hero-subtitle',
      'Three core days together (Fri Dec 11, Sat Dec 12 & Sun Dec 13), one sneaky 5-Adult Secret Stocking Ring, delicious home feasts, and zero holiday stress.'
    )
  );
  hero.append(heroImg, heroCopy);
  shell.appendChild(hero);

  // 2. Secret Stocking Ring Refresher Card
  const stockingSec = el('section', 'section-card');
  stockingSec.appendChild(el('span', 'section-step', 'Quick Holiday Guide · Part 1'));
  stockingSec.appendChild(el('h2', 'section-title', 'The 5-Adult Secret Stocking Ring'));
  stockingSec.appendChild(
    el(
      'p',
      'section-lead',
      'Instead of suitcase-busting piles of big boxes, each adult gets ONE secret adult stocking to curate with love!'
    )
  );
  const stockingGrid = el('div', 'stocking-grid');
  const stockingImg = el('img', 'stocking-img');
  stockingImg.src = './assets/stocking-ring.jpg';
  stockingImg.alt = 'Five adult stockings plus Barclay mini-stocking on the Victoria fireplace mantel';
  const ruleList = el('ul', 'rule-list');
  const rules: Array<[string, string]> = [
    [
      '1. One Secret Adult Assignment',
      'Pedro, Cathy, Tommy, Tricia & Markus each draw 1 adult in a closed 5-person ring (check your private text from Markus for your secret person!).',
    ],
    [
      '2. $35–$50 Budget & Carry-On Friendly',
      'Keep everything compact, thoughtful, funny, or delicious so flying/ferrying in and out of Victoria is effortless.',
    ],
    [
      '3. Open Bonus Mini-Stocking for Barclay',
      'Chief Elf Barclay has his own mini-stocking on the mantel—totally optional if anyone spots a tiny board book, sticker, or toddler snack!',
    ],
  ];
  for (const [heading, detail] of rules) {
    const li = el('li', 'rule-item');
    const strong = el('strong', undefined, heading);
    const span = el('span', undefined, detail);
    li.append(strong, span);
    ruleList.appendChild(li);
  }
  stockingGrid.append(stockingImg, ruleList);
  stockingSec.appendChild(stockingGrid);
  shell.appendChild(stockingSec);

  // 3. Step 1: Character Selector
  const castSec = el('section', 'section-card');
  castSec.appendChild(el('span', 'section-step', 'Step 1 of 4 · Pick Your Hero'));
  castSec.appendChild(el('h2', 'section-title', 'Who Is Casting This Ballot?'));
  castSec.appendChild(el('p', 'section-lead', 'Tap your custom Holiday Hero portrait below:'));
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
      greetingBanner.textContent = `${active.name} (${active.rosterBadge}): ${active.greeting}`;
      coffeeInput.placeholder = active.coffeePlaceholder;
    } else {
      greetingBanner.hidden = true;
    }
  }
  renderCastPicker();
  castSec.append(castGrid, greetingBanner);
  shell.appendChild(castSec);

  // 4. Step 2: Drag-to-Rank Victoria Experiences
  const rankSec = el('section', 'section-card');
  rankSec.appendChild(el('span', 'section-step', 'Step 2 of 4 · Rank Most Important → Least Important'));
  rankSec.appendChild(
    el('h2', 'section-title', 'Drag (or Tap ▲ / ▼) to Rank Our Victoria Ideas')
  );
  rankSec.appendChild(
    el(
      'p',
      'section-lead',
      'Put the things you are MOST excited about at #1–#4! Note: Friday Dec 11 (8am–5pm) is our ONLY Barclay-free daycare window for sit-down restaurants or 19+ spots; Sat & Sun flow around his 12–2pm nap and ~7pm bedtime.'
    )
  );

  const legend = el('div', 'window-legend');
  const legendItems: Array<[string, string]> = [
    ['tone-adult-friday', 'Fri 8am–5pm Adult-Only (Barclay @ Daycare)'],
    ['tone-family-morning', 'Sat/Sun Morning (With Barclay)'],
    ['tone-twinkle-afternoon', 'Sat/Sun Post-Nap Twinkle Wave'],
    ['tone-cozy-evening', 'Post-7pm Cozy Adult Evening'],
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

      const card = el(
        'div',
        index < 3 ? 'rank-card is-top-three' : 'rank-card'
      );
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

      const numBadge = el('div', 'rank-number', `#${index + 1}`);

      const body = el('div', 'rank-body');
      const winBadge = el('span', `badge-window tone-${item.windowTone}`, item.windowLabel);
      const title = el('h3', 'rank-title', item.title);
      const summary = el('p', 'rank-summary', item.summary);
      body.append(winBadge, title, summary);

      const controls = el('div', 'rank-controls');
      const upBtn = el('button', 'ctrl-btn', '▲ Up');
      upBtn.type = 'button';
      upBtn.disabled = index === 0;
      upBtn.setAttribute('aria-label', `Move ${item.title} up`);
      upBtn.addEventListener('click', () => moveItem(index, index - 1));

      const downBtn = el('button', 'ctrl-btn', '▼ Down');
      downBtn.type = 'button';
      downBtn.disabled = index === state.orderedIds.length - 1;
      downBtn.setAttribute('aria-label', `Move ${item.title} down`);
      downBtn.addEventListener('click', () => moveItem(index, index + 1));

      controls.append(upBtn, downBtn);
      if (index > 0) {
        const topBtn = el('button', 'ctrl-btn ctrl-btn-top', '★ #1');
        topBtn.type = 'button';
        topBtn.setAttribute('aria-label', `Jump ${item.title} to #1`);
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

  // 5. Step 3: Official Trip-Ruiner Veto Stamp
  const vetoSec = el('section', 'section-card');
  vetoSec.appendChild(el('span', 'section-step', 'Step 3 of 4 · Protect the Vibe'));
  vetoSec.appendChild(
    el('h2', 'section-title', 'What Pisses You Off or Makes a Group Trip Bad?')
  );
  vetoSec.appendChild(
    el(
      'p',
      'section-lead',
      'Tap anything below to stamp it BANNED so we design our 3 days with zero friction:'
    )
  );

  const peeveGrid = el('div', 'peeve-grid');
  function renderPeeves(): void {
    peeveGrid.replaceChildren();
    for (const opt of PET_PEEVE_OPTIONS) {
      const active = state.vetoedIds.includes(opt.id);
      const btn = el('button', active ? 'peeve-btn is-vetoed' : 'peeve-btn');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      const labelSpan = el('span', undefined, opt.label);
      const stampSpan = el('span', 'peeve-stamp', active ? 'Banned!' : 'Tap to Ban');
      btn.append(labelSpan, stampSpan);
      btn.addEventListener('click', () => {
        if (state.vetoedIds.includes(opt.id)) {
          state.vetoedIds = state.vetoedIds.filter((x) => x !== opt.id);
        } else {
          state.vetoedIds = [...state.vetoedIds, opt.id];
        }
        saveDraft(state);
        renderPeeves();
      });
      peeveGrid.appendChild(btn);
    }
  }
  renderPeeves();

  const customVetoGroup = el('div', 'field-group');
  const customVetoLabel = el(
    'label',
    'field-label',
    'Anything else we should officially ban from the weekend? (Optional)'
  );
  customVetoLabel.htmlFor = 'custom-veto-input';
  const customVetoInput = el('input', 'text-input');
  customVetoInput.id = 'custom-veto-input';
  customVetoInput.type = 'text';
  customVetoInput.maxLength = 220;
  customVetoInput.placeholder = 'e.g., Waiting in ferry/restaurant lines, cold wet shoes...';
  customVetoInput.value = state.customVetoNote;
  customVetoInput.addEventListener('input', () => {
    state.customVetoNote = customVetoInput.value;
    saveDraft(state);
  });
  customVetoGroup.append(customVetoLabel, customVetoInput);
  vetoSec.append(peeveGrid, customVetoGroup);
  shell.appendChild(vetoSec);

  // 6. Step 4: Kitchen Stocking, Feast Wish & Pace
  const kitchenSec = el('section', 'section-card');
  kitchenSec.appendChild(el('span', 'section-step', 'Step 4 of 4 · Spoil-You Details'));
  kitchenSec.appendChild(el('h2', 'section-title', 'Kitchen Stock Order & Holiday Wishes'));
  kitchenSec.appendChild(
    el(
      'p',
      'section-lead',
      'So your favorite morning drinks and snacks are waiting when you walk in Thu Dec 10!'
    )
  );

  const paceGroup = el('div', 'field-group');
  paceGroup.appendChild(el('span', 'field-label', 'Ideal Overall Weekend Pace:'));
  const paceGrid = el('div', 'pace-grid');
  function renderPace(): void {
    paceGrid.replaceChildren();
    for (const score of [1, 2, 3, 4]) {
      const btn = el(
        'button',
        state.paceScore === score ? 'pace-btn is-active' : 'pace-btn',
        PACE_LABELS[score]
      );
      btn.type = 'button';
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
    'Morning Coffee / Tea & Must-Stock Kitchen Snacks:'
  );
  coffeeLabel.htmlFor = 'coffee-input';
  coffeeInput.id = 'coffee-input';
  coffeeInput.type = 'text';
  coffeeInput.maxLength = 180;
  if (!coffeeInput.placeholder) {
    coffeeInput.placeholder = 'e.g., Dark roast coffee, herbal tea, croissants, fruit...';
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
    '#1 Christmas Dish, Family Tradition, Movie, or Game Night Request:'
  );
  wishLabel.htmlFor = 'wish-input';
  const wishInput = el('input', 'text-input');
  wishInput.id = 'wish-input';
  wishInput.type = 'text';
  wishInput.maxLength = 180;
  wishInput.placeholder = 'e.g., Favorite family dish, classic holiday movie, Tommy’s new game...';
  wishInput.value = state.christmasFeastOrGameWish;
  wishInput.addEventListener('input', () => {
    state.christmasFeastOrGameWish = wishInput.value;
    saveDraft(state);
  });
  wishGroup.append(wishLabel, wishInput);

  const symphonyRow = el('label', 'checkbox-row');
  const symphonyCheck = el('input');
  symphonyCheck.type = 'checkbox';
  symphonyCheck.checked = state.symphonyCandlelightInterest;
  symphonyCheck.addEventListener('change', () => {
    state.symphonyCandlelightInterest = symphonyCheck.checked;
    saveDraft(state);
  });
  const symphonyText = el(
    'span',
    undefined,
    'Optional Bonus Check: Tell me more about Victoria Symphony’s "Messiah by Candlelight" at Christ Church Cathedral (Fri Dec 11 or Sat Dec 12 @ 7:30pm, or Sun 2:30pm)!'
  );
  symphonyRow.append(symphonyCheck, symphonyText);

  // Anti-bot honeypot field
  const hpWrap = el('div', 'hp-trap');
  hpWrap.setAttribute('aria-hidden', 'true');
  const hpInput = el('input');
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

  // 7. Submit & Share Section
  const submitSec = el('section', 'section-card');
  const validationBox = el('div', 'validation-banner');
  validationBox.hidden = true;

  const submitBtn = el('button', 'submit-btn', '🎄 Lock In My Victoria Holiday Ballot!');
  submitBtn.type = 'button';

  const receiptContainer = el('div');

  function renderReceipt(): void {
    receiptContainer.replaceChildren();
    if (!lastReceiptText) return;

    const box = el('div', 'receipt-card');
    box.appendChild(el('h3', 'receipt-title', '🎉 Ballot Locked! Send 1-Tap Copy to Family Chat:'));
    box.appendChild(el('p', 'section-lead', lastDeliveryNote));

    const pre = el('pre', 'receipt-pre', lastReceiptText);
    const actions = el('div', 'receipt-actions');

    const shareBtn = el('button', 'action-btn action-btn-primary', '📲 Share to Family Chat (1 Tap)');
    shareBtn.type = 'button';
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Victoria Christmas Ballot',
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

    const copyBtn = el('button', 'action-btn action-btn-secondary', '📋 Copy Emoji Summary');
    copyBtn.type = 'button';
    copyBtn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(lastReceiptText);
      copyBtn.textContent = '✅ Copied to Clipboard!';
      window.setTimeout(() => {
        copyBtn.textContent = '📋 Copy Emoji Summary';
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
        '👆 Quick step first: Tap your character card at Step 1 (Pedro, Cathy, Tommy, Tricia, or Markus)!';
      castSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!checkCooldownAllowed()) {
      return;
    }

    validationBox.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = '✨ Saving Your Holiday Ballot...';

    const peeveLabelMap = new Map(PET_PEEVE_OPTIONS.map((p) => [p.id, p.label]));
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
        .map((id) => peeveLabelMap.get(id) || '')
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
    submitBtn.textContent = '✅ Update My Victoria Holiday Ballot';
    renderReceipt();
    receiptContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  submitSec.append(validationBox, submitBtn, receiptContainer);
  shell.appendChild(submitSec);

  root.replaceChildren(shell);
}

mountApp();
