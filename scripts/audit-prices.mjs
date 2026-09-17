/**
 * Two questions about prices, answered separately because they are different
 * questions and the answers are no longer the same.
 *
 * 1. DO THE PRINTED MENUS AGREE WITH EACH OTHER? They do not, in six places,
 *    and the client has now decided all six (docs/menu-discrepancies.md §1 and
 *    §2). Those are reported as settled, with the decision, so nobody re-running
 *    this mistakes them for transcription errors and "fixes" them back.
 * 2. DOES THE SITE QUOTE ONE PRICE PER DISH? It must. Every dish should cost
 *    the same whichever language a guest reads, and any disagreement here is a
 *    real fault in our data.
 *
 * The exit code answers "is anything outstanding": a printed disagreement that
 * nobody has decided, or the site contradicting itself.
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

/** The six disagreements the client has ruled on, and what they chose. */
const SETTLED = {
  "FATTET BATENJEN": "12,000, the English and Arabic figure (§1)",
  KEFTA: "26,000, the English and Arabic figure (§1)",
  "KIBBET LAHMEH BI LABAN": "31,000, the English and Arabic figure (§1)",
  "FASSOULYA BI LAHMEH": "34,000, the Arabic figure (§1)",
  "ESPRESSO DOPPIO": "7,000, the Arabic page's pairing (§2)",
  CAPPUCCINO: "9,500, the Arabic page's pairing (§2)",
  "CAFÉ BLANC": "10,000, the Arabic page's pairing (§2)",
  "AMERICAN COFFEE": "6,000, the Arabic page's pairing (§2)",
};

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
const settledSeen = [];

// ---- 1. The printed menus, as printed. -----------------------------------
const printed = {
  ar: await buildLanguage("ar", { printedPrices: true }),
  ku: await buildLanguage("ku", { printedPrices: true }),
};
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
    const decision = SETTLED[en.name];
    const line =
      `${row.category} / ${row.section} #${row.i + 1}  "${en.name}"\n` +
      `       EN ${money(en?.price)}   AR ${money(ar?.price)}${ar ? ` (${ar.name})` : ""}` +
      `   KU ${money(ku?.price)}`;
    if (decision) {
      settledSeen.push(`${line}\n       settled: ${decision}`);
    } else {
      console.log(`PRICE  ${line}`);
      outstanding++;
    }
  },
);
if (settledSeen.length) {
  console.log(
    `${settledSeen.length} disagreements between the printed menus, all decided by the client.\n` +
      `These are not errors and must not be "corrected" back:\n`,
  );
  for (const l of settledSeen) console.log(`  ${l}\n`);
}
if (!outstanding) console.log("No undecided disagreement between the printed menus.\n");

// ---- 2. What the site actually quotes. -----------------------------------
const shipped = { en: englishMenu, ar: arabicMenu, ku: kurdishMenu };
let mismatches = 0;
walk(
  (lang, category) => shipped[lang][category].sections,
  (row) => {
    if (row.missing) return; // already reported above
    const { en, ar, ku } = row;
    const prices = [en?.price, ar?.price, ku?.price].filter((p) => p !== undefined);
    if (new Set(prices).size <= 1) return;
    mismatches++;
    console.log(
      `SITE   ${row.category} / ${row.section} #${row.i + 1}  "${en.name}" is quoted differently ` +
        `by language:\n       EN ${money(en?.price)}   AR ${money(ar?.price)}   KU ${money(ku?.price)}`,
    );
  },
);
console.log(
  mismatches
    ? `\n${mismatches} dishes are quoted at different prices depending on the language read. Fix these.`
    : "The site quotes one price per dish in all three languages.",
);

const total = outstanding + mismatches;
console.log(
  total
    ? `\n${total} things need attention — see docs/menu-discrepancies.md`
    : "\nNothing outstanding.",
);
process.exitCode = total ? 1 : 0;
