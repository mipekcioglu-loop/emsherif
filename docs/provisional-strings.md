# Arabic and Kurdish strings awaiting a native speaker

Everything in this table is **provisional**. It was written to hold the layout,
it is not approved copy, and none of it should be treated as signed off until a
native Sorani reader and a native Levantine-Arabic reader have been through it.

The same list is in the code, as `provisionalKeys` in
[`src/lib/i18n.ts`](../src/lib/i18n.ts), so nobody editing that file can mistake
these strings for the approved ones around them.

## Not on this list, and not in question

- Every dish name, description and price — from the printed menus, unchanged.
- The currency words دينار and دینار — supplied by the client.
- The category and sub-category names — carried over verbatim from the existing
  site.
- The English allergy statement — the client's approved wording, set exactly as
  supplied.

## Check this one first

`intro`, the Kurdish opening passage, is **the first thing a guest reads** and
the largest piece of unreviewed language on the site. Everything else on the
list below is a label or a placeholder; this is a paragraph in the café's voice,
set at 20-24px at the top of the page. If only one string gets a native
speaker's attention, it should be this one.

> گەرمیی میوانداریی لوبنانی لە ئێم شەریف کافێ بدۆزەرەوە، پەناگەیەکی ئارام لە دڵی شاردا. چێژ لە خواردنێک وەربگرە کە لە نەریتی خێزانییەوە وەرگیراوە و شێوازی هاوچەرخ لەگەڵ تامی ڕەسەن و نەریتە خۆشەویستەکان تێکەڵ دەکات.

**Where it came from, precisely:** the printed Kurdish menu has no opening
passage — English and Arabic both do. The client decided the Kurdish hero should
carry one rather than sit empty, and this is **a translation of the approved
Arabic passage, not copy the café supplied**. It is nobody's approved wording
yet. It goes in `dictionaries.ku.intro` in
[`src/lib/i18n.ts`](../src/lib/i18n.ts) and is listed in `provisionalKeys` like
everything below.

Two things worth putting in front of whoever reviews it:

- It follows the **English** on its closing clause. The English ends "authentic
  flavors and cherished rituals"; the Arabic ends at "أصيلة" (authentic
  flavours) with no equivalent of "cherished rituals". The Kurdish carries
  نەریتە خۆشەویستەکان, which renders the English clause. So it is fuller than
  the Arabic it was translated from — not wrong, but a choice someone made, and
  worth confirming it is the wanted one.
- Its orthography has been checked mechanically against the rest of the Kurdish
  on the site: it uses ک, ی, ێ, ۆ, ە, ڕ and ڵ throughout, with no Arabic ك or ي
  and no ة or ى. Its one ه (in هاوچەرخ) is the word-initial consonant /h/, which
  is how ku.ts spells هێلکە, هەنار and هەویری. Every Arabic-range character in it
  already appears in the generated menu. That establishes it is _typed_ like the
  rest of the menu; it says nothing about whether it _reads_ well, which is what
  a native speaker is for.

## The list

| Key                            | What it is                 | Arabic                                                                                                                                                       | Kurdish (Sorani)                                                                                                                                                                                                     |
| ------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intro` (Kurdish only)         | Hero opening passage       | _not provisional — the printed menu's own words_                                                                                                             | گەرمیی میوانداریی لوبنانی لە ئێم شەریف کافێ بدۆزەرەوە، پەناگەیەکی ئارام لە دڵی شاردا. چێژ لە خواردنێک وەربگرە کە لە نەریتی خێزانییەوە وەرگیراوە و شێوازی هاوچەرخ لەگەڵ تامی ڕەسەن و نەریتە خۆشەویستەکان تێکەڵ دەکات. |
| `allergyLabel` + `allergyBody` | Allergy statement          | تنويه بشأن الحساسية: قد تحتوي أصناف القائمة على القمح أو البيض أو الفول السوداني أو الحليب، أو قد تلامسها. لمزيد من المعلومات، يُرجى التحدث إلى أحد المدراء. | ئاگادارکردنەوەی هەستیاری: خواردنەکانی لیست لەوانەیە گەنم، هێلکە، فستقی زەوی و شیریان تێدابێت یان بەریان کەوتبێت. بۆ زانیاری زیاتر، تکایە قسە لەگەڵ بەڕێوەبەرێک بکە.                                                  |
| `venueLink`                    | ⓘ venue-info link          | العنوان وساعات العمل والواي فاي                                                                                                                              | ناونیشان، کاتەکان و وایفای                                                                                                                                                                                           |
| `venueHeading`                 | Venue-info heading         | معلومات المقهى                                                                                                                                               | زانیاری کافێ                                                                                                                                                                                                         |
| `venueLabels`                  | Venue-info field labels    | العنوان · ساعات العمل · الهاتف · واي فاي                                                                                                                     | ناونیشان · کاتژمێری کارکردن · تەلەفۆن · وایفای                                                                                                                                                                       |
| `venuePending`                 | Venue-info placeholder tag | نص مؤقت · بانتظار محتوى العميل                                                                                                                               | دەقی کاتی · چاوەڕوانی ناوەڕۆکی کڕیار                                                                                                                                                                                 |
| `venuePlaceholders`            | The four placeholder lines | [ الشارع والمنطقة والمدينة — بانتظار النص ] etc.                                                                                                             | [ شەقام، گەڕەک و شار — چاوەڕوانی دەق ] etc.                                                                                                                                                                          |
| `allFilter`                    | "All" filter chip          | الكل                                                                                                                                                         | هەموو                                                                                                                                                                                                                |
| `search`                       | Search placeholder         | ابحث في القائمة                                                                                                                                              | گەڕان لە لیستدا                                                                                                                                                                                                      |
| `searchNoResults`              | Empty search result        | لا توجد أصناف مطابقة.                                                                                                                                        | هیچ خواردنێک نەدۆزرایەوە.                                                                                                                                                                                            |
| `searchClear`                  | Clear-search label         | مسح البحث                                                                                                                                                    | سڕینەوەی گەڕان                                                                                                                                                                                                       |
| `footerLinks`                  | Footer links ×4            | اتصل بنا · من نحن · موقع إم شريف · المدونة                                                                                                                   | پەیوەندیمان پێوە بکە · ئێمە کێین · ماڵپەڕی ئێم شەریف · بلۆگەکان                                                                                                                                                      |
| `backToTop`                    | Back-to-top label          | العودة إلى الأعلى                                                                                                                                            | گەڕانەوە بۆ سەرەوە                                                                                                                                                                                                   |
| `loadingMore`                  | Loading-more announcement  | جارٍ تحميل المزيد                                                                                                                                            | بارکردنی خواردنی زیاتر                                                                                                                                                                                               |
| `close`                        | Close the venue sheet      | إغلاق                                                                                                                                                        | داخستن                                                                                                                                                                                                               |

### Where they came from

`intro` (Kurdish only) is the translation described above, added later than the
rest and on the client's instruction. Arabic `intro` is not on this list at all
— it is the printed menu's own words.

The Arabic and Kurdish in the first eleven rows are the designer's own, set out
in the handover table of the approved mockup. The last four —
`searchNoResults`, `backToTop`, `loadingMore`, `close` — and the four Kurdish
`venuePlaceholders` are not in the mockup at all; the build needs them, so they
were written to the same standard and are just as provisional. The copyright
line is assembled from `cafeName` and `city`, which are on the same footing.
