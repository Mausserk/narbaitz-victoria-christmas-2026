export interface VictoriaBallotPayload {
  submittedAtIso: string;
  voterId: string;
  voterName: string;
  heroTitle: string;
  rankedActivities: Array<{ rank: number; id: string; title: string; windowLabel: string }>;
  vetoedPetPeeves: string[];
  customVetoNote: string;
  paceScore: number;
  paceLabel: string;
  morningCoffeeAndTreats: string;
  christmasFeastOrGameWish: string;
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
      note: 'Sealed on your device with North Pole wax! Tap "Send Scroll to Family Chat" or "Copy Christmas Scroll" below so Santa’s Victoria elves get it right away.',
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
      note: 'Delivered straight to Santa’s Victoria Christmas Workshop Sheet — plus you can share your festive scroll to the family chat below!',
    };
  } catch {
    return {
      delivered: false,
      note: 'Sealed locally! Tap "Send Scroll to Family Chat" below so zero Christmas wishes are missed.',
    };
  }
}

export function formatEmojiBallotReceipt(payload: VictoriaBallotPayload): string {
  const topFive = payload.rankedActivities
    .slice(0, 5)
    .map((item) => `  🌟 #${item.rank} ${item.title}`)
    .join('\n');
  const skipTwo = payload.rankedActivities
    .slice(-2)
    .map((item) => item.title)
    .join(' · ');
  const naughtyItems =
    payload.vetoedPetPeeves.length > 0
      ? payload.vetoedPetPeeves.join('; ')
      : 'Pure Christmas cheer — zero coal needed!';
  const extraNaughty = payload.customVetoNote ? ` (+ ${payload.customVetoNote})` : '';
  const symphonyLine = payload.symphonyCandlelightInterest
    ? '\n🕯️🎻 Candlelight Carols Bonus: Curious about Messiah by Candlelight!'
    : '';

  return [
    `🎄📜✨ VICTORIA CHRISTMAS WISH SCROLL — ${payload.voterName.toUpperCase()} (${payload.heroTitle})`,
    `🕯️ Sleigh-Bell Pace: ${payload.paceLabel}`,
    `🌟🎁 MY NICE LIST TOP 5 (Dec 10–14):`,
    topFive,
    `❄️ Save for Next Christmas: ${skipTwo}`,
    `🪨🔥 ON SANTA'S NAUGHTY LIST (+Coal for Woody Claus!): ${naughtyItems}${extraNaughty}`,
    `☕🍪 Christmas Morning Mug & Pantry Treats: ${payload.morningCoffeeAndTreats || 'Surprise me with holiday treats!'}`,
    `🥧🎬🎲 Christmas Feast / Movie / Game Wish: ${payload.christmasFeastOrGameWish || 'Up for anything cozy by the tree!'}`,
  ].join('\n') + symphonyLine;
}
