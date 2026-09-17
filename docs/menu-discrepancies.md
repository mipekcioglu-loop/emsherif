# Menu discrepancies

Found by comparing the three printed menus against each other. All of these are
differences **in the source menus**, not transcription errors.

The website reproduces each language exactly as printed, so every one of these
is currently live on the site in at least one language. That is deliberate: the
rule in `CLAUDE.md` is that menu content matches the printed menus exactly and
that disagreements between them are recorded here rather than reconciled.

**This was reconsidered once, and the rule was upheld** — see "The decision that
was taken and reversed" below, so the same ground is not covered again from
scratch.

Re-run the check any time the menus change:

```bash
npm i -D pdfjs-dist && node scripts/audit-prices.mjs && npm uninstall pdfjs-dist
```

## There is no earlier document to go back to

The obvious question about everything below is whether some original settles it.
It does not, and this has been checked rather than assumed.

The client supplied a combined document early on — "Em Sherif Cafe Erbil
Combined Menu EN KU AR", 38 pages — which the build has never used; we built
from the three per-language PDFs in `public/menus/`. **It is the same document.**
The three PDFs are extracts of it:

- Its 38 pages are the English 15, then Kurdish, then Arabic. Every one of those
  38 pages is identical to the corresponding page of the per-language PDF —
  identical text runs at identical coordinates, to a tenth of a point. The only
  pages the per-language files have that the combined does not are two blank
  Kurdish spacers carrying no text at all.
- The three per-language PDFs report `pypdf` as their producer; the combined
  reports none. They were cut out of it by a script.
- Running this project's own parser over the combined document and over the
  three PDFs and comparing every dish it finds — name and price — gives
  **384 dishes compared, 0 differences.**

So the combined document reproduces every disagreement below, exactly. Each of
the four prices in §1 was also read straight off its page in the combined file
by position — name and price as they physically sit on the same line, without
going through the parser — and matches. There is no third reading to prefer and
no earlier version to defer to.

**That makes every conflict below the café's to settle, not ours.** Two of the
three menus agreeing is not evidence; it is two against one on a document where
all three were typeset together. Guessing here means quoting a guest a price
the kitchen will not honour.

## 1. Four dishes priced differently between languages

| Dish                                                          | English | Arabic     | Kurdish    |
| ------------------------------------------------------------- | ------- | ---------- | ---------- |
| Fattet Batenjen / فتة باذنجان / فەتەی باینجان                 | 12,000  | 12,000     | **12,500** |
| Kefta / كفتة / شفتەی برژاو                                    | 26,000  | 26,000     | **26,500** |
| Kibbet Lahmeh bi Laban / كبة لحمة باللبن / کوبەی گۆشت بە ماست | 31,000  | 31,000     | **24,000** |
| Fassoulya bi Lahmeh / فاصوليا باللحمة / گۆشتی بەرخ و فاسولیا  | 39,000  | **34,000** | 39,000     |

The odd one out is bolded. All four are in the combined document too, at the
same values — see above — so no document could settle them.

All four are in the combined document too, at the same values — see above — so
no document can settle them. **They are open**, the site reproduces each
language as printed, and only the café can say which figure a guest should be
charged.

Kibbet Lahmeh bi Laban is the largest gap: a guest reading the Kurdish menu is
quoted 7,000 IQD less than one reading English, for the same dish at the same
table. The straight question to put to the café is four lines long: for each
dish, which price is right, and should the other languages be corrected to it?

## 2. The Arabic hot-drinks list is shifted against its prices

English and Kurdish agree with each other. From the second row down, the Arabic
names are offset by one place, and Flat White is replaced by a decaf espresso.

**This is printed, not a parsing fault of ours** — worth stating plainly,
because it is the obvious thing to suspect. The rows were read off the page by
position, name and price as they physically sit on the same line, without going
through `scripts/menu-from-pdf.mjs`. All three languages print the same price
column, top to bottom: 7,000 · 9,500 · 10,000 · 10,000 · 6,000 · 7,000 ·
10,000 · 7,000 · 8,000. English and Kurdish list their drinks in the same order
against it; the Arabic page does not. `كابوتشينو` genuinely sits on the 9,500
line. The parser pairs every name with the price on its own line, exactly as
printed, so there is nothing here that is ours to fix.

| #   | English / Kurdish        | Arabic                                      |
| --- | ------------------------ | ------------------------------------------- |
| 1   | Espresso 7,000           | اسبرسو 7,000                                |
| 2   | Espresso Doppio 9,500    | كابوتشينو (cappuccino) 9,500                |
| 3   | Cappuccino 10,000        | كافيه لاتيه (café latte) 10,000             |
| 4   | Café Latte 10,000        | قهوة بيضاء (café blanc) 10,000              |
| 5   | Café Blanc 6,000         | قهوة أمريكان (american) 6,000               |
| 6   | American Coffee 7,000    | اسبريسو دوبيو (doppio) 7,000                |
| 7   | Flat White 10,000        | اسبريسو بدون كافيين (decaf espresso) 10,000 |
| 8   | Kahweh Loubnaniyeh 7,000 | قهوة لبنانية 7,000                          |
| 9   | Tea Selection 8,000      | شاي 8,000                                   |

The effect is that four drinks cost something different depending on which menu
a guest reads: against the Arabic page a cappuccino is 500 cheaper, a café blanc
4,000 dearer, an american 1,000 cheaper and a doppio 2,500 cheaper.

**This is open too.** Four drinks cost something different depending on which
menu a guest reads:

| Drink           | Printed en / ku | Printed ar | Gap                        |
| --------------- | --------------- | ---------- | -------------------------- |
| Espresso Doppio | 9,500           | 7,000      | 2,500 cheaper in Arabic    |
| Cappuccino      | 10,000          | 9,500      | 500 cheaper in Arabic      |
| Café Blanc      | 6,000           | 10,000     | **4,000 dearer in Arabic** |
| American Coffee | 7,000           | 6,000      | 1,000 cheaper in Arabic    |

Espresso, Café Latte, Kahweh Loubnaniyeh and Tea Selection land on the same
price in every language and are not in question. Flat White is a separate
matter again: the Arabic page has a decaf espresso on that row, which is a
difference in the drinks list rather than in a price.

This one is not a choice between two figures per drink the way §1 is. The
Arabic page prices a doppio the same as a single espresso and makes café blanc
dearer than a cappuccino, which reads more like a column that slipped during
typesetting than a price list. Asking the café which figure is right, drink by
drink, may get a confusing answer; asking them to confirm the Arabic page's
drink order and prices as a whole is probably the better question.

### It still reaches the photography, for a different reason

`ITEM_OVERRIDES` in `scripts/dish-photos.mjs` re-points this one section by name
so an Arabic-reading guest sees the drink they are reading about. That is still
needed, but no longer because of the prices — those now agree. It is needed
because the Arabic page lists its drinks in a different order, so its fourth row
is not the fourth English drink, and matching photographs by row would put the
doppio's cup on the cappuccino. The decaf espresso, which the other two menus do
not list, has no photograph and falls back to the wordmark card.

## The decision that was taken and reversed

**17 September 2026.** §1 and §2 were put to the client, who decided that the
Arabic page should be authoritative and that all three languages should carry
its figures. That was implemented, and then reversed: asked whether the rule in
`CLAUDE.md` — menu content matches the printed menus exactly — should be amended
to accommodate it, the client chose to keep the rule. So the prices are back to
what each language's own page prints, and §1 and §2 are open again.

This is recorded rather than deleted so the same ground is not covered twice. If
it is reopened, these are the values that were agreed and then withdrawn:

| Dish or drink          | Printed en | Printed ar | Printed ku | Proposed for all three |
| ---------------------- | ---------- | ---------- | ---------- | ---------------------- |
| Fattet Batenjen        | 12,000     | 12,000     | 12,500     | 12,000                 |
| Kefta                  | 26,000     | 26,000     | 26,500     | 26,000                 |
| Kibbet Lahmeh bi Laban | 31,000     | 31,000     | 24,000     | 31,000                 |
| Fassoulya bi Lahmeh    | 39,000     | 34,000     | 39,000     | 34,000                 |
| Espresso Doppio        | 9,500      | 7,000      | 9,500      | 7,000                  |
| Cappuccino             | 10,000     | 9,500      | 10,000     | 9,500                  |
| Café Blanc             | 6,000      | 10,000     | 6,000      | 10,000                 |
| American Coffee        | 7,000      | 6,000      | 7,000      | 6,000                  |

Two things were worth noting at the time and would be again:

- **Fassoulya bi Lahmeh** was the only food price that moved English and Kurdish
  _down_, 39,000 to 34,000 — a guest reading either page would have been charged
  5,000 IQD less than the menu in their hand said.
- **Café Blanc** was the largest single move of the eight: 6,000 to 10,000 for
  English and Kurdish readers, a 67% rise that would have turned the cheapest
  coffee on the menu into the joint dearest.

Mechanically it was four Kurdish and one English price in §1, and four of each
in §2 — thirteen values across eight dishes, with Arabic never changing, since
the proposal was to adopt its figures. Kurdish went through a `CLIENT_PRICES`
map in `scripts/menu-from-pdf.mjs` keyed by position and asserting the printed
value it replaced; English was edited directly in `src/lib/menu/en.ts`. Both are
removed. The commit is in the branch history if the detail is ever wanted.

## 3. Two grills share a name in English only

The English menu lists **LAHMEH MECHWIYEH** twice, at 29,000 and 36,000. Arabic
and Kurdish both disambiguate — لحمة مشوية (بقري) / (غنم) and
گۆشتی برژاو (گۆلك) / (بەرخ), i.e. beef and lamb. Only the descriptions tell
them apart in English.

## 4. Halloumi is described differently

English says _sesame_; Arabic says عسل (_honey_). Kurdish follows the English.

## 5. Section order differs between languages

- **Food.** The Arabic pages run back-to-front in the source PDF: Mains first,
  Furn last. Kurdish is also right-to-left and does _not_ do this, so it is
  treated as an export artefact and the Arabic sections are presented in the
  same order as English and Kurdish. To restore the printed order instead, set
  `reverseFood: false` for `ar` in `scripts/menu-from-pdf.mjs` and regenerate.
- **Drinks.** English opens with soft drinks; Arabic and Kurdish both open with
  mocktails. Since the two agree with each other this is not an artefact, so
  each language keeps its own printed order.
- **Mezze.** English lists cold before hot; Kurdish lists hot before cold.

## 6. Kurdish has no opening passage

English and Arabic both open with a short welcome. There is no Kurdish
equivalent in the approved menu, so that language starts at the sections.

## 7. Corrections the café sent after the menus were printed

The café reviewed the live site and sent corrections. They are the authority on
their own menu, so where a correction and the printed PDF disagree, the
correction wins and the PDF is out of date. These are applied in
`CAFE_NAMES` in `scripts/menu-from-pdf.mjs` — after parsing, so `ar.ts` and
`ku.ts` stay generated — and each one is keyed by position and states the text
it expects to replace, so the run stops rather than rewriting the wrong dish.

| Dish                   | Language | Printed | Café            |
| ---------------------- | -------- | ------- | --------------- |
| Kibbet Lahmeh bi Laban | ar       | كبة لحم | كبة لحمة باللبن |
| Musakhan               | ku       | مسخەن   | مسەخەن          |

The Arabic printed name drops "bi laban" altogether; the café's form matches the
English and the Kurdish. Note that this dish is also §1's largest price gap.

They also corrected two photographs, which do not touch the menu text: the frame
shipped as Fattet Maftoul is Kibbet Lahmeh bi Laban, and Musakhan and Mini
Lahmeh bi Ajeen had each other's. Both are fixed in `photos/dishes/index.json`,
and the café has since sent a Fattet Maftoul photograph to fill the slot the
first of those emptied.

Four further name spellings are still with the café and are **not** applied;
`docs/pending-content.md` §7 lists them. Two photographs they have confirmed do
not match the dish on the card — the Bahamas frame against its printed
description, the Kahweh Loubnaniyeh frame against what Lebanese coffee looks
like. The café's word settles both; §6 there records why they were queried.
