/**
 * Compares the three printed menus against each other and reports every place
 * they disagree. Differences it finds are differences in the source menus, not
 * transcription errors — see docs/menu-discrepancies.md.
 *
 * `pdfjs-dist` is not a project dependency — install it only to run this:
 *   npm i -D pdfjs-dist && node scripts/audit-prices.mjs && npm uninstall pdfjs-dist
 */
import { buildLanguage, parseMenu } from "./menu-from-pdf.mjs";

const EN_PAGES = { food: [4, 5, 6, 7, 8], sweets: [13], drinks: [10, 11, 14] };
// The printed section order differs between languages; line them up.
const ORDER = {
  food: { ku: [0, 1, 2, 3, 4, 6, 5, 7, 8, 9] },
  drinks: { ar: [2, 3, 0, 1, 4], ku: [2, 3, 0, 1, 4] },
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

const menus = { ar: await buildLanguage("ar"), ku: await buildLanguage("ku") };
const reorder = (sections, order) => (order ? order.map((i) => sections[i]) : sections);

let problems = 0;
for (const category of ["food", "sweets", "drinks"]) {
  const en = englishSections(EN_PAGES[category]);
  const ar = reorder(menus.ar[category].sections, ORDER[category]?.ar);
  const ku = reorder(menus.ku[category].sections, ORDER[category]?.ku);

  for (let s = 0; s < en.length; s++) {
    const [e, a, k] = [en[s], ar[s], ku[s]];
    if (!a || !k) {
      console.log(`!! ${category} section ${s + 1} has no counterpart in every language`);
      problems++;
      continue;
    }
    if (e.items.length !== a.items.length || e.items.length !== k.items.length) {
      console.log(
        `!! ${category} / ${e.title}: ${e.items.length} items in English, ${a.items.length} in Arabic, ${k.items.length} in Kurdish`,
      );
      problems++;
    }
    const n = Math.min(e.items.length, a.items.length, k.items.length);
    for (let i = 0; i < n; i++) {
      const [ep, ap, kp] = [e.items[i].price, a.items[i].price, k.items[i].price];
      if (ep === ap && ep === kp) continue;
      problems++;
      console.log(
        `PRICE  ${category} / ${e.title} #${i + 1}  "${e.items[i].name}"\n` +
          `       EN ${ep.toLocaleString()}   AR ${ap.toLocaleString()} (${a.items[i].name})   KU ${kp.toLocaleString()} (${k.items[i].name})`,
      );
    }
  }
}

console.log(
  problems
    ? `\n${problems} discrepancies — see docs/menu-discrepancies.md`
    : "\nAll prices agree across the three languages.",
);
process.exitCode = problems ? 1 : 0;
