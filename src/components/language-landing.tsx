import Link from "next/link";

import { Wordmark } from "@/components/wordmark";
import type { Language } from "@/lib/i18n";
import { categories, dictionaries, languages } from "@/lib/i18n";
import { routeHref } from "@/lib/site-url";

/**
 * What a guest lands on before the menu itself: "/" and "/en".
 *
 * The menu carries its own language switch, so there is no reason to make
 * someone choose before they can read anything — this page sends them straight
 * to the menu with a refresh, which a static file host can do and a redirect
 * rule cannot. The three languages are on the page as real links so that the
 * page is never a dead end if the refresh is blocked or slow.
 */
export function LanguageLanding({ language }: { language?: Language }) {
  const target = `/${language ?? languages[0]}/${categories[0]}`;
  const dictionary = dictionaries[language ?? languages[0]];

  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${routeHref(target)}`} />
      <main className="flex min-h-dvh flex-col items-center justify-center gap-10 px-6 py-14 text-center">
        <Wordmark
          width="min(210px, 60vw)"
          className="text-ink"
          label={dictionary.cafeName}
        />

        <nav
          aria-label={dictionary.chooseLanguage}
          className="grid w-full max-w-xs gap-2.5"
        >
          {languages.map((code) => (
            <Link
              key={code}
              href={`/${code}/${categories[0]}`}
              hrefLang={dictionaries[code].locale}
              lang={dictionaries[code].locale}
              dir={dictionaries[code].dir}
              className="border-ink/30 hover:bg-ink hover:text-paper flex min-h-13 items-center justify-center border px-3 text-sm font-semibold tracking-[0.1em] uppercase transition-colors"
            >
              {dictionaries[code].endonym}
            </Link>
          ))}
        </nav>
      </main>
    </>
  );
}
