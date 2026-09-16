/**
 * Languages, text direction and UI strings.
 *
 * The translated strings are carried over verbatim from the previous static
 * menu site, so the Kurdish and Arabic wording stays exactly as approved.
 */

export const languages = ["en", "ku", "ar"] as const;
export type Language = (typeof languages)[number];

export const categories = ["food", "drinks", "sweets"] as const;
export type Category = (typeof categories)[number];

export function isLanguage(value: string): value is Language {
  return (languages as readonly string[]).includes(value);
}

export function isCategory(value: string): value is Category {
  return (categories as readonly string[]).includes(value);
}

type Dictionary = {
  /** Language name in its own script, shown on the language picker. */
  endonym: string;
  dir: "ltr" | "rtl";
  /** BCP 47 tag used for `lang` attributes and number formatting. */
  locale: string;
  menuName: string;
  chooseLanguage: string;
  chooseLanguageHint: string;
  chooseSection: string;
  chooseSectionHint: string;
  changeLanguage: string;
  sections: string;
  home: string;
  fullMenuPdf: string;
  currency: string;
  categoryLabels: Record<Category, string>;
};

export const dictionaries: Record<Language, Dictionary> = {
  en: {
    endonym: "English",
    dir: "ltr",
    locale: "en",
    menuName: "English menu",
    chooseLanguage: "Select your language",
    chooseLanguageHint: "Choose a language to browse the menu.",
    chooseSection: "Choose a section",
    chooseSectionHint: "Tap what you would like to view.",
    changeLanguage: "Change language",
    sections: "Sections",
    home: "Home",
    fullMenuPdf: "Full menu PDF",
    currency: "IQD",
    categoryLabels: { food: "Food", drinks: "Beverages", sweets: "Sweets" },
  },
  ku: {
    endonym: "کوردی",
    dir: "rtl",
    locale: "ckb",
    menuName: "مێنیوی کوردی",
    chooseLanguage: "زمانەکەت هەڵبژێرە",
    chooseLanguageHint: "زمانێک هەڵبژێرە بۆ بینینی مێنیو.",
    chooseSection: "بەشێک هەڵبژێرە",
    chooseSectionHint: "بەشێک هەڵبژێرە بۆ بینینی مێنیو.",
    changeLanguage: "گۆڕینی زمان",
    sections: "بەشەکان",
    home: "سەرەکی",
    fullMenuPdf: "مێنیوی تەواو (PDF)",
    currency: "دینار",
    categoryLabels: { food: "خواردن", drinks: "خواردنەوە", sweets: "شیرینی" },
  },
  ar: {
    endonym: "العربية",
    dir: "rtl",
    locale: "ar",
    menuName: "القائمة العربية",
    chooseLanguage: "اختر لغتك",
    chooseLanguageHint: "اختر لغة لتصفح القائمة.",
    chooseSection: "اختر القسم",
    chooseSectionHint: "اختر ما ترغب في مشاهدته.",
    changeLanguage: "تغيير اللغة",
    sections: "الأقسام",
    home: "الرئيسية",
    fullMenuPdf: "القائمة الكاملة (PDF)",
    currency: "دينار",
    categoryLabels: { food: "الطعام", drinks: "المشروبات", sweets: "الحلويات" },
  },
};

/**
 * Prices are quoted in Iraqi dinar with thousands separators and no decimals.
 *
 * Formatting is pinned to "en-US" on purpose: the printed Arabic and Kurdish
 * menus both set prices in Western digits, and an "ar"/"ckb" locale would
 * render them as Arabic-Indic numerals instead.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price);
}
