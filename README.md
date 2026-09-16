# Em Sherif Café Erbil — menu

The digital menu for Em Sherif Café Erbil, in English, Kurdish and Arabic.
Rebuilt from the previous static site as a Next.js app.

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
    [lang]/page.tsx        "/en"                category picker
    [lang]/[category]      "/en/food"           the menu itself
  components/
    menu-sections.tsx      structured menu rendering
    menu-pages.tsx         scanned-page rendering (see below)
    ui/logo.tsx            the wordmark
  lib/
    i18n.ts                languages, direction, UI strings, price formatting
    menu/en.ts             the English menu, as data
    menu/index.ts          which content each language/category resolves to
scripts/
  make-logo.mjs            regenerates the wordmark asset
```

### Two ways a menu can be served

`src/lib/menu/types.ts` defines a category as **either** structured text
(`kind: "sections"`) **or** scans of the printed pages (`kind: "pages"`). The
page component renders whichever it is handed, so a language can be upgraded
from scans to text without touching any component.

- **English** is structured text: it reflows on a phone, is readable by screen
  readers, and can be indexed by search engines.
- **Kurdish and Arabic** are still the scanned pages carried over from the old
  site — see "Outstanding work".

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

- **Transcribe the Kurdish and Arabic menus** into `src/lib/menu/ku.ts` and
  `ar.ts`, matching the shape of `en.ts`, then swap them into the registry in
  `src/lib/menu/index.ts`. They should be typed up or proof-read by someone who
  reads the language — prices especially. Until then both languages fall back
  to the page scans, exactly as the old site did.
- **Confirm the English transcription** against the current printed menu,
  particularly prices, before this goes in front of guests.
- **Café details** — address, opening hours, phone and social links are not on
  the site at all yet.
- **Favicon and share image** still need the brand versions.

## Deployment

Any Node host works, and `output: "export"` would also produce a plain static
bundle. Set `NEXT_PUBLIC_SITE_URL` in the hosting provider before the first
deploy so canonical URLs and the sitemap are right.
