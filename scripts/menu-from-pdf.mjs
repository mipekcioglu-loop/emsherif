/**
 * Rebuilds src/lib/menu/ar.ts and ku.ts from the printed menu PDFs in
 * public/menus, so the dish names, descriptions and prices on the site are the
 * approved wording rather than anything retyped by hand.
 *
 * The menus carry a real text layer, but their fonts have two quirks: the
 * lam-alef ligature comes out with its letters transposed, and some dal glyphs
 * are emitted as zero-width overlays. A few lines also break without a space.
 * All three are repaired below.
 *
 * `pdfjs-dist` is not a project dependency — install it only to rerun this:
 *   npm i -D pdfjs-dist && node scripts/menu-from-pdf.mjs && npm uninstall pdfjs-dist
 *
 * Verify the result afterwards with scripts/audit-prices.mjs.
 */
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "node:fs";

const SHADDA = "\u0651";
const PRICE = /^[\d][\d,]*$/;
// Every menu price is in the thousands, so a bare number like the "75" in
// "PINK 75" is part of a dish name.
const isPrice = (c) => PRICE.test(c.s.trim()) && Number(c.s.replace(/,/g, "")) >= 1000;
const LTR_FILES = new Set(["en"]);
let LTR = false;
const byReading = (a, b) => (LTR ? a.x - b.x : b.x - a.x);

/**
 * The menu fonts emit the lam-alef ligature with its two letters transposed,
 * so these words come out of the text layer reversed. Repaired by exact match
 * rather than a blanket rule, because "ال" is also the Arabic definite article.
 */
const LIGATURES = {
  ar: {
    الشوكوالتة: "الشوكولاتة",
    شوكوالتة: "شوكولاتة",
    بالشوكوالتة: "بالشوكولاتة",
    المخلالت: "المخللات",
    ثالث: "ثلاث",
    ثالثة: "ثلاثة",
    حالوة: "حلاوة",
    فالفل: "فلافل",
    التيه: "لاتيه",
    بالك: "بلاك",
  },
  ku: {
    زەالتە: "زەڵاتە",
    زەاڵتەی: "زەڵاتەی",
    زەاڵتە: "زەڵاتە",
    شۆکۆالتە: "شۆکۆلاتە",
    حەالوە: "حەلاوە",
    تێکەاڵو: "تێکەڵاو",
    گەاڵمێو: "گەڵامێو",
    گەاڵیی: "گەڵایی",
    گواڵو: "گوڵاو",
    کواڵو: "کوڵاو",
    شوکواڵتە: "شوکوڵاتە",
    شوکواڵتەی: "شوکوڵاتەی",
    فەالفل: "فەلافل",
    فهالفل: "فەلافل",
    ڤانیال: "ڤانیلا",
    ڤانێال: "ڤانێلا",
    "ڤانێال،": "ڤانێلا،",
    فالت: "فلات",
    بالک: "بلاک",
    بالنک: "بلانک",
    گەاڵ: "گەڵا",
    التی: "لاتی",
    ڕۆژهەاڵتی: "ڕۆژهەڵاتی",
    شوکواڵتەی: "شوکوڵاتەی",
  },
};

/**
 * The menu fonts map some Kurdish letters onto their Arabic lookalikes.
 * Non-initial heh is the vowel ە, except before an existing ە, where it is a
 * real consonant (as in ڕۆژهەڵاتی).
 */
function kurdishLetters(s) {
  return s
    .replaceAll("\u0643", "\u06A9")
    .replaceAll("\u064A", "\u06CC")
    .replace(/(\S)\u0647(?![\u06D5\u0627])/g, "$1\u06D5");
}

/** Lines the source splits mid-sentence, with no space at the break. */
const JOINS = {
  ar: { السميدالمفتول: "السميد المفتول", الثوميُقدّم: "الثوم يُقدّم" },
  ku: { قیمەبەدۆشاوی: "قیمە بە دۆشاوی" },
};

const fix = (s, lang) => {
  if (!s) return s;
  let out = s;
  // Bounded by non-letters so an attached quote or comma still matches, while
  // a key that merely appears inside a longer word does not.
  for (const [from, to] of Object.entries(JOINS[lang] ?? {})) {
    out = out.replaceAll(from, to);
  }
  for (const [from, to] of Object.entries(LIGATURES[lang] ?? {})) {
    out = out.replace(new RegExp(`(?<!\\p{L})${from}(?!\\p{L})`, "gu"), to);
  }
  return out.replace(/\s+/g, " ").trim();
};

/** Reads one language PDF into runs, repairing the font's glyph artefacts. */
async function runs(file) {
  const data = new Uint8Array(fs.readFileSync(file));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const { items } = await (await doc.getPage(p)).getTextContent();
    const rows = new Map();
    for (const it of items) {
      if (!it.str.trim()) continue;
      const y = Math.round(it.transform[5]);
      const key = [...rows.keys()].find((k) => Math.abs(k - y) <= 3) ?? y;
      if (!rows.has(key)) rows.set(key, []);
      rows.get(key).push({
        x: it.transform[4],
        w: it.width,
        size: Math.round(Math.hypot(it.transform[2], it.transform[3])),
        // Zero-width runs are overlay glyphs belonging after the run they
        // share an x with; their shadda is an artefact of the font cmap.
        s: it.width === 0 ? it.str.replaceAll(SHADDA, "") : it.str,
      });
    }
    // Merge each row into positioned chunks (RTL: rightmost first).
    const chunks = [];
    for (const [y, cells] of rows) {
      cells.sort((a, b) => byReading(a, b) || b.w - a.w);
      let cur = null;
      for (const c of cells) {
        if (cur && Math.abs(cur.x - c.x) < 1e-6) {
          cur.s += c.s;
          cur.w = Math.max(cur.w, c.w);
        } else {
          if (cur) chunks.push(cur);
          cur = { y, x: c.x, w: c.w, size: c.size, s: c.s };
        }
      }
      if (cur) chunks.push(cur);
    }
    pages.push(chunks);
  }
  return pages;
}

function parsePage(chunks) {
  const clean = (s) => s.replace(SHADDA + "\u062f" + SHADDA, "\u062f" + SHADDA).trim();
  const prices = chunks.filter(isPrice);
  const texts = chunks.filter((c) => !isPrice(c));
  if (!prices.length) return { headings: [], items: [] };

  // Headings are set larger; merge the chunks that share a baseline.
  const headRows = new Map();
  for (const t of texts.filter((t) => t.size >= 14)) {
    const k = [...headRows.keys()].find((k) => Math.abs(k - t.y) <= 4) ?? t.y;
    if (!headRows.has(k)) headRows.set(k, []);
    headRows.get(k).push(t);
  }
  const headings = [...headRows.entries()]
    .map(([y, cs]) => ({
      y,
      s: clean(
        cs
          .sort(byReading)
          .map((c) => c.s)
          .join(LTR ? " " : ""),
      ),
    }))
    .filter((h) => h.s)
    .sort((a, b) => b.y - a.y);

  const body = texts.filter((t) => t.size < 14);
  const used = new Set();

  const items = prices
    .sort((a, b) => b.y - a.y)
    .map((p) => {
      // Two layouts. Stacked rows put the dish name directly under its price
      // in the same column; list rows put it on the price's own baseline.
      // Try stacked first — on a stacked row the price's baseline also carries
      // the first line of the description, which would otherwise look like a name.
      let name = body
        .filter(
          (t) =>
            !used.has(t) && Math.abs(t.x - p.x) < 90 && t.y < p.y - 2 && p.y - t.y < 40,
        )
        .sort((a, b) => b.y - a.y)[0];
      let descRuns;
      if (name) {
        descRuns = body.filter(
          (t) =>
            !used.has(t) &&
            (LTR ? t.x > name.x + 60 : t.x < name.x - 60) &&
            t.y >= name.y - 2 &&
            t.y <= p.y + 2,
        );
      } else {
        const sameRow = body.filter((t) => Math.abs(t.y - p.y) <= 4 && !used.has(t));
        if (!sameRow.length) return null;
        name = sameRow.sort(byReading)[0];
        descRuns = sameRow.filter((t) => t !== name);
        // A list row's description, when it has one, sits under the name.
        descRuns.push(
          ...body.filter(
            (t) =>
              !used.has(t) &&
              t !== name &&
              t.size < name.size &&
              Math.abs(t.x - name.x) < 40 &&
              t.y < name.y - 2 &&
              name.y - t.y < 34,
          ),
        );
      }
      used.add(name);
      descRuns.forEach((t) => used.add(t));
      // Runs sharing a baseline are one wrapped line and must join without a
      // space; separate baselines are separate lines and take one.
      const lines = new Map();
      for (const t of descRuns) {
        const k = [...lines.keys()].find((k) => Math.abs(k - t.y) <= 3) ?? t.y;
        if (!lines.has(k)) lines.set(k, []);
        lines.get(k).push(t);
      }
      const description = [...lines.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([, cs]) => {
          // pdf.js reports run width in a different space from the run's x, so
          // the two cannot be compared to infer gaps. Runs sharing a baseline
          // are simply concatenated; the few places where the source splits a
          // line without a space are repaired by JOINS below.
          return cs
            .sort(byReading)
            .map((t) => clean(t.s))
            .join("");
        })
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      return {
        y: p.y,
        price: Number(p.s.replace(/,/g, "")),
        name: clean(name.s),
        description: description || undefined,
      };
    })
    .filter(Boolean);

  // Attach each item to the heading above it.
  for (const it of items) {
    const h = headings.filter((h) => h.y > it.y).sort((a, b) => a.y - b.y)[0];
    it.section = h ? h.s : null;
  }
  return { headings, items };
}

const PLAN = {
  ar: { food: [3, 4, 5, 6, 7, 8], sweets: [13], drinks: [10, 11, 12], reverseFood: true },
  ku: { food: [2, 3, 4, 5, 6], sweets: [10], drinks: [7, 8, 9], reverseFood: false },
};

const EXPORT_NAME = { ar: "arabicMenu", ku: "kurdishMenu" };
const NOTE = {
  ar: ` *\n * Section order follows the English and Kurdish menus. The Arabic pages are\n * laid out back-to-front in the source PDF — Kurdish, also right-to-left, is\n * not — so that ordering is treated as an export artefact. See the README.\n`,
  ku: "",
};

export async function parseMenu(file, ltr = false) {
  LTR = ltr;
  const pages = await runs(file);
  return pages
    .map((chunks, i) => ({ page: i + 1, ...parsePage(chunks) }))
    .filter((p) => p.items.length);
}

export async function buildLanguage(lang) {
  const pages = await parseMenu(`public/menus/${lang}-menu.pdf`, LTR_FILES.has(lang));
  const byPage = new Map(pages.map((p) => [p.page, p]));
  const plan = PLAN[lang];
  const out = {};
  for (const category of ["food", "sweets", "drinks"]) {
    const nums = plan[category];
    const order = category === "food" && plan.reverseFood ? [...nums].reverse() : nums;
    const sections = [];
    for (const n of order) {
      const page = byPage.get(n);
      if (!page) continue;
      const groups = new Map();
      for (const it of page.items) {
        const norm = (v) => fix(lang === "ku" ? kurdishLetters(v) : v, lang);
        const title = norm(it.section ?? "") || "—";
        if (!groups.has(title)) groups.set(title, []);
        groups.get(title).push({
          name: norm(it.name),
          ...(it.description ? { description: norm(it.description) } : {}),
          price: it.price,
        });
      }
      for (const [title, items] of groups) sections.push({ title, items });
    }
    out[category] = { sections };
  }
  return out;
}

function toTypeScript(lang, menu) {
  const q = (s) => JSON.stringify(s);
  let body = "{\n";
  for (const category of ["food", "sweets", "drinks"]) {
    body += `  ${category}: {\n    sections: [\n`;
    for (const section of menu[category].sections) {
      body += `      {\n        title: ${q(section.title)},\n        items: [\n`;
      for (const item of section.items) {
        body += `          {\n            name: ${q(item.name)},\n`;
        if (item.description)
          body += `            description: ${q(item.description)},\n`;
        body += `            price: ${item.price},\n          },\n`;
      }
      body += `        ],\n      },\n`;
    }
    body += `    ],\n  },\n`;
  }
  const label = lang === "ar" ? "Arabic" : "Kurdish";
  return (
    `import type { LanguageMenu } from "./types";\n\n` +
    `/**\n * ${label} menu, generated from public/menus/${lang}-menu.pdf by\n` +
    ` * scripts/menu-from-pdf.mjs. Do not edit by hand. Prices are in Iraqi dinar.\n` +
    NOTE[lang] +
    ` */\nexport const ${EXPORT_NAME[lang]}: LanguageMenu = ${body}};\n`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const lang of ["ar", "ku"]) {
    const menu = await buildLanguage(lang);
    fs.writeFileSync(`src/lib/menu/${lang}.ts`, toTypeScript(lang, menu));
    const n = Object.values(menu).reduce(
      (a, c) => a + c.sections.reduce((b, s) => b + s.items.length, 0),
      0,
    );
    console.log(
      `${lang}: ${n} items in ${Object.values(menu).reduce((a, c) => a + c.sections.length, 0)} sections`,
    );
  }
  console.log("Run `npm run format` afterwards, then scripts/audit-prices.mjs.");
}
