import type { Category, Language } from "@/lib/i18n";

import { arabicMenu } from "./ar";
import { englishMenu } from "./en";
import { kurdishMenu } from "./ku";
import type { CategoryContent, MenuRegistry } from "./types";

const menus: MenuRegistry = {
  en: englishMenu,
  ku: kurdishMenu,
  ar: arabicMenu,
};

/**
 * The photograph the printed menu opens each section with. The Kurdish and
 * Arabic booklets carry fewer of these, so all three languages share the set
 * from the English booklet rather than leaving a language visually thinner.
 */
const sectionImage: Record<Category, string> = {
  food: "/sections/food.webp",
  sweets: "/sections/sweets.webp",
  drinks: "/sections/drinks.webp",
};

export function getCategoryContent(
  language: Language,
  category: Category,
): CategoryContent {
  return menus[language][category];
}

export function getSectionImage(category: Category): string {
  return sectionImage[category];
}

/** Path to the printed menu PDF for a language. */
export function pdfPath(language: Language): string {
  return `/menus/${language}-menu.pdf`;
}

export type { CategoryContent, MenuItem, MenuSection } from "./types";
