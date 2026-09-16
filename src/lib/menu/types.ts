import type { Category, Language } from "@/lib/i18n";

export type MenuItem = {
  name: string;
  /** Short dish description. Drinks are mostly listed by name only. */
  description?: string;
  /** Price in Iraqi dinar. */
  price: number;
};

export type MenuSection = {
  title: string;
  items: MenuItem[];
};

export type CategoryContent = {
  sections: MenuSection[];
};

export type LanguageMenu = Record<Category, CategoryContent>;

export type MenuRegistry = Record<Language, LanguageMenu>;
