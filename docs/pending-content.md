# Content the café still owes the site

Each of these is built and visible — the slot is there, marked as a placeholder,
so it is obvious to everyone (including the client) what is missing. None of it
is a code change beyond dropping the real words in.

## 1. Venue details — address, opening hours, telephone, wi-fi

**Where:** the ⓘ in the hero opens them as a sheet, and the same block sits in
the footer. **What to edit:** `venuePlaceholders` in
[`src/lib/i18n.ts`](../src/lib/i18n.ts), for all three languages, and delete the
`venuePending` tag and its markup in
[`src/components/venue-info.tsx`](../src/components/venue-info.tsx) once the
fields are real.

Today every field reads `[ … — to be supplied ]` inside a dashed rule, under a
"Placeholder · content pending from client" tag.

## 2. Three of the four footer URLs

**Where:** [`src/lib/links.ts`](../src/lib/links.ts).

The brief supplied one URL, https://emsherif.com, for "Em Sherif website".
"Contact Us", "Who We Are" and "Blogs" were named but never given an address, so
rather than guess a path that might 404 all three point at the site root. Each
is one line to fix.

## 3. A native read of the Arabic and Kurdish interface strings

See [provisional-strings.md](./provisional-strings.md). The menu itself — every
dish name, description and price — is not affected: that comes from the printed
menus and is unchanged.

## 4. Photographs for 17 dishes

111 of the 128 dishes carry a photograph, out of 110 frames — the Lahmeh
Mechwiyeh frame serves both of its rows. The other 17 show the debossed wordmark
card, which is a designed state rather than a gap, so this is not urgent — but
the list is worth having when the café next books a shoot:

Beyd Ouyoun · Beyd Makhfouk · Beyd Soujouk · Beyd Omelette · Beyd bi Kawarma ·
Beyd Shakshouka (the café says the six egg dishes are not shot yet) ·
**Fattet Maftoul** · Sahen Kabis · Hummus Shawarma · Foul ·
Mineral Water — Large · Seven Up Diet · Pepsi · Non-Alcoholic Beer · Mouassal ·
Ice Tea Peach · Ice Tea Lemon.

Two of those are not waiting on a shoot:

- **Fattet Maftoul** was photographed and is now empty, because the frame that
  shipped under that name turned out to be Kibbet Lahmeh bi Laban. The café
  captioned a Fattet Maftoul photograph in their last batch but did not send the
  file. **Request it.**
- **اسبريسو بدون كافيين**, the decaf espresso, is an Arabic-only row
  (`ar drinks:4:6`) that has never had a photograph. The café captioned one and
  did not send it either. It does not appear in the list above because English
  has no such row — see [menu-discrepancies.md](./menu-discrepancies.md) §2.

## 5. Photography questions the café has answered

- **Five dish names are printed twice, in two sections.** Four of them now have
  a frame for each printing: the café sent the Hot Mezze platters for the two
  shawarmas, the Masheweh plate for Djej Msahab and the sandwich for Batata
  Mekliyeh, alongside the wraps and plain fries already shipped. The fifth,
  `Lahmeh Mechwiyeh`, is beef at 29,000 and lamb at 36,000 under one English
  name and the café confirmed the one frame stands for both, so both rows carry
  it. `DUPLICATE_NAMES` in [`scripts/dish-photos.mjs`](../scripts/dish-photos.mjs)
  records which frame belongs to which printing.
- **Fattet Maftoul's photograph is Kibbet Lahmeh bi Laban**, and **Musakhan and
  Mini Lahmeh bi Ajeen had each other's**. Both corrected.

## 6. Photograph identifications

### Closed by the café, against what the frame looks like

Two frames were held off the site because the dish in the picture did not match
the dish on the card. The café has since confirmed both, so both are live. **The
question is recorded rather than deleted**: what they show has not changed, and
nobody should reopen it or "fix" the mapping on the strength of looking at the
picture.

- **Bahamas** — the frame is a layered chocolate and vanilla pudding with thick
  chocolate shavings, in a glass jar on a steel saucer. The menu says
  "caramelized banana, crumble caramel, whipped cream": there is no banana and no
  caramel crumble in it. The café confirms it is Bahamas. If the printed
  description and the dish disagree, that is theirs to reconcile, not ours.
  Carried in `index.json` as `confirmed-against-description`.
- **Kahweh Loubnaniyeh** — the frame is an espresso: glass cup, glass saucer, a
  thick crema band, the same set-up as the `espresso` and `espresso-doppio`
  frames. Lebanese coffee is served in a finjan, unfiltered, with no crema. The
  café confirms it is the frame they want on قهوة لبنانية. Carried as
  `confirmed-against-appearance`. A guest scrolling Hot Beverages will see four
  near-identical glass cups; that is the café's call and they have made it.

Both verdicts print on every `npm run photos`, which is what keeps the question
recorded instead of rediscovered.

### Live, pending one confirmation

- **Djej Msahab** — the name is printed twice and one photograph arrived with no
  section note. It is a plated whole grilled baby chicken, so it is on
  **Masheweh**; the Sandwiches row keeps its wrap frame. (Minor: the Masheweh
  line says "served with dill and lemon rice" and there is no rice in the
  frame.) Marked `uncertain` until the café confirms.

### Flagged by the shoot, unchanged

`photos/dishes/index.json` records a verdict per photograph and `npm run photos`
prints every one that is not a plain `confirmed`. Ten are flagged today: four
`corrected`, two `confirmed-against-…`, and four `uncertain` — Djej Msahab
above, plus Beast Mode, Pink 75 and Tropical Storm, which came flagged in the
first delivery and are unchanged.

### Holding a frame back

Nothing is held today, and `HELD` in
[`scripts/dish-photos.mjs`](../scripts/dish-photos.mjs) is empty — which is the
normal state, not dead code. To hold a frame, name its file there with the
reason and take it out of `index.json`; the run prints whatever is held, and
**refuses to run** if a photograph in `photos/dishes/` is neither placed nor
held. That is what stops a frame being dropped in and quietly forgotten. The
file itself never leaves the repository, so putting one back never means asking
the café to send it again — which is exactly how Bahamas and Kahweh Loubnaniyeh
came back.

### Two more from the same batch, not photograph identifications

- **The can captioned "pepsi"** is a Pepsi Zero Sugar can, which is the frame
  already used for `Pepsi Zero`. Plain `Pepsi` has no photograph. Showing the
  zero-sugar can on plain Pepsi needs a yes first.
- **Flat White vs decaf espresso.** English and Kurdish list Flat White and no
  decaf; Arabic lists the decaf and no Flat White. The café sent a photograph
  captioned for each. Which is it?

## 7. Name spellings the café sent that are not applied

Four spellings in the café's last batch are held rather than applied, because
each looks like phone typing rather than a menu decision. They need one word
from the café — or a native speaker — before they go live:

| Dish                   | Language | On the site        | Café sent          | Why held                                                         |
| ---------------------- | -------- | ------------------ | ------------------ | ---------------------------------------------------------------- |
| Kibbet Lahmeh bi Laban | ku       | کوبەی گۆشت بە ماست | کەبەی گۆشت بە ماست | This menu spells kibbeh کوبە everywhere else in its own Kurdish. |
| Man'ousheh Zaatar      | ar       | منقوشة زعتر        | منقوشة الزعت       | الزعت is not a word; the final ر looks dropped.                  |
| Salata Arabiyeh        | ar       | سلطة عربية         | سلطه عربيه         | Both taa marbutas typed as plain ه.                              |
| Djej Msahab            | ku       | مریشکی موسەحەب     | مریشکی مۆسحەب      | Differs in the vowel only, from one informal caption.            |

The two corrections that **were** applied are in
[menu-discrepancies.md](./menu-discrepancies.md) §7.
