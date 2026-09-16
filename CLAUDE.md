@AGENTS.md

# Em Sherif Café Erbil — project notes

A trilingual digital menu (English, Kurdish, Arabic) for guests who scan a QR
code at the table. Read the README first — in particular, `src/lib/menu/ar.ts`
and `ku.ts` are generated from the printed PDFs and must never be hand-edited.

## Conventions

- Brand colours live in `src/app/globals.css` under `@theme`. Use `text-ink`,
  `bg-paper` and `font-display` — never raw hex in components.
- All copy and menu data lives in `src/lib/`, never inline in components.
- Translated UI strings were carried over verbatim from the previous site. Do
  not reword the Kurdish or Arabic strings without a native speaker.
- Menu content must match the printed menus exactly — never reword, shorten or
  "fix" a dish name, description or price. Where the printed menus disagree
  with each other, record it in docs/menu-discrepancies.md instead.
- Regenerate ar.ts / ku.ts with `scripts/menu-from-pdf.mjs`, then re-run
  `scripts/audit-prices.mjs`. Both need `pdfjs-dist` installed ad hoc.
- Category order is Food, Sweets, Drinks, per the client brief.
- Prices format with `formatPrice` from `src/lib/i18n.ts`. It is pinned to
  Western digits on purpose; see the README.
- Server Components throughout. Nothing currently needs `"use client"`.
- Every route is statically prerendered — keep `generateStaticParams` in step
  with `languages` and `categories`.

## Before pushing

```bash
npm run format && npm run lint && npm run typecheck && npm run build
```

CI runs the same four checks.
