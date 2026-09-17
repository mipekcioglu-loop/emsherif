/**
 * Regenerates the two wordmark assets:
 *
 *   public/em-sherif-cafe-logo.png   the master, navy line art on transparency
 *   public/wordmark-mask.png         the copy the site actually loads
 *
 * Cuts the Em Sherif Café wordmark out of the printed menu's cover page and
 * re-renders it as navy line art on a transparent background, so the wordmark
 * sits on any background instead of carrying the cover's paper colour with it.
 *
 * The site never places the wordmark as a picture; it paints it through a CSS
 * mask, which uses only the alpha channel and is never drawn wider than 210px.
 * The master is 774px and 53KB, which is 53KB every guest on mobile data pays
 * for, so a 400px palettised copy is written alongside it — indistinguishable
 * at 3x on a phone, a third of the bytes. Keep the two in step by running this
 * script rather than replacing either by hand.
 *
 *   npm run logo
 */
import sharp from "sharp";

const SRC = "public/menu-pages/en/page-01.webp";
const OUT = "public/em-sherif-cafe-logo.png";
const MASK_OUT = "public/wordmark-mask.png";
/** Wider than the wordmark is ever drawn (210px), allowing for a 2x screen. */
const MASK_WIDTH = 400;
const INK = [0x18, 0x3f, 0x67];
const BBOX = { left: 476, top: 773, width: 238, height: 137 };
const PAD = 10;
const SCALE = 3;
/** Alpha at or below this is background noise from the lossy source. */
const NOISE_FLOOR = 6;

(async () => {
  const { data, info } = await sharp(SRC)
    .extract({
      left: BBOX.left - PAD,
      top: BBOX.top - PAD,
      width: BBOX.width + PAD * 2,
      height: BBOX.height + PAD * 2,
    })
    .resize({ width: (BBOX.width + PAD * 2) * SCALE, kernel: "lanczos3" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const lum = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  let minL = 255;
  let maxL = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const l = lum(i);
    if (l < minL) minL = l;
    if (l > maxL) maxL = l;
  }

  const out = Buffer.alloc(info.width * info.height * 4);
  for (let p = 0; p < info.width * info.height; p++) {
    const i = p * info.channels;
    const ratio = (maxL - lum(i)) / (maxL - minL);
    let alpha = Math.round(Math.max(0, Math.min(1, ratio)) * 255);
    if (alpha <= NOISE_FLOOR) alpha = 0;
    out[p * 4] = INK[0];
    out[p * 4 + 1] = INK[1];
    out[p * 4 + 2] = INK[2];
    out[p * 4 + 3] = alpha;
  }

  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9, palette: true, colours: 64 })
    .toFile(OUT);

  const mask = await sharp(OUT)
    .resize(MASK_WIDTH)
    .png({ compressionLevel: 9, palette: true, colours: 32, effort: 10 })
    .toFile(MASK_OUT);

  console.log(`wrote ${OUT} at ${info.width}x${info.height}`);
  console.log(
    `wrote ${MASK_OUT} at ${mask.width}x${mask.height}, ${(mask.size / 1024).toFixed(1)} KB`,
  );
})();
