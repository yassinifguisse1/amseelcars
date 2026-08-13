import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import {
  checkFormRateLimit,
  escapeHtml,
  getClientIp,
  isHoneypotTripped,
  isSubmittedTooFast,
  looksLikeSpamMessage,
  notifySpamBlocked,
} from '@/lib/formSpamGuard'
import { saveTrackEvent } from '@/lib/saveTrackEvent'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message, website, formOpenedAt } = body

    const ip = getClientIp(request)

    if (isHoneypotTripped(website)) {
      void notifySpamBlocked({
        form: 'contact',
        reason: 'honeypot',
        ip,
        fields: { name, email, phone, message, honeypot: website },
      })
      return NextResponse.json(
        { message: 'Email sent successfully' },
        { status: 200 },
      )
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    if (isSubmittedTooFast(formOpenedAt)) {
      void notifySpamBlocked({
        form: 'contact',
        reason: 'too_fast',
        ip,
        fields: { name, email, phone, message, formOpenedAt },
      })
      return NextResponse.json(
        { error: 'Please wait a moment and try again.' },
        { status: 400 },
      )
    }

    if (looksLikeSpamMessage(message)) {
      void notifySpamBlocked({
        form: 'contact',
        reason: 'spam_message',
        ip,
        fields: { name, email, phone, message },
      })
      return NextResponse.json(
        { error: 'Please enter a clearer message.' },
        { status: 400 },
      )
    }

    if (!checkFormRateLimit(ip, 'contact').ok) {
      void notifySpamBlocked({
        form: 'contact',
        reason: 'rate_limit',
        ip,
        fields: { name, email, phone, message },
      })
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safePhone = phone ? escapeHtml(phone) : ''
    const safeMessage = escapeHtml(message)

    const { data, error } = await resend.emails.send({
      from: 'AmseelCars Contact <onboarding@resend.dev>',
      to: ['amseelcars5@gmail.com'],
      subject: `Nouveau message de contact de ${String(name)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #CB1939; margin-bottom: 20px; text-align: center;">
              Nouveau Message de Contact - AmseelCars
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 15px;">Informations du Client</h3>
              <p style="margin: 8px 0; color: #555;"><strong>Nom:</strong> ${safeName}</p>
              <p style="margin: 8px 0; color: #555;"><strong>Email:</strong> ${safeEmail}</p>
              ${safePhone ? `<p style="margin: 8px 0; color: #555;"><strong>Téléphone:</strong> ${safePhone}</p>` : ''}
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <h3 style="color: #333; margin-bottom: 15px;">Message</h3>
              <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
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
        - Nom: ${String(name)}
        - Email: ${String(email)}
        ${phone ? `- Téléphone: ${String(phone)}` : ''}
        
        Message:
        ${String(message)}
        
        Ce message a été envoyé depuis le formulaire de contact du site AmseelCars
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 },
      )
    }

    try {
      await saveTrackEvent({
        event: 'contact-submit',
        path: '/contact',
        source: 'contact-form-server',
        fullName: String(name),
        email: String(email),
        phone: phone || null,
        message: String(message),
        clientIp: ip !== 'unknown' ? ip : null,
      })
    } catch (trackErr) {
      console.error('[contact] Track event save error:', trackErr)
    }

    return NextResponse.json(
      { message: 'Email sent successfully', data },
      { status: 200 },
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
