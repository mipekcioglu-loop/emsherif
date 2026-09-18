"use client";

import { add, fill, remove, useQuantity } from "@/lib/spread";
import { useHydrated } from "@/components/use-hydrated";
import type { Dictionary } from "@/lib/i18n";
import type { DishKey } from "@/lib/menu";

/**
 * The control at the end of a card's price row: a ring that becomes a stepper.
 *
 * Off the spread it is a 32px ring with a plus. Pressing it fills navy and the
 * minus and the quantity grow out of it towards the price. They are always in
 * the DOM — off the spread they collapse to zero inline-size — and **the plus
 * is the group's logical last child in an end-aligned group**, so it does not
 * move by a pixel between the two states. That is the whole point: a finger
 * resting where the plus was is always "one more", never "remove".
 *
 * Growing the group from its start edge instead would swap the plus and minus
 * sides in one writing direction.
 *
 * With no JavaScript this renders nothing at all, so a guest without it sees
 * exactly today's card.
 */
export function SpreadControl({
  dishKey,
  name,
  dictionary,
}: {
  dishKey: DishKey;
  name: string;
  dictionary: Dictionary;
}) {
  const hydrated = useHydrated();
  const quantity = useQuantity(dishKey);
  if (!hydrated) return null;

  const on = quantity > 0;
  const copy = dictionary.spread;

  return (
    <div className="spread-control" data-on={on ? "true" : "false"}>
      {/* Always present so the group's width is the only thing that animates.
          Hidden from assistive technology and from the tab order while it is
          collapsed, because it is not a target then. */}
      <button
        type="button"
        className="spread-cap spread-minus"
        aria-label={fill(quantity === 1 ? copy.remove : copy.fewer, { dish: name })}
        tabIndex={on ? undefined : -1}
        aria-hidden={on ? undefined : true}
        onClick={() => remove(dishKey)}
      >
        <svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true">
          <path
            d="M2.2 7h9.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <span className="spread-quantity" aria-hidden={on ? undefined : true}>
        {on ? quantity : ""}
      </span>

      <button
        type="button"
        className="spread-cap spread-plus"
        aria-label={fill(on ? copy.more : copy.add, { dish: name })}
        onClick={() => add(dishKey)}
      >
        <svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true">
          <path
            d="M7 2.2v9.6M2.2 7h9.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Politely announced, so a screen-reader guest hears the new quantity
          rather than only the button's label. */}
      <span role="status" aria-live="polite" className="sr-only">
        {on
          ? fill(copy.announce, { dish: name, n: quantity })
          : fill(copy.announceGone, { dish: name })}
      </span>
    </div>
  );
}
