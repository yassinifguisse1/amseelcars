import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'AmseelCars Contact <onboarding@resend.dev>', // This works for testing
      to: ['amseelcars5@gmail.com'], // Use the original email that's already verified
      subject: `Nouveau message de contact de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #CB1939; margin-bottom: 20px; text-align: center;">
              Nouveau Message de Contact - AmseelCars
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 15px;">Informations du Client</h3>
              <p style="margin: 8px 0; color: #555;"><strong>Nom:</strong> ${name}</p>
              <p style="margin: 8px 0; color: #555;"><strong>Email:</strong> ${email}</p>
              ${phone ? `<p style="margin: 8px 0; color: #555;"><strong>Téléphone:</strong> ${phone}</p>` : ''}
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <h3 style="color: #333; margin-bottom: 15px;">Message</h3>
              <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Ce message a été envoyé depuis le formulaire de contact du site AmseelCars
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Nouveau Message de Contact - AmseelCars
        
        Informations du Client:
        - Nom: ${name}
        - Email: ${email}
        ${phone ? `- Téléphone: ${phone}` : ''}
        
        Message:
        ${message}
        
        Ce message a été envoyé depuis le formulaire de contact du site AmseelCars
      `
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Email sent successfully', data },
      { status: 200 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
