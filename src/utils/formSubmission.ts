export interface RankedOptionEntry {
  rank: number;
  id: string;
  title: string;
  windowLabel: string;
}

export interface VictoriaBallotPayload {
  schemaVersion: 'v4';
  submittedAtIso: string;
  voterId: string;
  voterName: string;
  heroTitle: string;
  vibeChoiceId: string;
  vibeChoiceLabel: string;
  rankedFridayAdult: RankedOptionEntry[];
  rankedWeekendOutings: RankedOptionEntry[];
  vetoedPetPeeves: string[];
  customVetoNote: string;
  paceScore: number;
  paceLabel: string;
  morningCoffeeAndTreats: string;
  christmasFeastOrGameWish: string;
  travelFlightOrFerryInfo: string;
  symphonyCandlelightInterest: boolean;
}

const LAST_SUBMIT_KEY = 'xmas_victoria_last_submit_ts';
const COOLDOWN_MS = 3500;

/**
 * Strips C0/CR/LF control characters to prevent header or spreadsheet formula injection.
 */
export function sanitizeInputText(raw: string, maxLen = 240): string {
  const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  const safePrefix = /^[=+\-@]/.test(cleaned) ? `'${cleaned}` : cleaned;
  return safePrefix.slice(0, maxLen);
}

export function checkCooldownAllowed(): boolean {
  try {
    const prev = Number(window.localStorage.getItem(LAST_SUBMIT_KEY) || '0');
    const now = Date.now();
    if (now - prev < COOLDOWN_MS) {
      return false;
    }
    window.localStorage.setItem(LAST_SUBMIT_KEY, String(now));
    return true;
  } catch {
    return true;
  }
}

export function resolveWebhookUrl(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const hookParam = params.get('hook') || '';
    if (hookParam.startsWith('https://script.google.com/macros/s/')) {
      return hookParam;
    }
  } catch {
    // Ignore URL parse errors
  }
  const envHook = import.meta.env.VITE_APPS_SCRIPT_WEBHOOK_URL;
  if (typeof envHook === 'string' && envHook.startsWith('https://script.google.com/macros/s/')) {
    return envHook;
  }
  return '';
}

export async function postBallotToSheetWebhook(
  payload: VictoriaBallotPayload
): Promise<{ delivered: boolean; note: string }> {
  const webhookUrl = resolveWebhookUrl();
  if (!webhookUrl) {
    return {
      delivered: false,
      note: 'Carved into cedar on your phone! Tap "Send Tree-Mail Summary to Family Chat" or "Copy Summary" below so Woody Claws, Markus & Tricia see your picks right away.',
    };
  }

  try {
    await window.fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    return {
      delivered: true,
      note: 'Zapped across the Wood-Wide Web straight to our Victoria Tracker Sheet — plus you can drop your 1-tap summary into the Family Chat below!',
    };
  } catch {
    return {
      delivered: false,
      note: 'Saved on your device! Tap "Send Tree-Mail Summary to Family Chat" below so zero Victoria wishes are missed.',
    };
  }
}

export function formatEmojiBallotReceipt(payload: VictoriaBallotPayload): string {
  const friLines = payload.rankedFridayAdult
    .slice(0, 2)
    .map((item) => `  #${item.rank} ${item.title}`)
    .join('\n');
  const weekendTopThree = payload.rankedWeekendOutings
    .slice(0, 3)
    .map((item) => `  #${item.rank} ${item.title}`)
    .join('\n');
  const weekendSkip = payload.rankedWeekendOutings[payload.rankedWeekendOutings.length - 1];
  const mulchedItems =
    payload.vetoedPetPeeves.length > 0
      ? payload.vetoedPetPeeves.join('; ')
      : 'Easygoing — zero buzzkills to mulch!';
  const extraMulch = payload.customVetoNote ? ` (+ ${payload.customVetoNote})` : '';
  const travelLine = payload.travelFlightOrFerryInfo
    ? `✈️⛴️ Thu Dec 10 / Mon Dec 14 Travel: ${payload.travelFlightOrFerryInfo}`
    : '✈️⛴️ Thu Dec 10 / Mon Dec 14 Travel: Still booking / TBD';
  const symphonyLine = payload.symphonyCandlelightInterest
    ? '\n🕯️🎻 Bonus: Curious about Victoria Symphony "Messiah by Candlelight"!'
    : '';

  return [
    `🪵🌿 WOODY CLAWS TREE-MAIL DISPATCH — ${payload.voterName.toUpperCase()} (${payload.heroTitle})`,
    `🎯 Holiday Vibe Vote: ${payload.vibeChoiceLabel}`,
    `🥂 Fri Dec 11 Adult Daycare Window (Top 2):`,
    friLines,
    `✨ Sat/Sun Outings (Top 3 around Barclay's Nap):`,
    weekendTopThree,
    weekendSkip ? `❄️ First to Skip if Tired: ${weekendSkip.title}` : '',
    `🪵 Mulched into Cedar Woodchips: ${mulchedItems}${extraMulch}`,
    `🕯️ Ideal Trip Pace: ${payload.paceLabel}`,
    `☕🍪 Morning Mug & Pantry: ${payload.morningCoffeeAndTreats || 'Surprise me with good coffee & treats!'}`,
    `🥧🎬🎲 Dinner / Movie / Game Wish: ${payload.christmasFeastOrGameWish || 'Up for anything cozy!'}`,
    travelLine,
  ]
    .filter(Boolean)
    .join('\n') + symphonyLine;
}
