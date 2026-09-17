import type { Category, Language } from "@/lib/i18n";
import { withBasePath } from "@/lib/site-url";

import { arabicMenu } from "./ar";
import { englishMenu } from "./en";
import { kurdishMenu } from "./ku";
import { dishPhotos, photoAspectRatio, photoWidths } from "./photos";
import type { CategoryContent, MenuRegistry } from "./types";

const menus: MenuRegistry = {
  en: englishMenu,
  ku: kurdishMenu,
  ar: arabicMenu,
};

export function getCategoryContent(
  language: Language,
  category: Category,
): CategoryContent {
  return menus[language][category];
}

/** Path to the printed menu PDF for a language. */
export function pdfPath(language: Language): string {
  return withBasePath(`/menus/${language}-menu.pdf`);
}

export type DishPhotograph = {
  /** Fallback for a browser that ignores srcset. */
  src: string;
  srcSet: string;
  width: number;
  height: number;
};

/**
 * The photograph for a dish, or null — 29 of the 128 dishes were never shot,
 * and those cards fall back to the wordmark well instead.
 *
 * Dishes are identified by where they sit in their own language's menu, since
 * the printed menus put their sections in different orders. The mapping is
 * worked out once by scripts/dish-photos.mjs; nothing is aligned at runtime.
 */
export function getDishPhotograph(
  language: Language,
  category: Category,
  sectionIndex: number,
  itemIndex: number,
): DishPhotograph | null {
  const slug = dishPhotos[language][`${category}:${sectionIndex}:${itemIndex}`];
  if (!slug) return null;

  const widest = photoWidths[photoWidths.length - 1];
  const [ratioWidth, ratioHeight] = photoAspectRatio.split("/").map(Number);
  return {
    src: withBasePath(`/dishes/${slug}-${widest}.webp`),
    srcSet: photoWidths
      .map((width) => `${withBasePath(`/dishes/${slug}-${width}.webp`)} ${width}w`)
      .join(", "),
    width: widest,
    height: Math.round((widest * ratioHeight) / ratioWidth),
  };
}

/** One dish, ready to render: the approved wording plus its photograph. */
export type DishView = {
  name: string;
  description?: string;
  price: number;
  /** The printed section it belongs to, shown only out of context. */
  section: string;
  photo: DishPhotograph | null;
};

export type SectionView = {
  /** Anchor target, so the filter pills work without JavaScript. */
  id: string;
  title: string;
  dishes: DishView[];
};

/**
 * A category, in one language, with every dish paired to its photograph.
 * Sections keep their printed order — that order differs between languages,
 * and each menu is reproduced exactly as printed.
 */
export function getCategoryView(language: Language, category: Category): SectionView[] {
  return getCategoryContent(language, category).sections.map((section, sectionIndex) => ({
    id: `section-${sectionIndex + 1}`,
    title: section.title,
    dishes: section.items.map((item, itemIndex) => ({
      name: item.name,
      description: item.description,
      price: item.price,
      section: section.title,
      photo: getDishPhotograph(language, category, sectionIndex, itemIndex),
    })),
  }));
}

export type { CategoryContent, MenuItem, MenuSection } from "./types";
