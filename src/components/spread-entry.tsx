"use client";

import { fill, openSpread, useCount } from "@/lib/spread";
import { useHydrated } from "@/components/use-hydrated";
import type { Dictionary } from "@/lib/i18n";

/**
 * The way in, in the empty half of the header's top row.
 *
 * It is **there at zero**, outlined and label-only. That is how the feature is
 * found: hiding it until something is picked would make it invisible to anyone
 * who never notices a ⊕ on a card, and pressing it at zero opens the empty
 * state, which explains what the feature is for.
 *
 * Once something is on it, it fills ivory and carries a count — the sum of the
 * quantities, not the number of lines, because a guest counting what is on the
 * table counts dishes.
 *
 * It borrows the language switch's hairline and radius rather than inventing a
 * second chrome treatment, and `.eyebrow` gives it the tracking reset and size
 * bump that Arabic and Kurdish already get everywhere else.
 */
export function SpreadEntry({ dictionary }: { dictionary: Dictionary }) {
  const hydrated = useHydrated();
  const count = useCount();
  if (!hydrated) return null;

  const on = count > 0;
  const label = on
    ? fill(dictionary.spread.openCount, { n: count })
    : dictionary.spread.open;

  return (
    <button
      type="button"
      onClick={openSpread}
      aria-label={label}
      data-on={on ? "true" : "false"}
      className="spread-entry eyebrow border-paper/22 relative rounded-full border"
    >
      <span aria-hidden="true">{dictionary.spread.name}</span>
      {on ? (
        <>
          <span aria-hidden="true" className="spread-entry-rule" />
          <span aria-hidden="true" className="spread-entry-count">
            {count}
          </span>
        </>
      ) : null}
    </button>
  );
}
