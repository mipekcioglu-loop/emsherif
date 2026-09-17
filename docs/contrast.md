# Text contrast

Every run of text on the menu, measured in Chromium against the two brand
tokens. The target is WCAG 2.2 AA: **4.5:1**, which is the bar for all of this
text — none of it reaches the 24px, or 18.66px bold, that would let it down to
3:1, and it is smaller still in Arabic and Kurdish.

## How this was measured

Not from the stylesheet. Tailwind emits these colours as
`color-mix(in oklab, var(--color-ink) 72%, transparent)`, and
`getComputedStyle().color` hands that back as `oklab(… / 0.72)` — reading digits
out of that string produces nonsense. Each colour is instead painted onto a 2D
canvas over its own composited background and the pixel read back, which gives
true sRGB after alpha compositing whatever the source space.

Measured across **three languages × two viewports (390px, 1200px) × four UI
states** — default, search with hits, search with no hits, and the venue sheet
open, because the section kicker, the empty-state line and the sheet only exist
in those states.

**The ratios are identical in all six language/viewport combinations**, because
an opacity of the ink over the paper is the same colour whatever is set in it.
What changes between languages is the type — Arabic and Kurdish swap in Noto at
different sizes — and that only matters for which threshold applies. It never
lifts anything here into the large-text bracket, so 4.5:1 governs throughout.

## The scale

| Token           | On    | Ratio   | Used for                                  |
| --------------- | ----- | ------- | ----------------------------------------- |
| `text-ink/72`   | paper | 4.85:1  | the floor for running text and fine print |
| `text-ink/78`   | paper | 5.70:1  | a label sitting on its own body           |
| `text-ink/88`   | paper | 7.60:1  | the opening passage                       |
| `text-ink`      | paper | 10.73:1 | dish names, prices, section headings      |
| `text-paper/60` | navy  | 4.95:1  | the floor for text in the navy chrome     |
| `text-paper/70` | navy  | 6.13:1  | footer links, the venue heading           |
| `text-paper`    | navy  | 10.73:1 | the active tab and chip                   |

Hierarchy is held by size, weight and family rather than by tone alone, so
raising the floor does not flatten it: the currency is still 5px smaller than
the amount beside it, a description is still 12.5px Inter under a 22px
Cormorant dish name, and the active tab and chip keep their ivory fill and
underline.

## What changed

| Element                 | Token                   | Before | After |
| ----------------------- | ----------------------- | ------ | ----- |
| Price currency          | `text-ink/45` → `/72`   | 2.43   | 4.85  |
| Dish description        | `text-ink/62` → `/72`   | 3.66   | 4.85  |
| Card section kicker     | `text-ink/28` → `/72`   | 1.66   | 4.85  |
| Filter chip, inactive   | `text-ink/62` → `/72`   | 3.66   | 4.85  |
| Category menu link      | `text-ink/62` → `/72`   | 3.66   | 4.85  |
| Hero eyebrow (city)     | `text-ink/45` → `/72`   | 2.43   | 4.85  |
| Venue link (ⓘ)          | `text-ink/62` → `/72`   | 3.66   | 4.85  |
| Allergy statement, body | `text-ink/70` → `/72`   | 4.58   | 4.85  |
| No-results message      | `text-ink/62` → `/72`   | 3.66   | 4.85  |
| Search placeholder      | `text-ink/45` → `/72`   | 2.41   | 4.74  |
| Search clear (×)        | `text-ink/45` → `/72`   | 2.41   | 4.74  |
| Header tab, inactive    | `text-paper/45` → `/60` | 3.48   | 4.95  |
| Venue field label       | `text-paper/45` → `/60` | 3.48   | 4.95  |
| Venue field value       | `text-paper/45` → `/60` | 3.48   | 4.95  |
| Venue "placeholder" tag | `text-paper/45` → `/60` | 3.48   | 4.95  |
| Venue sheet close       | `text-paper/45` → `/60` | 3.48   | 4.95  |
| Footer copyright        | `text-paper/45` → `/60` | 3.48   | 4.95  |

The search placeholder and clear button land slightly lower than the rest of
the `/72` group because they sit on the field's own 2% ink tint rather than on
bare paper.

Already passing, unchanged: the opening passage (7.60), the allergy label
(5.70), footer links and the venue heading (6.13), dish names, prices, section
headings and the active tab and chip (10.73).

## Deliberately left below 4.5:1

- **The section tally** — the dish count trailing each section rule —
  `text-ink/28`, **1.66:1**. It is a count of cards that are immediately below
  it and countable; nothing is lost by not reading it. Raising it to the floor
  would put a numeral at the same presence as the section label it trails. If
  the café would rather have it legible, it is a one-token change, and the size
  should come down a point to compensate.
- **The ⓘ glyph** in front of the venue link — `opacity-75` over `text-ink/72`,
  **3.01:1**, lifted from 1.91:1. It is `aria-hidden` ornament in front of a
  text label that carries the meaning at 4.85:1, so 1.4.3 does not apply to it;
  3:1 is the non-text bar and it clears that.

## Not covered

- **Non-text contrast (WCAG 1.4.11)** was not audited. Card and field borders
  sit at `border-ink/15` and the loader dots at 22% ink. The search field's own
  border is the arguable one, since it is what identifies the control.
- The sticky rail is `bg-paper/93` with a backdrop blur. Measured against the
  paper behind it, which is what a guest sees except in the moment a card is
  scrolling under it.

## Re-measuring

There is no contrast check in CI and no Playwright in the project's
dependencies, so this is a manual audit, not a guard. To redo it, run the site
(`npm run build && npm run start`) and drive it with Playwright, compositing on
canvas as described above rather than parsing `getComputedStyle().color`.
