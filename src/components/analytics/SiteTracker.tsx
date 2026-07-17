'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/trackEvent';

const SOCIAL_HOSTS = [
  'instagram.com',
  'facebook.com',
  'tiktok.com',
  'pinterest.com',
  'twitter.com',
  'x.com',
];

function detectLinkEvent(anchor: HTMLAnchorElement): {
  event: Parameters<typeof trackEvent>[0]['event'];
  source: string;
  ctaLabel: string;
} | null {
  const href = anchor.getAttribute('href') ?? '';
  const label = (anchor.textContent?.trim() || href).slice(0, 200);

  if (href.startsWith('tel:')) {
    return { event: 'phone-click', source: 'auto-tracker', ctaLabel: label || href };
  }
  if (href.startsWith('mailto:')) {
    return { event: 'email-click', source: 'auto-tracker', ctaLabel: label || href };
  }
  if (href.includes('wa.me') || href.includes('whatsapp.com')) {
    return { event: 'whatsapp', source: 'auto-tracker', ctaLabel: label || 'WhatsApp' };
  }
  if (href.includes('google.com/maps') || href.includes('maps.google')) {
    return { event: 'maps-click', source: 'auto-tracker', ctaLabel: label || 'Google Maps' };
  }

  try {
    const url = new URL(href, window.location.origin);
    if (SOCIAL_HOSTS.some((host) => url.hostname.includes(host))) {
      return { event: 'social-click', source: 'auto-tracker', ctaLabel: url.hostname };
    }
    if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
      return { event: 'link-click', source: 'auto-tracker', ctaLabel: label || url.pathname };
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Tracks page views and auto-detects outbound / contact link clicks site-wide.
 */
export function SiteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPageKey = useRef('');

  useEffect(() => {
    const key = `${pathname}?${searchParams.toString()}`;
    if (!pathname || lastPageKey.current === key) return;
    lastPageKey.current = key;
    trackEvent({
      event: 'page-view',
      path: pathname,
      source: 'navigation',
      ctaLabel: key,
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const anchor = e.target.closest('a[href]');
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.closest('[data-track-skip]')) return;
      if (anchor.dataset.trackManual === 'true') return;

      const detected = detectLinkEvent(anchor);
      if (!detected) return;

      const carSlug = anchor.dataset.carSlug;
      const carName = anchor.dataset.carName;

      trackEvent({
        event: detected.event,
        path: window.location.pathname,
        source: anchor.dataset.trackSource || detected.source,
        ctaLabel: detected.ctaLabel,
        carSlug,
        carName,
      });
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}
