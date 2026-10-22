import { BOOKING_ADDONS, type BookingAddonId } from '@/lib/bookingAddons';

export const WHEEL_STORAGE_KEY = 'amseel-wheel-of-chance-v1';
export const WHEEL_PRIZE_STORAGE_KEY = 'amseel-wheel-prize-v1';

export type WheelPrizeId = BookingAddonId;

export type WheelStorageState = {
  dismissedAt?: string;
  spunAt?: string;
  prizeId?: WheelPrizeId;
  claimCode?: string;
};

/** Saved prize + claim code for booking / WhatsApp (no account). */
export type WheelClaim = {
  prizeId: WheelPrizeId;
  claimCode: string;
  spunAt: string;
};

/** Short prize tags embedded in claim codes (staff-readable). */
const PRIZE_CODE_TAG: Record<WheelPrizeId, string> = {
  'full-insurance': 'INS',
  'child-seat': 'SEAT',
  'extra-child-seat': 'XSEAT',
  'additional-driver': 'DRV',
  'surfboard-roof-racks': 'SRF',
  'rooftop-cargo': 'BOX',
};

/** Wheel prizes: booking add-ons minus duplicate child-seat variant. */
export const WHEEL_SEGMENTS: WheelPrizeId[] = BOOKING_ADDONS.filter(
  (addon) => addon.id !== 'extra-child-seat',
).map((addon) => addon.id);

export const WHEEL_SEGMENT_COLORS = [
  '#EC1C25',
  '#1c1410',
  '#c9a227',
  '#8b1520',
  '#2a221c',
  '#e8d5a3',
] as const;

const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const CLAIM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomClaimToken(length = 4): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CLAIM_CODE_ALPHABET[bytes[i]! % CLAIM_CODE_ALPHABET.length];
  }
  return out;
}

/** e.g. AMC-INS-7K2P — easy to say on WhatsApp, no login. */
export function createWheelClaimCode(prizeId: WheelPrizeId): string {
  return `AMC-${PRIZE_CODE_TAG[prizeId]}-${randomClaimToken(4)}`;
}

export function readWheelStorage(): WheelStorageState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(WHEEL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WheelStorageState;
  } catch {
    return null;
  }
}

export function writeWheelStorage(state: WheelStorageState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WHEEL_STORAGE_KEY, JSON.stringify(state));
}

export function shouldShowWheelOfChance(): boolean {
  const state = readWheelStorage();
  if (!state) return true;
  if (state.spunAt) return false;
  if (state.dismissedAt) {
    const dismissed = Date.parse(state.dismissedAt);
    if (Number.isFinite(dismissed) && Date.now() - dismissed < DISMISS_COOLDOWN_MS) {
      return false;
    }
  }
  return true;
}

export function persistWheelPrize(prizeId: WheelPrizeId, claimCode?: string): WheelClaim {
  const code = claimCode ?? createWheelClaimCode(prizeId);
  const spunAt = new Date().toISOString();
  const claim: WheelClaim = { prizeId, claimCode: code, spunAt };
  if (typeof window === 'undefined') return claim;
  window.localStorage.setItem(WHEEL_PRIZE_STORAGE_KEY, prizeId);
  writeWheelStorage({
    ...readWheelStorage(),
    spunAt,
    prizeId,
    claimCode: code,
  });
  return claim;
}

/** Read a saved wheel gift for booking / WhatsApp (same browser). */
export function readWheelClaim(): WheelClaim | null {
  const state = readWheelStorage();
  if (!state?.prizeId || !state.spunAt) return null;
  if (!WHEEL_SEGMENTS.includes(state.prizeId)) return null;
  const claimCode = state.claimCode ?? createWheelClaimCode(state.prizeId);
  if (!state.claimCode && typeof window !== 'undefined') {
    writeWheelStorage({ ...state, claimCode });
  }
  return { prizeId: state.prizeId, claimCode, spunAt: state.spunAt };
}

export function pickWheelPrizeIndex(): number {
  return Math.floor(Math.random() * WHEEL_SEGMENTS.length);
}

/** Degrees to rotate so segment `index` lands under the top pointer. */
export function wheelRotationForIndex(index: number, fullSpins = 6): number {
  const n = WHEEL_SEGMENTS.length;
  const segment = 360 / n;
  const centerFromStart = index * segment + segment / 2;
  return fullSpins * 360 + (360 - centerFromStart);
}
