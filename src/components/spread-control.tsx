"use client";

import { useEffect, useRef, useState } from "react";

import { MAX_QUANTITY, add, fill, remove, useQuantity } from "@/lib/spread";
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
  /*
   * The live region starts EMPTY and stays empty until this guest changes this
   * dish. Rendering the "taken off the table" sentence up front put a false
   * statement under all 128 cards in the accessibility tree — and because the
   * grid inserts twelve cards at a time as the guest scrolls, some screen
   * readers would read those fresh regions out, announcing removals for dishes
   * nobody had touched.
   */
  const [announcement, setAnnouncement] = useState("");
  const previous = useRef(quantity);
  useEffect(() => {
    if (previous.current === quantity) return;
    previous.current = quantity;
    setAnnouncement(
      quantity > 0
        ? fill(dictionary.spread.announce, { dish: name, n: quantity })
        : fill(dictionary.spread.announceGone, { dish: name }),
    );
  }, [quantity, name, dictionary]);

  if (!hydrated) return null;

  const on = quantity > 0;
  const copy = dictionary.spread;
  const full = quantity >= MAX_QUANTITY;

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
        /* At the cap the button is not "one more" — it cannot do anything, and
           a press that changes nothing and re-announces nothing is
           indistinguishable from a dead control. */
        aria-label={fill(on ? copy.more : copy.add, { dish: name })}
        disabled={full}
        aria-disabled={full || undefined}
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
          rather than only the button's label. Empty until this guest changes
          this dish. */}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
