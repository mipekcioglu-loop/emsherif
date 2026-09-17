/**
 * Languages, text direction and UI strings.
 *
 * The translated strings carried over from the previous static menu site keep
 * the wording exactly as approved. Strings added for this design that have not
 * been through a native speaker are listed in `provisionalKeys` below and in
 * docs/provisional-strings.md — they are placeholders, not approved copy.
 */

export const languages = ["en", "ku", "ar"] as const;
export type Language = (typeof languages)[number];

/**
 * The order the three languages sit in on the header switch, per the client's
 * brief and the mockup. `languages` keeps its own order because it drives the
 * routes that get prerendered.
 */
export const languageSwitchOrder = [
  "ar",
  "en",
  "ku",
] as const satisfies readonly Language[];

export const categories = ["food", "sweets", "drinks"] as const;
export type Category = (typeof categories)[number];

export function isLanguage(value: string): value is Language {
  return (languages as readonly string[]).includes(value);
}

export function isCategory(value: string): value is Category {
  return (categories as readonly string[]).includes(value);
}

/** The four fields of the venue-info sheet, in the order they are shown. */
export const venueFields = ["address", "hours", "telephone", "wifi"] as const;
export type VenueField = (typeof venueFields)[number];

type Dictionary = {
  /** Language name in its own script, shown on the language switch. */
  endonym: string;
  dir: "ltr" | "rtl";
  /** BCP 47 tag used for `lang` attributes and number formatting. */
  locale: string;
  menuName: string;
  /** The café's name and city, in this language. */
  cafeName: string;
  city: string;
  chooseLanguage: string;
  chooseLanguageHint: string;
  changeLanguage: string;
  sections: string;
  currency: string;
  /**
   * The opening passage. English and Arabic are the printed menu's own words;
   * the Kurdish menu has no such passage, so that one is a translation of the
   * approved Arabic and is listed in `provisionalKeys`.
   *
   * Optional because a language may legitimately have none — the hero composes
   * without it.
   */
  intro?: readonly string[];
  /**
   * The main tabs. The middle category is `sweets` in the printed menu and in
   * the menu data; the client asks for the tab to read "Desserts", so the two
   * differ in English on purpose — the label lives here, the data is untouched.
   */
  categoryLabels: Record<Category, string>;
  search: string;
  searchNoResults: string;
  searchClear: string;
  allFilter: string;
  allergyLabel: string;
  allergyBody: string;
  venueLink: string;
  venueHeading: string;
  venuePending: string;
  venueLabels: Record<VenueField, string>;
  venuePlaceholders: Record<VenueField, string>;
  footerLinks: { contact: string; about: string; website: string; blog: string };
  backToTop: string;
  loadingMore: string;
  close: string;
};

/**
 * Strings written to hold the layout, awaiting a native Sorani reader and a
 * native Levantine-Arabic reader. **None of this is approved copy.** Do not
 * treat anything listed here as signed off, and do not add to the list without
 * adding it to docs/provisional-strings.md as well.
 *
 * Everything not listed here is approved: dish names, descriptions and prices
 * come from the printed menus; the currency words and the section names were
 * supplied by the client; the English allergy statement is the client's own
 * wording, set exactly as supplied.
 */
export const provisionalKeys = {
  ar: [
    "allergyLabel",
    "allergyBody",
    "venueLink",
    "venueHeading",
    "venuePending",
    "venueLabels",
    "venuePlaceholders",
    "allFilter",
    "search",
    "searchNoResults",
    "searchClear",
    "footerLinks",
    "backToTop",
    "loadingMore",
    "close",
  ],
  ku: [
    "intro",
    "allergyLabel",
    "allergyBody",
    "venueLink",
    "venueHeading",
    "venuePending",
    "venueLabels",
    "venuePlaceholders",
    "allFilter",
    "search",
    "searchNoResults",
    "searchClear",
    "footerLinks",
    "backToTop",
    "loadingMore",
    "close",
  ],
} as const satisfies Record<"ar" | "ku", readonly (keyof Dictionary)[]>;

export const dictionaries: Record<Language, Dictionary> = {
  en: {
    endonym: "English",
    dir: "ltr",
    locale: "en",
    menuName: "English menu",
    cafeName: "Em Sherif Café",
    city: "Erbil",
    chooseLanguage: "Select your language",
    chooseLanguageHint: "Choose a language to browse the menu.",
    changeLanguage: "Change language",
    sections: "Sections",
    currency: "IQD",
    intro: [
      "Discover the warmth of Lebanese hospitality at Em Sherif Café, a cozy retreat in the heart of the city.",
      "Enjoy dishes inspired by family traditions, blending contemporary flair with authentic flavors and cherished rituals.",
    ],
    categoryLabels: { food: "Food", sweets: "Desserts", drinks: "Drinks" },
    search: "Search the menu",
    searchNoResults: "No dishes match that search.",
    searchClear: "Clear search",
    allFilter: "All",
    /* The client's approved wording, set exactly as supplied. */
    allergyLabel: "Allergy Statement:",
    allergyBody:
      "Menu items may contain or come into contact with wheat, eggs, peanuts and milk. For more information, please speak with a manager.",
    venueLink: "Address, hours & wi-fi",
    venueHeading: "Visiting Us",
    venuePending: "Placeholder · content pending from client",
    venueLabels: {
      address: "Address",
      hours: "Opening Hours",
      telephone: "Telephone",
      wifi: "Wi-Fi",
    },
    venuePlaceholders: {
      address: "[ street, district and city line — to be supplied ]",
      hours: "[ days and hours — to be supplied ]",
      telephone: "[ telephone number — to be supplied ]",
      wifi: "[ network name and password — to be supplied ]",
    },
    footerLinks: {
      contact: "Contact Us",
      about: "Who We Are",
      website: "Em Sherif website",
      blog: "Blogs",
    },
    backToTop: "Back to top",
    loadingMore: "Loading more dishes",
    close: "Close",
  },
  ku: {
    endonym: "کوردی",
    dir: "rtl",
    locale: "ckb",
    menuName: "مێنیوی کوردی",
    cafeName: "ئێم شەریف کافێ",
    city: "هەولێر",
    chooseLanguage: "زمانەکەت هەڵبژێرە",
    chooseLanguageHint: "زمانێک هەڵبژێرە بۆ بینینی مێنیو.",
    changeLanguage: "گۆڕینی زمان",
    sections: "بەشەکان",
    currency: "دینار",
    /* Not from the printed menu — a translation of the approved Arabic
       passage, pending a native speaker. See provisionalKeys and
       docs/provisional-strings.md. */
    intro: [
      "گەرمیی میوانداریی لوبنانی لە ئێم شەریف کافێ بدۆزەرەوە، پەناگەیەکی ئارام لە دڵی شاردا.",
      "چێژ لە خواردنێک وەربگرە کە لە نەریتی خێزانییەوە وەرگیراوە و شێوازی هاوچەرخ لەگەڵ تامی ڕەسەن و نەریتە خۆشەویستەکان تێکەڵ دەکات.",
    ],
    categoryLabels: { food: "خواردن", sweets: "شیرینی", drinks: "خواردنەوە" },
    /* Everything from here down is provisional — see provisionalKeys above. */
    search: "گەڕان لە لیستدا",
    searchNoResults: "هیچ خواردنێک نەدۆزرایەوە.",
    searchClear: "سڕینەوەی گەڕان",
    allFilter: "هەموو",
    allergyLabel: "ئاگادارکردنەوەی هەستیاری:",
    allergyBody:
      "خواردنەکانی لیست لەوانەیە گەنم، هێلکە، فستقی زەوی و شیریان تێدابێت یان بەریان کەوتبێت. بۆ زانیاری زیاتر، تکایە قسە لەگەڵ بەڕێوەبەرێک بکە.",
    venueLink: "ناونیشان، کاتەکان و وایفای",
    venueHeading: "زانیاری کافێ",
    venuePending: "دەقی کاتی · چاوەڕوانی ناوەڕۆکی کڕیار",
    venueLabels: {
      address: "ناونیشان",
      hours: "کاتژمێری کارکردن",
      telephone: "تەلەفۆن",
      wifi: "وایفای",
    },
    venuePlaceholders: {
      address: "[ شەقام، گەڕەک و شار — چاوەڕوانی دەق ]",
      hours: "[ ڕۆژ و کاتژمێر — چاوەڕوانی دەق ]",
      telephone: "[ ژمارەی تەلەفۆن — چاوەڕوانی دەق ]",
      wifi: "[ ناوی تۆڕ و وشەی نهێنی — چاوەڕوانی دەق ]",
    },
    footerLinks: {
      contact: "پەیوەندیمان پێوە بکە",
      about: "ئێمە کێین",
      website: "ماڵپەڕی ئێم شەریف",
      blog: "بلۆگەکان",
    },
    backToTop: "گەڕانەوە بۆ سەرەوە",
    loadingMore: "بارکردنی خواردنی زیاتر",
    close: "داخستن",
  },
  ar: {
    endonym: "العربية",
    dir: "rtl",
    locale: "ar",
    menuName: "القائمة العربية",
    cafeName: "إم شريف كافيه",
    city: "أربيل",
    chooseLanguage: "اختر لغتك",
    chooseLanguageHint: "اختر لغة لتصفح القائمة.",
    changeLanguage: "تغيير اللغة",
    sections: "الأقسام",
    currency: "دينار",
    intro: [
      "اكتشف دفء الضيافة اللبنانية في إم شريف، ملاذًا دافئًا في قلب المدينة.",
      "استمتع بأطباق مستوحاة من تقاليد عائلية، تمزج بين لمسة عصرية ونكهات أصيلة.",
    ],
    categoryLabels: { food: "الطعام", sweets: "الحلويات", drinks: "المشروبات" },
    /* Everything from here down is provisional — see provisionalKeys above. */
    search: "ابحث في القائمة",
    searchNoResults: "لا توجد أصناف مطابقة.",
    searchClear: "مسح البحث",
    allFilter: "الكل",
    allergyLabel: "تنويه بشأن الحساسية:",
    allergyBody:
      "قد تحتوي أصناف القائمة على القمح أو البيض أو الفول السوداني أو الحليب، أو قد تلامسها. لمزيد من المعلومات، يُرجى التحدث إلى أحد المدراء.",
    venueLink: "العنوان وساعات العمل والواي فاي",
    venueHeading: "معلومات المقهى",
    venuePending: "نص مؤقت · بانتظار محتوى العميل",
    venueLabels: {
      address: "العنوان",
      hours: "ساعات العمل",
      telephone: "الهاتف",
      wifi: "واي فاي",
    },
    venuePlaceholders: {
      address: "[ الشارع والمنطقة والمدينة — بانتظار النص ]",
      hours: "[ الأيام والساعات — بانتظار النص ]",
      telephone: "[ رقم الهاتف — بانتظار النص ]",
      wifi: "[ اسم الشبكة وكلمة السر — بانتظار النص ]",
    },
    footerLinks: {
      contact: "اتصل بنا",
      about: "من نحن",
      website: "موقع إم شريف",
      blog: "المدونة",
    },
    backToTop: "العودة إلى الأعلى",
    loadingMore: "جارٍ تحميل المزيد",
    close: "إغلاق",
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
