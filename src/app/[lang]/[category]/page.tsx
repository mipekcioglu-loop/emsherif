import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackToTop } from "@/components/back-to-top";
import { MenuBrowser } from "@/components/menu-browser";
import { MenuHero } from "@/components/menu-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SpreadSheet } from "@/components/spread-sheet";
import { categories, dictionaries, isCategory, isLanguage, languages } from "@/lib/i18n";
import { getCategoryView, getSpreadDishes } from "@/lib/menu";

export function generateStaticParams() {
  return languages.flatMap((lang) => categories.map((category) => ({ lang, category })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/[category]">): Promise<Metadata> {
  const { lang, category } = await params;
  if (!isLanguage(lang) || !isCategory(category)) return {};
  const dictionary = dictionaries[lang];
  return {
    title: `${dictionary.categoryLabels[category]} | Em Sherif Café Erbil`,
    alternates: {
      canonical: `/${lang}/${category}`,
      languages: Object.fromEntries(
        languages.map((code) => [dictionaries[code].locale, `/${code}/${category}`]),
      ),
    },
  };
}

export default async function MenuPage({ params }: PageProps<"/[lang]/[category]">) {
  const { lang, category } = await params;
  if (!isLanguage(lang) || !isCategory(category)) notFound();

  const dictionary = dictionaries[lang];
  const sections = getCategoryView(lang, category);

  return (
    /*
     * Direction is set here rather than on <html>: "/" and the language
     * landings share one root layout, which cannot know the language. Arabic
     * and Kurdish are a right-to-left *layout*, not a mirrored English one —
     * the pills scroll from the right, the price lockup flips, the back-to-top
     * button moves to the bottom left, and letterspacing drops out where it
     * would break Arabic letter-joining.
     */
    <div
      id="top"
      dir={dictionary.dir}
      lang={dictionary.locale}
      className="flex min-h-dvh flex-col"
    >
      <SiteHeader language={lang} category={category} />
      <MenuHero language={lang} />

      <MenuBrowser
        language={lang}
        categoryLabel={dictionary.categoryLabels[category]}
        otherCategories={categories
          .filter((item) => item !== category)
          .map((item) => ({ category: item, label: dictionary.categoryLabels[item] }))}
        sections={sections}
        currency={dictionary.currency}
        dictionary={dictionary}
        strings={{
          all: dictionary.allFilter,
          sections: dictionary.sections,
          noResults: dictionary.searchNoResults,
          loadingMore: dictionary.loadingMore,
        }}
      />

      <SiteFooter language={lang} />
      <BackToTop label={dictionary.backToTop} />

      {/* Mounted once. The header entry and the sticky-rail count both ask it
          to open; the dishes are this language's own, in printed order, so the
          sheet only ever filters and never sorts. */}
      <SpreadSheet
        dishes={getSpreadDishes(lang)}
        dictionary={dictionary}
        currency={dictionary.currency}
      />
    </div>
  );
}
