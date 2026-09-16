import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MenuSections } from "@/components/menu-sections";
import { SectionImage } from "@/components/section-image";
import { Logo } from "@/components/ui/logo";
import { categories, dictionaries, isCategory, isLanguage, languages } from "@/lib/i18n";
import { getCategoryContent, getSectionImage, pdfPath } from "@/lib/menu";

export function generateStaticParams() {
  return languages.flatMap((lang) => categories.map((category) => ({ lang, category })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/[category]">): Promise<Metadata> {
  const { lang, category } = await params;
  if (!isLanguage(lang) || !isCategory(category)) return {};
  const dictionary = dictionaries[lang];
  return { title: `${dictionary.categoryLabels[category]} | Em Sherif Café Erbil` };
}

export default async function MenuPage({ params }: PageProps<"/[lang]/[category]">) {
  const { lang, category } = await params;
  if (!isLanguage(lang) || !isCategory(category)) notFound();

  const dictionary = dictionaries[lang];
  const content = getCategoryContent(lang, category);
  const label = dictionary.categoryLabels[category];

  return (
    <div dir={dictionary.dir} lang={dictionary.locale} className="min-h-dvh">
      <header className="bg-paper border-ink/15 sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-4 py-2">
        <Link href={`/${lang}`} aria-label={dictionary.sections} className="shrink-0">
          <Logo width={84} />
        </Link>

        <nav aria-label={dictionary.sections} className="flex justify-end gap-1.5">
          {categories.map((item) => {
            const isCurrent = item === category;
            return (
              <Link
                key={item}
                href={`/${lang}/${item}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`border-ink/25 flex min-h-9 items-center border px-2.5 text-[11px] font-semibold tracking-[0.06em] uppercase transition-colors sm:px-3 ${
                  isCurrent ? "bg-ink text-paper" : "hover:bg-ink/5"
                }`}
              >
                {dictionary.categoryLabels[item]}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-5 pt-8 pb-12">
        <SectionImage src={getSectionImage(category)} alt={label} />
        <h1 className="font-display mt-10 mb-12 text-center text-4xl">{label}</h1>
        <MenuSections sections={content.sections} />
      </main>

      <footer className="flex flex-col items-center gap-6 px-6 pb-14 text-center">
        {/* The printed menu closes on the wordmark; so does each language here. */}
        <Logo width={150} />
        <div className="flex flex-col items-center gap-3">
          <a
            href={pdfPath(lang)}
            target="_blank"
            rel="noopener"
            className="text-sm underline underline-offset-4"
          >
            {dictionary.fullMenuPdf}
          </a>
          <Link href="/" className="text-sm underline underline-offset-4">
            {dictionary.changeLanguage}
          </Link>
        </div>
      </footer>
    </div>
  );
}
