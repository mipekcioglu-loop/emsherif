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

## 4. Photographs for 29 dishes

99 of the 128 dishes have a photograph. The other 29 show the debossed wordmark
card, which is a designed state rather than a gap, so this is not urgent — but
the list is worth having when the café next books a shoot:

Man'ousheh Zaatar · Beyd Ouyoun · Beyd Makhfouk · Beyd Soujouk · Beyd Omelette ·
Beyd bi Kawarma · Beyd Shakshouka · Kale Freekeh · Sahen Kabis · Hummus Lahmeh ·
Hummus Soujouk · Hummus Shawarma · Foul · Kibbet Lahmeh bi Laban · Bahamas ·
Mineral Water — Large · Mineral Water — Small · Seven Up Diet · Pepsi ·
Non-Alcoholic Beer · Mouassal · Ice Tea Peach · Ice Tea Lemon ·
Kahweh Loubnaniyeh · plus the second printing of Shawarma Lahmeh, Shawarma Djej,
Djej Msahab, Batata Mekliyeh and Lahmeh Mechwiyeh (see below).

## 5. Two photography questions for the café

Both are decisions the build had to make to place the 99 photographs, and both
are one line in `DUPLICATE_NAMES` in
[`scripts/dish-photos.mjs`](../scripts/dish-photos.mjs) if the café disagrees.

- **Five dish names are printed twice, in two sections, with one photograph
  between them.** The photographs settle four of them: the shawarma and msahab
  frames are wraps on a plate, so they went to the sandwich rather than the
  mezze plate; the fries are served plain with ketchup and no coleslaw, so they
  went to the mezze rather than the sandwich.
- **`Lahmeh Mechwiyeh` is beef at 29,000 and lamb at 36,000**, one name in
  English, and the frame does not say which it is. It is on the first of the
  two, as printed. Someone at the café can tell in a second.

## 6. Eight photographs the shoot itself was unsure of

`photos/dishes/index.json` records a verdict per photograph. Seven are marked
`uncertain` and one `corrected`, and all eight are live on the site:

Mini Lahmeh bi Ajeen | 3 pcs · Musakhan · Fattet Maftoul · Pepsi Diet ·
Beast Mode · Pink 75 · Tropical Storm · Flat White

`npm run photos` prints the list every time it runs.
