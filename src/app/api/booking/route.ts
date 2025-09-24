import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      pickupDate,
      returnDate,
      pickupLocation,
      returnLocation,
      carName,
      carPrice,
      rentalDays,
      totalPrice,
    } = body;

    // Validate required fields
    if (!fullName || !email || !phone || !pickupDate || !returnDate) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Format dates
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // Send email to business owner
    const businessEmail = await resend.emails.send({
      from: 'Amseel Cars <noreply@amseelcars.com>', // Use your verified domain
      replyTo: email, // Customer's email for easy replies
      to: ['amseelcars5@gmail.com'], // Replace with your email
      subject: `Nouvelle demande de réservation - ${carName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Nouvelle demande de réservation</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Amseel Cars</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Détails de la voiture</h2>
              <p><strong>Car:</strong> ${carName}</p>
              <p><strong>Price par jour:</strong> DH ${carPrice}</p>
              <p><strong>Durée de location:</strong> ${rentalDays} jour${rentalDays > 1 ? 's' : ''}</p>
              <p><strong>Total price:</strong> <span style="color: #667eea; font-weight: bold; font-size: 18px;">DH ${totalPrice}</span></p>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Informations du client</h2>
              <p><strong>Full Name:</strong> ${fullName}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #667eea;">${email}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${phone}" style="color: #667eea;">${phone}</a></p>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Détails de la location</h2>
              <p><strong>Date de retrait:</strong> ${formatDate(pickupDate)}</p>
              <p><strong>Date de retour:</strong> ${formatDate(returnDate)}</p>
              <p><strong>Lieu de retrait:</strong> ${pickupLocation}</p>
              <p><strong>Lieu de retour:</strong> ${returnLocation}</p>
            </div>


            <div style="background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h3 style="margin-top: 0;">Prochaines étapes</h3>
              <p style="margin-bottom: 0;">Veuillez contacter le client pour confirmer la disponibilité et finaliser les détails de la réservation.</p>
            </div>
          </div>
        </div>
      `,
    });

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: 'Amseel Cars <noreply@amseelcars.com>',
      replyTo: 'amseelcars5@gmail.com', // Your business email for customer replies
      to: [email],
      subject: `Demande de réservation reçue - ${carName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Demande de réservation reçue</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Merci pour votre choix Amseel Cars</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Détails de votre réservation</h2>
              <p><strong>Car:</strong> ${carName}</p>
              <p><strong>Date de retrait:</strong> ${formatDate(pickupDate)}</p>
              <p><strong>Date de retour:</strong> ${formatDate(returnDate)}</p>
              <p><strong>Total Price:</strong> <span style="color: #667eea; font-weight: bold; font-size: 18px;">DH ${totalPrice}</span></p>
              <p><strong>Lieu de retrait:</strong> ${pickupLocation}</p>
              <p><strong>Lieu de retour:</strong> ${returnLocation}</p>
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
      { status: 200 }
    );

  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Échec de la soumission de la demande de réservation' },
      { status: 500 }
    );
  }
}
