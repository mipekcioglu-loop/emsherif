# Menu discrepancies

Found by comparing the three printed menus against each other. All of these are
differences **in the source menus**, not transcription errors — the website
reproduces each language exactly as printed, so every one of them is currently
live on the site in at least one language.

Re-run the check any time the menus change:

```bash
npm i -D pdfjs-dist && node scripts/audit-prices.mjs && npm uninstall pdfjs-dist
```

## 1. Four dishes priced differently between languages

| Dish                                                         | English | Arabic     | Kurdish    |
| ------------------------------------------------------------ | ------- | ---------- | ---------- |
| Fattet Batenjen / فتة باذنجان / فەتەی باینجان                | 12,000  | 12,000     | **12,500** |
| Kefta / كفتة / شفتەی برژاو                                   | 26,000  | 26,000     | **26,500** |
| Kibbet Lahmeh bi Laban / كبة لحم / کوبەی گۆشت بە ماست        | 31,000  | 31,000     | **24,000** |
| Fassoulya bi Lahmeh / فاصوليا باللحمة / گۆشتی بەرخ و فاسولیا | 39,000  | **34,000** | 39,000     |

The odd one out is bolded. Kibbet Lahmeh bi Laban is the largest gap: a guest
reading the Kurdish menu is quoted 7,000 IQD less than one reading English.

## 2. The Arabic hot-drinks list is shifted against its prices

English and Kurdish agree with each other. From the second row down, the Arabic
names are offset by one place, and Flat White is replaced by a decaf espresso.

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

Net effect for an Arabic-reading guest: cappuccino is 500 cheaper, café blanc
4,000 dearer, american 1,000 cheaper, doppio 2,500 cheaper — and there is no
flat white.

This one also reaches the photography. Because the Arabic names are offset
against their prices, matching photographs by row would put the doppio's
photograph on the cappuccino. `ITEM_OVERRIDES` in `scripts/dish-photos.mjs`
re-points that one section by name instead, so an Arabic-reading guest sees the
drink they are reading about. The decaf espresso, which the other two menus do
not list, has no photograph and falls back to the wordmark card.

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
