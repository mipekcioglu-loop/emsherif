import type { Language } from "@/lib/i18n";
import { dictionaries, venueFields } from "@/lib/i18n";

/**
 * Address, opening hours, telephone and wi-fi.
 *
 * The slot is approved; the content is not — the café has not supplied any of
 * it yet. Rather than ship four empty lines or invent an address, each field
 * carries a marked placeholder, so what is missing is obvious to the client and
 * unmistakable in review. The wording lives in `dictionaries[...].venue*`.
 *
 * Shown in two places: in the footer, where it is linkable without JavaScript,
 * and in the sheet the ⓘ in the hero opens.
 */
export function VenueInfo({ language, id }: { language: Language; id?: string }) {
  const dictionary = dictionaries[language];

  return (
    <div
      id={id}
      className="border-paper/14 mx-auto max-w-[880px] border-y px-0 py-5 sm:py-5.5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2.5">
        <h2 className="font-display text-paper/70 rtl:font-naskh text-[17px] font-medium sm:text-[19px]">
          {dictionary.venueHeading}
        </h2>
        <span className="eyebrow border-paper/22 text-paper/45 rounded-[3px] border border-dashed px-1.5 py-[3px] text-[8.5px] tracking-[0.16em] whitespace-nowrap">
          {dictionary.venuePending}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-3.5 gap-y-4 text-start sm:grid-cols-4 sm:gap-x-6 sm:gap-y-0">
        {venueFields.map((field) => (
          <div key={field} className="flex flex-col">
            <dt className="eyebrow text-paper/45 mb-1.5 text-[9.5px] tracking-[0.16em]">
              {dictionary.venueLabels[field]}
            </dt>
            <dd className="border-paper/22 text-paper/45 body-rtl flex-1 rounded-[3px] border border-dashed px-2.5 py-2.5 text-[11px] leading-[1.55] italic rtl:not-italic">
              {dictionary.venuePlaceholders[field]}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
