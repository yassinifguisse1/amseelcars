/**
 * Anonymous visitor identity + device / traffic source for site tracking.
 * Reuses the same visitor id as Statsig so sessions stitch across both systems.
 */

const VISITOR_ID_KEY = 'amseel_statsig_vid';
const FIRST_VISIT_KEY = 'amseel_first_visit';
const RETURNING_SESSION_KEY = 'amseel_is_returning';
const SESSION_ID_KEY = 'amseel_session_id';

const SOCIAL_HOSTS = [
  'instagram.com',
  'facebook.com',
  'fb.com',
  'tiktok.com',
  'pinterest.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'youtube.com',
  't.co',
  'snapchat.com',
];

const SEARCH_HOSTS = [
  'google.',
  'bing.com',
  'yahoo.',
  'duckduckgo.com',
  'baidu.com',
  'yandex.',
  'ecosia.org',
];

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type TrafficSource = 'direct' | 'organic' | 'social' | 'referral' | 'paid' | 'email';

export interface VisitorContext {
  visitorId: string;
  sessionId: string;
  isReturning: boolean;
  firstVisitAt: string | null;
  deviceType: DeviceType;
  browser: string;
  os: string;
  trafficSource: TrafficSource;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  fullUrl: string;
  userAgent: string;
  language: string;
  referrer: string;
  screen: string;
  timezone: string;
}

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'ssr-visitor';
  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing && existing.length >= 8) return existing;
    const id = generateId('v');
    localStorage.setItem(VISITOR_ID_KEY, id);
    if (!localStorage.getItem(FIRST_VISIT_KEY)) {
      localStorage.setItem(FIRST_VISIT_KEY, new Date().toISOString());
    }
    return id;
  } catch {
    return generateId('v_tmp');
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-session';
  try {
    const existing = sessionStorage.getItem(SESSION_ID_KEY);
    if (existing && existing.length >= 8) return existing;
    const id = generateId('s');
    sessionStorage.setItem(SESSION_ID_KEY, id);
    return id;
  } catch {
    return generateId('s_tmp');
  }
}

/** Returning = this browser already had a visitor id before this session started. */
function getIsReturning(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const cached = sessionStorage.getItem(RETURNING_SESSION_KEY);
    if (cached === 'true' || cached === 'false') return cached === 'true';

    const hadId = Boolean(localStorage.getItem(VISITOR_ID_KEY));
    // Ensure id + first visit are set for future sessions
    getOrCreateVisitorId();
    const isReturning = hadId;
    sessionStorage.setItem(RETURNING_SESSION_KEY, String(isReturning));
    return isReturning;
  } catch {
    return false;
  }
}

export function parseDevice(ua: string): { deviceType: DeviceType; browser: string; os: string } {
  const tablet = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua));
  const mobile = !tablet && /Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const deviceType: DeviceType = tablet ? 'tablet' : mobile ? 'mobile' : 'desktop';

  let browser = 'Other';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/MSIE|Trident\//i.test(ua)) browser = 'IE';

  let os = 'Other';
  if (/Windows Phone/i.test(ua)) os = 'Windows Phone';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/CrOS/i.test(ua)) os = 'ChromeOS';

  return { deviceType, browser, os };
}

function hostMatches(hostname: string, needles: string[]): boolean {
  const h = hostname.toLowerCase();
  return needles.some((n) => (n.endsWith('.') ? h.includes(n) || h.endsWith(n.slice(0, -1)) : h === n || h.endsWith(`.${n}`)));
}

export function classifyTrafficSource(opts: {
  referrer: string;
  utmSource: string;
  utmMedium: string;
  pageHost?: string;
}): TrafficSource {
  const medium = opts.utmMedium.toLowerCase();
  const source = opts.utmSource.toLowerCase();

  if (medium === 'cpc' || medium === 'ppc' || medium === 'paid' || medium === 'paid_social' || medium === 'display') {
    return 'paid';
  }
  if (medium === 'email' || source === 'email' || source === 'newsletter') {
    return 'email';
  }
  if (medium === 'social' || (source && SOCIAL_HOSTS.some((h) => source.includes(h.replace('.com', ''))))) {
    return 'social';
  }
  if (medium === 'organic') return 'organic';
  if (opts.utmSource) return 'referral';

  if (!opts.referrer) return 'direct';

  try {
    const ref = new URL(opts.referrer);
    const pageHost = (opts.pageHost || (typeof window !== 'undefined' ? window.location.hostname : '')).toLowerCase();
    if (pageHost && (ref.hostname === pageHost || ref.hostname.endsWith(`.${pageHost}`))) {
      return 'direct';
    }
    if (hostMatches(ref.hostname, SEARCH_HOSTS)) return 'organic';
    if (hostMatches(ref.hostname, SOCIAL_HOSTS)) return 'social';
    return 'referral';
  } catch {
    return 'direct';
  }
}

function readUtms(): {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
} {
  if (typeof window === 'undefined') {
    return { utmSource: '', utmMedium: '', utmCampaign: '', utmContent: '', utmTerm: '' };
  }
  const params = new URLSearchParams(window.location.search);
  const fromUrl = {
    utmSource: (params.get('utm_source') || '').slice(0, 100),
    utmMedium: (params.get('utm_medium') || '').slice(0, 100),
    utmCampaign: (params.get('utm_campaign') || '').slice(0, 100),
    utmContent: (params.get('utm_content') || '').slice(0, 100),
    utmTerm: (params.get('utm_term') || '').slice(0, 100),
  };

  // Persist first-touch UTMs for the session so later page views keep attribution
  try {
    const stored = sessionStorage.getItem('amseel_utm');
    if (fromUrl.utmSource || fromUrl.utmMedium || fromUrl.utmCampaign) {
      sessionStorage.setItem('amseel_utm', JSON.stringify(fromUrl));
      return fromUrl;
    }
    if (stored) {
      const parsed = JSON.parse(stored) as typeof fromUrl;
      return {
        utmSource: String(parsed.utmSource || '').slice(0, 100),
        utmMedium: String(parsed.utmMedium || '').slice(0, 100),
        utmCampaign: String(parsed.utmCampaign || '').slice(0, 100),
        utmContent: String(parsed.utmContent || '').slice(0, 100),
        utmTerm: String(parsed.utmTerm || '').slice(0, 100),
      };
    }
  } catch {
    /* ignore */
  }
  return fromUrl;
}

export function getVisitorContext(): VisitorContext {
  if (typeof window === 'undefined') {
    return {
      visitorId: 'ssr-visitor',
      sessionId: 'ssr-session',
      isReturning: false,
      firstVisitAt: null,
      deviceType: 'desktop',
      browser: '',
      os: '',
      trafficSource: 'direct',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      utmContent: '',
      utmTerm: '',
      fullUrl: '',
      userAgent: '',
      language: '',
      referrer: '',
      screen: '',
      timezone: '',
    };
  }

  const isReturning = getIsReturning();
  const visitorId = getOrCreateVisitorId();
  const sessionId = getSessionId();
  const ua = window.navigator.userAgent || '';
  const { deviceType, browser, os } = parseDevice(ua);
  const utms = readUtms();

  let referrer = '';
  if (document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      referrer = refUrl.origin + refUrl.pathname;
    } catch {
      referrer = '';
    }
  }

  let firstVisitAt: string | null = null;
  try {
    firstVisitAt = localStorage.getItem(FIRST_VISIT_KEY);
  } catch {
    firstVisitAt = null;
  }

  const trafficSource = classifyTrafficSource({
    referrer,
    utmSource: utms.utmSource,
    utmMedium: utms.utmMedium,
    pageHost: window.location.hostname,
  });

  return {
    visitorId,
    sessionId,
    isReturning,
    firstVisitAt,
    deviceType,
    browser,
    os,
    trafficSource,
    ...utms,
    fullUrl: window.location.href,
    userAgent: ua,
    language: window.navigator.language || '',
    referrer,
    screen: `${window.screen?.width ?? ''}x${window.screen?.height ?? ''}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  };
}
