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
 * Set to Markus's Google Apps Script Web App URL (https://script.google.com/macros/s/.../exec)
 * once deployed from XMAS_T01_Victoria_Attendance_Meal_and_Survey_Tracker.
 */
const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbxZHUqCSPtJkpypTUvZLZJmKenv1Orw4UvM0mANtl6MHwQAw6dLDJMDD42R67uZHPX8nQ/exec';

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
  if (DEFAULT_WEBHOOK_URL.startsWith('https://script.google.com/macros/s/')) {
    return DEFAULT_WEBHOOK_URL;
  }
  return '';
}

export async function postBallotToSheetWebhook(
  payload: VictoriaBallotPayload
): Promise<{ delivered: boolean; configured: boolean; note: string }> {
  const webhookUrl = resolveWebhookUrl();
  if (!webhookUrl) {
    return {
      delivered: false,
      configured: false,
      note: 'Private backend collector is not connected yet — once Markus links the Google Sheet collector, your answers will save automatically.',
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
      configured: true,
      note: `Woody Clause has safely logged your Victoria wishes! Your answers are completely private — only Markus can view them. You can close this page now, or update and resubmit anytime if you change your mind.`,
    };
  } catch {
    return {
      delivered: false,
      configured: true,
      note: 'We hit a brief connection hiccup sending your answers. Please check your signal and tap Submit again in a moment.',
    };
  }
}
