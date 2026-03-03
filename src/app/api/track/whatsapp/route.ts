import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TRACK_EMAIL_TO = [
  ...new Set([
    'noreply@amseelcars.com',
    process.env.WHATSAPP_TRACK_EMAIL || 'khalilakirar@gmail.com',
    'talhaouiimed@gmail.com',
  ].filter(Boolean)),
];

const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/ehlcvnj7ligjg07pjmn6ftc6lqs620uh';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const {
      path = '',
      source = '',
      carSlug = '',
      carName = '',
      fullUrl = '',
      userAgent = '',
      language = '',
      referrer = '',
      screen = '',
      timezone = '',
      event = 'whatsapp',
      // Booking form (when event is booking-submit)
      fullName = '',
      email = '',
      phone = '',
      pickupDate = '',
      returnDate = '',
      pickupLocation = '',
      returnLocation = '',
      rentalDays,
      totalPrice,
      ctaLabel = '',
    } = body;

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'path is required' }, { status: 400 });
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

    const clientIp = getClientIp(request);
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
      event === 'booking-submit' &&
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
      <p style="${rowStyle} margin-bottom: 0; border-bottom: none;"><span style="${labelStyle}">Voiture</span><span style="${valueStyle}">${escapeHtml(String(carDisplay))}</span></p>
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
      to: TRACK_EMAIL_TO,
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

    // Forward full payload to Make.com webhook including server-side visitor data (IP, labels)
    const webhookPayload = {
      ...body,
      clientIp,
      eventLabel,
      sourceLabel,
      carDisplay,
      dateStr,
      timeStr,
    };
    fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload),
    }).catch((err) => console.error('[track/whatsapp] Make webhook error:', err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[track/whatsapp] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
