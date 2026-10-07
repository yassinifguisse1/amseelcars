import { BUSINESS_SOCIAL } from "@/lib/business";

/**
 * Main nav uses next-intl internal pathnames (see `src/i18n/routing.ts`).
 * Visible labels come from messages (nav namespace) via `messageKey`.
 */
export interface MainNavItem {
  messageKey: "home" | "about" | "cars" | "blog" | "contact";
  href: "/" | "/about" | "/cars" | "/blog" | "/contact";
}

export const mainNavItems: MainNavItem[] = [
  { messageKey: "home", href: "/" },
  { messageKey: "about", href: "/about" },
  { messageKey: "cars", href: "/cars" },
  { messageKey: "blog", href: "/blog" },
  { messageKey: "contact", href: "/contact" },
];

export interface SocialNavItem {
  messageKey: "socialFacebook" | "socialInstagram";
  href: string;
}

export const socialNavItems: SocialNavItem[] = [
  {
    messageKey: "socialFacebook",
    href: BUSINESS_SOCIAL.facebook,
  },
  {
    messageKey: "socialInstagram",
    href: BUSINESS_SOCIAL.instagram,
  },
];
