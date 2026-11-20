import './style.css';
import {
  CAST_MEMBERS,
  VIBE_OPTIONS,
  SLIDER_DIMENSIONS,
  FRIDAY_VIBE_OPTIONS,
  QUICK_BUZZKILL_CHIPS,
  type VibeOption,
} from './data';
import {
  sanitizeInputText,
  checkCooldownAllowed,
  postBallotToSheetWebhook,
  type VictoriaBallotPayload,
} from './utils/formSubmission';

const STORAGE_KEY = 'xmas_victoria_2026_dispatch_v5';
const SVG_NS = 'http://www.w3.org/2000/svg';

interface AppState {
  voterId: string;
  vibeChoiceId: string;
  adventureVsRelax: number;
  indoorsVsOutdoors: number;
  familiarVsNew: number;
  fridayPriorities: string[];
  bucketList: string;
  buzzkillList: string;
  quickBuzzkills: string[];
  honeypot: string;
}

function clampSlider(val: unknown, fallback = 3): number {
  const n = typeof val === 'number' ? Math.round(val) : fallback;
  return n >= 1 && n <= 5 ? n : fallback;
}

function loadInitialState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      const validVoter = CAST_MEMBERS.some((m) => m.id === parsed.voterId)
        ? (parsed.voterId as string)
        : '';
      const validVibe = VIBE_OPTIONS.some((v) => v.id === parsed.vibeChoiceId)
        ? (parsed.vibeChoiceId as string)
        : '';
      const validFridayIds = new Set(FRIDAY_VIBE_OPTIONS.map((f) => f.id));
      const validChips = new Set(QUICK_BUZZKILL_CHIPS);
      return {
        voterId: validVoter,
        vibeChoiceId: validVibe,
        adventureVsRelax: clampSlider(parsed.adventureVsRelax, 3),
        indoorsVsOutdoors: clampSlider(parsed.indoorsVsOutdoors, 3),
        familiarVsNew: clampSlider(parsed.familiarVsNew, 3),
        fridayPriorities: Array.isArray(parsed.fridayPriorities)
          ? parsed.fridayPriorities.filter(
              (id): id is string => typeof id === 'string' && validFridayIds.has(id)
            )
          : [],
        bucketList: typeof parsed.bucketList === 'string' ? parsed.bucketList : '',
        buzzkillList: typeof parsed.buzzkillList === 'string' ? parsed.buzzkillList : '',
        quickBuzzkills: Array.isArray(parsed.quickBuzzkills)
          ? parsed.quickBuzzkills.filter(
              (c): c is string => typeof c === 'string' && validChips.has(c)
            )
          : [],
        honeypot: '',
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return {
    voterId: '',
    vibeChoiceId: '',
    adventureVsRelax: 3,
    indoorsVsOutdoors: 3,
    familiarVsNew: 3,
    fridayPriorities: [],
    bucketList: '',
    buzzkillList: '',
    quickBuzzkills: [],
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
  let lastDeliveryNote = '';
  let lastSubmittedName = '';
  let lastDelivered = false;

  // Preload all 3 interactive vibe comic illustrations for instant switching
  VIBE_OPTIONS.forEach((opt) => {
    const preload = new Image();
    preload.src = opt.imageSrc;
  });

  const shell = el('main', 'page-shell');

  // 1. Woody Clause Header
  const hero = el('header', 'hero-card');
  hero.appendChild(el('div', 'cedar-bark-trim'));
  hero.appendChild(createMycelialGarlandSvg());

  const heroImg = el('img', 'hero-banner-img');
  heroImg.src = './assets/woody-claws-hero.jpg';
  heroImg.alt =
    'Bronze-Age comic illustration of Malahat driftwood giant Woody Clause carving cedar survey scrolls for the Victoria trip';

  const heroCopy = el('div', 'hero-copy');
  heroCopy.appendChild(
    el(
      'span',
      'postmark-stamp',
      'Official Tree-Mail from Woody Clause · Dec 10–14, 2026 · Victoria, BC'
    )
  );
  heroCopy.appendChild(el('h1', 'hero-title', 'WE WOOD LOVE YOUR INPUT!'));
  heroCopy.appendChild(
    el(
      'p',
      'hero-subtitle',
      'Don’t LEAF Woody Clause hanging! Take 60 seconds to share your vibe, wishes, and must-skips so Markus & Tricia can make Dec 10–14 effortless.'
    )
  );

  const heroActions = el('div', 'hero-comic-bar');
  const comicLink = el(
    'a',
    'comic-pdf-pill',
    '📖 Read Issue #1 Comic: "Love at First Slide" (PDF)'
  );
  comicLink.href = './assets/woody-claws-issue-1.pdf';
  comicLink.target = '_blank';
  comicLink.rel = 'noopener noreferrer';
  heroActions.appendChild(comicLink);
  heroCopy.appendChild(heroActions);

  hero.append(heroImg, heroCopy);
  shell.appendChild(hero);

  // 2. Step 1 of 4: Voter Picker (Pedro, Cathy, Tom ONLY)
  const castSec = el('section', 'section-card');
  castSec.id = 'step-hero-picker';
  castSec.appendChild(el('span', 'section-step', 'Step 1 of 4 · Who’s Answering?'));
  castSec.appendChild(el('h2', 'section-title', 'Tap Your Portrait'));

  const castGrid = el('div', 'cast-grid cast-grid-three');

  function renderCastPicker(): void {
    castGrid.replaceChildren();
    for (const member of CAST_MEMBERS) {
      const isSelected = state.voterId === member.id;
      const btn = el('button', isSelected ? 'cast-btn is-selected' : 'cast-btn');
      btn.id = `cast-btn-${member.id}`;
      btn.type = 'button';
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      const img = el('img', 'cast-avatar');
      img.src = member.avatarSrc;
      img.alt = `${member.name} portrait`;

      const nameEl = el('span', 'cast-name', member.name);
      const statePill = el(
        'span',
        isSelected ? 'cast-check is-selected' : 'cast-check',
        isSelected ? '✓ Selected' : 'Tap to select'
      );

      btn.append(img, nameEl, statePill);
      btn.addEventListener('click', () => {
        state.voterId = member.id;
        saveDraft(state);
        renderCastPicker();
      });
      castGrid.appendChild(btn);
    }
  }
  renderCastPicker();
  castSec.appendChild(castGrid);
  shell.appendChild(castSec);

  // 3. Step 2 of 4: Holiday Vibe Check (Picture + 3 Horizontal Columns right underneath!)
  const vibeSec = el('section', 'section-card');
  vibeSec.id = 'step-vibe-check';
  vibeSec.appendChild(el('span', 'section-step section-step-nice', 'Step 2 of 4 · The Holiday Vibe Check'));
  vibeSec.appendChild(el('h2', 'section-title', 'How Festive Should Victoria Feel?'));
  vibeSec.appendChild(
    el(
      'p',
      'section-lead',
      'Tap Option 1, 2, or 3 below the picture to watch the Christmas vibe change — no scrolling needed:'
    )
  );

  const vibeBannerFrame = el('div', 'vibe-banner-frame vibe-banner-tight');
  const vibeStageWrap = el('div', 'vibe-stage-wrap');
  const vibeBannerImg = el('img', 'vibe-banner-img');
  const vibeStagePill = el('span', 'vibe-stage-pill');
  vibeStageWrap.append(vibeBannerImg, vibeStagePill);
  vibeBannerFrame.appendChild(vibeStageWrap);

  const vibeTabsRow = el('div', 'vibe-tabs-row');
  const vibeActiveDetail = el('div', 'vibe-active-detail');

  function renderVibeOptions(animate = false): void {
    const activeOpt: VibeOption =
      VIBE_OPTIONS.find((v) => v.id === state.vibeChoiceId) || VIBE_OPTIONS[1];

    if (animate) {
      vibeBannerImg.classList.remove('is-swapping');
      void vibeBannerImg.offsetWidth;
      vibeBannerImg.classList.add('is-swapping');
    }
    vibeBannerImg.src = activeOpt.imageSrc;
    vibeBannerImg.alt = activeOpt.imageAlt;
    vibeStagePill.textContent = state.vibeChoiceId
      ? activeOpt.badge
      : 'Previewing Option 2 · Tap a button below';

    vibeTabsRow.replaceChildren();
    for (const opt of VIBE_OPTIONS) {
      const selected = state.vibeChoiceId === opt.id;
      const tab = el('button', selected ? 'vibe-tab-col is-selected' : 'vibe-tab-col');
      tab.id = `vibe-btn-${opt.id}`;
      tab.type = 'button';
      tab.setAttribute('aria-pressed', selected ? 'true' : 'false');

      tab.append(
        el('span', 'vibe-tab-num', selected ? `✓ ${opt.tabNum}` : opt.tabNum),
        el('span', 'vibe-tab-title', opt.tabTitle),
        el('span', 'vibe-tab-sub', opt.tabSub)
      );

      tab.addEventListener('click', () => {
        const changed = state.vibeChoiceId !== opt.id;
        state.vibeChoiceId = opt.id;
        saveDraft(state);
        renderVibeOptions(changed);
      });
      vibeTabsRow.appendChild(tab);
    }

    vibeActiveDetail.replaceChildren();
    const detailHead = el('div', 'vibe-detail-head');
    detailHead.append(
      el('strong', 'vibe-detail-title', activeOpt.title),
      el(
        'span',
        state.vibeChoiceId ? 'vibe-detail-status is-selected' : 'vibe-detail-status',
        state.vibeChoiceId ? '✓ Selected' : 'Tap an option above'
      )
    );
    vibeActiveDetail.append(
      detailHead,
      el('p', 'vibe-detail-desc', activeOpt.description)
    );
  }
  renderVibeOptions(false);
  vibeSec.append(vibeBannerFrame, vibeTabsRow, vibeActiveDetail);
  shell.appendChild(vibeSec);

  // 4. Step 3 of 4: Trip Sliders + Friday Barclay-Free Day
  const styleSec = el('section', 'section-card');
  styleSec.id = 'step-trip-style';
  styleSec.appendChild(el('span', 'section-step section-step-nice', 'Step 3 of 4 · Your Ideal Trip Style'));
  styleSec.appendChild(el('h2', 'section-title', 'Dial In Your West Coast Pace & Vibe'));
  styleSec.appendChild(
    el(
      'p',
      'section-lead',
      'Slide each dial to show how you want the trip to feel — no need to pick exact venues yet:'
    )
  );

  const slidersStack = el('div', 'sliders-stack');
  for (const dim of SLIDER_DIMENSIONS) {
    const card = el('div', 'slider-card');
    const head = el('div', 'slider-head');
    const titleEl = el('label', 'slider-title', dim.title);
    titleEl.htmlFor = `slider-${dim.id}`;
    const valuePill = el('span', 'slider-value-pill', `${state[dim.id]} / 5`);
    head.append(titleEl, valuePill);

    const endpoints = el('div', 'slider-endpoints');
    endpoints.append(
      el('span', 'slider-end-label', dim.leftLabel),
      el('span', 'slider-end-label slider-end-right', dim.rightLabel)
    );

    const input = el('input', 'cedar-slider');
    input.id = `slider-${dim.id}`;
    input.type = 'range';
    input.min = '1';
    input.max = '5';
    input.step = '1';
    input.value = String(state[dim.id]);

    const readOut = el('p', 'slider-readout', dim.scaleLabels[state[dim.id]]);

    input.addEventListener('input', () => {
      const nextVal = clampSlider(Number(input.value), 3);
      state[dim.id] = nextVal;
      valuePill.textContent = `${nextVal} / 5`;
      readOut.textContent = dim.scaleLabels[nextVal];
      saveDraft(state);
    });

    card.append(head, endpoints, input, readOut);
    slidersStack.appendChild(card);
  }
  styleSec.appendChild(slidersStack);

  const fridayDivider = el('div', 'sub-section-block');
  fridayDivider.appendChild(
    el('h3', 'sub-section-title', 'Friday, Dec 11 — Our Barclay-Free Adult Day (8am–5pm)')
  );
  fridayDivider.appendChild(
    el(
      'p',
      'section-lead sub-section-lead',
      'Barclay is at daycare all day Friday, so it’s our special child-free window. Tap whichever sound best to you (pick 1 or 2):'
    )
  );

  const fridayGrid = el('div', 'friday-vibe-grid');
  function renderFridayVibes(): void {
    fridayGrid.replaceChildren();
    for (const opt of FRIDAY_VIBE_OPTIONS) {
      const active = state.fridayPriorities.includes(opt.id);
      const card = el('button', active ? 'friday-vibe-card is-selected' : 'friday-vibe-card');
      card.id = `friday-vibe-${opt.id}`;
      card.type = 'button';
      card.setAttribute('aria-pressed', active ? 'true' : 'false');

      const topRow = el('span', 'friday-vibe-top');
      topRow.append(
        el('span', 'friday-vibe-title', opt.title),
        el('span', 'friday-vibe-check', active ? '✓' : '+')
      );
      card.append(topRow, el('span', 'friday-vibe-summary', opt.summary));

      card.addEventListener('click', () => {
        if (state.fridayPriorities.includes(opt.id)) {
          state.fridayPriorities = state.fridayPriorities.filter((x) => x !== opt.id);
        } else {
          state.fridayPriorities = [...state.fridayPriorities, opt.id];
        }
        saveDraft(state);
        renderFridayVibes();
      });
      fridayGrid.appendChild(card);
    }
  }
  renderFridayVibes();
  fridayDivider.appendChild(fridayGrid);
  styleSec.appendChild(fridayDivider);
  shell.appendChild(styleSec);

  // 5. Step 4 of 4: West Coast Bucket List, Buzzkill List & Submit!
  const wishesSec = el('section', 'section-card section-card-wishes');
  wishesSec.id = 'step-bucket-buzzkills';
  wishesSec.appendChild(
    el('span', 'section-step section-step-mulch', 'Step 4 of 4 · Bucket List & Buzzkills')
  );
  wishesSec.appendChild(
    el('h2', 'section-title', 'What Are You Most Looking Forward To — And What Should We Skip?')
  );

  const bucketGroup = el('div', 'field-group');
  const bucketLabel = el(
    'label',
    'field-label',
    'What’s on your West Coast Bucket List for this trip?'
  );
  bucketLabel.htmlFor = 'bucket-list-input';
  const bucketHint = el(
    'p',
    'field-hint',
    'Anything you’re really looking forward to — a dream outing, favourite restaurant, coastal walk, game night, or simple moment.'
  );
  const bucketInput = el('textarea', 'text-area');
  bucketInput.id = 'bucket-list-input';
  bucketInput.rows = 3;
  bucketInput.maxLength = 360;
  bucketInput.placeholder =
    'e.g., Walking by the ocean, checking out a local pub or seafood spot, watching Sunday football together, lots of Barclay time...';
  bucketInput.value = state.bucketList;
  bucketInput.addEventListener('input', () => {
    state.bucketList = bucketInput.value;
    saveDraft(state);
  });
  bucketGroup.append(bucketLabel, bucketHint, bucketInput);

  const buzzkillGroup = el('div', 'field-group buzzkill-group');
  const buzzkillLabel = el(
    'label',
    'field-label',
    'What’s on your West Coast Buzzkill List? (Woody Clause will mulch it!)'
  );
  buzzkillLabel.htmlFor = 'buzzkill-list-input';
  const buzzkillHint = el(
    'p',
    'field-hint',
    'Things you absolutely don’t want to do again, or anything that drains your energy. Tap any quick chips or write your own:'
  );

  const chipRow = el('div', 'quick-chip-row');
  function renderBuzzkillChips(): void {
    chipRow.replaceChildren();
    for (const chipText of QUICK_BUZZKILL_CHIPS) {
      const active = state.quickBuzzkills.includes(chipText);
      const chip = el('button', active ? 'quick-chip is-selected' : 'quick-chip');
      chip.type = 'button';
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
      chip.textContent = active ? `✓ ${chipText}` : chipText;
      chip.addEventListener('click', () => {
        if (state.quickBuzzkills.includes(chipText)) {
          state.quickBuzzkills = state.quickBuzzkills.filter((x) => x !== chipText);
        } else {
          state.quickBuzzkills = [...state.quickBuzzkills, chipText];
        }
        saveDraft(state);
        renderBuzzkillChips();
      });
      chipRow.appendChild(chip);
    }
  }
  renderBuzzkillChips();

  const buzzkillInput = el('textarea', 'text-area');
  buzzkillInput.id = 'buzzkill-list-input';
  buzzkillInput.rows = 3;
  buzzkillInput.maxLength = 360;
  buzzkillInput.placeholder =
    'e.g., Rushed early mornings, waiting in long lines, over-scheduled days, anything you’d rather skip...';
  buzzkillInput.value = state.buzzkillList;
  buzzkillInput.addEventListener('input', () => {
    state.buzzkillList = buzzkillInput.value;
    saveDraft(state);
  });
  buzzkillGroup.append(buzzkillLabel, buzzkillHint, chipRow, buzzkillInput);

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

  const submitWrap = el('div', 'submit-block');
  const validationBox = el('div', 'validation-banner');
  validationBox.hidden = true;

  const submitBtn = el('button', 'submit-btn', 'Submit My Victoria Wishes 🌲');
  submitBtn.id = 'seal-scroll-btn';
  submitBtn.type = 'button';

  const receiptContainer = el('div');

  function renderConfirmation(): void {
    receiptContainer.replaceChildren();
    if (!lastDeliveryNote) return;

    const box = el('div', lastDelivered ? 'receipt-card' : 'validation-banner');
    if (lastDelivered) {
      box.appendChild(
        el('h3', 'receipt-title', `✓ Submitted — Thank You, ${lastSubmittedName}!`)
      );
      box.appendChild(el('p', 'section-lead', lastDeliveryNote));
      box.appendChild(
        el(
          'p',
          'receipt-meta',
          `Logged privately at ${new Date().toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })} · Dec 10–14 Victoria Trip`
        )
      );
    } else {
      box.textContent = lastDeliveryNote;
    }
    receiptContainer.appendChild(box);
  }

  const fridayById = new Map(FRIDAY_VIBE_OPTIONS.map((f) => [f.id, f.title]));
  const sliderById = new Map(SLIDER_DIMENSIONS.map((d) => [d.id, d]));

  submitBtn.addEventListener('click', async () => {
    if (state.honeypot.trim() !== '') return;

    const voter = CAST_MEMBERS.find((c) => c.id === state.voterId);
    if (!voter) {
      validationBox.hidden = false;
      validationBox.textContent = 'Quick check: tap Pedro, Cathy, or Tom in Step 1 first.';
      castSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const vibe = VIBE_OPTIONS.find((v) => v.id === state.vibeChoiceId);
    if (!vibe) {
      validationBox.hidden = false;
      validationBox.textContent =
        'Quick check: choose Option 1, 2, or 3 in Step 2 (The Holiday Vibe Check) first.';
      vibeSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!checkCooldownAllowed()) {
      validationBox.hidden = false;
      validationBox.textContent = 'Hang tight a couple seconds before resubmitting.';
      return;
    }

    validationBox.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending privately to Woody Clause...';

    const advDim = sliderById.get('adventureVsRelax')!;
    const indDim = sliderById.get('indoorsVsOutdoors')!;
    const famDim = sliderById.get('familiarVsNew')!;

    const payload: VictoriaBallotPayload = {
      schemaVersion: 'v5',
      submittedAtIso: new Date().toISOString(),
      voterId: voter.id,
      voterName: voter.name,
      vibeChoiceId: vibe.id,
      vibeChoiceLabel: vibe.shortLabel,
      sliders: {
        adventureVsRelax: {
          score: state.adventureVsRelax,
          label: advDim.scaleLabels[state.adventureVsRelax],
        },
        indoorsVsOutdoors: {
          score: state.indoorsVsOutdoors,
          label: indDim.scaleLabels[state.indoorsVsOutdoors],
        },
        familiarVsNew: {
          score: state.familiarVsNew,
          label: famDim.scaleLabels[state.familiarVsNew],
        },
      },
      fridayPriorities: state.fridayPriorities
        .map((id) => fridayById.get(id))
        .filter((t): t is string => Boolean(t)),
      bucketList: sanitizeInputText(state.bucketList, 360),
      buzzkillList: sanitizeInputText(state.buzzkillList, 360),
      quickBuzzkills: [...state.quickBuzzkills],
      morningCoffeeAndTreats: '',
      travelFlightOrFerryInfo: '',
    };

    const result = await postBallotToSheetWebhook(payload);
    lastSubmittedName = voter.name;
    lastDelivered = result.delivered;
    lastDeliveryNote = result.note;

    submitBtn.disabled = false;
    submitBtn.textContent = result.delivered
      ? 'Update & Resubmit My Wishes 🌲'
      : 'Submit My Victoria Wishes 🌲';
    renderConfirmation();
    receiptContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  submitWrap.append(validationBox, submitBtn, receiptContainer);
  wishesSec.append(bucketGroup, buzzkillGroup, hpWrap, submitWrap);
  shell.appendChild(wishesSec);

  const footer = el(
    'footer',
    'site-footer',
    'Narbaitz Victoria Trip · Thu Dec 10 – Mon Dec 14, 2026 · Woody Clause Official Tree-Mail'
  );
  shell.appendChild(footer);

  root.replaceChildren(shell);
}

mountApp();
