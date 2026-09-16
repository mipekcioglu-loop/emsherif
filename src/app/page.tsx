import Link from "next/link";

import { Logo } from "@/components/ui/logo";
import { dictionaries, languages } from "@/lib/i18n";

export default function LanguagePickerPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center px-6 pt-14 pb-12 text-center">
      <Logo priority />

      <p className="eyebrow mt-14">Welcome</p>
      <h1 className="font-display mt-3 text-4xl">Select your language</h1>
      <p className="mt-3 text-sm">Choose a language to browse the menu.</p>

      <nav aria-label="Language" className="mt-8 grid w-full max-w-sm gap-2.5">
        {languages.map((language) => {
          const dictionary = dictionaries[language];
          return (
            <Link
              key={language}
              href={`/${language}`}
              lang={dictionary.locale}
              dir={dictionary.dir}
              className="border-ink/30 hover:bg-ink hover:text-paper flex min-h-14 items-center justify-center border px-3 text-sm font-semibold tracking-[0.1em] uppercase transition-colors"
            >
              {dictionary.endonym}
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
