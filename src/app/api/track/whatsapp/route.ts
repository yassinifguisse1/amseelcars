import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Recipients for tracking emails. Set WHATSAPP_TRACK_EMAILS in your environment
 * (comma- or semicolon-separated list). Deploys must set this; no default emails.
 */
function getTrackEmailTo(): string[] {
  const raw = process.env.WHATSAPP_TRACK_EMAILS ?? '';
  const list = raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(list)];
}

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL?.trim() || '';
if (!MAKE_WEBHOOK_URL) {
  throw new Error(
    'MAKE_WEBHOOK_URL is required. Set it in your environment. Deploys must configure this for tracking webhooks. Rotate any previously exposed webhook URL in Make.com.'
  );
}

const WEBHOOK_TIMEOUT_MS = 15000;
const WEBHOOK_MAX_RETRIES = 3;

/**
 * Sends payload to the Make webhook with timeout and retries. Throws on failure
 * or non-2xx after all retries so callers can await and handle errors.
 */
async function sendToWebhook(payload: object): Promise<void> {
  const body = JSON.stringify(payload);
  let lastError: Error | null = null;
  let lastStatus: number | null = null;
  for (let attempt = 1; attempt <= WEBHOOK_MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) return;
      lastStatus = res.status;
      if (attempt < WEBHOOK_MAX_RETRIES) await new Promise((r) => setTimeout(r, 1000 * attempt));
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt === WEBHOOK_MAX_RETRIES) throw lastError;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  const statusMsg = lastStatus != null ? ` status ${lastStatus}` : '';
  throw new Error(`Webhook failed after ${WEBHOOK_MAX_RETRIES} attempts${statusMsg}${lastError ? `: ${lastError.message}` : ''}`);
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;
  const clientIp = request.headers.get('x-client-ip');
  if (clientIp) return clientIp;
  return '–';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const locationLabels: Record<string, string> = {
  'agadir-centre': 'Agadir Centre',
  'aeroport-al-massira': 'Aéroport Al Massira',
  'taghazout': 'Taghazout',
  'agence': 'Agence',
};

const ALLOWED_KEYS = new Set([
  'path', 'source', 'carSlug', 'carName', 'fullUrl', 'userAgent', 'language', 'referrer',
  'screen', 'timezone', 'event', 'fullName', 'email', 'phone', 'pickupDate', 'returnDate',
  'pickupLocation', 'returnLocation', 'rentalDays', 'totalPrice', 'ctaLabel',
]);

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_PER_IP = 30;
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

const MAX_PATH_LEN = 500;
const MAX_STRING_LEN = 2000;
const MAX_EMAIL_LEN = 254;
const MAX_PHONE_LEN = 30;
const BASIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_PATH_REGEX = /^\/[a-zA-Z0-9/_.?-]*$/;

function toStr(v: unknown, maxLen: number): string {
  const s = typeof v === 'string' ? v.trim() : '';
  return s.slice(0, maxLen);
}

function sanitizePath(v: unknown): string {
  const s = toStr(v, MAX_PATH_LEN);
  if (!s) return '';
  const safe = SAFE_PATH_REGEX.test(s) ? s : '/' + s.replace(/[^a-zA-Z0-9/_.?-]/g, '');
  return safe.startsWith('/') ? safe : '/' + safe;
}

function sanitizeEmail(v: unknown): string {
  const s = toStr(v, MAX_EMAIL_LEN).toLowerCase();
  if (!s) return '';
  return BASIC_EMAIL_REGEX.test(s) ? s : '';
}

function sanitizePhone(v: unknown): string {
  const s = toStr(v, MAX_PHONE_LEN);
  return s.replace(/[^\d\s+]/g, '').slice(0, MAX_PHONE_LEN);
}

function sanitizeUrl(v: unknown): string {
  const s = toStr(v, MAX_STRING_LEN);
  if (!s) return '';
  return s.startsWith('http://') || s.startsWith('https://') ? s : '';
}

interface ValidatedBody {
  path: string;
  source: string;
  carSlug: string;
  carName: string;
  fullUrl: string;
  userAgent: string;
  language: string;
  referrer: string;
  screen: string;
  timezone: string;
  event: string;
  fullName: string;
  email: string;
  phone: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  rentalDays: number | undefined;
  totalPrice: number | undefined;
  ctaLabel: string;
}

function parseAndValidateBody(raw: unknown): { ok: true; data: ValidatedBody } | { ok: false; status: number; error: string } {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, status: 400, error: 'Invalid JSON body' };
  }
  const body = raw as Record<string, unknown>;
  const keys = Object.keys(body);
  const unknownKeys = keys.filter((k) => !ALLOWED_KEYS.has(k));
  if (unknownKeys.length > 0) {
    return { ok: false, status: 400, error: `Unknown fields: ${unknownKeys.join(', ')}` };
  }

  const path = sanitizePath(body.path);
  if (!path) {
    return { ok: false, status: 400, error: 'path is required and must be a valid path' };
  }

  const event = toStr(body.event, 50) || 'whatsapp';
  const allowedEvents = ['whatsapp', 'reserver', 'booking-submit', 'booking-confirmed', 'blog-cta'];
  if (!allowedEvents.includes(event)) {
    return { ok: false, status: 400, error: `event must be one of: ${allowedEvents.join(', ')}` };
  }

  const rentalDays = body.rentalDays !== undefined && body.rentalDays !== null
    ? (typeof body.rentalDays === 'number' && Number.isFinite(body.rentalDays) ? body.rentalDays : undefined)
    : undefined;
  const totalPrice = body.totalPrice !== undefined && body.totalPrice !== null
    ? (typeof body.totalPrice === 'number' && Number.isFinite(body.totalPrice) ? body.totalPrice : undefined)
    : undefined;

  const data: ValidatedBody = {
    path,
    source: toStr(body.source, 100),
    carSlug: toStr(body.carSlug, 200),
    carName: toStr(body.carName, 200),
    fullUrl: sanitizeUrl(body.fullUrl),
    userAgent: toStr(body.userAgent, 500),
    language: toStr(body.language, 20),
    referrer: sanitizeUrl(body.referrer),
    screen: toStr(body.screen, 50),
    timezone: toStr(body.timezone, 80),
    event,
    fullName: toStr(body.fullName, 200),
    email: sanitizeEmail(body.email),
    phone: sanitizePhone(toStr(body.phone, MAX_PHONE_LEN)),
    pickupDate: toStr(body.pickupDate, 50),
    returnDate: toStr(body.returnDate, 50),
    pickupLocation: toStr(body.pickupLocation, 50),
    returnLocation: toStr(body.returnLocation, 50),
    rentalDays,
    totalPrice,
    ctaLabel: toStr(body.ctaLabel, 200),
  };
  return { ok: true, data };
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_PER_IP) return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    if (clientIp !== '–' && !checkRateLimit(clientIp)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = parseAndValidateBody(raw);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const body = parsed.data;
    const {
      path,
      source,
      carSlug,
      carName,
      fullUrl,
      userAgent,
      language,
      referrer,
      screen,
      timezone,
      event,
      fullName,
      email,
      phone,
      pickupDate,
      returnDate,
      pickupLocation,
      returnLocation,
      rentalDays,
      totalPrice,
      ctaLabel,
    } = body;

    const trackEmailTo = getTrackEmailTo();
    if (trackEmailTo.length === 0) {
      console.error('[track/whatsapp] WHATSAPP_TRACK_EMAILS is not set or empty. Set it in your environment (comma- or semicolon-separated).');
      return NextResponse.json(
        { error: 'Tracking emails not configured' },
        { status: 500 }
      );
    }

    const eventConfig: Record<string, { subjectPrefix: string; title: string; footerNote: string }> = {
      whatsapp: {
        subjectPrefix: 'Clic WhatsApp',
        title: 'Clic sur WhatsApp',
        footerNote: "lorsqu'un visiteur a cliqué sur le bouton WhatsApp",
      },
      reserver: {
        subjectPrefix: 'Clic Réserver maintenant',
        title: 'Clic sur Réserver maintenant',
        footerNote: "lorsqu'un visiteur a cliqué sur « Réserver maintenant »",
      },
      'booking-submit': {
        subjectPrefix: 'Clic Envoyer la réservation',
        title: 'Clic sur Envoyer la réservation',
        footerNote: "lorsqu'un visiteur a cliqué sur « ENVOYER LA RÉSERVATION »",
      },
      'booking-confirmed': {
        subjectPrefix: 'Réservation envoyée (API OK)',
        title: 'Demande de réservation enregistrée',
        footerNote: "lorsqu'une demande de réservation a été acceptée par l'API (email client envoyé)",
      },
      'blog-cta': {
        subjectPrefix: 'Clic CTA blog',
        title: 'Clic sur CTA blog',
        footerNote: "lorsqu'un visiteur a cliqué sur un lien ou bouton du blog",
      },
    };
    const config = eventConfig[String(event)] || eventConfig.whatsapp;
    const eventLabel =
      event === 'whatsapp'
        ? 'WhatsApp'
        : event === 'reserver'
          ? 'Réserver maintenant'
          : event === 'booking-submit'
            ? 'Envoyer la réservation'
            : event === 'booking-confirmed'
              ? 'Réservation confirmée (serveur)'
              : event === 'blog-cta'
                ? 'CTA blog'
                : event || '–';

    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const sourceLabel =
      source === 'car-detail'
        ? 'Fiche voiture'
        : source === 'car-listing' || source === 'car-card'
          ? 'Liste voitures'
          : source === 'booking-form'
            ? 'Formulaire de réservation'
            : source === 'blog'
              ? 'Blog'
              : source || '–';
    const carDisplay = carName || carSlug || (event === 'blog-cta' && ctaLabel ? ctaLabel : '–');

    const ua = String(userAgent || '');
    const visitorRows = [
      ['URL complète', fullUrl || '–'],
      ['Navigateur / appareil', ua ? ua.slice(0, 120) + (ua.length > 120 ? '…' : '') : '–'],
      ['Langue', language || '–'],
      ['Page d’origine', referrer || '–'],
      ['Résolution écran', screen || '–'],
      ['Fuseau horaire', timezone || '–'],
      ['Adresse IP', clientIp],
    ]
      .map(
        ([label, value], i, arr) =>
          `<p style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 15px; line-height: 1.4; margin: 0; ${i === arr.length - 1 ? 'border-bottom: none;' : ''}"><span style="color: #64748b; font-weight: 600; min-width: 140px; display: inline-block;">${escapeHtml(String(label))}</span><span style="color: #1e293b;">${escapeHtml(String(value))}</span></p>`
      )
      .join('');

    const hasBookingForm =
      (event === 'booking-submit' || event === 'booking-confirmed') &&
      (fullName || email || phone || pickupDate || returnDate || pickupLocation || returnLocation);
    const formatLoc = (key: string) => locationLabels[key] || key || '–';
    const bookingRowsList = hasBookingForm
      ? [
          ['Nom complet', fullName || '–'],
          ['Email', email || '–'],
          ['Téléphone', phone || '–'],
          ['Date de récupération', pickupDate || '–'],
          ['Date de retour', returnDate || '–'],
          ['Lieu de récupération', formatLoc(String(pickupLocation))],
          ['Lieu de retour', formatLoc(String(returnLocation))],
          ...(rentalDays != null ? [['Jours de location', String(rentalDays)]] : []),
          ...(totalPrice != null ? [['Prix total', `${totalPrice} MAD`]] : []),
        ]
      : [];
    const bookingFormRows = bookingRowsList
      .map(
        ([label, value], i, arr) =>
          `<p style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 15px; line-height: 1.4; margin: 0; ${i === arr.length - 1 ? 'border-bottom: none;' : ''}"><span style="color: #64748b; font-weight: 600; min-width: 140px; display: inline-block;">${escapeHtml(String(label))}</span><span style="color: #1e293b;">${escapeHtml(String(value))}</span></p>`
      )
      .join('');

    const subjectSuffix = carDisplay !== '–' ? carDisplay : path;
    const subject = `[AmseelCars] ${config.subjectPrefix} – ${subjectSuffix}`;

    const rowStyle = 'padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 15px; line-height: 1.4; margin: 0;';
    const labelStyle = 'color: #64748b; font-weight: 600; min-width: 140px; display: inline-block;';
    const valueStyle = 'color: #1e293b;';
    const sectionTitleStyle = 'font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #667eea; text-transform: uppercase; margin: 0 0 8px 0; padding-bottom: 6px;';

    const clickSection = `
      <p style="${sectionTitleStyle}">Détails du clic</p>
      <p style="${rowStyle}"><span style="${labelStyle}">Événement</span><span style="${valueStyle}">${escapeHtml(String(eventLabel))}</span></p>
      <p style="${rowStyle}"><span style="${labelStyle}">Date et heure</span><span style="${valueStyle}">${escapeHtml(String(dateStr))}, ${escapeHtml(String(timeStr))}</span></p>
      <p style="${rowStyle}"><span style="${labelStyle}">Page</span><span style="${valueStyle}">${escapeHtml(String(path))}</span></p>
      <p style="${rowStyle}"><span style="${labelStyle}">Source</span><span style="${valueStyle}">${escapeHtml(String(sourceLabel))}</span></p>
      <p style="${rowStyle}"><span style="${labelStyle}">Voiture</span><span style="${valueStyle}">${escapeHtml(String(carDisplay))}</span></p>
      ${carSlug ? `<p style="${rowStyle} margin-bottom: 0; border-bottom: none;"><span style="${labelStyle}">Slug</span><span style="${valueStyle}">${escapeHtml(String(carSlug))}</span></p>` : `<p style="${rowStyle} margin-bottom: 0; border-bottom: none;"><span style="${labelStyle}">Slug</span><span style="${valueStyle}">–</span></p>`}
    `;

    const bookingSection = hasBookingForm
      ? `
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
        <p style="${sectionTitleStyle}">Informations remplies</p>
        ${bookingFormRows}
      </div>
      `
      : '';

    const visitorSection = `
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
        <p style="${sectionTitleStyle}">Visiteur</p>
        ${visitorRows}
      </div>
    `;

    const { error } = await resend.emails.send({
      from: 'Amseel Cars <noreply@amseelcars.com>',
      to: trackEmailTo,
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #f1f5f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 28px 32px; border-radius: 12px 12px 0 0; text-align: center; box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);">
            <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">${escapeHtml(String(config.title))}</h1>
            <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.92;">Amseel Cars</p>
          </div>
          <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; border-top: none;">
            ${clickSection}
            ${bookingSection}
            ${visitorSection}
            <p style="text-align: center; margin: 28px 0 0 0; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
              ${escapeHtml(String(config.footerNote))} du site Amseel Cars.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[track/whatsapp] Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Build webhook payload explicitly: no spread of body. Only non-PII common fields; add minimal booking only for booking-submit.
    const webhookPayload: Record<string, unknown> = {
      path: body.path,
      slug: body.carSlug,
      event: body.event,
      clientIp,
      eventLabel,
      sourceLabel,
      carDisplay,
      dateStr,
      timeStr,
    };
    if (event === 'booking-submit' || event === 'booking-confirmed') {
      const booking: { fullName?: string; email?: string; phone?: string } = {};
      if (body.fullName) booking.fullName = body.fullName;
      if (body.email) booking.email = body.email;
      if (body.phone) booking.phone = body.phone;
      if (Object.keys(booking).length > 0) {
        webhookPayload.booking = booking;
      }
    }
    try {
      await sendToWebhook(webhookPayload);
    } catch (err) {
      console.error('[track/whatsapp] Make webhook error:', err);
      return NextResponse.json(
        { error: 'Webhook delivery failed' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[track/whatsapp] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
