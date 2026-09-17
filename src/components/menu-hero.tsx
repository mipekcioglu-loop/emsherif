import { SearchField } from "@/components/search-field";
import { VenueSheet } from "@/components/venue-sheet";
import { VenueInfo } from "@/components/venue-info";
import type { Language } from "@/lib/i18n";
import { dictionaries } from "@/lib/i18n";

/** Where the footer copy of the venue block lives, for the no-JavaScript jump. */
export const VENUE_ANCHOR = "venue-info";

/**
 * The opening of the page: the passage the printed menu opens with, and a
 * utility column holding search, the ⓘ that opens the venue sheet, and the
 * allergy statement.
 *
 * The allergy statement sits here, above the first dish, where a guest who is
 * looking for it will look — and it takes the slot the old "all prices in
 * Iraqi dinar" note used to occupy, which the currency on every card made
 * redundant.
 */
export function MenuHero({ language }: { language: Language }) {
  const dictionary = dictionaries[language];

  return (
    <section className="mx-auto flex w-full max-w-[1040px] flex-col gap-4.5 px-4.5 pt-5.5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-12 sm:px-8 sm:pt-8.5 sm:pb-7">
      <div>
        <p className="eyebrow text-ink/72">{dictionary.city}</p>
        {dictionary.intro ? (
          <p className="font-display text-ink/88 rtl:font-naskh mt-2.5 max-w-[600px] text-[20px] leading-[1.48] font-normal tracking-[0.002em] sm:text-2xl sm:leading-[1.46]">
            {dictionary.intro.join(" ")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-start sm:shrink-0">
        <SearchField
          label={dictionary.search}
          clearLabel={dictionary.searchClear}
          controls="menu"
        />

        <VenueSheet
          label={dictionary.venueLink}
          closeLabel={dictionary.close}
          targetId={VENUE_ANCHOR}
        >
          <VenueInfo language={language} />
        </VenueSheet>

        {/* 72% is the floor every piece of running fine print on the paper
            sits at — 4.85:1 in Chromium, clear of 4.5:1 with enough room that
            a nudge to the ink or paper token cannot silently drop it under.
            Size and measure keep this subordinate to the passage above, which
            is 88% at 20px; the label stays a step ahead of its own body. */}
        <p className="text-ink/72 body-rtl mt-4 max-w-[290px] text-start text-[10.5px] leading-[1.66]">
          <b className="text-ink/78 font-semibold">{dictionary.allergyLabel}</b>{" "}
          {dictionary.allergyBody}
        </p>
      </div>
    </section>
  );
}
