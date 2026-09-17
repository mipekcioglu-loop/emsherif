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

## The list

| Key                            | What it is                 | Arabic                                                                                                                                                       | Kurdish (Sorani)                                                                                                                                                    |
| ------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allergyLabel` + `allergyBody` | Allergy statement          | تنويه بشأن الحساسية: قد تحتوي أصناف القائمة على القمح أو البيض أو الفول السوداني أو الحليب، أو قد تلامسها. لمزيد من المعلومات، يُرجى التحدث إلى أحد المدراء. | ئاگادارکردنەوەی هەستیاری: خواردنەکانی لیست لەوانەیە گەنم، هێلکە، فستقی زەوی و شیریان تێدابێت یان بەریان کەوتبێت. بۆ زانیاری زیاتر، تکایە قسە لەگەڵ بەڕێوەبەرێک بکە. |
| `venueLink`                    | ⓘ venue-info link          | العنوان وساعات العمل والواي فاي                                                                                                                              | ناونیشان، کاتەکان و وایفای                                                                                                                                          |
| `venueHeading`                 | Venue-info heading         | معلومات المقهى                                                                                                                                               | زانیاری کافێ                                                                                                                                                        |
| `venueLabels`                  | Venue-info field labels    | العنوان · ساعات العمل · الهاتف · واي فاي                                                                                                                     | ناونیشان · کاتژمێری کارکردن · تەلەفۆن · وایفای                                                                                                                      |
| `venuePending`                 | Venue-info placeholder tag | نص مؤقت · بانتظار محتوى العميل                                                                                                                               | دەقی کاتی · چاوەڕوانی ناوەڕۆکی کڕیار                                                                                                                                |
| `venuePlaceholders`            | The four placeholder lines | [ الشارع والمنطقة والمدينة — بانتظار النص ] etc.                                                                                                             | [ شەقام، گەڕەک و شار — چاوەڕوانی دەق ] etc.                                                                                                                         |
| `allFilter`                    | "All" filter chip          | الكل                                                                                                                                                         | هەموو                                                                                                                                                               |
| `search`                       | Search placeholder         | ابحث في القائمة                                                                                                                                              | گەڕان لە لیستدا                                                                                                                                                     |
| `searchNoResults`              | Empty search result        | لا توجد أصناف مطابقة.                                                                                                                                        | هیچ خواردنێک نەدۆزرایەوە.                                                                                                                                           |
| `searchClear`                  | Clear-search label         | مسح البحث                                                                                                                                                    | سڕینەوەی گەڕان                                                                                                                                                      |
| `footerLinks`                  | Footer links ×4            | اتصل بنا · من نحن · موقع إم شريف · المدونة                                                                                                                   | پەیوەندیمان پێوە بکە · ئێمە کێین · ماڵپەڕی ئێم شەریف · بلۆگەکان                                                                                                     |
| `backToTop`                    | Back-to-top label          | العودة إلى الأعلى                                                                                                                                            | گەڕانەوە بۆ سەرەوە                                                                                                                                                  |
| `loadingMore`                  | Loading-more announcement  | جارٍ تحميل المزيد                                                                                                                                            | بارکردنی خواردنی زیاتر                                                                                                                                              |
| `close`                        | Close the venue sheet      | إغلاق                                                                                                                                                        | داخستن                                                                                                                                                              |

### Where they came from

The Arabic and Kurdish in the first eleven rows are the designer's own, set out
in the handover table of the approved mockup. The last four —
`searchNoResults`, `backToTop`, `loadingMore`, `close` — and the four Kurdish
`venuePlaceholders` are not in the mockup at all; the build needs them, so they
were written to the same standard and are just as provisional. The copyright
line is assembled from `cafeName` and `city`, which are on the same footing.
