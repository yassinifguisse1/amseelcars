import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { saveTrackEvent } from '@/lib/saveTrackEvent';
import {
  EMAIL_TRACK_EVENTS,
  EVENT_LABELS,
  SOURCE_LABELS,
  TRACK_EVENT_TYPES,
  WEBHOOK_TRACK_EVENTS,
} from '@/lib/trackEventTypes';

const resend = new Resend(process.env.RESEND_API_KEY);

function getTrackEmailTo(): string[] {
  const raw = process.env.WHATSAPP_TRACK_EMAILS ?? '';
  return [...new Set(raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean))];
}

function getMakeWebhookUrl(): string {
  const url = process.env.MAKE_WEBHOOK_URL?.trim() || '';
  if (!url) {
    throw new Error('MAKE_WEBHOOK_URL is not configured');
  }
  return url;
}

const WEBHOOK_TIMEOUT_MS = 15000;
const WEBHOOK_MAX_RETRIES = 3;

async function sendToWebhook(payload: object): Promise<void> {
  const webhookUrl = getMakeWebhookUrl();
  const body = JSON.stringify(payload);
  let lastError: Error | null = null;
  let lastStatus: number | null = null;
  for (let attempt = 1; attempt <= WEBHOOK_MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
      const res = await fetch(webhookUrl, {
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
  return request.headers.get('x-real-ip')
    ?? request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-client-ip')
    ?? '–';
}

function getGeoFromRequest(request: NextRequest): { country: string; city: string } {
  const country = (
    request.headers.get('x-vercel-ip-country')
    ?? request.headers.get('cf-ipcountry')
    ?? request.headers.get('x-country-code')
    ?? ''
  ).trim().toUpperCase().slice(0, 8);
  const city = (
    request.headers.get('x-vercel-ip-city')
    ?? request.headers.get('cf-ipcity')
    ?? ''
  ).trim().slice(0, 80);
  // Cloudflare uses "XX" when unknown
  return {
    country: country && country !== 'XX' ? country : '',
    city: city ? decodeURIComponent(city) : '',
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const locationLabels: Record<string, string> = {
  'agadir-centre': 'Agadir Centre',
  'aeroport-al-massira': 'Aéroport Al Massira',
  taghazout: 'Taghazout',
  agence: 'Agence',
};

const ALLOWED_KEYS = new Set([
  'path', 'source', 'carSlug', 'carName', 'fullUrl', 'userAgent', 'language', 'referrer',
  'screen', 'timezone', 'event', 'fullName', 'email', 'phone', 'message', 'pickupDate',
  'returnDate', 'pickupLocation', 'returnLocation', 'rentalDays', 'totalPrice', 'ctaLabel', 'metadata',
  'visitorId', 'sessionId', 'isReturning', 'deviceType', 'browser', 'os', 'trafficSource',
  'utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'utmTerm',
]);

const DEVICE_TYPES = new Set(['mobile', 'tablet', 'desktop']);
const TRAFFIC_SOURCES = new Set(['direct', 'organic', 'social', 'referral', 'paid', 'email']);

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_PER_IP = 150;
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

const MAX_PATH_LEN = 500;
const MAX_STRING_LEN = 2000;
const MAX_EMAIL_LEN = 254;
const MAX_PHONE_LEN = 30;
const MAX_MESSAGE_LEN = 4000;
const BASIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_PATH_REGEX = /^\/[a-zA-Z0-9/_.?-]*$/;

function toStr(v: unknown, maxLen: number): string {
  return (typeof v === 'string' ? v.trim() : '').slice(0, maxLen);
}

function sanitizePath(v: unknown): string {
  const s = toStr(v, MAX_PATH_LEN);
  if (!s) return '';
  const safe = SAFE_PATH_REGEX.test(s) ? s : '/' + s.replace(/[^a-zA-Z0-9/_.?-]/g, '');
  return safe.startsWith('/') ? safe : '/' + safe;
}

function sanitizeEmail(v: unknown): string {
  const s = toStr(v, MAX_EMAIL_LEN).toLowerCase();
  return s && BASIC_EMAIL_REGEX.test(s) ? s : '';
}

function sanitizePhone(v: unknown): string {
  return toStr(v, MAX_PHONE_LEN).replace(/[^\d\s+]/g, '').slice(0, MAX_PHONE_LEN);
}

function sanitizeUrl(v: unknown): string {
  const s = toStr(v, MAX_STRING_LEN);
  return s.startsWith('http://') || s.startsWith('https://') ? s : '';
}

function sanitizeMetadata(v: unknown): Record<string, string | number | boolean> | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== 'object' || Array.isArray(v)) return null;
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(v as Record<string, unknown>).slice(0, 20)) {
    if (typeof value === 'string') out[key] = value.slice(0, 500);
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = value;
    else if (typeof value === 'boolean') out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : null;
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
  visitorId: string;
  sessionId: string;
  isReturning: boolean | undefined;
  deviceType: string;
  browser: string;
  os: string;
  trafficSource: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  rentalDays: number | undefined;
  totalPrice: number | undefined;
  ctaLabel: string;
  metadata: Record<string, string | number | boolean> | null;
}

function parseAndValidateBody(raw: unknown): { ok: true; data: ValidatedBody } | { ok: false; status: number; error: string } {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, status: 400, error: 'Invalid JSON body' };
  }
  const body = raw as Record<string, unknown>;
  const unknownKeys = Object.keys(body).filter((k) => !ALLOWED_KEYS.has(k));
  if (unknownKeys.length > 0) {
    return { ok: false, status: 400, error: `Unknown fields: ${unknownKeys.join(', ')}` };
  }

  const path = sanitizePath(body.path);
  if (!path) {
    return { ok: false, status: 400, error: 'path is required and must be a valid path' };
  }

  const event = toStr(body.event, 50) || 'page-view';
  if (!TRACK_EVENT_TYPES.includes(event as (typeof TRACK_EVENT_TYPES)[number])) {
    return { ok: false, status: 400, error: `event must be one of: ${TRACK_EVENT_TYPES.join(', ')}` };
  }

  const rentalDays = typeof body.rentalDays === 'number' && Number.isFinite(body.rentalDays) ? body.rentalDays : undefined;
  const totalPrice = typeof body.totalPrice === 'number' && Number.isFinite(body.totalPrice) ? body.totalPrice : undefined;
  const deviceTypeRaw = toStr(body.deviceType, 20);
  const trafficSourceRaw = toStr(body.trafficSource, 20);
  const isReturning =
    typeof body.isReturning === 'boolean' ? body.isReturning : undefined;

  return {
    ok: true,
    data: {
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
      visitorId: toStr(body.visitorId, 80),
      sessionId: toStr(body.sessionId, 80),
      isReturning,
      deviceType: DEVICE_TYPES.has(deviceTypeRaw) ? deviceTypeRaw : '',
      browser: toStr(body.browser, 40),
      os: toStr(body.os, 40),
      trafficSource: TRAFFIC_SOURCES.has(trafficSourceRaw) ? trafficSourceRaw : '',
      utmSource: toStr(body.utmSource, 100),
      utmMedium: toStr(body.utmMedium, 100),
      utmCampaign: toStr(body.utmCampaign, 100),
      utmContent: toStr(body.utmContent, 100),
      utmTerm: toStr(body.utmTerm, 100),
      fullName: toStr(body.fullName, 200),
      email: sanitizeEmail(body.email),
      phone: sanitizePhone(body.phone),
      message: toStr(body.message, MAX_MESSAGE_LEN),
      pickupDate: toStr(body.pickupDate, 50),
      returnDate: toStr(body.returnDate, 50),
      pickupLocation: toStr(body.pickupLocation, 50),
      returnLocation: toStr(body.returnLocation, 50),
      rentalDays,
      totalPrice,
      ctaLabel: toStr(body.ctaLabel, 200),
      metadata: sanitizeMetadata(body.metadata),
    },
  };
}

function checkRateLimit(ip: string, event: string): boolean {
  const max = event === 'page-view' ? 200 : RATE_LIMIT_MAX_PER_IP;
  const now = Date.now();
  const key = `${ip}:${event === 'page-view' ? 'pv' : 'ev'}`;
  const entry = rateLimitMap.get(key);
  if (!entry) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

const EMAIL_EVENT_CONFIG: Record<string, { subjectPrefix: string; title: string; footerNote: string }> = {
  whatsapp: { subjectPrefix: 'Clic WhatsApp', title: 'Clic sur WhatsApp', footerNote: "lorsqu'un visiteur a cliqué sur le bouton WhatsApp" },
  reserver: { subjectPrefix: 'Clic Réserver maintenant', title: 'Clic sur Réserver maintenant', footerNote: "lorsqu'un visiteur a cliqué sur « Réserver maintenant »" },
  'booking-submit': { subjectPrefix: 'Clic Envoyer la réservation', title: 'Clic sur Envoyer la réservation', footerNote: "lorsqu'un visiteur a cliqué sur « ENVOYER LA RÉSERVATION »" },
  'booking-confirmed': { subjectPrefix: 'Réservation envoyée (API OK)', title: 'Demande de réservation enregistrée', footerNote: "lorsqu'une demande de réservation a été acceptée par l'API" },
  'blog-cta': { subjectPrefix: 'Clic CTA blog', title: 'Clic sur CTA blog', footerNote: "lorsqu'un visiteur a cliqué sur un lien ou bouton du blog" },
  'contact-submit': { subjectPrefix: 'Message contact', title: 'Nouveau message de contact', footerNote: "lorsqu'un visiteur a envoyé le formulaire de contact" },
  'booking-abandoned': { subjectPrefix: 'Réservation abandonnée', title: 'Formulaire de réservation non terminé', footerNote: "lorsqu'un visiteur a commencé une réservation sans la finaliser" },
};

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
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
    if (clientIp !== '–' && !checkRateLimit(clientIp, body.event)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const geo = getGeoFromRequest(request);

    try {
      await saveTrackEvent({
        ...body,
        clientIp: clientIp !== '–' ? clientIp : null,
        country: geo.country || null,
        city: geo.city || null,
        visitorId: body.visitorId || null,
        sessionId: body.sessionId || null,
        isReturning: body.isReturning ?? null,
        deviceType: body.deviceType || null,
        browser: body.browser || null,
        os: body.os || null,
        trafficSource: body.trafficSource || null,
        utmSource: body.utmSource || null,
        utmMedium: body.utmMedium || null,
        utmCampaign: body.utmCampaign || null,
        utmContent: body.utmContent || null,
        utmTerm: body.utmTerm || null,
        metadata: body.metadata,
      });
    } catch (dbErr) {
      console.error('[track/event] Database save error:', dbErr);
      return NextResponse.json({ error: 'Failed to save tracking event' }, { status: 500 });
    }

    const eventLabel = EVENT_LABELS[body.event] ?? body.event;
    const sourceLabel = SOURCE_LABELS[body.source] ?? (body.source || '–');
    const carDisplay = body.carName || body.carSlug || (body.event === 'blog-cta' && body.ctaLabel ? body.ctaLabel : body.ctaLabel || '–');

    const trackEmailTo = getTrackEmailTo();
    const shouldEmail = EMAIL_TRACK_EVENTS.has(body.event as (typeof TRACK_EVENT_TYPES)[number]);
    const emailConfig = EMAIL_EVENT_CONFIG[body.event];

    if (shouldEmail && emailConfig && trackEmailTo.length > 0) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const ua = body.userAgent || '';
      const row = (label: string, value: string) =>
        `<p style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:15px;margin:0"><span style="color:#64748b;font-weight:600;min-width:140px;display:inline-block">${escapeHtml(label)}</span><span style="color:#1e293b">${escapeHtml(value)}</span></p>`;

      const locLabels: Record<string, string> = {
        'agadir-centre': 'Agadir Centre',
        'aeroport-al-massira': 'Aéroport Al Massira',
        taghazout: 'Taghazout',
        agence: 'Agence',
      };
      const fmtLoc = (k: string) => locLabels[k] || k || '–';

      const rows = [
        row('Événement', eventLabel),
        row('Date', `${dateStr}, ${timeStr}`),
        row('Page', body.path),
        row('Source', sourceLabel),
        row('Voiture', carDisplay),
        ...(body.fullName ? [row('Nom', body.fullName)] : []),
        ...(body.email ? [row('Email', body.email)] : []),
        ...(body.phone ? [row('Téléphone', body.phone)] : []),
        ...(body.pickupDate ? [row('Date récupération', body.pickupDate)] : []),
        ...(body.returnDate ? [row('Date retour', body.returnDate)] : []),
        ...(body.pickupLocation ? [row('Lieu départ', fmtLoc(body.pickupLocation))] : []),
        ...(body.returnLocation ? [row('Lieu retour', fmtLoc(body.returnLocation))] : []),
        ...(body.rentalDays != null ? [row('Jours', String(body.rentalDays))] : []),
        ...(body.totalPrice != null ? [row('Prix estimé', `${body.totalPrice} MAD`)] : []),
        ...(body.message ? [row('Message', body.message.slice(0, 500))] : []),
        ...(body.metadata && typeof body.metadata === 'object' && 'reason' in body.metadata
          ? [row('Raison', String((body.metadata as Record<string, unknown>).reason))]
          : []),
        row('IP', clientIp),
        ...(geo.country ? [row('Pays', geo.country)] : []),
        ...(geo.city ? [row('Ville', geo.city)] : []),
        ...(body.deviceType ? [row('Appareil', body.deviceType)] : []),
        ...(body.trafficSource ? [row('Trafic', body.trafficSource)] : []),
        ...(body.isReturning != null ? [row('Visiteur', body.isReturning ? 'Récurrent' : 'Nouveau')] : []),
        row('Navigateur', ua.slice(0, 120)),
      ].join('');

      const { error } = await resend.emails.send({
        from: 'Amseel Cars <noreply@amseelcars.com>',
        to: trackEmailTo,
        subject: `[AmseelCars] ${emailConfig.subjectPrefix} – ${carDisplay !== '–' ? carDisplay : body.path}`,
        html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px"><div style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:24px;border-radius:12px 12px 0 0;text-align:center"><h1 style="margin:0;font-size:22px">${escapeHtml(emailConfig.title)}</h1></div><div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">${rows}<p style="text-align:center;margin-top:20px;color:#94a3b8;font-size:12px">${escapeHtml(emailConfig.footerNote)}.</p></div></div>`,
      });
      if (error) console.error('[track/event] Resend error:', error);
    }

    if (WEBHOOK_TRACK_EVENTS.has(body.event as (typeof TRACK_EVENT_TYPES)[number])) {
      const webhookPayload: Record<string, unknown> = {
        path: body.path,
        slug: body.carSlug,
        event: body.event,
        clientIp,
        eventLabel,
        sourceLabel,
        carDisplay,
      };
      if (body.fullName || body.email || body.phone) {
        webhookPayload.booking = {
          ...(body.fullName ? { fullName: body.fullName } : {}),
          ...(body.email ? { email: body.email } : {}),
          ...(body.phone ? { phone: body.phone } : {}),
        };
      }
      try {
        await sendToWebhook(webhookPayload);
      } catch (err) {
        console.error('[track/event] Webhook error:', err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[track/event] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
