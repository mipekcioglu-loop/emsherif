import { formatPrice } from "@/lib/i18n";
import type { MenuSection } from "@/lib/menu";

/**
 * One block per printed section, each item a row of name, description and
 * price. Where a category holds a single section its heading is dropped — the
 * page title already carries the same word.
 */
export function MenuSections({ sections }: { sections: MenuSection[] }) {
  const showTitles = sections.length > 1;

  return (
    <div className={showTitles ? "space-y-16" : ""}>
      {sections.map((section) => (
        <section key={section.title}>
          {showTitles ? (
            <h2 className="font-display border-ink/15 border-b pb-3 text-center text-3xl">
              {section.title}
            </h2>
          ) : null}

          <ul className={showTitles ? "mt-8 space-y-6" : "space-y-6"}>
            {section.items.map((item, index) => (
              <li
                key={`${item.name}-${index}`}
                className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1"
              >
                <h3 className="text-sm font-semibold tracking-[0.06em] uppercase">
                  {item.name}
                </h3>
                <p className="text-sm tabular-nums">{formatPrice(item.price)}</p>
                {item.description ? (
                  <p className="text-ink/75 col-span-2 text-sm leading-relaxed">
                    {item.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
