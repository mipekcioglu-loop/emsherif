/**
 * Turns the café's dish photography into the assets the menu grid serves, and
 * writes the dish -> photograph mapping out as a typed module.
 *
 *   npm run photos          # rebuild public/dishes and src/lib/menu/photos.ts
 *   npm run photos -- --report   # ... and print the white-balance measurements
 *
 * It reads the menus straight out of the TypeScript they live in, so it runs
 * under the Node 22 the .nvmrc pins, not the 20.9 the package floor allows.
 *
 * Input   photos/dishes/*.jpg          the photographs as delivered
 *         photos/dishes/index.json     dish name -> file, from the photo shoot
 * Output  public/dishes/<slug>-<w>.webp
 *         src/lib/menu/photos.ts       generated, do not hand-edit
 *
 * The three things it does to a photograph, in order:
 *
 * 1. WHITE BALANCE. The photographs are shot top-down on a pale seamless, but
 *    the seamless is a different white in nearly every frame — the cast across
 *    the set runs from R-B = -28 (cool blue) to R-B = +48 (pink/amber). Three
 *    of those side by side in a row of cards look careless, so each frame's
 *    background is measured and mapped onto one warm neutral (TARGET).
 *
 *    A few frames are not seamless shots at all — a salad photographed on a
 *    wooden table, with other dishes in the frame. Correcting those to a bright
 *    neutral would wreck them, so the estimate is rejected when the border of
 *    the frame is too dark or too busy to be a seamless, and the photograph is
 *    passed through untouched. `--report` lists which ones those were.
 *
 * 2. CENTRE-CROP to the middle 85% and then to 4:3, so the dish carries the
 *    frame and every card's photo well has the same proportions.
 *
 * 3. RESIZE to the two widths the layout actually asks for, as WebP. The
 *    source frames are 640px on the long edge, so 540 is about as wide as the
 *    crop can go and still be real pixels — three frames arrived smaller than
 *    that and are enlarged a little rather than served under their srcset
 *    width. A phone at DPR 2 is therefore served a slightly soft photograph;
 *    that is the resolution the shoot delivered, not a pipeline setting.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { englishMenu } from "../src/lib/menu/en.ts";
import { arabicMenu } from "../src/lib/menu/ar.ts";
import { kurdishMenu } from "../src/lib/menu/ku.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(root, "photos/dishes");
const OUT_IMAGES = path.join(root, "public/dishes");
const OUT_MODULE = path.join(root, "src/lib/menu/photos.ts");

/** The warm neutral every seamless is normalised onto — the photo well colour. */
const TARGET = { r: 243, g: 242, b: 235 };
/** How hard to pull each frame's background brightness onto the target's.
 *  1 would flatten every photograph onto one exposure and blow the highlights
 *  on the metal plates; 0 would leave the set as uneven as it arrived. */
const EXPOSURE_PULL = 0.75;
/** Below this the border of the frame is not a lit seamless. */
const MIN_BACKGROUND_LUMA = 200;
/** A border this varied is only background if it is also bright: a plate or a
 *  bowl reaching the edge of a seamless shot spreads the ring, a wooden table
 *  under a dish darkens it. */
const MAX_BACKGROUND_SPREAD = 26;

const WIDTHS = [340, 540];
const CROP = 0.85;
const ASPECT = 4 / 3;

/* ------------------------------------------------------------------ *
 * Which dish a photograph belongs to
 * ------------------------------------------------------------------ */

const CATEGORIES = ["food", "sweets", "drinks"];
const MENUS = { en: englishMenu, ar: arabicMenu, ku: kurdishMenu };

/**
 * Section order differs between the printed menus, so a section's position is
 * not a dish's identity. These line each language's sections up with English —
 * `food.ku[5] = 6` reads "English's 6th food section is Kurdish's 7th". Same
 * table as scripts/audit-prices.mjs; see docs/menu-discrepancies.md §5.
 */
const SECTION_ORDER = {
  food: { ku: [0, 1, 2, 3, 4, 6, 5, 7, 8, 9] },
  drinks: { ar: [2, 3, 0, 1, 4], ku: [2, 3, 0, 1, 4] },
};

/**
 * The Arabic hot-drinks list is printed against the wrong prices: from the
 * second row down the names are offset by one and Flat White is replaced by a
 * decaf espresso (docs/menu-discrepancies.md §2). Prices still line up with
 * English, so only the photographs need re-pointing — by name, not by row.
 * Arabic row -> English row; null where Arabic lists a drink English does not.
 */
const ITEM_OVERRIDES = {
  "ar:drinks:4": [0, 2, 3, 4, 5, 1, null, 7, 8],
};

/**
 * Five English dish names are printed twice, in two different sections, and
 * the shoot delivered one photograph for each name. The photographs settle it:
 * the shawarma and msahab frames are wraps on a plate, so they belong to the
 * sandwich; the fries are served plain, which is the mezze. `Lahmeh Mechwiyeh`
 * is beef and lamb skewers under one name in English and the frame does not
 * say which, so it goes to the first of the two, as printed.
 * Value is the 0-based occurrence, in English menu order, that keeps the photo.
 */
const DUPLICATE_NAMES = {
  "Shawarma Lahmeh": 1, // Sandwiches, not the Hot Mezze plate
  "Shawarma Djej": 1, // Sandwiches
  "Djej Msahab": 0, // Sandwiches, not the Masheweh plate
  "Batata Mekliyeh": 0, // Hot Mezze — the frame has no coleslaw
  "Lahmeh Mechwiyeh": 0, // Masheweh, first of the two
};

const key = (category, section, item) => `${category}:${section}:${item}`;

function englishSlots() {
  const slots = new Map();
  const seen = new Map();
  for (const category of CATEGORIES) {
    englishMenu[category].sections.forEach((section, s) => {
      section.items.forEach((item, i) => {
        const occurrence = seen.get(item.name) ?? 0;
        seen.set(item.name, occurrence + 1);
        slots.set(key(category, s, i), { name: item.name, occurrence });
      });
    });
  }
  return { slots, counts: seen };
}

function buildMapping(index, report) {
  const { slots, counts } = englishSlots();
  const photoOf = new Map(); // English slot key -> slug

  for (const [slotKey, slot] of slots) {
    const entry = index[slot.name];
    if (!entry) continue;
    const printedTwice = counts.get(slot.name) > 1;
    if (printedTwice) {
      const keeper = DUPLICATE_NAMES[slot.name];
      if (keeper === undefined) {
        throw new Error(
          `"${slot.name}" is printed ${counts.get(slot.name)} times and has one ` +
            `photograph. Add it to DUPLICATE_NAMES to say which one it belongs to.`,
        );
      }
      if (slot.occurrence !== keeper) continue;
    }
    photoOf.set(slotKey, path.basename(entry.photo, path.extname(entry.photo)));
    if (entry.verdict && entry.verdict !== "confirmed") {
      report.verdicts.push(`${slot.name} — ${entry.photo} (${entry.verdict})`);
    }
  }

  const unmatched = Object.keys(index).filter(
    (name) => ![...slots.values()].some((slot) => slot.name === name),
  );
  if (unmatched.length) {
    throw new Error(`index.json names no dish on the menu: ${unmatched.join(", ")}`);
  }

  // Now express the same mapping in each language's own section/item order.
  const perLanguage = {};
  for (const [language, menu] of Object.entries(MENUS)) {
    const map = {};
    for (const category of CATEGORIES) {
      const order = SECTION_ORDER[category]?.[language];
      menu[category].sections.forEach((section, s) => {
        // `order` lists, for each English section, which of this language's
        // sections it is; invert it to go the other way.
        const englishSection = order ? order.indexOf(s) : s;
        if (englishSection < 0) {
          throw new Error(`No English counterpart for ${language} ${category} #${s}`);
        }
        const override = ITEM_OVERRIDES[`${language}:${category}:${s}`];
        section.items.forEach((_, i) => {
          const englishItem = override ? override[i] : i;
          if (englishItem === null || englishItem === undefined) return;
          const slug = photoOf.get(key(category, englishSection, englishItem));
          if (slug) map[key(category, s, i)] = slug;
        });
      });
    }
    perLanguage[language] = map;
  }

  // A language must not end up with photographs English does not have.
  for (const [language, map] of Object.entries(perLanguage)) {
    const mine = Object.keys(map).length;
    const english = Object.keys(perLanguage.en).length;
    const expected = language === "ar" ? english - 1 : english; // ar has no flat white
    if (mine !== expected) {
      throw new Error(
        `${language} maps ${mine} photographs, expected ${expected}. The section ` +
          `alignment in SECTION_ORDER is probably stale.`,
      );
    }
  }

  return { perLanguage, slots };
}

/* ------------------------------------------------------------------ *
 * White balance
 * ------------------------------------------------------------------ */

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/**
 * Estimates the seamless colour from the border of the frame: the outer ring
 * is background in a top-down shot. Shadows and a dish creeping into a corner
 * drag the mean down, so only the brighter half of the ring is averaged.
 */
async function measureBackground(file) {
  const small = sharp(file).resize(96, 96, { fit: "inside" });
  const { data, info } = await small.raw().toBuffer({ resolveWithObject: true });
  const band = Math.max(2, Math.round(Math.min(info.width, info.height) * 0.12));
  const ring = [];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const edge =
        x < band || y < band || x >= info.width - band || y >= info.height - band;
      if (!edge) continue;
      const p = (y * info.width + x) * info.channels;
      const [r, g, b] = [data[p], data[p + 1], data[p + 2]];
      ring.push({ r, g, b, l: luma(r, g, b) });
    }
  }
  ring.sort((a, b) => a.l - b.l);
  const brighter = ring.slice(Math.floor(ring.length / 2));
  const mean = brighter.reduce(
    (acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
    { r: 0, g: 0, b: 0 },
  );
  for (const channel of ["r", "g", "b"]) mean[channel] /= brighter.length;

  const lumas = ring.map((p) => p.l);
  const avg = lumas.reduce((a, b) => a + b, 0) / lumas.length;
  const spread = Math.sqrt(lumas.reduce((a, l) => a + (l - avg) ** 2, 0) / lumas.length);
  return { ...mean, luma: luma(mean.r, mean.g, mean.b), spread };
}

function gainsFor(background) {
  const usable =
    background.luma >= MIN_BACKGROUND_LUMA || background.spread <= MAX_BACKGROUND_SPREAD;
  if (!usable) return null;

  const targetLuma = (TARGET.r + TARGET.g + TARGET.b) / 3;
  const own = (background.r + background.g + background.b) / 3;
  // Aim at the target's tint, at a brightness pulled part-way towards it.
  const lift = (targetLuma / own) ** EXPOSURE_PULL;
  return ["r", "g", "b"].map((c) => {
    const gain = ((TARGET[c] / targetLuma) * own * lift) / background[c];
    return Math.min(1.3, Math.max(0.8, gain));
  });
}

async function processPhoto(file, slug, report) {
  const background = await measureBackground(file);
  const gains = gainsFor(background);
  if (!gains) {
    report.passedThrough.push(
      `${slug} (background luma ${background.luma.toFixed(0)}, ` +
        `spread ${background.spread.toFixed(0)})`,
    );
  } else {
    report.corrected.push({ slug, background, gains });
  }

  const meta = await sharp(file).metadata();
  // Middle 85% of the frame, then 4:3 out of that.
  let width = Math.round(meta.width * CROP);
  let height = Math.round(meta.height * CROP);
  if (width / height > ASPECT) width = Math.round(height * ASPECT);
  else height = Math.round(width / ASPECT);
  const left = Math.round((meta.width - width) / 2);
  const top = Math.round((meta.height - height) / 2);

  let bytes = 0;
  for (const target of WIDTHS) {
    let pipeline = sharp(file).extract({ left, top, width, height });
    if (gains) pipeline = pipeline.linear(gains, [0, 0, 0]);
    const out = path.join(OUT_IMAGES, `${slug}-${target}.webp`);
    const info = await pipeline
      // Three of the source frames are narrower than the widest output, so a
      // little enlargement is allowed rather than emitting a file that is
      // narrower than the width its srcset descriptor claims.
      .resize(target, Math.round(target / ASPECT), { fit: "cover" })
      .webp({ quality: 74, effort: 6 })
      .toFile(out);
    bytes += info.size;
  }
  return bytes;
}

/* ------------------------------------------------------------------ *
 * Generated module
 * ------------------------------------------------------------------ */

function moduleSource({ perLanguage }) {
  const entries = (map) =>
    Object.keys(map)
      .sort()
      .map((k) => `    "${k}": "${map[k]}",`)
      .join("\n");

  return `/**
 * GENERATED by scripts/dish-photos.mjs — do not edit by hand.
 *
 * Which photograph belongs to which dish, keyed by where the dish sits in that
 * language's own menu ("category:section:item"). The three printed menus order
 * their sections differently, so the mapping is worked out once at build time
 * and written out per language rather than aligned at runtime.
 *
 * Rebuild with \`npm run photos\`.
 */
import type { Language } from "@/lib/i18n";

/** Widths emitted for each photograph, narrowest first. */
export const photoWidths = [${WIDTHS.join(", ")}] as const;

/** Every photograph is cropped to this ratio; the card well crops it further. */
export const photoAspectRatio = "${ASPECT === 4 / 3 ? "4 / 3" : ASPECT}";

export const dishPhotos: Record<Language, Readonly<Record<string, string>>> = {
${Object.keys(MENUS)
  .map((language) => `  ${language}: {\n${entries(perLanguage[language])}\n  },`)
  .join("\n")}
};
`;
}

/* ------------------------------------------------------------------ *
 * Run
 * ------------------------------------------------------------------ */

const wantsReport = process.argv.includes("--report");
const index = JSON.parse(fs.readFileSync(path.join(SOURCE, "index.json"), "utf8"));
const report = { verdicts: [], passedThrough: [], corrected: [] };

const mapping = buildMapping(index, report);

fs.rmSync(OUT_IMAGES, { recursive: true, force: true });
fs.mkdirSync(OUT_IMAGES, { recursive: true });

const slugs = new Set(Object.values(mapping.perLanguage.en));
let bytes = 0;
for (const slug of [...slugs].sort()) {
  const entry = Object.values(index).find(
    (e) => path.basename(e.photo, path.extname(e.photo)) === slug,
  );
  bytes += await processPhoto(path.join(SOURCE, entry.photo), slug, report);
}

fs.writeFileSync(OUT_MODULE, moduleSource(mapping));

const dishes = CATEGORIES.reduce(
  (total, category) =>
    total + englishMenu[category].sections.reduce((n, s) => n + s.items.length, 0),
  0,
);
const placed = Object.keys(mapping.perLanguage.en).length;
console.log(
  `${slugs.size} photographs -> ${WIDTHS.length} widths each, ` +
    `${(bytes / 1024 / 1024).toFixed(2)} MB in public/dishes`,
);
console.log(
  `${placed} of ${dishes} dishes carry a photograph; ` +
    `${dishes - placed} fall back to the wordmark card`,
);
if (report.passedThrough.length) {
  console.log(
    `\n${report.passedThrough.length} left unbalanced — no seamless to measure:`,
  );
  for (const line of report.passedThrough) console.log(`  ${line}`);
}
if (report.verdicts.length) {
  console.log(`\n${report.verdicts.length} identifications the shoot flagged itself:`);
  for (const line of report.verdicts) console.log(`  ${line}`);
}
if (wantsReport) {
  console.log("\nwhite balance applied (background R,G,B -> gains):");
  for (const { slug, background, gains } of report.corrected) {
    console.log(
      `  ${slug.padEnd(30)} ` +
        `${background.r.toFixed(0)},${background.g.toFixed(0)},${background.b.toFixed(0)}` +
        ` -> ${gains.map((g) => g.toFixed(3)).join(", ")}`,
    );
  }
}
