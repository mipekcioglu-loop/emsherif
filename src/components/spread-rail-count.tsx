"use client";

import { fill, openSpread, useCount } from "@/lib/spread";
import { useHydrated } from "@/components/use-hydrated";
import type { Dictionary } from "@/lib/i18n";

/**
 * The count at the end of the sticky filter rail.
 *
 * The header is not sticky — only the rail follows — so once a guest is a
 * screen or two into 128 dishes the entry has gone with it. This brings the
 * count back and opens the same sheet.
 *
 * It does not exist at zero. At zero there is nothing to count, the rail is
 * already full of filters, and the guest still has the header's own entry when
 * they scroll back up.
 */
export function SpreadRailCount({ dictionary }: { dictionary: Dictionary }) {
  const hydrated = useHydrated();
  const count = useCount();
  if (!hydrated || count === 0) return null;

  return (
    <button
      type="button"
      onClick={openSpread}
      aria-label={fill(dictionary.spread.openCount, { n: count })}
      className="spread-rail-count"
    >
      <span aria-hidden="true">{count}</span>
    </button>
  );
}
