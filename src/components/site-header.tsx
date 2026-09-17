import Link from "next/link";

import { Wordmark } from "@/components/wordmark";
import type { Category, Language } from "@/lib/i18n";
import { categories, dictionaries, languageSwitchOrder } from "@/lib/i18n";

/**
 * Navy chrome at the top of every menu page: the language switch, the wordmark
 * and the three main categories.
 *
 * With exactly three languages a segmented switch is one tap where a dropdown
 * would be two, and each language is set in its own script so a Kurdish reader
 * recognises it without reading English. Both rows are ordinary links, so the
 * menu is navigable with no JavaScript at all.
 */
export function SiteHeader({
  language,
  category,
}: {
  language: Language;
  category: Category;
}) {
  const dictionary = dictionaries[language];

  return (
    <header className="bg-ink text-paper">
      <div className="flex justify-end px-3.5 pt-2 sm:px-6 sm:pt-2.5">
        <nav
          aria-label={dictionary.chooseLanguage}
          className="border-paper/22 flex overflow-hidden rounded-full border"
        >
          {languageSwitchOrder.map((code) => {
            const isCurrent = code === language;
            return (
              <Link
                key={code}
                href={`/${code}/${category}`}
                /* A guest reads one language. Prefetching the other two costs
                   them two page payloads on mobile data they will never use. */
                prefetch={false}
                hrefLang={dictionaries[code].locale}
                lang={dictionaries[code].locale}
                dir={dictionaries[code].dir}
                aria-current={isCurrent ? "true" : undefined}
                className={`px-2.5 py-1 text-[10.5px] leading-normal font-medium transition-colors sm:px-3.5 ${
                  isCurrent
                    ? "bg-paper text-ink font-semibold"
                    : "text-paper/70 hover:text-paper"
                }`}
              >
                {dictionaries[code].endonym}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex justify-center px-6 pt-3 pb-4">
        <Link href={`/${language}/${categories[0]}`} className="block">
          <Wordmark
            width="clamp(120px, 34vw, 168px)"
            label={`${dictionary.cafeName} — ${dictionary.city}`}
          />
        </Link>
      </div>

      <nav
        aria-label={dictionary.sections}
        className="border-paper/14 flex justify-center border-t"
      >
        {categories.map((item) => {
          const isCurrent = item === category;
          return (
            <Link
              key={item}
              href={`/${language}/${item}`}
              aria-current={isCurrent ? "page" : undefined}
              className={`tab-label relative px-4 py-3.5 transition-colors sm:px-6.5 ${
                isCurrent
                  ? "text-paper after:bg-paper after:absolute after:inset-x-4 after:-bottom-px after:h-0.5 after:content-[''] sm:after:inset-x-6.5"
                  : "text-paper/60 hover:text-paper/80"
              }`}
            >
              {dictionary.categoryLabels[item]}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
