export type TrackEvent = 'whatsapp' | 'reserver' | 'booking-submit' | 'booking-confirmed'

/**
 * Builds the request body for click tracking (WhatsApp, Réserver maintenant, Envoyer la réservation), including visitor details when run in the browser.
 */
export function getWhatsAppTrackBody(params: {
  path: string
  source: string
  carSlug?: string
  carName?: string
  event?: TrackEvent
}) {
  if (typeof window === 'undefined') {
    return params
  }
  return {
    ...params,
    fullUrl: window.location.href,
    userAgent: window.navigator.userAgent,
    language: window.navigator.language,
    referrer: document.referrer || '',
    screen: `${window.screen?.width ?? ''}x${window.screen?.height ?? ''}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}
