# Em Sherif

Marketing website for the Em Sherif restaurant group.

## Stack

| Concern   | Choice                                      |
| --------- | ------------------------------------------- |
| Framework | Next.js 16 (App Router, React 19)           |
| Language  | TypeScript (strict)                         |
| Styling   | Tailwind CSS v4 with brand tokens           |
| Quality   | ESLint, Prettier, `tsc --noEmit`            |
| CI        | GitHub Actions (`.github/workflows/ci.yml`) |

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

## Project structure

```
src/
  app/                 App Router routes; one folder per page
    layout.tsx         Root layout: fonts, metadata, header/footer
    globals.css        Tailwind import + brand design tokens
    robots.ts          Generated /robots.txt
    sitemap.ts         Generated /sitemap.xml
  components/
    layout/            Site-wide chrome (header, footer)
    ui/                Reusable presentational primitives
  lib/
    site.ts            Site metadata, navigation, venue data
```

### Design tokens

Brand colours and typefaces are declared once in `src/app/globals.css` under
`@theme`, which makes them available as Tailwind utilities:

- `burgundy`, `burgundy-light` — primary brand colour
- `gold`, `gold-light` — accent
- `cream`, `ink` — page background and body text
- `font-display` (Cormorant Garamond), `font-body` (Inter)

Use the semantic names rather than raw hex values so a rebrand stays a one-file change.

## Content sources

All copy currently in the repo is **placeholder** and marked as such on each page.
Before launch the following need confirmed, approved content:

- Brand narrative and founder story (`/about`)
- Menus, per venue (`/menus`)
- Venue addresses, opening hours and phone numbers (`src/lib/site.ts`)
- Reservation provider and its credentials (`/reservations`)
- Photography and an `og-image` for social sharing

## Open decisions

- **Content management** — copy and menus are hard-coded in `src/lib/site.ts`
  today. If editors need to update them, plug in a CMS or a database-backed
  admin before building more pages.
- **Reservations** — no booking provider is integrated yet.
- **Languages** — the site is English-only; Arabic/French would need
  `next-intl` or the App Router's `[locale]` segment.

## Deployment

Any Node host works. Vercel needs no configuration beyond `NEXT_PUBLIC_SITE_URL`.
Set the variables from `.env.example` in the hosting provider before the first deploy.
