@AGENTS.md

# Em Sherif — project notes

## Conventions

- Brand colours and typefaces live in `src/app/globals.css` under `@theme`.
  Use the semantic Tailwind utilities (`bg-burgundy`, `text-gold`, `font-display`)
  — never raw hex values in components.
- Site copy, navigation and venue data live in `src/lib/site.ts`, not inline in
  components, so they can later move to a CMS without touching presentation.
- Server Components by default. Add `"use client"` only where interactivity
  genuinely requires it (currently just `site-header.tsx`).
- Interior pages open with `<PageHeader>` and use `<Section>` for body content.

## Before pushing

```bash
npm run format && npm run lint && npm run typecheck && npm run build
```

CI runs the same four checks.

## Content status

Every page currently carries placeholder copy, labelled as such. See the
"Content sources" section of the README for what still needs real content.
