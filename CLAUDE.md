@AGENTS.md

# Em Sherif Café Erbil — project notes

A trilingual digital menu (English, Kurdish, Arabic). Read the README first —
it explains the two content shapes and why Kurdish and Arabic are still scans.

## Conventions

- Brand colours live in `src/app/globals.css` under `@theme`. Use `text-ink`,
  `bg-paper` and `font-display` — never raw hex in components.
- All copy and menu data lives in `src/lib/`, never inline in components.
- Translated UI strings were carried over verbatim from the previous site. Do
  not reword the Kurdish or Arabic strings without a native speaker.
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
