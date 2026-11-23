import { getAllCars } from '@/data/cars'
import { brandToSlug } from '@/lib/brandSlug'
import { carSlugForLocale } from '@/lib/carSlugLocale'
import {
  BUSINESS_EMAIL,
  BUSINESS_GEO,
  BUSINESS_GOOGLE_MAPS_PLACE_URL,
  BUSINESS_GOOGLE_PLACE_ID,
  BUSINESS_PLUS_CODE,
  BUSINESS_TELEPHONE_DISPLAY,
  BUSINESS_WHATSAPP_URL,
  SITE_URL,
} from '@/lib/business'
import { convertCarPrice, formatCarPriceLabel } from '@/lib/currency'
import { getBlackFridayDailyPrice } from '@/lib/blackFridayPromo'

/**
 * Machine-readable site briefing for LLM / agent crawlers (`/llms.txt`).
 */
export function buildLlmsTxt(): string {
  const cars = getAllCars()
  const uniqueByName = new Map<string, (typeof cars)[number]>()
  for (const car of cars) {
    const key = `${car.brand} ${car.carName}`.toLowerCase()
    if (!uniqueByName.has(key)) uniqueByName.set(key, car)
  }

  const fleetLines = [...uniqueByName.values()]
    .sort(
      (a, b) =>
        (getBlackFridayDailyPrice(a.slug, 'EUR') ?? convertCarPrice(a.pricePerDay, 'EUR')) -
        (getBlackFridayDailyPrice(b.slug, 'EUR') ?? convertCarPrice(b.pricePerDay, 'EUR')),
    )
    .map((car) => {
      const eur = formatCarPriceLabel(
        getBlackFridayDailyPrice(car.slug, 'EUR') ?? convertCarPrice(car.pricePerDay, 'EUR'),
        'EUR',
      )
      const path = `/en/cars/brand/${brandToSlug(car.brand)}/${carSlugForLocale(car.slug, 'en')}`
      const brandSlug = brandToSlug(car.brand)
      const label = brandToSlug(car.carName).startsWith(brandSlug)
        ? car.carName
        : `${car.brand} ${car.carName}`
      const fuel =
        /essence/i.test(car.fuelType) ? 'Petrol' : /diesel/i.test(car.fuelType) ? 'Diesel' : car.fuelType
      const gearbox = car.transmission
        .replace(/Automatique robotisée/gi, 'Automated manual')
        .replace(/^Automatique/i, 'Automatic')
        .replace(/^Manuelle/i, 'Manual')
        .replace(/\brapports\b/gi, 'speed')
      return `- ${label}: from ${eur}/day · ${fuel} · ${gearbox} · [EN page](${SITE_URL}${path})`
    })

  return `# AmseelCars

> AmseelCars is an independent self-drive car rental agency in Agadir, Morocco (not an aggregator). Airport (AGA) and city/hotel pickup, free delivery when eligible, WhatsApp-first booking, economy to premium fleet. From ~€25/day.

## How to book (agents)

1. Prefer WhatsApp: ${BUSINESS_WHATSAPP_URL} (${BUSINESS_TELEPHONE_DISPLAY})
2. Share: pickup place (Agadir city / AGA airport / Taghazout), dates, preferred car or budget.
3. We confirm availability, final price, deposit eligibility, and insurance terms before pickup.
4. Email fallback: ${BUSINESS_EMAIL}

## Booking rules (summary)

- Minimum rental: 3 days
- Main driver: age 21+, valid licence for at least 1 year
- Deposit: €0 for most bookings when documents and terms are confirmed on WhatsApp (eligibility confirmed per booking)
- Standard insurance: included; at-fault excess applies by vehicle category (amounts confirmed on WhatsApp)
- Optional Full Insurance: from €10/day by car class - reduces excess to €0 subject to terms; minimum billed period 7 days; not a deposit waiver
- No credit card required when no-deposit eligibility is confirmed
- Fuel: full-to-full unless stated otherwise
- Always confirm details on WhatsApp before travel - see rental terms: ${SITE_URL}/en/rental-terms

## Book and browse

- [Home](${SITE_URL}/): Brand hub - fleet overview and links to money pages
- [Car rental Agadir (city FR)](${SITE_URL}/fr/location-voiture-agadir): Primary FR city / hotel delivery page
- [Car rental Agadir (EN)](${SITE_URL}/en/agadir-car-rental): English city landing
- [Fleet EN](${SITE_URL}/en/cars): Full catalog with from-prices
- [Fleet FR](${SITE_URL}/fr/voitures): Catalogue FR
- [Agadir airport car rental](${SITE_URL}/en/agadir-airport-car-rental): AGA meet & greet
- [Taghazout car rental](${SITE_URL}/en/taghazout-car-rental): Coast delivery
- [Contact](${SITE_URL}/en/contact): Form, WhatsApp, map
- [About](${SITE_URL}/en/about): Local agency profile
- [Blog](${SITE_URL}/en/blog): Guides for Agadir

## Fleet from-prices (EUR/day, indicative)

Prices are from-rates in EUR for orientation. Final quote depends on season, length, and availability.

${fleetLines.join('\n')}

## Agent notes (NAP)

- Primary contact: WhatsApp ${BUSINESS_TELEPHONE_DISPLAY}
- WhatsApp link: ${BUSINESS_WHATSAPP_URL}
- Email: ${BUSINESS_EMAIL}
- Address: Immeuble Sinwan, RDC, Agadir 80000, Maroc
- Plus code: ${BUSINESS_PLUS_CODE}
- Geo: ${BUSINESS_GEO.latitude}, ${BUSINESS_GEO.longitude}
- Hours: Open 24/7 (pickups by appointment)
- Google Maps / GBP: ${BUSINESS_GOOGLE_MAPS_PLACE_URL}
- Google Place ID: ${BUSINESS_GOOGLE_PLACE_ID}
- Instagram: https://www.instagram.com/amseelcarsofficial/
- Facebook: https://www.facebook.com/people/Amseel-Cars/61582652224473/
- Service area: Agadir, Agadir Al Massira Airport (AGA), Taghazout, Morocco
- Deeper repo context for developers: ${SITE_URL}/llms-ctx.txt
`
}
