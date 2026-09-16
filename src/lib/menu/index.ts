import type { Category, Language } from "@/lib/i18n";

import { englishMenu } from "./en";
import type { CategoryContent, MenuRegistry } from "./types";

/**
 * Arabic and Kurdish are still served as scans of the printed menu pages.
 * The page numbers match the originals and are carried over unchanged.
 *
 * Replace an entry with a `kind: "sections"` menu once that language has been
 * transcribed and proof-read by a native speaker — the rest of the app needs
 * no changes, it renders whichever shape it is given.
 */
const menus: MenuRegistry = {
  en: englishMenu,
  ku: {
    food: { kind: "pages", pages: [2, 3, 4, 5, 6] },
    drinks: { kind: "pages", pages: [7, 8, 9] },
    sweets: { kind: "pages", pages: [10] },
  },
  ar: {
    food: { kind: "pages", pages: [2, 3, 4, 5, 6, 7, 8] },
    drinks: { kind: "pages", pages: [9, 10, 11, 12] },
    sweets: { kind: "pages", pages: [13] },
  },
};

export function getCategoryContent(
  language: Language,
  category: Category,
): CategoryContent {
  return menus[language][category];
}

/** Path to the printed menu PDF for a language. */
export function pdfPath(language: Language): string {
  return `/menus/${language}-menu.pdf`;
}

/** Path to a single scanned menu page. */
export function pagePath(language: Language, page: number): string {
  return `/menu-pages/${language}/page-${String(page).padStart(2, "0")}.webp`;
}

export type { CategoryContent, MenuItem, MenuSection } from "./types";
