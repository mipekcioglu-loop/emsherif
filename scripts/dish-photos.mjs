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
 *    Not every frame is a seamless shot. One salad arrived photographed on a
 *    wooden table with other dishes in shot, and correcting that to a bright
 *    neutral would have wrecked it, so the estimate is rejected when the border
 *    of the frame is too dark or too busy to be a seamless and the photograph
 *    is passed through untouched. The café has since replaced that frame with a
 *    seamless one, so nothing is rejected today and the run reports none — but
 *    the guard stays, because the next delivery may not be seamless either.
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
const OUT_KEYS = path.join(root, "src/lib/menu/dish-keys.ts");

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
/** Fallback crop, for a frame whose dish cannot be located. */
const CROP = 0.85;
const ASPECT = 4 / 3;

/* ------------------------------------------------------------------ *
 * Framing the dish to a constant size
 * ------------------------------------------------------------------ */

/**
 * The shoot was not framed consistently — some dishes were shot close and
 * some from much further back — so cropping every frame by the same fraction
 * preserved that, and scrolling the grid the plates jumped between big and
 * small. Measured over the 99 frames, the largest subject took 2.2x as much
 * of its frame as the smallest. So the dish is located in each frame and the
 * crop is sized from it, which makes the dish, not the frame, the thing that
 * is the same size on every card.
 */

/** Analysis resolution for locating the dish. */
const FIND_WIDTH = 240;
/** Gradient magnitude, on a 0-255 luma scale, that counts as detail. */
const FIND_EDGE = 12;
/** A row or column is part of the dish once this much of it carries detail. */
const FIND_PROFILE = 0.04;
/**
 * How much of the card the dish should fill, measured against the phone well
 * rather than the desktop one. The well is 3:2 on a phone and 4:3 above it,
 * and the photograph is 4:3 — so a phone shows only the middle 88.9% of the
 * image's height and is the tighter of the two. Framing to the phone means
 * the dish is never clipped there, and sits with a little more air on a
 * desktop.
 */
const SUBJECT_TARGET = 0.88;
/** The fraction of the image's height a phone actually shows. */
const PHONE_VISIBLE = 4 / 3 / (3 / 2);

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
 * The Arabic page lists its hot drinks in a different order from the other two,
 * and carries a decaf espresso where they carry Flat White
 * (docs/menu-discrepancies.md §2). So the fourth Arabic row is not the fourth
 * English drink, and matching photographs by row would put the doppio's cup on
 * the cappuccino. Mapped by name instead.
 *
 * The prices are a separate matter and not what this table is for. Because the
 * same price column is printed against differently-ordered drinks, a cappuccino
 * costs 10,000 or 9,500 depending on which menu a guest reads; that is a fault
 * in the printed menus for the café to resolve (docs/menu-discrepancies.md §2),
 * and the site reproduces each page as printed. Whatever they decide about the
 * prices, the drinks will still be listed in a different order, so this table
 * is needed either way.
 *
 * Arabic row -> English row; null where Arabic lists a drink English does not.
 */
const ITEM_OVERRIDES = {
  "ar:drinks:4": [0, 2, 3, 4, 5, 1, null, 7, 8],
};

/**
 * Five English dish names are printed twice, in two different sections, so a
 * name alone does not say which row a frame belongs to.
 *
 * Four of them now have a frame for each row: the café sent the Hot Mezze
 * platters for the two shawarmas, the Masheweh plate for Djej Msahab and the
 * sandwich for Batata Mekliyeh, alongside the wraps and plain fries already
 * shipped. `Lahmeh Mechwiyeh` is the beef and the lamb skewers under one name
 * in English and the café confirmed the one frame stands for both.
 *
 * Each entry lists, for each frame in that name's index.json array and in the
 * same order, which printing of the name it belongs to — 0-based, in English
 * menu order. A row named by nothing gets no photograph.
 */
const DUPLICATE_NAMES = {
  "Shawarma Lahmeh": [[0], [1]], // Hot Mezze platter, then Sandwiches wrap
  "Shawarma Djej": [[0], [1]], // Hot Mezze platter, then Sandwiches wrap
  "Djej Msahab": [[0], [1]], // Sandwiches wrap, then Masheweh plate
  "Batata Mekliyeh": [[0], [1]], // Hot Mezze plain fries, then the sandwich
  "Lahmeh Mechwiyeh": [[0, 1]], // one frame, beef and lamb rows both
};

/**
 * Photographs we hold but do not place, and why. Empty is the normal state.
 *
 * A frame that is in `photos/dishes/` but named by nothing in `index.json`
 * would otherwise sit there silently, and the next person to run this would
 * have to work out from scratch whether it was held on purpose or forgotten.
 * So every source file must be either placed by `index.json` or listed here
 * with a reason, and the run prints whatever is here.
 *
 * Hold a frame by adding its file name and the reason, and taking it out of
 * `index.json`. Put it back by doing the reverse — the file itself never
 * leaves the repository, so nobody has to ask the café for it twice.
 *
 * Two frames have been through here: the Bahamas pudding, which does not match
 * its printed description, and the Kahweh Loubnaniyeh espresso, which is not
 * how Lebanese coffee is served. The café confirmed both, so both are placed
 * again and carry a `confirmed-against-…` verdict instead.
 */
const HELD = {};

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
  const files = new Map(); // slug -> its source file in photos/dishes

  /** A frame's slug: its own if index.json names one, else the file's name.
   *
   *  Named slugs matter where a frame turned out to be a different dish, so
   *  the file name no longer says what is in it — Musakhan and Mini Lahmeh bi
   *  Ajeen were shot under each other's names, and a card should not serve a
   *  .webp named after the wrong dish. Where only one file was wrong it has
   *  been renamed instead, which is tidier; that pair cannot be, because
   *  renaming either one would collide with the other. */
  const slugOf = (entry) =>
    entry.slug ?? path.basename(entry.photo, path.extname(entry.photo));

  for (const [slotKey, slot] of slots) {
    const entry = index[slot.name];
    if (!entry) continue;
    const frames = Array.isArray(entry) ? entry : [entry];
    let frame;
    if (counts.get(slot.name) > 1) {
      const rows = DUPLICATE_NAMES[slot.name];
      if (rows === undefined) {
        throw new Error(
          `"${slot.name}" is printed ${counts.get(slot.name)} times, so a name does ` +
            `not say which row a frame belongs to. Add it to DUPLICATE_NAMES.`,
        );
      }
      if (rows.length !== frames.length) {
        throw new Error(
          `"${slot.name}" has ${frames.length} frame(s) in index.json but ` +
            `${rows.length} listed in DUPLICATE_NAMES; they must line up.`,
        );
      }
      const which = rows.findIndex((r) => r.includes(slot.occurrence));
      if (which < 0) continue; // this printing gets no photograph
      frame = frames[which];
    } else {
      if (frames.length > 1) {
        throw new Error(
          `"${slot.name}" is printed once but has ${frames.length} frames in index.json.`,
        );
      }
      frame = frames[0];
    }
    const slug = slugOf(frame);
    // One slug may serve several rows — Lahmeh Mechwiyeh's single frame covers
    // both of its printings — but it must always mean the same file, or one
    // photograph would overwrite another in public/dishes.
    if (files.has(slug) && files.get(slug) !== frame.photo) {
      throw new Error(
        `slug "${slug}" is claimed by both ${files.get(slug)} and ${frame.photo}.`,
      );
    }
    files.set(slug, frame.photo);
    photoOf.set(slotKey, slug);
    // `verdict` says how sure we are that this frame is this dish:
    //   confirmed                      — settled, and silent.
    //   uncertain                      — nobody has confirmed it; it is live
    //                                    anyway, because a wrong photograph is
    //                                    better found by the café than by us.
    //   corrected                      — it was on the wrong dish and has been
    //                                    moved; kept visible for the record.
    //   confirmed-against-description  — the café confirms the dish even though
    //                                    the frame does not match the printed
    //                                    description.
    //   confirmed-against-appearance   — the café confirms the dish even though
    //                                    the frame does not look like it.
    // The last two are theirs to reconcile, not ours, and stay visible so
    // nobody reopens a question the café has already closed.
    // Anything but `confirmed` prints on every run.
    if (frame.verdict && frame.verdict !== "confirmed") {
      report.verdicts.push(`${slot.name} — ${frame.photo} (${frame.verdict})`);
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

  return { perLanguage, slots, files };
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

/**
 * Locates the dish in a frame, as fractions of the frame.
 *
 * By local contrast, not by colour. Colour does not separate them on this
 * set: the seamless carries a vignette, so its corners sit further from the
 * mean than a grey plate does, and the palest food — the Musakhan flatbread —
 * is the same tone as the paper behind it. What does separate them is detail.
 * The seamless is smooth everywhere; a dish has edges and texture.
 *
 * Returns null when nothing stands out, and the caller falls back to the
 * centre crop.
 */
export async function findSubject(file) {
  const { data, info } = await sharp(file)
    .resize(FIND_WIDTH, FIND_WIDTH, { fit: "inside" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const at = (x, y) => data[y * w + x];

  // The outermost ring is skipped. A couple of frames carry a dark sliver in
  // the last pixel or two — the lip of the backdrop — and without this it
  // reads as part of the dish, which both widens the crop and, worse, makes
  // the dish look like it reaches that edge.
  const BORDER = 2;
  const detail = new Uint8Array(w * h);
  for (let y = BORDER; y < h - BORDER; y++) {
    for (let x = BORDER; x < w - BORDER; x++) {
      const g =
        Math.abs(at(x + 1, y) - at(x - 1, y)) + Math.abs(at(x, y + 1) - at(x, y - 1));
      if (g > FIND_EDGE) detail[y * w + x] = 1;
    }
  }

  // Grow the detail, so that a dish reads as one region rather than as a
  // scattering of its own edges.
  const r = 3;
  const grown = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let hit = 0;
      for (let dy = -r; dy <= r && !hit; dy++) {
        for (let dx = -r; dx <= r && !hit; dx++) {
          const yy = y + dy;
          const xx = x + dx;
          if (yy >= 0 && yy < h && xx >= 0 && xx < w && detail[yy * w + xx]) hit = 1;
        }
      }
      grown[y * w + x] = hit;
    }
  }
  // Fill each line between its outermost detail, which closes a ring of edges
  // into a solid plate; a pixel has to be inside on both axes to count, so a
  // single stray mark cannot fill a row.
  const rowFill = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    let lo = -1;
    let hi = -1;
    for (let x = 0; x < w; x++) {
      if (!grown[y * w + x]) continue;
      if (lo < 0) lo = x;
      hi = x;
    }
    for (let x = lo; x >= 0 && x <= hi; x++) rowFill[y * w + x] = 1;
  }
  const solid = new Uint8Array(w * h);
  for (let x = 0; x < w; x++) {
    let lo = -1;
    let hi = -1;
    for (let y = 0; y < h; y++) {
      if (!grown[y * w + x]) continue;
      if (lo < 0) lo = y;
      hi = y;
    }
    for (let y = lo; y >= 0 && y <= hi; y++) solid[y * w + x] = rowFill[y * w + x];
  }

  const rows = new Array(h).fill(0);
  const cols = new Array(w).fill(0);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!solid[y * w + x]) continue;
      rows[y]++;
      cols[x]++;
    }
  }
  const span = (profile, across) => {
    const min = Math.max(1, Math.round(across * FIND_PROFILE));
    const lo = profile.findIndex((v) => v >= min);
    if (lo < 0) return null;
    let hi = profile.length - 1;
    while (hi > lo && profile[hi] < min) hi--;
    return [lo, hi + 1];
  };
  const ys = span(rows, w);
  const xs = span(cols, h);
  if (!ys || !xs) return null;
  return {
    x0: xs[0] / w,
    x1: xs[1] / w,
    y0: ys[0] / h,
    y1: ys[1] / h,
    wFrac: (xs[1] - xs[0]) / w,
    hFrac: (ys[1] - ys[0]) / h,
  };
}

/**
 * The window to take out of a frame so the dish lands at SUBJECT_TARGET.
 *
 * Centred on the dish rather than on the frame, because a good number of
 * these are composed off-centre, but slid back inside the photograph wherever
 * it will fit — an off-centre dish is not a reason to invent background.
 *
 * Where the dish was shot too close for the window to fit at all, the canvas
 * is extended instead of the dish being left oversized — by replicating the
 * edge of the seamless, which is smooth enough that more of it does not read
 * as an edit. It is capped at MAX_EXTEND, though: past that the invented area
 * would be most of the picture. Frames that hit the cap keep a dish larger
 * than the target and are named in the run's report.
 */
const MAX_EXTEND = 0.12;

export function windowFor(subject, meta) {
  const bw = subject.wFrac * meta.width;
  const bh = subject.hFrac * meta.height;
  let height = Math.max(
    bh / (PHONE_VISIBLE * SUBJECT_TARGET),
    bw / SUBJECT_TARGET / ASPECT,
  );
  let width = height * ASPECT;

  // Never invent more than MAX_EXTEND of the frame on an axis.
  const room = Math.min(
    1,
    (meta.width * (1 + MAX_EXTEND)) / width,
    (meta.height * (1 + MAX_EXTEND)) / height,
  );
  const capped = room < 1;
  width = Math.round(width * room);
  height = Math.round(height * room);

  // The cap must never cost us part of the dish: a crop that cuts the plate
  // is worse than a dish that is bigger than its neighbours. Where the capped
  // window would not hold the whole of it, grow it back until it does, with a
  // little air, and measured against the phone well because that is the one
  // that crops. Two portrait frames need this.
  const contain = Math.max(bh / PHONE_VISIBLE, bw / ASPECT) * 1.04;
  let grown = false;
  if (contain > height) {
    height = Math.round(contain);
    width = Math.round(height * ASPECT);
    grown = true;
  }

  // Centre on the dish, then slide back inside the frame as far as the window
  // allows, so that padding is only ever used for a window too big to fit.
  const cx = ((subject.x0 + subject.x1) / 2) * meta.width;
  const cy = ((subject.y0 + subject.y1) / 2) * meta.height;
  const place = (centre, size, extent) => {
    const at = centre - size / 2;
    if (size >= extent) return Math.round((extent - size) / 2);
    return Math.round(Math.min(Math.max(at, 0), extent - size));
  };
  return {
    width,
    height,
    left: place(cx, width, meta.width),
    top: place(cy, height, meta.height),
    capped: capped && !grown,
    grown,
  };
}

/**
 * Extends a frame outwards by continuing the falloff of its own background.
 *
 * Three things do not work here, and the reason each fails says what is
 * needed. The seamless is vignetted, so it is still changing in brightness
 * when it runs off the edge of the frame:
 *
 *  - Repeating the edge pixel, or a median-filtered edge, puts a constant
 *    column against a graded frame. That banded on 36 of the 99 frames.
 *  - Reflecting the frame is continuous in tone, but it folds the dish back
 *    into the margin as soon as the extension is deeper than the gap between
 *    the dish and the edge — ghost copies of a sundae and arcs of pizza crust.
 *
 * So the background is extended as what it is: a smooth gradient. Each edge
 * contributes its own tone and its own inward slope, both averaged along the
 * edge so noise does not stripe, and that slope is continued outwards with an
 * exponential damping so a long extension settles instead of running away.
 * Tone and slope are both continuous across the join, which leaves nothing
 * for a step to show up in, and only background is ever read, so nothing can
 * be ghosted.
 */
const EDGE_INSET = 4; // read past the backdrop's own lip at the frame edge
const SLOPE_RUN = 24; // pixels inward used to measure the falloff
const SLOPE_SMOOTH = 15; // rows averaged along the edge, to kill noise
const DAMP = 60; // pixels over which the falloff is allowed to persist

async function extendByEdge(buffer, pad, safe) {
  const { data, info } = await sharp(buffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const outW = W + pad.left + pad.right;
  const outH = H + pad.top + pad.bottom;
  const out = Buffer.alloc(outW * outH * 3);

  // Read past the outermost pixels on any side being extended that the dish
  // does not reach: several frames carry a dark lip there.
  const x0 = pad.left && safe.left ? EDGE_INSET : 0;
  const x1 = W - 1 - (pad.right && safe.right ? EDGE_INSET : 0);
  const y0 = pad.top && safe.top ? EDGE_INSET : 0;
  const y1 = H - 1 - (pad.bottom && safe.bottom ? EDGE_INSET : 0);
  const at = (x, y, c) => data[(y * W + x) * C + c];
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

  /** Tone and inward slope along one edge, per channel, smoothed lengthwise. */
  const profile = (along, edge, axis) => {
    const n = along.hi - along.lo + 1;
    const tone = [];
    const slope = [];
    for (let i = 0; i < n; i++) {
      const k = along.lo + i;
      const sample = (depth) => {
        const d = edge.inward * depth;
        return [0, 1, 2].map((c) =>
          axis === "x"
            ? at(clamp(edge.at + d, x0, x1), k, c)
            : at(k, clamp(edge.at + d, y0, y1), c),
        );
      };
      const near = [0, 1, 2].map((c) => (sample(0)[c] + sample(1)[c] + sample(2)[c]) / 3);
      const far = sample(SLOPE_RUN);
      tone.push(near);
      slope.push(near.map((v, c) => (far[c] - v) / SLOPE_RUN));
    }
    // Running mean along the edge.
    const smooth = (arr) =>
      arr.map((_, i) => {
        const lo = Math.max(0, i - SLOPE_SMOOTH);
        const hi = Math.min(arr.length - 1, i + SLOPE_SMOOTH);
        const acc = [0, 0, 0];
        for (let j = lo; j <= hi; j++) for (let c = 0; c < 3; c++) acc[c] += arr[j][c];
        return acc.map((v) => v / (hi - lo + 1));
      });
    return { tone: smooth(tone), slope: smooth(slope), lo: along.lo, hi: along.hi };
  };

  const damp = (d) => DAMP * (1 - Math.exp(-d / DAMP));
  const edges = {};
  if (pad.left) edges.left = profile({ lo: y0, hi: y1 }, { at: x0, inward: 1 }, "x");
  if (pad.right) edges.right = profile({ lo: y0, hi: y1 }, { at: x1, inward: -1 }, "x");
  if (pad.top) edges.top = profile({ lo: x0, hi: x1 }, { at: y0, inward: 1 }, "y");
  if (pad.bottom) edges.bottom = profile({ lo: x0, hi: x1 }, { at: y1, inward: -1 }, "y");

  const extend = (e, k, d, c) => {
    const i = clamp(k, e.lo, e.hi) - e.lo;
    return e.tone[i][c] - e.slope[i][c] * damp(d);
  };

  for (let oy = 0; oy < outH; oy++) {
    const sy = oy - pad.top;
    const cy = clamp(sy, y0, y1);
    const dy = sy < y0 ? y0 - sy : sy > y1 ? sy - y1 : 0;
    for (let ox = 0; ox < outW; ox++) {
      const sx = ox - pad.left;
      const cx = clamp(sx, x0, x1);
      const dx = sx < x0 ? x0 - sx : sx > x1 ? sx - x1 : 0;
      const to = (oy * outW + ox) * 3;
      for (let c = 0; c < 3; c++) {
        let v;
        if (!dx && !dy) v = at(cx, cy, c);
        else if (dx && !dy) v = extend(sx < x0 ? edges.left : edges.right, cy, dx, c);
        else if (!dx && dy) v = extend(sy < y0 ? edges.top : edges.bottom, cx, dy, c);
        else {
          // A corner: weight the two edges by how far out each one reaches.
          const h = extend(sx < x0 ? edges.left : edges.right, cy, dx, c);
          const w2 = extend(sy < y0 ? edges.top : edges.bottom, cx, dy, c);
          v = (h * dy + w2 * dx) / (dx + dy);
        }
        out[to + c] = clamp(Math.round(v), 0, 255);
      }
    }
  }
  return { buffer: out, width: outW, height: outH };
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
  const subject = gains ? await findSubject(file) : null;
  let win;
  if (subject) {
    win = windowFor(subject, meta);
  } else {
    // No seamless to measure, or no dish to find: the middle 85%, as before.
    let width = Math.round(meta.width * CROP);
    let height = Math.round(meta.height * CROP);
    if (width / height > ASPECT) width = Math.round(height * ASPECT);
    else height = Math.round(width / ASPECT);
    win = {
      width,
      height,
      left: Math.round((meta.width - width) / 2),
      top: Math.round((meta.height - height) / 2),
    };
    report.centreCropped.push(slug);
  }

  // How far the window runs past each edge of the photograph.
  const pad = {
    left: Math.max(0, -win.left),
    top: Math.max(0, -win.top),
    right: Math.max(0, win.left + win.width - meta.width),
    bottom: Math.max(0, win.top + win.height - meta.height),
  };
  const padded = pad.left + pad.right + pad.top + pad.bottom;
  if (padded) {
    report.extended.push(
      `${slug} (+${pad.left + pad.right}px across, +${pad.top + pad.bottom}px down)`,
    );
  }
  if (subject) {
    report.framed.push({
      slug,
      was: Math.max(subject.wFrac / ASPECT, subject.hFrac),
      window: `${win.width}x${win.height}`,
      source: `${meta.width}x${meta.height}`,
    });
    // Does the window still hold the whole dish? Anything that does not is
    // worth knowing about — a crop that takes the edge off a plate is worse
    // than the unevenness this is fixing.
    const inside =
      subject.x0 * meta.width >= win.left - 0.5 &&
      subject.x1 * meta.width <= win.left + win.width + 0.5 &&
      subject.y0 * meta.height >= win.top - 0.5 &&
      subject.y1 * meta.height <= win.top + win.height + 0.5;
    if (!inside) {
      const lost = [
        subject.x0 * meta.width < win.left ? "left" : null,
        subject.x1 * meta.width > win.left + win.width ? "right" : null,
        subject.y0 * meta.height < win.top ? "top" : null,
        subject.y1 * meta.height > win.top + win.height ? "bottom" : null,
      ].filter(Boolean);
      report.clipped.push(
        `${slug} (${lost.join(", ")}) — source ${meta.width}x${meta.height}`,
      );
    }
    if (win.capped) report.capped.push(slug);
    if (win.grown) {
      report.grown.push(
        `${slug} — source ${meta.width}x${meta.height}, window ${win.width}x${win.height}`,
      );
    }
  }

  let bytes = 0;
  for (const target of WIDTHS) {
    // White balance first, so that the neutral the seamless is mapped onto is
    // also the colour the canvas is extended with and the join is invisible.
    let pipeline = sharp(file);
    if (gains) pipeline = pipeline.linear(gains, [0, 0, 0]);
    if (padded) {
      // A side the dish reaches must not be read past, or the crop would eat
      // into the dish itself.
      const safe = subject
        ? {
            left: subject.x0 * meta.width > EDGE_INSET,
            right: subject.x1 * meta.width < meta.width - EDGE_INSET,
            top: subject.y0 * meta.height > EDGE_INSET,
            bottom: subject.y1 * meta.height < meta.height - EDGE_INSET,
          }
        : { left: false, right: false, top: false, bottom: false };
      const grown = await extendByEdge(await pipeline.toBuffer(), pad, safe);
      pipeline = sharp(grown.buffer, {
        raw: { width: grown.width, height: grown.height, channels: 3 },
      });
    }
    const out = path.join(OUT_IMAGES, `${slug}-${target}.webp`);
    const info = await pipeline
      .extract({
        left: win.left + pad.left,
        top: win.top + pad.top,
        width: win.width,
        height: win.height,
      })
      // Some source frames are narrower than the widest output, and a window
      // sized from the dish can be wider still, so a little enlargement is
      // allowed rather than emitting a file narrower than its srcset says.
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

/* ------------------------------------------------------------------ *
 * A dish identity the three languages share
 * ------------------------------------------------------------------ */

/**
 * Rows that look pairable and are not the same dish.
 *
 * Step 3 below pairs the unphotographed leftovers by position, which is right
 * almost everywhere: the three menus print the same dishes in the same order
 * within a section. It is wrong wherever a menu carries a dish the others do
 * not — the positions still line up, so nothing counts wrong, and if the two
 * happen to cost the same the price check cannot see it either.
 *
 * That is exactly the case in Arabic hot drinks: the Arabic page prints a decaf
 * espresso where English and Kurdish print Flat White
 * (docs/menu-discrepancies.md §2), on the same row, both at 10,000. Paired by
 * position, a guest who picked Flat White in English would find a decaf
 * espresso on their table in Arabic — the wrong dish, not a missing one.
 *
 * So the rows are declared here instead. Each one states the name it expects,
 * so a re-parse that shifts stops the run rather than silently pairing again.
 * A dish listed here gets a key of its own, prefixed with its language, and is
 * reported as being on only some of the menus.
 */
const UNPAIRED = {
  "ar:drinks:4:6": "اسبريسو بدون كافيين",
};

/**
 * "category:section:item" says where a dish sits in ONE language's menu. It is
 * not an identity: the three printed menus order their sections differently,
 * Kurdish swaps two food sections, and Arabic and Kurdish open their drinks
 * with mocktails. `food:6:4` is a different dish in each language.
 *
 * Anything that needs to follow a dish across a language switch — the spread —
 * needs a key that means the same dish everywhere. What already exists is the
 * photograph slug, which the mapping above aligns across the three languages at
 * build time. So the key is reconstructed from it:
 *
 *   1. Match each English section to its counterpart by the set of slugs the
 *      two share. A section with no photographs at all has no slugs to go on,
 *      so it falls back to item count and price multiset.
 *   2. Inside a matched section, match items by slug.
 *   3. Match what is left — the unphotographed dishes — by their position
 *      within the section, which is the printed order.
 *
 * Every pairing is then checked by price, and a disagreement is reported rather
 * than swallowed. The ones that remain are the eight already recorded in
 * docs/menu-discrepancies.md §1 and §2, which is the evidence that the pairing
 * is right: if the alignment were wrong, the prices would disagree in places
 * that document does not know about.
 *
 * The key itself is the dish's English coordinates. That is a label, not a
 * claim that English is primary — it just has to be one language's, and
 * English is the one whose section order the other two are matched against.
 */
function buildDishKeys(perLanguage, report) {
  const slugAt = (lang, cat, si, ii) => perLanguage[lang][key(cat, si, ii)] ?? null;
  const slugsOf = (lang, cat, si) =>
    MENUS[lang][cat].sections[si].items.map((_, ii) => slugAt(lang, cat, si, ii));

  /** language -> its own "cat:s:i" -> the shared key. */
  const keys = {};
  for (const lang of Object.keys(MENUS)) keys[lang] = {};

  for (const category of CATEGORIES) {
    const english = englishMenu[category].sections;

    for (const lang of Object.keys(MENUS)) {
      const theirs = MENUS[lang][category].sections;
      const usedSections = new Set();

      english.forEach((enSection, si) => {
        const enSlugs = slugsOf("en", category, si);
        const enSet = new Set(enSlugs.filter(Boolean));

        // 1. Which of this language's sections is this one?
        let match = -1;
        if (lang === "en") {
          match = si;
        } else {
          let best = 0;
          theirs.forEach((_, sj) => {
            if (usedSections.has(sj)) return;
            const overlap = slugsOf(lang, category, sj).filter(
              (s) => s && enSet.has(s),
            ).length;
            if (overlap > best) {
              best = overlap;
              match = sj;
            }
          });
          if (match < 0) {
            // No photograph in common: go by size and by the prices printed.
            const fingerprint = (items) =>
              items
                .map((i) => i.price)
                .sort((a, b) => a - b)
                .join(",");
            const want = fingerprint(enSection.items);
            theirs.forEach((section, sj) => {
              if (usedSections.has(sj) || match >= 0) return;
              if (
                section.items.length === enSection.items.length &&
                fingerprint(section.items) === want
              ) {
                match = sj;
              }
            });
          }
        }
        if (match < 0) {
          throw new Error(
            `No ${lang} counterpart for the English section ${category}:${si} ` +
              `"${enSection.title}". Add a photograph to it, or align it by hand.`,
          );
        }
        usedSections.add(match);

        // 2. Items by slug, then 3. the rest by printed order.
        const theirSlugs = slugsOf(lang, category, match);
        const taken = new Set();
        const paired = new Map(); // English item index -> theirs

        enSlugs.forEach((slug, ii) => {
          if (!slug) return;
          const ij = theirSlugs.findIndex((s, k) => s === slug && !taken.has(k));
          if (ij < 0) return; // no counterpart in this language; reported below
          taken.add(ij);
          paired.set(ii, ij);
        });

        /** Declared as not-the-same-dish, so it never enters positional pairing. */
        const unpairable = (l, sj, ij) => {
          const want = UNPAIRED[`${l}:${key(category, sj, ij)}`];
          if (want === undefined) return false;
          const got = MENUS[l][category].sections[sj].items[ij].name;
          if (got !== want) {
            throw new Error(
              `UNPAIRED expects "${want}" at ${l} ${key(category, sj, ij)} but the menu ` +
                `now says "${got}". Check the row before letting this through.`,
            );
          }
          return true;
        };

        const enLeft = enSlugs
          .map((_, ii) => ii)
          .filter((ii) => !paired.has(ii) && !unpairable("en", si, ii));
        const theirLeft = theirSlugs
          .map((_, ij) => ij)
          .filter((ij) => !taken.has(ij) && !unpairable(lang, match, ij));
        enLeft.forEach((ii, n) => {
          if (theirLeft[n] === undefined) return;
          paired.set(ii, theirLeft[n]);
        });

        for (const [ii, ij] of paired) {
          keys[lang][key(category, match, ij)] = key(category, si, ii);
        }
        // A declared row is nobody else's dish, so it is its own identity.
        theirSlugs.forEach((_, ij) => {
          if (unpairable(lang, match, ij)) {
            keys[lang][key(category, match, ij)] = `${lang}:${key(category, match, ij)}`;
          }
        });

        // A dish this language prints and English does not, or the reverse.
        if (enLeft.length !== theirLeft.length) {
          report.dishKeyGaps.push(
            `${category} "${enSection.title}": English has ${enSection.items.length} dishes, ` +
              `${lang} has ${theirs[match].items.length} — ` +
              `${Math.abs(enLeft.length - theirLeft.length)} cannot be paired`,
          );
        }
      });
    }
  }

  // Every pairing checked by price. A silent misalignment would show up here.
  const disagreements = [];
  const byKey = new Map();
  for (const lang of Object.keys(MENUS)) {
    for (const [slot, id] of Object.entries(keys[lang])) {
      const [cat, s, i] = slot.split(":");
      const item = MENUS[lang][cat].sections[Number(s)].items[Number(i)];
      if (!byKey.has(id)) byKey.set(id, {});
      byKey.get(id)[lang] = item;
    }
  }
  for (const [id, per] of byKey) {
    const prices = new Set(Object.values(per).map((i) => i.price));
    if (prices.size > 1) {
      disagreements.push(
        `${id} ${per.en ? per.en.name : "(no English row)"} — ` +
          Object.entries(per)
            .map(([l, i]) => `${l} ${i.price.toLocaleString("en-US")}`)
            .join(" / "),
      );
    }
  }
  report.dishKeyPrices = disagreements;
  return { keys, byKey };
}

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

function keysModuleSource(keys, onlyIn) {
  const entries = (map) =>
    Object.keys(map)
      .sort()
      .map((k) => `    "${k}": "${map[k]}",`)
      .join("\n");

  return `/**
 * GENERATED by scripts/dish-photos.mjs — do not edit by hand.
 *
 * One identity per dish, shared by all three languages.
 *
 * "category:section:item" is where a dish sits in ONE language's menu, and the
 * three menus order their sections differently — so the same coordinates mean
 * different dishes in different languages. This maps each language's own
 * coordinates to a key that means the same dish everywhere, so a guest can pick
 * a dish in one language and still have it when they switch.
 *
 * The key is the dish's English coordinates. That is a label, not a statement
 * that English is primary. It is worked out from the photograph slugs, which
 * are aligned across the languages in the same script; see the comment on
 * buildDishKeys there for how, and for why the price check is the evidence.
 *
 * Rebuild with \`npm run photos\`.
 */
import type { Language } from "@/lib/i18n";

/** A dish's identity: opaque, stable across languages, safe to persist. */
export type DishKey = string;

/** This language's own "category:section:item" -> the shared key. */
export const dishKeys: Record<Language, Readonly<Record<string, DishKey>>> = {
${Object.keys(MENUS)
  .map((language) => `  ${language}: {\n${entries(keys[language])}\n  },`)
  .join("\n")}
};

/**
 * The dishes one language prints and another does not, so a guest who picks one
 * and switches language has nothing to switch to. \`languages\` lists the
 * languages whose menu does carry it.
 */
export const dishKeysNotInEveryLanguage: Readonly<
  Record<DishKey, { readonly name: string; readonly languages: readonly Language[] }>
> = {
${onlyIn
  .map(
    (o) =>
      `  "${o.id}": { name: ${JSON.stringify(o.name)}, languages: [${o.languages
        .map((l) => `"${l}"`)
        .join(", ")}] },`,
  )
  .join("\n")}
};
`;
}

/* ------------------------------------------------------------------ *
 * Run
 * ------------------------------------------------------------------ */

if (import.meta.url === `file://${process.argv[1]}`) {
  const wantsReport = process.argv.includes("--report");
  const index = JSON.parse(fs.readFileSync(path.join(SOURCE, "index.json"), "utf8"));
  const report = {
    verdicts: [],
    dishKeyGaps: [],
    dishKeyPrices: [],
    passedThrough: [],
    corrected: [],
    framed: [],
    extended: [],
    centreCropped: [],
    capped: [],
    clipped: [],
    grown: [],
  };

  const mapping = buildMapping(index, report);

  // A source file that is neither placed nor deliberately held is a frame
  // somebody dropped in and forgot, so say so rather than ignoring it.
  const inUse = new Set(mapping.files.values());
  const stray = fs
    .readdirSync(SOURCE)
    .filter((f) => /\.jpe?g$/i.test(f))
    .filter((f) => !inUse.has(f) && !(f in HELD));
  if (stray.length) {
    throw new Error(
      `photos/dishes holds ${stray.join(", ")}, which no dish claims. Give each ` +
        `one an index.json entry, or add it to HELD with the reason it is held.`,
    );
  }
  const goneHeld = Object.keys(HELD).filter((f) => !fs.existsSync(path.join(SOURCE, f)));
  if (goneHeld.length) {
    throw new Error(`HELD names missing files: ${goneHeld.join(", ")}`);
  }

  fs.rmSync(OUT_IMAGES, { recursive: true, force: true });
  fs.mkdirSync(OUT_IMAGES, { recursive: true });

  const slugs = new Set(Object.values(mapping.perLanguage.en));
  let bytes = 0;
  for (const slug of [...slugs].sort()) {
    const file = mapping.files.get(slug);
    bytes += await processPhoto(path.join(SOURCE, file), slug, report);
  }

  fs.writeFileSync(OUT_MODULE, moduleSource(mapping));

  // The identity the spread needs: one key per dish, shared by all three.
  const { keys: dishKeys, byKey } = buildDishKeys(mapping.perLanguage, report);
  const onlyIn = [...byKey.entries()]
    .filter(([, per]) => Object.keys(per).length < Object.keys(MENUS).length)
    .map(([id, per]) => {
      const languages = Object.keys(MENUS).filter((l) => per[l]);
      return { id, name: (per.en ?? per[languages[0]]).name, languages };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(OUT_KEYS, keysModuleSource(dishKeys, onlyIn));
  report.dishKeyOnlyIn = onlyIn;

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
  if (report.framed.length) {
    const scales = report.framed.map((f) => f.was).sort((a, b) => a - b);
    console.log(
      `\n${report.framed.length} frames re-framed to a constant dish size. Before, the dish ` +
        `filled\n  between ${(scales[0] * 100).toFixed(0)}% and ${(scales[scales.length - 1] * 100).toFixed(0)}% of its frame ` +
        `(${(scales[scales.length - 1] / scales[0]).toFixed(1)}x); every card now shows it at ` +
        `${(SUBJECT_TARGET * 100).toFixed(0)}% of the phone well.`,
    );
  }
  if (report.centreCropped.length) {
    console.log(
      `\n${report.centreCropped.length} kept the centre crop — no seamless to measure, so no dish to find:`,
    );
    for (const slug of report.centreCropped) console.log(`  ${slug}`);
  }
  if (report.extended.length) {
    console.log(
      `\n${report.extended.length} were shot close enough that the frame had to be extended with the` +
        `\n  seamless neutral to bring the dish down to size:`,
    );
    for (const line of report.extended) console.log(`  ${line}`);
  }
  if (report.capped.length) {
    console.log(
      `\n${report.capped.length} could not reach the target without inventing more than ` +
        `${(MAX_EXTEND * 100).toFixed(0)}% of the\n  frame, so they keep a dish larger than the rest:`,
    );
    for (const slug of report.capped) console.log(`  ${slug}`);
  }
  if (report.grown.length) {
    console.log(
      `\n${report.grown.length} were left wider than the target rather than lose part of the dish` +
        `\n  — the dish fills too much of the frame for a 4:3 crop to close round it:`,
    );
    for (const line of report.grown) console.log(`  ${line}`);
  }
  if (report.clipped.length) {
    console.log(
      `\n${report.clipped.length} LOSE PART OF THE DISH at the edge of the window:`,
    );
    for (const line of report.clipped) console.log(`  ${line}`);
  }
  const heldFrames = Object.entries(HELD);
  if (heldFrames.length) {
    console.log(`\n${heldFrames.length} photographs held, in hand but on no card:`);
    for (const [file, why] of heldFrames) console.log(`  ${file} — ${why}`);
  }
  // The spread's dish identity. A gap here means a dish a guest can pick in one
  // language and not in another, which is a decision, not a warning to ignore.
  if (report.dishKeyOnlyIn?.length) {
    console.log(
      `\n${report.dishKeyOnlyIn.length} dishes are not on every menu, so they have ` +
        `no counterpart to\n  switch to:`,
    );
    for (const o of report.dishKeyOnlyIn) {
      console.log(`  ${o.name} — only in ${o.languages.join(", ")} (${o.id})`);
    }
  }
  if (report.dishKeyGaps?.length) {
    for (const line of report.dishKeyGaps) console.log(`  ${line}`);
  }
  if (report.dishKeyPrices?.length) {
    console.log(
      `\n${report.dishKeyPrices.length} dishes are priced differently between languages.\n` +
        `  These should be exactly what docs/menu-discrepancies.md §1 and §2 record; a\n` +
        `  dish here that is not in that document means the alignment is wrong:`,
    );
    for (const line of report.dishKeyPrices) console.log(`  ${line}`);
  }
  if (report.verdicts.length) {
    console.log(
      `\n${report.verdicts.length} identifications the shoot or the café flagged:`,
    );
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
}
