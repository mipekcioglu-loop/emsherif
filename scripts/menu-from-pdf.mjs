/**
 * Rebuilds src/lib/menu/ar.ts and ku.ts from the printed menu PDFs in
 * public/menus, so the dish names, descriptions and prices on the site are the
 * approved wording rather than anything retyped by hand.
 *
 * The menus carry a real text layer, but their fonts have three quirks:
 *
 * 1. A word is split into several runs wherever a glyph needs its own run —
 *    at a diacritic, mostly. "لَبنة" arrives as "ل" + "َبنة". The runs are
 *    rejoined by geometry in `runs()`, so this is handled as a class rather
 *    than a list of broken words.
 * 2. Some dal glyphs are emitted as zero-width overlays on the run they
 *    follow.
 * 3. The lam-alef ligature comes out with its two letters transposed. Where
 *    the alef carries a hamza this is unambiguous and is repaired by rule;
 *    with a bare alef it is not, because the Arabic definite article has the
 *    same shape, so those stay an explicit list. See LIGATURES below.
 *
 * Kurdish has a fourth: the font sets both the vowel ە and a real /h/ as
 * U+0647, and nothing around the letter says which. See kurdishLetters().
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
/** The edge a column is aligned on: left for English, right for Arabic and Kurdish. */
const startEdge = (c) => (LTR ? c.x : c.x + c.w);

/**
 * The lam-alef ligature comes out of the text layer with its two letters the
 * wrong way round. It splits into two cases, and only one of them can be a
 * rule.
 *
 * Where the alef carries a hamza — أ إ آ — the reversed pair is unambiguous:
 * across both menus every single occurrence of one of those followed by a lam
 * is a transposed ligature (الأرز and الأبيض, and nothing else), so it is
 * repaired by rule and a new one would be repaired too.
 *
 * With a bare alef it cannot be: "ا" followed by "ل" is also how the Arabic
 * definite article is spelled. 96 distinct Arabic words in these menus have
 * that shape and 11 of them are broken; Kurdish has 13, of which 12 are
 * broken and one — السرايا, in عيش السرايا — is a real article. Nothing in the
 * letters tells them apart, so those stay an exact-match list. Every entry is
 * asserted to fire, so a stale one cannot sit here unnoticed.
 */
const HAMZA_ALEF_LAM = /([آأإ])ل/gu;

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
    اليت: "لايت",
  },
  ku: {
    زەالتە: "زەڵاتە",
    زەاڵتەی: "زەڵاتەی",
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
    ڤانیال: "ڤانیلا",
    ڤانێال: "ڤانێلا",
    فالت: "فلات",
    بالک: "بلاک",
    بالنک: "بلانک",
    گەاڵ: "گەڵا",
    التی: "لاتی",
    ڕۆژهەاڵتی: "ڕۆژهەڵاتی",
    الیت: "لایت",
  },
};

/**
 * The menu fonts map some Kurdish letters onto their Arabic lookalikes. Kaf
 * and yeh are unconditional. Heh is not, and cannot be made into a rule: the
 * font sets both the vowel ە and a real /h/ as U+0647, and the letters
 * around them do not distinguish the two. This menu has سرکهی, which needs the
 * vowel, and ڕاهیب, which needs the consonant — the same heh, before the
 * same yeh, wanting opposite answers.
 *
 * The rule that used to be here guessed from the following letter and got
 * three words wrong, shipping ڕاەیب, مۆەیتۆی and کاەو. So the choice is
 * made from the word instead. The corpus is closed — three fixed PDFs, 128
 * approved dishes — so every word carrying a non-initial heh is named here,
 * and one that is in neither list stops the run instead of being guessed at.
 */
const HEH_IS_CONSONANT = new Set([
  "باهاماس", // Bahamas
  "بەهارات", // spice
  "بەهاراتدار", // spiced
  "بەهاراتکراو", // spiced
  "مۆهیتۆی", // mojito
  "ڕاهیب", // Raheb, the salad
  "ڕۆژهەاڵتی", // oriental (its lam-alef is still transposed here)
  "کاهو", // lettuce
]);

/** The rest of the corpus, where the heh is the vowel ە. */
const HEH_IS_VOWEL = new Set([
  "بلیله",
  "به",
  "بهرخ",
  "ته",
  "زەعتهری",
  "سرکهی",
  "شیرهمهنییهکان",
  "فهالفل",
  "فینگه",
  "فینگهر",
  "فینگهری",
  "لەگهل",
  "هێلکه",
  "پۆتهیتۆ",
  "ڕهپیاز",
  "کهباب",
]);

function kurdishLetters(s) {
  return s
    .replaceAll("\u0643", "\u06A9")
    .replaceAll("\u064A", "\u06CC")
    .replace(/\p{L}+/gu, (word) => {
      if (!word.slice(1).includes("\u0647")) return word;
      if (HEH_IS_CONSONANT.has(word)) return word;
      if (!HEH_IS_VOWEL.has(word)) {
        throw new Error(
          `"${word}" carries a heh this script has not been told about. Which ` +
            `it is cannot be read off the letters, so add it to HEH_IS_CONSONANT ` +
            `(a real /h/) or HEH_IS_VOWEL (the vowel) in scripts/menu-from-pdf.mjs.`,
        );
      }
      return word[0] + word.slice(1).replaceAll("\u0647", "\u06D5");
    });
}

/*
 * There used to be a JOINS map here for three lines the source "split without
 * a space" — السميد المفتول, الثوم يُقدّم and قیمە بە دۆشاوی. They were not
 * missing spaces in the source at all: each is an ordinary word space that
 * the old parser dropped, because it concatenated every run on a baseline
 * regardless of the distance between them. joinRow() measures that distance,
 * so all three now come out with their space and the map is gone.
 */

/** Entries seen to fire, so a stale one can be reported at the end of a run. */
const ligaturesUsed = new Set();
/** Café corrections applied, reported at the end of a run. */
const cafeApplied = [];

const fix = (s, lang) => {
  if (!s) return s;
  // Unambiguous half of the transposition: a hamza-bearing alef is never
  // followed by a lam in these menus except as a reversed ligature.
  let out = s.replace(HAMZA_ALEF_LAM, "ل$1");
  // Bounded by non-letters so an attached quote or comma still matches, while
  // a key that merely appears inside a longer word does not.
  for (const [from, to] of Object.entries(LIGATURES[lang] ?? {})) {
    const re = new RegExp(`(?<!\\p{L})${from}(?!\\p{L})`, "gu");
    if (re.test(out)) ligaturesUsed.add(`${lang}:${from}`);
    out = out.replace(re, to);
  }
  return out.replace(/\s+/g, " ").trim();
};

/**
 * Text of a zero-width overlay glyph. Where the overlay carries a letter, the
 * shadda in front of it is the cmap's, not the page's, and goes; a leading
 * mark that survives is put back after the letter it sits on. An overlay that
 * is nothing but a mark is a real diacritic — the heading نيّ is set that way —
 * so it is kept and placed by `attachMarks`.
 */
const overlay = (s) =>
  (/\p{L}/u.test(s) ? s.replaceAll(SHADDA, "") : s).replace(/^(\p{Mn})(\P{Mn})/u, "$2$1");

/*
 * Rejoining a line of type.
 *
 * pdf.js reports each run's width in the same space as its x, so the two can
 * be compared: a run's trailing edge is x + w one way and x the other, and the
 * distance to the next run is a real measurement. Two kinds of run follow
 * another one, and they need different limits.
 *
 * A run opening with a combining mark is a continuation whatever the distance
 * looks like, because the base glyph's advance does not account for the mark;
 * in Arabic these reach 0.95em. It joins with no space, and that is what was
 * truncating "لَبنة" to "ل" and "محمّرة" to "مح".
 *
 * Any other run is part of the same line only if it is close. Measured over
 * all three menus the widest such gap is 0.28em — an ordinary word space,
 * which is how "PINK 75" and "| ٣ دانە" belong to the names they follow —
 * while the narrowest gap between two columns is 1.15em. That 1.15em is in
 * English, whose layout is far tighter than the Arabic and Kurdish 4.79em, so
 * it is the number that sets the limit. Cutting at 0.6em sits clear of both.
 * Either error shows: too tight and a name loses its second half, too loose
 * and it swallows its own description.
 */
const MERGE_EM = 0.6; // above the widest word space (0.28em), below the narrowest column gap (1.15em)
const CONTINUE_EM = 2.0; // a combining mark may sit further out than its own advance
const SPACE_EM = 0.05; // a split word sits at 0.00em; the narrowest real space is 0.07em
const COMBINING = /^\p{Mn}/u;

function joinRow(row) {
  const out = [];
  for (const c of row) {
    const prev = out[out.length - 1];
    const gap = prev ? (LTR ? c.x - (prev.x + prev.w) : prev.x - (c.x + c.w)) : Infinity;
    const continues = COMBINING.test(c.s);
    const limit = (continues ? CONTINUE_EM : MERGE_EM) * c.size;
    if (prev && prev.size === c.size && gap < limit) {
      const space = continues || gap < SPACE_EM * c.size ? "" : " ";
      prev.s += space + c.s;
      const left = Math.min(prev.x, c.x);
      const right = Math.max(prev.x + prev.w, c.x + c.w);
      prev.x = left;
      prev.w = right - left;
    } else {
      out.push({ ...c });
    }
  }
  return out;
}

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
        // What is left can still lead with a combining mark, which is not
        // well-formed — a mark belongs after the letter it sits on, so it is
        // put back there. The corpus has one: "ُج" in جُزر, carrot.
        s: it.width === 0 ? overlay(it.str) : it.str,
      });
    }
    // Merge each row into positioned chunks (RTL: rightmost first), first
    // stacking the zero-width overlays onto the run they sit on, then
    // rejoining the fragments the font split a line of type into.
    const chunks = [];
    for (const [y, cells] of rows) {
      cells.sort((a, b) => byReading(a, b) || b.w - a.w);
      const row = [];
      let cur = null;
      for (const c of cells) {
        if (cur && Math.abs(cur.x - c.x) < 1e-6) {
          cur.s += c.s;
          cur.w = Math.max(cur.w, c.w);
        } else {
          if (cur) row.push(cur);
          cur = { y, x: c.x, w: c.w, size: c.size, s: c.s };
        }
      }
      if (cur) row.push(cur);
      chunks.push(...joinRow(row));
    }
    pages.push(chunks);
  }
  return pages;
}

/**
 * A chunk that is only a combining mark belongs to the glyph it is drawn over,
 * which is the one whose span contains its x — not to whichever chunk happens
 * to precede it in reading order. Headings can set the mark on its own
 * baseline, so it arrives as a chunk of its own.
 */
function attachMarks(chunks) {
  const marks = chunks.filter((c) => c.s && ![...c.s].some((ch) => !/\p{Mn}/u.test(ch)));
  if (!marks.length) return chunks;
  const out = chunks.filter((c) => !marks.includes(c));
  for (const m of marks) {
    const host = out.find((c) => m.x >= c.x && m.x <= c.x + c.w);
    if (host) host.s += m.s;
    else out.push(m);
  }
  return out;
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
        attachMarks(cs.sort(byReading))
          .map((c) => c.s)
          .join(LTR ? " " : ""),
      ),
    }))
    .filter((h) => h.s)
    .sort((a, b) => b.y - a.y);

  const body = texts.filter((t) => t.size < 14);
  const used = new Set();
  /** A baseline that carries a price starts a new item, so a description stops above it. */
  const pricedRow = (y) => prices.some((q) => Math.abs(q.y - y) <= 4);

  const items = prices
    .sort((a, b) => b.y - a.y)
    .map((p) => {
      // Two layouts. Stacked rows put the dish name directly under its price
      // in the same column; list rows put it on the price's own baseline.
      // Try stacked first — on a stacked row the price's baseline also carries
      // the first line of the description, which would otherwise look like a name.
      // A column is aligned on the edge its language starts reading from, so
      // that is the edge to compare. Comparing the far edge instead made a
      // long name look like it was in a different column from its own price,
      // which dropped the name and promoted the description in its place.
      let name = body
        .filter(
          (t) =>
            !used.has(t) &&
            Math.abs(startEdge(t) - startEdge(p)) < 90 &&
            t.y < p.y - 2 &&
            p.y - t.y < 40,
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
        // A list row's description, when it has one, sits under the name and
        // is aligned with it. What ends it is the next priced row, not a drop
        // in size: the tea selection sets its description at the same size as
        // the name, which is why its two lines used to be thrown away.
        descRuns.push(
          ...body.filter(
            (t) =>
              !used.has(t) &&
              t !== name &&
              !pricedRow(t.y) &&
              Math.abs(startEdge(t) - startEdge(name)) < 40 &&
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

/**
 * Corrections the café sent after reviewing the live site.
 *
 * The café outranks the printed menu. Where they correct a name, theirs is the
 * approved wording and the PDF is simply out of date — so this is applied
 * after parsing rather than the PDF being treated as final.
 *
 * Keyed by position, so a correction cannot land on a dish it was not meant
 * for, and each one states the text it expects to replace. If the PDF ever
 * parses differently the run stops instead of quietly rewriting the wrong
 * dish. Only names: nothing here touches a description or a price.
 */
const CAFE_NAMES = {
  ar: {
    // Kibbet Lahmeh bi Laban. The printed menu drops "bi laban" altogether.
    "food:9:0": { was: "كبة لحم", now: "كبة لحمة باللبن" },
  },
  ku: {
    // Musakhan.
    "food:0:5": { was: "مسخەن", now: "مسەخەن" },
  },
};

/** Applies those corrections to a built menu, in place. */
function applyCafeNames(lang, menu, report) {
  for (const [at, { was, now }] of Object.entries(CAFE_NAMES[lang] ?? {})) {
    const [category, s, i] = at.split(":");
    const item = menu[category]?.sections[Number(s)]?.items[Number(i)];
    if (!item) {
      throw new Error(
        `Café correction ${lang} ${at}: there is no dish at that position.`,
      );
    }
    if (item.name !== was) {
      throw new Error(
        `Café correction ${lang} ${at}: expected "${was}" but the menu now parses ` +
          `as "${item.name}". Check the position before letting this through.`,
      );
    }
    item.name = now;
    report.push(`${lang} ${at}: "${was}" -> "${now}"`);
  }
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
  applyCafeNames(lang, out, cafeApplied);
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
  // The café's corrections outrank the printed menu, so they are worth
  // seeing on every run rather than being buried in the diff.
  if (cafeApplied.length) {
    console.log(`\n${cafeApplied.length} café name corrections applied:`);
    for (const line of cafeApplied) console.log(`  ${line}`);
  }

  // A ligature entry that never fires is either stale or misspelled, and
  // either way it is not doing the job it looks like it is doing. The bare-alef
  // list cannot be replaced by a rule, so the least it can do is stay honest.
  const stale = [];
  for (const [lang, map] of Object.entries(LIGATURES))
    for (const from of Object.keys(map))
      if (!ligaturesUsed.has(`${lang}:${from}`)) stale.push(`${lang}: ${from}`);
  if (stale.length) {
    console.log(`\n${stale.length} LIGATURES entries matched nothing:`);
    for (const line of stale) console.log(`  ${line}`);
    console.log("  Remove them, or check the spelling against the text layer.");
  }
  console.log("\nRun `npm run format` afterwards, then scripts/audit-prices.mjs.");
}
