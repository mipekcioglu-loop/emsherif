/**
 * Single source of truth for site-wide metadata, navigation and venue data.
 * Content lives here (rather than in components) so it can later be swapped
 * for a CMS or database query without touching the presentation layer.
 */

export const siteConfig = {
  name: "Em Sherif",
  tagline: "Lebanese fine dining",
  description:
    "Em Sherif is a Lebanese fine-dining house founded in Beirut, serving a generous set menu of traditional recipes in a setting of quiet luxury.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
  social: {
    instagram: "https://www.instagram.com/emsherifrestaurant/",
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const mainNav: NavItem[] = [
  { label: "Our Story", href: "/about" },
  { label: "Menus", href: "/menus" },
  { label: "Venues", href: "/venues" },
  { label: "Reservations", href: "/reservations" },
  { label: "Contact", href: "/contact" },
];

export type Venue = {
  slug: string;
  city: string;
  country: string;
  concept: string;
  address: string;
};

/**
 * Placeholder venue list. Replace with confirmed addresses and opening hours
 * before launch — see README "Content sources".
 */
export const venues: Venue[] = [
  {
    slug: "beirut",
    city: "Beirut",
    country: "Lebanon",
    concept: "Em Sherif Restaurant",
    address: "Ashrafieh, Beirut",
  },
  {
    slug: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    concept: "Em Sherif Restaurant",
    address: "Dubai",
  },
  {
    slug: "london",
    city: "London",
    country: "United Kingdom",
    concept: "Em Sherif Restaurant",
    address: "London",
  },
  {
    slug: "monaco",
    city: "Monaco",
    country: "Monaco",
    concept: "Em Sherif Café",
    address: "Monte-Carlo",
  },
];
