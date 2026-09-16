import type { Category, Language } from "@/lib/i18n";

export type MenuItem = {
  name: string;
  /** Short dish description. Omitted for drinks, which are listed by name only. */
  description?: string;
  /** Price in Iraqi dinar. */
  price: number;
};

export type MenuSection = {
  title: string;
  items: MenuItem[];
};

/**
 * A category is served either as structured text (preferred — it reflows on a
 * phone, is readable by screen readers and can be indexed) or, until that
 * language has been transcribed and proof-read, as the original menu page
 * scans.
 */
export type CategoryContent =
  { kind: "sections"; sections: MenuSection[] } | { kind: "pages"; pages: number[] };

export type LanguageMenu = Record<Category, CategoryContent>;

export type MenuRegistry = Record<Language, LanguageMenu>;
