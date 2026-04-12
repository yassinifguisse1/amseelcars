/**
 * Main nav uses next-intl internal pathnames (see `src/i18n/routing.ts`).
 * Visible labels come from messages (nav namespace) via `messageKey`.
 */
export interface MainNavItem {
  messageKey: "home" | "agadirRental" | "about" | "cars" | "blog" | "contact";
  href:
    | "/"
    | "/location-voiture-agadir"
    | "/about"
    | "/cars"
    | "/blog"
    | "/contact";
}

export const mainNavItems: MainNavItem[] = [
  { messageKey: "home", href: "/" },
  { messageKey: "agadirRental", href: "/location-voiture-agadir" },
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
    href: "https://www.facebook.com/amseelcars/",
  },
  {
    messageKey: "socialInstagram",
    href: "https://www.instagram.com/amseelcars/",
  },
];
