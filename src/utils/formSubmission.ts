export interface VictoriaBallotPayload {
  schemaVersion: 'v5';
  submittedAtIso: string;
  voterId: string;
  voterName: string;
  vibeChoiceId: string;
  vibeChoiceLabel: string;
  sliders: {
    adventureVsRelax: { score: number; label: string };
    indoorsVsOutdoors: { score: number; label: string };
    familiarVsNew: { score: number; label: string };
  };
  fridayPriorities: string[];
  bucketList: string;
  buzzkillList: string;
  quickBuzzkills: string[];
  morningCoffeeAndTreats: string;
  travelFlightOrFerryInfo: string;
}

const LAST_SUBMIT_KEY = 'xmas_victoria_last_submit_ts';
const COOLDOWN_MS = 3500;

/**
 * Strips C0/CR/LF control characters to prevent header or spreadsheet formula injection.
 */
export function sanitizeInputText(raw: string, maxLen = 360): string {
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
      note: 'Saved on your device! Tap "Send Summary to Family Chat" or "Copy Summary" below so Markus & Tricia see your picks right away.',
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
      note: 'Sent straight to our Victoria Trip Sheet — you can also drop your summary into the Family Chat below.',
    };
  } catch {
    return {
      delivered: false,
      note: 'Saved on your device! Tap "Send Summary to Family Chat" below so zero Victoria wishes are missed.',
    };
  }
}

export function formatBallotReceipt(payload: VictoriaBallotPayload): string {
  const fridayLine =
    payload.fridayPriorities.length > 0
      ? payload.fridayPriorities.join(', ')
      : 'Up for anything!';

  const buzzkillParts = [
    ...payload.quickBuzzkills,
    ...(payload.buzzkillList ? [payload.buzzkillList] : []),
  ];
  const buzzkillLine =
    buzzkillParts.length > 0 ? buzzkillParts.join(' · ') : 'Easygoing — nothing to skip!';

  const lines = [
    `WOODY CLAUSE TREE-MAIL — ${payload.voterName.toUpperCase()} (Dec 10–14, Victoria)`,
    `Holiday Vibe: ${payload.vibeChoiceLabel}`,
    `Trip Sliders (1–5):`,
    `  • Relaxation -> Adventure: ${payload.sliders.adventureVsRelax.score}/5 (${payload.sliders.adventureVsRelax.label})`,
    `  • Indoors -> Outdoors: ${payload.sliders.indoorsVsOutdoors.score}/5 (${payload.sliders.indoorsVsOutdoors.label})`,
    `  • Familiar -> New: ${payload.sliders.familiarVsNew.score}/5 (${payload.sliders.familiarVsNew.label})`,
    `Fri Dec 11 Child-Free Day: ${fridayLine}`,
    `West Coast Bucket List: ${payload.bucketList || 'Surprise me!'}`,
    `West Coast Buzzkills: ${buzzkillLine}`,
    `Morning Mug & Pantry: ${payload.morningCoffeeAndTreats || 'Surprise me with good coffee & snacks!'}`,
    `Travel Info: ${payload.travelFlightOrFerryInfo || 'Still booking / TBD'}`,
  ];

  return lines.join('\n');
}
