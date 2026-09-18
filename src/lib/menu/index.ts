import { categories, type Category, type Language } from "@/lib/i18n";
import { withBasePath } from "@/lib/site-url";

import { arabicMenu } from "./ar";
import { englishMenu } from "./en";
import { kurdishMenu } from "./ku";
import { dishKeys, dishKeysNotInEveryLanguage, type DishKey } from "./dish-keys";
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
  /** The dish's identity, the same in all three languages. */
  key: DishKey;
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
      key: dishKeys[language][`${category}:${sectionIndex}:${itemIndex}`],
      name: item.name,
      description: item.description,
      price: item.price,
      section: section.title,
      photo: getDishPhotograph(language, category, sectionIndex, itemIndex),
    })),
  }));
}

/**
 * Every dish in one language, flattened, in printed order within each category.
 *
 * This is what the spread's sheet renders from: it holds the picked dishes'
 * keys, and needs a name, a price and a category for each. Flattening it here
 * keeps the sheet a plain renderer — the array's order IS the printed order, so
 * the list is stable and never sorted by when a dish was added.
 */
export type SpreadDish = {
  key: DishKey;
  name: string;
  price: number;
  category: Category;
  /**
   * Set when this menu does not print the dish and the row is borrowed from a
   * menu that does — so the name can be marked up in the language it is
   * actually written in.
   */
  foreign?: Language;
};

export function getSpreadDishes(language: Language): SpreadDish[] {
  const out: SpreadDish[] = [];
  for (const category of categories) {
    menus[language][category].sections.forEach((section, sectionIndex) => {
      section.items.forEach((item, itemIndex) => {
        out.push({
          key: dishKeys[language][`${category}:${sectionIndex}:${itemIndex}`],
          name: item.name,
          price: item.price,
          category,
        });
      });
    });
  }

  /*
   * Two dishes are not on every menu: English and Kurdish print Flat White
   * where the Arabic page prints a decaf espresso (docs/menu-discrepancies.md
   * §2). A guest can pick one and then switch to the language that does not
   * have it.
   *
   * Dropping the row would be the worst of the options — the dish would vanish
   * from the list and from the total and then reappear on switching back, which
   * reads as the menu losing things. So the row is kept and borrowed from a
   * menu that does print it, in that language's own words. A Latin name in an
   * Arabic list is odd, but it is true, and the guest can still count it and
   * still take it off.
   */
  for (const [key, dish] of Object.entries(dishKeysNotInEveryLanguage)) {
    if (dish.languages.includes(language)) continue;
    const from = dish.languages[0];
    const slot = Object.entries(dishKeys[from]).find(([, id]) => id === key)?.[0];
    if (!slot) continue;
    const [category, sectionIndex, itemIndex] = slot.split(":");
    const item =
      menus[from][category as Category].sections[Number(sectionIndex)].items[
        Number(itemIndex)
      ];
    out.push({
      key,
      name: item.name,
      price: item.price,
      category: category as Category,
      foreign: from,
    });
  }

  return out;
}

export type { DishKey };
export type { CategoryContent, MenuItem, MenuSection } from "./types";
