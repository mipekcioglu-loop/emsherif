/**
 * Two questions about prices, answered separately because they are different
 * questions with different answers.
 *
 * 1. DO THE PRINTED MENUS AGREE WITH EACH OTHER? They do not, in eight places
 *    (docs/menu-discrepancies.md §1 and §2). These are faults in the source
 *    menus, not in our transcription, and only the café can resolve them. They
 *    are reported as outstanding, because they are.
 * 2. DOES THE SITE REPRODUCE EACH PRINTED PAGE? It must — that is the rule in
 *    CLAUDE.md, and it is why question 1's answer is left alone rather than
 *    reconciled. `en.ts` is hand-written, so it is checked against the English
 *    PDF; `ar.ts` and `ku.ts` are generated, so they are checked against a
 *    fresh parse, which catches a stale file or a hand-edit.
 *
 * A dish costing two different things in two languages is therefore expected
 * here and is not a bug: it means two printed pages disagree. What would be a
 * bug is the site saying something neither page says, which is question 2.
 *
 * `pdfjs-dist` is not a project dependency — install it only to run this:
 *   npm i -D pdfjs-dist && node scripts/audit-prices.mjs && npm uninstall pdfjs-dist
 */
import { buildLanguage, parseMenu } from "./menu-from-pdf.mjs";
import { englishMenu } from "../src/lib/menu/en.ts";
import { arabicMenu } from "../src/lib/menu/ar.ts";
import { kurdishMenu } from "../src/lib/menu/ku.ts";

const EN_PAGES = { food: [4, 5, 6, 7, 8], sweets: [13], drinks: [10, 11, 14] };
/** The printed section order differs between languages; line them up. */
const ORDER = {
  food: { ku: [0, 1, 2, 3, 4, 6, 5, 7, 8, 9] },
  drinks: { ar: [2, 3, 0, 1, 4], ku: [2, 3, 0, 1, 4] },
};
/**
 * And within hot drinks, so does the order of the drinks themselves: the Arabic
 * page lists the same nine prices but not against the same drinks, and it
 * carries a decaf espresso where the others carry Flat White. Comparing that
 * section row by row compares a cappuccino with a doppio, so map it by drink.
 * Arabic row -> English row, null where Arabic lists a drink English does not.
 * Same table as ITEM_OVERRIDES in scripts/dish-photos.mjs.
 */
const ITEM_ORDER = { "ar:drinks:4": [0, 2, 3, 4, 5, 1, null, 7, 8] };

const english = await parseMenu("public/menus/en-menu.pdf", true);
const byPage = new Map(english.map((p) => [p.page, p]));

function englishSections(pages) {
  const out = [];
  for (const n of pages) {
    const page = byPage.get(n);
    if (!page) continue;
    const groups = new Map();
    for (const item of page.items) {
      const key = item.section ?? "—";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    for (const [title, items] of groups) out.push({ title, items });
  }
  return out;
}

const reorder = (sections, order) => (order ? order.map((i) => sections[i]) : sections);
const money = (n) => (n === undefined ? "—" : n.toLocaleString("en-US"));

/**
 * Walks the three menus together, dish by dish, and hands each trio to `visit`.
 * `sections(lang)` returns that language's sections already in English order.
 */
function walk(sections, visit) {
  for (const category of ["food", "sweets", "drinks"]) {
    const en = sections("en", category);
    const ar = reorder(sections("ar", category), ORDER[category]?.ar);
    const ku = reorder(sections("ku", category), ORDER[category]?.ku);
    for (let s = 0; s < en.length; s++) {
      if (!ar[s] || !ku[s]) {
        visit({ category, section: `#${s + 1}`, missing: true });
        continue;
      }
      // Arabic hot drinks are listed in a different order from the other two.
      const map = ITEM_ORDER[`ar:drinks:${s}`];
      for (let i = 0; i < en[s].items.length; i++) {
        const arIndex = map ? map.indexOf(i) : i;
        visit({
          category,
          section: en[s].title,
          i,
          en: en[s].items[i],
          ar: arIndex < 0 ? undefined : ar[s].items[arIndex],
          ku: ku[s].items[i],
        });
      }
    }
  }
}

let outstanding = 0;

// ---- 1. The printed menus, as printed. -----------------------------------
const printed = { ar: await buildLanguage("ar"), ku: await buildLanguage("ku") };
console.log("The printed menus, compared with each other:\n");
walk(
  (lang, category) =>
    lang === "en"
      ? englishSections(EN_PAGES[category])
      : printed[lang][category].sections,
  (row) => {
    if (row.missing) {
      console.log(
        `!! ${row.category} section ${row.section} has no counterpart in every language`,
      );
      outstanding++;
      return;
    }
    const { en, ar, ku } = row;
    // Flat White has no Arabic counterpart at all; that is a difference in the
    // drinks list, not in a price, and §2 records it.
    const prices = [en?.price, ar?.price, ku?.price].filter((p) => p !== undefined);
    if (new Set(prices).size <= 1) return;
    console.log(
      `PRICE  ${row.category} / ${row.section} #${row.i + 1}  "${en.name}"\n` +
        `       EN ${money(en?.price)}   AR ${money(ar?.price)}${ar ? ` (${ar.name})` : ""}` +
        `   KU ${money(ku?.price)}`,
    );
    outstanding++;
  },
);
console.log(
  outstanding
    ? `\n${outstanding} disagreements between the printed menus. These are faults in the\n` +
        `source menus and only the café can resolve them — see docs/menu-discrepancies.md.\n` +
        `The site reproduces each language as printed, so do not reconcile them here.\n`
    : "No disagreement between the printed menus.\n",
);

// ---- 2. Does the site say what the page says? ----------------------------
// This is the check that matters now: a price on the site that is on none of
// the printed pages. `en.ts` is typed by hand, so it is compared against the
// English PDF dish by dish; ar.ts and ku.ts are generated, so they are compared
// against a fresh parse, which catches a stale committed file or a hand-edit.
const shipped = { en: englishMenu, ar: arabicMenu, ku: kurdishMenu };
const source = {
  en: (category) => englishSections(EN_PAGES[category]),
  ar: (category) => printed.ar[category].sections,
  ku: (category) => printed.ku[category].sections,
};
let mismatches = 0;
for (const lang of ["en", "ar", "ku"]) {
  for (const category of ["food", "sweets", "drinks"]) {
    const pages = source[lang](category);
    const ours = shipped[lang][category].sections;
    if (pages.length !== ours.length) {
      console.log(
        `SITE   ${lang} ${category}: ${ours.length} sections on the site, ${pages.length} in the source`,
      );
      mismatches++;
      continue;
    }
    pages.forEach((sec, s) => {
      sec.items.forEach((printedItem, i) => {
        const mine = ours[s].items[i];
        if (!mine) {
          console.log(
            `SITE   ${lang} ${category} / ${sec.title} #${i + 1} is missing from the site`,
          );
          mismatches++;
          return;
        }
        if (mine.price !== printedItem.price) {
          mismatches++;
          console.log(
            `SITE   ${lang} ${category} / ${sec.title} #${i + 1} "${mine.name}": the site says ` +
              `${money(mine.price)} but the page says ${money(printedItem.price)}`,
          );
        }
      });
    });
  }
}
console.log(
  mismatches
    ? `\n${mismatches} prices on the site are not what the printed page says. Fix these.`
    : "Every price on the site is the one its own language's page prints.",
);

// Non-zero while anything is open, but the two are not the same kind of open:
// `mismatches` is ours to fix, `outstanding` is the café's to answer.
const total = outstanding + mismatches;
if (total) {
  console.log(
    `\n${outstanding} awaiting the café, ${mismatches} to fix here ` +
      `— see docs/menu-discrepancies.md`,
  );
} else {
  console.log("\nNothing outstanding.");
}
process.exitCode = total ? 1 : 0;
