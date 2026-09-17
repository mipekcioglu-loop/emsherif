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
 * is the beef and the lamb skewers under one name in English, and the café has
 * since confirmed the one frame stands for both, so it goes to both rows.
 * Value is the 0-based occurrence, in English menu order, that keeps the photo,
 * or a list of them where one photograph serves more than one printing.
 */
const DUPLICATE_NAMES = {
  "Shawarma Lahmeh": 1, // Sandwiches, not the Hot Mezze plate
  "Shawarma Djej": 1, // Sandwiches
  "Djej Msahab": 0, // Sandwiches, not the Masheweh plate
  "Batata Mekliyeh": 0, // Hot Mezze — the frame has no coleslaw
  "Lahmeh Mechwiyeh": [0, 1], // Masheweh, beef and lamb — one frame for both
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
      const keepers = DUPLICATE_NAMES[slot.name];
      if (keepers === undefined) {
        throw new Error(
          `"${slot.name}" is printed ${counts.get(slot.name)} times and has one ` +
            `photograph. Add it to DUPLICATE_NAMES to say which one it belongs to.`,
        );
      }
      if (![keepers].flat().includes(slot.occurrence)) continue;
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
async function findSubject(file) {
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

function windowFor(subject, meta) {
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
 * Extends a frame outwards by continuing its own edge.
 *
 * Not sharp's `extendWith: "copy"`, which repeats the outermost pixel exactly:
 * five of these frames have something dark sitting in one corner — the lip of
 * the backdrop, most likely — and repeating that one pixel paints a solid
 * block across the whole corner. Not a flat fill either, because the seamless
 * is vignetted and darkens towards its edges, so any single colour meets it
 * at a visible band.
 *
 * Instead each edge line is median-filtered along its length and that is what
 * gets repeated. The median follows the vignette but ignores a stray dark
 * pixel, so the extension continues the paper rather than the blemish.
 */
const EDGE_DEPTH = 3; // rows sampled inwards
const EDGE_RUN = 9; // pixels sampled along the edge
/**
 * How far inside the frame to read the edge from. Several frames have a dark
 * lip in the outermost row or two — the bottom of the backdrop — and
 * repeating that paints a grey band. The outer few pixels are read past, and
 * overwritten with what is just inside them, but only on a side the dish does
 * not reach: nothing that could be food is painted over.
 */
const EDGE_INSET = 4;

async function extendByEdge(buffer, pad, safe) {
  const { data, info } = await sharp(buffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const outW = W + pad.left + pad.right;
  const outH = H + pad.top + pad.bottom;
  const out = Buffer.alloc(outW * outH * 3);

  // The rectangle the photograph is read from: pulled in on any side that is
  // being extended and that the dish does not reach.
  const in0x = pad.left && safe.left ? EDGE_INSET : 0;
  const in1x = W - 1 - (pad.right && safe.right ? EDGE_INSET : 0);
  const in0y = pad.top && safe.top ? EDGE_INSET : 0;
  const in1y = H - 1 - (pad.bottom && safe.bottom ? EDGE_INSET : 0);

  const at = (x, y, c) => data[(y * W + x) * C + c];
  /** Median of a patch running along an edge, for one channel. */
  const edgeMedian = (x, y, c, horizontal) => {
    const v = [];
    for (let d = 0; d < EDGE_DEPTH; d++) {
      for (let k = -EDGE_RUN; k <= EDGE_RUN; k++) {
        const xx = horizontal
          ? Math.min(W - 1, Math.max(0, x + k))
          : Math.min(W - 1, Math.max(0, x + (x === 0 ? d : -d)));
        const yy = horizontal
          ? Math.min(H - 1, Math.max(0, y + (y === 0 ? d : -d)))
          : Math.min(H - 1, Math.max(0, y + k));
        v.push(at(xx, yy, c));
      }
    }
    v.sort((a, b) => a - b);
    return v[v.length >> 1];
  };

  // Precompute the four smoothed edges once, read at the inset boundary.
  const lines = { left: [], right: [], top: [], bottom: [] };
  for (let y = 0; y < H; y++) {
    lines.left.push([0, 1, 2].map((c) => edgeMedian(in0x, y, c, false)));
    lines.right.push([0, 1, 2].map((c) => edgeMedian(in1x, y, c, false)));
  }
  for (let x = 0; x < W; x++) {
    lines.top.push([0, 1, 2].map((c) => edgeMedian(x, in0y, c, true)));
    lines.bottom.push([0, 1, 2].map((c) => edgeMedian(x, in1y, c, true)));
  }

  for (let oy = 0; oy < outH; oy++) {
    const sy = oy - pad.top;
    const cy = Math.min(in1y, Math.max(in0y, sy));
    for (let ox = 0; ox < outW; ox++) {
      const sx = ox - pad.left;
      const cx = Math.min(in1x, Math.max(in0x, sx));
      const i = (oy * outW + ox) * 3;
      const outsideX = sx !== cx;
      const outsideY = sy !== cy;
      for (let c = 0; c < 3; c++) {
        let v;
        if (!outsideX && !outsideY) v = at(cx, cy, c);
        else if (outsideX && !outsideY) v = (sx < 0 ? lines.left : lines.right)[cy][c];
        else if (!outsideX && outsideY) v = (sy < 0 ? lines.top : lines.bottom)[cx][c];
        else {
          // A corner: the average of the two edges that meet there.
          const h = (sx < 0 ? lines.left : lines.right)[cy][c];
          const v2 = (sy < 0 ? lines.top : lines.bottom)[cx][c];
          v = Math.round((h + v2) / 2);
        }
        out[i + c] = v;
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
const report = {
  verdicts: [],
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
      `\n  — these are the frames that are not 4:3, so a card cannot match them:`,
  );
  for (const line of report.grown) console.log(`  ${line}`);
}
if (report.clipped.length) {
  console.log(
    `\n${report.clipped.length} LOSE PART OF THE DISH at the edge of the window:`,
  );
  for (const line of report.clipped) console.log(`  ${line}`);
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
