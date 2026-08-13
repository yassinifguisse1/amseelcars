import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  checkFormRateLimit,
  escapeHtml,
  getClientIp,
  isHoneypotTripped,
  isSubmittedTooFast,
  notifySpamBlocked,
} from '@/lib/formSpamGuard';
import { MIN_RENTAL_DAYS, meetsMinRentalDays, rentalDayCount } from '@/lib/rentalPolicy';

const resend = new Resend(process.env.RESEND_API_KEY);

const locationLabels: { [key: string]: string } = {
  'agadir-centre': 'Agadir Centre',
  'aeroport-al-massira': 'Aéroport Al Massira',
  'taghazout': 'Taghazout',
  'agence': 'Agence',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      pickupLocation,
      returnLocation,
      carName,
      carPrice,
      rentalDays,
      totalPrice,
      website,
      formOpenedAt,
    } = body;

    const ip = getClientIp(request);

    // Honeypot: pretend success so bots stop retrying
    if (isHoneypotTripped(website)) {
      void notifySpamBlocked({
        form: 'booking',
        reason: 'honeypot',
        ip,
        fields: {
          fullName,
          email,
          phone,
          carName,
          honeypot: website,
          pickupDate,
          returnDate,
        },
      });
      return NextResponse.json(
        { success: true, message: 'Demande de réservation soumise avec succès' },
        { status: 200 },
      );
    }

    if (!fullName || !email || !phone || !pickupDate || !returnDate) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 },
      );
    }

    if (isSubmittedTooFast(formOpenedAt)) {
      void notifySpamBlocked({
        form: 'booking',
        reason: 'too_fast',
        ip,
        fields: { fullName, email, phone, carName, formOpenedAt, pickupDate, returnDate },
      });
      return NextResponse.json(
        { error: 'Veuillez réessayer dans un instant.' },
        { status: 400 },
      );
    }

    if (!checkFormRateLimit(ip, 'booking').ok) {
      void notifySpamBlocked({
        form: 'booking',
        reason: 'rate_limit',
        ip,
        fields: { fullName, email, phone, carName },
      });
      return NextResponse.json(
        { error: 'Trop de demandes. Réessayez plus tard.' },
        { status: 429 },
      );
    }

    const computedDays = rentalDayCount(String(pickupDate), String(returnDate));
    const days = Number(rentalDays) > 0 ? Number(rentalDays) : computedDays;
    if (!meetsMinRentalDays(days)) {
      return NextResponse.json(
        {
          error: `La location minimale est de ${MIN_RENTAL_DAYS} jours. Les locations de 1 à 4 jours ne sont pas acceptées.`,
        },
        { status: 400 },
      );
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatLocation = (locationKey: string) => {
      return locationLabels[locationKey] || locationKey;
    };

    const safe = {
      fullName: escapeHtml(fullName),
      email: escapeHtml(email),
      phone: escapeHtml(phone),
      carName: escapeHtml(carName),
      carPrice: escapeHtml(carPrice),
      rentalDays: escapeHtml(rentalDays),
      totalPrice: escapeHtml(totalPrice),
      pickupTime: escapeHtml(pickupTime),
      returnTime: escapeHtml(returnTime),
      pickupLocation: escapeHtml(formatLocation(pickupLocation)),
      returnLocation: escapeHtml(formatLocation(returnLocation)),
      pickupDate: escapeHtml(formatDate(pickupDate)),
      returnDate: escapeHtml(formatDate(returnDate)),
    };

    const businessEmail = await resend.emails.send({
      from: 'Amseel Cars <noreply@amseelcars.com>',
      replyTo: String(email),
      to: ['amseelcars5@gmail.com'],
      subject: `Nouvelle demande de réservation - ${String(carName)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Nouvelle demande de réservation</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Amseel Cars</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Détails de la voiture</h2>
              <p><strong>Car:</strong> ${safe.carName}</p>
              <p><strong>Price par jour:</strong>${safe.carPrice} DH </p>
              <p><strong>Durée de location:</strong> ${safe.rentalDays} jour${Number(rentalDays) > 1 ? 's' : ''}</p>
              <p><strong>Total price:</strong> <span style="color: #667eea; font-weight: bold; font-size: 18px;">${safe.totalPrice} DH </span></p>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Informations du client</h2>
              <p><strong>Full Name:</strong> ${safe.fullName}</p>
              <p><strong>Email:</strong> <a href="mailto:${safe.email}" style="color: #667eea;">${safe.email}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${safe.phone}" style="color: #667eea;">${safe.phone}</a></p>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Détails de la location</h2>
              <p><strong>Date de retrait:</strong> ${safe.pickupDate}${pickupTime ? ` à ${safe.pickupTime}` : ''}</p>
              <p><strong>Date de retour:</strong> ${safe.returnDate}${returnTime ? ` à ${safe.returnTime}` : ''}</p>
              <p><strong>Lieu de retrait:</strong> ${safe.pickupLocation}</p>
              <p><strong>Lieu de retour:</strong> ${safe.returnLocation}</p>
            </div>


            <div style="background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h3 style="margin-top: 0;">Prochaines étapes</h3>
              <p style="margin-bottom: 0;">Veuillez contacter le client pour confirmer la disponibilité et finaliser les détails de la réservation.</p>
            </div>
          </div>
        </div>
      `,
    });

    const customerEmail = await resend.emails.send({
      from: 'Amseel Cars <noreply@amseelcars.com>',
      replyTo: 'amseelcars5@gmail.com',
      to: [String(email)],
      subject: `Demande de réservation reçue - ${String(carName)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Demande de réservation reçue</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Merci pour votre choix Amseel Cars</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Détails de votre réservation</h2>
              <p><strong>Car:</strong> ${safe.carName}</p>
              <p><strong>Date de retrait:</strong> ${safe.pickupDate}${pickupTime ? ` à ${safe.pickupTime}` : ''}</p>
              <p><strong>Date de retour:</strong> ${safe.returnDate}${returnTime ? ` à ${safe.returnTime}` : ''}</p>
              <p><strong>Total Price:</strong> <span style="color: #667eea; font-weight: bold; font-size: 18px;">${safe.totalPrice} DH </span></p>
              <p><strong>Lieu de retrait:</strong> ${safe.pickupLocation}</p>
              <p><strong>Lieu de retour:</strong> ${safe.returnLocation}</p>
            </div>

            <div style="background: #28a745; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <h3 style="margin-top: 0;">✅ Demande confirmée</h3>
              <p style="margin-bottom: 0;">Nous avons reçu votre demande de réservation et nous vous contacterons dans les 24 heures pour confirmer la disponibilité et finaliser votre réservation.</p>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Informations de contact</h3>
              <p><strong>Téléphone:</strong> <a href="tel:+212662500181" style="color: #667eea;">+212 662 500 181</a></p>
              <p><strong>WhatsApp:</strong> <a href="https://wa.me/212662500181" style="color: #667eea;">+212 662 500 181</a></p>
              <p><strong>Email:</strong> <a href="mailto:amseelcars5@gmail.com" style="color: #667eea;">amseelcars5@gmail.com</a></p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Demande de réservation soumise avec succès',
        businessEmailId: businessEmail.data?.id,
        customerEmailId: customerEmail.data?.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Échec de la soumission de la demande de réservation' },
      { status: 500 },
    );
  }
}
