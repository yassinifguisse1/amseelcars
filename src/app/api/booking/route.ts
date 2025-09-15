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
      driverAge,
      licenseNumber,
      specialRequests,
      carName,
      carPrice,
      rentalDays,
      totalPrice,
    } = body;

    // Validate required fields
    if (!fullName || !email || !phone || !pickupDate || !returnDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
      subject: `New Car Booking Request - ${carName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">New Car Booking Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Amseel Cars</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Car Details</h2>
              <p><strong>Car:</strong> ${carName}</p>
              <p><strong>Price per day:</strong> DH ${carPrice}</p>
              <p><strong>Rental duration:</strong> ${rentalDays} day${rentalDays > 1 ? 's' : ''}</p>
              <p><strong>Total price:</strong> <span style="color: #667eea; font-weight: bold; font-size: 18px;">DH ${totalPrice}</span></p>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Customer Information</h2>
              <p><strong>Full Name:</strong> ${fullName}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #667eea;">${email}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${phone}" style="color: #667eea;">${phone}</a></p>
              <p><strong>Driver Age:</strong> ${driverAge} years old</p>
              <p><strong>License Number:</strong> ${licenseNumber}</p>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Rental Details</h2>
              <p><strong>Pickup Date:</strong> ${formatDate(pickupDate)}</p>
              <p><strong>Return Date:</strong> ${formatDate(returnDate)}</p>
              <p><strong>Pickup Location:</strong> ${pickupLocation}</p>
              <p><strong>Return Location:</strong> ${returnLocation}</p>
            </div>

            ${specialRequests ? `
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Special Requests</h2>
              <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">${specialRequests}</p>
            </div>
            ` : ''}

            <div style="background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h3 style="margin-top: 0;">Next Steps</h3>
              <p style="margin-bottom: 0;">Please contact the customer to confirm availability and finalize the booking details.</p>
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
      subject: `Booking Request Received - ${carName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Booking Request Received</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for choosing Amseel Cars</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Your Booking Details</h2>
              <p><strong>Car:</strong> ${carName}</p>
              <p><strong>Pickup Date:</strong> ${formatDate(pickupDate)}</p>
              <p><strong>Return Date:</strong> ${formatDate(returnDate)}</p>
              <p><strong>Total Price:</strong> <span style="color: #667eea; font-weight: bold; font-size: 18px;">DH ${totalPrice}</span></p>
            </div>

            <div style="background: #28a745; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <h3 style="margin-top: 0;">✅ Request Confirmed</h3>
              <p style="margin-bottom: 0;">We've received your booking request and will contact you within 24 hours to confirm availability and finalize your reservation.</p>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
              <p><strong>Phone:</strong> <a href="tel:+212662500181" style="color: #667eea;">+212 662 500 181</a></p>
              <p><strong>WhatsApp:</strong> <a href="https://wa.me/212662500181" style="color: #667eea;">+212 662 500 181</a></p>
              <p><strong>Email:</strong> <a href="mailto:info@amseelcars.com" style="color: #667eea;">info@amseelcars.com</a></p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Booking request submitted successfully',
        businessEmailId: businessEmail.data?.id,
        customerEmailId: customerEmail.data?.id,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Failed to submit booking request' },
      { status: 500 }
    );
  }
}
