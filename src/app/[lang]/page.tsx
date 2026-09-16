import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Logo } from "@/components/ui/logo";
import { categories, dictionaries, isLanguage, languages } from "@/lib/i18n";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLanguage(lang)) return {};
  return { title: `${dictionaries[lang].menuName} | Em Sherif Café Erbil` };
}

export default async function CategoryPickerPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();

  const dictionary = dictionaries[lang];

  return (
    <main
      dir={dictionary.dir}
      lang={dictionary.locale}
      className="flex min-h-dvh flex-col items-center px-6 pt-14 pb-12 text-center"
    >
      <Logo priority />

      <p className="eyebrow mt-14">{dictionary.menuName}</p>
      <h1 className="font-display mt-3 text-4xl">{dictionary.chooseSection}</h1>
      <p className="mt-3 text-sm">{dictionary.chooseSectionHint}</p>

      <nav aria-label={dictionary.sections} className="mt-8 grid w-full max-w-sm gap-2.5">
        {categories.map((category) => (
          <Link
            key={category}
            href={`/${lang}/${category}`}
            className="border-ink/30 hover:bg-ink hover:text-paper flex min-h-14 items-center justify-center border px-3 text-sm font-semibold tracking-[0.1em] uppercase transition-colors"
          >
            {dictionary.categoryLabels[category]}
          </Link>
        ))}
      </nav>

      <Link href="/" className="mt-7 text-sm underline underline-offset-4">
        {dictionary.changeLanguage}
      </Link>
    </main>
  );
}
