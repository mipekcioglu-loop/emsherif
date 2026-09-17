import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LanguageLanding } from "@/components/language-landing";
import { dictionaries, isLanguage, languages } from "@/lib/i18n";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLanguage(lang)) return {};
  return {
    title: `${dictionaries[lang].menuName} | Em Sherif Café Erbil`,
    robots: { index: false, follow: true },
  };
}

/* "/en" is not a page of its own — it opens the first category. */
export default async function LanguagePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();

  return <LanguageLanding language={lang} />;
}
