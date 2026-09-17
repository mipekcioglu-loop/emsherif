# Em Sherif Café Erbil — menu

The digital menu for Em Sherif Café Erbil, in English, Kurdish and Arabic.
Rebuilt from the previous static site as a Next.js app.

**Live: https://mipekcioglu-loop.github.io/emsherif/**

## Stack

| Concern   | Choice                                      |
| --------- | ------------------------------------------- |
| Framework | Next.js 16 (App Router, React 19)           |
| Language  | TypeScript (strict)                         |
| Styling   | Tailwind CSS v4 with brand tokens           |
| Quality   | ESLint, Prettier, `tsc --noEmit`            |
| CI        | GitHub Actions (`.github/workflows/ci.yml`) |

Every route is statically prerendered, so the site can be served from a CDN.

## Getting started

Requires Node 20.9+ (`.nvmrc` pins 22).

```bash
git clone https://github.com/mipekcioglu-loop/emsherif.git
cd emsherif
npm install
cp .env.example .env.local
npm run dev
```

The site runs at http://localhost:3000.

## Scripts

| Script                 | Purpose                       |
| ---------------------- | ----------------------------- |
| `npm run dev`          | Development server            |
| `npm run build`        | Production build              |
| `npm run start`        | Serve the production build    |
| `npm run lint`         | ESLint                        |
| `npm run lint:fix`     | ESLint with autofix           |
| `npm run typecheck`    | TypeScript, no emit           |
| `npm run format`       | Prettier write                |
| `npm run format:check` | Prettier check (CI uses this) |
| `npm run photos`       | Rebuild the dish photography  |
| `npm run logo`         | Rebuild the wordmark assets   |

## How it is put together

```
src/
  app/
    page.tsx               "/"                  sends the guest to the menu
    [lang]/page.tsx        "/en"                sends the guest to /en/food
    [lang]/[category]      "/en/food"           the menu itself
  components/
    site-header.tsx        navy chrome: language switch, wordmark, main tabs
    menu-hero.tsx          opening passage, search, ⓘ, allergy statement
    menu-browser.tsx       sticky filter rail, the card grid, scroll pagination
    dish-card.tsx          one dish: photograph, name, description, price
    venue-info.tsx         address / hours / telephone / wi-fi, placeholders
    venue-sheet.tsx        the sheet the ⓘ opens
    site-footer.tsx        venue block, the four links, copyright
    back-to-top.tsx        the floating control
    wordmark.tsx           the wordmark, painted through a CSS mask
  lib/
    i18n.ts                languages, direction, UI strings, price formatting
    links.ts               where the footer links go
    menu/{en,ku,ar}.ts     the three menus, as data
    menu/photos.ts         generated: which photograph belongs to which dish
    menu/index.ts          the registry, and dishes paired with photographs
photos/dishes/             the photographs as delivered, plus index.json
scripts/
  dish-photos.mjs          white-balances and crops the photographs
  menu-from-pdf.mjs        regenerates ar.ts and ku.ts from the printed PDFs
  audit-prices.mjs         compares the three menus against each other
  make-logo.mjs            regenerates the wordmark assets
docs/
  menu-discrepancies.md    where the printed menus disagree
  provisional-strings.md   Arabic and Kurdish awaiting a native speaker
  pending-content.md       what the café still owes the site
  contrast.md              every text colour, measured in a browser
```

## The page

One page per language and category, all nine prerendered. A guest scans the QR
code at the table, lands on the menu, and everything they need is on it: the
language switch and the three main categories in the navy header, the
sub-category filter on a sticky rail, and the dishes as cards three to a row.

Almost every visitor is on a phone, on mobile data, so the first screen is kept
to around 375 KB over the wire — one document, the two Latin faces, the CSS, the
framework, and only the photographs actually on screen. The Arabic faces are not
preloaded, so an English guest never pays for them.

### Photography

`photos/dishes/` holds the 99 photographs as the shoot delivered them, and
`npm run photos` turns them into what the grid serves:

```bash
npm run photos              # rebuild public/dishes and src/lib/menu/photos.ts
npm run photos -- --report  # ... and print every white-balance measurement
```

It reads the menus straight out of the TypeScript they live in, so it needs the
Node 22 that `.nvmrc` pins rather than the 20.9 floor in `package.json`. CI never
runs it; the output it writes is committed.

**White balance is a build step, not a flourish.** The dishes are shot top-down
on a pale seamless, but the seamless is a different white in nearly every frame
— the cast across the set runs from R−B = −28 (cool blue) to +48 (pink), and
three of those side by side in one row look careless. The script measures the
background of each frame and maps it onto one warm neutral, the same warm
neutral as the empty photo well. A frame whose border is too dark or too busy to
be a seamless — one salad is shot on a wooden table, with other dishes in
frame — is left alone rather than wrecked, and the run says which ones those
were.

Each photograph is then centre-cropped to the middle 85% and to 4:3, and written
as WebP at 340px and 540px: 99 photographs, 2.1 MB in total, about 11 KB each.
The card well crops further to 3:2 on a phone, so two whole cards land in view
instead of one and a half.

**The dish → photograph mapping is generated, not looked up at runtime.**
`src/lib/menu/photos.ts` is written by the same script and keyed by where a dish
sits in its own language's menu, because the three printed menus order their
sections differently and one of them (see below) prints its hot drinks against
the wrong prices. Doing that alignment once at build time keeps it out of the
app and under review in one file.

**28 of the 128 dishes have no photograph.** Those cards keep the photo well and
fill it with the wordmark, debossed at 17% on an ivory-to-navy wash — quiet on
purpose, so an unphotographed dish never outshouts a photographed one.

### The wordmark

The site never places the wordmark as a picture; it paints it, using the logo as
a CSS mask filled with `currentColor`. One asset gives the ivory mark on the
navy header, the navy mark in a card and the debossed mark on a dish without a
photograph. `public/wordmark-mask.png` is a 400px palettised copy of the master
`public/em-sherif-cafe-logo.png` — indistinguishable at 3× on a phone and a
third of the bytes. `npm run logo` writes both; do not replace either by hand.

### The menu is text, not page scans

All three languages are structured data — 128 dishes across 16 sections each —
so the menu reflows on a phone, works with screen readers and can be indexed,
instead of being A4 page images a guest has to pinch-zoom.

The Kurdish and Arabic files are **generated, not hand-typed**. The printed
PDFs carry a real text layer, and `scripts/menu-from-pdf.mjs` reads it, so the
dish names, descriptions and prices on the site are the approved wording
character for character:

```bash
npm i -D pdfjs-dist && node scripts/menu-from-pdf.mjs && npm run format
npm uninstall pdfjs-dist
```

Do not edit `src/lib/menu/ar.ts` or `ku.ts` by hand — regenerate them.
`src/lib/menu/en.ts` is hand-written but was verified against the same text
layer, item for item.

The PDF fonts have four quirks the script repairs, and where a quirk can be
recognised from the page rather than from a list of known-bad words, it is:

- **A word is split across runs** wherever a glyph needs its own run, usually
  at a diacritic — "لَبنة" arrives as "ل" + "َبنة". `joinRow()` measures the
  distance between runs and rejoins them. The measurement is safe because the
  distances are bimodal: nothing inside a line of type exceeds 0.95em and
  nothing between two columns is under 4.79em. A run that opens with a
  combining mark is always a continuation, whatever the distance.
- **Some dal glyphs are zero-width overlays** on the run they follow. The
  cmap's spurious shadda is dropped; a combining mark left leading the run is
  put back after its letter, which is where Unicode requires it.
- **The lam-alef ligature is transposed.** With a hamza-bearing alef this is
  unambiguous and is repaired by rule. With a bare alef it is not — that is
  also how the Arabic definite article is spelled, and 96 Arabic words here
  have that shape while only 11 are broken — so those stay an exact-match list,
  and the script now reports any entry in it that stopped matching.
- **Kurdish letters are mapped onto Arabic lookalikes.** Kaf and yeh are
  unconditional. Heh is not: the font sets both the vowel ە and a real /h/ as
  the same codepoint, and the surrounding letters do not tell them apart —
  سرکهی needs the vowel and ڕاهیب needs the consonant, with the same heh before
  the same yeh. So every word in the corpus carrying a heh is classified
  explicitly, and an unknown one stops the run rather than being guessed at.

### Checking the menu

`scripts/audit-prices.mjs` compares the three printed menus against each other
and reports every disagreement. It currently finds four dishes priced
differently between languages, and the Arabic hot-drinks list is shifted
against its prices. These are faults **in the printed menus**, so the site
reproduces each language exactly as printed and the conflicts are written up in
[docs/menu-discrepancies.md](docs/menu-discrepancies.md) for the café to
resolve.

### Right-to-left is a layout, not a mirror

Kurdish and Arabic set `dir="rtl"`, and the page is built from logical
properties, so the filter pills scroll in from the right, the price lockup
flips, and the back-to-top button moves to the bottom left on its own. What does
not come for free is the type: letterspaced capitals are a Latin device, so
every eyebrow, tab and currency label drops its tracking, drops the case change
and lifts a size in Arabic and Kurdish. Those rules live together at the bottom
of `src/app/globals.css` rather than scattered through the components.

The UI strings come from `src/lib/i18n.ts`. The ones carried over from the
previous site are the approved wording, unchanged; the ones this design added
are provisional and listed in
[docs/provisional-strings.md](docs/provisional-strings.md).

Prices are deliberately formatted with `en-US` grouping in every language: the
printed Arabic and Kurdish menus both set prices in Western digits, and an
`ar`/`ckb` locale would render them as Arabic-Indic numerals instead. The
currency word sits directly after the amount as one lockup, reversed by
direction alone — never by a bidi override.

### It works without JavaScript

Everything is rendered on the server, so a guest whose JavaScript never arrives
gets the whole category — every section, every dish, every price. What
JavaScript adds is layered on top of markup that already works:

| With JavaScript                            | Without                                           |
| ------------------------------------------ | ------------------------------------------------- |
| Filter pills filter the grid in place      | They are links to the sections below              |
| Cards past the first screen load on scroll | All of them are already there                     |
| The ⓘ opens the venue sheet                | It jumps to the same block in the footer          |
| Search narrows the grid                    | The field is disabled, not a box that eats typing |
| Back-to-top appears once you have scrolled | It is simply always there                         |

This is also why scroll pagination cannot break the static export: it holds back
markup the browser already has rather than fetching more.

### Brand

Taken from the printed menu: navy `#183f67` on ivory `#fffff5`, Cormorant
Garamond for display and Inter for body text. The colours are declared once in
`src/app/globals.css` under `@theme` and used as `text-ink` / `bg-paper`, so a
change lands in one place.

Everything else on the page is an opacity of the navy, and where those
opacities carry text they are not free choices: `text-ink/72` on the paper and
`text-paper/60` on the navy are the floor, measured at 4.85:1 and 4.95:1 in
Chromium against a 4.5:1 bar. The whole audit — all three languages, both
widths, and the two things deliberately left below the line — is in
[docs/contrast.md](docs/contrast.md). Read it before lightening any text.

Type is Cormorant Garamond for dish names, section headings, the filter pills
and the footer links, at 500–600 only; Inter for descriptions, prices, tabs and
eyebrows. Arabic and Kurdish take Noto Naskh Arabic where the Latin takes the
serif and Noto Sans Arabic where it takes the sans.

The wordmark is cut from the cover page of the printed menu and recoloured to
navy on transparency by `scripts/make-logo.mjs`; see **The wordmark** above for
how it is used and why there are two files.

## Outstanding work

- **Resolve the menu conflicts** in [docs/menu-discrepancies.md](docs/menu-discrepancies.md).
  Four dishes carry different prices in different languages and the Arabic
  hot-drinks list is misaligned; those are live on the site today because the
  site reproduces each language as printed.
- **Have a native speaker read the Kurdish and Arabic.** Two separate jobs: the
  menu text itself, which comes from the PDFs rather than from retyping but
  whose font repairs are worth a second pair of eyes; and the interface strings
  this design added, which are **not approved copy at all** and are listed in
  [docs/provisional-strings.md](docs/provisional-strings.md).
- **Kurdish opening passage** — English and Arabic both open with a short
  welcome; there is no Kurdish equivalent in the approved menu, so the Kurdish
  hero carries the eyebrow and the utility column without a passage.
- **Everything in [docs/pending-content.md](docs/pending-content.md)** — the
  venue details, three of the four footer URLs, 28 unphotographed dishes, and
  two questions about which dish a photograph belongs to.
- **Favicon and share image** still need the brand versions.

## Deployment

Every push to `main` publishes to GitHub Pages via
`.github/workflows/pages.yml`. There is nothing to run by hand; a deploy takes
about 40 seconds.

Pages serves the site from a repository subpath, so that build sets
`STATIC_EXPORT=true`, which switches `next.config.ts` to a static export with
`basePath` and unoptimized images. `NEXT_PUBLIC_BASE_PATH` and
`NEXT_PUBLIC_SITE_URL` come from the `configure-pages` step, so the sitemap and
share tags match wherever Pages puts the site.

Because the export is unoptimized, next/image does not prefix `basePath` onto
an image `src`, and nor does a plain `<a href>`, a CSS mask URL or the refresh
on the landing pages. Anything of that kind must go through `withBasePath` or
`routeHref` from `src/lib/site-url.ts` or it will 404 on Pages.
`npm run build:static` reproduces the Pages build locally — serve `out/` from a
subpath, not from the root, or the basePath will look wrong.

The dish photographs are served as a plain `<img>` with an explicit `srcset`
rather than through next/image: they are already cropped and emitted at the two
widths the grid asks for, and next/image would either re-encode finished work
or, in the export, drop `basePath` from the `src`.

Any ordinary Node host also works, from the default build — nothing in the app
is specific to Pages.

The repository needs three settings for this to work, already in place:
Pages **Source** set to _GitHub Actions_, workflow permissions set to _read and
write_, and no deployment-branch restriction on the `github-pages`
environment.
