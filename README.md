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

## How it is put together

```
src/
  app/
    page.tsx               "/"                  language picker
    [lang]/page.tsx        "/en"                opening passage + section picker
    [lang]/[category]      "/en/food"           the menu itself
  components/
    menu-sections.tsx      the menu rendering
    section-image.tsx      the photograph each section opens with
    ui/logo.tsx            the wordmark
  lib/
    i18n.ts                languages, direction, UI strings, price formatting
    menu/{en,ku,ar}.ts     the three menus, as data
    menu/index.ts          the registry and section photography
scripts/
  menu-from-pdf.mjs        regenerates ar.ts and ku.ts from the printed PDFs
  audit-prices.mjs         compares the three menus against each other
  make-logo.mjs            regenerates the wordmark asset
docs/
  menu-discrepancies.md    where the printed menus disagree
```

### Photography

The printed menu opens Food, Sweets and Drinks with a photograph. Those pages
are cropped out of the menu scans into `public/sections/` and shown at the top
of each category at their own proportions. The Kurdish and Arabic booklets
carry fewer of these than the English one, so all three languages share the
English set rather than leaving a language visually thinner.

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

The PDF fonts have three quirks the script repairs: the lam-alef ligature comes
out with its letters transposed, some dal glyphs are emitted as zero-width
overlays, and a few Kurdish letters are mapped onto Arabic lookalikes. Each
repair is an explicit, commented list rather than a blanket rule.

### Checking the menu

`scripts/audit-prices.mjs` compares the three printed menus against each other
and reports every disagreement. It currently finds four dishes priced
differently between languages, and the Arabic hot-drinks list is shifted
against its prices. These are faults **in the printed menus**, so the site
reproduces each language exactly as printed and the conflicts are written up in
[docs/menu-discrepancies.md](docs/menu-discrepancies.md) for the café to
resolve.

### Right-to-left

Kurdish and Arabic set `dir="rtl"` on the page, which mirrors the layout. The
UI strings for all three languages come from `src/lib/i18n.ts` and were carried
over verbatim from the previous site, so the approved wording is unchanged.

Prices are deliberately formatted with `en-US` grouping in every language: the
printed Arabic and Kurdish menus both set prices in Western digits, and an
`ar`/`ckb` locale would render them as Arabic-Indic numerals instead.

### Brand

Taken from the printed menu: navy `#183f67` on ivory `#fffff5`, Cormorant
Garamond for display and Inter for body text. The colours are declared once in
`src/app/globals.css` under `@theme` and used as `text-ink` / `bg-paper`, so a
change lands in one place.

The wordmark (`public/em-sherif-cafe-logo.png`) is cut from the cover page of
the printed menu and recoloured to navy on transparency by
`scripts/make-logo.mjs`. It is served with `unoptimized` because it is flat
line art: Next's re-encode shifted the ivory by one 8-bit step, which showed as
a faint box against the page.

## Outstanding work

- **Resolve the menu conflicts** in [docs/menu-discrepancies.md](docs/menu-discrepancies.md).
  Four dishes carry different prices in different languages and the Arabic
  hot-drinks list is misaligned; those are live on the site today because the
  site reproduces each language as printed.
- **Have a native speaker read the Kurdish and Arabic pages.** The text comes
  from the PDFs rather than from retyping, so the wording is the approved
  wording, but the font repairs above are worth a second pair of eyes.
- **Kurdish opening passage** — English and Arabic both open with a short
  welcome; there is no Kurdish equivalent in the approved menu, so that
  language currently starts at the sections.
- **Café details** — address, opening hours, phone and social links are not on
  the site at all yet.
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
an image `src`, and nor does a plain `<a href>`. Anything of that kind must go
through `withBasePath` from `src/lib/site-url.ts` or it will 404 on Pages.
`npm run build:static` reproduces the Pages build locally.

Any ordinary Node host also works, from the default build — nothing in the app
is specific to Pages.

The repository needs three settings for this to work, already in place:
Pages **Source** set to _GitHub Actions_, workflow permissions set to _read and
write_, and no deployment-branch restriction on the `github-pages`
environment.
