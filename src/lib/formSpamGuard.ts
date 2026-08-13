import type { NextRequest } from 'next/server';
import { Resend } from 'resend';

const MIN_FORM_OPEN_MS = 3_000;
const RATE_LIMIT_WINDOW_MS = 15 * 60_000;
const RATE_LIMIT_MAX = 5;
/** Cap spam-alert emails so a bot flood does not flood the inbox. */
const NOTIFY_WINDOW_MS = 60 * 60_000;
const NOTIFY_MAX_PER_IP = 3;

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const notifyLimitMap = new Map<string, { count: number; windowStart: number }>();

const VOWELS = /[aeiouyàáâäãåèéêëìíîïòóôöõùúûüýÿæœ]/i;
const LETTERS = /[a-zàáâäãåèéêëìíîïòóôöõùúûüýÿæœ]/gi;

const SPAM_NOTIFY_TO = 'amseelcars5@gmail.com';

export type SpamBlockReason =
  | 'honeypot'
  | 'too_fast'
  | 'spam_message'
  | 'rate_limit';

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip') ??
    'unknown'
  );
}

export function isHoneypotTripped(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value !== 'string') return true;
  return value.trim().length > 0;
}

export function isSubmittedTooFast(
  formOpenedAtMs: unknown,
  minMs: number = MIN_FORM_OPEN_MS,
): boolean {
  const opened =
    typeof formOpenedAtMs === 'number'
      ? formOpenedAtMs
      : typeof formOpenedAtMs === 'string'
        ? Number(formOpenedAtMs)
        : NaN;
  if (!Number.isFinite(opened) || opened <= 0) return true;
  const elapsed = Date.now() - opened;
  if (elapsed < 0 || elapsed > 24 * 60 * 60_000) return true;
  return elapsed < minMs;
}

/** Reject short nonsense / no-space gibberish contact messages. */
export function looksLikeSpamMessage(message: unknown): boolean {
  if (typeof message !== 'string') return true;
  const trimmed = message.trim().replace(/\s+/g, ' ');
  if (trimmed.length < 10 || trimmed.length > 4000) return true;

  const letters = trimmed.match(LETTERS) ?? [];
  if (letters.length < 6) return true;

  if (!VOWELS.test(trimmed)) return true;

  const words = trimmed.split(' ');
  const longWords = words.filter((w) => w.length >= 8);
  if (longWords.length > 0) {
    const gibberishLong = longWords.filter((w) => {
      const lettersOnly = (w.match(LETTERS) ?? []).join('');
      if (lettersOnly.length < 8) return false;
      if (!VOWELS.test(lettersOnly)) return true;
      return consonantRunIsSuspicious(lettersOnly.toLowerCase());
    });
    if (gibberishLong.length >= Math.ceil(longWords.length / 2)) return true;
  }

  // Dense mixed-case alphanumeric mash with almost no spaces
  if (words.length === 1 && trimmed.length >= 12) return true;
  if (words.length <= 2 && trimmed.length >= 16 && !/[.!?,'-]/.test(trimmed)) {
    const upper = (trimmed.match(/[A-Z]/g) ?? []).length;
    const lower = (trimmed.match(/[a-z]/g) ?? []).length;
    if (upper > 3 && lower > 3 && upper / (upper + lower) > 0.25) return true;
  }

  return false;
}

function consonantRunIsSuspicious(word: string): boolean {
  let run = 0;
  for (const ch of word) {
    if (VOWELS.test(ch)) {
      run = 0;
    } else {
      run += 1;
      if (run >= 5) return true;
    }
  }
  return false;
}

export function checkFormRateLimit(
  ip: string,
  bucket: 'booking' | 'contact',
): { ok: boolean } {
  const now = Date.now();
  const key = `${bucket}:${ip}`;
  const entry = rateLimitMap.get(key);
  if (!entry) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return { ok: true };
  }
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return { ok: true };
  }
  entry.count += 1;
  return { ok: entry.count <= RATE_LIMIT_MAX };
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function reasonLabel(reason: SpamBlockReason): string {
  switch (reason) {
    case 'honeypot':
      return 'Honeypot rempli (bot)';
    case 'too_fast':
      return 'Envoi trop rapide';
    case 'spam_message':
      return 'Message suspect / gibberish';
    case 'rate_limit':
      return 'Limite de débit (IP)';
    default:
      return reason;
  }
}

function shouldSendSpamNotify(ip: string, form: 'booking' | 'contact'): boolean {
  const now = Date.now();
  const key = `notify:${form}:${ip}`;
  const entry = notifyLimitMap.get(key);
  if (!entry) {
    notifyLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (now - entry.windowStart > NOTIFY_WINDOW_MS) {
    notifyLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= NOTIFY_MAX_PER_IP;
}

/**
 * Email the admin that a spam attempt was blocked.
 * Throttled per IP (max 3 alerts / hour) so floods do not fill the inbox.
 * Never throws — failures are logged only.
 */
export async function notifySpamBlocked(input: {
  form: 'booking' | 'contact';
  reason: SpamBlockReason;
  ip: string;
  fields: Record<string, unknown>;
}): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) return;
    if (!shouldSendSpamNotify(input.ip, input.form)) return;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const formLabel = input.form === 'booking' ? 'Réservation' : 'Contact';
    const reasonText = reasonLabel(input.reason);
    const rows = Object.entries(input.fields)
      .filter(([, v]) => v != null && String(v).trim() !== '')
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;color:#666;font-weight:600;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;color:#111;word-break:break-word">${escapeHtml(String(v).slice(0, 500))}</td></tr>`,
      )
      .join('');

    await resend.emails.send({
      from: 'Amseel Cars <noreply@amseelcars.com>',
      to: [SPAM_NOTIFY_TO],
      subject: `[Spam bloqué] ${formLabel} — ${reasonText}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px">
          <div style="background:#7f1d1d;color:#fff;padding:20px;border-radius:10px 10px 0 0">
            <h1 style="margin:0;font-size:20px">Tentative spam bloquée</h1>
            <p style="margin:8px 0 0;opacity:.9">Amseel Cars — aucune email client envoyée</p>
          </div>
          <div style="background:#fff;border:1px solid #e5e5e5;border-top:0;padding:20px;border-radius:0 0 10px 10px">
            <p><strong>Formulaire:</strong> ${escapeHtml(formLabel)}</p>
            <p><strong>Raison:</strong> ${escapeHtml(reasonText)}</p>
            <p><strong>IP:</strong> ${escapeHtml(input.ip)}</p>
            <p><strong>Heure:</strong> ${escapeHtml(new Date().toISOString())}</p>
            <h2 style="font-size:15px;margin:20px 0 8px;color:#333">Données soumises</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px">${rows || '<tr><td>Aucune</td></tr>'}</table>
            <p style="margin-top:20px;font-size:12px;color:#888">Ceci est une alerte anti-spam. La demande n’a pas été traitée comme une vraie réservation / contact.</p>
          </div>
        </div>
      `,
      text: `Spam bloqué — ${formLabel}\nRaison: ${reasonText}\nIP: ${input.ip}\n${JSON.stringify(input.fields, null, 2)}`,
    });
  } catch (err) {
    console.error('[spam-notify] Failed to send alert:', err);
  }
}
