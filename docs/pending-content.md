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

Two of those are worth chasing by name:

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

## 6. Photograph identifications the café has still to confirm

`photos/dishes/index.json` records a verdict per photograph, and
`npm run photos` prints the list every time it runs. Ten are flagged today —
four `corrected` (settled, kept for the record) and six `uncertain`. Three of
the six are live on the site pending an answer and are the ones to ask about:

- **Djej Msahab** — one photograph arrived with no section note. It is a plated
  whole grilled baby chicken, so it is on **Masheweh**; the Sandwiches row keeps
  the wrap frame. (The Masheweh line says "served with dill and lemon rice" and
  there is no rice in the frame.)
- **Bahamas** — the frame is a layered chocolate/vanilla pudding with chocolate
  shavings. The menu says "caramelized banana, crumble caramel, whipped cream".
  No banana and no caramel crumble are visible. Is this Bahamas, or has a
  dessert frame been mislabelled?
- **Kahweh Loubnaniyeh** — the frame is an espresso: glass cup, glass saucer,
  thick crema, the same set-up as the `espresso` and `espresso-doppio` frames.
  Lebanese coffee goes in a finjan, unfiltered, with no crema.

The other three uncertain frames — Beast Mode, Pink 75 and Tropical Storm —
were flagged by the shoot itself and are unchanged from the first delivery.

Two more, not photograph questions but in the same batch:

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
