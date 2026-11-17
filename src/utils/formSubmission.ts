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
      note: 'Saved on your device! Tap "Share Ballot to Family Chat" or "Copy Emoji Ballot" below so Markus gets it right away.',
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
      note: 'Logged directly to the Victoria Holiday Tracker Sheet — plus you can share your fun summary to the family chat below!',
    };
  } catch {
    return {
      delivered: false,
      note: 'Saved locally! Tap "Share Ballot to Family Chat" below so zero votes are missed.',
    };
  }
}

export function formatEmojiBallotReceipt(payload: VictoriaBallotPayload): string {
  const topFive = payload.rankedActivities
    .slice(0, 5)
    .map((item) => `  #${item.rank} ${item.title}`)
    .join('\n');
  const skipTwo = payload.rankedActivities
    .slice(-2)
    .map((item) => item.title)
    .join(' · ');
  const vetoes =
    payload.vetoedPetPeeves.length > 0
      ? payload.vetoedPetPeeves.join('; ')
      : 'Easygoing—nothing checked!';
  const extraVeto = payload.customVetoNote ? ` (+ ${payload.customVetoNote})` : '';
  const symphonyLine = payload.symphonyCandlelightInterest
    ? '\n🎻 Bonus Interest: Curious about Messiah by Candlelight!'
    : '';

  return [
    `🎄🎟️ VICTORIA CHRISTMAS BALLOT — ${payload.voterName.toUpperCase()} (${payload.heroTitle})`,
    `⚡ Pace: ${payload.paceLabel}`,
    `🏆 MY TOP 5 VICTORIA PICKS (Dec 10–14):`,
    topFive,
    `💤 Lowest Priority / Easy Skip: ${skipTwo}`,
    `🚫 BANNED TRIP RUINERS: ${vetoes}${extraVeto}`,
    `☕ Kitchen Stock Order: ${payload.morningCoffeeAndTreats || 'Surprise me!'}`,
    `🍽️🎲 Feast / Game / Movie Wish: ${payload.christmasFeastOrGameWish || 'Down for anything cozy!'}`,
  ].join('\n') + symphonyLine;
}
