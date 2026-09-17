import { formatPrice } from "@/lib/i18n";
import type { DishView } from "@/lib/menu";
import { Wordmark } from "@/components/wordmark";

/** The photo well's width in the three-column grid, and the two before it. */
const SIZES =
  "(min-width: 1024px) 310px, (min-width: 640px) calc((100vw - 86px) / 2), calc(100vw - 36px)";

/**
 * One dish: photograph, name, description, and a hairline above the price.
 *
 * The printed menu carries no dietary icons, calorie counts or ratings, so the
 * card has none — nothing here is invented to fill the shape. Nothing truncates
 * either: the copy is approved and frozen, so a long description grows the card
 * and stretches its row rather than being clipped.
 */
export function DishCard({
  dish,
  currency,
  showSection = false,
  priority = false,
}: {
  dish: DishView;
  currency: string;
  /** The sub-category kicker, shown only where the card is out of context. */
  showSection?: boolean;
  /** Skip lazy-loading — for the handful of cards above the fold. */
  priority?: boolean;
}) {
  return (
    <article className="bg-paper border-ink/15 hover:border-ink/28 flex flex-col overflow-hidden rounded-[5px] border transition-[box-shadow,border-color,transform] duration-[250ms] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-16px_color-mix(in_srgb,var(--color-ink)_34%,transparent)]">
      {/* Shorter crop on a phone: two whole cards land in view instead of one
          and a half, which is a long scroll through 128 dishes. */}
      <div className="border-ink/8 bg-shot aspect-[3/2] border-b lg:aspect-[4/3]">
        {dish.photo ? (
          /* Not next/image: these are already cropped, white-balanced and
             emitted at the two widths the grid asks for, by
             scripts/dish-photos.mjs. Handing them back to the optimiser would
             re-encode work that is already done, and in the static export
             next/image does not prefix basePath onto a src, which is what put
             the wordmark on `unoptimized` too. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dish.photo.src}
            srcSet={dish.photo.srcSet}
            sizes={SIZES}
            width={dish.photo.width}
            height={dish.photo.height}
            /* The dish's name is right below the photograph; repeating it here
               would only make a screen reader say it twice. */
            alt=""
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          /* 29 dishes were never photographed. An empty card must not look
             broken: the well keeps its slot and becomes the wordmark, debossed
             at 17% on an ivory-to-navy wash — quiet on purpose, so a dish
             without a photograph never outshouts one with. */
          <div className="from-ink/4 to-ink/9 text-ink flex h-full w-full items-center justify-center bg-linear-[168deg]">
            <Wordmark width="54%" className="opacity-[0.17]" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4.5 pt-4 pb-3.5">
        {showSection ? (
          <p className="eyebrow text-ink/72 mb-1.5">{dish.section}</p>
        ) : null}

        <h3 className={`dish-name ${dish.description ? "" : "mb-4"}`}>{dish.name}</h3>

        {dish.description ? (
          <p className="dish-description text-ink/72 mt-2 mb-4.5 max-w-[34ch]">
            {dish.description}
          </p>
        ) : null}

        {/* Amount then currency, adjacent, as one object — reversed by
            direction in Arabic and Kurdish, never by a bidi override. */}
        <p className="border-ink/8 mt-auto flex items-baseline justify-start gap-[5px] border-t pt-3.5 leading-[normal]">
          <span className="price-amount">{formatPrice(dish.price)}</span>
          <span className="price-currency text-ink/72">{currency}</span>
        </p>
      </div>
    </article>
  );
}
