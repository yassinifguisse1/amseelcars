/** Booking-funnel stages for the admin overview action queue. */
export type JourneyStage =
  | 'confirmed'
  | 'abandoned'
  | 'form-started'
  | 'opened-no-details'
  | 'car-interest';

export type JourneyEventLike = {
  id: string;
  event: string;
  path: string;
  source: string | null;
  carSlug: string | null;
  carName: string | null;
  visitorId: string | null;
  sessionId: string | null;
  country: string | null;
  city: string | null;
  deviceType: string | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  pickupDate: string | null;
  returnDate: string | null;
  pickupLocation: string | null;
  returnLocation: string | null;
  rentalDays: number | null;
  totalPrice: number | null;
  metadata: unknown;
  createdAt: Date | string;
};

export type BookingJourney = {
  id: string;
  stage: JourneyStage;
  visitorId: string | null;
  carName: string | null;
  carSlug: string | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  deviceType: string | null;
  pickupDate: string | null;
  returnDate: string | null;
  path: string | null;
  createdAt: string;
  lastActivityAt: string;
  eventCount: number;
  hasContact: boolean;
  /** Primary track event (best representative for this journey). */
  event: string;
  summary: string;
};

const STAGE_RANK: Record<JourneyStage, number> = {
  confirmed: 50,
  abandoned: 40,
  'form-started': 30,
  'opened-no-details': 20,
  'car-interest': 10,
};

const INTEREST_EVENTS = new Set([
  'booking-confirmed',
  'booking-submit',
  'booking-abandoned',
  'booking-form-progress',
  'booking-dialog-open',
  'contact-submit',
  'car-card-click',
  'reserver',
  'scroll-reservation',
]);

function trim(value: string | null | undefined): string {
  return (value || '').trim();
}

function hasContact(row: JourneyEventLike): boolean {
  return Boolean(trim(row.fullName) || trim(row.email) || trim(row.phone));
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function identityKeys(row: JourneyEventLike): string[] {
  const keys: string[] = [];
  if (trim(row.visitorId).length >= 4) keys.push(`v:${row.visitorId}`);
  const phone = normalizePhone(trim(row.phone));
  if (phone.length >= 8) keys.push(`p:${phone}`);
  const email = trim(row.email).toLowerCase();
  if (email.includes('@')) keys.push(`e:${email}`);
  return keys;
}

function fallbackKey(row: JourneyEventLike): string {
  const day =
    typeof row.createdAt === 'string'
      ? row.createdAt.slice(0, 10)
      : row.createdAt.toISOString().slice(0, 10);
  const car = trim(row.carSlug) || trim(row.carName) || 'unknown';
  if (trim(row.visitorId).length >= 4) return `v:${row.visitorId}|${car}`;
  return `anon:${day}|${car}|${trim(row.path)}`;
}

function toIso(value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString();
}

function stageForEvent(row: JourneyEventLike): JourneyStage | null {
  switch (row.event) {
    case 'booking-confirmed':
      return 'confirmed';
    case 'booking-abandoned':
      return hasContact(row) ? 'abandoned' : 'form-started';
    case 'booking-form-progress':
      return hasContact(row) ? 'abandoned' : 'form-started';
    case 'booking-submit':
      return hasContact(row) ? 'abandoned' : 'opened-no-details';
    case 'contact-submit':
      return hasContact(row) ? 'abandoned' : 'form-started';
    case 'booking-dialog-open':
    case 'scroll-reservation':
      return 'opened-no-details';
    case 'car-card-click':
    case 'reserver':
      return 'car-interest';
    default:
      return null;
  }
}

function summaryFor(stage: JourneyStage, car: string | null): string {
  const carLabel = car || 'une voiture';
  switch (stage) {
    case 'confirmed':
      return `Réservation confirmée · ${carLabel}`;
    case 'abandoned':
      return `A commencé une réservation · ${carLabel}`;
    case 'form-started':
      return `Formulaire commencé, sans coordonnées · ${carLabel}`;
    case 'opened-no-details':
      return `A ouvert la réservation, sans détails · ${carLabel}`;
    case 'car-interest':
      return `A consulté / cliqué · ${carLabel}`;
  }
}

type MutableJourney = {
  keys: Set<string>;
  events: JourneyEventLike[];
  stage: JourneyStage;
  primary: JourneyEventLike;
  firstAt: number;
  lastAt: number;
};

function pickRicher(a: JourneyEventLike, b: JourneyEventLike): JourneyEventLike {
  const score = (r: JourneyEventLike) =>
    (trim(r.fullName) ? 4 : 0) +
    (trim(r.phone) ? 4 : 0) +
    (trim(r.email) ? 2 : 0) +
    (trim(r.carName) ? 1 : 0) +
    (trim(r.country) ? 1 : 0);
  if (score(b) > score(a)) return b;
  if (score(b) < score(a)) return a;
  return new Date(toIso(b.createdAt)).getTime() >= new Date(toIso(a.createdAt)).getTime() ? b : a;
}

/**
 * Collapse raw track events into one actionable journey per visitor/contact.
 * Confirmed bookings suppress earlier abandons for the same person.
 */
export function buildBookingJourneys(
  rows: JourneyEventLike[],
  options?: { limit?: number },
): BookingJourney[] {
  const limit = options?.limit ?? 60;
  const relevant = rows
    .filter((r) => INTEREST_EVENTS.has(r.event))
    .sort((a, b) => new Date(toIso(b.createdAt)).getTime() - new Date(toIso(a.createdAt)).getTime());

  const journeys: MutableJourney[] = [];
  const keyToIndex = new Map<string, number>();

  const findIndex = (keys: string[]): number | null => {
    for (const key of keys) {
      const idx = keyToIndex.get(key);
      if (idx !== undefined) return idx;
    }
    return null;
  };

  for (const row of relevant) {
    const stage = stageForEvent(row);
    if (!stage) continue;

    const keys = identityKeys(row);
    if (keys.length === 0) keys.push(fallbackKey(row));

    let idx = findIndex(keys);
    if (idx === null) {
      idx = journeys.length;
      const created = new Date(toIso(row.createdAt)).getTime();
      journeys.push({
        keys: new Set(keys),
        events: [row],
        stage,
        primary: row,
        firstAt: created,
        lastAt: created,
      });
    } else {
      const journey = journeys[idx];
      journey.events.push(row);
      const created = new Date(toIso(row.createdAt)).getTime();
      journey.firstAt = Math.min(journey.firstAt, created);
      journey.lastAt = Math.max(journey.lastAt, created);
      if (STAGE_RANK[stage] > STAGE_RANK[journey.stage]) {
        journey.stage = stage;
        journey.primary = row;
      } else if (stage === journey.stage) {
        journey.primary = pickRicher(journey.primary, row);
      } else {
        journey.primary = pickRicher(journey.primary, row);
      }
    }

    for (const key of keys) keyToIndex.set(key, idx);
    for (const key of journeys[idx].keys) keyToIndex.set(key, idx);
    for (const key of keys) journeys[idx].keys.add(key);
  }

  // If a journey reached confirmed, never surface as abandoned.
  for (const journey of journeys) {
    const hasConfirmed = journey.events.some((e) => e.event === 'booking-confirmed');
    if (hasConfirmed) {
      journey.stage = 'confirmed';
      const confirmed = journey.events.find((e) => e.event === 'booking-confirmed');
      if (confirmed) journey.primary = pickRicher(confirmed, journey.primary);
    }
  }

  const stageOrder = (s: JourneyStage) => {
    // Actionable first: abandoned (call back), then incomplete, then confirmed (done), then cold interest
    switch (s) {
      case 'abandoned':
        return 0;
      case 'form-started':
        return 1;
      case 'opened-no-details':
        return 2;
      case 'car-interest':
        return 3;
      case 'confirmed':
        return 4;
    }
  };

  return journeys
    .map((journey) => {
      const p = journey.primary;
      const car =
        trim(p.carName) ||
        trim(journey.events.map((e) => trim(e.carName)).find(Boolean) || '') ||
        null;
      const carSlug =
        trim(p.carSlug) ||
        trim(journey.events.map((e) => trim(e.carSlug)).find(Boolean) || '') ||
        null;
      const fullName =
        trim(p.fullName) ||
        trim(journey.events.map((e) => trim(e.fullName)).find(Boolean) || '') ||
        null;
      const email =
        trim(p.email) ||
        trim(journey.events.map((e) => trim(e.email)).find(Boolean) || '') ||
        null;
      const phone =
        trim(p.phone) ||
        trim(journey.events.map((e) => trim(e.phone)).find(Boolean) || '') ||
        null;

      return {
        id: p.id,
        stage: journey.stage,
        visitorId: trim(p.visitorId) || null,
        carName: car,
        carSlug,
        fullName,
        email,
        phone,
        country: trim(p.country) || null,
        city: trim(p.city) || null,
        deviceType: trim(p.deviceType) || null,
        pickupDate: trim(p.pickupDate) || null,
        returnDate: trim(p.returnDate) || null,
        path: trim(p.path) || null,
        createdAt: new Date(journey.firstAt).toISOString(),
        lastActivityAt: new Date(journey.lastAt).toISOString(),
        eventCount: journey.events.length,
        hasContact: Boolean(fullName || email || phone),
        event: p.event,
        summary: summaryFor(journey.stage, car),
      } satisfies BookingJourney;
    })
    .sort((a, b) => {
      const stageDiff = stageOrder(a.stage) - stageOrder(b.stage);
      if (stageDiff !== 0) return stageDiff;
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    })
    .slice(0, limit);
}

export const JOURNEY_STAGE_LABELS: Record<JourneyStage, string> = {
  confirmed: 'Confirmée',
  abandoned: 'À relancer',
  'form-started': 'Sans coordonnées',
  'opened-no-details': 'Ouvert, pas de détails',
  'car-interest': 'Intérêt voiture',
};
